const mongoose = require('mongoose');
const LessonSchema = new mongoose.Schema({
  courseId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  chapterId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  teacher:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title:          { type: String, required: true },
  type:           { type: String, enum: ['video','pdf','audio','image','text'], required: true },
  content:        { type: String, required: true },
  duration:       { type: Number, default: 0 },
  durationSeconds:{ type: Number, default: 0 },
  thumbnail:      String,
  mediaUrl:       String,
  mediaName:      String,
  mediaMimeType:  String,
  mediaSize:      { type: Number, default: 0 },
  status:         { type: String, enum: ['draft', 'published'], default: 'published' },
  isPublished:    { type: Boolean, default: true },
  isDownloadable: { type: Boolean, default: true },
  offlineSize:    { type: Number, default: 0 },
  language:       { type: String, default: 'en' },
  aiSummary:      String,
  aiKeyPoints:    [String],
  views:          { type: Number, default: 0 },
  completions:    { type: Number, default: 0 },
}, { timestamps: true });
LessonSchema.index({ courseId: 1, chapterId: 1, isPublished: 1 });
module.exports = mongoose.model('Lesson', LessonSchema);
