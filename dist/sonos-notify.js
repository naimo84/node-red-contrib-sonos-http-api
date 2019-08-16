"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SonosHelper_1 = require("./SonosHelper");
var SonosClient_1 = require("./SonosClient");
var PayLoad = /** @class */ (function () {
    function PayLoad() {
    }
    return PayLoad;
}());
exports.PayLoad = PayLoad;
module.exports = function (RED) {
    'use strict';
    var helper = new SonosHelper_1.default();
    function Node(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var configNode = RED.nodes.getNode(config.confignode);
        var isValid = helper.validateConfigNode(node, configNode);
        if (!isValid)
            return;
        node.status({});
        node.on('input', function (msg) {
            helper.preprocessInputMsg(node, configNode, msg, function (device) {
                handleInputMsg(node, configNode, msg, device.player);
            });
        });
    }
    function handleInputMsg(node, configNode, msg, player) {
        var payload = "";
        if (msg.payload !== null && msg.payload !== undefined && msg.payload)
            payload = "" + msg.payload;
        payload = payload.toLowerCase();
        var topic = "";
        if (msg.topic !== null && msg.topic !== undefined && msg.topic)
            topic = msg.topic;
        if (topic.indexOf('set')) {
            var topics = topic.split('/');
            if (topics && topics.length >= 4) {
                player = topics[2];
            }
        }
        var client = new SonosClient_1.default(player, configNode);
        if (client === null || client === undefined) {
            node.status({ fill: "red", shape: "dot", text: "sonos client is null" });
            return;
        }
        else if (payload.indexOf("preset-") >= 0) {
            var preset = payload.split("-")[1];
            node.status({ fill: "green", shape: "dot", text: preset });
            if (!preset) {
                node.status({ fill: "red", shape: "dot", text: "msg.preset is not defined" });
                return;
            }
            client.preset(preset, function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, "preset played " + preset, null);
            });
        }
        else if (payload.indexOf("clipall-") >= 0) {
            var clip = payload.split("-")[1];
            if (node.context().get('clip') === true) {
                node.status({ fill: "red", shape: "dot", text: "already clipall" });
                return;
            }
            if (!clip) {
                node.status({ fill: "red", shape: "dot", text: "msg.clip is not defined" });
                return;
            }
            node.context().set('clip', true);
            client.clipall(clip, function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, "clip " + clip, null);
            });
            setTimeout(function () {
                node.context().set('clip', false);
            }, 10 * 1000);
        }
        else if (node.notify !== undefined || node.notify !== null) {
            var _songuri = node.notify;
            if (node.context().get('clip') === true) {
                node.status({ fill: "red", shape: "dot", text: "already clip" });
                return;
            }
            node.context().set('clip', true);
            client.clip(_songuri, 30, function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, null, null);
            });
            setTimeout(function () {
                node.context().set('clip', false);
            }, 10 * 1000);
        }
        node.send(msg);
    }
    RED.nodes.registerType('sonos-http-api-notify', Node);
};
