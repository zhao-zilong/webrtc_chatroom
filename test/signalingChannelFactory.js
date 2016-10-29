
    var id = "test";
    var _ws = {};

    function _onConnectionEstablished() {
        _sendMessage('init', id);

    }

    function _sendMessage(type, data, destination) {
        var message = {};
        message.type = type;
        message[type] = data;
        message.destination = destination;
        _ws[0].send(JSON.stringify(message));
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

    module.exports = _onConnectionEstablished;
    module.exports._sendOffer= sendOffer;
    module.exports._ws = _ws;
    module.exports._sendICECandidate = sendICECandidate;
    module.exports._sendOffer = sendOffer;
    module.exports._sendAnswer = sendAnswer;
