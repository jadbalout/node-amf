const constants = require('./Constants');
const TypedObject = require('../TypedObjects/TypedObject');
const ClassMapper = require('../TypedObjects/ClassMapper');
class Deserializer {

    refList = [];

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
        console.log({a:this.stream.rawData.substr(this.stream.cursor, 30)});
        let strLen = this.stream.readInt();
        console.log(strLen);
        return this.stream.readBuffer(strLen);
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
        console.log({a:this.stream.rawData.substr(this.stream.cursor, 30)});
        let timestamp = this.stream.readDouble();

        let timezoneOffset = this.stream.readInt();
        console.log(timestamp, timezoneOffset);
        //unsure what to do with timezone offset, so ignore it for now
        return new Date(Math.floor(timestamp));
    }
    
    readTypedObject() {
        let className = this.readString();
        console.log(className);
        var isMapped = true;
        var refObject = ClassMapper.createLocalClass(className);
        if(!refObject) {
            refObject = new TypedObject(className, null);
            isMapped = !isMapped;
        }
        var props = {};
        while(true) {
            let key = this.readString();
            let varType = this.stream.readByte();
            if(varType == constants.DT_OBJECTTERM) break;
            props[key] = this.readAMFData(varType);
        }
        if(isMapped) {
            for (let key in props) {
                refObject[key] = props[key];
            }
        } else {
            refObject.data = props;
        }
        this.refList.push(refObject);
        return refObject;
    }

    readAMF3Data() {

        //TODO
        /*
        $amf3Deserializer = new SabreAMF_AMF3_Deserializer($this->stream, $this->log);
        if($this->target) $amf3Deserializer->target = $this->target;
        if($this->ticketRead) $amf3Deserializer->ticketRead = $this->ticketRead;
        $d = new SabreAMF_AMF3_Wrapper($amf3Deserializer->readAMFData());
        $this->ticketRead = $amf3Deserializer->ticketRead;
        return $d;
        */
       console.log("AMF3 Data INCOMING");
    }

}

module.exports = Deserializer;