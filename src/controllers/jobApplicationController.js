const JobApplication = require('../models/JobApplication');
const SiteSetting = require('../models/SiteSetting');
const cloudinary = require('cloudinary').v2;

// @desc    Create a new job application
// @route   POST /api/applications
// @access  Public
const createApplication = async (req, res) => {
    try {
        const { name, email, phone, position, message, resumeUrl, videoResumeLink } = req.body;

        // Validation - check for name, email, position, and either a direct file or a URL
        if (!name || !email || !position || (!resumeUrl && !req.file)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, position, and your resume'
            });
        }

        // Get storage setting
        const storageSetting = await SiteSetting.findOne({ key: 'resume_storage_mode' });
        const storageMode = storageSetting ? storageSetting.value : 'cloudinary';

        let finalResumeUrl = '';
        let finalResumePublicId = '';
        let finalResumeData = null;
        let finalResumeMimeType = '';

        if (req.file) {
            finalResumeMimeType = req.file.mimetype;
            
            if (storageMode === 'mongodb') {
                // Save as bytes in MongoDB
                finalResumeData = req.file.buffer;
                finalResumeUrl = 'database://stored_in_mongodb';
            } else {
                // Manual upload to Cloudinary since we are using memoryStorage
                const uploadPromise = new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'aarvionservices_resumes',
                            resource_type: 'auto',
                            public_id: `resume_${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });

                const result = await uploadPromise;
                finalResumeUrl = result.secure_url;
                finalResumePublicId = result.public_id;
            }
        }

        const application = await JobApplication.create({
            name,
            email,
            phone,
            position,
            message,
            resumeUrl: finalResumeUrl,
            resumePublicId: finalResumePublicId,
            resumeData: finalResumeData,
            resumeMimeType: finalResumeMimeType,
            videoResumeLink
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to submit application',
            error: error.message
        });
    }
};

// @desc    Get all job applications
// @route   GET /api/applications
// @access  Private (HR, Admin)
const getApplications = async (req, res) => {
    try {
        const { status, search, limit = 50, page = 1 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { position: { $regex: search, $options: 'i' } }
            ];
        }

        const applications = await JobApplication.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await JobApplication.countDocuments(query);

        res.status(200).json({
            success: true,
            count: applications.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (HR, Admin)
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await JobApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        application.status = status;
        await application.save();

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (Admin only)
const deleteApplication = async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        await application.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Download resume via backend proxy
// @route   GET /api/applications/download/:id
// @access  Private (HR, Admin)
const downloadResume = async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id);
        if (!application || !application.resumeUrl) {
            return res.status(404).json({ success: false, message: 'Resume not found' });
        }

        const https = require('https');
        
        // Handle MongoDB storage mode (Bytes)
        if (application.resumeData && application.resumeData.length > 0) {
            const filename = `${application.name.replace(/[^a-z0-9]/gi, '_')}_Resume.${application.resumeMimeType === 'application/pdf' ? 'pdf' : 'doc'}`;
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', application.resumeMimeType || 'application/pdf');
            return res.send(application.resumeData);
        }

        let url = application.resumeUrl;
        
        // Clean up URL if it has the double-extension bug or fl_attachment already in it
        // This ensures the backend fetches the clean, original file from Cloudinary
        url = url.replace('/fl_attachment/', '/');

        const filename = `${application.name.replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`;

        https.get(url, (cloudinaryRes) => {
            // If the URL with extension fails, try one more time without the extension
            // (This handles the recent naming conflict for image-type PDFs)
            if (cloudinaryRes.statusCode === 404 && url.endsWith('.pdf')) {
                const retryUrl = url.slice(0, -4);
                https.get(retryUrl, (retryRes) => {
                    if (retryRes.statusCode === 200) {
                        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                        res.setHeader('Content-Type', 'application/pdf');
                        return retryRes.pipe(res);
                    }
                    res.status(404).json({ success: false, message: 'Resume file not found on storage' });
                });
                return;
            }

            if (cloudinaryRes.statusCode !== 200) {
                return res.status(cloudinaryRes.statusCode).json({ 
                    success: false, 
                    message: `Cloudinary error: ${cloudinaryRes.statusCode}` 
                });
            }

            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'application/pdf');
            cloudinaryRes.pipe(res);
        }).on('error', (err) => {
            res.status(500).json({ success: false, message: 'Download failed', error: err.message });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createApplication,
    getApplications,
    updateApplicationStatus,
    deleteApplication,
    downloadResume
};
