class HlsMock {

  constructor (levelNumber, live, definedLevel = 0, emptyLevel = true) {

    //this.hls.levels can return undefined if master playlist as not been parsed
    if (levelNumber > 0) {
      this._levels = [];
    }

    var fragments = [];

    for (var f=25; f<200; f++) {
      fragments.push({
        sn: f,
        start: f*10
      })
    }

    for (var i=0; i < levelNumber; i++) {
      let level;

      if (emptyLevel) {
        level = {};
      } else {
        level = {
          details: {
              totalduration: 120
          },
          audioCodec: "fooCodec"
        };
      }

      if (live !== undefined && i === definedLevel) {
        level.details = { live, fragments };
      }
      this._levels.push(level);
    }
  }

  get levels() {
    return this._levels;
  }

  on() {}

  trigger() {}

}

export default HlsMock;
