import PlayerInterface from './playerInterface';
import P2PLoader from './p2p-loader';
import { hlsToSRMap, hlsToSRTrackCoordinate, hlsToSRSegmentCoordinate } from './mapper';

class StreamrootWrapper {
  
  static get createSRModule () {
    return function (hls, url, p2pConfig) {
      var playerInterface = new PlayerInterface(hls);
      var srModule = new window.Streamroot.SRModule(playerInterface, url, p2pConfig, hlsToSRMap, hlsToSRTrackCoordinate, hlsToSRSegmentCoordinate);
      return srModule;
    }
  }
  
  static get P2PLoader () {
    return P2PLoader;
  }
  
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
}

export default StreamrootWrapper;