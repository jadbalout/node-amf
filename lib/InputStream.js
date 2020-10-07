const BinaryParser = require('./BinaryParser');
class InputStream {

    /*
        This is the InputStream class. You construct it with binary data and it can read doubles, longs, ints, bytes, etc. while maintaining the cursor position.
    */

    cursor = 0;
    rawData = '';

    constructor(rawData) {
        this.rawData = rawData;
        this.parser = BinaryParser.parser(true, true);
        //this.buffer = new Buffer(this.rawData, "binary");
    }

    readBuffer(n) {
        if( (n + this.cursor) > this.rawData.length) {
           throw new Error('Buffer underrun at position: ' + this.cursor + '. Trying to fetch ' + n + ' bytes'); 
        }

        this.cursor += n;
        return this.rawData.substr(this.cursor-n, n);
    }

    readByte() {
        let buffer = new Buffer.from(this.readBuffer(1), 'utf8');
        return buffer.readInt8(0);
    }

    readDouble() {
        var s = this.readBuffer(8);
        if('\0\0\0\0\0\0\xF8\x7F' === s) {
            return Number.NaN;
        }
        let buffer = new Buffer.from(s, 'utf-8');
        return buffer.readDoubleBE(0);
    }

    readInt() {
        let buffer = new Buffer.from(this.readBuffer(2), 'utf8');
        return buffer.readInt16BE(0);
    }

    readLong() {
        return this.parser.toWord(this.readBuffer(4));
    }

}

module.exports = InputStream;