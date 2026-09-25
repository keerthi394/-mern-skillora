const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate active requests
mentorshipRequestSchema.index(
  { studentId: 1, mentorId: 1, status: 1 },
  { unique: false }
);

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
