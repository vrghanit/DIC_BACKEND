const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loginSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    role: {
        type: String
    },
}, {
    collection: 'login_users'
})

module.exports = mongoose.model('Login', loginSchema)