const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        default: ''
    },
    attachmentType: {
        type: String,
        enum: ['none', 'image', 'pdf'],
        default: 'none'
    },
    attachmentUrl: {
        type: String,
        default: ''
    },
    attachmentName: {
        type: String,
        default: ''
    },
    postedBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
