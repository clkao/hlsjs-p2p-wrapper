var TrackCoord = require("../lib/mapping/track-coord");

describe("TrackCoord",() => {
    describe("isEqual", function() {
    var trackCoord;
      it('should be equal', () => {
        let trackCoord1 = new TrackCoord({level: 0});
        let trackCoord2 = new TrackCoord({level: 0});
        trackCoord1.isEqual(trackCoord2).should.be.true();
      });
      it('should not be equal if level is different', () => {
        let trackCoord1 = new TrackCoord({level: 0});
        let trackCoord2 = new TrackCoord({level: 1});
        trackCoord1.isEqual(trackCoord2).should.be.false();
      });
    });
    describe("coordToString", function() {
    var trackCoord;
      it('same tracks should have the same string output', () => {
        let trackCoord1 = new TrackCoord({level: 0});
        let trackCoord2 = new TrackCoord({level: 0});
        trackCoord1.coordToString().should.eql(trackCoord2.coordToString());
      });
      it('different track should have different output', () => {
        let trackCoord1 = new TrackCoord({level: 0});
        let trackCoord2 = new TrackCoord({level: 1});
        trackCoord1.coordToString().should.not.eql(trackCoord2.coordToString());
      });
    });
});
