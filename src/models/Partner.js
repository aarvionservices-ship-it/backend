const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        type: String, // URL
        required: true
    },
    websiteUrl: {
        type: String,
        trim: true
    },
    section: {
        type: String,
        enum: ['Trusted Companies', 'Clients', 'Technology Partners'],
        default: 'Trusted Companies'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Partner', partnerSchema);
