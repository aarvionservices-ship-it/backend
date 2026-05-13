const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    userName: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [{
        title: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'in-progress'],
            default: 'completed'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Timesheet', timesheetSchema);
