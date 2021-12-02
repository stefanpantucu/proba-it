const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        maxLength: 500
    },
    subject: {
        type: String,
        required: true,
        maxLength: 80
    },
    teacher_id: {
        type: String,
        required: true
    },
    users: []
}, {
    timestamps: true
});

const tutoringClass = mongoose.model('TutoringClasses', classSchema);

module.exports = tutoringClass;
