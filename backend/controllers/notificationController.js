const { getNotifications, markAsRead } = require('../services/notificationService');

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await getNotifications(req.user._id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    await markAsRead(req.params.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserNotifications, markNotificationRead };