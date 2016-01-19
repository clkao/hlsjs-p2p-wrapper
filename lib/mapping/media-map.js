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
    var level =  this.hls.levels[segmentCoord.trackCoord.level]
    let fragments = level.details.fragments;
    for (let i = 0; i < fragments.length; i++) {
        let fragment = fragments[i];
        if (fragment.sn == segmentCoord.sn) {
            return fragment.start;
        }
    }

    throw new Error("Segment not found");
  }

  /**
    * @param trackCoord {TrackCoord}
    * @param beginTime {number}
    * @param duration {number}
    * @returns [SegmentCoord]
    */
  getSegmentsList(trackCoord, beginTime, duration){
    throw new Error(`Method ${arguments.callee.name} not implemented`);
  }


  //USED ONLY BY OUR DISPLAYMANAGER

  /**
    * @param segmentCoord {SegmentCoord}
    * @returns {SegmentCoord}
    */
  getNextSegmentCoord(segmentCoord){
    throw new Error(`Method ${arguments.callee.name} not implemented`);
  }

  /**
    * @returns trackCoord {TrackCoord}
    */
  getTracksList(){
    throw new Error(`Method ${arguments.callee.name} not implemented`);
  }
}

export default MediaMap;
