import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import { sendVerificationEmail, generateOtp, OTP_EXPIRE_MS } from '../utils/email.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

async function setOtpAndSendEmail(userId, email) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MS);
  await User.findByIdAndUpdate(userId, {
    emailVerificationCode: otp,
    emailVerificationExpiresAt: expiresAt,
    lastVerificationEmailSentAt: new Date(),
  });
  await sendVerificationEmail(email, otp);
  return expiresAt;
}

function parseSignupBody(req) {
  const body = req.body;
  let payload = body;

  if (typeof body?.data === 'string') {
    try {
      payload = JSON.parse(body.data);
    } catch {
      return null;
    }
  }

  const student = payload.student || payload.teacher;
  const role = payload.teacher ? 'teacher' : 'student';
  if (!student?.name || !payload.password) return null;

  return {
    email: student.email,
    password: payload.password,
    firstName: student.name.firstName || '',
    lastName: student.name.lastName || '',
    role,
  };
}

export const createStudent = async (req, res) => {
  try {
    const payload = parseSignupBody(req);
    if (!payload || payload.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Invalid body. Send { data: JSON.stringify({ password, student: { name: { firstName, lastName }, email } }) } or JSON.',
      });
    }

    const { email, password, firstName, lastName } = payload;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and name (firstName, lastName).',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'student',
    });

    const otpExpiresAt = await setOtpAndSendEmail(user._id, user.email);

    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    userObj.profileImg = userObj.avatar || null;

    res.status(201).json({
      data: {
        user: userObj,
        accessToken: token,
        refreshToken: token,
        otpExpiresAt: otpExpiresAt.toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Signup failed.' });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const payload = parseSignupBody(req);
    if (!payload || payload.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Invalid body. Send { data: JSON.stringify({ password, teacher: { name: { firstName, lastName }, email } }) } or JSON.',
      });
    }

    const { email, password, firstName, lastName } = payload;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and name (firstName, lastName).',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'teacher',
    });

    await Teacher.create({ user: user._id });

    const otpExpiresAt = await setOtpAndSendEmail(user._id, user.email);

    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    userObj.profileImg = userObj.avatar || null;

    res.status(201).json({
      data: {
        user: userObj,
        accessToken: token,
        refreshToken: token,
        otpExpiresAt: otpExpiresAt.toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Signup failed.' });
  }
};

export const getMeUser = async (req, res) => {
  try {
    const user = req.user;
    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj.profileImg = userObj.avatar || userObj.profileImg || null;
    userObj.name = { firstName: userObj.firstName || '', lastName: userObj.lastName || '' };
    userObj.isVerified = !!userObj.isEmailVerified;

    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id });
      return res.status(200).json({
        data: {
          ...userObj,
          teacherProfile: teacher || null,
        },
      });
    }
    res.status(200).json({ data: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get profile.' });
  }
};
