# Hlsjs-wrapper

This module wraps an instance of hls.js to interface it with streamroot-p2p

** IMPORTANT: ** it's better to use babel-runtime when building this module. It makes use of Object.assign, and IE11 reports error due to the use of Symbol, although we don't make use of them

# Usage

### API (TODO)

##### Constructor

Initialize this module by passing the original XhrLoader in the constructor. This module will build a p2p-enabled loader class (see lib/p2p-loader-factory.js) and expose it.

The instance will have the following properties:

##### P2Ploader

This is the constructor you need to override `loader`in `hls.config`.

##### setRange

Use this method as `xhrSetup` in `hls.config`.

##### createSRModule(p2pConfig, hls, Events)

Use this method to actually instantiate the p2p module, on `Hls.Events.MANIFEST_LOADING`.

parameter | description
----------|--------------
p2pConfig | Your p2p module configuration object. Check out the doc [here](https://streamroot.readme.io/docs/p2p-config)
hls       | Your instance of hls.js
Events | The Hls.Events enum


### Example

```javascript
import HlsjsWrapper from "hlsjs-wrapper";
import Hls from "hls.js";
import XhrLoader from '../../node_modules/hls.js/src/utils/xhr-loader.js';

// ...
// ...
// ...

var hlsConfig = {},
    p2pConfig = {
        streamrootKey: 'your-streamroot-key'
    };


var hlsjsWrapper = new HlsjsWrapper(XhrLoader);

hlsConfig.loader = hlsjsWrapper.P2PLoader;
hlsConfig.xhrSetup = hlsjsWrapper.setRange;

//Set buffer configuration params, unless they're specified
hlsConfig.maxBufferSize = hlsConfig.maxBufferSize || 0;
hlsConfig.maxBufferLength = hlsConfig.maxBufferLength || 30;

var hls = new Hls(hlsConfig);

hls.on(Hls.Events.MANIFEST_LOADING, (event, data) => {
    hlsjsWrapper.createSRModule(p2pConfig, hls, Hls.Events);
});
```
