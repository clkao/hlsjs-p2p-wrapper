
import HlsjsWrapper from "../lib/streamroot-wrapper";
import XhrLoader from '../lib/xhr-loader';

function createWrappedHls(StreamrootDownloader, Hls, p2pConfig, hlsConfig = {}){
    var hlsjsWrapper = new HlsjsWrapper(XhrLoader, StreamrootDownloader);

    hlsConfig.loader = hlsjsWrapper.P2PLoader;
    hlsConfig.xhrSetup = hlsjsWrapper.setRange;

    //Set buffer configuration params, unless they're specified
    hlsConfig.maxBufferSize = hlsConfig.maxBufferSize || 0;
    hlsConfig.maxBufferLength = hlsConfig.maxBufferLength || 30;

    var hls = new Hls(hlsConfig);

    hls.on(Hls.Events.MANIFEST_LOADING, () => {
        hlsjsWrapper.createSRModule(p2pConfig, hls, Hls.Events);
    });

    return hls;
}

export default createWrappedHls;
