const Video = require('../models/Video');
const { s3 } = require('../config/aws');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const getVideos = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const videos = await Video.find(query)
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadVideo = async (req, res) => {
  try {
    const { title, description, tags, category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const key = `videos/${Date.now()}-${file.originalname}`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const result = await s3.upload(uploadParams).promise();
    
    const video = new Video({
      title,
      description,
      url: `${process.env.CLOUDFRONT_URL}/${key}`,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || 'General',
      uploader: req.user._id
    });

    await video.save();
    await video.populate('uploader', 'username avatar');

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
};

const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const isLiked = video.likes.includes(req.user._id);
    
    if (isLiked) {
      video.likes = video.likes.filter(id => !id.equals(req.user._id));
    } else {
      video.likes.push(req.user._id);
    }

    await video.save();
    res.json({ liked: !isLiked, likesCount: video.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getVideos, uploadVideo: [upload.single('video'), uploadVideo], likeVideo };