import TrackCoord from './track-coord';

class SegmentCoord {

  /**
    * @param {Object} object
    */
  constructor(object){
    this.sn = obj.sn;
    this.trackCoord = new TrackCoord(obj.trackCoord);
  }

  /**
    * Determines if a segment represent the same media chunk than another segment
    * @param segmentCoord {SegmentCoord}
    * @returns {boolean}
    */
  isEqual(segmentCoord) {
    if(!segmentCoord){
      return false;
    }
    let {sn, trackCoord} = segmentCoord;
    return this.sn === sn && this.trackCoord.isEqual(trackCoord);
  }

  /**
    * @returns {String}
    */
  coordToString() {
    throw new Error(`Method ${arguments.callee.name} not implemented`);
  }

  /**
    * @returns {ArrayBuffer}
    */
  toArrayBuffer() {
    throw new Error(`Method ${arguments.callee.name} not implemented`);
  }

  /**
    * @returns {Object}
    */
  toJSON(){
    throw new Error(`Method ${arguments.callee.name} not implemented`);
  }
}

/**
* @param arrayBuffer {ArrayBuffer}
* @returns {SegmentCoord}
*/
SegmentCoord.fromArrayBuffer = function(arrayBuffer){};

export default SegmentCoord;