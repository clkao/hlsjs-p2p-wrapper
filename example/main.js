import StreamrootHlsjsBundle from '../lib/streamroot-hlsjs-bundle';
import HlsjsWrapper from '../lib/hlsjs-wrapper.js';

const config = window.streamrootConfig;
const USE_BUNDLE = true;
const USE_CUSTOM_URL = false;

window.addEventListener("load", () => {

    // Shim import of Hls.js with Streamroot bundle
    const Hls = StreamrootHlsjsBundle;

    // Check for config in environment
    if (!config) {
        throw new Error('Streamroot config is not set');
    }

    // Check feature support
    if (Hls.isSupported()) {
        let hls;
        const video = document.getElementById('video');

        /**
         * There are two ways to use the Hls.js wrapper: with the bundle including the Hls.js library
         * (i.e a specific version for which we provide support in this combination), which is the simplest
         * one, and giving you an constructor just as if you imported the vanilla Hls.js - only minimal changes needed in your app.
         * The other way is dependency-injecting yourself the Hls.js constructor to rule over what version or fork
         * of the player you will use. Both ways are exposed below. Set `USE_BUNDLE` to `false`
         * in this example to use the DI way. It will be equivalent here. We do not officially recommend to
         * do the low-level DI yourself because we do not support just any version of Hls.js in combination
         * with our peer-agent technology i.e this wrapper.
         */

        /**
         * Preferred way is to simply use the bundle that shims the Hls.js constructor and leaves without
         * any further complexity to deal with in your application
         */
        if (USE_BUNDLE) {

            // Initialize Hls.js instance just as usually but add P2PConfig object as second parameter
            hls = new Hls(config.hlsjsConfig, config.p2pConfig);

        /* Injecting "your own" Hls.js version (danger zone -> we might not support this) */
        } else {

            // Create wrapper where we DI the Hls.js constructor (in this example we use the one provided by the bundle)
            const wrapper = new HlsJsWrapper(Hls);

            if (USE_CUSTOM_URL) {
                // To create a new configured default player using the wrapper toolkit
                hls = wrapper.createPlayer(config.hlsjsConfig, config.p2pConf, config.contentId);
            } else {
                // Use this if you eventually want to inject your own created Hls.js player instance.
                // If you pass `null` as first argument, the same player as above will be created and returned.
                hls = wrapper.startSession(config.hlsjsConfig, config.p2pConf, config.contentUrl, config.contentId);
            }
        }

        hls.loadSource(config.contentUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
            video.play();
        });
    }
});
