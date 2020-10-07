const ArrayCollection = require('./ArrayCollection');
var classMap = {
    'flex.messaging.io.ArrayCollection': ArrayCollection
};

var createLocalClass = function(className) {
    if(classMap[className]) return new classMap[className]();
    return false;
}
var checkRemoteClass = function(remoteClass) {
    for(let className in classMap) {
        if(remoteClass instanceof classMap[className]) return className;
    }
    return false;
}

module.exports.createLocalClass = createLocalClass;
module.exports.checkRemoteClass = checkRemoteClass;