import PlayerInterface from './playerInterface';
import MediaMap from './mapping/media-map';
import SegmentView from './mapping/segment-view';
import p2pLoaderFactory from './p2p-loader-factory';
import { formatContentId } from './utils.js';

class StreamrootWrapper {

  constructor (SRModule) {
    this.SRModule = SRModule;
  }

  createSRModule (p2pConfig, hls, HlsEvents, contentId) {
    var playerInterface = new PlayerInterface(hls, HlsEvents, p2pConfig, this.onDispose.bind(this));
    var mediaMap = new MediaMap(hls);
    let content = formatContentId({ contentUrl: hls.url, contentId });
    this.srModule = new this.SRModule(playerInterface, content, mediaMap, p2pConfig, SegmentView);
  }

  get P2PLoader () {
    return p2pLoaderFactory(this);
  }

  onDispose () {
    this.srModule.dispose();
  }

  get stats () {
    if (window.SR_DISPLAY_INTERFACE && window.SR_DISPLAY_INTERFACE.getStats) {
      let stats = window.SR_DISPLAY_INTERFACE.getStats();
      return {
        p2p: stats.download.p2pDownloadedNewAnalytics,
        cdn: stats.download.cdnDownloaded,
        peerCount: stats.peers.count
      };
    } else {
      return {};
    }
  }
}



export default StreamrootWrapper;
