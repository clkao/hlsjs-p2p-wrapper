import PlayerInterface from './playerInterface';
import MediaMap from './mapping/media-map';
import SegmentView from './mapping/segment-view';
import p2pLoaderFactory from './p2p-loader-factory';

class StreamrootWrapper {

  constructor (SRModule) {
      this.SRModule = SRModule;
  }

  createSRModule (p2pConfig, hls, HlsEvents) {
    var playerInterface = new PlayerInterface(hls, HlsEvents, p2pConfig, this.onDispose.bind(this), this.onAttach.bind(this), this.onDetach.bind(this));
    var mediaMap = new MediaMap(hls);
    this.srModule = new this.SRModule(playerInterface, hls.url, mediaMap, p2pConfig, SegmentView);
  }

  get P2PLoader () {
    return p2pLoaderFactory(this);
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
