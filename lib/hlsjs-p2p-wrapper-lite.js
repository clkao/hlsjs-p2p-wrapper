"use strict";

import HlsjsP2PWrapperLitePrivate from './hlsjs-p2p-wrapper-lite-private';
import StreamrootPeerAgentModule from 'streamroot-p2p';

class HlsjsP2PWrapper {

    constructor(hlsjsConstructor) {
        let wrapper = new HlsjsP2PWrapperLitePrivate(hlsjsConstructor, StreamrootPeerAgentModule);
        this.createPlayer = wrapper.createPlayer.bind(wrapper);
        this.createSRModule = wrapper.createSRModule.bind(wrapper);
        this.P2PLoader = wrapper.P2PLoader;
    }

}

export default HlsjsP2PWrapper;
