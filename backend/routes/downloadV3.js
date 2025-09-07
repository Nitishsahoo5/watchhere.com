const express = require('express');
const { GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client } = require('../config/s3');
const auth = require('../middleware/auth');
const Video = require('../models/Video');

const router = express.Router();

// Get video stream with range support
router.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const range = req.headers.range;

    // Get video metadata from database
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Extract S3 key from URL
    const s3Key = video.filename || video.url.split('.amazonaws.com/')[1];
    
    // Get object metadata first
    const headParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    };

    const headCommand = new HeadObjectCommand(headParams);
    const headResult = await s3Client.send(headCommand);
    const fileSize = headResult.ContentLength;
    const contentType = headResult.ContentType;

    // Handle range requests for video streaming
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      // Get object with range
      const getParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Range: `bytes=${start}-${end}`,
      };

      const command = new GetObjectCommand(getParams);
      const result = await s3Client.send(command);

      // Set response headers for partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      });

      // Stream the data
      result.Body.pipe(res);

    } else {
      // Full file download
      const getParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
      };

      const command = new GetObjectCommand(getParams);
      const result = await s3Client.send(command);

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      });

      result.Body.pipe(res);
    }

    // Update view count (async, don't wait)
    Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }).exec();

  } catch (error) {
    console.error('Video streaming error:', error);
    res.status(500).json({
      error: 'Failed to stream video',
      message: error.message,
    });
  }
});

// Generate presigned URL for direct client access
router.get('/presigned/:videoId', auth, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { expiresIn = 3600 } = req.query; // Default 1 hour

    // Get video metadata
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if user has access (implement your authorization logic)
    const hasAccess = video.uploader.toString() === req.user.id || 
                     video.moderationStatus === 'approved';
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const s3Key = video.filename || video.url.split('.amazonaws.com/')[1];
    
    const getParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    };

    const command = new GetObjectCommand(getParams);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: parseInt(expiresIn),
    });

    res.json({
      signedUrl,
      expiresIn: parseInt(expiresIn),
      expiresAt: new Date(Date.now() + parseInt(expiresIn) * 1000),
    });

  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({
      error: 'Failed to generate presigned URL',
      message: error.message,
    });
  }
});

// Download video file (force download)
router.get('/download/:videoId', auth, async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId).populate('uploader', 'username');
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check download permissions
    const canDownload = video.uploader._id.toString() === req.user.id || 
                       req.user.role === 'admin';
    
    if (!canDownload) {
      return res.status(403).json({ error: 'Download not allowed' });
    }

    const s3Key = video.filename || video.url.split('.amazonaws.com/')[1];
    
    const getParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${video.title}.mp4"`,
    };

    const command = new GetObjectCommand(getParams);
    const result = await s3Client.send(command);

    // Set download headers
    res.setHeader('Content-Disposition', `attachment; filename="${video.title}.mp4"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    if (result.ContentLength) {
      res.setHeader('Content-Length', result.ContentLength);
    }

    // Stream the file
    result.Body.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: error.message,
    });
  }
});

// Get thumbnail
router.get('/thumbnail/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video || !video.thumbnail) {
      return res.status(404).json({ error: 'Thumbnail not found' });
    }

    // Extract S3 key from thumbnail URL
    const s3Key = video.thumbnail.split('.amazonaws.com/')[1];
    
    const getParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    };

    const command = new GetObjectCommand(getParams);
    const result = await s3Client.send(command);

    res.setHeader('Content-Type', result.ContentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours

    result.Body.pipe(res);

  } catch (error) {
    console.error('Thumbnail error:', error);
    res.status(500).json({
      error: 'Failed to get thumbnail',
      message: error.message,
    });
  }
});

module.exports = router;