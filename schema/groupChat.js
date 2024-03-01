// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

ObjectId = Schema.ObjectId;

// create a schema
var chatSchema = new Schema({
	groupName: String,
	latestMessage: { type: String, default: null },
	users: [{userId: ObjectId, isArchive: { type: Boolean, default: false },read: { type: Boolean, default: false },}],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// the schema is useless so far
// we need to create a model using it
var Chat = mongoose.model('group_chat', chatSchema);

// make this available to our users in our Node applications
module.exports = Chat;

