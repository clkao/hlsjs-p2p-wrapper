/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "event" }]*/

import p2pLoaderGenerator from "../../lib/integration/p2p-loader-generator";
import HlsjsWrapperMock from "../mocks/wrapper";
import Hls from "hls.js";

const TEST_URL1 = "http://www.streambox.fr/playlists/test_001/stream_110k_48k_416x234_000.ts";

describe("P2PLoaderGenerator", () => {

    // this should only run in the browser
    if (typeof window === 'undefined') {
        return;
    }

    it("should succeed to load a fragment, trigger success events and return valid stats", (done) => {

        const P2PLoader = p2pLoaderGenerator(new HlsjsWrapperMock());

        let hls = new Hls({
            fLoader: P2PLoader
        });

        let fragLoadProgress = 0, fragLoaded = 0;
        let loadedEventData;

        const frag = {
            loadCounter: 1,
            url: TEST_URL1
        };

        hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
            fragLoaded++;

            console.log(data);

            loadedEventData = data;

            finish();
        });

        hls.on(Hls.Events.FRAG_LOAD_PROGRESS, (event, data) => {

            console.log(data);

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

            (hls.abrController.bwEstimator.getEstimate() / estimatedBW).should.be.approximately(1, 0.01); // delta of 1%

            done();
        }
    });

    it("should fail to load a fragment and trigger error events", (done) => {

        const P2PLoader = p2pLoaderGenerator(new HlsjsWrapperMock());

        let hls = new Hls({
            fLoader: P2PLoader
        });

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
            error.should.be.equal(1);
            done();
        }
    });



});
