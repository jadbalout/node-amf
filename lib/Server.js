const express = require('express');
const bodyParser = require('body-parser');
const Packet = require('./Packet');
const Service = require('./Service');
const EventEmitter = require('eventemitter3');
const crossDomain = '<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>';
class AMFServer extends EventEmitter {

    /*
        This is the AMF0/AMF3 Server class. Use this class to construct a gateway for clients to connect to!
    */
   headers = [];
   services = {};

    constructor(opts) {
        super();
        this.host = opts.host;
        this.port = opts.port;
        this.app = express();
        this.app.use(bodyParser.raw({ type: 'application/x-amf' }));
        this.app.get('/crossdomain.xml', (req, res) => {
            res.set('Content-Type', 'text/xml');
            res.send(crossDomain);
        });
        this.app.post(opts.path, this.processMessage.bind(this));
    }

    addHeader(name, required, data) {
        this.headers.push({name:name, required: required, data: data});
    }

    clearHeaders() {
        this.headers = [];
    }

    processMessage(req, res) {
        let packet =  new Packet(req, res, this.headers);
        let body = packet.bodies[0];
        let target = body.target;
        let targetArr = target.split('.');
        let method = targetArr.pop();
        let className = targetArr.join('.');
        this.emit('data', packet);
        if(!this.services[className]) return;
        if(!this.services[className].methods.indexOf(method) == -1) return;
        this.services[className][method](packet);
    }
    
    registerService(service) {
        service = new service();
        if(!(service instanceof Service)) throw new Error("Service provided does not extend the Service class");
        this.services[service.name] = service;
    }

    listen(callback) {
        this.app.listen(this.port, this.host, () => {
            callback();
        });
    }

}

module.exports = AMFServer;