import TrackCoord from './track-coord';

class SegmentCoord {

  /**
  * @param arrayBuffer {ArrayBuffer}
  * @returns {SegmentCoord}
  */
  static fromArrayBuffer(arrayBuffer){

  }

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
    return `${this.trackCoord.coordToString()}S${this.sn}`;
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

export default SegmentCoord;