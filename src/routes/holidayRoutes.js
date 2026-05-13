const express = require('express');
const router = express.Router();
const {
    getHolidays,
    addHoliday,
    bulkAddHolidays,
    deleteHoliday
} = require('../controllers/holidayController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getHolidays)
    .post(protect, authorize('super-admin'), addHoliday);

router.route('/bulk')
    .post(protect, authorize('super-admin'), bulkAddHolidays);

router.route('/:id')
    .delete(protect, authorize('super-admin'), deleteHoliday);

module.exports = router;
