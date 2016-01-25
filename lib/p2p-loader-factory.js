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

    loadSuccess(segmentData, srStats) {


      window.clearTimeout(this.timeoutHandle);

      this.adjustStats(srStats);

      var event = {
        currentTarget: {
          response: segmentData
        }
      };

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

      this.stats.tfirst = null;
      this.stats.loaded = 0;

      if (this.xhrSetup) {
        throw new Error("xhrSetup setup is not usable with Streamroot version. Please contact Streamroot support");
      }

      var trackCoord = new TrackCoord({level: this.frag.level});
      var segmentCoord = new SegmentCoord({sn: this.frag.sn, trackCoord});

      this.abortCallback = streamrootWrapper.srModule.getSegment({url: this.url, headers: headers, withCredentials: withCredentials} , {onSuccess: this.loadSuccess.bind(this), onError: this.loadError.bind(this), onProgress: this.loadprogress.bind(this)}, segmentCoord);
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
        
        // The loader interface can trigger a progress event synchronously. If this is the case (tfirst === trequest), we set tfirst = trequest + 1 arbitrarily to avoid having a bandwidth of NaN in abr-controller.
        // tfirst won't be overriden in parent method, because it is set only if it is null.
        if (this.stats.tfirst === null) {
          var now = performance.now();
          if (now <= this.stats.trequest) {
            now = this.stats.trequest + 1;
          }
          this.stats.tfirst = now;
        }

        super.loadprogress({loaded});
      } else {
        super.loadprogress(event);
      }
    }

    adjustStats(srStats) {
      // In this method, we readjust the 2 timestamps that are already set (trequest and tfirst), instead of setting tload with SR stats feedback.
      // The reason is that hls.js will enrich the stats object with other timing info later (tparsed and tbuffered), and that streamroot feedback will only create distortions if we just checnge tload
      
      // NOTE: this means that those 2 timestamps will be inconsistent with the ones from the progress events. In the current hls.js version, this isn't an issue because the progress event is only used 
      // to compute instant bandwidth (ie loaded / timeSpent). timeSpent will be the desired value, and the timestamps themselves won't be stored.
      // This is not good for maintainability though.
      
      var bandwidth;
      if(srStats.p2pDuration + srStats.cdnDuration > 0) {
        bandwidth = (srStats.p2pDownloaded + srStats.cdnDownloaded) / (srStats.p2pDuration + srStats.cdnDuration);
      }

      this.stats.tload = performance.now();

      var srTime = bandwidth ? (srStats.p2pDownloaded + srStats.cdnDownloaded) / bandwidth : (this.stats.tload - this.stats.tfirst);
      var latency = this.stats.tfirst - this.stats.trequest;

      this.stats.tfirst = this.stats.tload - srTime;
      this.stats.trequest = this.stats.tfirst - latency;
    }
  };

};

export default p2pLoaderFactory;