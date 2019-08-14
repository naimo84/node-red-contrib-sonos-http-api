"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SonosHelper_1 = require("./SonosHelper");
var SonosClient_1 = require("./SonosClient");
module.exports = function (RED) {
    'use strict';
    var helper = new SonosHelper_1.default();
    var _configNode;
    function Node(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        var configNode = RED.nodes.getNode(n.confignode);
        this._configNode = configNode;
        var isValid = helper.validateConfigNode(node, configNode);
        if (!isValid)
            return;
        //clear node status
        node.status({});
        //Hmmm?		
        node.songuri = n.songuri;
        node.position = n.position;
        node.favourite = n.favourite;
        if (node.position === "empty") {
            node.position = "";
        }
        node.positioninqueue = n.positioninqueue;
        //handle input message
        node.on('input', function (msg) {
            helper.preprocessInputMsg(node, configNode, msg, function (device) {
                setSonosQueue(node, msg, device.name, configNode);
            });
        });
    }
    function setSonosQueue(node, msg, name, configNode) {
        var topic = "";
        if (msg.topic !== null && msg.topic !== undefined && msg.topic)
            topic = msg.topic;
        if (topic.indexOf('set')) {
            var topics = topic.split('/');
            if (topics && topics.length >= 4) {
                name = topics[2];
            }
        }
        var client = new SonosClient_1.default(name, configNode);
        if (client === null || client === undefined) {
            node.status({ fill: "red", shape: "dot", text: "sonos client is null" });
            return;
        }
        var payload = JSON.parse(msg.payload);
        var _songuri = node.songuri;
        var _name = node.name;
        if (payload.songuri)
            _songuri = payload.songuri;
        if (node.position === "next" || payload.position === "next") {
            node.log("Queueing URI next: " + _songuri);
            client.queueNext(_songuri, function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, null, null);
            });
        }
        else if (node.position === "directplay" || payload.position === "directplay") {
            node.log("Direct play URI: " + _songuri);
            client.play(_songuri, function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, null, null);
            });
        }
        else if (node.position === "notify" || payload.position === "notify" || node.position === "clip" || payload.position === "clip") {
            if (node.context().get('clip') === true) {
                node.status({ fill: "red", shape: "dot", text: "already clippall" });
                return;
            }
            node.context().set('clip', true);
            node.log("Direct play URI: " + _songuri);
            client.clip(_songuri, payload.volume || 30, function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, null, null);
            });
            setTimeout(function () {
                node.context().set('clip', false);
            }, 10 * 1000);
        }
        else if (node.position === "favourite" || payload.position === "favourite") {
            var _favourite = node.favourite;
            if (payload.favourite)
                _favourite = payload.favourite;
            node.log("favourite: " + _songuri);
            client.favourite(_favourite, payload.volume || 30, function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, null, null);
            });
        }
        else if (node.position === "tuneinradio" || payload.position === "tuneinradio") {
            node.log("Play Tune In Radio ID: " + _songuri);
            client.playTuneinRadio(_songuri, _name, function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, null, null);
            });
        }
        else {
            // Default is append to the end of current queue
            var set_position = 0;
            // Evaluate different inputs (json payload preferred, node option second, default third)
            if (payload.position) {
                set_position = payload.position;
            }
            else if (node.positioninqueue) {
                if (isNaN(node.positioninqueue) == false) {
                    set_position = parseInt(node.positioninqueue, 10);
                }
            }
            // Queue song now
            node.log("Queuing at " + set_position + " URI: " + _songuri);
            client.queue(_songuri, set_position, function (err, result) {
                helper.handleSonosApiRequest(node, err, result, msg, null, null);
            });
        }
    }
    RED.httpAdmin.get("/sonosFavourites", function (req, res) {
        RED.log.debug("GET /sonosFavourites");
        discoverFavourites(function (Favourites) {
            RED.log.debug("GET /sonosFavourites: " + Favourites.length + " found");
            res.json(Favourites);
        });
    });
    function discoverFavourites(discoveryCallback) {
        RED.log.debug("Start Favourites discovery");
        var client = new SonosClient_1.default("Wohnzimmer", this._configNode);
        client.getFavourites(discoveryCallback);
    }
    RED.nodes.registerType('sonos-http-api-queue', Node);
};
