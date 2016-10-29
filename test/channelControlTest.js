var should = require('should')
var sinon = require('sinon');
var channelControl = require('./channelControl');

var datachannel = function(name) {
    this.readyState = name;
};
var clock = sinon.useFakeTimers();
describe('channelControl', function() {
    describe('UpdateChannel and onAnserOnlineList', function() {
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
            channelControl._updateChannel();
            //wait for the finish of setTimeout() in channelControl().
            clock.tick(500);
            //ws0 and ws1 shoule be deleted, ws2 become first, ws3 should be recreated
            channelControl._channel[0][1].should.be.equal(ws2);
            channelControl._channel[1][1].should.not.be.equal(ws3);


            should.not.exist(channelControl._channel[2]);
            should.not.exist(channelControl._channel[3]);
            should.not.exist(channelControl._channel[4]);

        });
        it('update local connection from information of server ', function() {

            var ws0 = new datachannel("open");
            var ws1 = new datachannel("open");
            var ws2 = new datachannel("open");


            channelControl._channel[0] = [0, ws0];
            channelControl._channel[1] = [1, ws1];
            channelControl._channel[2] = [2, ws2];
            //here we suppose localname = 4
            var peers = [0,1,2,3,4];

            should.not.exist(channelControl._channel[3]);
            //now, it has 0, 1 and 2 in local channnel, it should add user 3 in local
            //channel after invoke function onAnserOnlineList()
            channelControl._onAnserOnlineList(peers);

            channelControl._channel[3][0].should.be.equal(3);
            //should not add himself
            should.not.exist(channelControl._channel[4]);

        });
    });
});
