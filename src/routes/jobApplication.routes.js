const express = require('express');
const router = express.Router();
const {
    createApplication,
    getApplications,
    updateApplicationStatus,
    deleteApplication,
    downloadResume
} = require('../controllers/jobApplicationController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../config/permissions');

const { uploadMemory } = require('../services/uploadService');

// Public Route
// Use uploadMemory.single('resume') to get the file buffer for dynamic storage
router.post('/', uploadMemory.single('resume'), createApplication);

// Protected Routes
router.get('/', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), getApplications);
router.put('/:id/status', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), updateApplicationStatus);
router.get('/download/:id', protect, checkRole(ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN), downloadResume);
router.delete('/:id', protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteApplication);

module.exports = router;
