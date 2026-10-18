const mongoose = require('mongoose');
const SyncQueueSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:    { type: String, required: true },
  payload:   mongoose.Schema.Types.Mixed,
  status:    { type: String, enum: ['pending','synced','failed'], default: 'pending' },
  syncedAt:  Date,
}, { timestamps: true });

SyncQueueSchema.index({ studentId: 1, status: 1 });
SyncQueueSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('SyncQueue', SyncQueueSchema);
