#!/usr/bin/ruby

require 'json'

# Updates the Hls.js demo based on the supported version

PACKAGE = File.read('package.json')
PACKAGE_HASH = JSON.parse(PACKAGE)
VERSION = PACKAGE_HASH['dependencies']['hls.js']

FILENAME = "v#{VERSION}.tar.gz"
DEMO_DIR = "demo-hls.js"

`mkdir -p #{DEMO_DIR}`
`cd #{DEMO_DIR} && rm -Rf *`
`cd #{DEMO_DIR} && wget https://github.com/dailymotion/hls.js/archive/#{FILENAME}`
`cd #{DEMO_DIR} && tar -xzvf #{FILENAME}`
`cd #{DEMO_DIR} && cp hls.js-#{VERSION}/demo/* .`
`cd #{DEMO_DIR} && rm -Rf hls.js-#{VERSION}`
`cd #{DEMO_DIR} && rm #{FILENAME}`

# In case this conflicts the patch script has to be updated coherently!

DEMO_INDEX = "#{DEMO_DIR}/index.html"

OLD_CONSTRUCTOR = 'hls = new Hls({debug:true, enableWorker : enableWorker, defaultAudioCodec : defaultAudioCodec});'
NEW_CONSTRUCTOR = 'hls = new Hls({debug:true, enableWorker : enableWorker, defaultAudioCodec : defaultAudioCodec}, {streamrootKey: "ry-v7xuywnt", debug: true});'

OLD_SCRIPT = '<script src="../dist/hls.js"></script>'
NEW_SCRIPT = '<script src="../dist/bundle/streamroot-hlsjs-bundle.js"></script>'

INDEX = File.read(DEMO_INDEX)

NEW_INDEX = INDEX.gsub(OLD_CONSTRUCTOR, NEW_CONSTRUCTOR).gsub(OLD_SCRIPT, NEW_SCRIPT)

# To write changes to the file, use:
File.open(DEMO_INDEX, "w") {|file| file.puts NEW_INDEX }


