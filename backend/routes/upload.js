const express = require('express');
const multer = require('multer');
const { uploadVideo } = require('../controllers/videoController');
const { generateThumbnails, optimizeAndUpload } = require('../services/imageOptimizationService');
const { uploadVideoToS3 } = require('../services/videoUploadService');
const { invalidateVideoCache } = require('../services/cacheService');
const auth = require('../middleware/auth');
const Video = require('../models/Video');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only video and image files allowed'));
  },
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB
});

router.post('/', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const videoFile = req.files.video?.[0];
    const thumbnailFile = req.files.thumbnail?.[0];
    
    if (!videoFile) {
      return res.status(400).json({ message: 'Video file required' });
    }

    // Create video record
    const video = new Video({
      title,
      description,
      category: category || 'General',
      uploader: req.user._id,
      url: 'processing', // Temporary
      moderationStatus: 'pending'
    });
    
    await video.save();

    // Process in background
    processVideoAsync(videoFile.path, thumbnailFile?.path, video._id.toString());

    res.status(201).json({ 
      message: 'Upload started, processing in background',
      videoId: video._id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const processVideoAsync = async (videoPath, thumbnailPath, videoId) => {
  try {
    // Upload video to S3
    const videoUrl = await uploadVideoToS3(videoPath, videoId);

    let thumbnails = {};
    if (thumbnailPath) {
      // Generate optimized thumbnails
      const thumbnailBuffer = fs.readFileSync(thumbnailPath);
      thumbnails = await generateThumbnails(thumbnailBuffer, videoId);
    }

    // Update video record
    await Video.findByIdAndUpdate(videoId, {
      url: videoUrl,
      thumbnail: thumbnails.medium || thumbnails.large || '',
      thumbnails,
      isProcessed: true,
      moderationStatus: 'approved' // Simplified
    });

    // Invalidate related caches
    await invalidateVideoCache(videoId);

    // Cleanup temp files
    fs.unlinkSync(videoPath);
    if (thumbnailPath) fs.unlinkSync(thumbnailPath);
  } catch (error) {
    console.error('Video processing failed:', error);
    await Video.findByIdAndUpdate(videoId, { 
      isProcessed: false,
      moderationStatus: 'failed'
    });
  }
};


module.exports = router;