
import HlsjsWrapper from "../lib/streamroot-wrapper";
import XhrLoader from './originalXhrLoader';

function createWrappedHls(p2pConfig, hlsConfig = {}){
    if(!window.Hls){
        throw new Error("window.Hls is not defined");
    }
    var hlsjsWrapper = new HlsjsWrapper(XhrLoader);

    hlsConfig.loader = hlsjsWrapper.P2PLoader;
    hlsConfig.xhrSetup = hlsjsWrapper.setRange;

    //Set buffer configuration params, unless they're specified
    hlsConfig.maxBufferSize = hlsConfig.maxBufferSize || 0;
    hlsConfig.maxBufferLength = hlsConfig.maxBufferLength || 30;

    var hls = new window.Hls(hlsConfig);

    hls.on(window.Hls.Events.MANIFEST_LOADING, () => {
        hlsjsWrapper.createSRModule(p2pConfig, hls, window.Hls.Events);
    });

    return hls;
}

window.createWrappedHls = createWrappedHls;
