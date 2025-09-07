const mongoose = require('mongoose');
const User = require('../models/User');
const Video = require('../models/Video');
require('dotenv').config();

const sampleVideos = [
  {
    title: 'JavaScript Tutorial for Beginners',
    description: 'Learn JavaScript fundamentals in this comprehensive tutorial covering variables, functions, and DOM manipulation.',
    category: 'Education',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnail: 'https://via.placeholder.com/640x360/4285f4/ffffff?text=JS+Tutorial',
    duration: 1800,
    tags: ['javascript', 'programming', 'tutorial', 'web development'],
    views: 1250,
    isProcessed: true,
    moderationStatus: 'approved'
  },
  {
    title: 'React Hooks Explained',
    description: 'Deep dive into React Hooks including useState, useEffect, and custom hooks with practical examples.',
    category: 'Technology',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnail: 'https://via.placeholder.com/640x360/61dafb/000000?text=React+Hooks',
    duration: 2400,
    tags: ['react', 'hooks', 'frontend', 'javascript'],
    views: 890,
    isProcessed: true,
    moderationStatus: 'approved'
  },
  {
    title: 'Gaming Highlights - Epic Moments',
    description: 'Best gaming moments compilation featuring incredible plays and funny fails from various games.',
    category: 'Gaming',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
    thumbnail: 'https://via.placeholder.com/640x360/ff6b6b/ffffff?text=Gaming+Highlights',
    duration: 900,
    tags: ['gaming', 'highlights', 'compilation', 'entertainment'],
    views: 2100,
    isProcessed: true,
    moderationStatus: 'approved'
  },
  {
    title: 'Cooking Masterclass - Italian Pasta',
    description: 'Learn to make authentic Italian pasta from scratch with traditional techniques and secret ingredients.',
    category: 'Lifestyle',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    thumbnail: 'https://via.placeholder.com/640x360/feca57/000000?text=Pasta+Cooking',
    duration: 3600,
    tags: ['cooking', 'italian', 'pasta', 'recipe'],
    views: 750,
    isProcessed: true,
    moderationStatus: 'approved'
  },
  {
    title: 'Fitness Workout - 10 Minute HIIT',
    description: 'High-intensity interval training workout that you can do at home with no equipment needed.',
    category: 'Health',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1920x1080_1mb.mp4',
    thumbnail: 'https://via.placeholder.com/640x360/48dbfb/000000?text=HIIT+Workout',
    duration: 600,
    tags: ['fitness', 'workout', 'hiit', 'health'],
    views: 1680,
    isProcessed: true,
    moderationStatus: 'approved'
  }
];

const uploadSampleVideos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get test users
    const users = await User.find({ email: { $regex: /@(test\.com|watchhere\.com)$/ } });
    if (users.length === 0) {
      console.log('❌ No test users found. Run createTestUsers.js first.');
      process.exit(1);
    }

    // Clear existing sample videos
    await Video.deleteMany({ title: { $in: sampleVideos.map(v => v.title) } });
    console.log('Cleared existing sample videos');

    // Create sample videos
    for (let i = 0; i < sampleVideos.length; i++) {
      const videoData = {
        ...sampleVideos[i],
        uploader: users[i % users.length]._id,
        aiSummary: `AI-generated summary: ${sampleVideos[i].description.substring(0, 100)}...`,
        aiHashtags: sampleVideos[i].tags,
        engagementScore: Math.floor(Math.random() * 100)
      };

      const video = new Video(videoData);
      await video.save();
      console.log(`✅ Created video: ${videoData.title} by ${users[i % users.length].username}`);
    }

    console.log('\n🎉 All sample videos uploaded successfully!');
    console.log(`\nTotal videos: ${sampleVideos.length}`);
    console.log('Categories: Education, Technology, Gaming, Lifestyle, Health');

    process.exit(0);
  } catch (error) {
    console.error('Error uploading sample videos:', error);
    process.exit(1);
  }
};

uploadSampleVideos();