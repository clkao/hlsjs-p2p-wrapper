import EventEmitter from 'events';

class PlayerInterface extends EventEmitter {

  constructor(hls, Events, onDispose, onAttach, onDetach) {
    super();    
    
    this.hls = hls;
    this.onDispose = onDispose;
    this.onAttach = onAttach;
    this.onDetach = onDetach;
    
    this.bufferLevelMax = this.hls.config.maxBufferLength;

    this.hls.on(Events.LEVEL_SWITCH, (event, data) => {
      // Store currentLevel. TODO: we might be able to use this.hls.nextLoadLevel instead. Check if that's indeed what we want.
      this.currentLevel = data.level;

      // The P2P map won't necessarily have the list of segments if we trigger that event now but that's not a problem. If that's the case, that will cause a level playlist download, and the segments wil be updated on 'onMapUpdate'
      // More importantly it's necessary to proceed in that order to avoid having 2 level mixed up in ongoingSegments
      this.emit('onTrackChange', 0, [{
        type: 'video',
        coord: data.level,
        bufferLevelMax: this.bufferLevelMax
      }]);

    });

    this.hls.on(Events.LEVEL_UPDATED, (event, data) => {
      this.emit('onMapUpdate', this.hls.levels);
    });
    
    this.hls.on(Events.DESTROYING, (event, data) => {
      this.onDispose();
    });
    
    this.hls.on(Events.MSE_ATTACHED, (event, data) => {
      this.onAttach();
    });
    
    this.hls.on(Events.MSE_DETACHED, (event, data) => {
      this.onDetach();
    });

  }
  
  getCurrentTime() {
    return this.hls.video.currentTime;
  }
  
  getBuffered() {
    return [{
      buffered: this.hls.video.buffered,
      coord: this.currentLevel
    }];
  }
  
  setBufferMarginLive (bufferLevel, type) {
    var MIN_BUFFER_LEVEL = 10; //TODO: where do we make this configurable
    this.hls.config.maxBufferSize = 0;
    this.hls.config.maxBufferLength = bufferLevel + MIN_BUFFER_LEVEL;
  }
  
  addEventListener(eventName, listener) {
    switch (eventName) {
      case 'onMapUpdate':
      case 'onTrackChange':
        this.on(eventName, listener);
        break;
        
      default:
        this.hls.on(eventName, listener);
    }
  }

  addVideoEventListener(eventName, listener) {
    this.hls.video.addEventListener(eventName, listener);
  }
  
  removeEventListener(eventName, listener) {
    switch (eventName) {
      case 'onMapUpdate':
      case 'onTrackChange':
        this.removeListener(eventName, listener);
        break;
        
      default:
        this.hls.off(eventName, listener);
    }
  }
  
  removeVideoEventListener(eventName, listener) {
    this.hls.video.removeEventListener(eventName, listener);
  }
  
}

export default PlayerInterface;