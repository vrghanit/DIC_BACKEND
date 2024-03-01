const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsletterSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email_address: {
        type: String
    },
    date:{ type: String, required: true, trim: true },
}, {
    collection: 'newsletter_users'
})

module.exports = mongoose.model('Newsletter', newsletterSchema)