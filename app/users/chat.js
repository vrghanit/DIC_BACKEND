var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var Chat = require('../../schema/chat');
var GoupChat = require('../../schema/groupChat');
var User = require('../../schema/users');

const success = true;
const fail = false;
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function sortDateFunction(a,b){
    console.log(a,'======',b);
    var dateA = new Date(a.updatedAt).getTime();
    var dateB = new Date(b.updatedAt).getTime();
    
    return dateA > dateB ? 1 : -1;  
};

// Get user's chat
exports.getUserChat = function (req, res) {
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    var query = { userId: uId }

    let pipeline = [
        { $match: query},
        { $unwind: '$chat' },
        { $sort: { "chat.read": 1, "chat.updatedAt": -1}}
    ]

    Chat.aggregate(pipeline, async function(err,docs) {
        if(docs.length == 0){
            res.json({
                "status": success,
                'message': 'NO chats found',
            })
        } else {
            // console.log( JSON.stringify( docs, undefined, 4 ) );
            let result = []
            for (uChat of docs) {
                let item = uChat.chat
                if (item.user) {
                    var uInfo = []
                    if(item.isArchive == false){ // Check if not archived
                        let uData = await User.findOne({ _id: item.user })
                        if (uData !== null) {
                            uInfo.push({
                                userId: uData._id,
                                isArchive: item.isArchive,
                                name: uData.name,
                                profileImage: uData.profile_image,
                            })
                        }

                        var arr = {
                            chatId: item._id,
                            read: item.read,
                            latestMessage: item.latestMessage,
                            chatStringId: item.chatStringId,
                            msgCreated: item.createdAt,
                            msgUpdated: item.updatedAt,
                            users: uInfo
                        }
                        result.push(arr)
                    }
                }
            }

            await res.json({
                "status": success,
                'message': '',
                "data": result,
            })  
        }
    })
}

exports.saveUserChat = function (req, res) {
    var reqData = req.body;
    var uId = req.authData._id;
    var fId = reqData.userId;
    var message = reqData.message;
    let chatStringId = generateString(15)

    manageChat(uId, fId, message, chatStringId)
    manageChat(fId, uId, message, chatStringId, false)
    res.json({
        "status": success,
        'message': 'Done'
    });

}

function manageChat(userId, friendId, message, chatStringId, readStatus = true){
    var uId = new ObjectId(userId);
    var fId = new ObjectId(friendId);
    var query = { userId: uId }

    // Find if user exist or not
    Chat.findOne(query, function (err, doc) {

        if(doc){ // if exist
            var fQuery = { userId: uId, "chat.user": fId }
            // Find if friend exist or not
            Chat.findOne(fQuery, function (err, fdoc) {
                if(fdoc){
                    let setData = {
                        $set: {
                            "chat.$.read": readStatus,
                            "chat.$.latestMessage": message,
                            "chat.$.updatedAt": Date.now()
                        }
                    }
                    // Update latest message
                    Chat.updateOne(fQuery, setData)
                    .catch((err) => {console.log('Error: ' + err)})
                } else {
                    let setChat = {
                        $push: {
                            "chat": {
                                user: fId,
                                latestMessage: message,
                                chatStringId: chatStringId.trim(),
                                read: readStatus,
                                updatedAt: Date.now()
                            }
                        }
                    }
                    // Push new chat
                    Chat.updateOne(query, setChat)
                    .catch((err) => {console.log('Error: ' + err)})
                }
            })
            return true
        } else { // if not exist
            let saveData = {
                    userId: uId,
                    chat: [
                        {
                            user: fId,
                            latestMessage: message,
                            chatStringId: chatStringId.trim(),
                            read: readStatus
                        }
                    ]
                }
            // Save new chat
            Chat.create(saveData).then(data => {
                User.updateOne(
                    { _id: data.userId },
                    { $set: { chatId: data._id }},
                    { upsert: true }
                ).catch((err) => {console.log('Error: ' + err)})
            })

            return true
        }
    })
}


