const assert = require('assert');
const db = require('./db.js');

let url ="";

const dbhost = encodeURIComponent(db.SERVER);
const dbport = encodeURIComponent(db.PORT);
const dbname = encodeURIComponent(db.DB_NAME);
const user = encodeURIComponent(db.USER);
const password = encodeURIComponent(db.PASSWORD);
if(user == ""){
    url = `mongodb://${dbhost}:${dbport}/${dbname}`;
}else{
    // url = `mongodb://${user}:${password}@${dbhost}:${dbport}/${dbname}?authSource=admin`;
    url = `mongodb+srv://${user}:${password}@${dbhost}/${dbname}?authSource=admin`;
}

var mongoose = require("mongoose");
mongoose.set('useCreateIndex', true)
//'mongodb://localhost:27017/buca-local-website-db'
mongoose.connect(url,{useNewUrlParser : true, useUnifiedTopology : true});

var client = mongoose.connection;

client.on("error", console.error.bind(console, "connection error"));
client.once("open", function(callback) {
	console.log("Connection succeeded.");
});

module.exports = client;
