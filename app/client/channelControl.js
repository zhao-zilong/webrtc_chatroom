//updateChannel: recover 'connecting' state connections, cleanup useless connections
//called every time clicking  GetOnLineList

//Even we set timeout in Oninit(), there is always the chance(very rare) that
//some connections fail in STATE_INPROGRESS or STATE_INIT exception
//and the readyState will always be 'connecting'.
//Reconnecting with other ends which the readyState is 'connecting'.
function updateChannel() {
    var delay = 100;
    var order = [];
    var indiceInc = 0;
    var indiceOrd = 0;
    for (var i = 0; i < Channels.length; i++) {
        if (Channels[i][1].readyState == "closing" ||
            Channels[i][1].readyState == "closed" ||
            typeof(Channels[i][1].readyState) === 'undefined') {
            Channels.splice(i, 1);
            i = i - 1;
            continue;
        } else if (Channels[i][1].readyState == "connecting") {
            order[indiceInc++] = i;
            (function(p) {
                setTimeout(function() {
                        console.log("reconnecting: ",p[0]);
                        p[1] = startCommunication(p[0]);
                }, delay);
            })(Channels[order[indiceOrd++]]);
            delay += 100;
        }
    }
}
