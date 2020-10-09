const Message = require('./Message');
const constants = require('./Constants');
const OutputStream = require('./OutputStream');
const axios = require('axios');
const { InputStream } = require('./amf');
class Client {

    httpHeaders = {'Content-Type': 'application/x-amf'};
    amfHeaders = [];

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

    async sendRequest(target, data, responseStr='/1') {
           
        if(this.encoding & constants.FLEXMSG) {
            return false; //No support yet.
        }
        this.amfRequest = new Message(this.encoding);
        this.amfRequest.headers = this.amfHeaders;
        this.outputStream = new OutputStream();
        this.amfRequest.addBody({
            target: target,
            response: responseStr,
            data: data
        });

        this.amfRequest.serialize(this.outputStream);
        let options = {
            headers: this.httpHeaders,
            responseType: 'arraybuffer'
        };
        try {
            let response = await axios.post(this.endPoint.toString(), this.outputStream.buffer, options);
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