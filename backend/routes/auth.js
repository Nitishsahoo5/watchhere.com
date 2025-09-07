const express = require('express');
const { register, login } = require('../controllers/authController');
const { passport, generateJWT } = require('../services/oauthService');
const { rateLimits } = require('../middleware/security');

const router = express.Router();

// Traditional auth with rate limiting
router.post('/register', rateLimits.auth, register);
router.post('/login', rateLimits.auth, login);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateJWT(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const token = generateJWT(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

module.exports = router;