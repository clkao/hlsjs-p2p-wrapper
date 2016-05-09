import StreamrootHlsjsBundle from '../lib/streamroot-hlsjs-bundle-dev';

let config = window.config;

window.addEventListener("load", () => {

	const bundle = new StreamrootHlsjsBundle();
	const Hls = StreamrootHlsjsBundle.Hlsjs;
    const config = window.streamrootConfig;

    if (!config) {
        throw new Error('Streamroot config is not set');
    }

    if(Hls.isSupported()){
        var video = document.getElementById('video');

        // To create a new configured default player using the bundle toolkit
    	var hls = bundle.createPlayer(config.p2pConf, config.hlsjsConfig, config.contentId);

        // Use this if you eventually want to inject your own created Hls.js player instance.
        // If you pass `null` as first argument, the same player as above will be created and returned.
        // var hls = bundle.startSession(null, config.p2pConf, config.contentUrl, config.contentId);

        hls.loadSource(config.contentUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
            video.play();
        });
    }
});
