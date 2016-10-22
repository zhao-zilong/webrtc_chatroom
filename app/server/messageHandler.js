var  connectedPeers = {};
function onMessage(ws, message){
    var type = message.type;
    switch (type) {
        case "ICECandidate":
            onICECandidate(message.ICECandidate, message.destination, ws.id);
            break;
        case "offer":
            onOffer(message.offer, message.destination, ws.id);
            break;
        case "answer":
            onAnswer(message.answer, message.destination, ws.id);
            break;
        case "init":
            onInit(ws, message.init);
            break;
        case "":
        default:
            throw new Error("invalid message type");
    }
}



function onInit(ws, id){
    console.log("messageHandler init from peer:", id);
    ws.id = id;
    connectedPeers[id] = ws;
    console.log("messageHandler number of peers:", getJsonObjLength(connectedPeers));
    connectedPeers[id].send(JSON.stringify({
        type:'info',
        peers: Object.keys(connectedPeers),
    }));

}

function onOffer(offer, destination, source){
    console.log("messageHandler offer from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type:'offer',
        offer:offer,
        source:source,
    }));
}

function onAnswer(answer, destination, source){
    console.log("messageHandler answer from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type: 'answer',
        answer: answer,
        source: source,
    }));
}

function onICECandidate(ICECandidate, destination, source){
    console.log("messageHandler ICECandidate from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type: 'ICECandidate',
        ICECandidate: ICECandidate,
        source: source,
    }));
}


// calculate the length of a json object
// here use to calulate the length of connectedPeers
function getJsonObjLength(jsonObj) {
  var Length = 0;
  for (var item in jsonObj) {
    Length++;
  }
  return Length;
}

module.exports = onMessage;

//exporting for unit tests only
module.exports._connectedPeers = connectedPeers;
