const mongoose = require('mongoose');

const PendingRegistrationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    userData: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      password: { type: String, required: true },
      role: { type: String, required: true },
      class: { type: Number, default: 5 },
      language: { type: String, default: 'en' },
    },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto-deletes after 10 minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model('PendingRegistration', PendingRegistrationSchema);
