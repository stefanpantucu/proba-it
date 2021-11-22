const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        maxLength: 50,
        match: /\S+@\S+\.\S+/
    },
    message: {
        type: String,
        required: true,
        maxLength: 5000,
    },
    is_resolved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact-requests', contactSchema);