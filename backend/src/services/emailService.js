const nodemailer = require('nodemailer');

function getTransporter() {
  const smtpUser = process.env.SMTP_USER || 'onkarnanvare5554@gmail.com';
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : null;
  if (!smtpPass) return null;
  return {
    transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    }),
    smtpUser,
  };
}

/**
 * Sends a 6-digit verification code to the recipient via Gmail SMTP.
 * Sends to ANY email address worldwide without custom domain restrictions.
 */
exports.sendVerificationEmail = async ({ to, name, otp }) => {
  const subject = `${otp} is your VidyAI Verification Code`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your VidyAI Account</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F3F4F6; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
              <tr>
                <td style="background: linear-gradient(135deg, #6C63FF, #EC4899); padding: 36px 24px; text-align: center;">
                  <div style="font-size: 44px; line-height: 1; margin-bottom: 8px;">🎓</div>
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">VidyAI</h1>
                  <p style="color: rgba(255,255,255,0.92); margin: 6px 0 0; font-size: 14px;">AI-Powered Rural Learning</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 36px 28px 28px;">
                  <h2 style="color: #1F2937; margin: 0 0 12px; font-size: 20px; font-weight: 700;">Welcome, ${name || 'Learner'}!</h2>
                  <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                    Thank you for signing up with VidyAI. Please use the 6-digit verification code below to verify your email and activate your account:
                  </p>
                  
                  <div style="background-color: #F5F3FF; border: 2px dashed #8B5CF6; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #6D28D9; font-family: 'Courier New', Courier, monospace; display: inline-block;">
                      ${otp}
                    </span>
                  </div>

                  <p style="color: #6B7280; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
                    ⏳ This code is valid for <strong>10 minutes</strong>. If you did not request this, you can safely disregard this email.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
                  
                  <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0; line-height: 1.4;">
                    VidyAI Platform • Empowering education across Bharat 🇮🇳<br>
                    Need support? Reply directly to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // 1. If Gmail SMTP transporter is configured, send real email
  const smtp = getTransporter();
  if (smtp) {
    try {
      const info = await smtp.transporter.sendMail({
        from: `VidyAI <${smtp.smtpUser}>`,
        to,
        replyTo: smtp.smtpUser,
        subject,
        html,
      });
      console.log(`[GMAIL SMTP SUCCESS] Email sent to ${to}. MessageId: ${info.messageId}`);
      return { success: true, method: 'gmail_smtp', id: info.messageId };
    } catch (err) {
      console.error(`[GMAIL SMTP ERROR] Failed sending to ${to}:`, err.message);
      throw new Error(`Gmail SMTP error: ${err.message}`);
    }
  }

  // 2. If SMTP_PASS is not yet provided
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[EMAIL NOTICE] SMTP_PASS not set in .env. Real email to ${to} skipped.`);
    console.log(`🔑 [OTP CODE FOR TESTING]: ${otp}`);
    return { success: true, method: 'dev_mock', otp };
  }

  throw new Error('No email service configured. Please provide SMTP_PASS in backend/.env');
};

exports.sendPasswordResetEmail = async ({ to, name, otp }) => {
  const subject = `${otp} is your VidyAI Password Reset Code`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Reset Your VidyAI Password</title></head>
    <body style="margin:0;padding:24px;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.06);">
          <tr><td style="background:linear-gradient(135deg,#6C63FF,#4F46E5);padding:28px 24px;text-align:center;color:#fff;">
            <div style="font-size:38px;">🔐</div>
            <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;">Password Reset Request</h1>
          </td></tr>
          <tr><td style="padding:28px 24px;">
            <p style="color:#374151;font-size:15px;margin:0 0 16px;">Hello ${name || 'User'},</p>
            <p style="color:#4B5563;font-size:14px;line-height:1.6;margin:0 0 20px;">
              We received a request to reset your VidyAI account password. Use this 6-digit verification code to proceed:
            </p>
            <div style="background:#F5F3FF;border:2px dashed #8B5CF6;border-radius:12px;padding:18px;text-align:center;margin:20px 0;">
              <span style="font-size:34px;font-weight:800;letter-spacing:6px;color:#6D28D9;font-family:monospace;">${otp}</span>
            </div>
            <p style="color:#6B7280;font-size:12px;margin:0;">
              Valid for 10 minutes. If you did not request a password reset, please ignore this email.
            </p>
          </td></tr>
        </table>
      </td></tr></table>
    </body>
    </html>
  `;

  const smtp = getTransporter();
  if (smtp) {
    try {
      const info = await smtp.transporter.sendMail({
        from: `VidyAI <${smtp.smtpUser}>`,
        to,
        replyTo: smtp.smtpUser,
        subject,
        html,
      });
      return { success: true, method: 'gmail_smtp', id: info.messageId };
    } catch (err) {
      console.error(`[GMAIL SMTP ERROR] Password reset email failed to ${to}:`, err.message);
      throw new Error(`Gmail SMTP error: ${err.message}`);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔑 [DEV RESET OTP]: ${otp} for ${to}`);
    return { success: true, method: 'dev_mock', otp };
  }

  throw new Error('No email service configured.');
};

