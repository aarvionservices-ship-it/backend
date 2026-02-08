const express = require('express');
const router = express.Router();
const analyticsService = require('../services/AnalyticsService');

// POST /api/analytics/event
router.post('/event', async (req, res) => {
    try {
        const { metric, dimension, value } = req.body;

        if (!metric || !value) {
            return res.status(400).json({ error: 'Metric and value are required' });
        }

        await analyticsService.ingestEvent(metric, dimension || 'global', value);
        res.status(202).json({ status: 'accepted' });
    } catch (error) {
        console.error('Ingest Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../config/permissions');

// GET /api/analytics/query
// Protected: Only Admins and Super Admins can query analytics
router.get('/query', protect, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const { metric, dimension, start, end } = req.query;

        if (!metric || !start || !end) {
            return res.status(400).json({ error: 'Metric, start, and end parameters are required' });
        }

        const count = await analyticsService.getEstimate(
            metric,
            dimension || 'global',
            new Date(start),
            new Date(end)
        );

        res.json({ metric, dimension, start, end, count });
    } catch (error) {
        console.error('Query Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
