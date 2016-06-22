import HlsjsWrapper from '../../lib-es5/hlsjs-p2p-wrapper';
import Hls from 'hls.js';

window.CreatePlayer = function(hlsjsConfig, p2pConfig) {

	return (new HlsjsWrapper(Hls)).createPlayer(hlsjsConfig || {}, p2pConfig);

}

window.Hls = Hls;