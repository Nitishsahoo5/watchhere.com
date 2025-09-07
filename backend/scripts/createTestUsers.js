const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testUsers = [
  {
    username: 'admin',
    email: 'admin@watchhere.com',
    password: 'admin123',
    bio: 'Platform Administrator'
  },
  {
    username: 'creator1',
    email: 'creator1@test.com',
    password: 'creator123',
    bio: 'Content Creator - Tech Reviews'
  },
  {
    username: 'creator2',
    email: 'creator2@test.com',
    password: 'creator123',
    bio: 'Content Creator - Gaming'
  },
  {
    username: 'viewer1',
    email: 'viewer1@test.com',
    password: 'viewer123',
    bio: 'Regular Viewer'
  },
  {
    username: 'viewer2',
    email: 'viewer2@test.com',
    password: 'viewer123',
    bio: 'Regular Viewer'
  }
];

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ email: { $regex: /@(test\.com|watchhere\.com)$/ } });
    console.log('Cleared existing test users');

    // Create new test users
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.username} (${userData.email})`);
    }

    console.log('\n🎉 All test users created successfully!');
    console.log('\nLogin credentials:');
    testUsers.forEach(user => {
      console.log(`${user.username}: ${user.email} / ${user.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();