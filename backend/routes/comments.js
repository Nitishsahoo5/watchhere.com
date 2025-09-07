const express = require('express');
const { getComments, addComment } = require('../controllers/commentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:videoId', getComments);
router.post('/:videoId', auth, addComment);

module.exports = router;