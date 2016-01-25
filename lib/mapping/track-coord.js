//jshint -W098
class TrackCoord {

  constructor(obj) {
    this.level = obj.level;
  }

  /**
    * @returns {String}
    */
  coordToString() {
    return `L${this.level}`;
  }

  /**
    * @param trackCoord {TrackCoord}
    * @returns {boolean}
    */
  isEqual(trackCoord){
    if(!trackCoord){
      return false;
    }
    return trackCoord.level === this.level;
  }
}

export default TrackCoord;
