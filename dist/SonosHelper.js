'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var SonosHelper = /** @class */ (function () {
    function SonosHelper() {
    }
    SonosHelper.prototype.validateConfigNode = function (node, configNode) {
        if (configNode === undefined || configNode === null) {
            node.status({ fill: "red", shape: "ring", text: "please select a config node" });
            return false;
        }
        node.status({});
        return true;
    };
    SonosHelper.prototype.preprocessInputMsg = function (node, configNode, msg, callback) {
        var isValid = this.validateConfigNode(node, configNode);
        if (!isValid)
            return;
        configNode.player = node.player;
        if (callback)
            callback(configNode);
        return;
    };
    SonosHelper.prototype.handleSonosApiRequest = function (node, err, result, msg, successString, failureString, send, done) {
        if (err) {
            node.error(err);
            if (!failureString)
                failureString = "failed to execute request";
            node.status({ fill: "red", shape: "dot", text: failureString });
            return;
        }
        if (err) {
            if (done) {
                done(err);
            }
            else {
                node.error(err, msg);
            }
            node.send([null, { payload: err }]);
            if (!failureString)
                failureString = "failed to execute request";
            node.status({ fill: "red", shape: "dot", text: failureString });
            return;
        }
        else {
            node.send([{ payload: "OK" }, null]);
            msg.payload = result;
            if (!successString)
                successString = "request success";
            node.status({ fill: "blue", shape: "dot", text: successString });
            if (done) {
                done();
            }
        }
    };
    return SonosHelper;
}());
exports.SonosHelper = SonosHelper;
exports.default = SonosHelper;
