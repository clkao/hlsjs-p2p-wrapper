import Hls from "../../lib/hlsjs-p2p-bundle";

describe("StreamrootHlsjsBundle", function() { // NOTE: We need to use the oldschool syntax
                                               // (no ES6 arraw funcs) here because of mocha`s `this.timeout`

    let video, config, hls, isDone;

    if (!Hls.isSupported()) {
        throw new Error('Hls is not supported');
    }

    this.timeout("30000");

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
        isDone = false;
        hls = null;
        video = document.createElement('video');
        document.body.appendChild(video);
    });

    afterEach(() => {
        video.pause();
        hls && hls.detachMedia();
        document.body.removeChild(video);
    });

    it("should play from the start", (done) => {

        video.addEventListener('timeupdate', () => {
            if (video.currentTime > 1.0) {
                doneOnce(done);
            }
        });

        createAndStartPlayer();
    });

    it("should seek to 30 seconds", (done) => {

        let seeking = false;
        let seeked = false;

        video.addEventListener('timeupdate', () => {

            if (video.currentTime > 1 && !seeking) {
                video.currentTime = 30;
                seeking = true;
            }

            if (video.currentTime > 31 && seeked) {
                doneOnce(done);
            }
        });

        video.addEventListener('seeked', () => {
            seeked = true;
        });

        createAndStartPlayer();
    });

    it("should play at lowest quality with bandwidth shaping enabled", (done) => {

        XMLHttpRequest.Shaper.maxBandwidth = 64;

        createAndStartPlayer(() => {
            setTimeout(() => {
                console.log('current level: ' + hls.loadLevel);
                console.log('next level: ' + hls.nextLoadLevel);
                video.currentTime = 30;
            }, 1000);
        });

        video.addEventListener('seeked', () => {
            console.log('current level: ' + hls.loadLevel);
            console.log('next level: ' + hls.nextLoadLevel);

            hls.loadLevel.should.be.equal(0);
            hls.nextLoadLevel.should.be.equal(0);

            doneOnce(done);
        });
    });

    function createAndStartPlayer(cb) {
        hls = new Hls({debug: true}, config.p2pConfig);
        hls.loadSource(config.contentUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
            video.volume = 0;
            video.play();
            cb();
        });
    }

    function doneOnce(doneFn) {
        !isDone && doneFn();
        isDone = true;
    }

});
