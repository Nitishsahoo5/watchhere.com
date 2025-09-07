const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// Configure S3 Client with v3 SDK
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Optional: Configure additional settings
  maxAttempts: 3,
  retryMode: 'adaptive',
});

// Helper function for multipart uploads (large files)
const createMultipartUpload = (params) => {
  return new Upload({
    client: s3Client,
    params,
    // Optional: Configure part size and concurrency
    partSize: 1024 * 1024 * 5, // 5MB parts
    queueSize: 4, // 4 concurrent uploads
  });
};

module.exports = {
  s3Client,
  createMultipartUpload,
};