var should = require('should')
var sinon = require('sinon');
var channelControl = require('../test/channelControl');

var datachannel = function(name) {
    this.readyState = name;
};

describe('channelControl', function() {
    describe('UpdateChannel', function() {
        it('test all kinds of readyState', function() {

            var ws0 = new datachannel("closing");
            var ws1 = new datachannel("closed");
            var ws2 = new datachannel("open");
            var ws3 = new datachannel("connecting");
            var ws4 = new datachannel(undefined);

            channelControl._channel[0] = [0, ws0];
            channelControl._channel[1] = [1, ws1];
            channelControl._channel[2] = [2, ws2];
            channelControl._channel[3] = [3, ws3];
            channelControl._channel[4] = [4, ws4];
            channelControl();

            //ws0 and ws1 shoule be deleted, ws2 become first, ws3 should be recreated
            channelControl._channel[0][1].should.be.equal(ws2);
            channelControl._channel[1][1].should.not.be.equal(ws3);


            should.not.exist(channelControl._channel[2]);
            should.not.exist(channelControl._channel[3]);
            should.not.exist(channelControl._channel[4]);

        });
    });
});
