const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Can be string, number, boolean, or object
        required: true
    },
    description: {
        type: String
    },
    group: {
        type: String,
        enum: ['General', 'SEO', 'Contact', 'Social'],
        default: 'General'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
