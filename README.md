# node-amf

[![npm version](https://img.shields.io/npm/v/@jadbalout/nodeamf)](https://www.npmjs.com/package/@jadbalout/nodeamf)

node-amf is an AMF library for NodeJS that serializies, deserializies, sends and handles AMF data.

## What is AMF?

Action Message Format(AMF) is a binary format used to serialize objects and send messages between an Adobe Flash client and a remote server.

## Usage

### Parsing/Serializing:
```javascript
const nodeamf = require('@jadbalout/nodeamf');
const serialized = nodeamf.serialize([5,7], nodeamf.ENCODING.AMF0);
const deserialized = nodeamf.deserialize(serialized, nodeamf.ENCODING.AMF0);
```

### AMF Server:
```javascript
const {AMFServer, Service} = require('@jadbalout/nodeamf');
class BookService extends Service {

    constructor() {
        super('NodeAMF.BookService');
        this.bookStorage = {'Harry Potter': {price: 50, quantity: 5}, 'Great Expectations': {price: 75, quantity: 0}}
    }

    GetBookPrice(packet) {
        if(!(packet.bodies.length > 0 && packet.bodies[0].data.BookName)) return packet.respond({error: true, message: 'Incorrect packet structure!'});
        const { BookName } = packet.bodies[0].data;
        if(!this.bookStorage[BookName]) return packet.respond({error: true, message: 'Book not found!'});
        packet.respond({ price: this.bookStorage[BookName].price });
    }

    BuyBook(packet) {
        if(!this._securityChecks(packet)) return packet.respond({error: true, message: 'Could not buy book.'});
        const { BookName } = packet.bodies[0].data;
        if(this.bookStorage[BookName].quantity < 1) return packet.respond({error: true, message: 'Book not in stock!'});
        this.bookStorage[BookName].quantity--;
        return packet.respond({success: true});
    }

    _securityChecks(packet) {
        //This is a private function! Do whatever you want here, BookService will not allow clients access to this endpoint.
        if(!(packet.bodies.length > 0 && packet.bodies[0].data.BookName)) return false;
        if(!this.bookStorage[packet.bodies[0].data.BookName]) return false;
        //More security checks here
        return true;
    }

}

const server = new AMFServer({host: 'localhost', port: 8080, path: '/Gateway'});
server.addHeader("RequestPersistentHeader", true, { name:"ID", mustUnderstand: false, data: 1 });
server.registerService(BookService);
server.listen(() => {
	console.log('Server initiated!');
});
```

### AMF Client:
#### Using async/await: 
```javascript
const {AMFClient, ENCODING} = require('@jadbalout/nodeamf');
const client = new AMFClient('http://localhost:8080/Gateway', ENCODING.AMF0);
client.addHeader('needClassName', false, true);
async function orderBook(bookName, allowance) {
    //Check book price
    let bookPricePacket = await client.sendRequest('NodeAMF.BookService.GetBookPrice', {BookName: bookName});
    let bookPriceData = bookPricePacket.bodies[0].data;
    if(bookPriceData.error) throw new Error(bookPriceData.message);
    if(bookPriceData.price > allowance) throw new Error('You do not have enough money to buy the book');
    
    //Buy Book
    let bookPurchasePacket = await client.sendRequest('NodeAMF.BookService.BuyBook', {BookName: bookName});
    let bookPurchaseData = bookPurchasePacket.bodies[0].data;
    if(bookPurchaseData.error) throw new Error(bookPurchaseData.message);
    console.log('Successfully purchased book!');
}
orderBook('Harry Potter', 100);
```
#### Using then:
```javascript
const {AMFClient, ENCODING} = require('@jadbalout/nodeamf');
const client = new AMFClient('http://localhost:8080/Gateway', ENCODING.AMF0);
client.addHeader('needClassName', false, true);
function orderBook(bookName, allowance) {
    //Check book price
    client.sendRequest('NodeAMF.BookService.GetBookPrice', {BookName: bookName}).then(bookPricePacket => {
        let bookPriceData = bookPricePacket.bodies[0].data;
        if(bookPriceData.error) throw new Error(bookPriceData.message);
        if(bookPriceData.price > allowance) throw new Error('You do not have enough money to buy the book');
        //Buy Book
        client.sendRequest('NodeAMF.BookService.BuyBook', {BookName: bookName}).then( bookPurchasePacket => {
            let bookPurchaseData = bookPurchasePacket.bodies[0].data;
            if(bookPurchaseData.error) throw new Error(bookPurchaseData.message);
            console.log('Successfully purchased book!');
        });
    });
}
orderBook('Harry Potter', 100);
```
## TODO

- Support for byte array.
- Adding examples/tests.

## License
[MIT](https://choosealicense.com/licenses/mit/)