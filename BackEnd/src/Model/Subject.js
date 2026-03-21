const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    year: {
        type: Number,
        required: true,
        min: 1
    },
    semester: {
        type: Number,
        required: true,
        min: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique subject codes per course
SubjectSchema.index({ code: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema);
