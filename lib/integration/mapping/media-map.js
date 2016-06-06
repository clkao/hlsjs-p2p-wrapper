import SegmentView from './segment-view';
import TrackView from './track-view';

class MediaMap {

  constructor (hls) {
    this.hls = hls;
  }

  /**
    * @param segmentView {SegmentView}
    * @returns number (:warning: time must be in second if we want the debug tool (buffer display) to work properly)
    */
  getSegmentTime(segmentView){
    if (segmentView.time === undefined) {
      throw new Error("getSegmentTime: segmentView.time is undefined");
    }
    return segmentView.time;
  }

  /**
    * @param trackView {TrackView}
    * @param beginTime {number}
    * @param duration {number}
    * @returns [SegmentView]
    */
  getSegmentList(trackView, beginTime, duration){
    var level =  this.hls.levels[trackView.level];

    if (!level) {
      throw new Error("getSegmentList: level doesn't exist");
    }

    if (!level.details) {
      console.warn("getSegmentList: level not parsed yet");
      return [];
    }

    let segmentList = [];

    let fragments = level.details.fragments;
    for (let i = 0; i < fragments.length; i++) {
        let fragment = fragments[i];
        if (beginTime <= fragment.start && fragment.start <= beginTime + duration) {
            segmentList.push(new SegmentView({
              sn: fragment.sn,
              trackView,
              time: fragment.start
            }));
        }
    }

    return segmentList;
  }


  //USED ONLY BY OUR DISPLAYMANAGER

  /**
    * @param segmentView {SegmentView}
    * @returns {SegmentView}
    */
  getNextSegmentView(segmentView){
    let level =  this.hls.levels[segmentView.trackView.level];
    let found = false;

    for (let fragment of level.details.fragments) {
        if (found) {
            let trackView = new TrackView({level: fragment.level});
            return new SegmentView({sn: fragment.sn, trackView, time: fragment.start});
        }
        if (fragment.sn === segmentView.sn) found = true;
    }
    return null;
  }

  /**
    * @returns trackView {TrackView}
    */
  getTrackList(){

    if (!this.hls.levels) {
      return [];
    }

    let trackList = [];
    for (var i=0; i<this.hls.levels.length; i++) {
      trackList.push(new TrackView({level: i}));
    }

    return trackList;
  }
}

export default MediaMap;
