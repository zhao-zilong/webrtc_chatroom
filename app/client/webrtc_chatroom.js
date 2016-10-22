function initCaller(messageCallback) {
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


    //When a user connected, he talked firstly with signalingServer to fetch the online list
    signalingChannel.onInit = function(peers) {
        console.log('at the beginning of initiation');
        if(peers.length >0){
          var delay = 1000;
          if(peers[0] != localname){
            Channels[Channels.length] = [peers[0], startCommunication(peers[0])];
          }
          if(peers.length >1){
          for (var i = 1; i < peers.length; i++) {
            (function(p){
              setTimeout(function(){
              if(p != localname){
                Channels[Channels.length] = [p, startCommunication(p)];
              }
            }, delay);
          })(peers[i]);
          //must have a gap between two creation, otherwise, it will cause conflit when set Local description
          // raise STATE_INPROGRESS exception.
          delay += 100;
          }
        }
        }

    };

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

        _commChannel.onopen = function() {
            console.log("dataChannel opened", _commChannel);
            _commChannel.send(JSON.stringify({
                type: 'arrive',
                msg: localname+" is coming\n"
            }));
        };

        _commChannel.onmessage = function(message) {
            var Msg = JSON.parse(message.data);
            if(Msg.type == "leave"){
              for (var i = 0; i < Channels.length; i++) {
                if(Channels[i][0] == Msg.id){
                   Channels[i][1].close();
                   Channels.splice(i,1);
                   messageCallback(Msg.msg);
                }
              }
            }
            if(Msg.type == "message" || Msg.type == "arrive"){
              messageCallback(Msg.msg);
            }
        };

        return _commChannel;
    }







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
              if(Msg.type == "leave"){
                for (var i = 0; i < Channels.length; i++) {
                  if(Channels[i][0] == Msg.id){
                     Channels[i][1].close();
                     Channels.splice(i,1);
                     messageCallback(Msg.msg);
                  }
                }
              }
              if(Msg.type == "message" || Msg.type == "arrive"){
                messageCallback(Msg.msg);
              }
            };
        };

        return pc;
    }

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



    //for invoking in html
    window.Channels = Channels;

    // when we close or refresh the tab, we notify everybody in the room that i am leaving.
    // and shut down the connection
    window.onunload = function(){
      for (var i = 0; i < Channels.length; i++) {
          Channels[i][1].send(JSON.stringify({
              type: 'leave',
              id: localname,
              msg: localname+" is leaving\n",
          }));
          Channels[i][1].close();
      }

    }
}
