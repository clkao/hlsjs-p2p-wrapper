"use strict"

import HlsjsWrapperPrivate from './hlsjs-wrapper-private'
import StreamrootPeerAgentModule from 'streamroot-p2p';

class HlsjsWrapper {

  constructor(hlsjsConstructor) {
    let wrapper = new HlsjsWrapperPrivate(hlsjsConstructor, StreamrootPeerAgentModule);
    this.createPlayer = wrapper.createPlayer.bind(wrapper);
    this.createSRModule = wrapper.createSRModule.bind(wrapper);
    this.P2PLoader = wrapper.P2PLoader;
  }

}

export default HlsjsWrapper;
