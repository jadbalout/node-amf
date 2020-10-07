const BinaryParser = require('./BinaryParser');
class OutputStream {

    /*
        This is the OutputStream class. This class provides methods to encode bytes, longs, strings, int's etc. to a binary format
    */

    rawData = '';

    constructor() {
        this.parser = BinaryParser.parser(true, true);
    }

    writeBuffer(data) {
        this.rawData += data;
    }

    writeByte(byte) {
        let buffer = new Buffer.allocUnsafe(1);
        buffer.writeInt8(byte);
        this.rawData += buffer.toString('utf8');
    }

    writeInt(int) {
        this.rawData += this.parser.fromWord(int); 
    }

    writeDouble(double) {
        this.rawData += isNaN(double) ? '\0\0\0\0\0\0\xF8\x7F' : this.parser.fromDouble( double );
    }
    
    writeLong(long) {
        if(long < 0) long = 0;
        let buffer = new Buffer.allocUnsafe(4);
        buffer.writeInt32BE(long);
        this.rawData += buffer.toString('utf8'); 
    }

}

module.exports = OutputStream;