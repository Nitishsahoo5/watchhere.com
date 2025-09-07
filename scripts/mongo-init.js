// MongoDB Initialization Script for WatchHere
// This script runs when MongoDB container starts for the first time

print('🚀 Initializing WatchHere MongoDB database...');

// Switch to watchhere database
db = db.getSiblingDB('watchhere');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email'],
      properties: {
        username: { bsonType: 'string', minLength: 3, maxLength: 30 },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        role: { enum: ['user', 'creator', 'admin'] }
      }
    }
  }
});

db.createCollection('videos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'uploader'],
      properties: {
        title: { bsonType: 'string', minLength: 1, maxLength: 200 },
        moderationStatus: { enum: ['pending', 'approved', 'rejected'] }
      }
    }
  }
});

// Create indexes for better performance
print('📊 Creating database indexes...');

// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { sparse: true });
db.users.createIndex({ githubId: 1 }, { sparse: true });

// Video indexes
db.videos.createIndex({ title: 'text', description: 'text', tags: 'text' });
db.videos.createIndex({ category: 1, createdAt: -1 });
db.videos.createIndex({ uploader: 1, createdAt: -1 });
db.videos.createIndex({ views: -1, createdAt: -1 });
db.videos.createIndex({ moderationStatus: 1, isProcessed: 1 });

// Comment indexes
db.comments.createIndex({ video: 1, createdAt: -1 });
db.comments.createIndex({ user: 1, createdAt: -1 });

// Analytics indexes
db.analytics.createIndex({ video: 1, date: -1 });
db.analytics.createIndex({ user: 1, date: -1 });
db.analytics.createIndex({ event: 1, createdAt: -1 });

// Create admin user (optional)
const adminUser = {
  username: 'admin',
  email: 'admin@watchhere.com',
  password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIf6', // 'admin123'
  role: 'admin',
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

try {
  db.users.insertOne(adminUser);
  print('✅ Admin user created (username: admin, password: admin123)');
} catch (error) {
  print('ℹ️ Admin user already exists or creation failed');
}

print('✅ WatchHere MongoDB initialization completed!');
print('📋 Collections created: users, videos, comments, analytics');
print('🔍 Indexes created for optimal performance');
print('👤 Admin user: admin@watchhere.com / admin123');