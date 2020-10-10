
const constants = require("./Constants");
var AMF0 = require('./AMF0');
var AMF3 = require('./AMF3');
class Message {

    /*  
    The Message class encapsulates either an entire request package or an entire result package; including an AMF enveloppe 
    */

    clientType = 0;
    bodies = [];
    headers = [];
    
    constructor(encodingType=constants.AMF0) {
        this.encodingType = encodingType;
    }
    
    addBody(body) {
        this.bodies.push(body);
    }

    addHeader(header) {
        this.headers.push(header);
    }
    
    serialize(stream) {
        this.outputStream = stream;
        stream.writeByte(0x00);
        stream.writeByte(this.encodingType);

        
        //Write headers
        stream.writeInt(this.headers.length);
        for(let header of this.headers) {
            let serializer = new AMF0.Serializer(stream);
            serializer.writeString(header.name);
            stream.writeByte(header.required | 0); //bool | 0 forces integer type
            stream.writeLong(-1);
            serializer.writeAMFData(header.data);
        }

        //Write bodies
        stream.writeInt(this.bodies.length);
        for(let body of this.bodies) {
            let serializer = new AMF0.Serializer(stream);
            serializer.writeString(body.target);
            serializer.writeString(body.response);
            stream.writeLong(-1);
            if(this.encodingType == constants.AMF0) serializer.writeAMFData(body.data);
            else serializer.writeAMFData(new AMF3.Wrapper(body.data));
        }
    }

    deserialize(stream) {
        this.headers = [];
        this.bodies = [];
        stream.readByte();
        this.clientType = stream.readByte();
        this.deserializer = new AMF0.Deserializer(stream);

        //Read Headers
        let totalHeaders = stream.readInt();
        while(this.headers.length < totalHeaders) {
            let header = { 'name':this.deserializer.readString(), 'required': stream.readByte() == 1 };
            stream.readLong();
            header.data = this.deserializer.readAMFData(null, true);
            this.headers.push(header); 
        }

        //Read Bodies
        let totalBodies = stream.readInt();
        while(this.bodies.length < totalBodies) {
            let body = {};
            body.target = this.deserializer.readString();
            body.response = this.deserializer.readString();
            body.length = stream.readLong();
            body.data = this.deserializer.readAMFData(null, true);

            //Unwrap all AMF3 Wrappers so reading is easier
            if(body.data instanceof AMF3.Wrapper) {
                this.encodingType = constants.AMF3;
                body.data = body.data.data;
            } else if(body.data instanceof Array) {
                let i = 0;
                while(i < body.data.length) {
                    if(body.data[i] instanceof AMF3.Wrapper) {
                        body.data[i] = body.data[i].data;
                        this.encodingType = AMF3.Wrapper;
                    }
                    i++;
                }
            }
            this.bodies.push(body);
        }
    }

}
module.exports = Message;