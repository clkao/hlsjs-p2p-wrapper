//jshint -W098
class TrackCoord {

  /**
    * @param segmentCoord {SegmentCoord}
    * @returns {boolean}
    */
  isInTrack(segmentCoord) {
    throw new Error(`Method ${arguments.callee.name} not implemented`);
  }

  /**
    * @returns {String}
    */
  coordToString() {
    throw new Error(`Method ${arguments.callee.name} not implemented`);
  }

  /**
    * @param trackCoord {TrackCoord}
    * @returns {boolean}
    */
  isEqual(trackCoord){
    throw new Error(`Method ${arguments.callee.name} not implemented`);
  }
}

export default TrackCoord;
