// jshint -W098
class TrackView {

    constructor(obj) {
        this.level = obj.level;
    }

    /**
     * @returns {String}
     */
    viewToString() {
        return `L${this.level}`;
    }

    /**
     * @param trackView {TrackView}
     * @returns {boolean}
     */
    isEqual(trackView) {
        if (!trackView) {
            return false;
        }
        return trackView.level === this.level;
    }
}

export default TrackView;
