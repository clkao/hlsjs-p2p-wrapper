import HlsjsP2PWrapper from '../../dist/wrapper/hlsjs-p2p-wrapper';
import Hls from 'hls.js';

window.CreatePlayer = function(hlsjsConfig, p2pConfig) {

	return (new HlsjsP2PWrapper(Hls)).createPlayer(hlsjsConfig || {}, p2pConfig);

}

window.Hls = Hls;