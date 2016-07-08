window._DEBUG_ = true;
window._TEST_ = false;
window._MOBILE_ = false;
window._ENVIRONMENT_ = 'development';
window.streamrootConfig = {
    p2pConfig:{
        streamrootKey: "ry-v7xuywnt",
        debug: true,
        contentId: null
    },
    hlsjsConfig: {
    	debug: true
    },
    contentUrl: 'http://www.streambox.fr/playlists/test_001/stream.m3u8'
}
window.previousTotalCDN = 0;
window.hasWebRTC = !!(window.RTCPeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection);

function error(message) {
    document.getElementById('error').innerHTML = '<b>' + message + '</b>';
}
