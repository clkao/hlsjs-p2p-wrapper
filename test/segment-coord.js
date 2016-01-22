var SegmentCoord = require("../lib/mapping/segment-coord");

describe("SegmentCoord",() => {
    describe("toJSON", function() {
        it("The segmentCoord can be transfered through serialisation", function() {
            var segmentCoord = new SegmentCoord({timestamp: 25, trackCoord: {adaptationId:1, representationId:0}});
            var transferedSegmentCoord = new SegmentCoord(JSON.parse(JSON.stringify(segmentCoord)));
            transferedSegmentCoord.isEqual(segmentCoord).should.be.true();
        });
    });
    describe("to/fromArrayBuffer", function() {
        var segmentCoord;
      
        it("toArrayBuffer should return an ArrayBuffer", function() {
          segmentCoord = new SegmentCoord({sn: 25, trackCoord: {level: 1}});
          var arrayBuffer = segmentCoord.toArrayBuffer();
          arrayBuffer.should.be.an.instanceof(ArrayBuffer);
        });

        it("Should return the correct values (low values)", function() {
            segmentCoord = new SegmentCoord({sn: 25, trackCoord: {level: 1}});
            var arrayBuffer = segmentCoord.toArrayBuffer();
            SegmentCoord.fromArrayBuffer(arrayBuffer).isEqual(segmentCoord).should.be.true();
        });
    });
    describe("isEqual", function() {
      it('should be equal', () => {
        let segmentCoord1 = new SegmentCoord({sn: 25, trackCoord: {level: 1}});
        let segmentCoord2 = new SegmentCoord({sn: 25, trackCoord: {level: 1}});
        segmentCoord1.isEqual(segmentCoord2).should.be.true();
      });
      it('should not be equal if sequence number is different', () => {
        let segmentCoord1 = new SegmentCoord({sn: 25, trackCoord: {level: 1}});
        let segmentCoord2 = new SegmentCoord({sn: 1560, trackCoord: {level: 1}});
        segmentCoord1.isEqual(segmentCoord2).should.be.false();
      });
      it('should not be equal if level is different', () => {
        let segmentCoord1 = new SegmentCoord({sn: 25, trackCoord: {level: 1}});
        let segmentCoord2 = new SegmentCoord({sn: 25, trackCoord: {level: 5}});
        segmentCoord1.isEqual(segmentCoord2).should.be.false();
      });
    });
});
