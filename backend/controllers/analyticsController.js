const Analytics = require('../models/Analytics');
const Video = require('../models/Video');

const trackView = async (req, res) => {
  try {
    const { videoId, watchTime, completed, sessionId, device } = req.body;
    
    let analytics = await Analytics.findOne({ video: videoId, sessionId });
    
    if (analytics) {
      analytics.watchTime = Math.max(analytics.watchTime, watchTime);
      analytics.completed = completed || analytics.completed;
      await analytics.save();
    } else {
      analytics = new Analytics({
        video: videoId,
        user: req.user?._id,
        watchTime,
        completed,
        sessionId,
        device: device || 'web'
      });
      await analytics.save();
      
      // Increment view count
      await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getVideoAnalytics = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const [totalViews, avgWatchTime, completionRate, engagement] = await Promise.all([
      Analytics.countDocuments({ video: videoId }),
      Analytics.aggregate([
        { $match: { video: mongoose.Types.ObjectId(videoId) } },
        { $group: { _id: null, avg: { $avg: '$watchTime' } } }
      ]),
      Analytics.aggregate([
        { $match: { video: mongoose.Types.ObjectId(videoId) } },
        { $group: { _id: null, completed: { $sum: { $cond: ['$completed', 1, 0] } }, total: { $sum: 1 } } }
      ]),
      Analytics.aggregate([
        { $match: { video: mongoose.Types.ObjectId(videoId) } },
        { $group: {
          _id: null,
          likes: { $sum: { $cond: ['$engagement.liked', 1, 0] } },
          comments: { $sum: { $cond: ['$engagement.commented', 1, 0] } },
          shares: { $sum: { $cond: ['$engagement.shared', 1, 0] } }
        }}
      ])
    ]);
    
    res.json({
      totalViews,
      avgWatchTime: avgWatchTime[0]?.avg || 0,
      completionRate: completionRate[0] ? (completionRate[0].completed / completionRate[0].total) * 100 : 0,
      engagement: engagement[0] || { likes: 0, comments: 0, shares: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { trackView, getVideoAnalytics };