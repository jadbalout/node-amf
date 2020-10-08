class OutputStream {

    /*
        This is the OutputStream class. This class provides methods to encode bytes, longs, strings, int's etc. to a binary format
        Buffers are always of fixed size, there is no built in way to resize them dynamically. So, creating a universal buffer and writing to it will not work.
        Easiest method is to create a string and add to it.
    */

    rawData = '';

    
    writeBuffer(data) {
        this.rawData += data;
    }

    writeByte(byte) {
        let buffer = new Buffer.allocUnsafe(1);
        buffer.writeInt8(byte);
        this.rawData += buffer.toString('utf8');
    }

    writeInt(int) {
        let buffer = new Buffer.allocUnsafe(2);
        buffer.writeInt16BE(int);
        this.rawData += buffer.toString('utf8');
    }

    writeDouble(double) {    
        let buffer = new Buffer.allocUnsafe(8);
        buffer.writeDoubleBE(double);
        this.rawData += isNaN(double) ? '\0\0\0\0\0\0\xF8\x7F' : buffer.toString('utf8');
    }
    
    writeLong(long) {
        if(long < 0) long = 0;
        let buffer = new Buffer.allocUnsafe(4);
        buffer.writeInt32BE(long);
        this.rawData += buffer.toString('utf8'); 
    }

}

module.exports = OutputStream;