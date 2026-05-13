const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    resumeUrl: {
        type: String,
        required: false // Optional if saving as bytes in MongoDB
    },
    resumePublicId: {
        type: String
    },
    resumeData: {
        type: Buffer // For saving as bytes in MongoDB
    },
    resumeMimeType: {
        type: String // To know if it's PDF, DOCX, etc.
    },
    videoResumeLink: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
