'use strict';

export class SonosHelper {
    constructor() {
    }

    validateConfigNode(node, configNode) {
        if (configNode === undefined || configNode === null) {
            node.status({ fill: "red", shape: "ring", text: "please select a config node" });
            return false;
        }

        var hasPlayer = node.player !== undefined && node.player !== null && node.player.trim().length > 3;
        if (!hasPlayer) {
            node.status({ fill: "red", shape: "ring", text: "missing player name" });
            return false;
        }

        node.status({});
        return true;
    }

    preprocessInputMsg(node, configNode, msg, callback) {
        var isValid = this.validateConfigNode(node, configNode);
        if (!isValid)
            return;

        configNode.player = node.player;

        if (callback)
            callback(configNode);
        return;
    }


    handleSonosApiRequest(node, err, result, msg, successString, failureString) {
        if (err) {
            node.error(err);
            if (!failureString)
                failureString = "failed to execute request";
            node.status({ fill: "red", shape: "dot", text: failureString });
            return;
        }

        msg.payload = result;

        if (!successString)
            successString = "request success";
        node.status({ fill: "blue", shape: "dot", text: successString });
    }
}

export default SonosHelper;