const mongoose = require('mongoose');

const analyticsHLLSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        // Format: "metric:dimension:timebucket"
        // e.g., "dau:global:2023-10-27"
    },
    metric: {
        type: String,
        required: true,
        index: true
    },
    dimension: {
        type: String,
        required: true,
        default: 'global',
        index: true
    },
    hll_blob: {
        type: Buffer,
        required: true
    },
    precision: {
        type: Number,
        required: true,
        default: 14
    },
    window_start: {
        type: Date,
        required: true,
        index: true
    },
    window_end: {
        type: Date,
        required: true
    },
    version: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '365d' // Auto-delete after 1 year
    }
}, {
    timestamps: true
});

// Compound index for querying ranges
analyticsHLLSchema.index({ metric: 1, dimension: 1, window_start: 1 });

module.exports = mongoose.model('AnalyticsHLL', analyticsHLLSchema);
