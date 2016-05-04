import MediaMap from '../lib/mapping/media-map';
import SegmentView from '../lib/mapping/segment-view';
import TrackView from '../lib/mapping/track-view';
import HlsMock from './mocks/hls';

describe("MediaMap",() => {
  describe("getSegmentTime", function() {
    it("Should return segment start timestamp if segment exists", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 1
      });
      let segmentView = new SegmentView({
        sn: 56,
        trackView,
        time: 560
      })
      mediaMap.getSegmentTime(segmentView).should.be.equal(560);
    });
    it("Should not throw error if segment index can't be found, if property time exists", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 1
      });
      let segmentView = new SegmentView({
        sn: 24,
        trackView,
        time: 240
      })
      mediaMap.getSegmentTime(segmentView).should.be.equal(240);
    });
    it("Should not throw if called on a level that is not parsed, if property time exists", function() {
      let hlsMock = new HlsMock(3, false, 0);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 1
      });
      let segmentView = new SegmentView({
        sn: 56,
        trackView,
        time: 560
      })
      mediaMap.getSegmentTime(segmentView).should.be.equal(560);
    });
    it("Should throw if property time doesn't exists", function() {
      let hlsMock = new HlsMock(3, false, 0);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 1
      });
      let segmentView = new SegmentView({
        sn: 56,
        trackView
      })
      mediaMap.getSegmentTime.bind(mediaMap, segmentView).should.throw("getSegmentTime: segmentView.time is undefined");
    });
  });
  describe("getSegmentList", function() {
    it("Should return list of segments in timerange (timerange included in segment index)", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 1
      });
      let expectedSegmentList = [
        new SegmentView({sn: 37, trackView, time: 370}),
        new SegmentView({sn: 38, trackView, time: 380}),
        new SegmentView({sn: 39, trackView, time: 390}),
      ];
      mediaMap.getSegmentList(trackView, 365, 33).should.be.eql(expectedSegmentList);
    });
    it("Should return list of segments in timerange (left intersection)", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 1
      });
      let expectedSegmentList = [
        new SegmentView({sn: 25, trackView, time: 250}),
        new SegmentView({sn: 26, trackView, time: 260}),
        new SegmentView({sn: 27, trackView, time: 270}),
        new SegmentView({sn: 28, trackView, time: 280}),
      ];
      mediaMap.getSegmentList(trackView, 10, 275).should.be.eql(expectedSegmentList);
    });
    it("Should return list of segments in timerange (right intersection)", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 1
      });
      let expectedSegmentList = [
        new SegmentView({sn: 198, trackView, time: 1980}),
        new SegmentView({sn: 199, trackView, time: 1990}),
      ];
      mediaMap.getSegmentList(trackView, 1975, 3000).should.be.eql(expectedSegmentList);
    });
    it("Should return list of segments in timerange (timerange includes segment index)", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 1
      });
      let expectedSegmentList = [];

      for (var f=25; f<200; f++) {
        expectedSegmentList.push(new SegmentView({
          sn: f,
          trackView,
          time: f*10
        }));
      }

      mediaMap.getSegmentList(trackView, 240, 2100).should.be.eql(expectedSegmentList);
    });
    it("Should return an empty array if no segment is found in that timerange", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 1
      });
      let expectedSegmentList = [];

      mediaMap.getSegmentList(trackView, 2100, 3000).should.be.eql(expectedSegmentList);
    });
    it("Should return an empty array if called on a level that is not parsed", function() {
      let hlsMock = new HlsMock(3, false, 0);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 1
      });
      let expectedSegmentList = [];

      mediaMap.getSegmentList(trackView, 2100, 3000).should.be.eql(expectedSegmentList);
    });
    it("Should throw if level does not exist", function() {
      let hlsMock = new HlsMock(3, false, 0);
      let mediaMap = new MediaMap(hlsMock);
      let trackView = new TrackView({
        level: 4
      });

      mediaMap.getSegmentList.bind(mediaMap, trackView, 2100, 3000).should.throw("getSegmentList: level doesn't exist");
    });
  });
});
