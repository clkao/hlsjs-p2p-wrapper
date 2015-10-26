import XhrLoader from '../node_modules/hls.js/src/utils/xhr-loader.js'; //TODO: is other a cleaner way to access 'non-main' classes in hls.js dependency?
import objectAssign from 'object-assign';

//We wrap P2PLoader class definition in a factory function so we can give it knowledge of the instance of srModule without modifying hls.js code.
var p2pLoaderFactory = function (streamrootWrapper) {

  return class P2PLoader extends XhrLoader {

    load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress = null, frag = null) {
      if (frag) {
        if (!streamrootWrapper.srModule) {
          // Should not happen. Means we loaded a frag before the manifest, of there's a problem in the dispose sequence.
          throw new Error('Streamroot module is not defined');
        }


        this.frag = frag;

        this.p2pSegment = streamrootWrapper.srModule.getP2PData(objectAssign({},frag));
        this.onSuccessCallback = onSuccess;

        if (this.p2pSegment.isLocked()) {
          console.warn('segment locked. Retrying later');
          setTimeout(() => {
            this.load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress, frag);
          }, 100);

          // NOTE: started to implement something to send a progress event here, saying we downloaded half the data (data expected to arrive 100ms later), but I think this is an overkill. We should do that once we've internalized XHR in our module.

          return;

        }  else if (this.p2pSegment.isComplete()) {
          this.stats = {trequest: new Date(), retry: 0}; //Set stats here since in this case (full P2P) we won't call super.load
          this.p2pSegment.getFullSegment({}, this.fullP2PSuccess.bind(this), this.loaderror.bind(this));
          return;
        } else {
          this.range = this.p2pSegment.getUpdatedRange();
        }

        super.load(url, responseType, this.cdnLoadSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress);
      } else {
        super.load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress);
      }
    }

    cdnLoadSuccess(event, stats) {
      var response = event.currentTarget.response;
      this.p2pSegment.getFullSegment({response: response, dlSpeed: 0}, this.p2pLoadSuccess.bind(this), this.onError.bind(this));
    }

    p2pLoadSuccess(event, segment) {
      event.currentTarget = { response: event.response.slice(0) };

      var stats = this.stats;
      this.onSuccessCallback(event, stats);
    }

    fullP2PSuccess(event, segment) {
      //getFullSegment calls this callback synchronously in the case of full P2P. Need to make it asynchronous, so that buffer-controller can update its state
      //TODO: remove that once we've done it inside the P2P module
      this.stats.tfirst = new Date();
      setTimeout(() => {
        this.stats.tload = new Date();
        this.p2pLoadSuccess(event, segment);
      }, 100);
    }

    loadprogress(event) {
      if (this.range) {

        var fragLen = event.total || this.frag.expectedLen || 0;
        var p2pLoaded = 0;

        if (this.range.start) {
          p2pLoaded += this.range.start;
        }
        if (this.range.end && fragLen) {
          p2pLoaded += Math.max(0, fragLen - this.range.end); //I guess this won't work with HLS versions that use Range request already. (not supported yet by HLS.js)
        }

        var progressEvent = window.ProgressEvent ? new ProgressEvent('progress', {
          lengthComputable: event.lengthComputable, 
          loaded: event.loaded + p2pLoaded, 
          total: event.total + p2pLoaded
        }) : {
          lengthComputable: event.lengthComputable, 
          loaded: event.loaded + p2pLoaded, 
          total: event.total + p2pLoaded
        };
        super.loadprogress(progressEvent);
      } else {
        super.loadprogress(event);
      }
    }
  }

}

export default p2pLoaderFactory;