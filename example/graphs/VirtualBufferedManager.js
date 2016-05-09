"use strict";

class VBM {
    static get LAST_SEGMENT_DURATION() {
        return 3; // an arbitrary value because we cannot know the duration of the last segment
    }
    constructor(mapManager) {
        this._buffered = []; // _buffered is an array of ranges, which are {start,end} objects
        this._mapManager = mapManager;
    }

    get length() {
        return this._buffered.length;
    }

    start(index) {
        if (index in this._buffered) {
            return this._buffered[index].start;
        } else {
            return 0;
        }
    }

    end(index) {
        if (index in this._buffered) {
            return this._buffered[index].end;
        } else {
            return 0;
        }
    }

    addSegmentCoord(segmentCoord) {
        let nextSegmentCoord = this._mapManager.getNextSegmentView(segmentCoord),
            start,
            end;
        try {
            start = this._mapManager.getSegmentTime(segmentCoord);
            if (nextSegmentCoord) {
                end = this._mapManager.getSegmentTime(nextSegmentCoord);
            } else {
                end = (start + VBM.LAST_SEGMENT_DURATION);
            }
        } catch (e) {
            return;
        }

        if (!this._buffered.length) {
            this._buffered.push({start, end});
            return;
        }

        let indexRangeToRemove;
        let indexRangeToAdd;
        for (let i = 0; i < this._buffered.length;i++) {
            let firstRange = this._buffered[i];
            let secondRange = this._buffered[i + 1] || {start:Infinity, end: Infinity}; // when i is the last element of the array
            if (firstRange.end === start && end === secondRange.start) {
                firstRange.end = secondRange.end;
                indexRangeToRemove = i + 1;
                break;
            } else if (firstRange.end === start && end !== secondRange.start) {
                firstRange.end = end;
                break;
            } else if (firstRange.end !== start && end === secondRange.start) {
                secondRange.start = start;
                break;
            } else if (firstRange.end <= start && end <= secondRange.start) {
                indexRangeToAdd = i + 1;
                break;
            }
        }

        if (indexRangeToRemove !== undefined) {
            this._buffered.splice(indexRangeToRemove, 1);
        }
        if (indexRangeToAdd !== undefined) {
            this._buffered.splice(indexRangeToAdd, 0, {start, end});
        }
    }
}

module.exports = VBM;
