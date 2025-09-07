const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment');

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalVideos, totalViews, totalComments] = await Promise.all([
      User.countDocuments(),
      Video.countDocuments(),
      Video.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Comment.countDocuments()
    ]);

    res.json({
      totalUsers,
      totalVideos,
      totalViews: totalViews[0]?.total || 0,
      totalComments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('uploader', 'username')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteVideo = async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ video: req.params.id });
    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats, getVideos, deleteVideo, getUsers };