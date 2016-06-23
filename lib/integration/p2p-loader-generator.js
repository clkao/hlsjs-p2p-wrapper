import SegmentView from './mapping/segment-view';
import TrackView from './mapping/track-view';

/**
 * Generates a P2PLoader class definition that will use the Streamroot Hls.js wrapper instance passed
 * @static
 * @function
 * @return {class} P2PLoader class definiton
 */
const P2PLoaderGenerator = function (hlsjsWrapper) {

    /**
     * P2PLoader class definition. Implements Hls.js Loader interface.
     * @class
     *
     */
    return class P2PLoader {

        constructor(config) {
            if (config) {
                // IMPORTANT: these are custom config parameters that are not present in the original hls.js configuration
                this.xhrSetup = config.xhrSetup;
                this.withCredentials = !!(config.request && config.request.withCredentials);
                this.headers = config.request && config.request.headers ? config.request.headers : {};

                // FIXME
                if (this.xhrSetup) {
                    throw new Error("xhrSetup setup is not usable with Streamroot version. Please contact Streamroot support");
                }
            }
        }

        destroy() {
            this.abort();
        }

        abort() {
            if (this.loader) {
                this.stats.aborted = true;
                this.loader.abort();
            }
            this.reset();
        }

        reset() {
            window.clearTimeout(this.timeoutHandle);
            this.loader = null;
        }

        load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress = null, frag = null) {
            if (!frag) {
                throw new Error('P2P loader can only be used for media fragments (pass only as `fLoader` in config)');
            }

            if (!hlsjsWrapper.peerAgentModule) {
                console.error('Peer agent is not existing yet');
                // Should not happen. Means we loaded a frag before the manifest, of there's a problem in the dispose sequence.
                throw new Error('Peer agent is not existing yet');
            }

            if (!isNaN(frag.byteRangeStartOffset) && !isNaN(frag.byteRangeEndOffset)) {
                this.byteRange = frag.byteRangeStartOffset + '-' + frag.byteRangeEndOffset;
            }

            this.frag = frag;
            this.url = url;
            this.responseType = responseType;
            this.onSuccess = onSuccess;
            this.onProgress = onProgress || (function() {});
            this.onTimeout = onTimeout;
            this.onError = onError;
            this.stats = { trequest: performance.now(), retry: 0 };
            this.timeout = timeout;
            this.maxRetry = maxRetry;
            this.retryDelay = retryDelay;

            this.loadInternal();
        }

        loadSuccess(segmentData) {
            // we might get called while aborted
            // ignore these cases
            if (this.stats.aborted) {
                return;
            }

            let event = {
                currentTarget: {
                    response: segmentData
                }
            };

            this.stats.tload = performance.now();
            this.onSuccess(event, this.stats);
            this.reset();
        }

        loadError (xhrEvent) {
            // we might get called while aborted
            // ignore these cases
            if (this.stats.aborted) {
                return;
            }

            let status = xhrEvent.target.status;

            if (this.stats.retry < this.maxRetry) {
                console.warn(`${status} while loading ${this.url}, retrying in ${this.retryDelay}...`);
                window.setTimeout(this.loadInternal.bind(this), this.retryDelay);
                // exponential backoff
                this.retryDelay = Math.min(2 * this.retryDelay, 64000);
                this.stats.retry++;
            } else {
                console.error(`${status} while loading ${this.url}` );
                this.onError(xhrEvent);
            }
            this.reset();
        }

        loadInternal() {

            if (!this.loader) {
                throw new Error('P2P loader was not reset correctly, internal state indicates unfinalized request');
            }

            if (this.byteRange) {
                this.headers.Range = `bytes=${this.frag.byteRangeStartOffset}-${this.frag.byteRangeEndOffset - 1}`;
            }

            let trackView = new TrackView({level: this.frag.level});
            let segmentView = new SegmentView({sn: this.frag.sn, trackView, time: this.frag.start});

            let reqInfo = {
                url: this.url,
                headers: this.headers,
                withCredentials: this.withCredentials
            };

            let callbacks = {
                onSuccess: this.loadSuccess.bind(this),
                onError: this.loadError.bind(this),
                onProgress: this.loadProgress.bind(this)
            };

            this.stats.tfirst = null;
            this.stats.loaded = 0;
            this.timeoutHandle = window.setTimeout(this.loadTimeout.bind(this), this.timeout);
            this.loader = hlsjsWrapper.peerAgentModule.getSegment(reqInfo, callbacks, segmentView);
        }

        loadProgress(event) {

            let loaded = 0;

            if (event.cdnDownloaded) {
                loaded += event.cdnDownloaded;
            }

            if (event.p2pDownloaded) {
                loaded += event.p2pDownloaded;
            }

            this.stats.loaded = loaded;

            if (this.stats.tfirst === null) {
                let now = performance.now();

                // If we did p2p download, this handler will be called immediately. We need to offset trequest to avoid computing a very high bandwidth in abr-controller
                // If we didn't do p2p download, this handler will be called with the right timing so we don't need to offset anything.
                // If this is not the first progress event (i.e. tfirst !== null), we probably don't need to do any adjustment:
                // we offseted trequest with the 1st progress event to represent the P2P bandwidth,
                // and subsequent progress event should correctly account for CDN download (and P2P will not trigger other progress event than the 1st)
                if ((event.p2pDuration + event.cdnDuration > 0) && event.p2pDownloaded > 0) {
                    let srTime = event.p2pDuration + event.cdnDuration;

                    // we set trequest delayed by srTime
                    this.stats.trequest = now - srTime;
                    // we set tifrst equal to trequest and add 10ms (arbitrary fake RTT), limited by half of srTime
                    // FIXME: we are introducing an error of 10ms in the bandwidth calculation based on tload - tfirst here.
                    //        we could instead use real rtt information from p2p module via srStats object
                    this.stats.tfirst = this.stats.trequest + Math.min(Math.round(srTime / 2), 10);
                } else {
                    this.stats.tfirst = now;
                }
            }

            this.onProgress(event, this.stats);
        }

        loadTimeout(event) {
            this.onTimeout(event, this.stats);
        }
    };

};

export default P2PLoaderGenerator;
