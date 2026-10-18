const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Student = require('../models/Student');
const Reel = require('../models/Reel');
const { updateLessonProgress } = require('../services/lessonProgressService');
const { checkAndAwardBadges } = require('../services/badgeService');

const SyncQueue = require('../models/SyncQueue');

// POST /api/sync/flush
exports.flushQueue = async (req, res) => {
  try {
    const { queue = [] } = req.body;
    const studentId = req.user.userId;
    const results = [];

    for (const item of queue) {
      try {
        if (item.action === 'progress_update') {
          await updateLessonProgress({ studentId, ...item.payload });
        } else if (item.action === 'quiz_submit') {
          const xp = Math.min(Math.max(0, Number(item.payload.xpEarned || 20)), 100);
          await QuizResult.create({ studentId, ...item.payload, xpEarned: xp });
          const { awardStudentXP } = require('../services/gamificationService');
          await awardStudentXP({
            studentId,
            xpAmount: xp,
            coinsAmount: Math.floor(xp / 2),
          });
          if (item.payload.score && item.payload.score >= 100) {
            await checkAndAwardBadges(studentId, 'quiz_perfect', 100);
          }
        } else if (item.action === 'reel_like') {
          if (item.payload?.reelId) {
            await Reel.findByIdAndUpdate(item.payload.reelId, {
              $inc: { likes: 1 },
            });
          }
        }

        await SyncQueue.create({
          studentId,
          action: item.action,
          payload: item.payload,
          status: 'synced',
          syncedAt: new Date(),
        }).catch(() => {});

        results.push({ localId: item.id, status: 'synced' });
      } catch (e) {
        await SyncQueue.create({
          studentId,
          action: item.action,
          payload: item.payload,
          status: 'failed',
        }).catch(() => {});

        results.push({ localId: item.id, status: 'failed', error: e.message });
      }
    }

    res.json({ results, syncedAt: new Date() });
  } catch (err) {
    console.error('[Sync Flush Error]', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/sync/pull
exports.pullUpdates = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const student = await Student.findOne({ userId: studentId }).populate('badges');
    const studentClass = req.query.class || student?.class || 5;
    const since = req.query.since ? new Date(req.query.since) : null;

    // Find courses matching student's class
    const matchingCourses = await Course.find({
      class: Number(studentClass),
      isPublished: true,
    }).select('_id');
    const courseIds = matchingCourses.map((c) => c._id);

    const lessonQuery = {
      courseId: { $in: courseIds },
      isPublished: true,
    };
    if (since && !isNaN(since.getTime())) {
      lessonQuery.updatedAt = { $gt: since };
    }

    const quizQuery = {
      class: Number(studentClass),
      isPublished: true,
    };
    if (since && !isNaN(since.getTime())) {
      quizQuery.updatedAt = { $gt: since };
    }

    const [lessons, quizzes] = await Promise.all([
      Lesson.find(lessonQuery).sort({ createdAt: -1 }).limit(50),
      Quiz.find(quizQuery)
        .select('-questions.correctIndex -questions.explanation')
        .limit(20),
    ]);

    res.json({
      student: student ? {
        xp: student.xp,
        coins: student.coins,
        level: student.level,
        streakCurrent: student.streakCurrent,
        lessonsCompleted: student.lessonsCompleted,
        badges: student.badges,
      } : null,
      lessons,
      quizzes,
      pulledAt: new Date(),
    });
  } catch (err) {
    console.error('[Sync Pull Error]', err);
    res.status(500).json({ error: err.message });
  }
};
