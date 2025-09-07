const sharp = require('sharp');
const { s3Client, Upload } = require('../config/aws');
const path = require('path');
const fs = require('fs');

const THUMBNAIL_SIZES = {
  small: { width: 320, height: 180 },
  medium: { width: 640, height: 360 },
  large: { width: 1280, height: 720 }
};

const AVATAR_SIZES = {
  small: { width: 64, height: 64 },
  medium: { width: 128, height: 128 },
  large: { width: 256, height: 256 }
};

const optimizeImage = async (inputBuffer, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'jpeg',
    fit = 'cover'
  } = options;

  try {
    let pipeline = sharp(inputBuffer);

    if (width || height) {
      pipeline = pipeline.resize(width, height, { fit });
    }

    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, progressive: true });
        break;
      case 'png':
        pipeline = pipeline.png({ quality, progressive: true });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
    }

    return await pipeline.toBuffer();
  } catch (error) {
    console.error('Image optimization error:', error);
    throw error;
  }
};

const generateThumbnails = async (imageBuffer, videoId) => {
  const thumbnails = {};
  
  try {
    for (const [size, dimensions] of Object.entries(THUMBNAIL_SIZES)) {
      const optimizedBuffer = await optimizeImage(imageBuffer, {
        ...dimensions,
        quality: 85,
        format: 'jpeg'
      });

      const key = `thumbnails/${videoId}_${size}.jpg`;
      
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: optimizedBuffer,
          ContentType: 'image/jpeg',
          CacheControl: 'max-age=31536000'
        }
      });

      await upload.done();
      thumbnails[size] = `${process.env.CLOUDFRONT_URL}/${key}`;
    }

    return thumbnails;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw error;
  }
};

const generateAvatars = async (imageBuffer, userId) => {
  const avatars = {};
  
  try {
    for (const [size, dimensions] of Object.entries(AVATAR_SIZES)) {
      const optimizedBuffer = await optimizeImage(imageBuffer, {
        ...dimensions,
        quality: 90,
        format: 'jpeg',
        fit: 'cover'
      });

      const key = `avatars/${userId}_${size}.jpg`;
      
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: optimizedBuffer,
          ContentType: 'image/jpeg',
          CacheControl: 'max-age=31536000'
        }
      });

      await upload.done();
      avatars[size] = `${process.env.CLOUDFRONT_URL}/${key}`;
    }

    return avatars;
  } catch (error) {
    console.error('Avatar generation error:', error);
    throw error;
  }
};

const optimizeAndUpload = async (inputPath, outputKey, options = {}) => {
  try {
    const inputBuffer = fs.readFileSync(inputPath);
    const optimizedBuffer = await optimizeImage(inputBuffer, options);
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: outputKey,
        Body: optimizedBuffer,
        ContentType: `image/${options.format || 'jpeg'}`,
        CacheControl: 'max-age=31536000'
      }
    });

    await upload.done();
    return `${process.env.CLOUDFRONT_URL}/${outputKey}`;
  } catch (error) {
    console.error('Upload optimization error:', error);
    throw error;
  }
};

const generateWebPVariants = async (imageBuffer, baseKey) => {
  try {
    const webpBuffer = await optimizeImage(imageBuffer, {
      format: 'webp',
      quality: 80
    });

    const webpKey = baseKey.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: webpKey,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'max-age=31536000'
      }
    });

    await upload.done();
    return `${process.env.CLOUDFRONT_URL}/${webpKey}`;
  } catch (error) {
    console.error('WebP generation error:', error);
    return null;
  }
};

module.exports = {
  optimizeImage,
  generateThumbnails,
  generateAvatars,
  optimizeAndUpload,
  generateWebPVariants
};