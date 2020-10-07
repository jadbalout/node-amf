const constants = require('./Constants');
const TypedObject = require('../TypedObjects/TypedObject');
const ClassMapper = require('../TypedObjects/ClassMapper');
const AMF3 = require('../AMF3');
class Serializer {

    constructor(outputStream) {
        this.stream = outputStream;
    }

    writeAMFData(data, type=null){
        if(type == null) {
            type = this.detectType(data);
        }
        this.stream.writeByte(type);
        switch(type) {
            case constants.DT_NULL        : return;
            case constants.DT_BOOL_FALSE  : return;
            case constants.DT_BOOL_TRUE   : return;
            case constants.DT_INTEGER     : return this.writeInt(data);
            case constants.DT_NUMBER      : return this.stream.writeDouble(data);
            case constants.DT_STRING      : return this.writeString(data);
            case constants.DT_DATE        : return this.writeDate(data);
            case constants.DT_ARRAY       : return this.isMixedArray(data) ? this.writeMixedArray(data) : this.writeArray(data);
            case constants.DT_OBJECT      : return this.writeObject(data); 
            case constants.DT_BYTEARRAY   : return this.writeByteArray(data);
            default                       : throw new Error('Unsupported type: ' + type);
       }
    }
    
    detectType(data) {
        if(data == null) return constants.DT_NULL;
        if(typeof data == 'boolean') return data ? constants.DT_BOOL_FALSE : constants.DT_BOOL_FALSE;
        if(typeof data == 'object') {
            if(Object.prototype.toString.call(data) == '[object Array]') return constants.DT_ARRAY;
            //if(data instanceof ByteArray) return constants.DT_BYTEARRAY; //TODO
            if(data instanceof Date) return constants.DT_DATE;
            return constants.DT_OBJECT;
        }
        if(!isNaN(data)) return Number.isInteger(data) ? ( (data > 0xFFFFFFF || data < -268435456) ? constants.DT_NUMBER : constants.DT_INTEGER ) : constants.DT_NUMBER; // it is worth noting that numbers written in strings like '5' will be considered as numbers, not strings
        if(typeof data == 'string') return constants.DT_STRING;
        throw new Error("Unhandled data type " + typeof data);
    }

    writeInt(data) { //AMF3 only
        if((data & 0xffffff80) == 0) {
            return this.stream.writeByte(data & 0x7f);
        }
        if((data & 0xffffc000) == 0) {
            this.stream.writeByte( (data >> 7) | 0x80 );
            return this.stream.writeByte(data & 0x7f);
        }
        if((data & 0xffe00000) == 0) {
            this.stream.writeByte( (data >> 14) | 0x80 );
            this.stream.writeByte( (data >> 7) | 0x80 );
            return this.stream.writeByte(data & 0x7f);
        }
        this.stream.writeByte( (data >> 22) | 0x80 );
        this.stream.writeByte( (data >> 15) | 0x80 );
        this.stream.writeByte( (data >> 8) | 0x80 );
        return this.stream.writeByte(data & 0x7f);
    }

    writeString(data) {
        this.writeInt(data.length << 1 | 0x01);
        this.stream.writeBuffer(data);
    }

    writeMixedArray(data) {
        this.writeInt(1);
        for(var key in data) {
            this.writeString(key);
            this.writeAMFData(data[key]);
        }
        this.writeString('');
    }

    writeArray(data) {
        this.writeInt(data.length << 1 | 0x01);
        this.writeString('');
        for(var index in data) {
            this.writeAMFData(data[index]);
        }
    }

    writeObject(data) {
        throw new Error("I dont know how to write AMF3 objects yet!");
    }
    
    writeDate(data) {
        this.writeInt(0x01);
        this.stream.writeDouble(data.getTime());
    }

    isMixedArray(data) {
        var i =0;
        for(var index in data) {
            if(index != i) return true;
            i++;
        }
        return false;
    }
}

module.exports = Serializer;