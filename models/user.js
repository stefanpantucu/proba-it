const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    lastname: {
        type: String,
        required: true,
        maxLength: 50
    },
    firstname: {
        type: String,
        required: true,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        maxLength: 50
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true
    },
    reviews: []
}, {
    timestamps: true
});

const users = mongoose.model('Users', userSchema);

module.exports = users;