const mongoose = require('mongoose');

// Team Member Schema
const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    bio: { type: String },
    image: { type: String }, // URL
    linkedin: { type: String },
    twitter: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
});

// Core Value Schema
const coreValueSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String }, // Lucide icon name or URL
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
});

// Timeline Event Schema
const timelineEventSchema = new mongoose.Schema({
    year: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
});

// Certification Schema
const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String }, // e.g. "2023" or "Jan 2023"
    image: { type: String }, // URL
    isActive: { type: Boolean, default: true }
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
const CoreValue = mongoose.model('CoreValue', coreValueSchema);
const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema);
const Certification = mongoose.model('Certification', certificationSchema);

module.exports = {
    TeamMember,
    CoreValue,
    TimelineEvent,
    Certification
};
