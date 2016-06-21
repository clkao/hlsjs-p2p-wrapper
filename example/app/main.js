import HlsjsWrapper from '../../dist/wrapper/hlsjs-p2p-wrapper-common';
import Hls from 'hls.js';

window.CreatePlayer = function(hlsjsConfig, p2pConfig) {

	return (new HlsjsWrapper(Hls)).createPlayer(hlsjsConfig || {}, p2pConfig);

}

window.Hls = Hls;