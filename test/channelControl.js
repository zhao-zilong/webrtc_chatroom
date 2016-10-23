//lightly modified the updateChannel.js file in client

var Channels = [];
var datachannel = function() {};

function updateChannel() {
    for (var i = 0; i < Channels.length; i++) {
        if (Channels[i][1].readyState == "closing" ||
            Channels[i][1].readyState == "closed" ||
            typeof(Channels[i][1].readyState) === 'undefined') {
            console.log("deleting: ", Channels[i][0]);  
            Channels.splice(i, 1);
            i = i - 1;
            continue;
        } else if (Channels[i][1].readyState == "connecting") {
            console.log("reconnecting: ", Channels[i][0]);
            Channels[i][1] = {};

        }
    }
}
module.exports = updateChannel;

module.exports._channel = Channels;
