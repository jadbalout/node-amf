module.exports.AMFServer = require("./Server");
module.exports.AMFMessage = require("./Message");
module.exports.Stream = require("./Stream");
module.exports.ENCODING = {};
module.exports.ENCODING.AMF3 = require('./Constants').AMF3;
module.exports.ENCODING.AMF0 = require('./Constants').AMF0;
module.exports.AMFClient = require('./Client');
module.exports.Service = require('./Service');
module.exports.AMF3 = require('./AMF3');
module.exports.AMF0 = require('./AMF0');
module.exports.TypedObjects = require('./TypedObjects');

module.exports.serialize = function(data, encodingType=module.exports.Encoding.AMF0) {
    const stream = new module.exports.Stream();
    const serializer = encodingType == module.exports.ENCODING.AMF0 ? new module.exports.AMF0.Serializer(stream): new module.exports.AMF3.Serializer(stream);
    serializer.writeAMFData(data);
    return stream.buffer;
};

module.exports.deserialize = function(data, encodingType=module.exports.Encoding.AMF0) {
    const stream = new module.exports.Stream(data);
    const deserializer = encodingType == module.exports.ENCODING.AMF0 ? new module.exports.AMF0.Deserializer(stream): new module.exports.AMF3.Deserializer(stream);
    return deserializer.readAMFData();
};
