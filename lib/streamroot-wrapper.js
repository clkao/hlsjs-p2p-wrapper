import PlayerInterface from './playerInterface';
import P2PLoaderFactory from './p2p-loader-factory';
import { hlsToSRMap, hlsToSRTrackCoordinate, hlsToSRSegmentCoordinate } from './mapper';
import Hls from 'hls.js';
import SRModule from 'streamroot-p2p';

class StreamrootWrapper {

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
    this.playerInterface = new PlayerInterface(this.hls, Hls.Events, this.onDispose.bind(this), this.onAttach.bind(this), this.onDetach.bind(this));
    this.srModule = new SRModule(this.playerInterface, this.hls.url, p2pConfig, hlsToSRMap, hlsToSRTrackCoordinate, hlsToSRSegmentCoordinate);
  }

  get P2PLoader () {
    return P2PLoaderFactory(this);
  }

  onDispose () {
    this.srModule.dispose();
  }
  
  onAttach () {
    this.srModule.attach()
  }
  
  onDetach () {
    this.srModule.detach()
  }
}


//Inheriting static properties from Hls. Quite dirty but it does the trick. ES6 Proxies might help here, but there'll be no polyfill

function inheritStaticProperty(staticProperty) {
  Object.defineProperty(StreamrootWrapper, staticProperty, {
    get: function () {
      return Hls[staticProperty]
    },
    set: undefined
  });
}

for (var staticProperty of Object.getOwnPropertyNames(Hls)) {
  if (["prototype", "name", "length"].indexOf(staticProperty) === -1) {
    inheritStaticProperty(staticProperty);
  }
}

export default StreamrootWrapper;