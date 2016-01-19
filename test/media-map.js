import MediaMap from '../lib/mapping/media-map';
import SegmentCoord from '../lib/mapping/segment-coord';
import TrackCoord from '../lib/mapping/track-coord';
import HlsMock from './mocks/hls';

describe("MediaMap",() => {
  describe("isLive", function() {
    it("Should return live if defined (both master and 1 level playlist parsed)", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      mediaMap.isLive().should.be.false;
    });
    it("Should throw if isLive is called before the master playlist is parsed", function() {
      let hlsMock = new HlsMock(0, false);
      let mediaMap = new MediaMap(hlsMock);
      mediaMap.isLive.bind(mediaMap).should.throw("Called isLive before the master playlist was parsed");
    });
    it("Should throw if isLive is called before any levelplaylist is parsed", function() {
      let hlsMock = new HlsMock(3, undefined);
      let mediaMap = new MediaMap(hlsMock);
      mediaMap.isLive.bind(mediaMap).should.throw("Called isLive before any levelplaylist was parsed");
    });
  });
  describe("getSegmentTime", function() {
    it("Should return segment start timestamp if segment exists", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackCoord = new TrackCoord({
        level: 1
      });
      let segmentCoord = new SegmentCoord({
        sn: 56,
        trackCoord
      })
      mediaMap.getSegmentTime(segmentCoord).should.be.equal(560);
    });
    it("Should throw error if segment index can't be found", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackCoord = new TrackCoord({
        level: 1
      });
      let segmentCoord = new SegmentCoord({
        sn: 24,
        trackCoord
      })
      mediaMap.getSegmentTime.bind(mediaMap, segmentCoord).should.throw("Segment index not found");
    });
    it("Should throw if called on a level that is not parsed", function() {
      let hlsMock = new HlsMock(3, false, 0);
      let mediaMap = new MediaMap(hlsMock);
      let trackCoord = new TrackCoord({
        level: 1
      });
      let segmentCoord = new SegmentCoord({
        sn: 56,
        trackCoord
      })
      mediaMap.getSegmentTime.bind(mediaMap, segmentCoord).should.throw("Called getSegmentTime on a level that was not parsed yet (or whose index didn't exist)");
    });
  });
  describe("getSegmentsList", function() {
    it("Should return list of segments in timerange (timerange included in segment index)", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackCoord = new TrackCoord({
        level: 1
      });
      let expectedSegmentList = [ 
        new SegmentCoord({sn: 37, trackCoord}),
        new SegmentCoord({sn: 38, trackCoord}),
        new SegmentCoord({sn: 39, trackCoord}),
      ];
      mediaMap.getSegmentsList(trackCoord, 365, 33).should.be.eql(expectedSegmentList);
    });
    it("Should return list of segments in timerange (left intersection)", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackCoord = new TrackCoord({
        level: 1
      });
      let expectedSegmentList = [ 
        new SegmentCoord({sn: 25, trackCoord}),
        new SegmentCoord({sn: 26, trackCoord}),
        new SegmentCoord({sn: 27, trackCoord}),
        new SegmentCoord({sn: 28, trackCoord}),
      ];
      mediaMap.getSegmentsList(trackCoord, 10, 275).should.be.eql(expectedSegmentList);
    });
    it("Should return list of segments in timerange (right intersection)", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackCoord = new TrackCoord({
        level: 1
      });
      let expectedSegmentList = [ 
        new SegmentCoord({sn: 198, trackCoord}),
        new SegmentCoord({sn: 199, trackCoord}),
      ];
      mediaMap.getSegmentsList(trackCoord, 1975, 3000).should.be.eql(expectedSegmentList);
    });
    it("Should return list of segments in timerange (timerange includes segment index)", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackCoord = new TrackCoord({
        level: 1
      });
      let expectedSegmentList = [];

      for (var f=25; f<200; f++) {
        expectedSegmentList.push(new SegmentCoord({
          sn: f,
          trackCoord
        }));
      }

      mediaMap.getSegmentsList(trackCoord, 240, 2100).should.be.eql(expectedSegmentList);
    });
    it("Should return an empty array if no segment is found in that timerange", function() {
      let hlsMock = new HlsMock(3, false, 1);
      let mediaMap = new MediaMap(hlsMock);
      let trackCoord = new TrackCoord({
        level: 1
      });
      let expectedSegmentList = [];

      mediaMap.getSegmentsList(trackCoord, 2100, 3000).should.be.eql(expectedSegmentList);
    });
    it("Should throw if called on a level that is not parsed", function() {
      let hlsMock = new HlsMock(3, false, 0);
      let mediaMap = new MediaMap(hlsMock);
      let trackCoord = new TrackCoord({
        level: 1
      });
      let expectedSegmentList = [ 
        new SegmentCoord({sn: 37, trackCoord}),
        new SegmentCoord({sn: 38, trackCoord}),
        new SegmentCoord({sn: 39, trackCoord}),
      ];
      mediaMap.getSegmentsList.bind(mediaMap, trackCoord, 365, 33).should.throw("Called getSegmentsList on a level that was not parsed yet (or whose index didn't exist)");
    });
  });
});