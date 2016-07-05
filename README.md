# hlsjs-p2p-wrapper

This module wraps an instance of [`Hls.js`](https://github.com/dailymotion/hls.js) to bootstrap it with the Streamroot P2P module.

It provides a **bundle** that extends the [`Hls.js`](https://github.com/dailymotion/hls.js) constructor to create a fully configured player which will use the Streamroot P2P module, giving you the exact same API.  
You can integrate this bundle with minimal changes in your application (you only need to add an additional argument to the [`Hls.js`](https://github.com/dailymotion/hls.js) constructor).

It also provides a **wrapper** that allows you to create/configure a player with a specific version of [`Hls.js`](https://github.com/dailymotion/hls.js).

# Usage

### Pre-requisites 

First of all, make sure you are using an `npm` version > 3.x.

Since the installation uses a Ruby script, you need Ruby to be installed on your machine. On most Linux distros and on macOS, it's installed by default, but for windows you need to install it [manually](https://www.ruby-lang.org/en/).

Finally, one of the install steps assumes the presence of `wget` on your system. Again this is most likely installed on all Unix based systems. If you have a Mac, you could use [Homebrew](https://brew.sh/) and then run `brew install wget`.

### Setup

After cloning the repo, make sure that you have `grunt-cli` installed in your global node binaries and install local dependencies in the project root:

```
sudo npm install -g grunt-cli
npm install
```

### Build


#### Wrapper

Run this task to build it:
```
grunt browserify:wrapper
```

Now you can include `dist/wrapper/hlsjs-p2p-wrapper.js` in your application.

#### Bundle

Run this task to build it:
```
grunt browserify:bundle
```

Now you can include `dist/bundle/hlsjs-p2p-bundle.js` in your application.

### Tests

For running unit tests (in node.js), use

```
npm test
```

For integration tests (Running in Chrome browser via Karma through Mocha plugin), use

```
npm run karma
```

For integration tests in dev mode (Mocha suite running in your favorite browser, better for debugging): 

1. Start dev server:

```
npm start
```

2. Start compile&watch browserify process (in another shell):

```
grunt browserify:test_dev
```

3. Go to http://localhost:8080/test/html/

### Install

You can install the artifacts distributed as NPM modules:

For the wrapper with hls.js included:

```
npm install streamroot-hlsjs-p2p-bundle
```

For the wrapper without hls.js:

```
npm install streamroot-hlsjs-p2p-wrapper
```

In your application import/require the package you want to use as in the example like

```
import StreamrootHlsjsP2PBundle from 'streamroot-hlsjs-p2p-bundle';
```

or

```
import StreamrootHlsjsP2PWrapper from 'streamroot-hlsjs-p2p-wrapper';
```

### Example

#### Bundle instantiation

```javascript
// Hls constructor is overriden by including bundle
var hls = new Hls(hlsjsConfig, p2pConfig);
// Use `hls` just like your usual hls.js ...
```

#### Wrapper instantiation

```javascript
var wrapper = new StreamrootHlsjsP2PWrapper(Hls);
var hls = wrapper.createPlayer(hlsjsConfig, p2pConfig);
// Use `hls` just like your usual hls.js…
```

To see full sample code and extended possibilities of how to use this module, take a look at the code in the `example` directory.

Check the p2pConfig documentation [here](https://streamroot.readme.io/docs/p2p-config) and our recommendations about hls.js configuration [here](https://streamroot.readme.io/docs/hls-config).

### Statistics

#### Bundle

No statistics available yet.

#### Wrapper

A `stats` object is available on a `HlsjsP2PWrapper` instance and contains the following properties:

- `cdn`: cdn downloaded (cumulated bytes).
- `p2p`: p2p offloaded from cdn (cumulated bytes).
- `upload`: p2p uploaded (cumulated bytes).
- `peers`: real time connected peers count.

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
