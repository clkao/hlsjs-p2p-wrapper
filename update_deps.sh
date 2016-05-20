#!/bin/bash

VERSION=3.0.12
FILENAME=streamroot-p2p-dist-"$VERSION".tar.gz

wget http://sdk.streamroot.io/npm/"$FILENAME"
mkdir -p deps
cd deps
mkdir -p streamroot-p2p-dist
cd streamroot-p2p-dist
rm *
tar -xzvf ../../"$FILENAME"
cp tarball/* .
rm -Rf tarball
rm ../../"$FILENAME"
