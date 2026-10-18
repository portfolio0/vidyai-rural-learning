const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  subject:       { type: String, required: true },
  class:         { type: Number, min: 1, max: 10, required: true },
  teacher:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chapters:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
  thumbnail:     String,
  description:   String,
  language:      { type: String, enum: ['en','mr','hi'], default: 'en' },
  isPublished:   { type: Boolean, default: false },
  totalLessons:  { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
}, { timestamps: true });

CourseSchema.index({ isPublished: 1, class: 1, subject: 1 });
CourseSchema.index({ teacher: 1 });
module.exports = mongoose.model('Course', CourseSchema);
