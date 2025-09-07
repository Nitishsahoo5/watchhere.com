const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('../config/s3');

const cloudfront = new CloudFrontClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generateSignedUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn });
};

const getCDNUrl = (key) => {
  const cloudFrontUrl = process.env.CLOUDFRONT_URL;
  return `${cloudFrontUrl}/${key}`;
};

const invalidateCDNCache = async (paths) => {
  try {
    const command = new CreateInvalidationCommand({
      DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: paths.length,
          Items: paths
        }
      }
    });

    const result = await cloudfront.send(command);
    return result.Invalidation.Id;
  } catch (error) {
    console.error('CDN invalidation error:', error);
    throw error;
  }
};

const optimizeVideoDelivery = (videoKey) => {
  // Generate multiple quality URLs for adaptive streaming
  const baseUrl = getCDNUrl(videoKey);
  
  return {
    original: baseUrl,
    hd: baseUrl.replace('.mp4', '_720p.mp4'),
    sd: baseUrl.replace('.mp4', '_480p.mp4'),
    mobile: baseUrl.replace('.mp4', '_360p.mp4'),
    thumbnail: baseUrl.replace('.mp4', '_thumb.jpg')
  };
};

const getOptimizedImageUrl = (imageKey, width, height, quality = 80) => {
  // CloudFront with Lambda@Edge for image optimization
  const baseUrl = getCDNUrl(imageKey);
  return `${baseUrl}?w=${width}&h=${height}&q=${quality}`;
};

module.exports = {
  generateSignedUrl,
  getCDNUrl,
  invalidateCDNCache,
  optimizeVideoDelivery,
  getOptimizedImageUrl
};