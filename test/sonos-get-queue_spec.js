var should = require("should");
var helper = require("node-red-node-test-helper");

helper.init(require.resolve('node-red'));

describe('Get queue Node', function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload().then(function () {
            helper.stopServer(done);
        });
    });

    it('should be loaded', function (done) {
        var flow = [
            { id: "c1", type: "sonos-http-api-config" },
            { id: "n1", type: "sonos-http-api-get-queue", config: "c1" }
        ];
        var sonosNode = require("../dist/sonos-get-queue.js");
        var configNode = require("../dist/sonos-config.js");



        helper.load([configNode, sonosNode], flow, function () {
            var n1 = helper.getNode("n1");
            n1.should.have.property('type', 'sonos-http-api-get-queue');
            done();
        });
    });
});
