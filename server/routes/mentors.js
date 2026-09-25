const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const MentorshipRequest = require('../models/MentorshipRequest');

const router = express.Router();

// GET /api/mentors — list mentors with search/filter
router.get('/', protect, async (req, res) => {
  try {
    const { search, skill, minRating, availability } = req.query;
    const filter = { role: 'mentor', isActive: true };

    if (skill) {
      filter.expertise = { $in: [new RegExp(skill, 'i')] };
    }
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }
    if (availability) {
      filter.availability = { $in: [new RegExp(availability, 'i')] };
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { expertise: { $in: [new RegExp(search, 'i')] } },
        { bio: new RegExp(search, 'i') },
      ];
    }

    const mentors = await User.find(filter).select('-password');
    res.json({ success: true, mentors });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Unable to load mentors. Please try again.' });
  }
});

// GET /api/mentors/recommended — matching algorithm
router.get('/recommended', protect, async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const mentors = await User.find({ role: 'mentor', isActive: true }).select('-password');

    const studentSkills = (student.skills || []).map((s) => s.toLowerCase());
    const studentGoal = (student.careerGoal || '').toLowerCase();

    const scored = mentors.map((mentor) => {
      const mentorExpertise = (mentor.expertise || []).map((e) => e.toLowerCase());

      // 1. Skill overlap (0-1)
      const overlap = studentSkills.filter((s) => mentorExpertise.includes(s)).length;
      const maxOverlap = Math.max(studentSkills.length, mentorExpertise.length, 1);
      const skillOverlap = overlap / maxOverlap;

      // 2. Goal relevance (0-1): check if student goal keywords appear in mentor expertise/bio
      const goalWords = studentGoal.split(/\s+/).filter(Boolean);
      const mentorText = [...mentorExpertise, (mentor.bio || '').toLowerCase()].join(' ');
      const goalHits = goalWords.filter((w) => w.length > 3 && mentorText.includes(w)).length;
      const goalRelevance = goalWords.length ? Math.min(goalHits / goalWords.length, 1) : 0;

      // 3. Availability match (0-1): simple — has slots?
      const availabilityMatch = (mentor.availability || []).length > 0 ? 1 : 0;

      // 4. Mentor rating (0-1)
      const normalizedRating = (mentor.rating || 0) / 5;

      // Weighted score
      const score =
        skillOverlap * 0.4 +
        goalRelevance * 0.3 +
        availabilityMatch * 0.2 +
        normalizedRating * 0.1;

      return { mentor: mentor.toSafeObject(), score: Math.round(score * 100) };
    });

    scored.sort((a, b) => b.score - a.score);

    res.json({ success: true, recommended: scored.slice(0, 10) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Unable to load recommendations.' });
  }
});

// GET /api/mentors/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const mentor = await User.findOne({ _id: req.params.id, role: 'mentor' }).select('-password');
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found.' });
    res.json({ success: true, mentor: mentor.toSafeObject() });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
