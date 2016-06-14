# hlsjs-p2p-wrapper

This module wraps an instance of hls.js to bootstrap it with the Streamroot P2P agent module.

It provides a high-level Hls.js extended constructor to create fully configured player which will use the agent, giving you the exact same API. Which means you can integrate the wrapper player with minimal changes in your application (you only need to add an additional argument to the constructor).

It also provides a low-level wrapper that allows you to create/configure a player based on a DI'd constructor or instance so you can rule over what Hls.js version to use or initialize the player instance on your own and set an optional custom content ID.

# Usage

### Pre-requisites 

Since the installation uses a Ruby script, you need Ruby to be installed on your machine. On most Linux distros and on Mac OSX, it's installed by default, but for windows you need to install it [manually](https://www.ruby-lang.org/en/).


### Setup

After cloning the repo, make sure that you have `grunt-cli` installed in your global node binaries and install local dependencies in the project root:

```
npm install -g grunt-cli
npm install
```

### Build


Run this task to build the distro:

```
grunt build
```

Now you can include `dist/bundle/hlsjs-p2p-bundle.js` (high-level) or `dist/wrapper/hlsjs-p2p-wrapper` (low-level) into your application. You can access the respective public APIs via the namespace `StreamrootHlsjsP2PWrapper`.

### Tests

For node tests, run

```
npm test
```

For automated browser tests, run

```
npm run karma
```

For browser tests in dev mode, start a server in the project root, then run

```
grunt browserify:test_dev
```

Now go to http://localhost:8080/test/html/

### Install

You can install the artifacts distributed as NPM modules:

For the wrapper with hls.js included:

```
npm install hlsjs-p2p-bundle
```

For the wrapper without hls.js:

```
npm install hlsjs-p2p-wrapper
```

In your application import/require the package you want to use as in the example like

```
import StreamrootHlsjsP2PBundle from 'hlsjs-p2p-bundle';
```

or

```
import StreamrootHlsjsP2PWrapper from 'hlsjs-p2p-wrapper';
```

### Example

High-level Hls.js extended constructor:

```javascript
// Hls constructor is overriden by including bundle
var hls = new Hls(myHlsjsConfig, myStreamrootP2PConfig);
// Use `hls` just like your usual hls.js ...
```

Low-level wrapper for direct instanciation:

```javascript
var wrapper = new HlsjsP2PWrapper(Hls);
var hls = wrapper.createPlayer(myHlsjsConfig, myStreamrootP2PConfig);
// Use `hls` just like your usual hls.js…
```

To see full sample code and extended possibilites of how to use this module, take a look at `example/main.js`.

### Run demos

To build and run the shipped Hls.js and Streamroot demos run:

```
grunt demo
```

This will start a server.

Go to <http://localhost:8080/example> for the Streamroot demo.

Go to <http://localhost:8080/demo> for the Hls.js demo.

### API docs

The public API documentation is generated from the code.

After clonig the repo run:

```
grunt docs
```

This will start a server. Go to <http://localhost:8080/docs>

### Development

Make sure to have run `npm install` at least once.

To build and compile-watch the example files run:

```
grunt browserify:bundle_dev
```

or

```
grunt browserify:wrapper_dev
```


**NOTE:** it's better to use `babel-runtime` when building this module. It makes use of Object.assign, and IE11 reports error due to the use of Symbol, although we don't make use of them


# Important notes

### Hls.js xhrSetup, cookies and headers

In Hls.js config, `xhrSetup` is broken by this wrapper. The reason is that we override the loader for fragments, and this loader does not use XHR directly. Thus we throw if `xhrSetup` is defined.

However, we think that the overwhelming majority of the xhr configuration developpers need to do is:
- enable use of cookies
- set custom headers

We introduced a custom object in hls.js configuration object for that purpose:

```javascript
var hlsjsConfig = {
  // ... ,
  request: {
    withCredentials: true, // true | false.
    headers: {
        'X-CUSTOM-HEADER-1': value1,
        'X-CUSTOM-HEADER-2': value2
        // List of headers you want to set for your requests
    }
  },
  // ... ,
}

```

### Content identifier

:warning: If you plan on using the optionnal content identifier, you must be careful about several things:
- You should be really careful that you pass a string that identifies a content in a truly unique manner. If there's a collision, our backend is going to match peers that aren't watching the same content together, and that can lead to unpredicable results.


- Furthermore, you should be careful that we need a content identified by the same id to be **packaged** in the exact same way. If you are packaging your content in an origin server, and using your edge servers merely as cache servers, you're fine. If your edge servers are doing the packaging, as can happen with some Wowza or Nimble configurations for example, then you shouldn't identify contents coming from different edge servers as being the same content. It is advised then that you don't set this optionnal parameter and that you use the default (full url without the query string).


- Be careful about elements non-related to the content in your id. For example, if you derive your content id from its url, and you have a user specific token in your query string, you're going to have to strip that token from the id. Same thing if you have query parameters identifying the device, you'll want to remove them if your content is package the same for all devices (but keep it if the content is different for mobile and desktop for example).

