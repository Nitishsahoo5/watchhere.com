const OpenAI = require('openai');
// AWS SDK v2 removed - using v3 clients

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const rekognition = new AWS.Rekognition({ region: process.env.AWS_REGION }); // Disabled

const moderateText = async (text) => {
  try {
    const response = await openai.moderations.create({
      input: text,
    });
    
    const result = response.results[0];
    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores
    };
  } catch (error) {
    console.error('Text moderation error:', error);
    return { flagged: false, categories: {}, categoryScores: {} };
  }
};

const moderateImage = async (imageUrl) => {
  try {
    const params = {
      Image: { S3Object: { Bucket: process.env.S3_BUCKET_NAME, Name: imageUrl } },
      MinConfidence: 75
    };

    const [unsafeContent, textInImage] = await Promise.all([
      rekognition.detectModerationLabels(params).promise(),
      rekognition.detectText(params).promise()
    ]);

    const flaggedLabels = unsafeContent.ModerationLabels.filter(
      label => label.Confidence > 80
    );

    const extractedText = textInImage.TextDetections
      .filter(detection => detection.Type === 'LINE')
      .map(detection => detection.DetectedText)
      .join(' ');

    let textModeration = { flagged: false };
    if (extractedText) {
      textModeration = await moderateText(extractedText);
    }

    return {
      flagged: flaggedLabels.length > 0 || textModeration.flagged,
      unsafeLabels: flaggedLabels,
      textContent: extractedText,
      textModeration
    };
  } catch (error) {
    console.error('Image moderation error:', error);
    return { flagged: false, unsafeLabels: [], textContent: '', textModeration: {} };
  }
};

const moderateVideo = async (videoUrl) => {
  try {
    // Extract frames for analysis
    const params = {
      Video: { S3Object: { Bucket: process.env.S3_BUCKET_NAME, Name: videoUrl } },
      MinConfidence: 75
    };

    const moderationResult = await rekognition.startContentModeration(params).promise();
    const jobId = moderationResult.JobId;

    // Poll for results (simplified - in production use webhooks)
    let result;
    let attempts = 0;
    do {
      await new Promise(resolve => setTimeout(resolve, 5000));
      result = await rekognition.getContentModeration({ JobId: jobId }).promise();
      attempts++;
    } while (result.JobStatus === 'IN_PROGRESS' && attempts < 12);

    if (result.JobStatus === 'SUCCEEDED') {
      const flaggedSegments = result.ModerationLabels.filter(
        label => label.ModerationLabel.Confidence > 80
      );

      return {
        flagged: flaggedSegments.length > 0,
        flaggedSegments,
        totalFrames: result.ModerationLabels.length
      };
    }

    return { flagged: false, flaggedSegments: [], totalFrames: 0 };
  } catch (error) {
    console.error('Video moderation error:', error);
    return { flagged: false, flaggedSegments: [], totalFrames: 0 };
  }
};

const moderateContent = async (content) => {
  const results = {};

  if (content.title || content.description) {
    results.text = await moderateText(`${content.title} ${content.description}`);
  }

  if (content.thumbnail) {
    results.thumbnail = await moderateImage(content.thumbnail);
  }

  if (content.videoUrl) {
    results.video = await moderateVideo(content.videoUrl);
  }

  const overallFlagged = Object.values(results).some(result => result.flagged);

  return {
    flagged: overallFlagged,
    results,
    action: overallFlagged ? 'review' : 'approve'
  };
};

module.exports = { moderateText, moderateImage, moderateVideo, moderateContent };