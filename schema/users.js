// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

ObjectId = Schema.ObjectId;

/*
email: {type: String, required: true, unique: [true, "email must be unique"]},
    password: { type: String, required: true },
*/
// create a schema
var usersSchema = new Schema({
    gender: { type: String },
    code: { type: String },
    name: { type: String },
    phNumber: { type: String },
    postal_code: { type: String },
    profile_image: { type: String, default: '' },
    email: { type: String },
    password: { type: String },
    socialId: { type: String },
    socialType: { type: String },
    deviceType: { type: String },
    deviceToken: { type: String },
    fireabaseToken: { type: String },
    age: { type: String },
    industry: { type: String },
    company: { type: String },
    position: { type: String },
    address: { type: String },
    company_code: { type: String },
    cardStyle: { type: String },
    fontColor: { type: String },
    fontSize: { type: String },
    fontWeight: { type: String },
    fontFamily: { type: String },
    textDecoration: { type: String },
    linkedinUrl: { type: String },
    instagramUrl: { type: String },
    twitterUrl: { type: String },
    facebookurl: { type: String },
    alignment: { type: String },
    uniqueSharingId: { type: String },
    cardsShared: { type: Number },
    contactsList: { type: Array },
    messageList: { type: String },
    awards: { type: String },
    trees: { type: String },
    logo: { type: String },
    locationLatLong: { type: Array },
    shareRequest: { type: Array },
    sharing_progress: { type: String },
    template_url: { type: String },
    userStatus: { type: String, default: 'ACTIVE' }, // ACTIVE, INACTIVE
    isDeleted: { type: String, default: 'NO' }, // YES, NO
    authToken: String,
    Uid: { type: String },
    templateData: { type: Array },
    forgot_password_otp: { type: String },
    chatId: { type: ObjectId },
    groupChatIds: [{ type: ObjectId }],
    created_at: Date,
    updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var Users = mongoose.model('Users', usersSchema);

// make this available to our users in our Node applications
module.exports = Users;

