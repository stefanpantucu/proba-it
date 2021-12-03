const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        maxLength: 500
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }
}, {
    timestamps: true
});

const reviews = mongoose.model('Reviews', reviewSchema);

module.exports = reviews;