/**
 * Archive One2One Chat
 */
 exports.archiveChatList = (req, res) => {
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    var query = { userId: uId,"chat.isArchive":true }


    let pipeline = [
        { $match: query},
        { $unwind: '$chat' },
        { $sort: { "chat.read": 1, "chat.updatedAt": -1}}
    ]

    Chat.aggregate(pipeline, async function(err,docs) {
        if(docs.length == 0){
            res.json({
                "status": success,
                'message': 'NO chats found',
            })
        } else {
            let result = []
            for (uChat of docs) {
                let item = uChat.chat
                if (item.user) {
                    var uInfo = []
                    if(item.isArchive == true){ // Check if archived
                        let uData = await User.findOne({ _id: item.user })
                        if (uData !== null) {
                            uInfo.push({
                                userId: uData._id,
                                isArchive: item.isArchive,
                                name: uData.name,
                                profileImage: uData.profile_image,
                            })
                        }

                        var arr = {
                            chatId: item._id,
                            read: item.read,
                            latestMessage: item.latestMessage,
                            chatStringId: item.chatStringId,
                            msgCreated: item.createdAt,
                            msgUpdated: item.updatedAt,
                            users: uInfo
                        }
                        result.push(arr)
                    }
                }
            }

            await res.json({
                "status": success,
                'message': '',
                "data": result,
            })
        }

    })
}

/**
 * Archive One2One Chat
 */
 exports.archiveChat = (req, res) => {
    var reqData = req.body;
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    let userIds = reqData.userId.split(",");

    if(userIds.length){
        for(item of userIds){
            let userId = mongoose.mongo.ObjectId(item);
            Chat.updateOne(
                {
                    "userId": uId,
                    "chat.user":userId
                },
                {
                    $set: { "chat.$.isArchive": true }
                }
            ).catch(e=>console.error("error:",e))
        }
        res.status(200).json({
            "status": "Archived"
        });
    } else {
        res.status(200).json({
            "message": "Group id is missing"
        });
    }
}

/**
 * UnArchive One2One Chat
 */
 exports.unArchiveChat = (req, res) => {
    var reqData = req.body;
    var uId = mongoose.mongo.ObjectId(req.authData._id);

    let userIds = reqData.userId.split(",");

    if(userIds.length){
        for(item of userIds){
            let userId = mongoose.mongo.ObjectId(item);
            Chat.updateOne(
                {
                    "userId": uId,
                    "chat.user":userId
                },
                {
                    $set: { "chat.$.isArchive": false }
                }
            ).catch(e=>console.error("error:",e))
        }
        res.status(200).json({
            "status": "Unarchived"
        });
    } else {
        res.status(200).json({
            "message": "Group id is missing"
        });
    }

}

/**
 * Delete One2One Chat
 */
 exports.deleteChat = (req, res) => {
    var reqData = req.body;
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    let chatIds = reqData.chatId.split(",");

    if(chatIds.length){
        for(item of chatIds){
            let chatId = mongoose.mongo.ObjectId(item);
            
            Chat.updateOne(
                { 
                    userId: uId
                },
                {
                    $pull: { chat:{_id:chatId} }
                }
            ).catch(e=>console.error("error:",e))
        }
        res.status(200).json({
            "status": "Deleted"
        });
    } else {
        res.status(200).json({
            "message": "Group id is missing"
        });
    }
}


/**
 * Read One2One Chat
 */
 exports.readChat = (req, res) => {
    var reqData = req.body;
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    var userId = mongoose.mongo.ObjectId(reqData.userId);

    var query = { userId: uId,"chat.user":userId }

    Chat.findOne(query, async function (err, docs) {
        if(docs){
            Chat.updateOne(
                query,
                {
                    $set: { "chat.$.read": true }
                }
            ).catch(e=>console.error("error:",e))
        
            res.status(200).json({
                "status": "Done"
            });
        } else {
            res.status(200).json({
                "status": "No Chat Found"
            });
        }

    })
}





//=================Start Group API===================== 

/**
 * Create Group
 */

exports.createGroup = (req, res) => {
    var reqData = req.body;
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    let fIDs = reqData.userIds.map(s => { return {userId: new ObjectId(s)}});
    let groupName = reqData.groupName;

    fIDs.push({userId:uId})

    let saveData = {
        groupName: groupName,
        users: fIDs
    }

    GoupChat.create(saveData).then(data => {
        fIDs.map(fId=> {
            let query = {_id: fId.userId}
            
            User.findOne(query, function (err, doc) {
                
                if(err) return
                User.updateOne(
                    { _id: fId.userId },
                    {
                        $addToSet: {groupChatIds:[data._id]}
                    },
                    { multi: true }
                ).catch(e=>console.error("error:",e))
            }) 
        })
        
        res.status(200).json({
            "status": "OK"
        });
    })
}

