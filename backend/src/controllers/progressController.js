const Student  = require('../models/Student');
const Progress = require('../models/Progress');
const QuizResult = require('../models/QuizResult');
const { LEVEL_XP, XP_REWARDS } = require('../utils/constants');
const { updateLessonProgress } = require('../services/lessonProgressService');

exports.getProgress = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.userId;
    const student   = await Student.findOne({ userId: studentId });
    const progress  = await Progress.find({ studentId })
      .populate({
        path: 'lessonId',
        select: 'title type duration durationSeconds mediaUrl',
        populate: { path: 'courseId', select: 'subject class title' },
      })
      .sort({ updatedAt: -1 })
      .limit(50);
    const recent    = await QuizResult.find({ studentId }).sort({ completedAt: -1 }).limit(10);
    res.json({ student, progress, recentQuizzes: recent });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateProgress = async (req, res) => {
  try {
    const {
      lessonId,
      watched,
      watchedSeconds,
      durationSeconds,
      resumePosition,
      totalWatchTime,
      completed,
    } = req.body;
    const studentId = req.user.userId;
    const result = await updateLessonProgress({
      studentId,
      lessonId,
      watched,
      watchedSeconds,
      durationSeconds,
      resumePosition,
      totalWatchTime,
      completed,
    });
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { class: cls, school } = req.query;
    const filter = {};
    if (cls) filter.class = parseInt(cls);
    const students = await Student.find(filter)
      .populate('userId', 'name avatar')
      .sort({ xp: -1 })
      .limit(20);
    const board = students.map((s, i) => ({
      rank: i + 1,
      name: s.userId?.name,
      xp: s.xp,
      level: s.level,
      streak: s.streakCurrent,
    }));
    res.json({ leaderboard: board });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.addXP = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const cleanAmount = Math.min(Math.max(1, Math.round(Number(amount) || 0)), 100);
    const { awardStudentXP } = require('../services/gamificationService');
    const student = await awardStudentXP({
      studentId: req.user.userId,
      xpAmount: cleanAmount,
      coinsAmount: Math.floor(cleanAmount / 2),
    });
    if (!student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }
    res.json({ xp: student.xp, level: student.level, coins: student.coins, reason });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
