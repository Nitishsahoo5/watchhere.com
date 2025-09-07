const Video = require('../models/Video');
const User = require('../models/User');

const getRecommendations = async (userId, limit = 10) => {
  try {
    const user = await User.findById(userId).populate('watchHistory');
    
    // Get user's watch history and preferences
    const watchedCategories = user.watchHistory?.map(v => v.category) || [];
    const categoryFreq = watchedCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    const topCategories = Object.entries(categoryFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    // Collaborative filtering - find similar users
    const similarUsers = await User.find({
      _id: { $ne: userId },
      watchHistory: { $in: user.watchHistory?.map(v => v._id) || [] }
    }).limit(5);

    const similarUserVideos = await Video.find({
      uploader: { $in: similarUsers.map(u => u._id) },
      _id: { $nin: user.watchHistory?.map(v => v._id) || [] }
    }).limit(5);

    // Content-based filtering
    const contentBasedVideos = await Video.find({
      category: { $in: topCategories },
      _id: { $nin: user.watchHistory?.map(v => v._id) || [] }
    })
    .sort({ views: -1, createdAt: -1 })
    .limit(5);

    // Trending videos
    const trendingVideos = await Video.find({
      _id: { $nin: user.watchHistory?.map(v => v._id) || [] },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
    .sort({ views: -1 })
    .limit(3);

    // Combine and deduplicate
    const allRecommendations = [
      ...similarUserVideos,
      ...contentBasedVideos,
      ...trendingVideos
    ];

    const uniqueRecommendations = allRecommendations
      .filter((video, index, self) => 
        index === self.findIndex(v => v._id.toString() === video._id.toString())
      )
      .slice(0, limit);

    return uniqueRecommendations;
  } catch (error) {
    // Fallback to popular videos
    return Video.find().sort({ views: -1 }).limit(limit);
  }
};

const updateUserPreferences = async (userId, videoId, action) => {
  try {
    const user = await User.findById(userId);
    const video = await Video.findById(videoId);
    
    if (!user || !video) return;

    switch (action) {
      case 'watch':
        if (!user.watchHistory) user.watchHistory = [];
        if (!user.watchHistory.includes(videoId)) {
          user.watchHistory.push(videoId);
        }
        break;
      case 'like':
        if (!user.preferences) user.preferences = {};
        if (!user.preferences.likedCategories) user.preferences.likedCategories = {};
        user.preferences.likedCategories[video.category] = 
          (user.preferences.likedCategories[video.category] || 0) + 1;
        break;
    }
    
    await user.save();
  } catch (error) {
    console.error('Error updating preferences:', error);
  }
};

module.exports = { getRecommendations, updateUserPreferences };