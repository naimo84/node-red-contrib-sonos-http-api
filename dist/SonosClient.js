"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var SonosClient = /** @class */ (function () {
    function SonosClient(name, configNode) {
        this.name = name;
        this.configNode = configNode;
    }
    SonosClient.prototype.clip = function (_songuri, volume, callback) {
        this.httpCall('clip', 'status', callback, _songuri, volume);
    };
    SonosClient.prototype.clipall = function (uri, callback) {
        this.httpCallWithoutDevice('clipall', 'status', callback, uri);
    };
    SonosClient.prototype.favourite = function (_songuri, volume, callback) {
        this.httpCall('favourite', 'status', callback, _songuri, volume);
    };
    SonosClient.prototype.preset = function (preset, callback) {
        this.httpCall('preset', 'status', callback, preset);
    };
    SonosClient.prototype.joinGroup = function (deviceName, callback) {
        this.httpCall('add', 'status', callback, deviceName);
    };
    SonosClient.prototype.leaveGroup = function (callback) {
        this.httpCall('remove', 'status', callback, callback);
    };
    SonosClient.prototype.stop = function (callback) {
        this.httpCall('stop', 'status', callback);
    };
    SonosClient.prototype.pause = function (callback) {
        this.httpCall('pause', 'status', callback);
    };
    SonosClient.prototype.play = function (_songuri, callback) {
        this.httpCall('play', 'status', callback);
    };
    SonosClient.prototype.getCurrentState = function (stateCallback) {
        this.httpCall('state', null, stateCallback);
    };
    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------  Method not implemented  --------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    SonosClient.prototype.setVolume = function (volume, callback) {
        this.httpCall('volume', 'status', callback, volume);
    };
    SonosClient.prototype.flush = function (callback) {
        throw new Error("Method not implemented.");
    };
    SonosClient.prototype.next = function (callback) {
        throw new Error("Method not implemented.");
    };
    SonosClient.prototype.setMuted = function (_songuri, callback) {
        throw new Error("Method not implemented.");
    };
    SonosClient.prototype.previous = function (callback) {
        throw new Error("Method not implemented.");
    };
    SonosClient.prototype.getQueue = function (callback) {
        throw new Error("Method not implemented.");
    };
    SonosClient.prototype.queue = function (_songuri, set_position, callback) {
        throw new Error("Method not implemented.");
    };
    SonosClient.prototype.playTuneinRadio = function (_songuri, _name, callback) {
        throw new Error("Method not implemented.");
    };
    SonosClient.prototype.queueNext = function (_songuri, callback) {
        throw new Error("Method not implemented.");
    };
    SonosClient.prototype.getDevices = function (discoveryCallback) {
        axios_1.default.get(this.configNode.ip + '/zones', {
            auth: {
                username: this.configNode.username,
                password: this.configNode.password
            }
        })
            .then(function (response) {
            if (response.data) {
                var devices = [];
                for (var _i = 0, _a = response.data; _i < _a.length; _i++) {
                    var coordinator = _a[_i];
                    devices.push({
                        label: coordinator.coordinator.roomName,
                        value: coordinator.coordinator.uuid
                    });
                }
                discoveryCallback(devices);
            }
        }).catch(function (err) {
            console.log(err);
        });
    };
    SonosClient.prototype.getFavourites = function (discoveryCallback) {
        var urls = [this.configNode.ip, this.name];
        var url = urls.join('/');
        axios_1.default.get(url + '/favourites', {
            auth: {
                username: this.configNode.username,
                password: this.configNode.password
            }
        })
            .then(function (response) {
            if (response.data) {
                var favourites = response.data;
                discoveryCallback(favourites);
            }
        }).catch(function (err) {
            console.log(err);
        });
    };
    SonosClient.prototype.httpCall = function (action, property, callback) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var urls = [this.configNode.ip, this.name, action];
        urls = urls.concat(args);
        var url = urls.join('/');
        axios_1.default.get(url, {
            auth: {
                username: this.configNode.username,
                password: this.configNode.password
            }
        })
            .then(function (response) {
            if (response.data) {
                if (property) {
                    var data = Object(response.data);
                    if (Reflect.has(data, property)) {
                        callback(null, Reflect.get(data, property));
                    }
                }
                else {
                    callback(null, response.data);
                }
            }
        }).catch(function (err) {
            callback(err, null);
        });
    };
    SonosClient.prototype.httpCallWithoutDevice = function (action, property, callback) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var urls = [this.configNode.ip, action];
        urls = urls.concat(args);
        var url = urls.join('/');
        axios_1.default.get(url, {
            auth: {
                username: this.configNode.username,
                password: this.configNode.password
            }
        })
            .then(function (response) {
            if (response.data) {
                var data = Object(response.data);
                if (Reflect.has(data, property)) {
                    callback(null, Reflect.get(data, property));
                }
            }
        }).catch(function (err) {
            callback(err, null);
        });
    };
    return SonosClient;
}());
exports.default = SonosClient;
