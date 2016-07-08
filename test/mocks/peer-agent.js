/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "segmentView", "varsIgnorePattern": "headers" }]*/

class PeerAgentMock {

    constructor() {
        PeerAgentMock.__onInit();
    }

    getSegment(reqInfo, callbacks, segmentView) {

        const {url, headers, withCredentials} = reqInfo;
        const {onSuccess, onError, onProgress} = callbacks;

        try {

            let xhr = new XMLHttpRequest();

            xhr.onreadystatechange = (e) => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 206) {
                        onSuccess(xhr.response);
                    } else {
                        onError(e);
                    }
                }
            };
            xhr.onprogress = (e) => {

                e.cdnDownloaded = e.loaded;
                onProgress(e);
            };
            xhr.withCredentials = withCredentials;
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';

            if (this.xhrSetup) {
                this.xhrSetup(xhr, url);
            }
            xhr.send();

        } catch (e) {
            console.log(e);
        }
    }

    static get StreamTypes() {
        return {
            HLS: "HLS"
        };
    }
}

PeerAgentMock.__reset = () => {
    PeerAgentMock.__onInit = (() => {});
};

PeerAgentMock.__reset();

export default PeerAgentMock;
