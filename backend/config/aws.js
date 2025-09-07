// Use the new S3 configuration
const { s3Client, createMultipartUpload } = require('./s3');

module.exports = { s3Client, createMultipartUpload };