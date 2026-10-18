const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // 10 minutes expiry
  },
  { timestamps: true }
);

PasswordResetSchema.index({ email: 1 });

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);
