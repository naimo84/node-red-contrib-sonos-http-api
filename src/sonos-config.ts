import SonosClient from './SonosClient';

module.exports = function (RED:any) {
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
        discoverSonos((devices) =>{
            RED.log.debug("GET /sonosSearch: " + devices.length + " found");
            res.json(devices);
        });
    });

    function discoverSonos(discoveryCallback) {
        RED.log.debug("Start Sonos discovery");       
        var client = new SonosClient(null,this);	      
        client.getDevices(discoveryCallback);
    }

    RED.nodes.registerType("sonos-http-api-config", SonosPlayerNode);
}
