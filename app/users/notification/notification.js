// //const authModel = require("./authModel.js");
// const client = require('../../../config/connection');
// var notification = require('../../../schema/notification');
// const config = require('../../../config/default');

// var date = new Date();
// var crypto = require('crypto');

// const success = true;
// const fail = false;

// exports.get_notification = async function(req, res){

// 	var getData = req.query;

// 	var pagination = {
//         skip: 0,
//         limit: 10,
//     }

// 	if(getData.limit){
// 		pagination.limit = Number(getData.limit);
// 		if(getData.page){
// 			var skip = getData.limit * (getData.page - 1);
// 			pagination.skip = Number(skip);
// 			pagination.page = Number(getData.page);
// 		}
// 	}

// 	var condition = [
// 		{    
// 			$match: {userId : req.authData._id} 
// 		},
// 		{
// 			$lookup: {
// 				from: 'stores',
// 				localField: 'storeId',
// 				foreignField: 'userId',
// 				as: 'storeData'
// 			}
// 		},
// 		{$unwind: '$storeData'},
// 		{
// 			$project: {
// 				'userId' : 1,
// 				'storeId' : 1,
// 				'employeeId' : 1,
// 				'bookingId' : 1,
// 				'message' : 1,
// 				'created_at' : 1,
// 				'storeName' : '$storeData.storeName',
// 				'storeImage' : 
// 					{ 
// 						$ifNull: 
// 						[
// 							{ 
// 							  $concat : [config.base_url, "uploads/store/", "$storeData.storeImage"]
// 							},
// 							{ 
// 							  $concat : ["https://via.placeholder.com/150/000000/FFFFFF/?text=", "BMS" ]
// 							} 
// 						] 
// 					}
// 			}
// 		},
// 		{ 
// 			$sort : { 
// 				'_id' : -1 
// 			} 
// 		}
// 	];

// 	notification.aggregate(condition, function(err, notificationCount) {
// 		pagination.totalRecord = notificationCount.length;

// 		condition.push({ $skip : pagination.skip });
// 		condition.push({ $limit : pagination.limit });

// 		notification.aggregate(condition, function(err, notificationRecord) {
// 			if(notificationRecord.length > 0){


// 				async function timeSince(date) {
// 					var seconds = Math.floor((new Date() - date) / 1000);
// 					var interval = Math.floor(seconds / 31536000);
// 					if (interval > 1) {
// 						return interval + " years ago";
// 					}
// 					interval = Math.floor(seconds / 2592000);
// 					if (interval > 1) {
// 						return interval + " months ago";
// 					}
// 					interval = Math.floor(seconds / 86400);
// 					if (interval > 1) {
// 						return interval + " days ago";
// 					}
// 					interval = Math.floor(seconds / 3600);
// 					if (interval > 1) {
// 						return interval + " hours ago";
// 					}
// 					interval = Math.floor(seconds / 60);
// 					if (interval > 1) {
// 						return interval + " minutes ago";
// 					}
// 					return Math.floor(seconds) + " seconds ago";
// 				}

// 				notificationRecord = JSON.parse(JSON.stringify(notificationRecord));

// 				var i = 0;
// 				notificationRecord.forEach(async (oneRecord) => {
// 					var timeAgo = await timeSince(new Date(oneRecord.created_at));
// 					notificationRecord[i].timeAgo = timeAgo;
// 					i++;
// 					if(i == notificationRecord.length) {
// 						res.json({
// 							"status": success,
// 							'message': 'Available notification.',
// 							"data": notificationRecord,
// 							"pagination": pagination,
// 						});
// 						res.end();
// 					}
// 				});				
// 			}else{
// 				res.json({
// 					"status": fail,
// 					'message': 'Notification not available.',
// 					"data": [],
// 					"pagination": pagination,
// 				});
// 				res.end();
// 			}
// 		})
// 	})
// }


// exports.notify = function(req, res){
// 	var FCM = require('fcm-node');
//     var serverKey = 'AAAA3APtoVo:APA91bEWVPRtExZ1ugDmltw8x6N1dECP1cs4E7x-Bayw3m63uLUty1s3CJvlk4hhXe-g_oCc4izuyZCmrLlRJLU0sjDK6GVMALOOS50PT0ftuuKIovPq1oj1ID3qVEMi52gYR3IymtGw'; //put your server key here
//     var fcm = new FCM(serverKey);
 
//     var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
//         to: 'cTYnbyNF0LE:APA91bGhT_rl6eLIlwL9P75gHof9ny_8V2_IJhu5tE8sb4h2adnDoMKKoX1cLw0slsW7kj5q-HhTCwYOY7IGJd5e4X-hyN-TlZb0-NkChEexl0AZjRxu2BaQLSeibwkwTZn686aPvXNl',
//         //collapse_key: 'your_collapse_key',
        
//         notification: {
//             title: 'BUCA', 
//             body: 'Hello mam',
//             //image : 'https://miro.medium.com/max/1024/1*HaAps8GidfAKdee7OrjZ2w.png',
//             //icon : '',
//         	//color: "blue"
//         },
        
//         data: {  //you can send only notification or only data(or include both)
//             my_key: 'my value',
//             my_another_key: 'my another value'
//         }
//     };


    
//     fcm.send(message, function(err, response){
//         if (err) {
//         	res.json({
// 				"status": success,
// 				'message': 'Something has gone wrong.',
// 				"err": err,
// 			});
//         } else {
//         	res.json({
// 				"status": success,
// 				'message': 'Successfully sent with response.',
// 				"response": response,
// 			});
//         }
//     });
// }

