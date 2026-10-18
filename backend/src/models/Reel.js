const mongoose = require('mongoose');
const ReelSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  subject:      String,
  class:        Number,
  teacher:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoUrl:     { type: String, required: true },
  thumbnailUrl: String,
  duration:     { type: Number, max: 90 },
  likes:        { type: Number, default: 0 },
  saves:        { type: Number, default: 0 },
  views:        { type: Number, default: 0 },
  tags:         [String],
  isApproved:   { type: Boolean, default: false },
  language:     { type: String, default: 'en' },
  aiTranscript: String,
  feedScore:    { type: Number, default: 0 },
}, { timestamps: true });
ReelSchema.index({ class: 1, subject: 1, feedScore: -1 });
module.exports = mongoose.model('Reel', ReelSchema);
