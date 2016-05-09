// used to display stat about peers
// should work on all client pages.
// to use it, add:
/*
<script src="../../peerStat.js"></script>
*/
// to your test page

var peerStat = function(isBookmarklet) {
    "use strict";

    var _div,

        // General format helpers
        _getPrettyFormat = function (bytes) {
            var units = [
                'Bytes',
                'KB',
                'MB',
                'GB',
                'TB',
                'PB'
            ];

            if ( isNaN( parseFloat(bytes)) || !isFinite(bytes) ) {
                return '?';
            }

            var unit = 0;
            let result = bytes;
            while ( result >= 1024 ) {
                result /= 1024;
                unit++;
            }
            return result.toFixed(2) + ' ' + units[unit];

        },

        _setColorStyle = function(element, color) {
            element.style.backgroundColor = color;
            element.style.color =  "white";
            element.style.textAlign = "center";
            element.style.borderRadius = "5px";
        },

        // Table creation helpers

        _createTableAndHeader = function () {
            var table = document.createElement('table');
            table.style.color = "white";
            table.style.textAlign = "center";
            table.style["margin-bottom"] = "20px";

            var headerRow = document.createElement('tr');
            headerRow.style.height = '2.5em';
            table.appendChild(headerRow);

            _div.appendChild(table);

            return { table, headerRow };
        },

        _createValueRow = function (table) {
            var valueRow = document.createElement('tr');
            valueRow.style.height = "2.3em";
            table.appendChild(valueRow);
            return valueRow;
        },

        _addHeader = function (row, title) {
            var th = document.createElement('th');
            th.style.width = '6em';
            th.appendChild(document.createTextNode(title));
            row.appendChild(th);
        },

        _addValue = function (row, value, style) {
            let td;
            if (value instanceof HTMLElement) {
                if (value.nodeName === "TD") {

                    if (style) {
                        throw new Error("If an HTMLElement is passed to _addValue, it's illegal to pass a style in metrics (style your HTMLElement itself)");
                    }

                    td = value;
                } else {
                    throw new Error("If an HTMLElement is passed to _addValue, it must be a td element");
                }
            } else {
                td = document.createElement('td');
                td.appendChild(document.createTextNode(value));
                Object.assign(td.style, style);  // td.style = style doesn't work, as td.style if an instance of CSSStyleDeclaration. Object.assign copies the desired properties and they are effectively applied
            }
            row.appendChild(td);
        },

        _createTable = function (metrics) {
            var { table, headerRow} = _createTableAndHeader();

            var valueRow = _createValueRow(table);

            for (let {title, value, style} of metrics) {
                _addHeader(headerRow, title);
                _addValue(valueRow, value, style);
            }
        },

        _createTableList = function (metrics, list) {
            var { table, headerRow} = _createTableAndHeader();

            let headersAdded = false;

            for (let item of list) {

                var valueRow = _createValueRow(table);

                for (let {title, getter, style} of metrics) {
                    if (!headersAdded) {
                        _addHeader(headerRow, title); // Add headers only for first item if there's a list
                    }
                    _addValue(valueRow, getter(item), style);
                }
                headersAdded = true;
            }
        },

        // Styling helper for specific value types

        _createSpeedElement = function (dlSpeed, upSpeed) {
            var speed = document.createElement('td');
            var dlSpeedSpan = document.createElement('span');
            var upSpeedSpan = document.createElement('span');
            dlSpeedSpan.style.color = "green";
            upSpeedSpan.style.color = "red";
            dlSpeedSpan.appendChild(document.createTextNode(dlSpeed.toFixed(1)));
            upSpeedSpan.appendChild(document.createTextNode(upSpeed.toFixed(1)));
            speed.appendChild(dlSpeedSpan);
            speed.appendChild(document.createTextNode(" / "));
            speed.appendChild(upSpeedSpan);

            return speed;
        },

        _createBufferLevelElement = function (bufferLevel, bufferLevelToCompare) {
            var bufferLevelTd = document.createElement('td');
            var bufferLevelDiv = document.createElement('div');
            if (bufferLevel > bufferLevelToCompare) {
                _setColorStyle(bufferLevelDiv,"green");
            } else if (bufferLevel < bufferLevelToCompare) {
                _setColorStyle(bufferLevelDiv, "red");
            } else {
                _setColorStyle(bufferLevelDiv, "blue");
            }
            bufferLevelDiv.appendChild(document.createTextNode(bufferLevel));
            bufferLevelTd.appendChild(bufferLevelDiv);
            return bufferLevelTd;
        },

        // Stat tables configuration

        _createBackendStatTable = function (stats) {
            let metrics = [{
                title: 'tracker',
                value: stats.trackerConnected,
                style: {
                    color: stats.tracker.connected ? "green" : "red"
                }
            }, {
                title: 'signaling',
                value: !!stats.sigConnected,
                style: {
                    color: stats.sigConnected ? "green" : "red"
                }
            }];

            _createTable(metrics);
        },

        _createGlobalTableStats = function(stats) {
            let metrics = [{
                title: 'cdn',
                value: _getPrettyFormat(stats.download.cdnDownloaded)
            }, {
                title: 'p2p',
                value: _getPrettyFormat(stats.download.p2pDownloadedNewAnalytics),
            }, {
                title: 'Up',
                value: _getPrettyFormat(stats.download.p2pUploaded),
            }, {
                title: 'Speed',
                value: _createSpeedElement(stats.download.dlSpeed, stats.download.upSpeed)
            }, {
                title: 'P2P %',
                value: ((stats.download.p2pDownloadedNewAnalytics + stats.download.cdnDownloaded) > 0 ? stats.download.p2pDownloadedNewAnalytics * 100 / (stats.download.p2pDownloadedNewAnalytics + stats.download.cdnDownloaded) : 0).toFixed(1) + " %"
            }];

            if (stats.isLive) {
                metrics.splice(4, 0, {
                    title: "Buffer Level",
                    value: _createBufferLevelElement(stats.bufferLevel, stats.bufferLevel)
                });
            }

            _createTable(metrics);
        },

        _createPeerStatTable = function (stats) {
            let peers = stats.peerList;
            let metrics = [{
                title: "Location",
                getter: (peer) => { return `${peer.country} (${peer.city})`; }
            }, {
                title: "Down",
                getter: (peer) => { return _getPrettyFormat(peer.dataDownloaded); }
            }, {
                title: "Up",
                getter: (peer) => { return _getPrettyFormat(peer.dataUploaded); }
            }, {
                title: "Speed",
                getter: (peer) => { return _createSpeedElement(peer.dlSpeed, peer.upSpeed); }
            }, {
                title: "RTT",
                getter: (peer) => {
                    return peer.rtt >= 0 ? `${peer.rtt} ms` : "-";
                }
            }, {
                title: "Distance",
                getter: (peer) => { return `${peer.distance} km`; }
            }];

            if (stats.isLive) {
                metrics.splice(4, 0, {
                    title: "Buffer Level",
                    getter: (peer) => _createBufferLevelElement(peer.bufferLevel, stats.bufferLevel)
                });
            }

            if (peers.length) {
                _createTableList(metrics, peers);
            } else {
                _div.style.padding = "5px";
                _div.appendChild(document.createTextNode('Not connected to any peer'));
            }
        },

        // Initialize and refresh

        _cleanDiv = function() {
            while (_div.firstChild) {
                _div.removeChild(_div.firstChild);
            }
        },

        _retrieveStats = function() {
            if (!window.SR_DISPLAY_INTERFACE) {
                console.log("window.SR_DISPLAY_INTERFACE not defined yet");
                return;
            }
            var stats = window.SR_DISPLAY_INTERFACE.getStats();
            if (!stats) {
                console.error("Statistics not found. Check in the client configuration that DEBUG is set to true");
                return;
            }
            _cleanDiv();

            _createBackendStatTable(stats);
            _createGlobalTableStats(stats);

            if (stats.peerList) {
                _createPeerStatTable(stats);
            }
        },

        _initialize = function() {
            _div = document.getElementById('peerStat');

            if (!_div) {
                document.body.appendChild(document.createElement('br'));
                _div = document.createElement('div');
                _div.id = 'peerStat';
                _div = document.body.appendChild(_div);
                if(isBookmarklet){
                    _div.style.position = "absolute";
                    _div.style.margin = "90px 10px 10px";
                    _div.style.top = "0";
                    _div.style.left = "0";
                    _div.style["margin-top"] = "90px";
                }else{
                    _div.style.position = "absolute"; //not to have a 100% width div
                }
            }

            _div.style["box-sizing"] = "border-box";
            _div.style.background = "rgba(0,0,0,0.8)";
            _div.style.fontFamily = "Myriad Pro, Gill Sans, Gill Sans MT, Calibri, sans-serif";
            _div.style.color = "#ffffff";
            window.setInterval(_retrieveStats,500);
        };

    _initialize();

};
if ( document.readyState === 'complete' ) {
    // Start tool right away if document already loaded (tool added with bookmark for ex)
    peerStat(true);
} else {
    // Otherwise wait for document to be loaded
    window.addEventListener('load', peerStat.bind(null, false));
}
