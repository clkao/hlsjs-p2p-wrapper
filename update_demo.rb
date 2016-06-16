#!/usr/bin/env ruby

require 'json'

# Updates the Hls.js demo based on the supported version

CURRENT_FOLDER = File.expand_path(File.dirname(__FILE__))

PACKAGE = File.read(File.join(CURRENT_FOLDER, 'package.json'))
PACKAGE_HASH = JSON.parse(PACKAGE)
VERSION = PACKAGE_HASH['dependencies']['hls.js']

FILENAME = "v#{VERSION}.tar.gz"
DEMO_DIR = File.join(CURRENT_FOLDER, "demo-hls.js")

Dir.chdir(CURRENT_FOLDER)

`mkdir -p #{DEMO_DIR}`

Dir.chdir(DEMO_DIR)

`rm -Rf *`
`wget https://github.com/dailymotion/hls.js/archive/#{FILENAME}`
`tar -xzvf #{FILENAME}`
`cp hls.js-#{VERSION}/demo/* .`
`rm -Rf hls.js-#{VERSION}`
`rm #{FILENAME}`

# In case this conflicts the patch script has to be updated coherently!

DEMO_INDEX = "#{DEMO_DIR}/index.html"

OLD_CONSTRUCTOR = 'hls = new Hls({debug:true, enableWorker : enableWorker, defaultAudioCodec : defaultAudioCodec});'
NEW_CONSTRUCTOR = 'hls = new Hls({debug:true, enableWorker : enableWorker, defaultAudioCodec : defaultAudioCodec}, {streamrootKey: "ry-v7xuywnt", debug: true});'

OLD_SCRIPT = '<script src="../dist/hls.js"></script>'
NEW_SCRIPT = '<script src="../dist/bundle/hlsjs-p2p-bundle.js"></script>'

INDEX = File.read(DEMO_INDEX)

NEW_INDEX = INDEX.gsub(OLD_CONSTRUCTOR, NEW_CONSTRUCTOR).gsub(OLD_SCRIPT, NEW_SCRIPT)

File.open(DEMO_INDEX, "w") {|file| file.puts NEW_INDEX}
