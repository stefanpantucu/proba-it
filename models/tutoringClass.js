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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }]
}, {
    timestamps: true
});

const tutoringClass = mongoose.model('TutoringClasses', classSchema);

module.exports = tutoringClass;
