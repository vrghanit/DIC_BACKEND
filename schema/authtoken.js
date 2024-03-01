var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var authtokenSchema = new Schema({
	type: { type: String, required: true },
	id: { type: String, required: true },
	authToken: { type: String, required: true },
	ipAddress: { type: String, required: true },
	created_at: Date,
	updated_at: Date
});
var authtoken = mongoose.model('authtoken', authtokenSchema);
module.exports = authtoken;