// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var adminSchema = new Schema({
	email: {type: String, required: true, unique: [true, "email must be unique"]},
	password: { type: String, required: true },
	firstName: String,
	lastName: String,
	mobileNo: String,
	ProfilePhoto: String,
	address: String,
	storeName: String,
	services:  String,
	registrationNo:  String,
	gstNo:  String,
	authToken: String,
	userType: String, 
	created_at: Date,
	updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var Admin = mongoose.model('Admin', adminSchema);

// make this available to our users in our Node applications
module.exports = Admin;