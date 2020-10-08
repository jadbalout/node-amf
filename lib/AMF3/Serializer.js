const constants = require('./Constants');
const TypedObject = require('../TypedObjects/TypedObject');
const ClassMapper = require('../TypedObjects/ClassMapper');
const AMF3 = require('../AMF3');
const ArrayCollection = require('../TypedObjects/ArrayCollection');
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

    writeInt(value) { //AMF3 only
        if ((value & 0xFFFFFF80) === 0) {
            this.stream.writeByte(value & 0x7F);
        } else if ((value & 0xFFFFC000) === 0) {
            this.stream.writeByte(0x80 | ((value >> 7) & 0x7F));
            this.stream.writeByte(value & 0x7F);
        } else if ((value & 0xFFE00000) === 0) {
            this.stream.writeByte(0x80 | ((value >> 14) & 0x7F));
            this.stream.writeByte(0x80 | ((value >> 7) & 0x7F));
            this.stream.writeByte(value & 0x7F);
        } else if ((value & 0xC0000000) === 0) {
            this.stream.writeByte(0x80 | ((value >> 22) & 0x7F));
            this.stream.writeByte(0x80 | ((value >> 15) & 0x7F));
            this.stream.writeByte(0x80 | ((value >> 8) & 0x7F));
            this.stream.writeByte(value & 0xFF);
        } else {
            throw new Error('AMF3 U29 range');
        }
    }

    writeString(data) {
        this.writeInt( (data.length << 1) | 0x01);
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
        var encodingType = constants.ET_PROPLIST;
        var className = '';
        if(data instanceof TypedObject) {
            className = data.className;
            data = data.data;
        } else if (ClassMapper.checkRemoteClass(data)) {
            className = ClassMapper.checkRemoteClass(data);
            if(data instanceof ArrayCollection) encodingType = constants.ET_EXTERNALIZED;
        }
        var objectInfo = 0x03;
        objectInfo |= encodingType << 2;
        switch(encodingType) {
            case constants.ET_PROPLIST:
                let keys = Object.keys(data);
                var propertyCount = keys.length;
                objectInfo |= propertyCount << 4;
                this.writeInt(objectInfo);
                this.writeString(className);
                for(var key of keys) {
                    this.writeString(key);
                }
                for(var key of keys) {
                    this.writeAMFData(data[key]);
                }
                break;
            case constants.ET_EXTERNALIZED:
                this.writeInt(objectInfo);
                this.writeString(classname);
                this.writeAMFData(data.data);
                break;
        }
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