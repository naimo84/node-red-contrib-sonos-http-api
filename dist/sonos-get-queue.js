"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SonosHelper_1 = require("./SonosHelper");
var SonosClient_1 = require("./SonosClient");
module.exports = function (RED) {
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
                getSonosCurrentQueue(node, msg, device.player, configNode);
            });
        });
    }
    function getSonosCurrentQueue(node, msg, player, configNode) {
        var client = new SonosClient_1.default(player, configNode);
        if (client === null || client === undefined) {
            node.status({ fill: "red", shape: "dot", text: "sonos client is null" });
            return;
        }
        client.getQueue(function (err, queueObj) {
            if (err) {
                if (err === "{}") {
                    node.error(JSON.stringify(err));
                    node.status({ fill: "blue", shape: "dot", text: "queue is empty" });
                    msg.payload = [];
                    node.send(msg);
                }
                else {
                    node.error(JSON.stringify(err));
                    node.status({ fill: "red", shape: "dot", text: "failed to retrieve current queue" });
                }
                return;
            }
            if (queueObj === null || queueObj === undefined || queueObj.items === undefined || queueObj.items === null) {
                node.status({ fill: "red", shape: "dot", text: "invalid current queue retrieved" });
                return;
            }
            var tracksArray = queueObj.items;
            msg.payload = tracksArray;
            node.send(msg);
        });
    }
    RED.nodes.registerType('sonos-http-api-get-queue', Node);
};
