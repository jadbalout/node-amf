const { OutputStream } = require("..");

module.exports.AMFServer = require("./Server");
module.exports.AMFMessage = require("./Message");
module.exports.InputStream = require("./InputStream");
module.exports.OutputStream = require("./OutputStream");
module.exports.ENCODING = {};
module.exports.ENCODING.AMF3 = require('./Constants').AMF3;
module.exports.ENCODING.AMF0 = require('./Constants').AMF0;
module.exports.AMFClient = require('./Client');
module.exports.Service = require('./Service');
module.exports.AMF3 = require('./AMF3');
module.exports.AMF0 = require('./AMF0');

module.exports.serialize = function(data, encodingType=module.exports.Encoding.AMF0) {
    const outputStream = new module.exports.OutputStream();
    const serializer = encodingType == module.exports.ENCODING.AMF0 ? new module.exports.AMF0.Serializer(outputStream): new module.exports.AMF3.Serializer(outputStream);
    serializer.writeAMFData(data);
    return outputStream.buffer;
};

module.exports.deserialize = function(data, encodingType=module.exports.Encoding.AMF0) {
    const inputStream = new module.exports.InputStream(data);
    const deserializer = encodingType == module.exports.ENCODING.AMF0 ? new module.exports.AMF0.Deserializer(inputStream): new module.exports.AMF3.Deserializer(inputStream);
    return deserializer.readAMFData();
};