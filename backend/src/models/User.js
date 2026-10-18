const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, unique: true, sparse: true, lowercase: true },
  phone:        { type: String, unique: true, sparse: true },
  passwordHash: String,
  role:         { type: String, enum: ['student','teacher','parent','admin'], required: true },
  language:     { type: String, enum: ['en','mr','hi'], default: 'en' },
  school:       { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  avatar:       { type: String, default: '' },
  isActive:     { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin:    Date,
  deviceTokens: [String],
}, { timestamps: true });
UserSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash') && this.passwordHash) {
    if (!this.passwordHash.startsWith('$2a$') && !this.passwordHash.startsWith('$2b$')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    }
  }
  next();
});
UserSchema.methods.checkPassword = function(pw) { return bcrypt.compare(pw, this.passwordHash); };
module.exports = mongoose.model('User', UserSchema);
