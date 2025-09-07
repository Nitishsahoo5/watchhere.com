const express = require('express');
const { getStats, getVideos, deleteVideo, getUsers } = require('../controllers/adminController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, getStats);
router.get('/videos', auth, getVideos);
router.delete('/videos/:id', auth, deleteVideo);
router.get('/users', auth, getUsers);

module.exports = router;