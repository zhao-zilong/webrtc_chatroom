var connectedPeers = {};

function onMessage(ws, message) {
    var type = message.type;
    console.log(type);
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
        case "offline":
            onLeave(ws.id);
            break;
        default:
            throw new Error("invalid message type");
    }
}


//Delete the leaving connection in the server.
//Attention: There is the chance(very rare) that Chrome doesn't work correctly in callback
//onunload(), then we will keep a broken websocket in connectedPeers. Solved in onInit().
function onLeave(id) {
  console.log("messageHandler peer " + id + "is leaving");
  delete connectedPeers[id];


}

function onInit(ws, id) {
    console.log("messageHandler init from peer:", id);

    //To solve the problems of the broken websocket:
    //Before connecting with others, test if the websocket is usable
    //readyState: 0 for Connectiong, 1 for Open, 2 for Closing, 3 for closed
    for (var item in connectedPeers) {
        if (!connectedPeers.hasOwnProperty(item)) continue;
        console.log("messageHandler id  and state", item + " " + connectedPeers[item].readyState);

        if (connectedPeers[item].readyState == 2 ||
            connectedPeers[item].readyState == 3 ||
            typeof (connectedPeers[item].readyState)=== 'undefined') {
            delete connectedPeers[item];
        }
    }
    ws.id = id;
    connectedPeers[id] = ws;
    console.log("messageHandler number of peers:", getJsonObjLength(connectedPeers));
    connectedPeers[id].send(JSON.stringify({
        type: 'info',
        peers: Object.keys(connectedPeers),
    }));

}

function onOffer(offer, destination, source) {
    console.log("messageHandler offer from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type: 'offer',
        offer: offer,
        source: source,
    }));
}

function onAnswer(answer, destination, source) {
    console.log("messageHandler answer from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type: 'answer',
        answer: answer,
        source: source,
    }));
}

function onICECandidate(ICECandidate, destination, source) {
    console.log("messageHandler ICECandidate from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type: 'ICECandidate',
        ICECandidate: ICECandidate,
        source: source,
    }));
}


// Calculate the length of a json object
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
