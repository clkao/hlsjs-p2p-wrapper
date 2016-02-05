import EventEmitter from 'events';
import TrackCoord from './mapping/track-coord';

class PlayerInterface extends EventEmitter {

  constructor(hls, Events, p2pConfig, onDispose, onAttach, onDetach) {
    super();    

    this.hls = hls;

    this.liveMinBufferMargin = p2pConfig.liveMinBufferMargin || 10;

    this.onDispose = onDispose;
    this.onAttach = onAttach;
    this.onDetach = onDetach;

    this.hls.on(Events.LEVEL_SWITCH, (event, data) => {
      this.emit('onTrackChange', {
        video: new TrackCoord({level: data.level})
      });
    });

    this.hls.on(Events.LEVEL_UPDATED, () => {
      this.emit('onMapUpdate', this.hls.levels);
    });

    this.hls.on(Events.DESTROYING, () => {
      this.onDispose();
    });

    this.hls.on(Events.MEDIA_ATTACHED, () => {
      this.onAttach();
    });

    this.hls.on(Events.MEDIA_DETACHED, () => {
      this.onDetach();
    });

  }


  /**
    * @returns boolean
    */
  isLive(){
    if (!this.hls.levels) {
      throw new Error("Called isLive before the master playlist was parsed");
    }

    for (let level of this.hls.levels) {
      if (level.details) {
        return !!level.details.live;
      }
    }

    throw new Error("Called isLive before any levelplaylist was parsed");
  }

  getBufferLevelMax() {
    return this.hls.config.maxBufferLength;
  }

  setBufferMarginLive(bufferLevel) {
    this.hls.config.maxBufferSize = 0;
    this.hls.config.maxBufferLength = bufferLevel + this.liveMinBufferMargin;
  }

  addEventListener(eventName, listener) {
    if (eventName === 'onTrackChange') {
      this.on(eventName, listener);
    } else {
      //throw new Error('Tried to addEventListener for other event than onTrackChange. Check streamroot-p2p version');
    }
  }

  removeEventListener(eventName, listener) {
    if (eventName === 'onTrackChange') {
      this.removeListener(eventName, listener);
    } else {
      //throw new Error('Tried to removeEventListener for other event than onTrackChange. Check streamroot-p2p version');
    }
  }

}

export default PlayerInterface;