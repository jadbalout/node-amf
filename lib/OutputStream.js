class OutputStream {

    /*
        This is the OutputStream class. This class provides methods to encode bytes, longs, strings, int's etc. to a binary format
        Buffers are always of fixed size, there is no built in way to resize them dynamically. So, creating a universal buffer and writing to it will not work.
        Easiest method is to create a string and add to it.
    */

    rawData = '';

    constructor() {
        this.buffer = new Buffer.alloc(0);
    }
    
    writeBuffer(data) {
        this.buffer = Buffer.concat([this.buffer, new Buffer.from(data, 'utf-8')]);
        this.rawData += data;
    }

    writeByte(byte) {
        let buffer = new Buffer.allocUnsafe(1);
        buffer.writeUInt8(byte);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        this.rawData += buffer.toString('utf-8');
    }

    writeInt(int) {
        let buffer = new Buffer.allocUnsafe(2);
        buffer.writeUInt16BE(int);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        this.rawData += buffer.toString('utf-8');
    }

    writeDouble(double) {    
        let buffer = new Buffer.allocUnsafe(8);
        buffer.writeDoubleBE(double);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        this.rawData += isNaN(double) ? '\0\0\0\0\0\0\xF8\x7F' : buffer.toString('utf-8');
    }
    
    writeLong(long) {
        if(long < 0) long = 0;
        let buffer = new Buffer.allocUnsafe(4);
        buffer.writeUInt32BE(long);
        this.buffer = Buffer.concat([this.buffer, buffer]);
        this.rawData += buffer.toString('utf-8'); 
    }

}

module.exports = OutputStream;