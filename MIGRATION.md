# How to migrate from v2.x to v3.x

For the Hls bundle nothing changes. You can still construct a player like before with it, and passing P2P config as second parameter.

This is the legacy v2 way of configuring a player to use Streamroot using the wrapper directly:

```
// Create plain wrapper without dependency injection (legacy way)
const wrapper = new HlsjsP2PWrapper();

// Create Hls.js instance your way
let hls = new Hls({
	fLoader: wrapper.P2PLoader
});

let p2pConfig = {
	streamrootKey: "my-streamroot-key"
};
let contentId = "myCustomContentId";  // Optional contentId

hls.on(Hls.Events.MANIFEST_LOADING, (event, data) => {
    wrapper.createSRModule(p2pConfig, hls, Hls.Events, contentId);
});

hls.loadSource(contentUrl);
hls.attachMedia(video);
hls.on(Hls.Events.MANIFEST_PARSED,function() {
    video.play();
});
```

This is still supported in v3 but is deprecated. Please migrate as soon as possible and use the v3 API:

```
let hls;
let video = document.getElementById('video');

// Create wrapper where we dependency-inject the Hls.js constructor (in this example we use the one provided by the bundle)
let wrapper = new HlsjsP2PWrapper(Hls);

let p2pConfig = {
	streamrootKey: "my-streamroot-key",
	contentId: "myCustomContentId"  // Optional contentId now passed as a property of p2pConfig
};

// To create a new configured default player using the wrapper toolkit
hls = wrapper.createPlayer(hlsjsConfig, p2pConfig);

hls.loadSource(config.contentUrl);
hls.attachMedia(video);
hls.on(Hls.Events.MANIFEST_PARSED,function() {
    video.play();
});
```

Note that the Hls.js dependency is now injected in the wrapper at construction, leaving you only to pass config values to the wrapper when creating a player. 

Instead of creating an Hls.js instance on your side and having to create the peer-agent instance later, the new API will to factor an instance that is ready to go. This means that it is not necessary to pass a config overriding explicitly `fLoader`. The wrapper takes care of that internally, and of any other eventually necessary config overrides.

So it is not necessary anymore to create the module on manifest loading. This part is now done internally by the wrapper. The `createSRModule` method is deprecated. If you use the `createPlayer` function, don't call `createSRModule` at all. The wrapper will throw an error as a session is already initialized.

IMPORTANT: If you are still deciding to use the legacy mode, and are overriding the config on your side, please make sure to always use `fLoader` (NOT `loader`) when passing the Streamroot P2P-loader. Not using `fLoader` will result in runtime errors. 

###### NOTE:

You can still pass a custom `contentId` but in v3 you have to pass it as a [p2pConfig](https://streamroot.readme.io/docs/p2p-config) property instead of an additional optional argument of `createSRModule` (which is deprecated).


