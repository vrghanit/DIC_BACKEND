var passwordHash = require('password-hash');
var CryptoJS = require('crypto-js');
var crypto = require('crypto');

const AES = require('crypto-js/aes');
const ENC = require('crypto-js/enc-utf8');
const SECRET_KEY = process.env.SECRETKEY || 'YOUR_BUCA_SECRACY';

function createHashPassword(password) {
    return passwordHash.generate(password);
}

function checkHashPassword(password, hash) {
    return passwordHash.verify(password, hash)
}

function data_encrypt(text) {
    const encrypted = AES.encrypt(JSON.stringify(text), SECRET_KEY);
    return encrypted.toString();
}

function data_decrypt(text) {
    const decryptedStr = AES.decrypt(text, SECRET_KEY).toString(ENC);
    try {
        return JSON.parse(decryptedStr);
    } catch (error) {
        return null;
    }
}

function randomAsciiString(length) {
    return randomString(length,'@'+ createHashPassword('' + new Date()));
}

function randomString(length, chars) {
    if (!chars) {
        throw new Error("Argument 'chars' is undefined");
    }

    var charsLength = chars.length;
    if (charsLength > 256) {
        throw new Error(
            "Argument 'chars' should not have more than 256 characters" +
            ', otherwise unpredictability will be broken'
        );
    }

    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);
    var cursor = 0;

    for (var i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
    }
    return result.join('');
}

function create_folder(dirpath) {
	var fs = require('fs');
    try {
        if (!fs.existsSync(dirpath)) {
            fs.mkdirSync(dirpath);
            return true;
        }
    } catch (err) {
    	console.log(err);
        if (err.code !== 'EXIST') {
            return false;
        }
    }
}


module.exports = {
    createHashPassword,
    checkHashPassword,
    data_encrypt,
    data_decrypt,
    randomAsciiString,
    randomString,
    create_folder
}