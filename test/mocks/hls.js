import Hls from 'hls.js';
import EventEmitter from 'eventemitter3';

class HlsMock {

    constructor (levelNumber, live, definedLevel = 0, emptyLevel = true) {

        this.url = "http://foo/bar"

        this.ee = new EventEmitter();

        // this.hls.levels can return undefined if master playlist as not been parsed
        if (levelNumber > 0) {
            this._levels = [];
        }

        var fragments = [];

        for (var f = 25; f < 200; f++) {
            fragments.push({
                sn: f,
                start: f * 10
            });
        }

        for (var i = 0; i < levelNumber; i++) {
            let level;

            if (emptyLevel) {
                level = {};
            } else {
                level = {
                    details: {
                        totalduration: 120
                    },
                    audioCodec: "fooCodec"
                };
            }

            if (live !== undefined && i === definedLevel) {
                level.details = { live, fragments };
            }
            this._levels.push(level);
        }
    }

    get levels() {
        return this._levels;
    }

    get config() {
        return Hls.DefaultConfig;
    }

    static get Events() {
        return Hls.Events;
    }

    on(event, func) {
        this.ee.on(event, func);
    }

    trigger(event) {
        this.ee.emit(event);
    }

    __triggerEventAsync(event, timeout = 0) {
        setTimeout(() => {
            this.trigger(event);
        }, timeout);
    }
}

export default HlsMock;

