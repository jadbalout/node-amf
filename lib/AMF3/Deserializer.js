const constants = require('./Constants');
const TypedObject = require('../TypedObjects/TypedObject');
const ClassMapper = require('../TypedObjects/ClassMapper');
const ArrayCollection = require('../TypedObjects/ArrayCollection');
class Deserializer {

    storedStrings = [];
    storedObjects = [];
    storedClasses = [];

    constructor(stream, amf3Data) {
        this.stream = stream;
        this.storedStrings = amf3Data['storedStrings'];
        this.storedObjects = amf3Data['storedObjects'];
        this.storedClasses = amf3Data['storedClasses'];
    }

    readAMFData(type = null) {
        if(type == null) type = this.stream.readByte();
        switch(type) {
            case constants.DT_UNDEFINED  : return null; 
            case constants.DT_NULL       : return null; 
            case constants.DT_BOOL_FALSE : return false;
            case constants.DT_BOOL_TRUE  : return true;
            case constants.DT_INTEGER    : return this.readInt();
            case constants.DT_NUMBER     : return this.stream.readDouble();
            case constants.DT_STRING     : return this.readString();
            case constants.DT_XML        : return this.readString();
            case constants.DT_DATE       : return this.readDate();
            case constants.DT_ARRAY      : return this.readArray();
            case constants.DT_OBJECT     : return this.readObject();
            case constants.DT_XMLSTRING  : return this.readXMLString();
            //case constants.DT_BYTEARRAY  : return this.readByteArray();
            default: throw new Error("Unsupported type: " + type);
        }
    }

    readObject() {
        var objInfo = this.readU29();
        let storedObject = (objInfo & 0x01) == 0;
        objInfo >>= 1;
        
        if(storedObject) {
            if(!this.storedObjects[objInfo]) throw new Error('Undefined object reference: ' + objInfo);
            return this.storedObjects[objInfo];
        }
        
        let storedClass = (objInfo & 0x01) == 0;
        objInfo >>= 1;
        var encodingType, className, propertyNames, refObject;
        // If this is a stored  class.. we have the info
        if (storedClass) {
            if(!this.storedClasses[objInfo]) throw new Error('Undefined class reference: ' + objInfo); 
            encodingType = this.storedClasses[objInfo]['encodingType'];
            propertyNames = this.storedClasses[objInfo]['propertyNames'];
            className = this.storedClasses[objInfo]['className'];
        } else { 
            className = this.readString();
            encodingType = objInfo & 0x03;
            propertyNames = [];
            objInfo >>= 2;
        }

        if (className) {
            refObject = ClassMapper.createLocalClass(className);
            if(!refObject) refObject = new TypedObject(className, {});
        } else refObject = {};

        this.storedObjects.push(refObject);

        if(encodingType & constants.ET_EXTERNALIZED) {
            if(!storedClass) this.storedClasses.push({className: className, encodingType: encodingType, propertyNames: propertyNames});
            if(refObject instanceof ArrayCollection) refObject.data = this.readAMFData();
            else if(refObject instanceof TypedObject) refObject.data = [{'externalizedData': this.readAMFData()}];
            else refObject.externalizedData = this.readAMFData();
        } else {
            if(encodingType & constants.ET_SERIAL) {
                if(!storedClass) this.storedClasses.push({className: className, encodingType: encodingType, propertyNames: propertyNames});
                var properties = {};
                var propertyName = this.readString();
                while(propertyName != "") {
                    propertyNames.push(propertyName);
                    properties[propertyName] = this.readAMFData();
                }
            } else {
                if(!storedClass) {
                    for (let i = 0; i < objInfo; i++) propertyNames.push(this.readString());
                    this.storedClasses.push({className: className, encodingType: encodingType, propertyNames: propertyNames});
                }
                var properties = {};
                for(var propertyName of propertyNames) properties[propertyName] = this.readAMFData();
            }
            if(refObject instanceof TypedObject) refObject.data = properties;
            else {
                for (let key in properties) {
                    refObject[key] = properties[key];
                }
            }
        }
        return refObject;
    }


    readInt() {
        var int = this.readU29();

        if( (int & 0x18000000) == 0x18000000 ) {
            int ^= 0x1fffffff;
            int *= -1;
            int -= 1;
        } else if ( (int & 0x10000000) == 0x10000000 ) {
            int &= 0x0fffffff;
        } 
        return int;
    }

    readString() {
        var strRef = this.readU29();
        if( (strRef & 0x01) == 0 ) {
            strRef >>= 1;
            if(strRef >= this.storedStrings.length) throw new Error('Undefined string reference: ' + strRef);
            return this.storedStrings[strRef];
        }
        let strLen = strRef >> 1;
        let str = this.stream.readString(strLen);
        if(str != "") this.storedStrings.push(str);
        return str;
    }

    readDate() {
        var dateRef = this.readU29();
        if( (dateRef & 0x01) == 0 ) {
            dateRef >>= 1;
            if(dateRef >= this.storedObjects.length) throw new Error('Undefined date reference: ' + dateRef);
            return this.storedObjects[dateRef];
        }
        let date = new Date(Math.floor(this.stream.readDouble()));
        this.storedObjects.push(date);
        return date;
    }

    readArray() {
        var arrId = this.readU29();
        if( (arrId & 0x01) == 0 ) {
            arrId >>= 1;
            if(arrId >= this.storedObjects.length) throw new Error('Undefined array reference: ' + arrId);
            return this.storedObjects[arrId];
        }
        arrId >>= 1;
        var data = [];

        var key = this.readString();
        while(key != "") {
            data[key] = this.readAMFData();
            key = this.readString();
        }
        for (let i = 0; i < arrId; i++) data.push(this.readAMFData());
        this.storedObjects.push(data);
        return data;
    }


    readXMLString() {
        let strLen = this.readU29() >> 1;
        let str = this.stream.readString(strLen);
        return str; //Maybe in the future include a library to parse the XML

    }
    readU29() {
        var count = 1;
        var u29 = 0;
        var byte = this.stream.readByte();
        while( ((byte & 0x80) != 0) && count < 4) {
            u29 <<= 7;
            u29 |= byte & 0x7f;
            byte = this.stream.readByte();
            count++;
        }
        if(count < 4) {
            u29 <<= 7;
            u29 |= byte;
        } else {
            u29 <<= 8;
            u29 |= byte;
        }
        return u29;
    }

    
}

module.exports = Deserializer;