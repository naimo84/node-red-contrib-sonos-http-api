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
        node.mode = config.mode;
        node.track = config.track;
        node.volume = config.volume;
        if (node.volume === "empty")
            node.volume = "";
        node.volume_value = config.volume_value;
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
            payload = msg.payload;
        }
        var topic = "";
        if (msg.topic !== null && msg.topic !== undefined && msg.topic)
            topic = msg.topic;
        if (msg.player !== null && msg.player !== undefined && msg.player)
            player = msg.player;
        if (topic.length > 0 && topic.indexOf('set')) {
            var topics = topic.split('/');
            if (topics && topics.length >= 4) {
                player = topics[2];
            }
        }
        var newPayload = new PayLoad();
        var client = new SonosClient_1.default(player, configNode);
        if (client === null || client === undefined) {
            node.status({ fill: "red", shape: "dot", text: "sonos client is null" });
            return;
        }
        if (payload === "play" || payload === "pause" || payload === "stop" || payload === "toggle" || payload === "playpause") {
            newPayload = { mode: payload };
        }
        else if (payload === "next" || payload === "previous") {
            newPayload = { track: payload };
        }
        else if (payload === "mute" || payload === "unmute" || payload === "vol_up" || payload === "vol_down" || payload === "vol+" || payload === "vol+") {
            newPayload = { volume: payload };
        }
        else if (payload.indexOf("+") >= 0 && parseInt(payload) > 0 && parseInt(payload) <= 100) {
            newPayload = { volume: "vol_up", volstep: parseInt(payload) };
        }
        else if (payload.indexOf("-") >= 0 && parseInt(payload) < 0 && parseInt(payload) >= -100) {
            newPayload = { volume: "vol_down", volstep: -parseInt(payload) };
        }
        else if (!isNaN(parseInt(payload)) && parseInt(payload) >= 0 && parseInt(payload) <= 100) {
            newPayload = { volume: "vol_set", volume_value: payload };
        }
        else if (payload === "flush" || payload === "clear") {
            newPayload = { command: "flush" };
        }
        else if (payload === "join" || payload === "join_group" || payload === "joingroup" || payload === "join group") {
            newPayload = { command: "join_group" };
            handleGroupingCommand(node, msg, client, newPayload, send, done);
        }
        else if (payload === "leave" || payload === "leave_group" || payload === "leavegroup" || payload === "leave group") {
            newPayload = { command: "leave_group" };
            handleGroupingCommand(node, msg, client, newPayload, send, done);
        }
        var _mode = newPayload.mode;
        if (node.mode)
            _mode = node.mode;
        var _track = newPayload.track;
        if (node.track)
            _track = node.track;
        var _volume = newPayload.volume;
        if (node.volume)
            _volume = node.volume;
        var _command = newPayload.command;
        if (node.command)
            _command = node.command;
        if (_mode)
            handleCommand(node, msg, client, _mode, send, done);
        if (_track)
            handleCommand(node, msg, client, _track, send, done);
        if (_volume)
            handleCommand(node, msg, client, _volume, send, done);
        if (_command)
            handleCommand(node, msg, client, _command, send, done);
        if (newPayload.volume || node.volume)
            handleVolumeCommand(node, msg, client, newPayload, send, done);
    }
    function handleCommand(node, msg, client, cmd, send, done) {
        switch (cmd) {
            case "pause":
                client.pause(function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "paused", null, send, done);
                });
                break;
            case "stop":
                client.stop(function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "stopped", null, send, done);
                });
                break;
            case "toggle":
            case "playpause":
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
                    if (state.playbackState.toUpperCase() === "PLAYING") {
                        client.pause(function (err, result) {
                            helper.handleSonosApiRequest(node, err, result, msg, "paused", null, send, done);
                        });
                    }
                    else {
                        client.play('', function (err, result) {
                            helper.handleSonosApiRequest(node, err, result, msg, "playing", null, send, done);
                        });
                    }
                });
                break;
            case "play":
            case "playing":
                client.play('', function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "playing", null, send, done);
                });
                break;
            case "next":
                client.next(function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "next", null, send, done);
                });
                break;
            case "previous":
                client.previous(function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "previous", null, send, done);
                });
                break;
            case "mute":
                client.setMuted(true, function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "muted", null, send, done);
                });
                break;
            case "unmute":
                client.setMuted(false, function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "unmuted", null, send, done);
                });
                break;
            case "flush":
                client.flush(function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "queue cleared", null, send, done);
                });
                break;
        }
    }
    function handleVolumeCommand(node, msg, client, payload, send, done) {
        var _volumeFunction;
        var _volumeValue;
        //Use payload values as default
        if (payload.volume) {
            if (payload.volume === "vol_up" || payload.volume === "volup" || payload.volume === "vol+") {
                _volumeFunction = "vol_up";
                _volumeValue = payload.volstep;
            }
            else if (payload.volume === "vol_down" || payload.volume === "voldown" || payload.volume === "vol-") {
                _volumeFunction = "vol_down";
                _volumeValue = payload.volstep;
            }
            else if (payload.volume === "mute") {
                _volumeFunction = "mute";
            }
            else if (payload.volume === "unmute") {
                _volumeFunction = "unmute";
            }
            else if (payload.volume === "vol_set") {
                _volumeFunction = "vol_set";
                _volumeValue = payload.volume_value;
            }
        }
        //Use payload values only if config via dialog is empty
        if (node.volume === "volume") {
            _volumeFunction = "vol_set";
            _volumeValue = node.volume_value;
        }
        else if (node.volume === "vol_up") {
            _volumeFunction = "vol_up";
            _volumeValue = node.volume_value;
        }
        else if (node.volume === "vol_down") {
            _volumeFunction = "vol_down";
            _volumeValue = node.volume_value;
        }
        else if (node.volume === "mute") {
            _volumeFunction = "mute";
        }
        else if (node.volume === "unmute") {
            _volumeFunction = "unmute";
        }
        switch (_volumeFunction) {
            case "vol_set":
                var volume_val = parseInt(_volumeValue);
                if (isNaN(volume_val) || volume_val < 0 || volume_val > 100) {
                    node.status({ fill: "red", shape: "dot", text: "invalid value for volume" });
                    break;
                }
                client.setVolume(_volumeValue, function (err, result) {
                    helper.handleSonosApiRequest(node, err, result, msg, "vol: " + String(_volumeValue), null, send, done);
                });
                break;
            case "vol_up":
                var volume_step = parseInt(_volumeValue);
                if (isNaN(volume_step) || volume_step > 100 || volume_step <= 0)
                    volume_step = 5;
                client.getCurrentState(function (err, result) {
                    if (err) {
                        node.error(JSON.stringify(err));
                        node.status({ fill: "red", shape: "dot", text: "failed to execute request" });
                        return;
                    }
                    var volume_val = result.volume + volume_step;
                    volume_val = Math.min(100, volume_val);
                    volume_val = Math.max(0, volume_val);
                    client.setVolume(volume_val, function (err, result) {
                        helper.handleSonosApiRequest(node, err, result, msg, "vol: " + String(volume_val), null, send, done);
                    });
                });
                break;
            case "vol_down":
                var volume_step = parseInt(_volumeValue);
                if (isNaN(volume_step) || volume_step > 100 || volume_step <= 0)
                    volume_step = 5;
                client.getCurrentState(function (err, result) {
                    if (err) {
                        node.error(JSON.stringify(err));
                        node.status({ fill: "red", shape: "dot", text: "failed to execute request" });
                        return;
                    }
                    var volume_val = result.volume - volume_step;
                    volume_val = Math.min(100, volume_val);
                    volume_val = Math.max(0, volume_val);
                    client.setVolume(volume_val, function (err, result) {
                        helper.handleSonosApiRequest(node, err, result, msg, "vol: " + String(volume_val), null, send, done);
                    });
                });
                break;
        }
    }
    function handleGroupingCommand(node, msg, client, payload, send, done) {
        node.status({ fill: "green", shape: "dot", text: payload.command });
        if (payload.command === "leave_group") {
            client.leaveGroup(function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, "left group", null, send, done);
            });
        }
        if (payload.command === "join_group") {
            var deviceName = msg.topic;
            if (!deviceName) {
                node.status({ fill: "red", shape: "dot", text: "msg.topic is not defined" });
                return;
            }
            client.joinGroup(deviceName, function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, "joined group with " + deviceName, null, send, done);
            });
        }
    }
    RED.nodes.registerType('sonos-http-api-control', Node);
};
