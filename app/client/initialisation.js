function initial(messageCallback) {
    var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
    var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

    var wsUri = "ws://localhost:8090/";
    var signalingChannel = createSignalingChannel(wsUri, localname);
    var servers = {
        iceServers: [{
            urls: "stun:stun.1.google.com:19302"
        }]
    };

    //Channels: stock the map from online users fo their datachannel corresponding
    var Channels = [];
    //for quoting in html
    window.Channels = Channels;


    initialCaller(signalingChannel, servers, RTCSessionDescription, RTCPeerConnection, RTCIceCandidate, messageCallback);
    initialCallee(signalingChannel, servers, RTCSessionDescription, RTCPeerConnection, RTCIceCandidate, messageCallback);

    // when a tab is closed or refreshed, it has to inform everybody in the room that he is leaving.
    // and shut down the connection
    window.onunload = function() {
        for (var i = 0; i < Channels.length; i++) {
            Channels[i][1].send(JSON.stringify({
                type: 'leave',
                id: localname,
                msg: localname + " is leaving\n",
            }));
            Channels[i][1].close();
        }
        //disconnected to signalingServer
        signalingChannel.closeConnection();
    }



}
