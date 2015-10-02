import XhrLoader from '../src/utils/xhr-loader.js';

class P2PLoader extends XhrLoader {
  /*
  NOTES: 
    - Range requests can be implemented using xhr-setup.
    - Need to fix stats object
  */

  /* 
NOTES for Mangui:
  - need to pass 'hls' in the constructor
  - if segment is locked, we call onTimeout. Is there a particular logic in this function that we should be aware of (downswitch for example)?
*/

  load(url, responseType, onSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress = null, frag = null) {
    if (frag) {
      this.p2pSegment = this.hls.SRModule.getP2PData(Object.assign({},frag));

      if (p2pSegment.isLocked()) {
        setTimeout(onTimeout, 100);
      }  else if (p2pSegment.isComplete()) {
        p2pSegment.getFullSegment({}, this.p2pLoadSuccess.bind(this), this.loaderror.bind(this));
        // hmm what is the form of the callbacks??
      } else {
        this.range = p2pSegment.getUpdatedRange();
      }
    }
    
    this.onSuccessCallback = onSuccess;

    super.load(url, responseType, cdnLoadSuccess, onError, onTimeout, timeout, maxRetry, retryDelay, onProgress = null)
  }
  
  cdnLoadSuccess(event, stats) {
    var response = event.currentTarget.response;
    //stats.length = payload.byteLength; // TODO: fix stats
    this.p2pSegment.getFullSegment({response: response, dlSpeed: 0}, this.p2pLoadSuccess.bind(this), this.onError.bind(this));
  }
  
  p2pLoadSuccess(event, segment) {
    event.currentTarget = { response: event.response.slice(0) };

    var stats = {}; // TODO: fix stats
    this.onSuccessCallback(event, stats);
  }
  
  
}

export default P2PLoader;