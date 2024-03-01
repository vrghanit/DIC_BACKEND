var FCM = require('fcm-node');
var serverKey = 'AAAAxJNqU-A:APA91bF18jqCS5zkm-fjvxjSaPC4cJKPcJfKnmoxYHW4IoA6oyjy0SCFsEyNLHIpKccGaNOsBN99jZ6Ng_jALX_Xz4JD4nma-acBYP16R22VlEni5H4WAoBUpd-aG1A9NPZO9sKBE3a7'; //put your server key here
var fcm = new FCM(serverKey);
const user = require('../schema/user');


async function send_notification(registration_ids, notification, data) {
    var i = 0;
    var tokenArr = []
    for (let index = 0; index < registration_ids.length; index++) {
        i++;
        tokenArr.push(registration_ids[index])
        if ((i == 100) || ((index + 1) == registration_ids.length)) {
            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                registration_ids: tokenArr,
                notification: notification,
                data: data,
            };
            fcm.send(message, function(err, response) {
                if (err) {
                    console.log("Something has gone wrong!", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
            i = 0;
            tokenArr = [];
        }
    }
}

async function send_notification_to_all(notification, data) {
    user.find({
        $and: [{
            "user_firebase_token": {
                "$ne": null
            }
        }]
    }, {
        user_firebase_token: 1
    }, function(err, result) {
        if (result.length > 0) {
            var i = 0;
            var tokenArr = [];
            result.forEach(function(e, index) {
                i++;
                tokenArr.push(e.user_firebase_token)
                if ((i == 100) || ((index + 1) == result.length)) {
                    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                        registration_ids: tokenArr,
                        notification: notification,
                        data: data,
                    };
                    fcm.send(message, function(err, response) {
                        if (err) {
                            console.log("Something has gone wrong!", err);
                        } else {
                            console.log("Successfully sent with response: ", tokenArr.length);
                        }
                    });
                    i = 0;
                    tokenArr = [];
                }
            })
        }
    })
}

module.exports = {
    send_notification,
    send_notification_to_all
}