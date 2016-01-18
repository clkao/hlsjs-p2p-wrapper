var SegmentCoord = require("../lib/mapping/segment-coord");
var TrackCoord = require("../lib/mapping/track-coord");
var should = require('should');

describe("SegmentCoord",() => {
    describe("isEqual", function() {
    var trackCoord;
      it('should be equal', () => {
        let trackCoord1 = new TrackCoord({adaptationId:0, representationId:0});
        let trackCoord2 = new TrackCoord({adaptationId:0, representationId:0});
        trackCoord1.isEqual(trackCoord2).should.be.true();
      });
      it('should not be equal if representation is different', () => {
        let trackCoord1 = new TrackCoord({adaptationId:0, representationId:0});
        let trackCoord2 = new TrackCoord({adaptationId:0, representationId:1});
        trackCoord1.isEqual(trackCoord2).should.be.false();
      });
      it('should not be equal if adaptation is different', () => {
        let trackCoord1 = new TrackCoord({adaptationId:0, representationId:0});
        let trackCoord2 = new TrackCoord({adaptationId:1, representationId:0});
        trackCoord1.isEqual(trackCoord2).should.be.false();
      });
    });
    describe("isInTrack", function() {
    var trackCoord;
      it('should be in track', () => {
        let trackCoord = new TrackCoord({adaptationId:0, representationId:0});
        let segmentCoord = new SegmentCoord({timestamp: 1257546242.3, trackCoord: {adaptationId:0, representationId:0}});
        trackCoord.isInTrack(segmentCoord).should.be.true();
      });
      it('should not be in track if representation is different', () => {
        let trackCoord = new TrackCoord({adaptationId:0, representationId:0});
        let segmentCoord = new SegmentCoord({timestamp: 1257546242.3, trackCoord: {adaptationId:0, representationId:1}});
        trackCoord.isInTrack(segmentCoord).should.be.false();
      });
      it('should not be in track if adaptation is different', () => {
        let trackCoord = new TrackCoord({adaptationId:0, representationId:0});
        let segmentCoord = new SegmentCoord({timeline: {ts: 1257546242.3}, trackCoord: {adaptationId:1, representationId:0}});
        trackCoord.isInTrack(segmentCoord).should.be.false();
      });
    });
    describe("coordToString", function() {
    var trackCoord;
      it('same tracks should have the same string output', () => {
        let trackCoord1 = new TrackCoord({adaptationId:0, representationId:0});
        let trackCoord2 = new TrackCoord({adaptationId:0, representationId:0});
        trackCoord1.coordToString().should.eql(trackCoord2.coordToString());
      });
      it('different track should have different output', () => {
        let trackCoord1 = new TrackCoord({adaptationId:0, representationId:0});
        let trackCoord2 = new TrackCoord({adaptationId:0, representationId:1});
        trackCoord1.coordToString().should.not.eql(trackCoord2.coordToString());
      });
    });
});
