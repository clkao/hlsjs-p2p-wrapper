import SegmentCoord from './mapping/segment-coord';
import TrackCoord from './mapping/track-coord';

//We wrap P2PLoader class definition in a factory function so we can give it knowledge of the instance of srModule without modifying hls.js code.
var p2pLoaderFactory = function (streamrootWrapper, XhrLoader) {

  return class P2PLoader extends XhrLoader {

    load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress = null, frag = null) {
      if (frag) {
        if (!streamrootWrapper.srModule) {
          // Should not happen. Means we loaded a frag before the manifest, of there's a problem in the dispose sequence.
          throw new Error('Streamroot module is not defined');
        }


        this.frag = frag;

        super.load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress);
      } else {
        super.load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress);
      }
    }

    loadSuccess(segmentData, stats) {
      var event = {
        currentTarget: {
          response: segmentData
        }
      };

      window.clearTimeout(this.timeoutHandle);
      this.stats.tload = performance.now(); //TODO: use stats feedback from our module
      this.onSuccess(event, this.stats); //TODO: what does hls.js expect in event
    }

    loadError(xhrEvent){ //TODO: check that we always have a xhr error event here
      var status = xhrEvent.target.status;
      if (this.stats.retry < this.maxRetry) {
        console.warn(`${status} while loading ${this.url}, retrying in ${this.retryDelay}...`); //TODO: use hls.js logger?
        this.destroy();
        window.setTimeout(this.loadInternal.bind(this), this.retryDelay);
        // exponential backoff
        this.retryDelay = Math.min(2 * this.retryDelay, 64000);
        this.stats.retry++;
      } else {
        window.clearTimeout(this.timeoutHandle);
        console.error(`${status} while loading ${this.url}` ); //TODO: use hls.js logger?
        this.onError(xhrEvent); //TODO: what does hls.js expect in event
      }
    }


    loadInternal() {
      //var withCredentials = (request.url.indexOf("catchup") != -1); //TODO: how can we implement this? For now it seems that it can only be set using xhrSetup (which we break)
      var headers = [];
      if (this.byteRange) {
        headers.push(["Range", {
          start: this.frag.byteRangeStartOffset, 
          end: this.frag.byteRangeEndOffset - 1
        }]);
      }

      //TODO: what do we do with this?
      this.stats.tfirst = null;
      this.stats.loaded = 0;

      if (this.xhrSetup) {
        throw new Error("xhrSetup setup is not usable with Streamroot version. Please contact Streamroot support");
      }

      var trackCoord = new TrackCoord({level: this.frag.level});
      var segmentCoord = new SegmentCoord({sn: this.frag.sn, trackCoord});

      this.abortCallback = streamrootWrapper.srModule.getSegment({url: this.url, headers: headers, withCredentials: withCredentials} , {onSuccess: this.loadSuccess.bind(this), onError: this.loadError.bind(this), onProgress: this.loadprogress.bind(this)}, segmentCoord);
    }

    /*
    fullP2PSuccess(event, segment) {
      //getFullSegment calls this callback synchronously in the case of full P2P. Need to make it asynchronous, so that buffer-controller can update its state
      //TODO: remove that once we've done it inside the P2P module
      this.stats.tfirst = performance.now();
      setTimeout(() => {
        this.stats.tload = performance.now();
        this.p2pLoadSuccess(event, segment);
      }, 100);
    }
    */

    loadprogress(event) {
      if (this.frag) {
        var loaded = 0;
        if (event.cdnDownloaded) {
          loaded += event.cdnDownloaded;
        }
        if (event.p2pDownloaded) {
          loaded += event.p2pDownloaded;
        }

        super.loadprogress({loaded});
      } else {
        super.loadprogress(event);
      }
    }
  }

}

export default p2pLoaderFactory;