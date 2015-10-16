import PlayerInterface from './playerInterface';
import P2PLoaderFactory from './p2p-loader-factory';
import { hlsToSRMap, hlsToSRTrackCoordinate, hlsToSRSegmentCoordinate } from './mapper';
import Hls from 'hls.js';
import SRModule from 'streamroot-p2p';

class StreamrootWrapper {
  
  // TODO: need to find a cleaner way to inherit static methods ONLY. Extending Hls is not really clean, and I can't reference 
  // 'this' before 'super' in the constructor, which makes it tricky with P2PLoaderFactory
  static isSupported() {
    return Hls.isSupported;
  }

  static get Events() {
    return Hls.Events;
  }

  static get ErrorTypes() {
    return Hls.ErrorTypes;
  }

  static get ErrorDetails() {
    return Hls.ErrorDetails;
  }
  
  constructor (hlsConfig, p2pConfig) {
    
    hlsConfig.loader = this.P2PLoader;
    hlsConfig.xhrSetup = this.setRange;
    
    this.hls = new Hls(hlsConfig);

    this.hls.on(Hls.Events.MANIFEST_LOADING, (event, data) => {
      this.createSRModule(p2pConfig);
    });

    return this.hls;
  }

  setRange (xhr) {
    // It is important to notice that this method will be called by the P2PLoader as this.xhrSetup.
    // Therefore 'this' refers here to P2PLoader
    if (this.range) {
      var start = this.range.start || 0;
      var end = this.range.end || '';
      var rangeString = 'bytes=' + start + '-' + end;
      xhr.setRequestHeader('Range', rangeString);      
    }
  }

  createSRModule (p2pConfig) {
    this.playerInterface = new PlayerInterface(this.hls, Hls.Events, this.onDispose.bind(this));
    this.srModule = new SRModule(this.playerInterface, this.hls.url, p2pConfig, hlsToSRMap, hlsToSRTrackCoordinate, hlsToSRSegmentCoordinate);
  }

  get P2PLoader () {
    return P2PLoaderFactory(this);
  }

  onDispose () {
    this.srModule.dispose();
  }
}

export default StreamrootWrapper;