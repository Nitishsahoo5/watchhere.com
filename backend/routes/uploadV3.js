const express = require('express');
const multer = require('multer');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, createMultipartUpload } = require('../config/s3');
const auth = require('../middleware/auth');
const Video = require('../models/Video');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files only
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
});

// Upload video to S3 using AWS SDK v3
router.post('/video', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { title, description, category, tags } = req.body;
    const file = req.file;
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `videos/${req.user.id}/${timestamp}-${file.originalname}`;
    
    // Prepare upload parameters
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        'uploaded-by': req.user.id,
        'original-name': file.originalname,
        'upload-timestamp': timestamp.toString(),
      },
    };

    let uploadResult;

    // Use multipart upload for large files (>100MB)
    if (file.size > 100 * 1024 * 1024) {
      console.log('Using multipart upload for large file');
      const multipartUpload = createMultipartUpload(uploadParams);
      
      // Track upload progress
      multipartUpload.on('httpUploadProgress', (progress) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        console.log(`Upload progress: ${percentage}%`);
      });

      uploadResult = await multipartUpload.done();
    } else {
      // Use regular upload for smaller files
      console.log('Using regular upload for small file');
      const command = new PutObjectCommand(uploadParams);
      uploadResult = await s3Client.send(command);
    }

    // Generate S3 URL
    const videoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    
    // Save video metadata to database
    const video = new Video({
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      url: videoUrl,
      filename,
      uploader: req.user.id,
      fileSize: file.size,
      mimeType: file.mimetype,
      duration: 0, // Will be updated after processing
      isProcessed: false,
      moderationStatus: 'pending',
    });

    await video.save();

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        title: video.title,
        url: videoUrl,
        filename,
        size: file.size,
        uploadedAt: video.createdAt,
      },
      uploadResult: {
        ETag: uploadResult.ETag,
        Location: uploadResult.Location || videoUrl,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up S3 file if database save failed
    if (error.name === 'ValidationError' && req.file) {
      try {
        const deleteParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: filename,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        console.log('Cleaned up S3 file after database error');
      } catch (cleanupError) {
        console.error('Failed to cleanup S3 file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
    });
  }
});

// Upload thumbnail
router.post('/thumbnail', auth, upload.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No thumbnail file provided' });
    }

    const { videoId } = req.body;
    const file = req.file;
    
    // Generate thumbnail filename
    const timestamp = Date.now();
    const filename = `thumbnails/${req.user.id}/${timestamp}-${file.originalname}`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'max-age=31536000', // 1 year cache
    };

    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);
    
    const thumbnailUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    
    // Update video with thumbnail URL
    if (videoId) {
      await Video.findByIdAndUpdate(videoId, { thumbnail: thumbnailUrl });
    }

    res.json({
      message: 'Thumbnail uploaded successfully',
      thumbnailUrl,
      filename,
    });

  } catch (error) {
    console.error('Thumbnail upload error:', error);
    res.status(500).json({
      error: 'Thumbnail upload failed',
      message: error.message,
    });
  }
});

module.exports = router;