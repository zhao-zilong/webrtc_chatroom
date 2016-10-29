function SignalingChannel(id) {

    var _ws;
    var self = this;

    function connectToTracker(url) {
        _ws = new WebSocket(url);
        _ws.onopen = _onConnectionEstablished;
        _ws.onclose = _onClose;
        _ws.onmessage = _onMessage;
        _ws.onerror = _onError;
    }

    function _onConnectionEstablished() {
        _sendMessage('init', id);

    }

    function _onClose() {
        console.error("connection closed");
    }

    function _onError(err) {
        console.error("error:", err);
    }


    function _onMessage(evt) {
        var objMessage = JSON.parse(evt.data);
        switch (objMessage.type) {
            case "ICECandidate":
                self.onICECandidate(objMessage.ICECandidate, objMessage.source);
                break;
            case "offer":
                self.onOffer(objMessage.offer, objMessage.source);
                break;
            case "answer":
                self.onAnswer(objMessage.answer, objMessage.source);
                break;
            case "info":
                self.onInit(objMessage.peers);
                break;
            case "onlinelist":
                self.onAnserOnlineList(objMessage.peers);
                break;
            default:
                throw new Error("invalid message type");
        }
    }

    function _sendMessage(type, data, destination) {
        var message = {};
        message.type = type;
        message[type] = data;
        message.destination = destination;
        _ws.send(JSON.stringify(message));
    }

    function sendICECandidate(ICECandidate, destination) {
        _sendMessage("ICECandidate", ICECandidate, destination);
    }

    function sendOffer(offer, destination) {
        _sendMessage("offer", offer, destination);
    }

    function sendAnswer(answer, destination) {
        _sendMessage("answer", answer, destination);

    }

    this.connectToTracker = connectToTracker;
    this.sendICECandidate = sendICECandidate;
    this.sendOffer = sendOffer;
    this.sendAnswer = sendAnswer;

    //Can not delete following default handler, they provided the entrances to our overrided functions
    //otherwise, the code can't be loaded

    //default handler, should be overriden
    this.onOffer = function(offer, source){
        console.log("offer from peer:", source, ':', offer);
    };

    //default handler, should be overriden
    this.onAnswer = function(answer, source){
        console.log("answer from peer:", source, ':', answer);
    };

    //default handler, should be overriden
    this.onICECandidate = function(ICECandidate, source){
        console.log("ICECandidate from peer:", source, ':', ICECandidate);
    };

    //default handler, should be overriden
    this.onInit = function(peers) {
        console.log("onInit");
    };

    this.onAnserOnlineList = function(peers){
        console.log("onlinelist");
    }

    //Called when a tab is closed or refreshed
    this.closeConnection = function() {
        _sendMessage('offline');
    }

    //send a request to update online list
    this.requestOnlineList = function(){
        _sendMessage('onlinelist');
    }
}

window.createSignalingChannel = function(url, id) {
    var signalingChannel = new SignalingChannel(id);
    signalingChannel.connectToTracker(url);
    return signalingChannel;
};
