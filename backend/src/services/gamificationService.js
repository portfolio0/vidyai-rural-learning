const Student = require('../models/Student');
const { LEVEL_XP } = require('../utils/constants');

function calculateLevel(xp) {
  let level = 1;
  for (let i = LEVEL_XP.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

/**
 * Centrally award XP, coins, and auto-sync student level across all features.
 */
async function awardStudentXP({
  studentId,
  xpAmount = 0,
  coinsAmount = 0,
  lessonsCompletedDelta = 0,
}) {
  if (!studentId) return null;

  const student = await Student.findOne({
    $or: [{ userId: studentId }, { _id: studentId }],
  });
  if (!student) return null;

  const prevXP = student.xp || 0;
  const newXP = Math.max(0, prevXP + Math.round(Number(xpAmount) || 0));
  const newLevel = calculateLevel(newXP);

  student.xp = newXP;
  if (coinsAmount) {
    student.coins = Math.max(0, (student.coins || 0) + Math.round(Number(coinsAmount) || 0));
  }
  if (lessonsCompletedDelta) {
    student.lessonsCompleted = Math.max(
      0,
      (student.lessonsCompleted || 0) + lessonsCompletedDelta
    );
  }
  student.level = newLevel;
  student.lastActivityDate = new Date();

  await student.save();
  return student;
}

module.exports = {
  LEVEL_XP,
  calculateLevel,
  awardStudentXP,
};
