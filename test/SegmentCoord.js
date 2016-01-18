var SegmentCoord = require("../lib/mapping/segment-coord");
var should = require('should');

describe("SegmentCoord",() => {
    describe("toJSON", function() {
        it("The segmentCoord can be transfered through serialisation", function() {
            var segmentCoord = new SegmentCoord({timestamp: 25, trackCoord: {adaptationId:1, representationId:0}});
            var transferedSegmentCoord = new SegmentCoord(JSON.parse(JSON.stringify(segmentCoord)));
            transferedSegmentCoord.isEqual(segmentCoord).should.be.true();
        });
    });
    describe("toArrayBuffer to parseSegChunkIdData", function() {
        var segmentCoord;

        it("Should return the correct values (low values)", function() {
            segmentCoord = new SegmentCoord({timestamp: 25, trackCoord: {adaptationId:1, representationId:0}});
            var arrayBuffer = segmentCoord.toArrayBuffer();
            SegmentCoord.fromArrayBuffer(arrayBuffer).isEqual(segmentCoord).should.be.true();
        });
        it("Should return the correct values (high values)", function() {
            segmentCoord = new SegmentCoord({timestamp: 8257546242.3, trackCoord: {adaptationId:8, representationId:5}});
            var arrayBuffer = segmentCoord.toArrayBuffer();
            // SegmentCoord.fromArrayBuffer(arrayBuffer).isEqual(segmentCoord)
            SegmentCoord.fromArrayBuffer(arrayBuffer).isEqual(segmentCoord).should.be.true();
        });
    });
    describe("isEqual", function() {
      it('should be equal', () => {
        let segmentCoord1 = new SegmentCoord({timestamp: 1257546242.3, trackCoord: {adaptationId:0, representationId:0}});
        let segmentCoord2 = new SegmentCoord({timestamp: 1257546242.3, trackCoord: {adaptationId:0, representationId:0}});
        segmentCoord1.isEqual(segmentCoord2).should.be.true();
      });
      it('should not be equal if timestamp is different', () => {
        let segmentCoord1 = new SegmentCoord({timestamp: 1257546242.3, trackCoord: {adaptationId:0, representationId:0}});
        let segmentCoord2 = new SegmentCoord({timestamp: 8556458458.5, trackCoord: {adaptationId:0, representationId:0}});
        segmentCoord1.isEqual(segmentCoord2).should.be.false();
      });
      it('should not be equal if representation is different', () => {
        let segmentCoord1 = new SegmentCoord({timestamp: 1257546242.3, trackCoord: {adaptationId:0, representationId:0}});
        let segmentCoord2 = new SegmentCoord({timestamp: 1257546242.3, trackCoord: {adaptationId:0, representationId:1}});
        segmentCoord1.isEqual(segmentCoord2).should.be.false();
      });
      it('should not be equal if adaptation is different', () => {
        let segmentCoord1 = new SegmentCoord({timeline: {ts: 1257546242.3}, trackCoord: {adaptationId:0, representationId:0}});
        let segmentCoord2 = new SegmentCoord({timeline: {ts: 1257546242.3}, trackCoord: {adaptationId:1, representationId:0}});
        segmentCoord1.isEqual(segmentCoord2).should.be.false();
      });
    });
});
