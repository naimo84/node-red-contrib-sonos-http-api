import axios, { AxiosResponse } from 'axios';

export interface CurrentTrack {
    artist: string;
    title: string;
    album: string;
    albumArtURI: string;
    duration: number;
    uri: string;
}
export interface NextTrack {
    artist: string;
    title: string;
    album: string;
    albumArtURI: string;
    duration: number;
    uri: string;
}
export interface ZonePlayMode {
    shuffle: boolean;
    repeat: boolean;
    crossfade: boolean;
}
export interface Equalizer {
    bass: number;
    treble: number;
    loudness: boolean;
}
export interface SonosState {
    currentTrack: CurrentTrack;
    nextTrack: NextTrack;
    volume: number;
    mute: boolean;
    trackNo: number;
    elapsedTime: number;
    elapsedTimeFormatted: string;
    zoneState: string;
    playerState: string;
    zonePlayMode: ZonePlayMode;
    equalizer: Equalizer;
}

export interface ConfigNode {
    ip: string;
    name: string;
    player: string;
    username: string;
    password: string;
}

export interface actionCallback {
    status: string;
}
export default class SonosClient {
    clip(_songuri: any, volume: number, callback: (err: any, result: any) => void) {
        this.httpCall<SonosState>('clip', 'status', callback, _songuri, volume);
    }
    clipall(uri: any, callback: (err: any, result: any) => void): any {
        this.httpCallWithoutDevice<SonosState>('clipall', 'status', callback, uri);
    }

    favourite(_songuri: any, volume: any, callback: (err: any, result: any) => void) {
        this.httpCall<SonosState>('favourite', 'status', callback, _songuri, volume);
    }

    preset(preset: any, callback: (err: any, result: any) => void): any {
        this.httpCall<SonosState>('preset', 'status', callback, preset);
    }

    joinGroup(deviceName: any, callback: (err: any, result: any) => void): any {
        this.httpCall<SonosState>('add', 'status', callback, deviceName);
    }
    leaveGroup(callback: (err: any, result: any) => void): any {
        this.httpCall<SonosState>('remove', 'status', callback, callback);
    }

    stop(callback: (err: any, result: any) => void) {
        this.httpCall<SonosState>('stop', 'status', callback);
    }
    pause(callback: (err: any, result: any) => void) {
        this.httpCall<SonosState>('pause', 'status', callback);
    }

    play(_songuri: string, callback: (err: any, result: any) => void) {
        this.httpCall<SonosState>('play', 'status', callback);
    }

    getCurrentState(stateCallback: (err: any, state: SonosState) => void) {
        this.httpCall<SonosState>('state', null, stateCallback);
    }


    name?: string;
    configNode?: ConfigNode;
    constructor(name?: string, configNode?: any) {
        this.name = name;
        this.configNode = configNode;
    }

    getDevices(discoveryCallback: (arg0: any[]) => void) {
        let options = {};
        if (this.configNode.username) {
            options = {
                auth: {
                    username: this.configNode.username,
                    password: this.configNode.password
                }
            }
        }

        axios.get(this.configNode.ip + '/zones', options)
            .then((response) => {
                if (response.data) {
                    var devices = [];
                    for (var coordinator of response.data) {
                        devices.push({
                            label: coordinator.coordinator.roomName,
                            value: coordinator.coordinator.roomName
                        });
                    }
                    discoveryCallback(devices);
                }
            }).catch((err) => {
                console.log(err);
            });
    }

    getFavourites(discoveryCallback: (arg0: any[]) => void) {
        let urls = [this.configNode.ip, this.name];
        let url = urls.join('/');
        let options = {};
        if (this.configNode.username) {
            options = {
                auth: {
                    username: this.configNode.username,
                    password: this.configNode.password
                }
            }
        }

        axios.get(url + '/favourites', options)
            .then((response) => {
                if (response.data) {
                    var favourites = response.data;
                    discoveryCallback(favourites);
                }
            }).catch((err) => {
                console.log(err);
            });
    }

    httpCall<T>(action: string, property: string, callback: (err: any, state: any) => void, ...args: any[]) {
        let urls = [this.configNode.ip, this.name, action];
        urls = urls.concat(args);
        let url = urls.join('/');
        let options = {};
        if (this.configNode.username) {
            options = {
                auth: {
                    username: this.configNode.username,
                    password: this.configNode.password
                }
            }
        }
        axios.get<T>(url, options)
            .then((response: AxiosResponse<T>) => {
                if (response.data) {
                    if (property) {
                        let data: object = Object(response.data);
                        if (Reflect.has(data, property)) {
                            callback(null, Reflect.get(data, property));
                        }
                    }
                    else {
                        callback(null, response.data);
                    }
                }
            }).catch((err) => {
                callback(err, null);
            });
    }


    httpCallWithoutDevice<T>(action: string, property: string, callback: (err: any, state: any) => void, ...args: any[]) {
        let urls = [this.configNode.ip, action];
        urls = urls.concat(args);
        let url = urls.join('/');
        let options = {};
        if (this.configNode.username) {
            options = {
                auth: {
                    username: this.configNode.username,
                    password: this.configNode.password
                }
            }
        }

        axios.get<T>(url, options)
            .then((response: AxiosResponse<T>) => {
                if (response.data) {
                    let data: object = Object(response.data);
                    if (Reflect.has(data, property)) {
                        callback(null, Reflect.get(data, property));
                    }
                }
            }).catch((err) => {
                callback(err, null);
            });
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------  Method not implemented  --------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    setVolume(volume: number, callback: (err: any, result: any) => void) {
        this.httpCall<SonosState>('volume', 'status', callback, volume);
    }

    flush(callback: (err: any, result: any) => void) {
        throw new Error("Method not implemented.");
    }

    next(callback: (err: any, result: any) => void) {
        throw new Error("Method not implemented.");
    }

    setMuted(_songuri: boolean, callback: (err: any, result: any) => void) {
        throw new Error("Method not implemented.");
    }

    previous(callback: (err: any, result: any) => void) {
        throw new Error("Method not implemented.");
    }

    getQueue(callback: (err: any, queueObj: any) => void) {
        throw new Error("Method not implemented.");
    }

    queue(_songuri: string, set_position: number, callback: (err: any, result: any) => void) {
        throw new Error("Method not implemented.");
    }

    playTuneinRadio(_songuri: string, _name: any, callback: (err: any, result: any) => void) {
        throw new Error("Method not implemented.");
    }

    queueNext(_songuri: string, callback: (err: any, result: any) => void) {
        throw new Error("Method not implemented.");
    }

}

