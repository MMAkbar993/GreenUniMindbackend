import mongoose from 'mongoose';

// Content item inside a lesson (video, audio, or article)
const contentItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['video', 'audio', 'article'],
      required: [true, 'Content type is required'],
    },
    title: {
      type: String,
      required: [true, 'Content title is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Content URL or storage path is required'],
    },
    durationMinutes: {
      type: Number,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

// Lesson: contains one or more content items (videos, audios, articles)
const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
      min: 0,
    },
    content: {
      type: [contentItemSchema],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one content item (video, audio, or article) is required',
      },
    },
  },
  { _id: true, timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher is required'],
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    shortDescription: {
      type: String,
      default: '',
      maxlength: 300,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      trim: true,
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
    totalDurationMinutes: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.index({ teacher: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ createdAt: -1 });

export default mongoose.model('Course', courseSchema);
