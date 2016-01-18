var SegmentCoord = require("../lib/mapping/segment-coord");
var TrackCoord = require("../lib/mapping/track-coord");
var should = require('should');

describe("SegmentCoord",() => {
    describe("isEqual", function() {
    var trackCoord;
      it('should be equal', () => {
        let trackCoord1 = new TrackCoord({level: 0});
        let trackCoord2 = new TrackCoord({level: 0});
        trackCoord1.isEqual(trackCoord2).should.be.true();
      });
      it('should not be equal if representation is different', () => {
        let trackCoord1 = new TrackCoord({level: 0});
        let trackCoord2 = new TrackCoord({level: 1});
        trackCoord1.isEqual(trackCoord2).should.be.false();
      });
    });
    describe("isInTrack", function() {
    var trackCoord;
      it('should be in track', () => {
        let trackCoord = new TrackCoord({level: 0});
        let segmentCoord = new SegmentCoord({sn: 25, trackCoord: {level: 0}});
        trackCoord.isInTrack(segmentCoord).should.be.true();
      });
      it('should not be in track if representation is different', () => {
        let trackCoord = new TrackCoord({level: 0});
        let segmentCoord = new SegmentCoord({sn: 25, trackCoord: {level: 1}});
        trackCoord.isInTrack(segmentCoord).should.be.false();
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
