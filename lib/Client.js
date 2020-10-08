const Message = require('./Message');
const constants = require('./Constants');
const OutputStream = require('./OutputStream');
const axios = require('axios');
const { InputStream } = require('./amf');
const fs = require('fs');
class Client {

    httpHeaders = {'Content-Type': 'application/x-amf'};

    constructor(endPoint, encoding=constants.AMF0) {
        this.endPoint = endPoint;
        this.encoding = encoding;
        this.amfRequest = new Message(encoding);
        this.outputStream = new OutputStream();
        //Maybe for the future add a way to choose proxy
    }

    addHTTPHeader(key, value) {
        this.httpHeaders[key] = value;
    }

    addHeader(name, required, data) {
        this.amfRequest.addHeader({name:name, required: required, data: data});
    }

    async sendRequest(target, data, responseStr='/1') {
           
        if(this.encoding & constants.FLEXMSG) {
            return false; //No support yet.
        }
        this.amfRequest.addBody({
            target: target,
            response: responseStr,
            data: data
        });

        this.amfRequest.serialize(this.outputStream);
        let options = {
            headers: this.httpHeaders,
            responseType:'arraybuffer'
        };
        try {
            let response = await axios.post(this.endPoint, this.outputStream.rawData, options);
            let responseOK = response && response.status === 200 && response.statusText === 'OK';
            if(!responseOK) return false;
            this.amfInputStream = new InputStream(response.data);
            this.amfResponse = new Message();
            this.amfResponse.deserialize(this.amfInputStream);
            return this.amfResponse;
        } catch(error) {
            console.log(error);
            return false;
        }
    }



}
module.exports = Client;