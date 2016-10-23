var should = require('should')
var sinon = require('sinon');
var messageHandler = require('../app/server/messageHandler');

var WsMock = function(){
    this.send = function(){};
};

describe('signalingServer', function() {
    describe('Initialization', function() {
        it('onInit', function() {
            var ws1 = new WsMock();
            var message1 = {
                type:"init",
                init:1
            };
            var ws2 = new WsMock();
            var message2 = {
                type:"init",
                init:2
            };
            messageHandler(ws1, message1);
            messageHandler(ws2, message2);
            ws1.id.should.be.equal(1);
            //Because when ws2 joined, readyState for ws1 is undefined,
            //server will treat ws1 like a broken websocket.
            should.not.exist(messageHandler._connectedPeers[1]);
            ws2.id.should.be.equal(2);
            messageHandler._connectedPeers[2].should.be.equal(ws2);
        });
    });
    describe('Messages', function() {
        var spy, ws1, ws2, ws3;
        beforeEach(function() {
            ws1 = new WsMock();
            ws1.id = 1;
            ws2 = new WsMock();
            ws2.id = 2;
            ws3 = new WsMock();
            ws3.id = 3;

            messageHandler._connectedPeers[1] = ws1;
            messageHandler._connectedPeers[2] = ws2;
            messageHandler._connectedPeers[3] = ws3;
            spy = sinon.spy(messageHandler._connectedPeers[3], "send");
        });
        afterEach(function() {
            spy.restore();
        });

        it('onOffer', function() {
            var offerSDP = "offer SDP";
            var message = {
                type:"offer",
                offer:offerSDP,
                destination:3,
            };
            messageHandler(ws1, message);
            messageHandler(ws2, message);
            spy.called.should.be.true;

            var expectedResponse1 = '{"type":"offer","offer":"offer SDP","source":1}';
            spy.firstCall.args[0].should.eql(expectedResponse1);
            var expectedResponse2 = '{"type":"offer","offer":"offer SDP","source":2}';
            spy.secondCall.args[0].should.eql(expectedResponse2);
        });
        it('onAnswer', function() {
            var answerSDP = "answer SDP";
            var message = {
                type:"answer",
                answer:answerSDP,
                destination:3,
            };
            messageHandler(ws1, message);
            messageHandler(ws2, message);
            spy.calledTwice.should.be.true;

            var expectedResponse1 = '{"type":"answer","answer":"answer SDP","source":1}';
            spy.firstCall.args[0].should.eql(expectedResponse1);
            var expectedResponse2 = '{"type":"answer","answer":"answer SDP","source":2}';
            spy.secondCall.args[0].should.eql(expectedResponse2);
        });
        it('onICECandidate', function() {
            var ICECandidateSDP = "ICECandidate SDP";
            var message = {
                type:"ICECandidate",
                ICECandidate:ICECandidateSDP,
                destination:3,
            };
            messageHandler(ws1, message);
            messageHandler(ws2, message);
            spy.calledTwice.should.be.true;

            var expectedResponse1 = '{"type":"ICECandidate","ICECandidate":"ICECandidate SDP","source":1}';
            spy.firstCall.args[0].should.eql(expectedResponse1);
            var expectedResponse2 = '{"type":"ICECandidate","ICECandidate":"ICECandidate SDP","source":2}';
            spy.secondCall.args[0].should.eql(expectedResponse2);
        });
    });
    describe('Offline', function() {
        it('onLeave', function() {
          ws1 = new WsMock();
          ws1.id = 1;
          ws2 = new WsMock();
          ws2.id = 2;

          var message = {
              type:"offline",
              id:2
          };

          messageHandler._connectedPeers[1] = ws1;
          messageHandler._connectedPeers[2] = ws2;
          messageHandler(ws2, message);
          should.not.exist(messageHandler._connectedPeers[2]);
          messageHandler._connectedPeers[1].should.be.equal(ws1);


        });
    });
});
