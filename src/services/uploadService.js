const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for documents (PDF, DOC, DOCX)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {

        // Original filename without extension
        const originalName = path
            .parse(file.originalname)
            .name
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();

        // File extension
        const fileExtension = path
            .extname(file.originalname)
            .toLowerCase()
            .replace('.', '');

        // IMPORTANT: 
        // For resource_type: 'auto', do NOT include the extension in the public_id.
        // Cloudinary will add it automatically based on the detected format.
        const publicId = `resume_${originalName}_${Date.now()}`;

        console.log('\n📤 Cloudinary Upload Configuration:');
        console.log('  Original filename:', file.originalname);
        console.log('  Sanitized name:', originalName);
        console.log('  Extension:', fileExtension);
        console.log('  Public ID:', publicId);
        console.log('  Resource type: raw');

        return {
            folder: 'aarvionservices_resumes',

            // IMPORTANT: Use 'auto' so Cloudinary detects PDFs as 'image' and Word docs as 'raw'
            // This is the ONLY way to get PDFs to open and download correctly in browsers.
            resource_type: 'auto',

            public_id: publicId,

            context: {
                originalname: file.originalname
            }
        };
    }
});

// Configure multer with file validation
const upload = multer({
    storage: storage,

    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },

    fileFilter: (req, file, cb) => {

        console.log('\n🔍 File Validation:');
        console.log('  Filename:', file.originalname);
        console.log('  MIME type:', file.mimetype);

        const allowedExtensions = ['.pdf', '.doc', '.docx'];

        const fileExtension = path
            .extname(file.originalname)
            .toLowerCase();

        console.log('  Extension:', fileExtension);

        if (allowedExtensions.includes(fileExtension)) {

            console.log('  ✅ File type valid');
            cb(null, true);

        } else {

            console.log('  ❌ File type invalid');

            cb(
                new Error(
                    `Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`
                )
            );
        }
    }
});

const uploadMemory = multer({ storage: multer.memoryStorage() });
module.exports = { upload, uploadMemory };