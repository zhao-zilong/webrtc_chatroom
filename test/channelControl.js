//lightly modified the updateChannel.js file in client

var Channels = [];

function updateChannel() {
    var delay = 100;
    var order = [];
    var indiceInc = 0;
    var indiceOrd = 0;
    for (var i = 0; i < Channels.length; i++) {
        if (Channels[i][1].readyState == "closing" ||
            Channels[i][1].readyState == "closed" ||
            typeof(Channels[i][1].readyState) === 'undefined') {
            console.log("deleting: ", Channels[i][0]);
            Channels.splice(i, 1);
            i = i - 1;
            continue;
        } else if (Channels[i][1].readyState == "connecting") {
            order[indiceInc++] = i;
            (function(p) {
                setTimeout(function() {
                    console.log("reconnecting: ", p[0]);
                    p[1] = {};
                }, delay);
            })(Channels[order[indiceOrd++]]);
            delay += 100;
        }
    }
}


var localname = 4;
function onAnserOnlineList(peers) {
    var localonlinelist = [];
        for (var i = 0; i < Channels.length; i++) {
            localonlinelist[i] = Channels[i][0];
        }
    for (var i = 1; i < peers.length; i++) {
        if (localonlinelist.indexOf(peers[i]) == -1 &&
            peers[i] != localname) {
            Channels[Channels.length] = [peers[i], {}];
        }
    }
};


module.exports._updateChannel= updateChannel;
module.exports._onAnserOnlineList = onAnserOnlineList;
module.exports._channel = Channels;
