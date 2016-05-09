import EventEmitter from 'events';
import TrackView from './track-view';

class PlayerBridge extends EventEmitter {

  constructor(hls, Events, p2pConfig, onDispose) {
    super();

    this.hls = hls;

    this.liveMinBufferMargin = p2pConfig.liveMinBufferMargin || 10;

    this.onDispose = onDispose;

    this.hls.on(Events.LEVEL_SWITCH, (event, data) => {
      this.emit('onTrackChange', {
        video: new TrackView({level: data.level})
      });
    });

    this.hls.on(Events.DESTROYING, () => {
      this.onDispose();
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
    let confParam;
    let maxBufferLevel;
    if (this.hls.config.liveSyncDuration) {
      confParam = "liveSyncDuration";
      maxBufferLevel = this.hls.config.liveSyncDuration - this.liveMinBufferMargin;
    } else {
      confParam = "maxBufferLength";
      maxBufferLevel = this.hls.config.maxBufferLength - this.liveMinBufferMargin;
    }

    if (maxBufferLevel < 0) {
      throw Error(`Invalid configuration: hlsjsConfig.${confParam} must be greater than p2pConfig.liveMinBufferMargin`);
    }

    return maxBufferLevel;
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

export default PlayerBridge;
