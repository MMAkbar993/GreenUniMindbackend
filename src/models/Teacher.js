import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    bio: {
      type: String,
      default: '',
    },
    expertise: {
      type: [String],
      default: [],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalCourses: {
      type: Number,
      default: 0,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    socialLinks: {
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
      website: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model('Teacher', teacherSchema);
