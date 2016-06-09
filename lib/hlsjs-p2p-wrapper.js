"use strict";

import HlsjsP2PWrapperPrivate from './hlsjs-p2p-wrapper-private';
import StreamrootPeerAgentModule from 'streamroot-p2p';

class HlsjsP2PWrapper {

    constructor(hlsjsConstructor) {
        let wrapper = new HlsjsP2PWrapperPrivate(hlsjsConstructor, StreamrootPeerAgentModule);
        this.createPlayer = wrapper.createPlayer.bind(wrapper);
        this.createSRModule = wrapper.createSRModule.bind(wrapper);
        this.P2PLoader = wrapper.P2PLoader;
    }

}

export default HlsjsP2PWrapper;
