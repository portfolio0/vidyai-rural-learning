exports.ROLES        = ['student', 'teacher', 'parent', 'admin'];
exports.LANGUAGES    = ['en', 'mr', 'hi'];
exports.SUBJECTS     = ['Mathematics', 'Science', 'English', 'Marathi', 'Hindi', 'Social Studies', 'Computer', 'GK', 'EVS'];
exports.CLASSES      = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
exports.LEVEL_XP     = [0, 100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000];

exports.XP_REWARDS = {
  LESSON_COMPLETE:  10,
  QUIZ_PASS:        20,
  QUIZ_PERFECT:     50,
  DAILY_LOGIN:       5,
  STREAK_7_DAYS:   100,
  REEL_WATCHED:      2,
  COMMENT_HELP:      5,
};

exports.LESSON_COMPLETION_THRESHOLD = 90;

exports.BADGE_CONDITIONS = {
  STREAK_7:        { type: 'streak',        value: 7 },
  QUIZ_MASTER:     { type: 'quiz_perfect',  value: 5 },
  TOP_READER:      { type: 'lessons',       value: 10 },
  RISING_STAR:     { type: 'level',         value: 5 },
  DEDICATED:       { type: 'login_days',    value: 30 },
};
