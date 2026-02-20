import mongoose from 'mongoose';

// Progress for a single lesson (which content items completed)
const lessonProgressSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    completedContentIds: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    completedLessons: {
      type: [lessonProgressSchema],
      default: [],
    },
    completedLessonCount: {
      type: Number,
      default: 0,
    },
    totalLessonCount: {
      type: Number,
      default: 0,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

progressSchema.index({ user: 1, course: 1 }, { unique: true });
progressSchema.index({ user: 1 });
progressSchema.index({ course: 1 });

export default mongoose.model('Progress', progressSchema);
