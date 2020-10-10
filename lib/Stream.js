const convert = (buffer) => Buffer.isBuffer(buffer)
  ? buffer
  : Array.isArray(buffer)
    ? Buffer.from(buffer)
    : Number.isInteger(buffer)
      ? Buffer.alloc(buffer)
      : Buffer.alloc(0);

class Stream {

    cursor = 0;

    constructor(buffer=0) {
        this.buffer = convert(buffer);
    }

    /* 
        Read functions
    */

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
        let b= this.buffer.readUInt8(this.cursor-1);
        return b;
    }


    readDouble() {
        this.cursor += 8;
        return this.buffer.readDoubleBE(this.cursor-8);
    }

    readInt() {
        this.cursor += 2;
        return this.buffer.readUInt16BE(this.cursor-2);
    }

    readLong() {
        this.cursor += 4;
        return this.buffer.readUInt32BE(this.cursor-4);
    }

    /*
    Write functions
    */

    writeBuffer(data) {
        this.buffer = Buffer.concat([this.buffer, Buffer.from(data, 'utf-8')]);
    }

    writeByte(byte) {
        let buffer = Buffer.alloc(1);
        buffer.writeUInt8(byte);
        this.buffer = Buffer.concat([this.buffer, buffer]);
    }

    writeInt(int) {
        let buffer = Buffer.alloc(2);
        buffer.writeUInt16BE(int);
        this.buffer = Buffer.concat([this.buffer, buffer]);
    }

    writeDouble(double) {    
        let buffer = Buffer.alloc(8);
        buffer.writeDoubleBE(double);
        this.buffer = Buffer.concat([this.buffer, buffer]);
    }
    
    writeLong(long) {
        if(long < 0) long = 0;
        let buffer = Buffer.alloc(4);
        buffer.writeUInt32BE(long);
        this.buffer = Buffer.concat([this.buffer, buffer]);
    }

}

module.exports = Stream;