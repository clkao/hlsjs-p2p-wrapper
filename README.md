# Hlsjs-wrapper

This module wraps an instance of hls.js to interface it with streamroot-p2p

** IMPORTANT: ** it's better to use babel-runtime when building this module. It makes use of Object.assign, and IE11 reports error due to the use of Symbol, although we don't make use of them

# Usage

### API

##### Constructor

The constructor expects the constructor of the Streamroot module as argument.

The instance will have the following properties:

##### P2Ploader

This is the constructor you need to override `loader`in `hls.config`.

##### createSRModule(p2pConfig, hls, Events [, content] )

Use this method to actually instantiate the p2p module, on `Hls.Events.MANIFEST_LOADING`.

parameter | description
----------|--------------
p2pConfig | Your p2p module configuration object. Check out the doc [here](https://streamroot.readme.io/docs/p2p-config)
hls       | Your instance of hls.js
Events | The Hls.Events enum
content | _(optionnal)_ a unique string identifier for your content. See [important notes on this parameter](https://github.com/streamroot/hlsjs-wrapper/blob/master/README.md#content-identifier) before using it.


### Example

```javascript
import HlsjsWrapper from "hlsjs-wrapper";
import Hls from "hls.js";
import StreamrootDownloader from "streamroot-p2p-dist";

// ...
// ...
// ...

var hlsConfig = {},
    p2pConfig = {
        streamrootKey: 'your-streamroot-key'
    };


var hlsjsWrapper = new HlsjsWrapper(StreamrootDownloader);

// Overload the default fLoader (media fragment loading interface) with our implementation
// NOTICE: We don't want to use the plain 'loader' in the hls.js config as this will also 
// be the loader for playlist and encryption key resources, which are not supposed to be 
// fetched via the Streamroot module (you've been warned: don't do this - it is known to cause serious trouble!).
hlsConfig.fLoader = hlsjsWrapper.P2PLoader;

//Set buffer configuration params, unless they're specified
hlsConfig.maxBufferSize = hlsConfig.maxBufferSize || 0;
hlsConfig.maxBufferLength = hlsConfig.maxBufferLength || 30;

var hls = new Hls(hlsConfig);

hls.on(Hls.Events.MANIFEST_LOADING, (event, data) => {
    hlsjsWrapper.createSRModule(p2pConfig, hls, Hls.Events);
});
```

# Important notes

### xhrSetup, cookies and headers

`config.xhrSetup` is broken by this wrapper. The reason is that we override the loader for fragments, and this loader does not use xhr directly. Thus we throw if `xhrSetup` is defined.

However, we think that the overwhelming majority of the xhr configuration developpers need to do is:
- enable use of cookies
- set custom headers

We introduced a custom object in hls.js configuration object for that purpose:

```javascript
var hlsjsConfig = {
  // ... ,
  request: {
    withCredentials: true, // true | false.
    headers: [ ["X-CUSTOM-HEADER-1", value1], ["X-CUSTOM-HEADER-2", value2] ] // List of headers you want to set for your requests
  },
  // ... ,
}

```

### Content identifier

:warning: If you plan on using the optionnal content identifier, you must be careful about several things:
- You should be really careful that you pass a string that identifies a content in a truly unique manner. If there's a collision, our backend is going to match peers that aren't watching the same content together, and that can lead to unpredicable results.


- Furthermore, you should be careful that we need a content identified by the same id to be **packaged** in the exact same way. If you are packaging your content in an origin server, and using your edge servers merely as cache servers, you're fine. If your edge servers are doing the packaging, as can happen with some Wowza or Nimble configurations for example, then you shouldn't identify contents coming from different edge servers as being the same content. It is advised then that you don't set this optionnal parameter and that you use the default (full url without the query string).


- Be careful about elements non-related to the content in your id. For example, if you derive your content id from its url, and you have a user specific token in your query string, you're going to have to strip that token from the id. Same thing if you have query parameters identifying the device, you'll want to remove them if your content is package the same for all devices (but keep it if the content is different for mobile and desktop for example).

