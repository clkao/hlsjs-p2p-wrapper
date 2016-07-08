import HlsjsWrapper from "../lib/hlsjs-p2p-wrapper";
import HlsjsWrapperPrivate from "../lib/hlsjs-p2p-wrapper-private";
import HlsjsMock from "./mocks/hls";
import PeerAgentMock from "./mocks/peer-agent";

const testConf = {
        streamrootKey: "ry-v7xuywnt",
        debug: true,
        contentId: null
    };

describe("HlsjsP2PWrapper", function() {

	it("should construct", function() {

		let wrapper = new HlsjsWrapper(HlsjsMock);

	});

	it("should create a media engine instance", function(done) {

		let wrapper = new HlsjsWrapper(HlsjsMock);
		let hls = wrapper.createPlayer({}, testConf);

		hls.on(HlsjsMock.Events.MANIFEST_LOADING, () => {
			done();
		})

		hls.__triggerEventAsync(HlsjsMock.Events.MANIFEST_LOADING, 500);
	});

});

describe("HlsjsP2PWrapper private API", function() {

	beforeEach(function() {
		PeerAgentMock.__reset();
	});

	it("should construct", function() {

		let wrapper = new HlsjsWrapperPrivate(HlsjsMock, new PeerAgentMock());

	});

	it("should create a media engine instance", function(done) {

		let manifestLoaded = false

		PeerAgentMock.__onInit = () => {
			manifestLoaded.should.be.true;
			done();		
		}

		let wrapper = new HlsjsWrapperPrivate(HlsjsMock, PeerAgentMock);

		let hls = wrapper.createPlayer({}, {});

		hls.on(HlsjsMock.Events.MANIFEST_LOADING, () => {
			manifestLoaded = true;
		})

		hls.__triggerEventAsync(HlsjsMock.Events.MANIFEST_LOADING, 500);
	});

	it("should create peer agent", function() {

		let wrapper = new HlsjsWrapperPrivate(HlsjsMock, PeerAgentMock);

		wrapper.createPeerAgent({}, new HlsjsMock(), HlsjsMock.Events);

	});

});
