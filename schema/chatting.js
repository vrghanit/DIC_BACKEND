// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

// create a schema
var chattingSchema = new Schema({
	user1Id: {type: ObjectId},
    user2Id : { type :ObjectId }, 
	message : {type: Array},
	created_at: Date,
	updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var chatting = mongoose.model('chatting', chattingSchema);

// make this available to our users in our Node applications
module.exports = chatting;