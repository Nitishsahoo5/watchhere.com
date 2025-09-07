const OpenAI = require('openai');
const Video = require('../models/Video');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transcribeVoiceQuery = async (audioBuffer) => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-1',
      language: 'en'
    });
    
    return transcription.text;
  } catch (error) {
    throw new Error('Voice transcription failed: ' + error.message);
  }
};

const parseSearchIntent = async (query) => {
  try {
    const prompt = `Parse this search query and extract search parameters as JSON:
    Query: "${query}"
    
    Extract:
    - searchTerms: main keywords to search for
    - category: if mentioned (Technology, Gaming, Music, Education, etc.)
    - duration: if mentioned (short, medium, long, or specific minutes)
    - sortBy: if mentioned (newest, popular, trending)
    - filters: any other filters mentioned
    
    Return as JSON object.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    // Fallback to simple text search
    return {
      searchTerms: query,
      category: null,
      duration: null,
      sortBy: 'relevance',
      filters: {}
    };
  }
};

const searchVideos = async (searchParams) => {
  try {
    let query = {};
    let sort = {};

    // Text search
    if (searchParams.searchTerms) {
      query.$text = { $search: searchParams.searchTerms };
    }

    // Category filter
    if (searchParams.category) {
      query.category = new RegExp(searchParams.category, 'i');
    }

    // Duration filter
    if (searchParams.duration) {
      switch (searchParams.duration.toLowerCase()) {
        case 'short':
          query.duration = { $lt: 300 }; // < 5 minutes
          break;
        case 'medium':
          query.duration = { $gte: 300, $lt: 1200 }; // 5-20 minutes
          break;
        case 'long':
          query.duration = { $gte: 1200 }; // > 20 minutes
          break;
      }
    }

    // Sorting
    switch (searchParams.sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'popular':
        sort = { views: -1 };
        break;
      case 'trending':
        sort = { views: -1, createdAt: -1 };
        break;
      default:
        sort = searchParams.searchTerms ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
    }

    const videos = await Video.find(query)
      .populate('uploader', 'username avatar')
      .sort(sort)
      .limit(20);

    return videos;
  } catch (error) {
    console.error('Video search error:', error);
    return [];
  }
};

const processVoiceSearch = async (audioBuffer) => {
  try {
    // Step 1: Transcribe voice to text
    const query = await transcribeVoiceQuery(audioBuffer);
    
    // Step 2: Parse search intent
    const searchParams = await parseSearchIntent(query);
    
    // Step 3: Search videos
    const results = await searchVideos(searchParams);
    
    return {
      originalQuery: query,
      searchParams,
      results,
      resultCount: results.length
    };
  } catch (error) {
    throw new Error('Voice search processing failed: ' + error.message);
  }
};

const generateVoiceResponse = async (searchResults) => {
  try {
    const { originalQuery, results, resultCount } = searchResults;
    
    if (resultCount === 0) {
      return `I couldn't find any videos matching "${originalQuery}". Try a different search term.`;
    }

    const topResult = results[0];
    let response = `I found ${resultCount} videos for "${originalQuery}". `;
    
    if (resultCount === 1) {
      response += `Here's the video: "${topResult.title}" by ${topResult.uploader.username}.`;
    } else {
      response += `The top result is "${topResult.title}" by ${topResult.uploader.username}. `;
      response += `Other results include videos about ${results.slice(1, 3).map(v => v.title).join(', ')}.`;
    }

    return response;
  } catch (error) {
    return "I found some videos for your search. Check the results below.";
  }
};

module.exports = { 
  transcribeVoiceQuery, 
  parseSearchIntent, 
  searchVideos, 
  processVoiceSearch, 
  generateVoiceResponse 
};