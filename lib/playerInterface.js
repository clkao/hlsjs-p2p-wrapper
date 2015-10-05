import observer from '../src/observer'; //Don't use method trigger from the observer, that adds the label of the event as 1st arg. Observer extends EventEmitter, so it has the regular 'emit' method
import Events from '../src/events';

class PlayerInterface {

  constructor(hls) {
    this.hls = hls;

    this.hls.on(Events.LEVEL_SWITCH, (event, data) => {
      // Store currentLevel. TODO: we might be able to use this.hls.nextLoadLevel instead. Check if that's indeed what we want.
      this.currentLevel = data.level;

      // Only trigger event "onTrackChange" if we already have info on the segment for the target level
      // If we don't, this event will be triggered "onTrackChange" in LEVEL_LOADED listener.
      if (this.hls.levels[data.level].details) {
        observer.emit('onTrackChange', 0, [{
          type: 'video',
          coord: data.level,
          bufferLevelMax: 30 //TODO: hardcoded value. How do we want to configure this?
        }]);
      }

    });

    this.hls.on(Events.LEVEL_LOADED, (event, data) => {
      // NOTE: this.hls.levels returns the list of levels but they only include a segment list for a level AFTER this event has been triggered for that level. The info for the level that interests us here is added by another listener of this event, and right now is not present when this handler is executed. That's why we add it below
      
      var map = this.hls.levels.slice(0); // TODO: @Kevin, is it necessary to slice since this Array is fetched from an ES6 getter?
      map[data.level].details = data.details;
      
      observer.emit('onMapUpdate', map);

      // Emit "onTrackChange" as well as we didn't trigger it in LEVEL_SWITCH, which is triggered before
      // LEVEL_LOADED in case we switched to a level that the player didn't "visit" before

      // NOTE: In VOD, if we switch to a level we already visited, we don't have to reload the level, so LEVEL_LOADED is
      // never triggered (but "onTrackChange" is correctly triggered in LEVEL_SWITCH since level.details is already defined)
      // However for LIVE we might have both events that are triggered because we also refresh the media playlist.
      // "onTrackChange" will be triggered 2 times in that case. Is that a problem?
      observer.emit('onTrackChange', 0, [{
        type: 'video',
        coord: this.currentLevel,
        bufferLevelMax: 30
      }]);
    });
    
    this.hls.on(Events.MSE_DETACHED, (event, data) => {
      this.hls.srModule.dispose()
      delete this.hls.srModule;
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
  
  addEventListener(eventName, listener) {
    switch (eventName) {
      case 'onMapUpdate':
      case 'onTrackChange':
        observer.on.call(observer, eventName, listener);
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
        observer.off.call(observer, eventName, listener);
        break;
        
      default:
        this.hls.off(eventName, listener);
    }
  }
  
  removeVideoEventListener(eventName, listener) {
      this.hls.video.removeEventListener(eventName, listener);
  }

  setBufferMarginLive(bufferLevel, coord) {
    //TODO, for live!
  }

  //TODO: when player is diposed, remove event listeners and call dispose on our P2P module
  
}

export default PlayerInterface;