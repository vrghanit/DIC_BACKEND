// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

// create a schema
var templateSchema = new Schema({
	template : {type : Array},
	created_at: Date,
	updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var template = mongoose.model('template', templateSchema);

// make this available to our users in our Node applications
module.exports = template;