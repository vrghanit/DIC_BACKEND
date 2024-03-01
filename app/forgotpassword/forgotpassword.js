//const authModel = require("./authModel.js");
const client = require('../../config/connection');
var users = require('../../schema/users');
const config = require('../../config/default');

var date = new Date();
var crypto = require('crypto');

const success = true;
const fail = false;

exports.update_consumer_forgot_password = function(req, res){
     var authToken = decrypt(req.query.tkn)
     var query = users.findOne({ authToken : authToken, socialId : '' },{authToken:1});
     query.exec(function(err, userDetail) {
          if (err) {
               res.render('forgot_password/forgot_password',{
                    status : fail,
                    base_url : config.base_url,
               });
          }else{
               if(userDetail){
                    res.render('forgot_password/forgot_password',{
                         status : success,
                         token : req.query.tkn,
                         base_url : config.base_url,
                    });
               }else{
                    res.render('forgot_password/forgot_password',{
                         status : fail,
                         base_url : config.base_url,
                    });
               }
          }
     });
}

exports.update_consumer_forgot_password_action = function(req, res){

}


function encrypt(text) {
     var cipher = crypto.createCipher('aes-256-cbc', 'zws_aish')
     var crypted = cipher.update(text, 'utf8', 'hex')
     crypted += cipher.final('hex');
     return crypted;
}

function decrypt(text) {
     var decipher = crypto.createDecipher('aes-256-cbc', 'zws_aish')
     decrypt.setAutoPadding(false); // Set padding false
     var dec = decipher.update(text, 'hex', 'utf8')
     dec += decipher.final('utf8');
     return dec;
}

function randomAsciiString(length) {
     return randomString(length, '012345678987654321001234567898765432100123456789876543210');
}

function authTokenCreate(length) {
     return randomString(length, '01QWERTYUIOP23456789876543qweASDFGHJKLrtyuiop2100123456asdfghjkl789ZXCVBNM87654321001zxcvbnm23456789876543210');
}

function randomString(length, chars) {
     if (!chars) {
          throw new Error('Argument \'chars\' is undefined');
     }

     var charsLength = chars.length;
     if (charsLength > 256) {
          throw new Error('Argument \'chars\' should not have more than 256 characters'
               +
               ', otherwise unpredictability will be broken');
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