/**
 * Get Group Chat
 */
exports.getGroupChat = (req, res) => {
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    
    User.findOne({_id:uId}, async function (err, doc) {
        if(doc){
            let result = [], resultRF = []
            if('groupChatIds' in doc){
                for (item of doc.groupChatIds){
                    let query = {
                        _id:item,
                        "users.isArchive":false,
                        "users.userId":uId,
                    }
                    
                    let grpDoc = await GoupChat.findOne(query)

                    var uInfo = []
                    if( grpDoc != null && grpDoc.users.length){

                        let checkGrpStatus = 1,
                        checkRF = 1

                        for (uItem of grpDoc.users) {
                            
                            if(uItem.isArchive == true && JSON.stringify(uItem.userId) == JSON.stringify(uId)){
                                checkGrpStatus = 0
                            }

                            if(uItem.read == true && JSON.stringify(uItem.userId) == JSON.stringify(uId)){
                                checkRF = 0
                            }
                            
                            let uData = await User.findOne({ _id: uItem.userId })
                            if (uData !== null) {
                                uInfo.push({
                                    isArchive: uItem.isArchive,
                                    read: uItem.read,
                                    userId: uData._id,
                                    name: uData.name,
                                    profileImage: uData.profile_image,
                                })
                            }
                        }
                        let gc = {
                            groupId: grpDoc._id,
                            latestMessage: grpDoc.latestMessage,
                            groupName: grpDoc.groupName,
                            users: uInfo,
                            createdAt: grpDoc.createdAt,
                            updatedAt: grpDoc.updatedAt,
                        }
                        // pushing read:false obj at resultRF
                        if(checkRF == 1){
                            checkGrpStatus == 1 ? await resultRF.push(gc) : ''
                        } else {
                            checkGrpStatus == 1 ? await result.push(gc) : ''
                        }
                        
                    }
                    
                } // End of FOR

                resultRF.sort(function(a,b){
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });
                
                result.sort(function(a,b){
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });

                await res.status(200).json({
                    "status": success,
                    'message': 'Test',
                    "data": [...resultRF, ...result],
                });

            } else {
                res.status(200).json({
                    "status": "No Chat Found"
                });
            }
        } else {
            res.status(200).json({
                "status": "User Found"
            });
        }
    })
}

/**
 * update Group Chat
 */
exports.updateGroupChat = (req, res) => {
    var reqData = req.body;
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    var groupId = mongoose.mongo.ObjectId(reqData.groupId);
    var msg = reqData.message

    GoupChat.updateOne(
        { _id: groupId },
        {
            $set: { latestMessage:msg, "users.$[].read": false, updatedAt: Date.now() }
        },
        {$upsert: true}
    ).then(()=>{
        GoupChat.updateOne(
            { _id: groupId,  "users.userId": uId},
            {
                $set: { "users.$.read": true }
            },
            {$upsert: true}
        ).catch(e=>console.error("error:",e))
    }).catch(e=>console.error("error:",e))

    res.status(200).json({
        "status": "updated"
    });
    
}

/**
 * Archive Group Chat List
 */
 exports.getArchiveGroupChatList = (req, res) => {
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    
    User.findOne({_id:uId}, async function (err, doc) {
        if(doc){
            let result = [], resultRF = []
            if('groupChatIds' in doc){
                for (item of doc.groupChatIds){
                    let query = {
                        _id:item,
                        "users.isArchive":true,
                        "users.userId":uId,
                    }
                    let grpDoc = await GoupChat.findOne(query)
                    var uInfo = []
                    
                    if(grpDoc != null && grpDoc.users.length){
                        let checkRF = 1
                        for (uItem of grpDoc.users) {

                            if(uItem.read == true && JSON.stringify(uItem.userId) == JSON.stringify(uId)){
                                checkRF = 0
                            }

                            let uData = await User.findOne({ _id: uItem.userId })
                            if (uData !== null) {
                                uInfo.push({
                                    read: uItem.read,
                                    isArchive: uItem.isArchive,
                                    userId: uData._id,
                                    name: uData.name,
                                    profileImage: uData.profile_image,
                                })
                            }
                        }
                        let gc = {
                            groupId: grpDoc._id,
                            latestMessage: grpDoc.latestMessage,
                            groupName: grpDoc.groupName,
                            users: uInfo,
                            createdAt: grpDoc.createdAt
                        }

                        // pushing read:false obj at resultRF
                        checkRF == 1 ? await resultRF.push(gc) : await result.push(gc)
                    }
                    
                } // End of FOR

                resultRF.sort(function(a,b){
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });
                
                result.sort(function(a,b){
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });
                
                await res.status(200).json({
                    "status": success,
                    'message': '',
                    "data": [...resultRF, ...result],
                });

            } else {
                res.status(200).json({
                    "status": "No Chat Found"
                });
            }
        } else {
            res.status(200).json({
                "status": "User Found"
            });
        }
    })
}

