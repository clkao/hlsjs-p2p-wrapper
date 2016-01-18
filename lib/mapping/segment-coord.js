//jshint -W098
class SegmentCoord {

  /**
    * @param {Object} object
    */
  constructor(object){
    throw new Error(`Method ${arguments.callee.name} not implemented`);
  }

  /**
    * Determines if a segment represent the same media chunk than another segment
    * @param segmentCoord {SegmentCoord}
    * @returns {boolean}
    */
  isEqual(segmentCoord) {
    throw new Error(`Method ${arguments.callee.name} not implemented`);
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