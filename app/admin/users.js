const client = require('../../config/connection');
var users = require('../../schema/users');

const config = require('../../config/default');

var crypto = require('crypto');
var date = new Date();

const success = true;
const fail = false;



exports.getUsers = function (req, res) {
    users.find().exec(function (err, result) {
        if (err) {
            res.json({
                "status": fail,
                'message': 'Try again later.',
                "data": {},
            });
        } else {
            res.json({
                "status": success,
                'message': 'Registered Users. ',
                "data": result,
            });
        }
    })
}


