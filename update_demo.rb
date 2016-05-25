#!/usr/bin/ruby

# Updates the Hls.js demo based on the supported version

VERSION = "0.5.27"
FILENAME = "v#{VERSION}.tar.gz"
DEMO_DIR = "demo"

`mkdir -p #{DEMO_DIR}`
`cd #{DEMO_DIR} && rm -Rf *`
`cd #{DEMO_DIR} && wget https://github.com/dailymotion/hls.js/archive/#{FILENAME}`
`cd #{DEMO_DIR} && tar -xzvf #{FILENAME}`
`cd #{DEMO_DIR} && cp hls.js-#{VERSION}/demo/* .`
`cd #{DEMO_DIR} && rm -Rf hls.js-#{VERSION}`
`cd #{DEMO_DIR} && rm #{FILENAME}`

# In case this conflicts the patch has to be updated coherently!

`git apply patch_demo`
