import PlayerInterface from './playerInterface';
import MediaMap from './mapping/media-map';
import SegmentCoord from './mapping/segment-coord';
import p2pLoaderFactory from './p2p-loader-factory';
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
    var playerInterface = new PlayerInterface(hls, HlsEvents, p2pConfig, this.onDispose.bind(this), this.onAttach.bind(this), this.onDetach.bind(this));
    var mediaMap = new MediaMap(hls);
    this.srModule = new SRModule(playerInterface, hls.url, mediaMap, hls.config.maxBufferLength, p2pConfig);
  }

  get P2PLoader () {
    return p2pLoaderFactory(this, this.XhrLoader);
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