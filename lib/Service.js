class Service {

    methods = [];
    /**
     * Create a service.
     * @param {string} name - The service name.
     */
    constructor(name) {
        this.name = name;
        this.methods = this.getAllMethods(this);
    }
    
    getAllMethods(toCheck) {
        var filteredFunctions = ['getAllMethods','constructor','hasOwnProperty','isPrototypeOf','propertyIsEnumerable','toLocaleString','toString','valueOf']
        var props = [];
        var obj = toCheck;
        do {
            props = props.concat(Object.getOwnPropertyNames(obj));
        } while (obj = Object.getPrototypeOf(obj));
    
        return props.sort().filter(function(e, i, arr) { 
           if (e!=arr[i+1] && typeof toCheck[e] == 'function' && filteredFunctions.indexOf(e) == -1 && !e.startsWith('_')) return true;
        });
    }



}
module.exports = Service;