const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'mentor'],
      required: [true, 'Role is required'],
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // ─── Profile fields ──────────────────────────────────────────────
    profilePhoto: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    education: { type: String, default: '' },
    location: { type: String, default: '' },

    // Student fields
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    careerGoal: { type: String, default: '' },

    // Mentor fields
    expertise: [{ type: String, trim: true }],
    experience: { type: String, default: '' },
    sessionDuration: { type: Number, default: 60 }, // minutes
    availability: [{ type: String, trim: true }], // e.g. ["Monday 9-11am", "Wednesday 2-4pm"]
    hourlyRate: { type: Number, default: 0 },
    linkedIn: { type: String, default: '' },
    website: { type: String, default: '' },

    // Rating (calculated)
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profilePhoto: this.profilePhoto,
    bio: this.bio,
    education: this.education,
    location: this.location,
    skills: this.skills,
    interests: this.interests,
    careerGoal: this.careerGoal,
    expertise: this.expertise,
    experience: this.experience,
    sessionDuration: this.sessionDuration,
    availability: this.availability,
    hourlyRate: this.hourlyRate,
    linkedIn: this.linkedIn,
    website: this.website,
    rating: this.rating,
    ratingCount: this.ratingCount,
    totalSessions: this.totalSessions,
    createdAt: this.createdAt,
  };
};

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
