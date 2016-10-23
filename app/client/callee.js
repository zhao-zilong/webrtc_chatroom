function initialCallee(signalingChannel, servers, RTCSessionDescription, RTCPeerConnection, RTCIceCandidate, messageCallback) {
    //respond to createOffer() from caller
    signalingChannel.onOffer = function(offer, source) {
        console.log('receive offer');
        var peerConnection = createPeerConnection(source);
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        peerConnection.createAnswer(function(answer) {
            peerConnection.setLocalDescription(answer);
            console.log('send answer');
            signalingChannel.sendAnswer(answer, source);
        }, function(e) {
            console.error(e);
        });
    };

    //Create peer connection with given peerId
    function createPeerConnection(peerId) {
        var pc = new RTCPeerConnection(servers, {
            optional: [{
                DtlsSrtpKeyAgreement: true
            }]
        });

        pc.onicecandidate = function(evt) {
            if (evt.candidate) { // empty candidate (wirth evt.candidate === null) are often generated
                signalingChannel.sendICECandidate(evt.candidate, peerId);
            }
        };

        signalingChannel.onICECandidate = function(ICECandidate, source) {
            console.log("receiving ICE candidate from ", source);
            pc.addIceCandidate(new RTCIceCandidate(ICECandidate));
        };

        pc.ondatachannel = function(event) {
            var receiveChannel = event.channel;
            console.log("channel received", receiveChannel);
            Channels[Channels.length] = [peerId, receiveChannel];
            receiveChannel.onmessage = function(event) {
                var Msg = JSON.parse(event.data);
                if (Msg.type == "leave") {
                    for (var i = 0; i < Channels.length; i++) {
                        if (Channels[i][0] == Msg.id) {
                            Channels[i][1].close();
                            Channels.splice(i, 1);
                            messageCallback(Msg.msg);
                            break;
                        }
                    }
                }
                if (Msg.type == "message") {
                    messageCallback(Msg.msg);
                }
            };
        };

        return pc;
    }
}
