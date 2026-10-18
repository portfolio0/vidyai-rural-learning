const mongoose = require('mongoose');
const QuizResultSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers:     [{ questionId: mongoose.Schema.Types.ObjectId, chosen: Number, correct: Boolean }],
  score:       Number,
  totalPoints: Number,
  timeTaken:   Number,
  xpEarned:    { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });
QuizResultSchema.index({ studentId: 1, quizId: 1 });
QuizResultSchema.index({ completedAt: -1 });
module.exports = mongoose.model('QuizResult', QuizResultSchema);
