const Lesson = require("../models/Lesson");
const Progress = require("../models/Progress");
const Student = require("../models/Student");
const {
  XP_REWARDS,
  LESSON_COMPLETION_THRESHOLD,
} = require("../utils/constants");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getLessonDurationSeconds = (lesson) => {
  if (!lesson) return 0;
  if (lesson.durationSeconds) return Math.round(lesson.durationSeconds);
  if (lesson.duration) return Math.round(lesson.duration * 60);
  return 0;
};

async function updateLessonProgress({
  studentId,
  lessonId,
  watched,
  watchedSeconds,
  durationSeconds,
  resumePosition,
  totalWatchTime,
  completed,
}) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    const err = new Error("Lesson not found");
    err.status = 404;
    throw err;
  }

  const existing =
    (await Progress.findOne({ studentId, lessonId })) ||
    new Progress({ studentId, lessonId });

  const normalizedDuration =
    Math.round(durationSeconds || existing.durationSeconds || getLessonDurationSeconds(lesson) || 0);
  const normalizedWatchedSeconds = normalizedDuration
    ? clamp(
        Math.round(
          Math.max(
            existing.watchedSeconds || 0,
            watchedSeconds || 0,
            watched && watched > 0 && watched <= 100
              ? (normalizedDuration * watched) / 100
              : 0,
          ),
        ),
        0,
        normalizedDuration,
      )
    : Math.round(
        Math.max(existing.watchedSeconds || 0, watchedSeconds || 0, 0),
      );

  const watchedPct = normalizedDuration
    ? Math.min(
        100,
        Math.round((normalizedWatchedSeconds / normalizedDuration) * 100),
      )
    : clamp(Math.round(Math.max(existing.watched || 0, watched || 0)), 0, 100);

  const nextTotalWatchTime = Math.max(
    existing.totalWatchTime || 0,
    Math.round(totalWatchTime || 0),
  );
  const nextResumePosition = normalizedDuration
    ? clamp(
        Math.round(
          typeof resumePosition === "number"
            ? resumePosition
            : normalizedWatchedSeconds,
        ),
        0,
        normalizedDuration,
      )
    : Math.max(existing.resumePosition || 0, Math.round(resumePosition || 0));

  const now = new Date();
  const supportsWatchTracking = ["video", "audio"].includes(lesson.type);
  const completionByThreshold =
    normalizedDuration > 0 && watchedPct >= LESSON_COMPLETION_THRESHOLD;
  const nextCompleted =
    existing.completed ||
    (!supportsWatchTracking && completed === true) ||
    completionByThreshold;
  const completedNow = !existing.completed && nextCompleted;

  existing.watched = watchedPct;
  existing.watchedSeconds = normalizedWatchedSeconds;
  existing.durationSeconds = normalizedDuration;
  existing.resumePosition = nextCompleted ? 0 : nextResumePosition;
  existing.totalWatchTime = nextTotalWatchTime;
  existing.completed = nextCompleted;
  existing.startedAt =
    existing.startedAt ||
    (normalizedWatchedSeconds > 0 || nextTotalWatchTime > 0 ? now : undefined);
  existing.lastWatchedAt =
    normalizedWatchedSeconds > 0 || nextTotalWatchTime > 0 ? now : existing.lastWatchedAt;
  if (completedNow) {
    existing.completedAt = now;
  }

  await existing.save();

  let xpAwarded = 0;
  let newBadges = [];
  if (completedNow) {
    xpAwarded = XP_REWARDS.LESSON_COMPLETE;
    const { awardStudentXP } = require("./gamificationService");
    const updatedStudent = await awardStudentXP({
      studentId,
      xpAmount: xpAwarded,
      coinsAmount: 5,
      lessonsCompletedDelta: 1,
    });
    await Lesson.findByIdAndUpdate(lessonId, { $inc: { completions: 1 } });
    const { checkAndAwardBadges } = require("./badgeService");
    newBadges = await checkAndAwardBadges(studentId, "lesson_complete", updatedStudent?.lessonsCompleted || 1);
  }

  return {
    progress: existing,
    xpAwarded,
    completedNow,
    newBadges,
    completionThreshold: LESSON_COMPLETION_THRESHOLD,
  };
}

module.exports = {
  LESSON_COMPLETION_THRESHOLD,
  getLessonDurationSeconds,
  updateLessonProgress,
};
