/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "event" }]*/

import p2pLoaderGenerator from "../../lib/integration/p2p-loader-generator";
import HlsjsWrapperMock from "../mocks/wrapper";
import HlsjsMock from "../mocks/hls";
import Hls from "hls.js";

const TEST_URL1 = "http://www.streambox.fr/playlists/test_001/stream_110k_48k_416x234_000.ts";

describe("P2PLoaderGenerator", function() { // using plain ES5 function here
                                            // otherwise `this.timeout` is broken

    function createHls() {
        const P2PLoader = p2pLoaderGenerator(new HlsjsWrapperMock());
        let hls = new Hls({
            fLoader: P2PLoader,
            debug: true
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            console.log(data);
        });

        return hls;
    }

    this.timeout(10000);

    // this should only run in the browser
    if (typeof window === 'undefined') {
        return;
    }

    beforeEach(() => {
        XMLHttpRequest.Shaper.maxBandwidth = 512;
    });

    afterEach(() => {

        // Reset XHR-shaper to defaults !!!
        XMLHttpRequest.Shaper.maxBandwidth = Infinity;
    });

    it("should succeed to load a fragment, trigger success events and return valid stats", (done) => {

        const hlsjsMock = new HlsjsMock(1, false);

        let hls = createHls();

        let fragLoadProgress = 0, fragLoaded = 0;
        let loadedEventData;

        const frag = {
            loadCounter: 1,
            url: TEST_URL1,
            level: 0
        };

        hls.levelController._levels = hlsjsMock.levels;

        hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
            fragLoaded++;

            loadedEventData = data;

            finish();
        });

        hls.on(Hls.Events.FRAG_LOAD_PROGRESS, (event, data) => {

            data.frag.should.be.equal(frag);

            fragLoadProgress++;
        });

        hls.trigger(Hls.Events.FRAG_LOADING, {frag});

        function finish() {

            const expectedSize = 245528;

            loadedEventData.payload.byteLength.should.be.equal(expectedSize);

            loadedEventData.stats.trequest.should.be.above(0);
            loadedEventData.stats.tfirst.should.be.above(loadedEventData.stats.trequest);
            loadedEventData.stats.tload.should.be.above(loadedEventData.stats.tfirst);
            loadedEventData.stats.loaded.should.be.equal(expectedSize);

            loadedEventData.frag.loaded.should.be.equal(expectedSize);

            fragLoadProgress.should.be.above(0);
            fragLoaded.should.be.equal(1);

            const estimatedBW = 8 * expectedSize / ((loadedEventData.stats.tload - loadedEventData.stats.trequest) / 1000.0);

            console.log('Estimated BW: ' + estimatedBW);

            (hls.abrController.bwEstimator.getEstimate() / estimatedBW).should.be.approximately(1, 0.01); // delta of 1%

            done();
        }
    });

    it("should fail to load a fragment and trigger error events", (done) => {

        let hls = createHls();

        let isDone = false;
        let error = 0;

        hls.on(Hls.Events.ERROR, (event) => {
            error++;
            finish();
        });

        let frag = {
            url: TEST_URL1 + "foo"
        };

        hls.trigger(Hls.Events.FRAG_LOADING, {frag});

        function finish() {
            if (isDone) {
                return;
            }
            isDone = true;
            error.should.be.equal(1);
            done();
        }
    });

});
