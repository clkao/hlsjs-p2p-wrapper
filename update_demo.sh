#!/bin/bash

# Updates the Hls.js demo based on the supported version

VERSION=0.5.27
FILENAME=v"$VERSION".tar.gz

mkdir -p demo
cd demo
rm -Rf *
wget https://github.com/dailymotion/hls.js/archive/"$FILENAME"
tar -xzvf $FILENAME
cp hls.js-"$VERSION"/demo/* .
rm -Rf hls.js-"$VERSION"
rm $FILENAME

# In case this conflicts the patch has to be updated coherently!

git apply patch_demo
