const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const PendingRegistration = require('../models/PendingRegistration');
const PasswordReset = require('../models/PasswordReset');
const emailService = require('../services/emailService');

const signToken   = (p) => jwt.sign(p, process.env.JWT_SECRET,    { expiresIn: '15m' });
const signRefresh = (p) => jwt.sign(p, process.env.REFRESH_SECRET, { expiresIn: '30d' });

/**
 * Helper to produce clean, user-friendly error messages from database or validation errors
 */
const getFriendlyErrorMessage = (err) => {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const msg = err.message || String(err);

  if (err.code === 11000 || msg.includes('E11000') || msg.includes('duplicate key')) {
    if (err.keyPattern?.phone || msg.includes('phone')) {
      return 'This mobile number is already registered. Please try a different number or log in.';
    }
    if (err.keyPattern?.email || msg.includes('email')) {
      return 'This email address is already registered. Please log in or use a different email.';
    }
    return 'An account with these details already exists. Please check your email or mobile number.';
  }

  return msg;
};

/**
 * Step 1 of Registration:
 * Validate uniqueness of email and phone, create a pending registration record,
 * and send a 6-digit OTP to the user's email via Gmail SMTP / email service.
 */
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, class: cls, language } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    // 1. Check if email is already registered
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        error: 'This email is already registered. Please log in or use a different email.',
      });
    }

    // 2. Check if phone (if provided) is already registered
    const cleanPhone = phone?.trim();
    if (cleanPhone) {
      const existingPhone = await User.findOne({ phone: cleanPhone });
      if (existingPhone) {
        return res.status(409).json({
          error: 'This mobile number is already in use. Please try a different number or log in.',
        });
      }
    }

    // Disallow public registration of admin accounts
    if (role === 'admin') {
      return res.status(403).json({ error: 'Administrative accounts cannot be self-registered.' });
    }

    // 3. Generate 6-digit OTP and store pending registration data in MongoDB
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 12);

    await PendingRegistration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otp,
        attempts: 0,
        userData: {
          name: name.trim(),
          email: normalizedEmail,
          phone: cleanPhone || undefined,
          password: hashedPassword,
          role,
          class: cls || 5,
          language: language || 'en',
        },
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // 4. Send verification email via email service (with resilient non-blocking fallback)
    let emailSent = false;
    let emailFailureReason = null;
    try {
      await emailService.sendVerificationEmail({
        to: normalizedEmail,
        name: name.trim(),
        otp,
      });
      emailSent = true;
    } catch (emailErr) {
      emailFailureReason = emailErr.message;
      console.warn(`\n[EMAIL NOTICE] Email delivery to ${normalizedEmail} could not complete: ${emailErr.message}`);
      console.log(`======================================================`);
      console.log(`🔑 [VERIFICATION CODE FOR ${normalizedEmail}]: ${otp}`);
      console.log(`======================================================\n`);
    }

    res.status(200).json({
      message: emailSent
        ? 'Verification code sent to your email. Please verify to complete registration.'
        : 'Registration initiated! Please enter your verification code below.',
      email: normalizedEmail,
      expiresIn: 600,
      emailSent,
      ...(!emailSent && {
        devOtp: otp,
        notice: 'Render Free Tier blocks outbound SMTP. Your verification code is provided below to complete sign up.',
      }),
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    res.status(400).json({ error: getFriendlyErrorMessage(err) });
  }
};

/**
 * Resend Email OTP:
 * Resends the 6-digit OTP to the pending registration's email address with a 30s rate limit.
 */
