const Stream = require('./Stream');
const Message = require('./Message');
class Packet {

    constructor(req, res, responseHeaders=[]) {
        this.res = res;
        this.stream = new Stream(req.body);
        this.amfMessage = new Message();
        this.amfMessage.deserialize(this.stream);
        this.bodies = this.amfMessage.bodies;
        this.headers = this.amfMessage.headers;
        this.responseHeaders = responseHeaders;
    }

    respond(data, isStatus = false) {
        var target = this.bodies[0].response + (isStatus ? '/onStatus' : '/onResult');
        var response = new Message();
        var outputStream = new Stream();
        response.headers = this.responseHeaders;
        response.addBody({target: target, response: '', data: data});
        response.serialize(outputStream);
        this.res.set('Content-Type', 'application/x-amf');
        this.res.send(outputStream.buffer);
    }


}
module.exports = Packet;