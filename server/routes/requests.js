const express = require('express');
const { protect } = require('../middleware/auth');
const MentorshipRequest = require('../models/MentorshipRequest');
const Notification = require('../models/Notification');

const router = express.Router();

// POST /api/requests
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can send requests.' });
    }
    const { mentorId, message } = req.body;

    // Check for existing active request
    const existing = await MentorshipRequest.findOne({
      studentId: req.user._id,
      mentorId,
      status: { $in: ['pending', 'accepted'] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Request already sent to this mentor.' });
    }

    const request = await MentorshipRequest.create({
      studentId: req.user._id,
      mentorId,
      message: message || '',
    });

    // Notify mentor
    await Notification.create({
      userId: mentorId,
      type: 'request_received',
      message: `${req.user.name} sent you a mentorship request.`,
      link: '/mentor/requests',
    });

    res.status(201).json({ success: true, message: 'Request sent successfully.', request });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to send request.' });
  }
});

// GET /api/requests — get requests for current user
router.get('/', protect, async (req, res) => {
  try {
    const filter =
      req.user.role === 'student'
        ? { studentId: req.user._id }
        : { mentorId: req.user._id };

    const requests = await MentorshipRequest.find(filter)
      .populate('studentId', 'name email profilePhoto bio skills careerGoal education')
      .populate('mentorId', 'name email profilePhoto bio expertise experience rating')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load requests.' });
  }
});

// PUT /api/requests/:id/accept
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    request.status = 'accepted';
    await request.save();

    await Notification.create({
      userId: request.studentId,
      type: 'request_accepted',
      message: `${req.user.name} accepted your mentorship request! You can now book a session.`,
      link: '/student/sessions',
    });

    res.json({ success: true, message: 'Request accepted.', request });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to accept request.' });
  }
});

// PUT /api/requests/:id/reject
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    request.status = 'rejected';
    await request.save();

    await Notification.create({
      userId: request.studentId,
      type: 'request_rejected',
      message: `Your mentorship request was not accepted this time.`,
      link: '/student/mentors',
    });

    res.json({ success: true, message: 'Request rejected.', request });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to reject request.' });
  }
});

// PUT /api/requests/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled.' });
    }
    request.status = 'cancelled';
    await request.save();

    res.json({ success: true, message: 'Request cancelled.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to cancel request.' });
  }
});

module.exports = router;
