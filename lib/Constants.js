function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("AC_Flash", 0);
define("AC_FlashCom", 1);
define("AC_Flash9", 3);
define("R_RESULT", 1);
define("R_STATUS", 2);
define("R_DEBUG", 3);
define("AMF0", 0);
define("AMF3", 3);
define("FLEXMSG", 16);
define("MIMETYPE", 'application/x-amf');
