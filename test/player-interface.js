import PlayerInterface from '../lib/integration/player-interface';
import HlsMock from './mocks/hls';

describe("PlayerInterface", () => {

    let Events = {};
    let p2pConfig = {};
    let onDispose = () => {};
    let onAttach = () => {};
    let onDetach = () => {};

    describe("isLive", function () {
        it("Should return live if defined (both master and 1 level playlist parsed)", function () {
            let hlsMock = new HlsMock(3, false, 1);
            let playerInterface = new PlayerInterface(hlsMock, Events, p2pConfig, onDispose, onAttach, onDetach);
            playerInterface.isLive().should.be.false;
        });

        it("Should throw if isLive is called before the master playlist is parsed", function () {
            let hlsMock = new HlsMock(0, false);
            let playerInterface = new PlayerInterface(hlsMock, Events, p2pConfig, onDispose, onAttach, onDetach);
            playerInterface.isLive.bind(playerInterface).should.throw("Called isLive before the master playlist was parsed");
        });

        it("Should throw if isLive is called before any levelplaylist is parsed", function () {
            let hlsMock = new HlsMock(3, undefined);
            let playerInterface = new PlayerInterface(hlsMock, Events, p2pConfig, onDispose, onAttach, onDetach);
            playerInterface.isLive.bind(playerInterface).should.throw("Called isLive before any levelplaylist was parsed");
        });
    });
});
