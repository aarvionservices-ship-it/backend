
const express = require('express');
const router = express.Router();
const upload = require('../services/uploadService');

router.post('/', upload.single('resume'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        fileUrl: req.file.path
    });
});

module.exports = router;
