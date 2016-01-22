import SegmentCoord from './segment-coord';
import TrackCoord from './track-coord';

class MediaMap {

  constructor (hls) {
    this.hls = hls;
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

  /**
    * @param segmentCoord {SegmentCoord}
    * @returns number (:warning: time must be in second if we want the debug tool (buffer display) to work properly)
    */
  getSegmentTime(segmentCoord){
    var level =  this.hls.levels[segmentCoord.trackCoord.level];
    
    if (!level || !level.details) {
      throw new Error("Called getSegmentTime on a level that was not parsed yet (or whose index didn't exist)");
    }
    
    let fragments = level.details.fragments;
    for (let i = 0; i < fragments.length; i++) {
        let fragment = fragments[i];
        if (fragment.sn == segmentCoord.sn) {
            return fragment.start;
        }
    }

    throw new Error("Segment index not found");
  }

  /**
    * @param trackCoord {TrackCoord}
    * @param beginTime {number}
    * @param duration {number}
    * @returns [SegmentCoord]
    */
  getSegmentsList(trackCoord, beginTime, duration){
    var level =  this.hls.levels[trackCoord.level];
    
    if (!level || !level.details) {
      throw new Error("Called getSegmentsList on a level that was not parsed yet (or whose index didn't exist)")
    }
    
    let segmentList = [];
    
    let fragments = level.details.fragments;
    for (let i = 0; i < fragments.length; i++) {
        let fragment = fragments[i];
        if (beginTime <= fragment.start && fragment.start <= beginTime + duration) {
            segmentList.push(new SegmentCoord({
              sn: fragment.sn,
              trackCoord
            }));
        }
    }

    return segmentList;
  }


  //USED ONLY BY OUR DISPLAYMANAGER

  /**
    * @param segmentCoord {SegmentCoord}
    * @returns {SegmentCoord}
    */
  getNextSegmentCoord(segmentCoord){
    var level =  this.hls.levels[segmentCoord.trackCoord.level];
    
    if (segmentCoord.sn + 1 < level.details.fragments.length) {
      var fragment = level.details.fragments[segmentCoord.sn + 1],
          trackCoord = new TrackCoord({level: fragment.level});
      return new SegmentCoord({sn: fragment.sn, trackCoord});
    }
    
    return null;
  }

  /**
    * @returns trackCoord {TrackCoord}
    */
  getTracksList(){
    
    if (!this.hls.levels) {
      return [];
    }
    
    let trackList = [];
    for (var i=0; i<this.hls.levels.length; i++) {
      trackList.push(new TrackCoord({level: i}));
    }
    
    return trackList;
  }
}

export default MediaMap;