/**
 * Archive Group Chat
 */
 exports.archiveGroupChat = (req, res) => {
    var reqData = req.body;
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    let grpIds = reqData.groupId.split(",");

    if(grpIds.length){
        for(item of grpIds){
            let groupId = mongoose.mongo.ObjectId(item);
            GoupChat.updateOne(
                { 
                    _id: groupId,
                    "users.userId": uId
                },
                {
                    $set: { "users.$.isArchive": true }
                }
            ).catch(e=>console.error("error:",e))
        }
        res.status(200).json({
            "status": "Archived"
        });
    } else {
        res.status(200).json({
            "message": "Group id is missing"
        });
    }
}

/**
 * Unarchive Group Chat
 */
 exports.unArchiveGroupChat = (req, res) => {
    var reqData = req.body;
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    let grpIds = reqData.groupId.split(",");

    if(grpIds.length){
        for(item of grpIds){
            let groupId = mongoose.mongo.ObjectId(item);
            GoupChat.updateOne(
                { 
                    _id: groupId,
                    "users.userId": uId
                },
                {
                    $set: { "users.$.isArchive": false }
                }
            ).catch(e=>console.error("error:",e))
        }
        res.status(200).json({
            "status": "Unarchived"
        });
    } else {
        res.status(200).json({
            "message": "Group id is missing"
        });
    }
}

/**
 * Delete Group Chat
 */
 exports.deleteGroupChat = (req, res) => {
    var reqData = req.body;
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    let grpIds = reqData.groupId.split(",");

    if(grpIds.length){
        for(item of grpIds){
            let groupId = mongoose.mongo.ObjectId(item);

            GoupChat.updateOne(
                { 
                    _id: groupId,
                },
                {
                    $pull: { "users": {userId:uId} }
                }
                
            ).then(()=> {
                let queryMsg = {
                    _id: uId
                }
                User.findOne(queryMsg, function (error, result) {
                    if(result){
                        updatedArr = result.groupChatIds.filter(idItem => idItem != item)
                        User.updateOne(
                            {_id: uId},
                            { $set: {groupChatIds: updatedArr}}
                        ).catch(e=>console.error("error:",e))
                    }
            
                })
                res.status(200).json({
                    "status": "Deleted"
                });
            })
            
        }
        res.status(200).json({
            "status": "Archived"
        });
    } else {
        res.status(200).json({
            "message": "Group id is missing"
        });
    }
    
}

/**
 * Unarchive Group Chat
 */
 exports.readGroupChat = (req, res) => {
    var reqData = req.body;
    var uId = mongoose.mongo.ObjectId(req.authData._id);
    var groupId = mongoose.mongo.ObjectId(reqData.groupId);

    GoupChat.updateOne(
        { 
            _id: groupId,
            "users.userId": uId
        },
        {
            $set: { "users.$.read": true }
        }
    ).catch(e=>console.error("error:",e))

    res.status(200).json({
        "status": "Unarchived"
    });
}

//-------------------------------------------------------------
/**
 * For internal Use
 */
exports.unsetField = (req, res) => {
    var uId = mongoose.mongo.ObjectId(req.authData._id);

    User.find({}, function(err, docs){
        for(item of docs){
            User.updateOne({_id:item._id},{$unset: {chatId:1,groupChatIds:1}},{multi: true}).catch(e=>{
                console.log("error==>",e);
                res.status(500).json({
                    "status": "Error"
                });
            });
        }

    })

    res.status(200).json({
        "status": "Done"
    });
}