const constants = require('./Constants');
const TypedObject = require('../TypedObjects/TypedObject');
const ClassMapper = require('../TypedObjects/ClassMapper');
const AMF3 = require('../AMF3');
class Deserializer {

    refList = [];
    amf3Ref = {storedStrings:[], storedObjects:[], storedClasses: []};

    constructor(stream) {
        this.stream = stream;
    }

    readAMFData(type = null, newScope = false) {
        if(newScope) this.refList = [];
        if(type == null) type = this.stream.readByte();
        switch(type) {
            case constants.DT_NUMBER      : return this.stream.readDouble();
            case constants.DT_BOOL        : return this.stream.readByte()==1;
            case constants.DT_STRING      : return this.readString();
            case constants.DT_OBJECT      : return this.readObject();
            case constants.DT_NULL        : return null;
            case constants.DT_UNDEFINED   : return null;
            case constants.DT_REFERENCE   : return this.readReference();
            case constants.DT_MIXEDARRAY  : return this.readMixedArray();
            case constants.DT_ARRAY       : return this.readArray();
            case constants.DT_DATE        : return this.readDate();
            case constants.DT_LONGSTRING  : return this.readLongString();
            case constants.DT_UNSUPPORTED : return null;
            case constants.DT_XML         : return this.readLongString();
            case constants.DT_TYPEDOBJECT : return this.readTypedObject();
            case constants.DT_AMF3        : return this.readAMF3Data();
            default: throw new Error("Unsupported type: " + type);
        }
    }

    readString() {
        let strLen = this.stream.readInt();
        return this.stream.readString(strLen);
    }

    readObject() {
        var object = {};

        //Keep reading and adding keys and values to the object until interrupted by ObjectTerm(0x09)
        while(true) {
            let key = this.readString();
            let varType = this.stream.readByte();
            if(varType == constants.DT_OBJECTTERM) break;
            object[key] = this.readAMFData(varType);    
        }

        this.refList.push(object);
        return object;
    }

    readReference() {
        let refId = this.stream.readInt();
        return this.refList[refId];
    }

    readArray() {
        let length = this.stream.readLong();
        var arr = [];
        while(length > 0) {
            arr.push(this.readAMFData());
            length--;
        }
        this.refList.push(arr);
        return arr;
    }

    readMixedArray() {
        let arraySize = this.stream.readLong(); //no need
        return this.readObject();
    }

    readDate() {
        let timestamp = this.stream.readDouble();
        let timezoneOffset = this.stream.readInt();
        return new Date(Math.floor(timestamp) + timezoneOffset * 60 * 1000);
    }
    
    readTypedObject() {
        let className = this.readString();
        var refObject = ClassMapper.createLocalClass(className);
        if(!refObject) {
            let dynamicClass = class extends TypedObject {};
            refObject = Object.defineProperty(dynamicClass, 'name', {value: className});
        }
        while(true) {
            let key = this.readString();
            let varType = this.stream.readByte();
            if(varType == constants.DT_OBJECTTERM) break;
            refObject[key] = this.readAMFData(varType);
        }
        this.refList.push(refObject);
        return refObject;
    }

    readAMF3Data() {
        let amf3Deserializer = new AMF3.Deserializer(this.stream, this.amf3Ref);
        let data = amf3Deserializer.readAMFData();
        this.amf3Ref = {storedStrings: amf3Deserializer.storedStrings, storedClasses: amf3Deserializer.storedClasses, storedObjects: amf3Deserializer.storedObjects};
        return new AMF3.Wrapper(data);
    }

}

module.exports = Deserializer;