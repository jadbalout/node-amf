const Message = require('./Message');
const constants = require('./Constants');
const axios = require('axios');
const Stream = require('./Stream');
class Client {

    httpHeaders = {'Content-Type': 'application/x-amf'};
    amfHeaders = [];
    middleware = [];

    constructor(endPoint, encoding=constants.AMF0) {
        this.endPoint = new URL(endPoint);
        this.encoding = encoding;
        //Maybe for the future add a way to choose proxy
        this.amfHeaders = [];
    }

    addHTTPHeader(key, value) {
        this.httpHeaders[key] = value;
    }

    addHeader(name, required, data) {
        this.amfHeaders.push({name:name, required: required, data: data});
    }
    
    addGETParam(param, value) {
        this.endPoint.searchParams.set(param, value);
    }

    addMiddleware(func) {
        this.middleware.push(func);
    }

    async sendRequest(target, data, responseStr='/1') {
           
        if(this.encoding & constants.FLEXMSG) {
            return false; //No support yet.
        }
        let amfRequest = new Message(this.encoding);
        amfRequest.headers = Object.assign([], this.amfHeaders); //we dont want it referenced, we want it cloned incase we want to add amf headers to the message and not client
        let outputStream = new Stream();
        amfRequest.addBody({
            target: target,
            response: responseStr,
            data: data
        });
        for(var middleware of this.middleware) await middleware(amfRequest);
        amfRequest.serialize(outputStream);
        let options = {
            headers: this.httpHeaders,
            responseType: 'arraybuffer'
        };
        try {
            let response = await axios.post(this.endPoint.toString(), outputStream.buffer, options);
            let responseOK = response && response.status === 200 && response.statusText === 'OK';
            if(!responseOK) return false;
            let amfInputStream = new Stream(response.data);
            let amfResponse = new Message();
            amfResponse.deserialize(amfInputStream);
            return amfResponse;
        } catch(error) {
            console.log(error);
            return false;
        }
    }

}
module.exports = Client;