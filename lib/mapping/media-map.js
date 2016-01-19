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
    
    for (var level of this.hls.levels) {
      if (level.details) {
        return !!level.details.live
      }
    }
    
    throw new Error("Called isLive before any levelplaylist was parsed");
  }

  /**
    * @param segmentCoord {SegmentCoord}
    * @returns number (:warning: time must be in second if we want the debug tool (buffer display) to work properly)
    */
  getSegmentTime(segmentCoord){
    throw new Error(`Method ${arguments.callee.name} not implemented`);
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
