"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SonosClient_1 = require("./SonosClient");
module.exports = function (RED) {
    'use strict';
    function SonosPlayerNode(config) {
        RED.nodes.createNode(this, config);
        this.ip = config.ip;
        this.player = config.player;
        this.name = config.name;
        this.username = config.username;
        this.password = config.password;
    }
    RED.httpAdmin.get("/sonosSearch", function (req, res) {
        RED.log.debug("GET /sonosSearch");
        discoverSonos(function (devices) {
            RED.log.debug("GET /sonosSearch: " + devices.length + " found");
            res.json(devices);
        });
    });
    function discoverSonos(discoveryCallback) {
        RED.log.debug("Start Sonos discovery");
        var client = new SonosClient_1.default();
        client.getDevices(discoveryCallback);
    }
    RED.nodes.registerType("sonos-http-api-config", SonosPlayerNode);
};
