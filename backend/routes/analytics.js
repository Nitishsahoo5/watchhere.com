const express = require('express');
const { trackView, getVideoAnalytics } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/track', trackView);
router.get('/video/:videoId', auth, getVideoAnalytics);

module.exports = router;