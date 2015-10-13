import PlayerInterface from './playerInterface';
import P2PLoader from './p2p-loader';
import { hlsToSRMap, hlsToSRTrackCoordinate, hlsToSRSegmentCoordinate } from './mapper';

class StreamrootWrapper {
  
  static get setRange () {
    return function (xhr) {
      if (this.range) {
        var start = this.range.start || 0;
        var end = this.range.end || '';
        var rangeString = 'bytes=' + start + '-' + end;
        xhr.setRequestHeader('Range', rangeString);      
      }
    }
  }
  
  createSRModule (hls, url, p2pConfig) {
      this.playerInterface = new PlayerInterface(hls, this.onDispose.bind(this));
      this.srModule = new window.Streamroot.SRModule(this.playerInterface, url, p2pConfig, hlsToSRMap, hlsToSRTrackCoordinate, hlsToSRSegmentCoordinate);
  }
  
  get P2PLoader () {
    return P2PLoader(this);
  }
  
  onDispose () {
    this.srModule.dispose();
  }
}

export default StreamrootWrapper;