const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // OAuth providers
  googleId: { type: String, sparse: true },
  githubId: { type: String, sparse: true },
  
  // ML Recommendations
  watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  preferences: {
    likedCategories: { type: Object, default: {} },
    watchTime: { type: Object, default: {} }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);