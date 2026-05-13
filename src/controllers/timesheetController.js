const Timesheet = require('../models/Timesheet');

// @desc    Create a new timesheet entry
// @route   POST /api/timesheets
// @access  Private (Admin, HR)
const createTimesheet = async (req, res) => {
    try {
        const { content, tasks, date } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const timesheet = await Timesheet.create({
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            date: date || Date.now(),
            content,
            tasks: tasks || []
        });

        res.status(201).json(timesheet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all timesheets
// @route   GET /api/timesheets
// @access  Private (Super Admin, Admin, HR)
const getTimesheets = async (req, res) => {
    try {
        let query = {};
        const { month, year } = req.query;

        if (req.user.role !== 'super-admin') {
            query.userId = req.user._id;
        }

        if (month && year) {
            const startOfMonth = new Date(parseInt(year), parseInt(month), 1);
            const endOfMonth = new Date(parseInt(year), parseInt(month) + 1, 0, 23, 59, 59);
            query.date = {
                $gte: startOfMonth,
                $lte: endOfMonth
            };
        }

        const timesheets = await Timesheet.find(query).sort({ date: -1 });
        res.status(200).json(timesheets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all timesheets for SuperAdmin (explicitly)
// @route   GET /api/timesheets/all
// @access  Private (Super Admin)
const getAllTimesheets = async (req, res) => {
    try {
        const timesheets = await Timesheet.find({}).sort({ date: -1 });
        res.status(200).json(timesheets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a timesheet
// @route   DELETE /api/timesheets/:id
// @access  Private (Super Admin or owner)
const deleteTimesheet = async (req, res) => {
    try {
        const timesheet = await Timesheet.findById(req.params.id);

        if (!timesheet) {
            return res.status(404).json({ message: 'Timesheet not found' });
        }

        // Check ownership or super-admin role
        if (timesheet.userId.toString() !== req.user._id.toString() && req.user.role !== 'super-admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await timesheet.deleteOne();
        res.status(200).json({ message: 'Timesheet removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTimesheet,
    getTimesheets,
    getAllTimesheets,
    deleteTimesheet
};
