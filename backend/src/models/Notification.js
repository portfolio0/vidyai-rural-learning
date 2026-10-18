const mongoose = require('mongoose');
const NotifSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true },
  body:    String,
  type:    { type: String, enum: ['badge','streak','assignment','announcement','quiz'], default: 'announcement' },
  isRead:  { type: Boolean, default: false },
  url:     String,
}, { timestamps: true });
NotifSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', NotifSchema);
