const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, (req, res) => {
  res.json({ playlists: [] });
});

router.post('/', auth, (req, res) => {
  res.json({ message: 'Playlist created', id: Date.now() });
});

module.exports = router;