exports.resendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const pending = await PendingRegistration.findOne({ email: normalizedEmail });
    if (!pending) {
      return res.status(404).json({
        error: 'No pending registration found for this email. Please register again.',
      });
    }

    // 30-second cooldown between resends
    if (pending.updatedAt && Date.now() - new Date(pending.updatedAt).getTime() < 30 * 1000) {
      const waitSec = Math.ceil((30 * 1000 - (Date.now() - new Date(pending.updatedAt).getTime())) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSec} seconds before requesting a new code.`,
      });
    }

    // Generate new OTP & refresh timer
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pending.otp = otp;
    pending.createdAt = new Date();
    await pending.save();

    let emailSent = false;
    try {
      await emailService.sendVerificationEmail({
        to: normalizedEmail,
        name: pending.userData.name,
        otp,
      });
      emailSent = true;
    } catch (emailErr) {
      console.warn(`\n[EMAIL NOTICE] Resend email to ${normalizedEmail} could not complete: ${emailErr.message}`);
      console.log(`======================================================`);
      console.log(`🔑 [RESEND VERIFICATION CODE FOR ${normalizedEmail}]: ${otp}`);
      console.log(`======================================================\n`);
    }

    res.status(200).json({
      message: emailSent
        ? 'A new verification code has been sent to your email.'
        : 'A new verification code has been generated.',
      email: normalizedEmail,
      expiresIn: 600,
      emailSent,
      ...(!emailSent && {
        devOtp: otp,
        notice: 'Render Free Tier blocks outbound SMTP. Your new verification code is provided below.',
      }),
    });
  } catch (err) {
    console.error('[RESEND OTP ERROR]', err);
    res.status(500).json({ error: getFriendlyErrorMessage(err) });
  }
};

/**
 * Step 2 of Registration:
 * Verify email OTP, create the user in the database, and return success so
 * the user can proceed to the login section.
 */
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    const cleanOtp = otp ? String(otp).trim() : null;

    if (!normalizedEmail || !cleanOtp) {
      return res.status(400).json({ error: 'Email address and 6-digit code are required.' });
    }

    const pending = await PendingRegistration.findOne({ email: normalizedEmail });
    if (!pending) {
      return res.status(400).json({
        error: 'No pending verification found or code expired. Please register again.',
      });
    }

    const isValid = pending.otp === cleanOtp;
    if (!isValid) {
      pending.attempts = (pending.attempts || 0) + 1;
      if (pending.attempts >= 5) {
        await PendingRegistration.deleteOne({ email: normalizedEmail });
        return res.status(429).json({
          error: 'Too many incorrect attempts. For security, this verification code has been cancelled. Please register again.',
        });
      }
      await pending.save();
      const remaining = 5 - pending.attempts;
      return res.status(400).json({
        error: `Invalid verification code. ${remaining} attempt(s) remaining.`,
      });
    }

    // Verified! Remove from pending list
    const { userData } = pending;
    await PendingRegistration.deleteOne({ email: normalizedEmail });

    // Double check that user wasn't registered in the interim
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        error: 'This email is already registered. Please proceed to log in.',
      });
    }

    if (userData.phone) {
      const existingPhone = await User.findOne({ phone: userData.phone });
      if (existingPhone) {
        return res.status(409).json({
          error: 'This mobile number is already in use. Please try a different number.',
        });
      }
    }

    // Create user in database with isEmailVerified = true
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone || undefined,
      passwordHash: userData.password,
      role: userData.role,
      language: userData.language || 'en',
      isEmailVerified: true,
    });

    if (user.role === 'student') {
      await Student.create({ userId: user._id, class: userData.class || 5 });
    }

    res.status(201).json({
      message: 'Email verified successfully! You can now log in with your credentials.',
      verified: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[VERIFY EMAIL ERROR]', err);
    res.status(400).json({ error: getFriendlyErrorMessage(err) });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
    }

    user.lastLogin = new Date();
    await user.save();

    let student = null;
    if (user.role === 'student') {
      student = await Student.findOne({ userId: user._id });
      if (!student) {
        student = await Student.create({ userId: user._id, class: 5 });
      }
    }

    const token   = signToken({ userId: user._id, role: user.role });
    const refresh = signRefresh({ userId: user._id });
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refresh', refresh, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        class: student?.class || 5,
      },
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ error: getFriendlyErrorMessage(err) });
  }
};

exports.refresh = async (req, res) => {
  const { refresh } = req.cookies;
  if (!refresh) return res.status(401).json({ error: 'No refresh token' });
  try {
    const decoded = jwt.verify(refresh, process.env.REFRESH_SECRET);
    const user    = await User.findById(decoded.userId);
    if (!user || !user.isActive) return res.status(401).json({ error: 'User not found or account deactivated' });
    const token = signToken({ userId: user._id, role: user.role });
    res.json({ token });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refresh', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account not found or deactivated.' });
    }
    let student = null;
    if (user.role === 'student') {
      student = await Student.findOne({ userId: user._id });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        language: user.language,
        avatar: user.avatar,
        school: user.school,
        class: student?.class || 5,
        xp: student?.xp || 0,
        level: student?.level || 1,
        coins: student?.coins || 0,
        streak: student?.streakCurrent || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: getFriendlyErrorMessage(err) });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Return success message to prevent user enumeration attacks
      return res.status(200).json({
        message: 'If an account exists with this email, a 6-digit recovery code has been sent.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await PasswordReset.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, otp, attempts: 0, createdAt: new Date() },
      { upsert: true, new: true }
    );

    let emailSent = false;
    try {
      await emailService.sendPasswordResetEmail({
        to: normalizedEmail,
        name: user.name,
        otp,
      });
      emailSent = true;
    } catch (emailErr) {
      console.warn(`\n[EMAIL NOTICE] Password recovery email to ${normalizedEmail} could not complete: ${emailErr.message}`);
      console.log(`======================================================`);
      console.log(`🔑 [RECOVERY CODE FOR ${normalizedEmail}]: ${otp}`);
      console.log(`======================================================\n`);
    }

    res.status(200).json({
      message: 'If an account exists with this email, a 6-digit recovery code has been sent.',
      email: normalizedEmail,
      expiresIn: 600,
      emailSent,
      ...(!emailSent && {
        devOtp: otp,
        notice: 'Render Free Tier blocks outbound SMTP. Your recovery code is provided below.',
      }),
    });
  } catch (err) {
    console.error('[FORGOT PASSWORD ERROR]', err);
    res.status(500).json({ error: getFriendlyErrorMessage(err) });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : null;
    const cleanOtp = otp ? String(otp).trim() : null;

    if (!normalizedEmail || !cleanOtp || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required.' });
    }

    const resetRecord = await PasswordReset.findOne({ email: normalizedEmail });
    if (!resetRecord) {
      return res.status(400).json({
        error: 'Password reset request expired or not found. Please request a new code.',
      });
    }

    if (resetRecord.otp !== cleanOtp) {
      resetRecord.attempts = (resetRecord.attempts || 0) + 1;
      if (resetRecord.attempts >= 5) {
        await PasswordReset.deleteOne({ email: normalizedEmail });
        return res.status(429).json({
          error: 'Too many incorrect attempts. Reset code cancelled for security. Please request a new one.',
        });
      }
      await resetRecord.save();
      const remaining = 5 - resetRecord.attempts;
      return res.status(400).json({
        error: `Invalid recovery code. ${remaining} attempt(s) remaining.`,
      });
    }

    // Success: Delete reset record & update password
    await PasswordReset.deleteOne({ email: normalizedEmail });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    user.passwordHash = newPassword; // Handled by pre-save bcrypt hook
    await user.save();

    res.status(200).json({
      message: 'Password reset successfully! You can now log in with your new password.',
      success: true,
    });
  } catch (err) {
    console.error('[RESET PASSWORD ERROR]', err);
    res.status(500).json({ error: getFriendlyErrorMessage(err) });
  }
};

/**
 * Diagnostic Endpoint:
 * Allows directly verifying email credentials and network connectivity from a browser
 */
exports.testEmailDiagnostic = async (req, res) => {
  const brevoKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const smtpPass = process.env.SMTP_PASS;
  const smtpUser = process.env.SMTP_USER || 'onkarnanvare5554@gmail.com';
  const testRecipient = req.query.email || smtpUser;
  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

  const configuredMethods = {
    brevoHttpsApiPort443: !!brevoKey,
    resendHttpsApiPort443: !!resendKey,
    gmailSmtpPort465: !!smtpPass,
  };

  try {
    const result = await emailService.sendVerificationEmail({
      to: testRecipient,
      name: 'Diagnostic Test',
      otp: testOtp,
    });

    return res.status(200).json({
      status: 'success',
      message: `Diagnostic email successfully delivered via ${result.method}!`,
      configuredMethods,
      smtpUser,
      testRecipient,
      testOtp,
      result,
    });
  } catch (err) {
    return res.status(200).json({
      status: 'smtp_blocked_by_render',
      message: 'Render Free Tier blocks outbound TCP traffic on SMTP port 465 (Connection timeout). Fallback verification mode is ACTIVE.',
      error: err.message,
      configuredMethods,
      smtpUser,
      testRecipient,
      testOtp,
      explanation: 'Render free tier strictly disables outbound SMTP ports (25, 465, 587) to prevent spam abuse. HTTPS traffic on port 443 is 100% unrestricted.',
      solutions: {
        registrationFallback: 'VidyAI automatically falls back to providing the verification OTP directly in API responses so user sign up and password reset are never blocked.',
        realEmailsFromRender: 'To deliver real emails to Gmail inboxes from Render, sign up for a free Brevo account (300 free emails/day at brevo.com) and add BREVO_API_KEY to Render Environment Variables.',
      },
    });
  }
};
