import SonosHelper from "./SonosHelper";
import SonosClient from './SonosClient';
import { ConfigNode } from './SonosClient';

module.exports = function (RED) {
	'use strict';
	var helper = new SonosHelper();

	function Node(n) {

		RED.nodes.createNode(this, n);
		var node = this;
		var configNode = RED.nodes.getNode(n.confignode);
		this._configNode = configNode;
		node.player = n.player;
		var isValid = helper.validateConfigNode(node, configNode);
		if (!isValid)
			return;

		node.status({});

		node.songuri = n.songuri;
		node.position = n.position;
		node.favourite = n.favourite;
		if (node.position === "empty") {
			node.position = "";
		}
		node.positioninqueue = n.positioninqueue;

		node.on('input', function (msg) {
			helper.preprocessInputMsg(node, configNode, msg, (device) => {
				setSonosQueue(node, msg, device.player, configNode);
			});
		});
	}

	function setSonosQueue(node, msg, player, configNode: ConfigNode) {
		var topic = "";
		if (msg.topic !== null && msg.topic !== undefined && msg.topic)
			topic = msg.topic;

		if (topic.indexOf('set')) {
			var topics = topic.split('/');
			if (topics && topics.length >= 4) {
				player = topics[2];
			}
		}

		var client = new SonosClient(player, configNode);
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
			// client.queueNext(_songuri, (err, result) => {
			// 	helper.handleSonosApiRequest(node, err, result, msg, null, null);
			// });
		}
		else if (node.position === "directplay" || payload.position === "directplay") {
			client.play(_songuri, (err, result) => {
				helper.handleSonosApiRequest(node, err, result, msg, null, null);
			});
		}
		else if (node.position === "favourite" || payload.position === "favourite") {
			let _favourite = node.favourite;
			if (payload.favourite)
				_favourite = payload.favourite;
			client.favourite(_favourite, payload.volume || 30, (err, result) => {
				helper.handleSonosApiRequest(node, err, result, msg, null, null);
			});
		}
		else if (node.position === "tuneinradio" || payload.position === "tuneinradio") {
			// client.playTuneinRadio(_songuri, _name, (err, result) => {
			// 	helper.handleSonosApiRequest(node, err, result, msg, null, null);
			// });
		}
		else {
			var set_position = 0;
			if (payload.position) {
				set_position = payload.position;
			} else if (node.positioninqueue) {
				if (isNaN(node.positioninqueue) == false) {
					set_position = parseInt(node.positioninqueue, 10);
				}
			}

			// client.queue(_songuri, set_position, (err, result) => {
			// 	helper.handleSonosApiRequest(node, err, result, msg, null, null);
			// });
		}
	}


	RED.nodes.registerType('sonos-http-api-queue', Node);
}
