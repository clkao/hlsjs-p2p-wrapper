import TrackView from './track-view';

class SegmentView {

    /**
     * @param arrayBuffer {ArrayBuffer}
     * @returns {SegmentView}
     */
    static fromArrayBuffer(arrayBuffer) {
        var u32Data = new Uint32Array(arrayBuffer),
            [level, sn] = u32Data;

        return new SegmentView({
            trackView: new TrackView({ level }),
            sn
        });
    }

    /**
     * @param {Object} object
     */
    constructor(obj) {
        this.sn = obj.sn;
        this.trackView = new TrackView(obj.trackView);
        this.time = obj.time;
    }

    /**
     * Determines if a segment represent the same media chunk than another segment
     * @param segmentView {SegmentView}
     * @returns {boolean}
     */
    isEqual(segmentView) {
        if (!segmentView) {
            return false;
        }
        let { sn, trackView } = segmentView;
        return this.sn === sn && this.trackView.isEqual(trackView);
    }

    /**
     * @param trackView {TrackView}
     * @returns {boolean}
     */
    isInTrack(trackView) {
        return this.trackView.isEqual(trackView);
    }

    /**
     * @returns {String}
     */
    viewToString() {
        return `${this.trackView.viewToString()}S${this.sn}`;
    }

    /**
     * @returns {ArrayBuffer}
     */
    toArrayBuffer() {
        return new Uint32Array([this.trackView.level, this.sn]).buffer;
    }

    getId() {
        return this.sn;
    }
}

export default SegmentView;
