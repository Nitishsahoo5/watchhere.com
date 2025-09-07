const Comment = require('../models/Comment');
const Joi = require('joi');

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ video: req.params.videoId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const schema = Joi.object({
      text: Joi.string().min(1).max(500).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const comment = new Comment({
      text: req.body.text,
      user: req.user._id,
      video: req.params.videoId
    });

    await comment.save();
    await comment.populate('user', 'username avatar');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getComments, addComment };