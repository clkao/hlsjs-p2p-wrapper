import PlayerInterface from './playerInterface';
import MediaMap from './mapping/media-map';
import SegmentView from './mapping/segment-view';
import p2pLoaderFactory from './p2p-loader-factory';
import { formatContentId } from './utils.js';

class StreamrootWrapper {

  constructor (SRModule) {
      this.SRModule = SRModule;
  }

  createSRModule (p2pConfig, hls, HlsEvents, content) {
    var playerInterface = new PlayerInterface(hls, HlsEvents, p2pConfig, this.onDispose.bind(this));
    var mediaMap = new MediaMap(hls);
    let contentId = formatContentId({ contentUrl: hls.url, content });
    this.srModule = new this.SRModule(playerInterface, contentId, mediaMap, p2pConfig, SegmentView);
  }

  get P2PLoader () {
    return p2pLoaderFactory(this);
  }

  onDispose () {
    this.srModule.dispose();
  }
}



export default StreamrootWrapper;
