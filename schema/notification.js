// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

// create a schema
var notificationSchema = new Schema({
	userId: {type: ObjectId},
	callType: {type: String},
    requesterId : {type : ObjectId},
	message : {type: String},
    status : { type : String },
    image  : { type : String },
    timestamp : { type : String },
    name : { type : String },
    status : { type : String ,default : 'UNSEEN' },  // SEEN . UNSEEN
	created_at: Date,
	updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var notification = mongoose.model('notification', notificationSchema);

// make this available to our users in our Node applications
module.exports = notification;