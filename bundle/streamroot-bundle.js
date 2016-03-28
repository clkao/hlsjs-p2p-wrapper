import StreamrootDownloader from 'streamroot-p2p-dist';
import StreamrootWrapper from '../lib/streamroot-wrapper';

class StreamrootBundle {
    constructor () {
        return new StreamrootWrapper(StreamrootDownloader);
    }
}

export default StreamrootBundle;
