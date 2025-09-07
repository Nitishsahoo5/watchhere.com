const User = require('../models/User');
const Video = require('../models/Video');

const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const user = await User.findById(userId)
      .populate('subscriptions', 'username avatar')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uploadedVideos = await Video.find({ uploader: userId })
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 });

    const likedVideos = await Video.find({ likes: userId })
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({
      user,
      uploadedVideos,
      likedVideos,
      subscribersCount: user.subscribers.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const subscribe = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot subscribe to yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSubscribed = req.user.subscriptions.includes(targetUserId);

    if (isSubscribed) {
      req.user.subscriptions = req.user.subscriptions.filter(id => !id.equals(targetUserId));
      targetUser.subscribers = targetUser.subscribers.filter(id => !id.equals(req.user._id));
    } else {
      req.user.subscriptions.push(targetUserId);
      targetUser.subscribers.push(req.user._id);
    }

    await req.user.save();
    await targetUser.save();

    res.json({ subscribed: !isSubscribed });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, subscribe };