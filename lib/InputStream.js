class InputStream {

    /*
        This is the InputStream class. You construct it with binary data and it can read doubles, longs, ints, bytes, etc. while maintaining the cursor position.
        Sadly we CANNOT use one universal buffer initialized from raw data due to the fact that the stream has non-serialized strings in it :/
    */

    cursor = 0;
    rawData = '';

    constructor(rawData) {
        this.rawData = rawData;
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
        let buffer = new Buffer.from(this.readBuffer(4), 'utf8');
        return buffer.readInt32BE(0);
    }

}

module.exports = InputStream;