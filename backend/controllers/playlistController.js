const Playlist = require('../models/Playlist');

const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    const playlist = new Playlist({
      name,
      description,
      owner: req.user._id,
      isPublic: isPublic !== false
    });
    
    await playlist.save();
    await playlist.populate('owner', 'username avatar');
    
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate('videos', 'title thumbnail duration')
      .sort({ createdAt: -1 });
    
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addToPlaylist = async (req, res) => {
  try {
    const { videoId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist || !playlist.owner.equals(req.user._id)) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    if (!playlist.videos.includes(videoId)) {
      playlist.videos.push(videoId);
      await playlist.save();
    }
    
    res.json({ message: 'Video added to playlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFromPlaylist = async (req, res) => {
  try {
    const { videoId } = req.params;
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist || !playlist.owner.equals(req.user._id)) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    playlist.videos = playlist.videos.filter(id => !id.equals(videoId));
    await playlist.save();
    
    res.json({ message: 'Video removed from playlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPlaylist, getUserPlaylists, addToPlaylist, removeFromPlaylist };