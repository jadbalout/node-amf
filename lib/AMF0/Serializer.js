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

            case constants.DT_NUMBER      : return this.stream.writeDouble(data);
            case constants.DT_BOOL        : return this.stream.writeByte(data | 0);
            case constants.DT_STRING      : return this.writeString(data);
            case constants.DT_OBJECT      : return this.writeObject(data);
            case constants.DT_NULL        : return true;
            case constants.DT_MIXEDARRAY  : return this.writeMixedArray(data);
            case constants.DT_ARRAY       : return this.writeArray(data);
            case constants.DT_DATE        : return this.writeDate(data);
            case constants.DT_LONGSTRING  : return this.writeLongString(data);
            case constants.DT_TYPEDOBJECT : return this.writeTypedObject(data);
            case constants.DT_AMF3        : return this.writeAMF3Data(data);
            default                       :  throw new Error('Unsupported type: ' . type);
       }
    }
    
    detectType(data) {
        if(data == null) return constants.DT_NULL;
        if(typeof data == 'boolean') return constants.DT_BOOL;
        if(typeof data == 'object') {
            if(Object.prototype.toString.call(data) == '[object Array]') return this.isMixedArray(data) ? constants.DT_MIXEDARRAY : constants.DT_ARRAY;
            if(data instanceof AMF3.Wrapper) return constants.DT_AMF3;
            if(data instanceof Date) return constants.DT_DATE;
            if(ClassMapper.checkRemoteClass(data) || data instanceof TypedObject) return constants.DT_TYPEDOBJECT;
            return constants.DT_OBJECT;
        }
        if(!isNaN(data)) return constants.DT_NUMBER; // it is worth noting that numbers written in strings like '5' will be considered as numbers, not strings
        if(typeof data == 'string') return (data.length > 65536) ? constants.DT_LONGSTRING : constants.DT_STRING;
        throw new Error("Unhandled data type " + typeof data);
    }

    isMixedArray(data) {
        var i =0;
        for(var index in data) {
            if(index != i) return true;
            i++;
        }
        return false;
    }

    writeString(data) {
        this.stream.writeInt(data.length);
        this.stream.writeBuffer(data);
    }

    writeLongString(data) {
        this.stream.writeLong(data.length);
        this.stream.writeBuffer(data);
    }

    writeMixedArray(data) {
        this.stream.writeLong(0);
        for(var key in data) {
            this.writeString(key);
            this.writeAMFData(data[key]);
        }
        this.writeString('');
        this.stream.writeByte(constants.DT_OBJECTTERM);

    }

    writeArray(data) {
        if(data.length == 0) return this.stream.writeLong(0);
        this.stream.writeLong(data.length);
        for(var index in data) {
            this.writeAMFData(data[index]);
        }
    }

    writeObject(data) {
        for(var key in data) {
            this.writeString(key);
            this.writeAMFData(data[key]);
        }
        this.writeString('');
        this.stream.writeByte(constants.DT_OBJECTTERM);
    }

    writeTypedObject(data) {
        var className = data instanceof TypedObject ? data.className : ClassMapper.checkRemoteClass(data);
        if(!className) return;
        this.writeString(className);
        this.writeObject(data.data);
    }

    writeAMF3Data(wrapper) {
        let serializer =  new AMF3.Serializer(this.stream);
        serializer.writeAMFData(wrapper.data);
    }
    writeDate(data) {
        this.stream.writeDouble(data.getTime());
        this.stream.writeInt(0); //empty timezone
    }

}

module.exports = Serializer;