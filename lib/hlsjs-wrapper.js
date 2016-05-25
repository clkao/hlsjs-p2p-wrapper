"use strict"

import HlsjsWrapperPrivate from './hlsjs-wrapper-private'
import StreamrootPeerAgentModule from 'streamroot-p2p-dist';

class HlsjsWrapper {

  constructor(hlsjsConstructor) {
    let wrapper = new HlsjsWrapperPrivate(hlsjsConstructor, StreamrootPeerAgentModule);
    this.createPlayer = wrapper.createPlayer;
    this.createSRModule = wrapper.createSRModule;
    this.P2PLoader = wrapper.P2PLoader;
  }

}

export default HlsjsWrapper;
