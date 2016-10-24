//caller identity:
//call all online users when login



function initialCaller(signalingChannel, servers, RTCSessionDescription, RTCPeerConnection, RTCIceCandidate, messageCallback) {
    //onInit: callback when connected to signalingServer, Get online user list
    //from signalingServer, initialize local channels with online users.
    signalingChannel.onInit = function(peers) {
        console.log('at the beginning of initiation');
        if (peers.length > 0) {
            var delay = 100;
            if (peers[0] != localname) {
                Channels[Channels.length] = [peers[0], startCommunication(peers[0])];
            }
            if (peers.length > 1) {
                for (var i = 1; i < peers.length; i++) {
                    (function(p) {
                        setTimeout(function() {
                            if (p != localname) {
                                Channels[Channels.length] = [p, startCommunication(p)];
                            }
                        }, delay);
                    })(peers[i]);
                    //must have a gap between two creation, otherwise, it will cause conflit when set Local description
                    //raise STATE_INPROGRESS exception.
                    delay += 100;
                }
            }
        }

    };

    //Create peer with peerId, save the datachannel in local Channels array.
    function startCommunication(peerId) {
        var pc = new RTCPeerConnection(servers, {
            optional: [{
                DtlsSrtpKeyAgreement: true
            }]
        });

        signalingChannel.onAnswer = function(answer, source) {
            console.log('receive answer from ', source);
            pc.setRemoteDescription(new RTCSessionDescription(answer));
        };

        signalingChannel.onICECandidate = function(ICECandidate, source) {
            console.log("receiving ICE candidate from ", source);
            pc.addIceCandidate(new RTCIceCandidate(ICECandidate));
        };

        pc.onicecandidate = function(evt) {
            if (evt.candidate) { // empty candidate (wirth evt.candidate === null) are often generated
                signalingChannel.sendICECandidate(evt.candidate, peerId);
            }
        };

        //:warning the dataChannel must be opened BEFORE creating the offer.
        var _commChannel = pc.createDataChannel('communication', {
            reliable: false
        });

        pc.createOffer(function(offer) {
            pc.setLocalDescription(offer);
            console.log('send offer');
            signalingChannel.sendOffer(offer, peerId);
        }, function(e) {
            console.error(e);
        });

        _commChannel.onclose = function(evt) {
            console.log("dataChannel closed");
        };

        _commChannel.onerror = function(evt) {
            console.error("dataChannel error");
        };

        //when a datachannel opened, user informs another end of channel
        _commChannel.onopen = function() {
            console.log("dataChannel opened", _commChannel);
            _commChannel.send(JSON.stringify({
                type: 'message',
                msg: localname + " is coming\n"
            }));
        };

        //special case is when other side is leaving, delete local datachannel to this user
        _commChannel.onmessage = function(message) {
            var Msg = JSON.parse(message.data);
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

        return _commChannel;
    }
    window.startCommunication = startCommunication;
}
