import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import { sendVerificationEmail, generateOtp, OTP_EXPIRE_MS, RESEND_COOLDOWN_MS } from '../utils/email.js';

export const getRateLimitStatus = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() })
      .select('+lastVerificationEmailSentAt');
    let resendCooldownRemaining = 0;
    if (user?.lastVerificationEmailSentAt) {
      const elapsed = Date.now() - user.lastVerificationEmailSentAt.getTime();
      resendCooldownRemaining = Math.max(0, Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000));
    }

    res.status(200).json({
      success: true,
      data: {
        isLocked: false,
        remaining: 5,
        lockTimeRemaining: 0,
        resendCooldownRemaining,
        canResend: resendCooldownRemaining <= 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get status.' });
  }
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

function toFrontendUser(user) {
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.password;
  delete u.emailVerificationCode;
  delete u.emailVerificationExpiresAt;
  delete u.lastVerificationEmailSentAt;
  return {
    ...u,
    profileImg: u.avatar || u.profileImg || null,
    name: { firstName: u.firstName || '', lastName: u.lastName || '' },
    isVerified: !!u.isEmailVerified,
  };
}

export const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'student' } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, firstName, and lastName.',
      });
    }

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be "student" or "teacher".',
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
      role,
    });

    if (role === 'teacher') {
      await Teacher.create({ user: user._id });
    }

    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: role === 'teacher' ? 'Teacher account created.' : 'Account created.',
      token,
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Signup failed.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is disabled.' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    userObj.profileImg = userObj.avatar || null;
    res.status(200).json({
      data: {
        accessToken: token,
        refreshToken: token,
        user: userObj,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Login failed.' });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ data: { message: 'Logged out.' } });
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code || String(code).length !== 6) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit code are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+emailVerificationCode +emailVerificationExpiresAt');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or code.' });
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpiresAt) {
      return res.status(410).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (new Date() > user.emailVerificationExpiresAt) {
      await User.findByIdAndUpdate(user._id, {
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
      });
      return res.status(410).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (user.emailVerificationCode !== String(code).trim()) {
      return res.status(401).json({ success: false, message: 'Invalid verification code.' });
    }

    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpiresAt: null,
    });

    const updated = await User.findById(user._id);
    const token = signToken(updated._id);
    const userObj = toFrontendUser(updated);

    res.status(200).json({
      data: {
        user: userObj,
        accessToken: token,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Verification failed.' });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+lastVerificationEmailSentAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email.' });
    }

    const now = Date.now();
    const lastSent = user.lastVerificationEmailSentAt ? user.lastVerificationEmailSentAt.getTime() : 0;
    const remaining = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSent)) / 1000);

    if (remaining > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${remaining} seconds before requesting a new code.`,
        data: { isResendCooldown: true, remainingTime: remaining, resendCooldownRemaining: remaining },
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MS);
    await User.findByIdAndUpdate(user._id, {
      emailVerificationCode: otp,
      emailVerificationExpiresAt: expiresAt,
      lastVerificationEmailSentAt: new Date(),
    });

    try {
      await sendVerificationEmail(user.email, otp);
    } catch (emailErr) {
      console.error('[Resend] Email send failed:', emailErr.message);
      console.log('[Resend] Verification code for', user.email, ':', otp);
    }

    res.status(200).json({
      data: { resendCooldownRemaining: 30 },
    });
  } catch (err) {
    console.error('[Resend] Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to resend code.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id });
      return res.status(200).json({ success: true, user, teacherProfile: teacher || null });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to get profile.' });
  }
};
