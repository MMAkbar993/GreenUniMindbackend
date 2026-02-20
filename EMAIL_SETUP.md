# Sending verification emails (Gmail)

The app shows "Check your email for the new 6-digit code" but **does not send real emails** until SMTP is configured in `.env`.

## Option 1: Gmail (recommended for testing)

1. **Turn on 2-Step Verification**
   - Go to [Google Account → Security](https://myaccount.google.com/security)
   - Under "How you sign in to Google", turn on **2-Step Verification**

2. **Create an App Password**
   - Still in Security → "How you sign in to Google"
   - Click **App passwords**
   - Select app: **Mail**, device: **Other** (e.g. "GreenUniMind")
   - Click **Generate**
   - Copy the **16-character password** (no spaces)

3. **Add to your backend `.env`** (same folder as this file):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
MAIL_FROM=your-gmail@gmail.com
APP_NAME=GreenUniMind
```

- Replace `your-gmail@gmail.com` with your Gmail address (for both `SMTP_USER` and `MAIL_FROM`).
- Replace `SMTP_PASS` with the 16-character App Password (you can paste it with or without spaces).

4. **Restart the backend** (`npm run dev`). Then sign up or click "Resend Code" again — the email should arrive at the inbox (or Spam).

---

## Option 2: No email (development only)

If you leave SMTP unset, the **6-digit code is printed in the terminal** where the backend is running. Look for a line like:

```text
[Email] >>> Verification code for user@gmail.com : 123456 <<< (copy from terminal)
```

Use that code on the "Verify Your Email" page.

---

## If Gmail still doesn’t receive the email

- Check **Spam** and **Promotions**.
- Make sure you used an **App Password**, not your normal Gmail password.
- In the terminal, look for `[Email] Send failed: ...` — the message after that usually explains the error (e.g. wrong password, "Less secure app" if you didn’t use an App Password).
