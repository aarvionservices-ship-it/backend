# Cloudinary Upload Configuration

## Overview

This application uses **Cloudinary** as the exclusive file upload solution for all environments (local development, staging, and production). All files are uploaded directly to Cloudinary cloud storage.

## Why Cloudinary Only?

### ✅ Benefits
- **Serverless-Ready**: Works perfectly in serverless environments (AWS Lambda, Vercel, Netlify)
- **No Temporary Storage**: No need for `/tmp` directories or local file storage
- **Persistent Storage**: Files are stored permanently in the cloud
- **Scalable**: Handles any number of uploads without storage limitations
- **CDN Delivery**: Files are delivered via Cloudinary's global CDN
- **Automatic Optimization**: Images are automatically optimized for web delivery

### ❌ Why We Removed Local Temp Storage
- **Serverless Incompatibility**: `/tmp` directories in serverless environments are ephemeral and limited
- **Not Shared**: Each serverless instance has its own `/tmp`, causing inconsistencies
- **Storage Limits**: Usually limited to 512MB in serverless environments
- **Complexity**: Maintaining two upload systems adds unnecessary complexity

## Configuration

### Environment Variables

Make sure these are set in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Upload Services

#### 1. Document Upload Service (`uploadService.js`)
- **Purpose**: Upload resumes and documents (PDF, DOC, DOCX)
- **Storage Folder**: `aarvionservices_resumes`
- **Max File Size**: 10MB
- **Resource Type**: `raw` (for non-image files)

#### 2. Image Upload Service (`imageUploadService.js`)
- **Purpose**: Upload images (JPG, PNG, JPEG, WEBP)
- **Storage Folder**: `aarvionservices_cms`
- **Max File Size**: 5MB
- **Resource Type**: `image`
- **Auto Optimization**: Images are automatically optimized (max 2000x2000, quality: auto)

## API Endpoints

### 1. Upload Resume/Document
```
POST /api/upload
```
- **Field Name**: `resume` or `file`
- **Accepted Formats**: PDF, DOC, DOCX
- **Max Size**: 10MB

**Example Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "fileUrl": "https://res.cloudinary.com/...",
  "fileName": "resume_1234567890.pdf"
}
```

### 2. Upload Image
```
POST /api/upload/image
```
- **Field Name**: `image`
- **Accepted Formats**: JPG, PNG, JPEG, WEBP
- **Max Size**: 5MB

**Example Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/...",
  "fileName": "image_1234567890.jpg"
}
```

### 3. Upload Multiple Files
```
POST /api/upload/multiple
```
- **Field Name**: `files`
- **Max Files**: 5
- **Accepted Formats**: PDF, DOC, DOCX
- **Max Size**: 10MB per file

**Example Response:**
```json
{
  "success": true,
  "message": "3 file(s) uploaded successfully",
  "files": [
    {
      "url": "https://res.cloudinary.com/...",
      "fileName": "resume_1234567890.pdf"
    },
    ...
  ]
}
```

### 4. Get Upload Info
```
GET /api/upload/info
```
Returns configuration information about all upload endpoints.

## Frontend Integration

### Using FormData (Recommended)

```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('resume', file); // or 'file' or 'image' depending on endpoint

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
      // Don't set Content-Type header - browser will set it automatically with boundary
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('File uploaded:', data.fileUrl);
      return data.fileUrl;
    } else {
      console.error('Upload failed:', data.message);
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

### Using Axios

```javascript
import axios from 'axios';

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  try {
    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('File uploaded:', response.data.fileUrl);
    return response.data.fileUrl;
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
  }
};
```

## Error Handling

### Common Errors

1. **UNEXPECTED_FIELD**
   - **Cause**: Form field name doesn't match expected field name
   - **Solution**: Use `resume`, `file`, or `image` as field name

2. **LIMIT_FILE_SIZE**
   - **Cause**: File exceeds maximum size limit
   - **Solution**: Compress file or use smaller file (max 10MB for docs, 5MB for images)

3. **INVALID_FILE_TYPE**
   - **Cause**: File format not allowed
   - **Solution**: Use only allowed formats (PDF, DOC, DOCX for documents; JPG, PNG, JPEG, WEBP for images)

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## File Organization in Cloudinary

### Folder Structure
```
aarvionservices_resumes/
  ├── resume_1234567890.pdf
  ├── resume_9876543210.docx
  └── ...

aarvionservices_cms/
  ├── image_1234567890.jpg
  ├── image_9876543210.png
  └── ...
```

### File Naming Convention
- **Documents**: `resume_[timestamp]-[random].extension`
- **Images**: `image_[timestamp]-[random].extension`

## Security Considerations

1. **File Validation**: Both extension and MIME type are validated
2. **Size Limits**: Enforced at multer level (10MB for docs, 5MB for images)
3. **Allowed Formats**: Whitelist approach - only specified formats are allowed
4. **Unique Filenames**: Prevents overwriting existing files
5. **Cloud Storage**: Files are stored securely in Cloudinary with access controls

## Monitoring & Debugging

### Check Upload Configuration
```
GET /api/upload/info
```

### View Cloudinary Console Logs
Check the server logs for detailed upload information:
- File validation details
- Cloudinary upload configuration
- Success/error messages

### Cloudinary Dashboard
Monitor uploads in your Cloudinary dashboard:
- https://cloudinary.com/console

## Deployment Checklist

- [ ] Set Cloudinary environment variables in deployment platform
- [ ] Verify Cloudinary credentials are correct
- [ ] Test file upload in production environment
- [ ] Monitor Cloudinary usage and storage limits
- [ ] Set up Cloudinary transformations if needed (for images)

## Migration Notes

### Removed Components
- ❌ `localUploadService.js` - No longer needed
- ❌ `/api/upload/debug` - Debug routes removed
- ❌ `/api/upload/debug-any` - Debug routes removed
- ❌ `/api/upload/debug-info` - Debug routes removed
- ❌ `temp/uploads` directory - No longer created

### What Stayed
- ✅ `uploadService.js` - Cloudinary document uploads
- ✅ `imageUploadService.js` - Cloudinary image uploads
- ✅ All production upload endpoints
- ✅ Error handling middleware

## Troubleshooting

### Upload fails with "Invalid credentials"
- Check that all three Cloudinary environment variables are set correctly
- Verify credentials in Cloudinary dashboard

### Upload succeeds but file URL is broken
- Check Cloudinary dashboard to see if file was actually uploaded
- Verify the `resource_type` is correct (`raw` for documents, `image` for images)

### File uploads but downloads as different name
- This is normal - Cloudinary generates its own URLs
- Original filename is preserved in metadata

## Best Practices

1. **Always validate files on frontend** before uploading to save bandwidth
2. **Show upload progress** to users for better UX
3. **Handle errors gracefully** with user-friendly messages
4. **Store Cloudinary URLs in database** for future reference
5. **Use Cloudinary transformations** for images (resize, optimize, etc.)
6. **Monitor Cloudinary usage** to avoid exceeding free tier limits

## Support

For Cloudinary-specific issues, refer to:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Storage Cloudinary](https://github.com/affanshahid/multer-storage-cloudinary)
