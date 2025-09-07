const express = require('express');
const multer = require('multer');
const { processVoiceSearch, generateVoiceResponse } = require('../services/voiceSearchService');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|webm|ogg/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only audio files allowed for voice search'));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Voice search endpoint
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    const searchResults = await processVoiceSearch(req.file.buffer);
    const voiceResponse = await generateVoiceResponse(searchResults);

    res.json({
      ...searchResults,
      voiceResponse,
      success: true
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      success: false 
    });
  }
});

// Text-to-speech for responses (optional)
router.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text required' });
    }

    // This would integrate with a TTS service
    // For now, return the text
    res.json({ 
      text,
      audioUrl: null, // Would contain generated audio URL
      message: 'Text-to-speech not implemented yet'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;