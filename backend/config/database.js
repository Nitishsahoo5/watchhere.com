const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes after connection
    await createIndexes();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Helper function to create index safely
    const createIndexSafely = async (collection, indexSpec, options = {}) => {
      try {
        await db.collection(collection).createIndex(indexSpec, options);
      } catch (error) {
        if (error.code === 85) {
          console.log(`Index already exists: ${options.name || 'unnamed'}`);
        } else {
          throw error;
        }
      }
    };
    
    // Video collection indexes
    await createIndexSafely('videos', { title: 'text', description: 'text', tags: 'text' }, { name: 'search_index' });
    await createIndexSafely('videos', { category: 1, createdAt: -1 }, { name: 'category_date_index' });
    await createIndexSafely('videos', { uploader: 1, createdAt: -1 }, { name: 'uploader_date_index' });
    await createIndexSafely('videos', { views: -1, createdAt: -1 }, { name: 'trending_index' });
    await createIndexSafely('videos', { moderationStatus: 1, isProcessed: 1 }, { name: 'moderation_index' });
    await createIndexSafely('videos', { likes: 1 }, { name: 'likes_index' });
    await createIndexSafely('videos', { duration: 1 }, { name: 'duration_index' });
    await createIndexSafely('videos', { engagementScore: -1 }, { name: 'engagement_index' });

    // User collection indexes
    await createIndexSafely('users', { email: 1 }, { unique: true, name: 'email_unique_index' });
    await createIndexSafely('users', { username: 1 }, { unique: true, name: 'username_unique_index' });
    await createIndexSafely('users', { googleId: 1 }, { sparse: true, name: 'google_id_index' });
    await createIndexSafely('users', { githubId: 1 }, { sparse: true, name: 'github_id_index' });
    await createIndexSafely('users', { watchHistory: 1 }, { name: 'watch_history_index' });
    await createIndexSafely('users', { subscribers: 1 }, { name: 'subscribers_index' });

    // Comment collection indexes
    await createIndexSafely('comments', { video: 1, createdAt: -1 }, { name: 'video_date_index' });
    await createIndexSafely('comments', { user: 1, createdAt: -1 }, { name: 'user_date_index' });

    // Analytics collection indexes
    await createIndexSafely('analytics', { video: 1, date: -1 }, { name: 'video_analytics_index' });
    await createIndexSafely('analytics', { user: 1, date: -1 }, { name: 'user_analytics_index' });
    await createIndexSafely('analytics', { event: 1, createdAt: -1 }, { name: 'event_index' });

    console.log('Database indexes verified/created successfully');
  } catch (error) {
    console.error('Index creation error:', error);
  }
};

// Query optimization helpers
const getOptimizedQuery = (model, filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    populate = null,
    select = null
  } = options;

  let query = model.find(filters);
  
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);
  
  query = query
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean(); // Return plain objects for better performance

  return query;
};

module.exports = { connectDB, createIndexes, getOptimizedQuery };