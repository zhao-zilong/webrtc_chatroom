var should = require('should')
var sinon = require('sinon');
var signalingChannel = require('./signalingChannelFactory');

var WsMock = function(){
    this.send = function(){};
};

describe('signalingServer', function() {
    describe('Messages', function() {
        var spy, ws;
        beforeEach(function() {
            ws = new WsMock();

            signalingChannel._ws[0] = ws;
            spy = sinon.spy(signalingChannel._ws[0], "send");
        });
        afterEach(function() {
            spy.restore();
        });
        it('onConnectionEstablished', function() {
            signalingChannel();
            spy.calledOnce.should.be.true;

            var expectedResponse = '{"type":"init","init":"test"}';
            spy.firstCall.args[0].should.eql(expectedResponse);
        });
        it('onOffer', function() {
            var offerSDP = "offer SDP";
            signalingChannel._sendOffer(offerSDP, 2);
            spy.calledOnce.should.be.true;

            var expectedResponse = '{"type":"offer","offer":"offer SDP","destination":2}';
            spy.firstCall.args[0].should.eql(expectedResponse);
        });
        it('onAnswer', function() {
            var answerSDP = "answer SDP";
            signalingChannel._sendAnswer(answerSDP, 2);
            spy.calledOnce.should.be.true;

            var expectedResponse = '{"type":"answer","answer":"answer SDP","destination":2}';
            spy.firstCall.args[0].should.eql(expectedResponse);
        });
        it('onICECandidate', function() {
            var ICECandidateSDP = "ICECandidate SDP";
            signalingChannel._sendICECandidate(ICECandidateSDP, 2);
            spy.calledOnce.should.be.true;

            var expectedResponse = '{"type":"ICECandidate","ICECandidate":"ICECandidate SDP","destination":2}';
            spy.firstCall.args[0].should.eql(expectedResponse);
        });
    });

});
