function _hlsToSRMap (levels) {
  var srMap  = {};
  srMap.periods = [{asets: [{ type: "video", reps : [] }]}];

  for (var level of levels) {
    var srRep = {
      bitrate : level.bitrate,
      segments: []
    };
    if (level.details) {
      // Double bang because this property is undefined in VOD
      // We have to define it in the loop as level.details is not always defined.
      // We also might be able to set it from event LEVEL_LOADED in playerInterface
      srMap.isLive = !!level.details.live;
      var sliding = level.details.sliding || 0;
      for (var fragment of level.details.fragments) {
        var srSegment = {
          duration: fragment.duration,
          time: fragment.start + sliding,
          id: fragment.sn,
        };
        srRep.segments.push(srSegment);
      }
    }
    srMap.periods[0].asets[0].reps.push(srRep);
  }
  return srMap;
}

function _hlsToSRTrackCoordinate(levelId) {
  var srTrackCoordinate = {
    periodId: 0,
    asetId: 0,
    repId: levelId
  }
  return srTrackCoordinate;
}

function _hlsToSRSegmentCoordinate(fragment) {

  var srSegmentCoordinate = {
    "periodId": 0,
    "asetId": 0,
    "repId": fragment.level,
    "idPiece": fragment.sn,
    "segment": {
        "time": fragment.start,
    }
  };
  return srSegmentCoordinate;
}


export var hlsToSRMap = _hlsToSRMap;
export var hlsToSRTrackCoordinate = _hlsToSRTrackCoordinate;
export var hlsToSRSegmentCoordinate = _hlsToSRSegmentCoordinate;
