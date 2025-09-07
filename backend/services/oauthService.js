const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    user = new User({
      googleId: profile.id,
      username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substr(2, 4),
      email: profile.emails[0].value,
      avatar: profile.photos[0].value,
      password: Math.random().toString(36)
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      $or: [
        { githubId: profile.id },
        { email: profile.emails?.[0]?.value }
      ]
    });

    if (user) {
      if (!user.githubId) {
        user.githubId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    user = new User({
      githubId: profile.id,
      username: profile.username || profile.displayName.replace(/\s+/g, '').toLowerCase(),
      email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
      avatar: profile.photos?.[0]?.value || '',
      password: Math.random().toString(36)
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

const generateJWT = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { passport, generateJWT };