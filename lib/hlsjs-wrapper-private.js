import defaults from 'lodash.defaults';
import PlayerInterface from './integration/player-interface';
import MediaMap from './integration/mapping/media-map';
import SegmentView from './integration/mapping/segment-view';
import p2pLoaderGenerator from './integration/p2p-loader-generator';
import { formatContentId } from './utils';

/**
 * A wrapper for creating an Hls.js player instance around the P2P agent given an injected dependency in form of a class constructor.
 * This should allow to hold a session around a particular content ID with a given player instance using the Streamroot P2P agent.
 * @class
 */
class HlsjsWrapperPrivate {

  /**
   * Constructs an instance of a StreamrootWrapper
   * @constructor
   * @param {class} hlsjsConstructor - Hls.js class constructor (dependency injection)
   */
  constructor (hlsjsConstructor, peerAgentModuleConstructor) {
    if (!peerAgentModuleConstructor) {
        throw new Error('Constructor needs DI of PeerAgent');
    }
    this.Hlsjs = hlsjsConstructor; // If this is not defined when we need it we'll throw an error at that point
                              // We don't need to DI this constructor when using the `createSRModule` legacy method
    this.StreamrootPeerAgentModule = peerAgentModuleConstructor;
  }

  /**
   * Creates and bootstraps a player instances configured to initialize with the Streamroot agent.
   * Starts a session on the agent via this wrapper.
   * @method
   * @param {object} hlsjsConfig - Can be null, in which case default config will be used
   * @param {object} p2pConfig - Configuration for Streamroot P2P agent
   * @param {string} contentId - Optional unique content ID for tracking (only needed when autostart enabled).
   */
  createPlayer (hlsjsConfig, p2pConfig, contentId = null) {
    const Hlsjs = this.Hlsjs;
    let player = this.newPlayer(hlsjsConfig || {});
    player.on(Hlsjs.Events.MANIFEST_LOADING, () => {
        // Once the manifest is loading we know for sure that `url` will be defined
        this.startSession(player, hlsjsConfig, p2pConfig, player.url, contentId);
    });
    return player;
  }

  /**
   * Same functionnality as createPeerAgent `createPeerAgent` but doesn't accept a `contentUrl` parameter.
   * Always expects player `url` property to be set (see note on `createPeerAgent`).
   * @method
   * @deprecated Use `createPeerAgent` in future integrations.
   * @param {object} p2pConfig - P2P agent configuration
   * @param {object} hlsjsPlayer - Hls.js configuration
   * @param {enum} hlsEventsEnum - Hls.js events enumeration
   * @param {string} contentId - Optional content ID to use by tracker
   *
   */
  createSRModule (p2pConfig, hlsPlayer, hlsEventsEnum, contentId = null) {
    this.createPeerAgent(p2pConfig, hlsPlayer, hlsEventsEnum, null, contentId);
  }

  /**
   *
   *
   */
  get P2PLoader () {
    return p2pLoaderGenerator(this);
  }

  /**
   * Default configuration for Hls.js using Streamroot P2P agent
   * @return {object} Hls.js configuration
   */
  getConfig () {
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
  onDispose () {
    this.stopSession();
  }

  /**
  * Stop the current session. Disposes the SRModule instance.
  * Usually disposal is called-back automatically by the player bridge.
  * @method
  */
  stopSession () {
    if (!this.peerAgentModule) {
      return;
    }


    this.peerAgentModule.dispose();
    delete this.peerAgentModule;
  }

  /**
  * Start a playback session with Hls.js using Streamroot. This is called by a handler registered via `createPlayer`. Calls `createPeerAgent`.
  * Every wrapper owns one playback session (player instance) at a time (one instance of a Streamroot module).
  * This expects you to pass in the `contentUrl`
  * @method
  * @param {hls} hlsjsPlayer - hls.js player instance (optional). When `null` will create player with config provided.
  * @param {object} hlsjsConfig - Can be null, in which case default config will be used
  * @param {object} p2pConfig - Client specific P2P configuration.
  * @param {string} contentUrl - URI of the content we will use the player with
  * @param {string} contentId - Optional unique content ID (required by Streamroot tracking technology).
  * @return {Hlsjs} Player instance that we are using.
  */
  startSession (hlsjsPlayer, hlsjsConfig, p2pConfig, contentUrl, contentId = undefined) {
    const Hlsjs = this.Hlsjs;
    if (!p2pConfig || typeof p2pConfig !== 'object') {
      throw new Error('p2pConfig must be a valid config object');
    }

    var player = hlsjsPlayer || this.newPlayer(hlsjsConfig || {});

    this.createPeerAgent(p2pConfig, hlsjsPlayer, Hlsjs.Events, contentUrl, contentId);

    return player;
  }

  /**
   * Creates a new player configured to use this wrapper.
   * @method
   * @param {object} hlsjsConfig - Default config will be used if omitted
   * @return {Hlsjs}
   */
  newPlayer (hlsjsConfig = {}) {
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
  hasSession () {
    return !!this.peerAgentModule;
  }

  /**
   * Creates the internal P2P agent instance. Only use this method directly if you want to create and inject the player instance
   * on your own with the respective Hls.js events enum. Otherwise you can just inject the Hls.js dependency in the constructor,
   * and use `startSession` or `createPlayer`. This will be called by `startSession` (and `createPlayer` indirectly).
   * Note: When contentUrl is not passed, this function expect the player instance `url` property to be defined (we will throw an error if its not).
   *       Therefore it should only be called once the player has been initialized to this point (loading resources from a specific URI).
   *       Use `createPlayer` if you don't want to deal with this level of complexity.
   * @method
   * @param {object} p2pConfig - P2P agent configuration
   * @param {object} hlsjsPlayer - Hls.js configuration
   * @param {enum} hlsEventsEnum - Hls.js events enumeration
   * @param {string} contentUrl - URL of content player will use
   * @param {string} contentId - Optional content ID to use by tracker
   *
   */
  createPeerAgent (p2pConfig, hlsjsPlayer, hlsEventsEnum, url = null, contentId = null) {
    const StreamrootPeerAgentModule = this.StreamrootPeerAgentModule;

    if (this.hasSession()) {
      throw new Error('Streamroot session already started');
    }

    const contentUrl = url || hlsjsPlayer.url;
    if (!contentUrl) {
      throw new Error('Hls.js player instance must have valid `url` property or `contentUrl` must be passed');
    }

    if (!hlsEventsEnum) {
      throw new Error('Need valid Hls.js Events enumeration');
    }

    const playerBridge = new PlayerInterface(hlsjsPlayer, hlsEventsEnum, p2pConfig, this.onDispose.bind(this));
    const content = formatContentId({ contentUrl, contentId });
    const mediaMap = new MediaMap(hlsjsPlayer);

    this.peerAgentModule = new StreamrootPeerAgentModule(playerBridge, content, mediaMap, p2pConfig, SegmentView);
  }
}

export default HlsjsWrapperPrivate;
