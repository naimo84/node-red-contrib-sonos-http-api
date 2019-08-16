import SonosClient from './SonosClient';

module.exports = function (RED:any) {
    'use strict';
    var config2:any;

    function SonosPlayerNode(config) {
        RED.nodes.createNode(this, config);
        this.ip = config.ip;       
        this.name = config.name;
        this.username = config.username;
        this.password = config.password;
        config2=config;
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
        var client = new SonosClient(null,config2);	      
        client.getDevices(discoveryCallback);
    }

    RED.httpAdmin.get("/sonosFavourites", function (req, res) {
		RED.log.debug("GET /sonosFavourites");
		discoverFavourites((Favourites) => {
			RED.log.debug("GET /sonosFavourites: " + Favourites.length + " found");
			res.json(Favourites);
		});
	});

	function discoverFavourites(discoveryCallback) {
		RED.log.debug("Start Favourites discovery");
		var client = new SonosClient(null, config2);
		client.getFavourites(discoveryCallback);
	}

    RED.nodes.registerType("sonos-http-api-config", SonosPlayerNode);
}
