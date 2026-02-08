const express = require('express');
const router = express.Router();
const {
    getTestimonials,
    createTestimonial,
    deleteTestimonial,
    getPartners,
    createPartner,
    deletePartner,
    getSettings,
    updateSetting,
    getTeam, createTeam, deleteTeam,
    getValues, createValue, deleteValue,
    getTimeline, createTimeline, deleteTimeline,
    getCerts, createCert, deleteCert
} = require('../controllers/cmsController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../config/permissions');

// Public Access
router.get('/testimonials', getTestimonials);
router.get('/partners', getPartners);
router.get('/settings', getSettings);
router.get('/team', getTeam);
router.get('/values', getValues);
router.get('/timeline', getTimeline);
router.get('/certs', getCerts);

// Admin Access
const adminAuth = [protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN)];

router.post('/testimonials', ...adminAuth, createTestimonial);
router.delete('/testimonials/:id', ...adminAuth, deleteTestimonial);

router.post('/partners', ...adminAuth, createPartner);
router.delete('/partners/:id', ...adminAuth, deletePartner);

router.post('/settings', protect, checkRole(ROLES.SUPER_ADMIN), updateSetting);

// About Management Routes
router.post('/team', ...adminAuth, createTeam);
router.delete('/team/:id', ...adminAuth, deleteTeam);

router.post('/values', ...adminAuth, createValue);
router.delete('/values/:id', ...adminAuth, deleteValue);

router.post('/timeline', ...adminAuth, createTimeline);
router.delete('/timeline/:id', ...adminAuth, deleteTimeline);

router.post('/certs', ...adminAuth, createCert);
router.delete('/certs/:id', ...adminAuth, deleteCert);

module.exports = router;
