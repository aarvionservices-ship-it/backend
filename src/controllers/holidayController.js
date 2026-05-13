const Holiday = require('../models/Holiday');

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Public (or Private)
const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find({}).sort({ date: 1 });
        res.status(200).json(holidays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a holiday
// @route   POST /api/holidays
// @access  Private (Super Admin)
const addHoliday = async (req, res) => {
    try {
        const { date, name } = req.body;
        if (!date || !name) {
            return res.status(400).json({ message: 'Please provide date and name' });
        }

        const holiday = await Holiday.create({ date, name });
        res.status(201).json(holiday);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk add holidays (from CSV or list)
// @route   POST /api/holidays/bulk
// @access  Private (Super Admin)
const bulkAddHolidays = async (req, res) => {
    try {
        const { holidays } = req.body; // Array of { date, name }
        if (!Array.isArray(holidays)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        // Use insertMany with ordered: false to skip duplicates if needed
        const result = await Holiday.insertMany(holidays, { ordered: false });
        res.status(201).json(result);
    } catch (error) {
        // If some succeeded and some failed due to duplicate keys
        if (error.code === 11000) {
            return res.status(201).json({ message: 'Holidays imported with some duplicates skipped' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private (Super Admin)
const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        await holiday.deleteOne();
        res.status(200).json({ message: 'Holiday removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getHolidays,
    addHoliday,
    bulkAddHolidays,
    deleteHoliday
};
