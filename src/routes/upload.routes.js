const express = require('express');
const router = express.Router();
const uploadImage = require('../services/imageUploadService');
const upload = require('../services/uploadService');

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
    if (err) {
        if (err.name === 'MulterError') {
            if (err.code === 'UNEXPECTED_FIELD') {
                return res.status(400).json({
                    success: false,
                    message: `Unexpected field. Expected field name: '${err.field}'. Please check your form field name.`,
                    expectedField: err.field,
                    error: 'UNEXPECTED_FIELD'
                });
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Maximum size is 10MB for documents and 5MB for images.',
                    error: 'LIMIT_FILE_SIZE'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message,
                error: err.code
            });
        }
        // Handle file filter errors (invalid file type)
        if (err.message && err.message.includes('Invalid file type')) {
            return res.status(400).json({
                success: false,
                message: err.message,
                error: 'INVALID_FILE_TYPE'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'File upload error',
            error: err.message
        });
    }
    next();
};

// @route   POST /api/upload
// @desc    Upload resume/document (PDF, DOC, DOCX) to Cloudinary
// @access  Public
// Expected field name: 'resume' or 'file'
router.post('/', (req, res) => {
    // Try 'resume' first, then 'file' as fallback
    const uploadMiddleware = upload.single('resume');

    uploadMiddleware(req, res, (err) => {
        if (err) {
            // If error is unexpected field and field is 'file', try again with 'file'
            if (err.code === 'UNEXPECTED_FIELD' && err.field === 'file') {
                const fileUpload = upload.single('file');
                return fileUpload(req, res, (err2) => {
                    if (err2) {
                        return handleMulterError(err2, req, res, () => { });
                    }
                    if (!req.file) {
                        return res.status(400).json({
                            success: false,
                            message: 'No file uploaded'
                        });
                    }
                    return res.status(200).json({
                        success: true,
                        message: 'File uploaded successfully',
                        fileUrl: req.file.path,
                        fileName: req.file.filename || req.file.originalname
                    });
                });
            }
            return handleMulterError(err, req, res, () => { });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Expected field name: "resume" or "file"',
                hint: 'Make sure your form field name matches "resume" or "file"'
            });
        }

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            fileUrl: req.file.path,
            fileName: req.file.filename || req.file.originalname
        });
    });
});

// @route   POST /api/upload/image
// @desc    Upload image (JPG, PNG, JPEG, WEBP) to Cloudinary
// @access  Public/Protected (depending on use case)
// Expected field name: 'image'
router.post('/image', (req, res) => {
    const uploadMiddleware = uploadImage.single('image');

    uploadMiddleware(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res, () => { });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image uploaded. Expected field name: "image"',
                hint: 'Make sure your form field name is "image"'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: req.file.path,
            fileName: req.file.filename || req.file.originalname
        });
    });
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files to Cloudinary
// @access  Public
// Expected field name: 'files'
router.post('/multiple', (req, res) => {
    const uploadMiddleware = upload.array('files', 5); // Max 5 files

    uploadMiddleware(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res, () => { });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded. Expected field name: "files"',
                hint: 'Make sure your form field name is "files" and supports multiple files'
            });
        }

        const fileUrls = req.files.map(file => ({
            url: file.path,
            fileName: file.filename || file.originalname
        }));

        res.status(200).json({
            success: true,
            message: `${req.files.length} file(s) uploaded successfully`,
            files: fileUrls
        });
    });
});

// @route   GET /api/upload/info
// @desc    Get upload configuration info
// @access  Public
router.get('/info', (req, res) => {
    res.status(200).json({
        success: true,
        uploadProvider: 'Cloudinary',
        endpoints: {
            resume: {
                url: '/api/upload',
                method: 'POST',
                fieldName: 'resume',
                alternativeFieldName: 'file',
                acceptedFormats: ['pdf', 'doc', 'docx'],
                maxSize: '10MB',
                description: 'Upload resume or document files to Cloudinary'
            },
            image: {
                url: '/api/upload/image',
                method: 'POST',
                fieldName: 'image',
                acceptedFormats: ['jpg', 'png', 'jpeg', 'webp'],
                maxSize: '5MB',
                description: 'Upload image files to Cloudinary'
            },
            multiple: {
                url: '/api/upload/multiple',
                method: 'POST',
                fieldName: 'files',
                maxFiles: 5,
                acceptedFormats: ['pdf', 'doc', 'docx'],
                maxSize: '10MB per file',
                description: 'Upload multiple files to Cloudinary'
            }
        },
        tips: [
            'All files are uploaded directly to Cloudinary cloud storage',
            'Make sure the form field name matches the expected field name',
            'Use FormData in JavaScript to send files',
            'Set Content-Type to multipart/form-data',
            'Check file format before uploading',
            'Files are stored permanently in Cloudinary'
        ]
    });
});

module.exports = router;
