const express = require('express');
const { getUserNotifications, markNotificationRead } = require('../controllers/notificationController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getUserNotifications);
router.put('/:id/read', auth, markNotificationRead);

module.exports = router;