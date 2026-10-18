const mongoose = require('mongoose');
const ProgressSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  quizId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  watched:     { type: Number, default: 0 },
  watchedSeconds: { type: Number, default: 0 },
  durationSeconds: { type: Number, default: 0 },
  resumePosition: { type: Number, default: 0 },
  totalWatchTime: { type: Number, default: 0 },
  startedAt: Date,
  lastWatchedAt: Date,
  completed:   { type: Boolean, default: false },
  completedAt: Date,
  quizScore:   Number,
}, { timestamps: true });
ProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true, sparse: true });
module.exports = mongoose.model('Progress', ProgressSchema);
