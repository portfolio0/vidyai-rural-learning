const nodemailer = require('nodemailer');
const https = require('https');

/**
 * Sends email via Brevo HTTPS REST API v3 (Port 443 - 100% permitted on Render Free Tier).
 * Provides 300 free emails/day to any recipient worldwide.
 */
async function sendViaBrevo({ to, name, subject, html, text }) {
  const apiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  if (!apiKey) return null;

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'onkarnanvare5554@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'VidyAI Platform';

  const bodyData = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to, name: name || 'Learner' }],
    subject,
    htmlContent: html,
    ...(text && { textContent: text }),
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey.trim(),
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(bodyData),
        },
        timeout: 8000,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[BREVO API SUCCESS] Email dispatched to ${to}. MessageId: ${parsed.messageId}`);
              resolve({ success: true, method: 'brevo_api', messageId: parsed.messageId });
            } else {
              reject(new Error(`Brevo API error (${res.statusCode}): ${parsed.message || responseBody}`));
            }
          } catch (e) {
            reject(new Error(`Brevo parse error: ${responseBody}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Brevo HTTPS request timed out'));
    });

    req.on('error', (err) => {
      reject(new Error(`Brevo HTTPS connection error: ${err.message}`));
    });

    req.write(bodyData);
    req.end();
  });
}

/**
 * Sends email via Resend HTTPS REST API (Port 443 - 100% permitted on Render Free Tier).
 */
async function sendViaResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const fromEmail = process.env.RESEND_FROM || 'VidyAI <onboarding@resend.dev>';
  const bodyData = JSON.stringify({
    from: fromEmail,
    to: [to],
    subject,
    html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyData),
        },
        timeout: 8000,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[RESEND API SUCCESS] Email dispatched to ${to}. MessageId: ${parsed.id}`);
              resolve({ success: true, method: 'resend_api', messageId: parsed.id });
            } else {
              reject(new Error(`Resend API error (${res.statusCode}): ${parsed.message || responseBody}`));
            }
          } catch (e) {
            reject(new Error(`Resend parse error: ${responseBody}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Resend HTTPS request timed out'));
    });

    req.on('error', (err) => {
      reject(new Error(`Resend HTTPS connection error: ${err.message}`));
    });

    req.write(bodyData);
    req.end();
  });
}

/**
 * Returns Gmail SMTP transporter if credentials exist.
 * Uses 4-second timeout to fail-fast on firewall-blocked clouds like Render Free Tier.
 */
function getSmtpTransporter() {
  const smtpUser = process.env.SMTP_USER || 'onkarnanvare5554@gmail.com';
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : null;
  if (!smtpPass) return null;

  return {
    transporter: nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 4000,
    }),
    smtpUser,
  };
}

/**
 * Master dispatcher:
 * 1. Tries Brevo HTTPS API (port 443) if configured
 * 2. Tries Resend HTTPS API (port 443) if configured
 * 3. Tries Gmail SMTP (port 465) if configured
 */
async function dispatchEmail({ to, name, subject, html, text }) {
  // 1. Brevo REST API (HTTPS Port 443)
  if (process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY) {
    try {
      return await sendViaBrevo({ to, name, subject, html, text });
    } catch (err) {
      console.warn(`[BREVO API NOTICE] ${err.message}. Trying next available provider...`);
    }
  }

  // 2. Resend REST API (HTTPS Port 443)
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendViaResend({ to, subject, html });
    } catch (err) {
      console.warn(`[RESEND API NOTICE] ${err.message}. Trying next available provider...`);
    }
  }

  // 3. Gmail SMTP (Port 465)
  const smtp = getSmtpTransporter();
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
      if (err.message.includes('timeout') || err.message.includes('ETIMEDOUT') || err.code === 'ETIMEDOUT') {
        throw new Error('Gmail SMTP connection timed out (Render free tier blocks SMTP port 465)');
      }
      throw new Error(`Gmail SMTP error: ${err.message}`);
    }
  }

  throw new Error('No email service configured (requires BREVO_API_KEY, RESEND_API_KEY, or SMTP_PASS)');
}

/**
 * Sends a 6-digit verification code to recipient.
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

  return await dispatchEmail({
    to,
    name,
    subject,
    html,
    text: `Your VidyAI verification code is: ${otp}. Valid for 10 minutes.`,
  });
};

/**
 * Sends a 6-digit password recovery code.
 */
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

  return await dispatchEmail({
    to,
    name,
    subject,
    html,
    text: `Your VidyAI password reset code is: ${otp}. Valid for 10 minutes.`,
  });
};
