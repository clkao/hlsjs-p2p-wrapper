import PlayerInterface from './playerInterface';
import P2PLoaderFactory from './p2p-loader-factory';
import { hlsToSRMap, hlsToSRTrackCoordinate, hlsToSRSegmentCoordinate } from './mapper';
import SRModule from 'streamroot-p2p';

class StreamrootWrapper {

  constructor (XhrLoader) {
      this.XhrLoader = XhrLoader;
  }

  setRange (xhr) {
    // It is important to notice that this method will be called by the P2PLoader as this.xhrSetup.
    // Therefore 'this' refers here to P2PLoader
    if (this.range) {
      var start = this.range.start || 0;
      var end = this.range.end || '';
      var rangeString = 'bytes=' + start + '-' + end;
      xhr.setRequestHeader('Range', rangeString);      
    }
  }

  createSRModule (p2pConfig, hls, HlsEvents) {
    this.playerInterface = new PlayerInterface(hls, HlsEvents, this.onDispose.bind(this), this.onAttach.bind(this), this.onDetach.bind(this));
    this.srModule = new SRModule(this.playerInterface, hls.url, p2pConfig, hlsToSRMap, hlsToSRTrackCoordinate, hlsToSRSegmentCoordinate);
  }

  get P2PLoader () {
    return P2PLoaderFactory(this, this.XhrLoader);
  }

  onDispose () {
    this.srModule.dispose();
  }
  
  onAttach () {
    this.srModule.attach();
  }
  
  onDetach () {
    this.srModule.detach();
  }
}



export default StreamrootWrapper;