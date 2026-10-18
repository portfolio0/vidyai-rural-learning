const mongoose = require('mongoose');
const StudentSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  class:            { type: Number, min: 1, max: 10, required: true },
  parentId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  xp:               { type: Number, default: 0 },
  coins:            { type: Number, default: 0 },
  level:            { type: Number, default: 1 },
  streakCurrent:    { type: Number, default: 0 },
  streakMax:        { type: Number, default: 0 },
  lastActivityDate: Date,
  badges:           [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  downloadedContent:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  learningPath:     [{ subjectId: String, weeklyGoalMins: Number }],
  attendance:       [{ date: Date, present: Boolean }],
  lessonsCompleted: { type: Number, default: 0 },
}, { timestamps: true });
StudentSchema.index({ class: 1, xp: -1 });
StudentSchema.index({ parentId: 1 });
module.exports = mongoose.model('Student', StudentSchema);
