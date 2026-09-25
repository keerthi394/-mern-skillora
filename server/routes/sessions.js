const express = require('express');
const { protect } = require('../middleware/auth');
const Session = require('../models/Session');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// POST /api/sessions
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can book sessions.' });
    }
    const { mentorId, date, time, duration, notes, topic, requestId } = req.body;

    // Prevent double booking — same mentor, same date+time
    const conflict = await Session.findOne({
      mentorId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked. Please choose another.' });
    }

    const session = await Session.create({
      studentId: req.user._id,
      mentorId,
      date,
      time,
      duration: duration || 60,
      notes: notes || '',
      topic: topic || '',
      requestId: requestId || null,
    });

    await Notification.create({
      userId: mentorId,
      type: 'session_booked',
      message: `${req.user.name} booked a session with you on ${date} at ${time}.`,
      link: '/mentor/sessions',
    });

    res.status(201).json({ success: true, message: 'Session booked successfully.', session });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to book session.' });
  }
});

// GET /api/sessions
router.get('/', protect, async (req, res) => {
  try {
    const filter =
      req.user.role === 'student'
        ? { studentId: req.user._id }
        : { mentorId: req.user._id };

    const sessions = await Session.find(filter)
      .populate('studentId', 'name email profilePhoto')
      .populate('mentorId', 'name email profilePhoto expertise rating')
      .sort({ date: 1, time: 1 });

    res.json({ success: true, sessions });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load sessions.' });
  }
});

// PUT /api/sessions/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    const isParty =
      session.studentId.toString() === req.user._id.toString() ||
      session.mentorId.toString() === req.user._id.toString();
    if (!isParty) return res.status(403).json({ success: false, message: 'Not authorized.' });

    const { status, notes } = req.body;
    if (status) session.status = status;
    if (notes !== undefined) session.notes = notes;
    await session.save();

    // If completed, increment mentor totalSessions
    if (status === 'completed') {
      await User.findByIdAndUpdate(session.mentorId, { $inc: { totalSessions: 1 } });

      const notifyUserId =
        req.user._id.toString() === session.mentorId.toString()
          ? session.studentId
          : session.mentorId;

      await Notification.create({
        userId: notifyUserId,
        type: 'session_updated',
        message: `Session on ${session.date} has been marked as completed.`,
        link: req.user.role === 'mentor' ? '/student/sessions' : '/mentor/sessions',
      });
    }

    res.json({ success: true, message: 'Session updated.', session });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update session.' });
  }
});

// DELETE /api/sessions/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await session.deleteOne();
    res.json({ success: true, message: 'Session cancelled.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to cancel session.' });
  }
});

module.exports = router;
