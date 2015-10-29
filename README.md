# Hlsjs-wrapper

This module wraps an instance of hls.js to interface it with streamroot-p2p

** IMPORTANT: ** it's better to use babel-runtime when building this module. It makes use of Object.assign, and IE11 reports error due to the use of Symbol, although we don't make use of them