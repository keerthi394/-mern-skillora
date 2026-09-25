const express = require('express');
const { protect } = require('../middleware/auth');
const Rating = require('../models/Rating');
const Session = require('../models/Session');
const User = require('../models/User');

const router = express.Router();

// POST /api/ratings
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can rate mentors.' });
    }
    const { mentorId, sessionId, rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    // Check session exists and is completed
    const session = await Session.findById(sessionId);
    if (!session || session.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed sessions.' });
    }
    if (session.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Check not already rated
    const existing = await Rating.findOne({ sessionId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already rated this session.' });
    }

    const ratingDoc = await Rating.create({
      studentId: req.user._id,
      mentorId,
      sessionId,
      rating,
      review: review || '',
    });

    // Recalculate mentor average rating
    const allRatings = await Rating.find({ mentorId });
    const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    await User.findByIdAndUpdate(mentorId, {
      rating: Math.round(avg * 10) / 10,
      ratingCount: allRatings.length,
    });

    res.status(201).json({ success: true, message: 'Rating submitted successfully.', rating: ratingDoc });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to submit rating.' });
  }
});

// GET /api/ratings/mentor/:mentorId
router.get('/mentor/:mentorId', protect, async (req, res) => {
  try {
    const ratings = await Rating.find({ mentorId: req.params.mentorId })
      .populate('studentId', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json({ success: true, ratings });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load ratings.' });
  }
});

module.exports = router;
