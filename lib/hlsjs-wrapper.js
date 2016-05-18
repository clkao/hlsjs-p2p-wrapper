import defaults from 'lodash.defaults';
import PlayerBridge from './integration/player-bridge';
import MediaMap from './integration/media-map';
import SegmentView from './integration/segment-view';
import p2pLoaderGenerator from './integration/p2p-loader-generator';
import { formatContentId } from './utils';
import StreamrootPeerAgentModule from 'streamroot-p2p-dist';

let Hlsjs;

/**
 * A wrapper for creating an Hls.js player instance around the P2P agent given an injected dependency in form of a class constructor.
 * This should allow to hold a session around a particular content ID with a given player instance using the Streamroot P2P agent.
 * @class
 */
class HlsjsWrapper {

  /**
   * Constructs an instance of a StreamrootWrapper
   * @constructor
   * @param {class} hlsjsConstructor - Hls.js class constructor (dependency injection)
   */
  constructor (hlsjsConstructor) {
    Hlsjs = Hlsjs || hlsjsConstructor;
  }

  /**
   * Creates a new player configured to use this wrapper.
   * @method
   * @param {object} hlsjsConfig - Default config will be used if omitted
   * @return {Hlsjs}
   */
  newPlayer (hlsjsConfig = {}) {
    if (!Hlsjs) {
      throw new Error('Can not create Hls.js instance: dependency was not injected');
    }
    return new Hlsjs(defaults({}, this.getConfig(), hlsjsConfig));
  }

  /**
   * Creates and bootstraps a player instances configured to initialize with the Streamroot agent.
   * Starts a session on the agent via this wrapper.
   * @method
   * @param {object} hlsjsConfig - Can be null, in which case default config will be used
   * @param {object} p2pConfig - Configuration for Streamroot P2P agent
   * @param {string} contentId - Optional unique content ID for tracking (only needed when autostart enabled).
   */
  createPlayer (hlsjsConfig, p2pConfig, contentId = undefined) {
    var player = this.newPlayer(hlsjsConfig || {});
    player.on(Hlsjs.Events.MANIFEST_LOADING, () => {
        // Once the manifest is loading we know for sure that `url` will be defined
        this.startSession(player, hlsjsConfig, p2pConfig, player.url, contentId);
    });
    return player;
  }

  /**
   * Start a playback session with Hls.js using Streamroot. This is called by a handler registered via `createPlayer`. Calls `createAgent`.
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
    if (!p2pConfig || typeof p2pConfig !== 'object') {
      throw new Error('p2pConfig must be a valid config object');
    }

    var player = hlsjsPlayer || this.newPlayer(hlsjsConfig || {});

    this.createAgent(p2pConfig, hlsjsPlayer, Hlsjs.Events, contentUrl, contentId);

    return player;
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
  createAgent (p2pConfig, hlsjsPlayer, hlsEventsEnum, url = undefined, contentId = undefined) {
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

    const playerBridge = new PlayerBridge(hlsjsPlayer, hlsEventsEnum, p2pConfig, onDispose.bind(this));
    const content = formatContentId({ contentUrl, contentId });
    const mediaMap = new MediaMap(hlsjsPlayer);

    this.peerAgentModule = new StreamrootPeerAgentModule(playerBridge, content, mediaMap, p2pConfig, SegmentView);
  }

  /**
   * Same functionnality as createAgent `createAgent` but doesn't accept a `contentUrl` parameter.
   * Always expects player `url` property to be set (see note on `createAgent`).
   * @method
   * @deprecated Use `createAgent` in future integrations.
   * @param {object} p2pConfig - P2P agent configuration
   * @param {object} hlsjsPlayer - Hls.js configuration
   * @param {enum} hlsEventsEnum - Hls.js events enumeration
   * @param {string} contentId - Optional content ID to use by tracker
   *
   */
  createSRModule (p2pConfig, hlsPlayer, hlsEventsEnum, contentId = undefined) {
    this.createAgent(p2pConfig, hlsPlayer, hlsEventsEnum, null, contentId);
  }

  /**
   *
   *
   */
  get P2PLoader () {
    return p2pLoaderGenerator(this);
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
   * Indicates wether there is an existing agent instance alive.
   * @method
   * @return {boolean} True when there is an existing session
   */
  hasSession () {
    return !!this.peerAgentModule;
  }

  /**
   * Returns the peer agent instance. Shorthand for `HlsjsWrapper.peerAgentModule` for client components.
   * @method
   * @return {PeerAgentModule}
   */
  getAgent () {
    return this.peerAgentModule;
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
   * The stats stored by the Streamroot agent about environment state and P2P/CDN traffic.
   * @method
   * @return {object} An object containing statistics info (has fields `p2p`, `cdn` and `peerCount`).
   */
  get stats () {
    if (!window.SR_DISPLAY_INTERFACE || !window.SR_DISPLAY_INTERFACE.getStats) {
      return {};
    }

    let stats = window.SR_DISPLAY_INTERFACE.getStats();
    return {
      p2p: stats.download.p2pDownloadedNewAnalytics,
      cdn: stats.download.cdnDownloaded,
      peerCount: stats.peers.count
    };
  }
}

/* Private functions */

/**
 * Disposes the agent instance.
 */
function onDispose () {
  this.stopSession();
}

export default HlsjsWrapper;
