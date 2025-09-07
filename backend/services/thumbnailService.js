const ffmpeg = require('fluent-ffmpeg');
const { s3 } = require('../config/aws');
const fs = require('fs');

const generateThumbnail = async (videoPath, videoId) => {
  const thumbPath = `/tmp/${videoId}-thumb.jpg`;
  
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({ timestamps: ['10%'], filename: `${videoId}-thumb.jpg`, folder: '/tmp' })
      .on('end', async () => {
        try {
          const buffer = fs.readFileSync(thumbPath);
          const result = await s3.upload({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `thumbnails/${videoId}.jpg`,
            Body: buffer,
            ContentType: 'image/jpeg'
          }).promise();
          
          fs.unlinkSync(thumbPath);
          resolve(`${process.env.CLOUDFRONT_URL}/thumbnails/${videoId}.jpg`);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
};

module.exports = { generateThumbnail };