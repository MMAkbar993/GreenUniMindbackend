import Course from '../models/Course.js';

export const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('teacher', 'title rating totalStudents totalCourses')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      data: courses,
      meta: {
        total: courses.length,
      },
    });
  } catch (err) {
    console.error('[Courses] getPublishedCourses error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to load courses.' });
  }
};
