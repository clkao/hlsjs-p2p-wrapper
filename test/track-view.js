var TrackView = require("../lib/mapping/track-view");

describe("TrackView",() => {
    describe("isEqual", function() {
    var trackView;
      it('should be equal', () => {
        let trackView1 = new TrackView({level: 0});
        let trackView2 = new TrackView({level: 0});
        trackView1.isEqual(trackView2).should.be.true();
      });
      it('should not be equal if level is different', () => {
        let trackView1 = new TrackView({level: 0});
        let trackView2 = new TrackView({level: 1});
        trackView1.isEqual(trackView2).should.be.false();
      });
    });
    describe("viewToString", function() {
    var trackView;
      it('same tracks should have the same string output', () => {
        let trackView1 = new TrackView({level: 0});
        let trackView2 = new TrackView({level: 0});
        trackView1.viewToString().should.eql(trackView2.viewToString());
      });
      it('different track should have different output', () => {
        let trackView1 = new TrackView({level: 0});
        let trackView2 = new TrackView({level: 1});
        trackView1.viewToString().should.not.eql(trackView2.viewToString());
      });
    });
});
