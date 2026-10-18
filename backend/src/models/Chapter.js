const mongoose = require('mongoose');
const ChapterSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:    { type: String, required: true },
  order:    { type: Number, default: 0 },
  lessons:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  quiz:     { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
}, { timestamps: true });
module.exports = mongoose.model('Chapter', ChapterSchema);
