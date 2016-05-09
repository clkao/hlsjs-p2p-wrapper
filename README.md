# Hlsjs-wrapper

This module wraps an instance of hls.js to bootstrap it with the Streamroot P2P agent module.

It provides a high-level Hls.js extended constructor to create fully configured player which will use the agent, giving you the exact same API. Which means you can integrate the wrapper player with minimal changes in your application (you only need to add an additional argument to the constructor).

It also provides a low-level wrapper that allows you to create/configure a player based on a DI'd constructor or instance so you can rule over what Hls.js version to use or initialize the player instance on your own and set an optional custom content ID.

# Usage

### Setup

After cloning the repo, make sure that you have `grunt-cli` installed in your global node binaries and install local dependencies in the project root:

```
npm install -g grunt-cli
npm install
```

**NOTE:** In case you get a 4xx error from npm when pulling optional deps, pull them using this script and everything will be OK :)

```
./install_opt_deps.sh
```

### Build

Run this task to build the distro:

```
grunt build
```

Now you can include `dist/streamroot-hlsjs-bundle` (high-level) or `dist/hlsjs-wrapper` (low-level) into your application. You can access the respective public APIs via the namespaces `StreamrootHlsjsBundle` and `StreamrootHlsjsWrapper`.

### Install

You can also include this as an NPM module:

```
//FIXME
```

### Example

High-level Hls.js extended constructor:

```
// Override Hls constructor with our bundle
var Hls = window.StreamrootHlsjsBundle;
...
var hls = new Hls(myHlsjsConfig, myStreamrootP2PConfig);
...
// Use `hls` just like your usual hls.js ...
```

Low-level wrapper for DI:

```
var wrapper = new HlsJsWrapper(Hls);
...
var hls = wrapper.createPlayer(myHlsjsConfig, myStreamrootP2PConfig, myOptionalContentId);
...
// Use `hls` just like your usual hls.js ...
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

To build and compile-watch the wrapper/bundle/example files run:

```
grunt wrapper
```

or

```
grunt bundle
```

or

```
grunt example
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

