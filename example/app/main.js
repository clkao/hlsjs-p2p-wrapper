import HlsjsWrapper from '../../dist/wrapper/hlsjs-p2p-wrapper';
import Hls from 'hls.js';

window.StartApp = function(hlsjsConfig, p2pConfig) {

	(new HlsjsP2PWrapper(Hls)).createPlayer(hlsjsConfig || {}, p2pConfig);

}