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

      // Only trigger event "onTrackChange" if we already have info on the segment for the target level
      // If we don't, this event will be triggered "onTrackChange" in LEVEL_LOADED listener.
      if (this.hls.levels[data.level].details) {
        this.emit('onTrackChange', 0, [{
          type: 'video',
          coord: data.level,
          bufferLevelMax: this.bufferLevelMax
        }]);
      }

    });

    // Unfortunately Object.assign only does a shallow copy.
    function deepClone(source) {
      var destination;
      if (Array.isArray(source)) {
        destination =[];
        for (var item of source) {
          destination.push(clone(item));
        }
      } else {
        destination = {};
        for (var property in source) {
          if (source.hasOwnProperty(property)) {
            if (typeof source[property] === "object" && source[property] !== null) {
              destination[property] = clone(source[property]);
            } else {
              destination[property] = source[property];
            }
          }
        }
      }
      return destination;
    }

    this.hls.on(Events.LEVEL_LOADED, (event, data) => {
      // NOTE: this.hls.levels returns the list of levels but they only include a segment list for a level AFTER this event has been triggered for that level. The info for the level that interests us here is added by another listener of this event, and right now is not present when this handler is executed. That's why we add it below

      var map = deepClone(this.hls.levels); //deep clone level (or else we'll override properties details, or fragments inside hls.js code as well)
      var level = map[data.level];
      if (level.details) {
        level.details.fragments = data.details.fragments; //Copy only fragment so as to not override/erase certain properties of object details (sliding for example)
      } else {
        level.details = data.details;
      }
      map[data.level] = level;
      
      this.emit('onMapUpdate', map);

      // Emit "onTrackChange" as well as we didn't trigger it in LEVEL_SWITCH, which is triggered before
      // LEVEL_LOADED in case we switched to a level that the player didn't "visit" before

      // NOTE: In VOD, if we switch to a level we already visited, we don't have to reload the level, so LEVEL_LOADED is
      // never triggered (but "onTrackChange" is correctly triggered in LEVEL_SWITCH since level.details is already defined)
      // However for LIVE we might have both events that are triggered because we also refresh the media playlist.
      // "onTrackChange" will be triggered 2 times in that case. Is that a problem?
      this.emit('onTrackChange', 0, [{
        type: 'video',
        coord: this.currentLevel,
        bufferLevelMax: this.bufferLevelMax
      }]);
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