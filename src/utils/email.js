import nodemailer from 'nodemailer';

const RESEND_COOLDOWN_SEC = 30;
const OTP_EXPIRE_MIN = 10;

export const RESEND_COOLDOWN_MS = RESEND_COOLDOWN_SEC * 1000;
export const OTP_EXPIRE_MS = OTP_EXPIRE_MIN * 60 * 1000;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendVerificationEmail(toEmail, code) {
  const transporter = getTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@greenunimind.com';
  const appName = process.env.APP_NAME || 'GreenUniMind';

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Verify your email</h2>
      <p>Use this code to verify your email address on ${appName}:</p>
      <p style="font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #15803d;">${code}</p>
      <p style="color: #666;">This code expires in ${OTP_EXPIRE_MIN} minutes. If you didn't request this, you can ignore this email.</p>
      <p style="color: #666; margin-top: 24px;">— ${appName}</p>
    </div>
  `;

  if (!transporter) {
    console.warn('[Email] SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS in .env). Code NOT sent by email.');
    console.warn('[Email] >>> Verification code for', toEmail, ':', code, '<<< (copy from terminal)');
    return { ok: false, skipped: true };
  }

  try {
    await transporter.sendMail({
      from: `"${appName}" <${from}>`,
      to: toEmail,
      subject: `Your ${appName} verification code`,
      html,
      text: `Your verification code is: ${code}. It expires in ${OTP_EXPIRE_MIN} minutes.`,
    });
    return { ok: true };
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    console.warn('[Email] >>> Verification code for', toEmail, ':', code, '<<< (copy from terminal)');
    return { ok: false, error: err.message };
  }
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
