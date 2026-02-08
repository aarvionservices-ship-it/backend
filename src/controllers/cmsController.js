const Testimonial = require('../models/Testimonial');
const Partner = require('../models/Partner');
const SiteSetting = require('../models/SiteSetting');
const { TeamMember, CoreValue, TimelineEvent, Certification } = require('../models/AboutModels');

// Helper for simple CRUD (to avoid repetitive code)
const createCRUDFunctions = (Model, name) => ({
    getAll: async (req, res) => {
        try {
            const items = await Model.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    },
    create: async (req, res) => {
        try {
            const item = await Model.create(req.body);
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data' });
        }
    },
    remove: async (req, res) => {
        try {
            await Model.findByIdAndDelete(req.params.id);
            res.json({ message: `${name} removed` });
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    }
});

const team = createCRUDFunctions(TeamMember, 'Team Member');
const values = createCRUDFunctions(CoreValue, 'Core Value');
const timeline = createCRUDFunctions(TimelineEvent, 'Timeline Event');
const certs = createCRUDFunctions(Certification, 'Certification');

// --- Testimonials ---

// @desc    Get all testimonials
// @route   GET /api/cms/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create testimonial
// @route   POST /api/cms/testimonials
// @access  Private (Admin)
const createTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.create(req.body);
        res.status(201).json(testimonial);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};

// @desc    Delete testimonial
// @route   DELETE /api/cms/testimonials/:id
// @access  Private (Admin)
const deleteTestimonial = async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ message: 'Testimonial removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Partners ---

// @desc    Get all partners
// @route   GET /api/cms/partners
// @access  Public
const getPartners = async (req, res) => {
    try {
        const partners = await Partner.find({ isActive: true });
        res.json(partners);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create partner
// @route   POST /api/cms/partners
// @access  Private (Admin)
const createPartner = async (req, res) => {
    try {
        const partner = await Partner.create(req.body);
        res.status(201).json(partner);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Delete partner
// @route   DELETE /api/cms/partners/:id
// @access  Private (Admin)
const deletePartner = async (req, res) => {
    try {
        await Partner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Partner removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Settings ---

// @desc    Get all settings
// @route   GET /api/cms/settings
// @access  Public (Some might be restricted, but for now Public mainly for frontend config)
const getSettings = async (req, res) => {
    try {
        const settings = await SiteSetting.find();
        const settingsMap = {};
        settings.forEach(s => settingsMap[s.key] = s.value);
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update/Create setting
// @route   POST /api/cms/settings
// @access  Private (Admin)
const updateSetting = async (req, res) => {
    const { key, value, group, description } = req.body;
    try {
        let setting = await SiteSetting.findOne({ key });
        if (setting) {
            setting.value = value;
            if (group) setting.group = group;
            if (description) setting.description = description;
            await setting.save();
        } else {
            setting = await SiteSetting.create({ key, value, group, description });
        }
        res.json(setting);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

module.exports = {
    getTestimonials,
    createTestimonial,
    deleteTestimonial,
    getPartners,
    createPartner,
    deletePartner,
    getSettings,
    updateSetting,
    // About Section
    getTeam: team.getAll, createTeam: team.create, deleteTeam: team.remove,
    getValues: values.getAll, createValue: values.create, deleteValue: values.remove,
    getTimeline: timeline.getAll, createTimeline: timeline.create, deleteTimeline: timeline.remove,
    getCerts: certs.getAll, createCert: certs.create, deleteCert: certs.remove
};
