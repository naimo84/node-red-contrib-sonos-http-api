import SonosHelper from "./SonosHelper";
import SonosClient from './SonosClient';
import { ConfigNode } from './SonosClient';

export class PayLoad {
	preset?: string;
	clip?: string;
	command?: string;
}

export interface Message {
	topic?: string;
	payload?: string;
	player?: string;
}

module.exports = function (RED) {
	'use strict';
	var helper = new SonosHelper();
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

		node.on('input', (msg: Message) => {
			helper.preprocessInputMsg(node, configNode, msg, (device) => {
				handleInputMsg(node, configNode, msg, device.player);
			});
		});
	}


	function handleInputMsg(node, configNode: ConfigNode, msg: Message, player) {
		var payload: any = {};
		if (msg.payload !== null && msg.payload !== undefined && msg.payload) {
			if (typeof msg.payload !== 'object') {
				payload = JSON.parse(msg.payload);
			} else {
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

		let _command = "";
		var _songuri = "";
		if (node.preset || payload.preset) {
			_command = "preset";
			_songuri = payload.preset ? payload.preset : node.preset;
		} else if (node.clip || payload.clip) {
			_command = "clip";
			_songuri = payload.clip ? payload.clip : node.clip;
		} else if (node.clipall || payload.clipall) {
			_command = "clipall";
			_songuri = payload.clip ? payload.clipall : node.clipall;
		} else if (payload.command) {
			_command = payload.command;
			_songuri = payload.uri;
		}

		var client = new SonosClient(player, configNode);
		if (client === null || client === undefined) {
			node.status({ fill: "red", shape: "dot", text: "sonos client is null" });
			return;
		}
		else if (_command === "preset") {
			node.status({ fill: "green", shape: "dot", text: _songuri });

			if (!_songuri) {
				node.status({ fill: "red", shape: "dot", text: "msg.preset is not defined" });
				return;
			}

			client.preset(_songuri, (err, result) => {
				helper.handleSonosApiRequest(node, err, result, msg, "preset played " + _songuri, null);
			});

		}
		else if (_command === "clipall") {
			if (node.context().get('clip') === true) {
				node.status({ fill: "red", shape: "dot", text: "already clipall" });
				return;
			}
			if (!_songuri) {
				node.status({ fill: "red", shape: "dot", text: "msg.clip is not defined" });
				return;
			}
			node.context().set('clip', true);
			client.clipall(_songuri, (err, result) => {
				helper.handleSonosApiRequest(node, err, result, msg, "clip " + _songuri, null);
			});
			setTimeout(() => {
				node.context().set('clip', false);
			}, 10 * 1000);
		}
		else if (_command === "clip") {
			if (node.context().get('clip') === true) {
				node.status({ fill: "red", shape: "dot", text: "already clip" });
				return;
			}

			node.context().set('clip', true);
			client.clip(_songuri, 30, (err, result) => {
				helper.handleSonosApiRequest(node, err, result, msg, null, null);
			});

			setTimeout(() => {
				node.context().set('clip', false);
			}, 10 * 1000);
		}

		node.send(msg);
	}



	RED.nodes.registerType('sonos-http-api-notify', Node);
}