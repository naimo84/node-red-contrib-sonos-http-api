# node-red-contrib-sonos-http-api

## under active development

This Node RED module connects Sonos HTTP Api with Node-RED.

The big advantage of sonos-http-api is the fact, that Node RED and the sonos players do not need to be in the same subnet.

![play_notify](examples/advantage.png)

> Node-RED is a tool for wiring together hardware devices, APIs and online services in new and interesting ways.

If you like it, please consider:

<a target="blank" href="https://brave.com/nai412"><img src="./examples/support_banner.png"/></a>
<a target="blank" href="https://paypal.me/NeumannBenjamin"><img src="https://img.shields.io/badge/Donate-PayPal-blue.svg"/></a>
<a target="blank" href="https://blockchain.info/payment_request?address=3KDjCmXsGFYawmycXRsVwfFbphog117N8P"><img src="https://img.shields.io/badge/Donate-Bitcoin-green.svg"/></a> 

## Getting started

First of all install [Node-RED](http://nodered.org/docs/getting-started/installation)

Then you need [sonos-http-api](https://github.com/jishi/node-sonos-http-api)

In the future I will provide a docker image for sonos-http-api.

## Develop

* git clone https://github.com/naimo84/node-red-contrib-sonos-http-api.git
* cd node-red-contrib-sonos-http-api
* npm install
* gulp
* cd ~/.node-red 
* npm install /path/to/node-red-contrib-sonos-http-api

<img src="https://img.shields.io/npm/dy/node-red-contrib-sonos-http-api?style=for-the-badge"/>

## Usage

### Configuration:
- ***hostname*** hostname of sonos-http-api (e.g. "http://sonos:5005")
- ***username*** if set, username of sonos-http-api 
- ***password*** if set, password of sonos-http-api 
- ***player*** Sonos playername 

A short sample flow can be found here:

[examples/play_notify.json](examples/play_notify.json)

![play_notify](examples/play_notify.png)

## Credits
* Thanks for the great sonos-http-api https://github.com/jishi/node-sonos-http-api

## The MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Coded with :heart: in :it:




