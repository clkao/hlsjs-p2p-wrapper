const SEGMENT_LEFT_SPACING = 100;
const SEGMENT_WIDTH = 100;
const SEGMENT_HEIGHT = 15;
const TRACK_COORD_COLOR = "red";
const SEGMENT_TIME_COLOR = "black";
const FONT_SIZE = 15;
const FONT_STYLE = `${FONT_SIZE}px Arial`;
const SEGMENT_SPACING = 5;
const TIME_KEPT_DISPLAYED = 10;
const ROW_WIDTH = SEGMENT_LEFT_SPACING + SEGMENT_WIDTH + 20;

function init(p2pCache, p2pMapController) {
  let videoList = document.getElementsByTagName("video");
  if (videoList.length !== 1) {
    throw new Error("BufferDisplay debug tool requiresa page with a single video");
  }

  let video = videoList[0];
  let canvas = document.createElement('canvas');
  let div = document.getElementById("chunkDisplay");
  if (!div) {
    div = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(div);
  }
  div.appendChild(canvas);
  let refresh = refreshCanvas.bind(null, canvas, p2pCache, p2pMapController, video);
  setInterval(refresh, 30);
}

function refreshCanvas(canvas, p2pCache, p2pMapController, video) {
  let trackList = p2pMapController.getTracksList();

  let map = new Map();

  for (let i = 0; i < trackList.length;i++) {
    let track = trackList[i];
    map.set(track,[]);
  }

  let downloadStatus = p2pCache.listSegmentsDownloadStatus();
  for (let j = 0; j < downloadStatus.length;j++) {
    let {segmentcoord, downloadStatusList, seederCount} = downloadStatus[j];
    for (let i = 0; i < trackList.length;i++) {
      let track = trackList[i];
      if (segmentcoord.isInTrack(track)) {
        let segmentAreas = computeSegmentAreas(downloadStatusList);
        try {
            let time = p2pMapController.getSegmentTime(segmentcoord);
            map.get(track).push({segmentAreas, id: segmentcoord.viewToString(), time, length: downloadStatusList.length, seederCount});
        } catch (e) {
		    // do nothing, we just don't want to fail if no segmentTime is found
		}
      }
    }
  }
  render(canvas, map, video.currentTime);
}

// appelée toutes les 40ms, se charge de dessiner le canvas à partir des données qu'on lui passe.
function render(canvas, map, videoTime) {
  canvas.height = 1000;
  canvas.width = ROW_WIDTH * map.size;
  let yPosition;
  let context2D = canvas.getContext('2d');
  let rowCounter = 0;
  for (let [trackCoord, segList] of map) {
    yPosition = FONT_SIZE;
    drawTrackCoord(context2D, trackCoord, yPosition, rowCounter);
    for (let {id, time, segmentAreas, length, seederCount} of segList){
        if (time > videoTime - TIME_KEPT_DISPLAYED){
            yPosition+=SEGMENT_SPACING;
            drawSegment(context2D, segmentAreas, length, yPosition, rowCounter);
            drawSegmentInfo(context2D, {id, time, seederCount },  yPosition, rowCounter);
            yPosition+=SEGMENT_HEIGHT;
        }
    }
    rowCounter++;
  }
}

function drawTrackCoord(context2D, trackCoord, yPosition, rowNumber) {
  let rowOffset = ROW_WIDTH * rowNumber;
  context2D.fillStyle = TRACK_COORD_COLOR;
  context2D.font = FONT_STYLE;
  context2D.fillText(trackCoord.viewToString(), rowOffset, yPosition);
}

function drawSegmentInfo(context2D, { id, time, seederCount }, yPosition, rowNumber) {
  let rowOffset = ROW_WIDTH * rowNumber;
  context2D.fillStyle = SEGMENT_TIME_COLOR;
  context2D.font = FONT_STYLE;
  context2D.fillText(id + '  --  ' + time.toFixed(1) + ' -- ' + seederCount, rowOffset, yPosition + SEGMENT_HEIGHT);
}

function drawSegment(context2D, segmentAreas, length, yPosition, rowNumber) {
  let rowOffset = ROW_WIDTH * rowNumber;
  let xOffset = 0;
  for (let area of segmentAreas) {
    var normalizedWidth = (area.end - area.start) * SEGMENT_WIDTH / length;

    context2D.fillStyle = getColorForStatus(area.status);
    context2D.fillRect(rowOffset + SEGMENT_LEFT_SPACING + xOffset, yPosition, normalizedWidth, SEGMENT_HEIGHT);

    xOffset += normalizedWidth;
  }
  if (!segmentAreas.length) {
    context2D.fillStyle = "#D490D4";
    context2D.fillRect(rowOffset + SEGMENT_LEFT_SPACING, yPosition, SEGMENT_WIDTH, SEGMENT_HEIGHT);
  }
}

function getColorForStatus(status) {
    switch (status) {
        case "pending":
            return "gray";
        case "downloading":
            return "blue";
        case "downloaded":
            return "green";
        case "CDNdownloaded":
            return "orange";
        case "failed":
            return "red";
        default:
            console.error("status not in enum");
    }
}

function computeSegmentAreas(downloadStatus) {
  let previousStatus;
  let mergedStatusList = [];
  for (let i = 0; i < downloadStatus.length; i++) {
    let status = downloadStatus[i];
    if (previousStatus === status) {
      mergedStatusList[mergedStatusList.length - 1].end++;
    } else {
      let mergedStatus = {start:i, end: i + 1, status};
      previousStatus = status;
      mergedStatusList.push(mergedStatus);
    }
  }
  return mergedStatusList;
}

export default init;
