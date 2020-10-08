# node-amf

node-amf is an AMF library for NodeJS that serializies, deserializies, sends and handles AMF data.

## What is AMF?

Action Message Format(AMF) is a binary format used to serialize objects and send messages between an Adobe Flash client and a remote server.

## Usage

### AMF Client:
#### Using async/await: 
```javascript
const {AMFClient, AMF3Wrapper} = require('./node-amf');

async function request() {
    let client = new AMFClient('http://localhost/Gateway.aspx?method=Method');
    client.addHeader('needClassName', false, true);
    client.addHTTPHeader("Referer", "app:/Main");

    let data = new AMF3Wrapper([]);
    var response = await client.sendRequest('target', data);
    console.log(response.bodies[0]);
}
request();
```
#### Using then:
```javascript
const {AMFClient, AMF3Wrapper} = require('./node-amf');
let client = new AMFClient('http://localhost/Gateway.aspx?method=Method');
client.addHeader('needClassName', false, true);
client.addHTTPHeader("Referer", "app:/Main");

let data = new AMF3Wrapper([]);
client.sendRequest('target', data).then( (response) => {
    console.log(response.bodies[0]);
});
```
## TODO

- Creating server
- Adding examples.

## License
[MIT](https://choosealicense.com/licenses/mit/)