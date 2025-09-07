const LiveStream = require('../models/LiveStream');
const crypto = require('crypto');

const createStream = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const streamKey = crypto.randomBytes(32).toString('hex');
    
    const stream = new LiveStream({
      title,
      description,
      category,
      streamer: req.user._id,
      streamKey
    });
    
    await stream.save();
    await stream.populate('streamer', 'username avatar');
    
    res.status(201).json(stream);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getLiveStreams = async (req, res) => {
  try {
    const streams = await LiveStream.find({ isLive: true })
      .populate('streamer', 'username avatar')
      .sort({ viewerCount: -1 });
    
    res.json(streams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const joinStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream || !stream.isLive) {
      return res.status(404).json({ message: 'Stream not found or offline' });
    }
    
    if (!stream.viewers.includes(req.user._id)) {
      stream.viewers.push(req.user._id);
      stream.viewerCount = stream.viewers.length;
      await stream.save();
    }
    
    res.json({ message: 'Joined stream', viewerCount: stream.viewerCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const leaveStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) {
      return res.status(404).json({ message: 'Stream not found' });
    }
    
    stream.viewers = stream.viewers.filter(id => !id.equals(req.user._id));
    stream.viewerCount = stream.viewers.length;
    await stream.save();
    
    res.json({ message: 'Left stream', viewerCount: stream.viewerCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createStream, getLiveStreams, joinStream, leaveStream };