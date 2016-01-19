import MediaMap from '../lib/mapping/media-map';
import HlsMock from './mocks/hls';

describe("MediaMap",() => {
  describe.only("isLive", function() {
    it("Should return live if defined (both master and 1 level playlist parsed)", function() {
      let hlsMock = new HlsMock(3, false);
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
});