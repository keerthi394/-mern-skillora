const express = require('express');
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const MentorshipRequest = require('../models/MentorshipRequest');

const router = express.Router();

// GET /api/messages/conversations — list all conversations for current user
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Find all messages involving this user, get unique conversations
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name profilePhoto role')
      .populate('receiverId', 'name profilePhoto role');

    // Build conversation list with last message
    const convoMap = new Map();
    for (const msg of messages) {
      const cid = msg.conversationId;
      if (!convoMap.has(cid)) {
        const other =
          msg.senderId._id.toString() === userId ? msg.receiverId : msg.senderId;
        convoMap.set(cid, {
          conversationId: cid,
          other,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unread: !msg.read && msg.receiverId._id.toString() === userId ? 1 : 0,
        });
      }
    }

    res.json({ success: true, conversations: Array.from(convoMap.values()) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load conversations.' });
  }
});

// GET /api/messages/:conversationId
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'name profilePhoto')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { conversationId: req.params.conversationId, receiverId: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load messages.' });
  }
});

// POST /api/messages — send a message
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and message are required.' });
    }

    // Check they have an accepted request
    const accepted = await MentorshipRequest.findOne({
      status: 'accepted',
      $or: [
        { studentId: req.user._id, mentorId: receiverId },
        { studentId: receiverId, mentorId: req.user._id },
      ],
    });
    if (!accepted) {
      return res.status(403).json({
        success: false,
        message: 'You can only message users with an accepted mentorship connection.',
      });
    }

    const conversationId = Message.getConversationId(req.user._id, receiverId);
    const msg = await Message.create({
      conversationId,
      senderId: req.user._id,
      receiverId,
      message: message.trim(),
    });

    const populated = await msg.populate('senderId', 'name profilePhoto');
    res.status(201).json({ success: true, message: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

module.exports = router;
