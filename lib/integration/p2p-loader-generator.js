import SegmentView from './segment-view';
import TrackView from './track-view';
import XhrLoader from './xhr-loader';

/**
 * Generates a P2PLoader class definition that will use the Streamroot Hls.js wrapper instance passed
 * @static
 * @function
 * @return {class} P2PLoader class definiton
 */
const P2PLoaderGenerator = function (hlsjsWrapper) {

  /**
   * P2PLoader class definition. Implementes Hls.js Loader interface. Inherits from XhrLoader.
   * @class
   *
   */
  return class P2PLoader extends XhrLoader {

    constructor(config) {

      super();
      if (config) {
        // IMPORTANT: these are custom config parameters that are not present in the original hls.js configuration
        this.withCredentials = !!(config.request && config.request.withCredentials);
        this.headers = config.request && config.request.headers ? config.request.headers : [];
      }
    }

    abort() {
      if (this.frag) {
        var timeoutHandle = this.timeoutHandle;
        this.stats.aborted = true;
        if (this.abortCallback) {
          this.abortCallback();
        }
        if (timeoutHandle) {
          window.clearTimeout(timeoutHandle);
        }
      } else {
        super.abort();
      }
    }

    load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress = null, frag = null) {

      if (frag) {
        if (!hlsjsWrapper.peerAgentModule) {
          console.error('Peer agent is not existing yet');
          // Should not happen. Means we loaded a frag before the manifest, of there's a problem in the dispose sequence.
          throw new Error('Peer agent is not existing yet');
        }

        this.frag = frag;

        super.load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress);
      } else {
        super.load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress);
      }
    }

    loadSuccess(segmentData, srStats) {
      if (!this.stats.aborted) {

        window.clearTimeout(this.timeoutHandle); // Timeout already cleared in abort() if the above condition is this.stats.aborted === true

        var event = {
          currentTarget: {
            response: segmentData
          }
        };

        this.stats.tload = performance.now();

        this.onSuccess(event, this.stats);
      }
    }

    loadError (xhrEvent) {
      var status = xhrEvent.target.status;
      if (!this.stats.aborted) { // loadError WILL be called if the xhr was aborted. Don't exectue the following code: we DON'T want to retry downloading in this case
        if (this.stats.retry < this.maxRetry) {
          console.warn(`${status} while loading ${this.url}, retrying in ${this.retryDelay}...`);
          this.destroy();
          window.setTimeout(this.loadInternal.bind(this), this.retryDelay);
          // exponential backoff
          this.retryDelay = Math.min(2 * this.retryDelay, 64000);
          this.stats.retry++;
        } else {
          window.clearTimeout(this.timeoutHandle); // Timeout already cleared in abort() if the above condition is this.stats.aborted === true
          console.error(`${status} while loading ${this.url}` );
          this.onError(xhrEvent);
        }
      }
    }

    loadInternal() {
      if (this.frag) {
        var headers = this.headers;
        if (this.byteRange) {
          headers.push(["Range", {
            start: this.frag.byteRangeStartOffset,
            end: this.frag.byteRangeEndOffset - 1
          }]);
        }

        this.stats.tfirst = null;
        this.stats.loaded = 0;

        if (this.xhrSetup) {
          throw new Error("xhrSetup setup is not usable with Streamroot version. Please contact Streamroot support");
        }

        var trackView = new TrackView({level: this.frag.level});
        var segmentView = new SegmentView({sn: this.frag.sn, trackView, time: this.frag.start});

        this.abortCallback = hlsjsWrapper.peerAgentModule.getSegment({url: this.url, headers: headers, withCredentials: this.withCredentials} , {onSuccess: this.loadSuccess.bind(this), onError: this.loadError.bind(this), onProgress: this.loadprogress.bind(this)}, segmentView);
      } else {
        super.loadInternal();
      }
    }

    loadprogress(event) {
      if (this.frag) {

        var loaded = 0;
        if (event.cdnDownloaded) {
          loaded += event.cdnDownloaded;
        }
        if (event.p2pDownloaded) {
          loaded += event.p2pDownloaded;
        }
        this.stats.loaded = loaded;

        if (this.stats.tfirst === null) {
          var now = performance.now();

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

        if (this.onProgress) {
          this.onProgress(event, this.stats);
        }

      } else {
        super.loadprogress(event);
      }
    }
  };

};

export default P2PLoaderGenerator;
