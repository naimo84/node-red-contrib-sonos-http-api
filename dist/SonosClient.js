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
    SonosClient.prototype.setVolume = function (volume, callback) {
        this.httpCall('volume', 'status', callback, volume);
    };
    SonosClient.prototype.next = function (callback) {
        this.httpCall('next', 'status', callback);
    };
    SonosClient.prototype.previous = function (callback) {
        this.httpCall('previous', 'status', callback);
    };
    SonosClient.prototype.setMuted = function (muted, callback) {
        if (muted) {
            this.httpCall('mute', 'status', callback);
        }
        else {
            this.httpCall('unmute', 'status', callback);
        }
    };
    SonosClient.prototype.flush = function (callback) {
        this.httpCall('clearqueue', 'status', callback);
    };
    SonosClient.prototype.getQueue = function (callback) {
        this.httpCall('queue', null, callback);
    };
    SonosClient.prototype.getDevices = function (discoveryCallback) {
        var options = {};
        if (this.configNode.username) {
            options = {
                auth: {
                    username: this.configNode.username,
                    password: this.configNode.password
                }
            };
        }
        axios_1.default.get(this.configNode.ip + '/zones', options)
            .then(function (response) {
            if (response.data) {
                var devices = [];
                for (var _i = 0, _a = response.data; _i < _a.length; _i++) {
                    var coordinator = _a[_i];
                    devices.push({
                        label: coordinator.coordinator.roomName,
                        value: coordinator.coordinator.roomName
                    });
                }
                discoveryCallback(devices);
            }
        }).catch(function (err) {
            console.log(err);
        });
    };
    SonosClient.prototype.getFavourites = function (discoveryCallback) {
        var _this = this;
        this.getDevices(function (devices) {
            if (devices) {
                var urls = [_this.configNode.ip, devices[0].value];
                var url = urls.join('/');
                var options = {};
                if (_this.configNode.username) {
                    options = {
                        auth: {
                            username: _this.configNode.username,
                            password: _this.configNode.password
                        }
                    };
                }
                axios_1.default.get(url + '/favourites', options)
                    .then(function (response) {
                    if (response.data) {
                        var favourites = response.data;
                        discoveryCallback(favourites);
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            }
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
        console.log(url);
        var options = {};
        if (this.configNode.username) {
            options = {
                auth: {
                    username: this.configNode.username,
                    password: this.configNode.password
                }
            };
        }
        axios_1.default.get(url, options)
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
        var options = {};
        if (this.configNode.username) {
            options = {
                auth: {
                    username: this.configNode.username,
                    password: this.configNode.password
                }
            };
        }
        axios_1.default.get(url, options)
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
