"use strict";

import HlsjsP2PWrapperPrivate from './hlsjs-p2p-wrapper-private';
import StreamrootPeerAgentModule from 'streamroot-p2p';

class HlsjsP2PWrapper {

    constructor(hlsjsConstructor) {
        let wrapper = new HlsjsP2PWrapperPrivate(hlsjsConstructor, StreamrootPeerAgentModule);
        this.createMediaEngine = wrapper.createMediaEngine.bind(wrapper);
        this.createSRModule = wrapper.createSRModule.bind(wrapper);
        this.P2PLoader = wrapper.P2PLoader;

        Object.defineProperty(this, "stats", {
            get() {
                return wrapper.peerAgentModule.stats;
            }
        });
    }
}

export default HlsjsP2PWrapper;
