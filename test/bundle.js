import Hls from "../lib/streamroot-hlsjs-bundle"

describe("StreamrootHlsjsBundle", function() { // NOTE: We need to use the oldschool syntax
                                               // (no ES6 arraw funcs) here because of mocha`s `this.timeout`

  let video, config, hls;

  if (!Hls.isSupported()) {
    throw new Error('Hls is not supported');
  }

  this.timeout("10000");

  before(() => {

    window._DEBUG_ = true;
    window._TEST_ = false;

    config = {
      p2pConfig:{
          streamrootKey: "ry-v7xuywnt",
          debug: true,
      },
      contentUrl: 'http://www.streambox.fr/playlists/test_001/stream.m3u8',
    };
  });

  beforeEach(() => {
    video = document.createElement('video');
    document.body.appendChild(video);
  });

  afterEach(() => {
    document.body.removeChild(video);
  });

  it("should play from the start", (done) => {

    let isDone = false;

    video.addEventListener('timeupdate', () => {
      if (video.currentTime > 1.0 && !isDone) {
        done();
        isDone = true;
      }
    });

    createAndStartPlayer();
  });

  it("should seek to 30 seconds", (done) => {

    let seeking = false;
    let seeked = false;
    let isDone = false;

    video.addEventListener('timeupdate', () => {

      if (video.currentTime > 1 && !seeking) {
        video.currentTime = 30;
        seeking = true;
      }

      if (video.currentTime > 31 && seeked && !isDone) {
        done();
        isDone = true;
      }
    });

    video.addEventListener('seeked', () => {
      seeked = true;
    });

    createAndStartPlayer();
  });

  function createAndStartPlayer() {

    hls = new Hls({}, config.p2pConfig);
    hls.loadSource(config.contentUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED,function() {
      video.play();
    });

  }

});
