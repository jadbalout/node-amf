function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}
define('DT_NUMBER', 0x00);
define('DT_BOOL', 0x01);
define('DT_STRING', 0x02);
define('DT_OBJECT', 0x03);
define('DT_MOVIECLIP', 0x04);
define('DT_NULL', 0x05);
define('DT_UNDEFINED', 0x06);
define('DT_REFERENCE', 0x07);
define('DT_MIXEDARRAY', 0x08);
define('DT_OBJECTTERM', 0x09);
define('DT_ARRAY', 0x0a);
define('DT_DATE', 0x0b);
define('DT_LONGSTRING', 0x0c);
define('DT_UNSUPPORTED', 0x0e);
define('DT_XML', 0x0f);
define('DT_TYPEDOBJECT', 0x10);
define('DT_AMF3', 0x11);