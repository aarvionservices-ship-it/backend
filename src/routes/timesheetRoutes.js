const express = require('express');
const router = express.Router();
const {
    createTimesheet,
    getTimesheets,
    getAllTimesheets,
    deleteTimesheet
} = require('../controllers/timesheetController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin', 'hr', 'super-admin'), createTimesheet)
    .get(protect, getTimesheets);

router.route('/all')
    .get(protect, authorize('super-admin'), getAllTimesheets);

router.route('/:id')
    .delete(protect, deleteTimesheet);

module.exports = router;
