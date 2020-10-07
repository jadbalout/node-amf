function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}
define('DT_UNDEFINED', 0x00);
define('DT_NULL', 0x01);
define('DT_BOOL_FALSE', 0x02);
define('DT_BOOL_TRUE', 0x03);
define('DT_INTEGER', 0x04);
define('DT_NUMBER', 0x05);
define('DT_STRING', 0x06);
define('DT_XML', 0x07);
define('DT_DATE', 0x08);
define('DT_ARRAY', 0x09);
define('DT_OBJECT', 0x0a);
define('DT_BYTEARRAY', 0x0b);

define('ET_PROPLIST', 0x00);
define('ET_EXTERNALIZED', 0x01);
define('ET_SERIAL', 0x02);