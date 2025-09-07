const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/start', auth, (req, res) => {
  res.json({ message: 'Live stream started', streamId: Date.now() });
});

router.post('/stop', auth, (req, res) => {
  res.json({ message: 'Live stream stopped' });
});

module.exports = router;