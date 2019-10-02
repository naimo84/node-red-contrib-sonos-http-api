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
        node.player = config.player;
        var isValid = helper.validateConfigNode(node, configNode);
        if (!isValid)
            return;
        node.status({});
        node.volume = config.volume;
        node.preset = config.preset;
        node.clip = config.clip;
        node.clipall = config.clipall;
        node.on('input', function (msg, send, done) {
            send = send || node.send;
            helper.preprocessInputMsg(node, configNode, msg, function (device) {
                handleInputMsg(node, configNode, msg, device.player, send, done);
            });
        });
    }
    function handleInputMsg(node, configNode, msg, player, send, done) {
        var payload = {};
        if (msg.payload !== null && msg.payload !== undefined && msg.payload) {
            if (typeof msg.payload !== 'object') {
                payload = JSON.parse(msg.payload);
            }
            else {
                payload = msg.payload;
            }
        }
        var topic = "";
        if (msg.topic !== null && msg.topic !== undefined && msg.topic)
            topic = msg.topic;
        if (msg.player !== null && msg.player !== undefined && msg.player)
            player = msg.player;
        if (topic.indexOf('set')) {
            var topics = topic.split('/');
            if (topics && topics.length >= 4) {
                player = topics[2];
            }
        }
        var _command = "";
        var _songuri = "";
        if (node.preset || payload.preset) {
            _command = "preset";
            _songuri = payload.preset ? payload.preset : node.preset;
        }
        else if (node.clip || payload.clip) {
            _command = "clip";
            _songuri = payload.clip ? payload.clip : node.clip;
        }
        else if (node.clipall || payload.clipall) {
            _command = "clipall";
            _songuri = payload.clipall ? payload.clipall : node.clipall;
        }
        else if (payload.command) {
            _command = payload.command;
            _songuri = payload.uri;
        }
        var client = new SonosClient_1.default(player, configNode);
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
            var currentState = state;
            if (client === null || client === undefined) {
                node.status({ fill: "red", shape: "dot", text: "sonos client is null" });
                return;
            }
            else if (_command === "preset") {
                node.status({ fill: "green", shape: "dot", text: _songuri });
                if (!_songuri) {
                    node.status({ fill: "red", shape: "dot", text: "msg.preset is not defined" });
                    send([null, { payload: "msg.preset is not defined" }]);
                    return;
                }
                client.preset(_songuri, function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "preset played " + _songuri, null, send, done);
                });
            }
            else if (_command === "clipall") {
                if (node.context().get('clip') === true) {
                    node.status({ fill: "red", shape: "dot", text: "already clipall" });
                    return;
                }
                if (!_songuri) {
                    node.status({ fill: "red", shape: "dot", text: "msg.clipall is not defined" });
                    return;
                }
                node.context().set('clip', true);
                client.clipall(_songuri, function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "clip " + _songuri, null, send, done);
                });
                setTimeout(function () {
                    node.context().set('clip', false);
                }, 10 * 1000);
            }
            else if (_command === "clip") {
                if (node.context().get('clip') === true) {
                    node.status({ fill: "red", shape: "dot", text: "already clip" });
                    return;
                }
                if (!_songuri) {
                    node.status({ fill: "red", shape: "dot", text: "msg.clip is not defined" });
                    return;
                }
                node.context().set('clip', true);
                client.clip(_songuri, 30, function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, null, null, send, done);
                });
                setTimeout(function () {
                    node.context().set('clip', false);
                }, 10 * 1000);
            }
            if (currentState && currentState.currentTrack && currentState.currentTrack.uri) {
                console.log(currentState.currentTrack.uri);
                if (currentState.playbackState !== 'STOPPED') {
                }
            }
        });
    }
    RED.nodes.registerType('sonos-http-api-notify', Node);
};
