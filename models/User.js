const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    logo: {
        type: String
    },
    code: {
        type: String 
    },
    businessCard: {
        type: String
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    org_name: {
        type: String
    },
    message: {
        type: String
    },
    date: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    paid: {
        type: Boolean
    },
    template: {
        type: String
    }
}, {
    collection: 'web_users'
})

module.exports = mongoose.model('User', userSchema)