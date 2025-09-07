const express = require('express');
const { getProfile, subscribe } = require('../controllers/profileController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:userId?', auth, getProfile);
router.post('/:userId/subscribe', auth, subscribe);

module.exports = router;