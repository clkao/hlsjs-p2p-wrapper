import defaults from 'lodash.defaults';
import PlayerInterface from './integration/player-interface';
import MediaMap from './integration/mapping/media-map';
import SegmentView from './integration/mapping/segment-view';
import p2pLoaderGenerator from './integration/p2p-loader-generator';

/**
 * A wrapper for creating an Hls.js media engine instance around the P2P agent given an injected dependency in form of a class constructor.
 * This should allow to hold a session around a particular content ID with a given media engine instance using the Streamroot P2P agent.
 * @class
 */
class HlsjsP2PWrapperPrivate {

    /**
     * Constructs an instance of a StreamrootWrapper
     * @constructor
     * @param {class} hlsjsConstructor - Hls.js class constructor (dependency injection)
     */
    constructor(hlsjsConstructor, peerAgentModuleConstructor) {
        if (!peerAgentModuleConstructor) {
            throw new Error('Constructor needs DI of PeerAgent');
        }
        this.Hlsjs = hlsjsConstructor; // If this is not defined when we need it we'll throw an error at that point
        // We don't need to DI this constructor when using the `createSRModule` legacy method
        this.StreamrootPeerAgentModule = peerAgentModuleConstructor;
    }

    /**
     * Creates and bootstraps a media engine instances configured to initialize with the Streamroot agent.
     * Starts a session on the agent via this wrapper.
     * @method
     * @param {object} hlsjsConfig - Can be null, in which case default config will be used
     * @param {object} p2pConfig - Configuration for Streamroot P2P agent
     */
    createMediaEngine(hlsjsConfig, p2pConfig) {
        const Hlsjs = this.Hlsjs;
        let mediaEngine = this.newMediaEngine(hlsjsConfig || {});
        mediaEngine.on(Hlsjs.Events.MANIFEST_LOADING, () => {
            // Once the manifest is loading we know for sure that `url` will be defined
            this.startSession(mediaEngine, hlsjsConfig, p2pConfig, mediaEngine.url);
        });
        return mediaEngine;
    }

    /**
     * Alias for createMediaEngine
     * @method
     *
     */
    createPlayer(hlsjsConfig, p2pConfig) { return this.createMediaEngine(hlsjsConfig, p2pConfig); }

    /**
     * Same functionnality as createPeerAgent `createPeerAgent` but doesn't accept a `contentUrl` parameter.
     * Always expects mediaEngine `url` property to be set (see note on `createPeerAgent`).
     * @method
     * @deprecated Use `createPeerAgent` in future integrations.
     * @param {object} p2pConfig - P2P agent configuration
     * @param {object} hlsjs - Hls.js instance
     * @param {enum} hlsEventsEnum - Hls.js events enumeration
     * @param {string} contentId - Optional content ID to use by tracker
     *
     */
    createSRModule(p2pConfig, mediaEngine, hlsEventsEnum, contentId = null) {
        p2pConfig.contentId = contentId; // Keep contentId in createSRModule signature for retrocompatibility, and add it in p2pConfig
        this.createPeerAgent(p2pConfig, mediaEngine, hlsEventsEnum, null);
    }

    /**
     *
     *
     */
    get P2PLoader() {
        return p2pLoaderGenerator(this);
    }

    /**
     * Default configuration for Hls.js using Streamroot P2P agent
     * @return {object} Hls.js configuration
     */
    getConfig() {
        return {
            // Overload the default fLoader (media fragment loading interface) with our implementation
            // NOTICE: We don't want to use the plain 'loader' in the hls.js config as this will also
            // be the loader for playlist and encryption key resources, which are not supposed to be
            // fetched via the Streamroot module (you've been warned: don't do this - it is known to cause serious trouble!).
            fLoader: p2pLoaderGenerator(this),
            maxBufferSize: 0,
            maxBufferLength: 30
        };
    }

    /**
     * Disposes the agent instance.
     */
    onDispose() {
        this.stopSession();
    }

    /**
     * Stop the current session. Disposes the SRModule instance.
     * Usually disposal is called-back automatically by the mediaEngine bridge.
     * @method
     */
    stopSession() {
        if (!this.peerAgentModule) {
            return;
        }


        this.peerAgentModule.dispose();
        delete this.peerAgentModule;
    }

