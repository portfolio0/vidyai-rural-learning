const mongoose = require('mongoose');
const QuestionSchema = new mongoose.Schema({
  text:         { type: String, required: true },
  options:      [String],
  correctIndex: { type: Number, required: true },
  explanation:  String,
  aiHint:       String,
  points:       { type: Number, default: 10 },
});
const QuizSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  subject:       String,
  class:         { type: Number, min: 1, max: 10 },
  teacher:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions:     [QuestionSchema],
  duration:      { type: Number, default: 600 },
  xpReward:      { type: Number, default: 20 },
  isAIGenerated: { type: Boolean, default: false },
  isPublished:   { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Quiz', QuizSchema);
