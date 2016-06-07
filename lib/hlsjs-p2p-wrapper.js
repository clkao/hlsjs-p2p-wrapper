import HlsjsP2PWrapperLite from './hlsjs-p2p-wrapper-lite';
import { inheritStaticPropertiesReadOnly } from './utils';
import Hlsjs from 'hls.js';
import extend from 'lodash.assignInWith';
import UAParser from 'ua-parser-js';

const uaParserResult = (new UAParser()).getResult();

/**
 * Shims Hls.js class. This de facto extends the class definition by ES6 spec, which means it inherits defined properties)
 *  and runs the base class constructor.
 *
 *  This constructor results in a valid Hls.js instance bootstrapped to use Streamroot.
 *
 *  NOTE: We don't use ES6 extend to avoid to have to call `super()`,
 *        which would run the constructor twice and creating a zombie context.
 *
 * @constructor
 * @param {object} hlsjsConfig - Hls.js config
 * @param {object} p2pConfig - Client specific Streameroot P2P agent config
 */


class StreamrootHlsjsBundle {
    constructor (hlsjsConfig, p2pConfig) {
        // Inject Hls.js class supplied with this bundle
        // Create and bootstrap a player instance
        return (new HlsjsP2PWrapperLite(Hlsjs)).createPlayer(hlsjsConfig, p2pConfig);
    }
}

/**
 * Extend this class with Hls.js base class (inherits nested protoypes, in case you want to extend this further).
 * This is necessary to make this a fully valid and extensible class definiton by ES6.
 */
extend(StreamrootHlsjsBundle, Hlsjs);

/* Inherit static read-only props (like Events etc.) */
inheritStaticPropertiesReadOnly(StreamrootHlsjsBundle, Hlsjs);

// Overrides of static methods. Has to be done _after_ calling `extend` !

/**
 * We override `isSupported` to supply our own feature detection
 * @static
 * @override
 * @method
 */
StreamrootHlsjsBundle.isSupported = function() {
    var isSafari = uaParserResult.browser.name === "Safari";

    // Exclude mobile devices (careful: device properties aren't always defined, as in chrome for example, check mobile OS too).
    var isMobile = uaParserResult.device.type === "mobile" ||
                   uaParserResult.device.type === "tablet" ||
                   uaParserResult.device.type === "console" ||
                   uaParserResult.os.name === "Android" ||
                   uaParserResult.os.name === "iOS";

    return Hlsjs.isSupported() && !isSafari && !isMobile;
};

/**
 * We override `getBrowserName` to supply our own feature detection
 * @static
 * @override
 * @method
 */
StreamrootHlsjsBundle.getBrowserName = function() {
    return uaParserResult.browser.name;
};

export default StreamrootHlsjsBundle;
