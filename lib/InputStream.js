class InputStream {

    /*
        This is the InputStream class. You construct it with binary data and it can read doubles, longs, ints, bytes, etc. while maintaining the cursor position.
    */

    cursor = 0;

    constructor(buffer) {
        this.buffer = buffer;
    }

    readString(strLen) {
        var str = "";
        while(strLen > 0) {
            str += String.fromCharCode(this.readByte());
            strLen--;
        }
        return str;
    }

    readByte() {
        this.cursor += 1;
        return this.buffer.readInt8(this.cursor-1);
    }

    readDouble() {
        this.cursor += 8;
        return this.buffer.readDoubleBE(this.cursor-8);
    }

    readInt() {
        this.cursor += 2;
        return this.buffer.readInt16BE(this.cursor-2);
    }

    readLong() {
        this.cursor += 4;
        return this.buffer.readInt32BE(this.cursor-4);
    }

}

module.exports = InputStream;