import TrackCoord from './track-coord';

class SegmentCoord {

  /**
  * @param arrayBuffer {ArrayBuffer}
  * @returns {SegmentCoord}
  */
  static fromArrayBuffer(arrayBuffer){
    var u32Data = new Uint32Array(arrayBuffer),
        [ level, sn ] = u32Data;
    return new SegmentCoord({ 
      trackCoord: new TrackCoord({ level }), 
      sn 
    });
  }

  /**
    * @param {Object} object
    */
  constructor(obj){
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
    return new Uint32Array([this.trackCoord.level, this.sn]).buffer;
  }
}

export default SegmentCoord;