import  SonosHelper  from "./SonosHelper";
import SonosClient from './SonosClient';
import { ConfigNode } from './SonosClient';



module.exports = function(RED) {
	'use strict';
	var helper = new SonosHelper();
	function Node(n) {

		RED.nodes.createNode(this, n);
		var node = this;
		var configNode = RED.nodes.getNode(n.confignode);

		var isValid = helper.validateConfigNode(node, configNode);
		if (!isValid)
			return;

		//clear node status
		node.status({});

		//handle input message
		node.on('input', function (msg) {
			helper.preprocessInputMsg(node, configNode, msg, function(device) {
				getSonosCurrentQueue(node, msg, device.name, configNode);
			});
		});
	}

	//------------------------------------------------------------------------------------------

	function getSonosCurrentQueue(node, msg, name, configNode:ConfigNode) 
	{
		var client = new SonosClient(name, configNode);
		if (client === null || client === undefined) {
			node.status({fill:"red", shape:"dot", text:"sonos client is null"});
			return;
		}

		client.getQueue(function (err, queueObj) {
			if (err) {
				if (err === "{}") {
					node.error(JSON.stringify(err));
					node.status({fill:"blue", shape:"dot", text:"queue is empty"});
					msg.payload = [];
					node.send(msg);
				}
				else {
					node.error(JSON.stringify(err));
					node.status({fill:"red", shape:"dot", text:"failed to retrieve current queue"});
				}
				return;
			}
			if (queueObj === null || queueObj === undefined || queueObj.items === undefined || queueObj.items === null) {
				node.status({fill:"red", shape:"dot", text:"invalid current queue retrieved"});
				return;
			}
			
			var tracksArray = queueObj.items;

			//massage albumArtURL
			// tracksArray.forEach(function(trackObj) {
			// 	if (trackObj.albumArtURL !== undefined && trackObj.albumArtURL !== null) {
			// 		var port = 1400;
			// 		trackObj.albumArtURI = trackObj.albumArtURL;
			// 		trackObj.albumArtURL = "http://" + name + ":" + port + trackObj.albumArtURI;
			// 	}
			// });

			//Output data
			msg.payload = tracksArray;

			//Send output
			node.send(msg);
		});
	}
	
	RED.nodes.registerType('sonos-http-api-get-queue', Node);
};