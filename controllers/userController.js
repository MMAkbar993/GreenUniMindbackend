import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

const parseSignupBody = (req) => {
  if (req.body.data) {
    try {
      return typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } catch (e) {
      return null;
    }
  }
  return req.body;
};

const createStudent = async (req, res) => {
  try {
    const body = parseSignupBody(req);
    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing request data. Send JSON with { password, student: { name: { firstName, lastName }, email, gender? } }.',
      });
    }
    const payload = body?.student || body;
    const { name, email, password, gender } = payload;
    const pass = password || body?.password;

    if (!name?.firstName || !name?.lastName || !email || !pass) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email and password are required.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name: {
        firstName: name.firstName,
        middleName: name.middleName || '',
        lastName: name.lastName,
      },
      email: email.toLowerCase(),
      password: pass,
      role: 'student',
      gender: gender || undefined,
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: userObj._id,
          name: userObj.name,
          email: userObj.email,
          role: userObj.role,
          profileImg: userObj.profileImg,
          gender: userObj.gender,
          isEmailVerified: userObj.isEmailVerified,
          createdAt: userObj.createdAt,
          updatedAt: userObj.updatedAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Registration failed.',
    });
  }
};

const createTeacher = async (req, res) => {
  try {
    const body = parseSignupBody(req);
    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing request data. Send JSON with { password, teacher: { name: { firstName, lastName }, email, gender? } }.',
      });
    }
    const payload = body?.teacher || body;
    const { name, email, password, gender } = payload;
    const pass = password || body?.password;

    if (!name?.firstName || !name?.lastName || !email || !pass) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email and password are required.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name: {
        firstName: name.firstName,
        middleName: name.middleName || '',
        lastName: name.lastName,
      },
      email: email.toLowerCase(),
      password: pass,
      role: 'teacher',
      gender: gender || undefined,
    });

    await Teacher.create({ user: user._id });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: userObj._id,
          name: userObj.name,
          email: userObj.email,
          role: userObj.role,
          profileImg: userObj.profileImg,
          gender: userObj.gender,
          isEmailVerified: userObj.isEmailVerified,
          createdAt: userObj.createdAt,
          updatedAt: userObj.updatedAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Registration failed.',
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImg: user.profileImg,
        gender: user.gender,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to get user.',
    });
  }
};

export { createStudent, createTeacher, getMe };
