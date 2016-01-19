class HlsMock {
  
  constructor (levelNumber, live) {
    
    //this.hls.levels can return undefined if master playlist as not been parsed
    if (levelNumber > 0) {
      this._levels = [];
    }
    
    for (var i=0; i<levelNumber; i++) {
      let level = {};
      if (live !== undefined) {
        level.details = {
          live: live
        }
      }
      this._levels.push(level);
    }
  }
  
  get levels() {
    return this._levels;
  }
  
}

export default HlsMock;