    /**
     * Start a playback session with Hls.js using Streamroot. This is called by a handler registered via `createMediaEngine`. Calls `createPeerAgent`.
     * Every wrapper owns one playback session (media engine instance) at a time (one instance of a Streamroot module).
     * This expects you to pass in the `contentUrl`
     * @method
     * @param {hls} hlsjs - hls.js media engine instance (optional). When `null` will create mediaEngine with config provided.
     * @param {object} hlsjsConfig - Can be null, in which case default config will be used
     * @param {object} p2pConfig - Client specific P2P configuration.
     * @param {string} contentUrl - URI of the content we will use the mediaEngine with
     * @return {Hlsjs} Media engine instance that we are using.
     */
    startSession(hlsjs, hlsjsConfig, p2pConfig, contentUrl) {
        const Hlsjs = this.Hlsjs;
        if (!p2pConfig || typeof p2pConfig !== 'object') {
            throw new Error('p2pConfig must be a valid config object');
        }

        var mediaEngine = hlsjs || this.newMediaEngine(hlsjsConfig || {});

        this.createPeerAgent(p2pConfig, hlsjs, Hlsjs.Events, contentUrl);

        return mediaEngine;
    }

    /**
     * Creates a new media engine configured to use this wrapper.
     * @method
     * @param {object} hlsjsConfig - Default config will be used if omitted
     * @return {Hlsjs}
     */
    newMediaEngine(hlsjsConfig = {}) {
        const Hlsjs = this.Hlsjs;
        if (!Hlsjs) {
            throw new Error('Can not create Hls.js instance: dependency was not injected');
        }
        if (hlsjsConfig.fLoader) {
            throw new Error('`fLoader` in Hls.js config must not be defined');
        }
        return new Hlsjs(defaults({}, this.getConfig(), hlsjsConfig));
    }

    /**
     * Indicates wether there is an existing agent instance alive.
     * @method
     * @return {boolean} True when there is an existing session
     */
    hasSession() {
        return !!this.peerAgentModule;
    }

    /**
     * Creates the internal P2P agent instance. Only use this method directly if you want to create and inject the media engine instance
     * on your own with the respective Hls.js events enum. Otherwise you can just inject the Hls.js dependency in the constructor,
     * and use `startSession` or `createMediaEngine`. This will be called by `startSession` (and `createMediaEngine` indirectly).
     * Note: When contentUrl is not passed, this function expect the media engine instance `url` property to be defined (we will throw an error if its not).
     *       Therefore it should only be called once the media engine has been initialized to this point (loading resources from a specific URI).
     *       Use `createMediaEngine` if you don't want to deal with this level of complexity.
     * @method
     * @param {object} p2pConfig - P2P agent configuration
     * @param {object} hlsjs - Hls.js configuration
     * @param {enum} hlsEventsEnum - Hls.js events enumeration
     * @param {string} contentUrl - URL of content media engine will use
     *
     */
    createPeerAgent(p2pConfig, hlsjs, hlsEventsEnum, url = null) {
        const StreamrootPeerAgentModule = this.StreamrootPeerAgentModule;
        const streamType = StreamrootPeerAgentModule.StreamTypes.HLS;
        const integrationVersion = 'v1';

        if (this.hasSession()) {
            throw new Error('Streamroot session already started');
        }

        const contentUrl = url || hlsjs.url;
        if (!contentUrl) {
            throw new Error('Hls.js instance must have valid `url` property or `contentUrl` must be passed');
        }

        if (!hlsEventsEnum) {
            throw new Error('Need valid Hls.js Events enumeration');
        }

        // attach error handling to media engine
        hlsjs.on(hlsEventsEnum.ERROR, this.onMediaEngineError);

        const playerBridge = new PlayerInterface(hlsjs, hlsEventsEnum, p2pConfig, this.onDispose.bind(this));
        const mediaMap = new MediaMap(hlsjs);

        this.peerAgentModule = new StreamrootPeerAgentModule(playerBridge, contentUrl, mediaMap, p2pConfig, SegmentView, streamType, integrationVersion);
    }

    onMediaEngineError(event, data) {
        /* eslint no-unused-vars: ["error", { "varsIgnorePattern": "event" }] */
        if (data.fatal) {
            console.error('Hls.js fatal error: ' + data.type + ' - ' + data.details);
        } else {
            console.warn('Hls.js non-fatal error: ' + data.type + ' - ' + data.details);
        }
    }
}

export default HlsjsP2PWrapperPrivate;
