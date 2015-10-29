function _hlsToSRMap (levels) {
  var srMap  = {};
  srMap.periods = [{asets: []}];

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
      for (var fragment of level.details.fragments) {
        var srSegment = {
          duration: fragment.duration,
          time: fragment.start,
          id: fragment.sn,
        };
        srRep.segments.push(srSegment);
      }
    }
    srMap.periods[0].asets.push({ type: 'video', reps: [srRep] });
  }
  return srMap;
}

function _hlsToSRTrackCoordinate(levelId) {
  var srTrackCoordinate = {
    periodId: 0,
    asetId: levelId,
    repId: 0
  };
  return srTrackCoordinate;
}

function _hlsToSRSegmentCoordinate(fragment) {

  var srSegmentCoordinate = {
    periodId: 0,
    asetId: fragment.level,
    repId: 0,
    idPiece: fragment.sn,
    segment: {
      time: fragment.start,
    }
  };
  return srSegmentCoordinate;
}


export var hlsToSRMap = _hlsToSRMap;
export var hlsToSRTrackCoordinate = _hlsToSRTrackCoordinate;
export var hlsToSRSegmentCoordinate = _hlsToSRSegmentCoordinate;
