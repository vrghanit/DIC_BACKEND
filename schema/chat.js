// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

ObjectId = Schema.ObjectId;

/*
email: {type: String, required: true, unique: [true, "email must be unique"]},
	password: { type: String, required: true },
*/
// create a schema
var chatSchema = new Schema({
	userId: ObjectId,
	chat:[
		{
			user: ObjectId,
			isArchive: { type: Boolean, default: false },
			latestMessage: String,
			chatStringId: String,
			read: { type: Boolean, default: false },
			createdAt: { type: Date, default: Date.now },
			updatedAt: { type: Date, default: Date.now }
		}
	]
});

// the schema is useless so far
// we need to create a model using it
var Chat = mongoose.model('chat', chatSchema);

// make this available to our users in our Node applications
module.exports = Chat;

