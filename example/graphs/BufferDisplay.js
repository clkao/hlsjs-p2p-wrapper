const CACHE_HEIGHT = 30;
const BUFFER_HEIGHT = 10;
const TRACK_TOP_MARGIN = 3;
const CACHE_COLOR = "#97b9e2";
const BUFFERED_COLOR = "#202429";
const CURRENT_TIME_COLOR = "#bf0101";
const CANVAS_WIDTH = 460;
const TRACK_NAME_WIDTH = 60;
const FONT_STYLE = "12px Arial";

import VBM from './VirtualBufferedManager';


function init(p2pCache, p2pMapController, currentTracks) {
  let videoList = document.getElementsByTagName("video");
  if (videoList.length !== 1) {
    throw new Error("BufferDisplay debug tool requiresa page with a single video");
  }

  let video = videoList[0];
  let canvas = document.createElement('canvas');
  canvas.width = video.clientWidth || CANVAS_WIDTH;
  let div = document.getElementById("bufferDisplay");
  if (!div) {
    div = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(div);
  }
  div.appendChild(canvas);
  let refresh = refreshCanvas.bind(null, canvas, video, p2pCache, p2pMapController, currentTracks);
  setInterval(refresh, 30);
}

function refreshCanvas(canvas, video, p2pCache, p2pMapController, currentTracks) {
  let cacheState = gatherCachedState(p2pCache, p2pMapController);
  render(canvas, {video, cacheState, currentTracks});
}

// Retourne une liste d'object {coord, vbm} pour chaque track.
function gatherCachedState(p2pCache, p2pMapController) {
  let trackList = p2pMapController.getTracksList();

  let cacheState = [];
  for (let trackCoord of trackList) {
    let vbm = new VBM(p2pMapController);
    let downloadedSegmentFromTrack = p2pCache.listDownloadedSegmentsForTrack(trackCoord);
    for (let segmentCoord of downloadedSegmentFromTrack) {
      vbm.addSegmentCoord(segmentCoord);
    }
    cacheState.push({
      vbm,
      coord:trackCoord,
    });
  }

  return cacheState;
}

// appelée toutes les 40ms, se charge de dessiner le canvas à partir des données qu'on lui passe.
function render(canvas, data) {
  // video is the <video> tag, and cacheState is an array containing the cache state of every tracks (which are {coord, vbm}), currentTracks is a CurrentTracksStruct
  let {video, cacheState, currentTracks} = data;
  let {buffered, currentTime} = video;
  let context2D = canvas.getContext('2d');

  canvas.height = (CACHE_HEIGHT + TRACK_TOP_MARGIN) * cacheState.length;

  // calculate the scale of the chart
  let min = Infinity, max = 0;
  for (let {vbm} of cacheState) {
    if (vbm.length) {
      let trackMin = vbm.start(0);
      let trackMax = vbm.end(vbm.length - 1);
      if ( trackMin < min ) {
        min = trackMin;
      }
      if (trackMax > max) {
        max = trackMax;
      }
    }
  }
  if (buffered.length) {
    let bufferedMin = buffered.start(0);
    let bufferedMax = buffered.end(buffered.length - 1);

    if ( bufferedMin < min ) {
      min = bufferedMin;
    }
    if (bufferedMax > max) {
      max = bufferedMax;
    }
  }

  let scale = {min, max, canvasWidth: canvas.width};

  // for each track, draw a representation of what is in the cache.
  for (let i = 0; i < cacheState.length;i++) {

    let {vbm, coord: trackCoord} = cacheState[i];

    let yPosition = (CACHE_HEIGHT + TRACK_TOP_MARGIN) * i;
    let options = {
      scale,
      height: CACHE_HEIGHT,
      yPosition,
      color: CACHE_COLOR,
    };
    drawVBM(context2D, options, vbm);
    let captionYPosition = yPosition + (CACHE_HEIGHT / 2);
    writeTrackName(context2D, trackCoord.viewToString(), captionYPosition);
    // if it's one of the current tracks, we add the buffer.
    if (checkIfCurrentTrack(trackCoord, currentTracks)) {
      let opt = {
        scale,
        height: BUFFER_HEIGHT,
        yPosition: yPosition + (CACHE_HEIGHT - BUFFER_HEIGHT),
        color: BUFFERED_COLOR,
      };
      drawVBM(context2D, opt, buffered);
    }
  }
  let currentTimeLineOptions = {
    height:canvas.height,
    color: CURRENT_TIME_COLOR,
    scale
  };
  drawCurrentTimeLine(context2D, currentTimeLineOptions, currentTime);
}


function checkIfCurrentTrack(trackCoord, currentTracks) {
  return trackCoord.isEqual(currentTracks.video) || trackCoord.isEqual(currentTracks.audio);
}


function writeTrackName(context2D, trackName, yPosition) {
  context2D.fillStyle = "green";
  context2D.font = FONT_STYLE;
  context2D.fillText(trackName, 0, yPosition);
}

// The actual canvas drawing functions
function drawVBM(context2D, options, vbm) {
  let {scale, height, yPosition, color} = options;
  for (let j = 0; j < vbm.length; j++) {
      let start = convertTimeToPixel(scale, vbm.start(j));
      let end = convertTimeToPixel(scale, vbm.end(j));
      let length = end - start > 1 ? end - start : 1;
      context2D.fillStyle = color;
      context2D.fillRect(start, yPosition, length, height);
  }
}


function drawCurrentTimeLine(context2D, options, time) {
  let {color, scale, height} = options;
  let position = convertTimeToPixel(scale,time);
  context2D.fillStyle = color;
  context2D.fillRect(position, 0, 1, height);
  context2D.fillStyle = color;
  context2D.font = FONT_STYLE;
  context2D.fillText(time.toFixed(3), 0, height);
}


var convertTimeToPixel = function(scale, time) {
  let {min, max, canvasWidth} = scale;
  let effectiveCanvasWidth = canvasWidth - TRACK_NAME_WIDTH;
  let divider = Math.max(max - min, 3 * 60); // trick so we can see the progression of the buffer during the 3 first minutes of a stream.
  return TRACK_NAME_WIDTH + ((time - min) * effectiveCanvasWidth / divider);
};

export default init;
