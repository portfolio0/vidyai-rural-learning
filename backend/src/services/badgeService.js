const Badge = require('../models/Badge');
const Student = require('../models/Student');

const SYSTEM_BADGES = [
  {
    condition: 'first_lesson',
    name: 'First Star',
    icon: '⭐',
    description: 'Completed your first lesson on VidyAI!',
    rarity: 'common',
    xpBonus: 25,
  },
  {
    condition: 'streak_7',
    name: 'Streak 7',
    icon: '🔥',
    description: 'Maintained a 7-day continuous learning streak!',
    rarity: 'rare',
    xpBonus: 100,
  },
  {
    condition: 'top_reader',
    name: 'Top Reader',
    icon: '📚',
    description: 'Completed 5 or more educational lessons!',
    rarity: 'rare',
    xpBonus: 50,
  },
  {
    condition: 'quiz_master',
    name: 'Quiz Master',
    icon: '🧠',
    description: 'Scored 100% on a challenging quiz!',
    rarity: 'epic',
    xpBonus: 75,
  },
  {
    condition: 'champion',
    name: 'Champion',
    icon: '🏆',
    description: 'Accumulated over 1,000 XP in learning!',
    rarity: 'legendary',
    xpBonus: 200,
  },
];

exports.SYSTEM_BADGES = SYSTEM_BADGES;

exports.checkAndAwardBadges = async (studentId, eventType, value) => {
  try {
    const student = await Student.findOne({ userId: studentId }).populate('badges');
    if (!student) return [];

    const existingBadgeConditions = new Set(
      (student.badges || []).map((b) => (typeof b === 'object' ? b.condition : b.toString()))
    );

    const newlyAwarded = [];

    for (const badgeDef of SYSTEM_BADGES) {
      if (existingBadgeConditions.has(badgeDef.condition)) {
        continue;
      }

      let qualified = false;

      if (badgeDef.condition === 'first_lesson' && (student.lessonsCompleted >= 1 || (eventType === 'lesson_complete' && value >= 1))) {
        qualified = true;
      } else if (badgeDef.condition === 'top_reader' && (student.lessonsCompleted >= 5 || (eventType === 'lesson_complete' && value >= 5))) {
        qualified = true;
      } else if (badgeDef.condition === 'streak_7' && (student.streakCurrent >= 7 || (eventType === 'streak' && value >= 7))) {
        qualified = true;
      } else if (badgeDef.condition === 'quiz_master' && eventType === 'quiz_perfect') {
        qualified = true;
      } else if (badgeDef.condition === 'champion' && (student.xp >= 1000 || (eventType === 'xp_gain' && value >= 1000))) {
        qualified = true;
      }

      if (qualified) {
        // Upsert badge in Badge collection
        const badgeDoc = await Badge.findOneAndUpdate(
          { condition: badgeDef.condition },
          {
            name: badgeDef.name,
            icon: badgeDef.icon,
            description: badgeDef.description,
            rarity: badgeDef.rarity,
            xpBonus: badgeDef.xpBonus,
          },
          { upsert: true, new: true }
        );

        student.badges.push(badgeDoc._id);
        student.xp += badgeDef.xpBonus;
        student.coins += 10;
        newlyAwarded.push(badgeDoc);
        existingBadgeConditions.add(badgeDef.condition);
      }
    }

    if (newlyAwarded.length > 0) {
      await student.save();
    }

    return newlyAwarded;
  } catch (e) {
    console.error('[Badge Award Error]', e);
    return [];
  }
};
