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

The first difference lies in the fact that the Hls.js dependency is injected in the wrapper at construction, leaving you only to pass config values to the wrapper when creating a player. 

Instead of creating an Hls.js instance your side and having to create the peer-agent instance later, the new API features a player factory.

So it is not necessary anymore to create the module on manifest loading. This part is now done internally by the wrapper. The `createSRModule` method is deprecated. If you use the `createPlayer` function, don't call `createSRModule` at all. The wrapper will throw an error as a session is already initialized.

###### NOTE:

You can still pass a custom `contentId` but in v3 you have to pass it as a [p2pConfig](https://streamroot.readme.io/docs/p2p-config) property instead of an additional optional argument of `createSRModule` (which is deprecated).


