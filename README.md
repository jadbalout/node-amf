# node-amf

node-amf is an AMF library for NodeJS that serializies, deserializies, sends and handles AMF data.

## What is AMF?

Action Message Format(AMF) is a binary format used to serialize objects and send messages between an Adobe Flash client and a remote server.

## TODO

- Finish AMF3 Objects ( also finish typed objects ) 
- Fix  bug reading dates in AMF0
- Convert all of input/output stream to use Buffer instead of the binary parser coded.
- Maybe create one universal Buffer object at the constructor of InputStream and use cursor to navigate.
- Creating server
- Adding examples, instructions, and usage.

## License
[MIT](https://choosealicense.com/licenses/mit/)