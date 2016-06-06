import SegmentView from '../lib/integration/mapping/segment-view';
import TrackView from '../lib/integration/mapping/track-view';

describe("SegmentView",() => {
    describe("toJSON", function() {
        it("The segmentView can be transfered through serialisation", function() {
            var segmentView = new SegmentView({timestamp: 25, trackView: {adaptationId:1, representationId:0}});
            var transferedSegmentView = new SegmentView(JSON.parse(JSON.stringify(segmentView)));
            transferedSegmentView.isEqual(segmentView).should.be.true();
        });
    });

    describe("to/fromArrayBuffer", function() {
        var segmentView;

        it("toArrayBuffer should return an ArrayBuffer", function() {
            segmentView = new SegmentView({sn: 25, trackView: {level: 1}});
            var arrayBuffer = segmentView.toArrayBuffer();
            arrayBuffer.should.be.an.instanceof(ArrayBuffer);
        });

        it("Should return the correct values (low values)", function() {
            segmentView = new SegmentView({sn: 25, trackView: {level: 1}});
            var arrayBuffer = segmentView.toArrayBuffer();
            SegmentView.fromArrayBuffer(arrayBuffer).isEqual(segmentView).should.be.true();
        });
    });

    describe("isInTrack", function() {
        it('should be in track', () => {
            let trackView = new TrackView({level: 0});
            let segmentView = new SegmentView({sn: 25, trackView: {level: 0}});
            segmentView.isInTrack(trackView).should.be.true();
        });

        it('should not be in track if level is different', () => {
            let trackView = new TrackView({level: 0});
            let segmentView = new SegmentView({sn: 25, trackView: {level: 1}});
            segmentView.isInTrack(trackView).should.be.false();
        });
    });

    describe("isEqual", function() {
        it('should be equal', () => {
            let segmentView1 = new SegmentView({sn: 25, trackView: {level: 1}});
            let segmentView2 = new SegmentView({sn: 25, trackView: {level: 1}});
            segmentView1.isEqual(segmentView2).should.be.true();
        });

        it('should not be equal if sequence number is different', () => {
            let segmentView1 = new SegmentView({sn: 25, trackView: {level: 1}});
            let segmentView2 = new SegmentView({sn: 1560, trackView: {level: 1}});
            segmentView1.isEqual(segmentView2).should.be.false();
        });

        it('should not be equal if level is different', () => {
            let segmentView1 = new SegmentView({sn: 25, trackView: {level: 1}});
            let segmentView2 = new SegmentView({sn: 25, trackView: {level: 5}});
            segmentView1.isEqual(segmentView2).should.be.false();
        });
    });
});
