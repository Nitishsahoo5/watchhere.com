const { s3Client, Upload } = require('../config/aws');
const fs = require('fs');
const path = require('path');

const uploadVideoToS3 = async (filePath, videoId) => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const fileStats = fs.statSync(filePath);
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `videos/${videoId}.mp4`,
        Body: fileStream,
        ContentType: 'video/mp4',
        CacheControl: 'max-age=31536000',
        Metadata: {
          originalName: path.basename(filePath),
          uploadDate: new Date().toISOString()
        }
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5, // 5MB parts
      leavePartsOnError: false
    });

    // Track upload progress
    upload.on('httpUploadProgress', (progress) => {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      console.log(`Upload progress: ${percentage}%`);
    });

    const result = await upload.done();
    return `${process.env.CLOUDFRONT_URL}/videos/${videoId}.mp4`;
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
};

module.exports = { uploadVideoToS3 };