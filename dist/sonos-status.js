"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SonosHelper_1 = require("./SonosHelper");
var SonosClient_1 = require("./SonosClient");
module.exports = function status(RED) {
    'use strict';
    var helper = new SonosHelper_1.default();
    function Node(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var configNode = RED.nodes.getNode(n.confignode);
        var isValid = helper.validateConfigNode(node, configNode);
        if (!isValid)
            return;
        node.status({});
        node.on('input', function (msg) {
            helper.preprocessInputMsg(node, configNode, msg, function (device) {
                getSonosCurrentState(node, msg, device.player, configNode);
            });
        });
    }
    function getSonosCurrentState(node, msg, player, configNode) {
        var client = new SonosClient_1.default(player, configNode);
        if (client === null || client === undefined) {
            node.status({ fill: "red", shape: "dot", text: "sonos client is null" });
            return;
        }
        client.getCurrentState(function (err, state) {
            if (err) {
                node.error(JSON.stringify(err));
                node.status({ fill: "red", shape: "dot", text: "failed to retrieve current state" });
                return;
            }
            if (state === null || state === undefined) {
                node.status({ fill: "red", shape: "dot", text: "invalid current state retrieved" });
                return;
            }
            msg.payload = state;
            node.send(msg);
        });
    }
    RED.nodes.registerType('sonos-http-api-status', Node);
};
