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
        var hasIpName = configNode.name !== undefined && configNode.name !== null && configNode.name.trim().length > 3;
        if (!hasIpName) {
            node.status({ fill: "red", shape: "ring", text: "missing serial number or IP Address in config node" });
            return false;
        }
        //clear node status
        node.status({});
        return true;
    };
    SonosHelper.prototype.preprocessInputMsg = function (node, configNode, msg, callback) {
        var isValid = this.validateConfigNode(node, configNode);
        if (!isValid)
            return;
        if (callback)
            callback(configNode);
        return;
    };
    SonosHelper.prototype.handleSonosApiRequest = function (node, err, result, msg, successString, failureString) {
        if (err) {
            node.error(err);
            console.log(err);
            if (!failureString)
                failureString = "failed to execute request";
            node.status({ fill: "red", shape: "dot", text: failureString });
            return;
        }
        msg.payload = result;
        if (!successString)
            successString = "request success";
        node.status({ fill: "blue", shape: "dot", text: successString });
    };
    return SonosHelper;
}());
exports.SonosHelper = SonosHelper;
exports.default = SonosHelper;
