import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';

export const createLecture = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only add lectures to your own course.' });
    }

    const body = req.body || {};
    const lectureTitle = body.lectureTitle || body.title;
    if (!lectureTitle) {
      return res.status(400).json({ success: false, message: 'Lecture title is required.' });
    }

    const maxOrder = await Lecture.findOne({ courseId }).sort({ order: -1 }).select('order').lean();
    const order = (maxOrder?.order ?? -1) + 1;

    const lecture = await Lecture.create({
      lectureTitle,
      instruction: body.instruction ?? '',
      videoUrl: body.videoUrl ?? null,
      videoResolutions: body.videoResolutions ?? [],
      hlsUrl: body.hlsUrl ?? null,
      audioUrl: body.audioUrl ?? null,
      articleContent: body.articleContent ?? null,
      pdfUrl: body.pdfUrl ?? null,
      duration: body.duration ?? 0,
      isPreviewFree: !!body.isPreviewFree,
      courseId,
      order,
      thumbnailUrl: body.thumbnailUrl ?? null,
    });

    res.status(201).json({
      success: true,
      data: lecture.toObject ? lecture.toObject() : lecture,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create lecture.',
    });
  }
};

export const getLecturesByCourseId = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId).select('creator enrolledStudents').lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    const isCreator = course.creator.toString() === req.user._id.toString();
    const isEnrolled = (course.enrolledStudents || []).some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (!isCreator && !isEnrolled) {
      return res.status(403).json({ success: false, message: 'You do not have access to this course lectures.' });
    }

    const lectures = await Lecture.find({ courseId }).sort({ order: 1 }).lean();
    res.json({ success: true, data: lectures });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch lectures.',
    });
  }
};

export const getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).lean();
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found.' });
    }
    const course = await Course.findById(lecture.courseId).select('creator enrolledStudents').lean();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    const isCreator = course.creator.toString() === req.user._id.toString();
    const isEnrolled = (course.enrolledStudents || []).some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (!isCreator && !isEnrolled) {
      return res.status(403).json({ success: false, message: 'You do not have access to this lecture.' });
    }

    res.json({ success: true, data: lecture });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch lecture.',
    });
  }
};

export const updateLectureOrder = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only reorder lectures in your own course.' });
    }

    const { lectures: orderUpdates } = req.body || {};
    if (!Array.isArray(orderUpdates)) {
      return res.status(400).json({ success: false, message: 'Body must include lectures array with { lectureId, order }.' });
    }

    for (const item of orderUpdates) {
      if (item.lectureId && typeof item.order === 'number') {
        await Lecture.updateOne(
          { _id: item.lectureId, courseId },
          { $set: { order: item.order } }
        );
      }
    }

    const updated = await Lecture.find({ courseId }).sort({ order: 1 }).lean();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update order.',
    });
  }
};

export const updateLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update lectures in your own course.' });
    }

    const lecture = await Lecture.findOne({ _id: lectureId, courseId });
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found.' });
    }

    const body = req.body || {};
    const allowed = [
      'lectureTitle', 'instruction', 'videoUrl', 'videoResolutions', 'hlsUrl',
      'audioUrl', 'articleContent', 'pdfUrl', 'duration', 'isPreviewFree', 'thumbnailUrl',
    ];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        lecture[key] = body[key];
      }
    }
    await lecture.save();

    res.json({
      success: true,
      data: lecture.toObject ? lecture.toObject() : lecture,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update lecture.',
    });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete lectures from your own course.' });
    }

    const lecture = await Lecture.findOne({ _id: lectureId, courseId });
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found.' });
    }
    await lecture.deleteOne();

    const remaining = await Lecture.find({ courseId }).sort({ order: 1 });
    await Promise.all(
      remaining.map((lec, i) => lec.updateOne({ $set: { order: i } }))
    );

    res.json({ success: true, data: { message: 'Lecture deleted.' } });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete lecture.',
    });
  }
};
