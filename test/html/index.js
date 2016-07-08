window._DEBUG_ = true;
window._TEST_ = true;
window._ENVIRONMENT_ = 'development';

require("babel-polyfill");
require("xhr-shaper");

require("./p2p-loader-generator");
require("./bundle");
require("./wrapper");