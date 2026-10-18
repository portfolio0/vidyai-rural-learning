const router = require("express").Router();
const mongoose = require("mongoose");
const { protect, requireRole } = require("../middleware/auth");
const Student = require("../models/Student");
const User = require("../models/User");
const Course = require("../models/Course");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const Progress = require("../models/Progress");

const average = (items, pick) => {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + pick(item), 0) / items.length);
};

router.get("/dashboard", protect, requireRole("teacher"), async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const teacher = await User.findById(teacherId).lean();

    const courses = await Course.find({ teacher: teacherId })
      .populate({
        path: "chapters",
        populate: {
          path: "lessons",
          options: { sort: { createdAt: -1 } },
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    const quizzes = await Quiz.find({
      $or: [{ teacher: teacherId }, { createdBy: teacherId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const courseClasses = [...new Set(courses.map((course) => course.class).filter(Boolean))];
    const studentUserFilter = { role: "student" };
    if (teacher?.school) {
      studentUserFilter.school = teacher.school;
    }
    const studentUsers = await User.find(studentUserFilter).select("_id name email").lean();
    const studentIds = studentUsers.map((user) => user._id);

    let students = await Student.find({ userId: { $in: studentIds } })
      .populate("userId", "name email avatar")
      .lean();

    if (!teacher?.school && courseClasses.length) {
      students = students.filter((student) => courseClasses.includes(student.class));
    }

    const filteredStudentIds = students.map((student) => student.userId?._id || student.userId);
    const teacherQuizIds = quizzes.map((quiz) => quiz._id);
    const quizResults = await QuizResult.find({
      studentId: { $in: filteredStudentIds },
      ...(teacherQuizIds.length ? { quizId: { $in: teacherQuizIds } } : {}),
    })
      .populate("quizId", "title subject class")
      .sort({ completedAt: -1 })
      .lean();

    const progressRows = await Progress.find({
      studentId: { $in: filteredStudentIds },
    })
      .populate("lessonId", "title")
      .lean();

    const progressByStudent = new Map();
    for (const row of progressRows) {
      const key = row.studentId.toString();
      if (!progressByStudent.has(key)) progressByStudent.set(key, []);
      progressByStudent.get(key).push(row);
    }

    const quizByStudent = new Map();
    for (const result of quizResults) {
      const key = result.studentId.toString();
      if (!quizByStudent.has(key)) quizByStudent.set(key, []);
      quizByStudent.get(key).push(result);
    }

    const lessons = courses.flatMap((course) =>
      (course.chapters || []).flatMap((chapter) =>
        (chapter.lessons || []).map((lesson) => ({
          ...(lesson.toObject ? lesson.toObject() : lesson),
          courseTitle: course.title,
          courseSubject: course.subject,
          courseClass: course.class,
        })),
      ),
    );

    const studentsData = students.map((student) => {
      const userId = student.userId?._id?.toString?.() || student.userId.toString();
      const progress = progressByStudent.get(userId) || [];
      const studentQuizResults = quizByStudent.get(userId) || [];
      return {
        _id: student._id,
        userId,
        name: student.userId?.name || "Unknown",
        xp: student.xp,
        level: student.level,
        streak: student.streakCurrent,
        lessonsCompleted: student.lessonsCompleted,
        class: student.class,
        attendanceCount: (student.attendance || []).length,
        avgQuizScore: average(studentQuizResults, (row) => row.score || 0),
        completedLessons: progress.filter((row) => row.completed).length,
      };
    });

    const studentByUserId = new Map(studentsData.map((student) => [student.userId, student]));
    const lessonProgressRows = progressRows.filter((row) => row.lessonId);

    const classes = courseClasses.map((classNumber) => {
      const classStudents = studentsData.filter((student) => student.class === classNumber);
      const leaderboard = [...classStudents]
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 5)
        .map((student, index) => ({
          rank: index + 1,
          name: student.name,
          xp: student.xp,
          level: student.level,
          streak: student.streak,
        }));
      return {
        classNumber,
        studentCount: classStudents.length,
        lessonsCompleted: average(classStudents, (student) => student.lessonsCompleted || 0),
        avgQuizScore: average(classStudents, (student) => student.avgQuizScore || 0),
        avgXp: average(classStudents, (student) => student.xp || 0),
        leaderboard,
        students: classStudents,
      };
    });

    const attendanceRows = students.flatMap((student) =>
      (student.attendance || []).map((item) => ({
        studentId: student._id,
        name: student.userId?.name || "Unknown",
        class: student.class,
        date: item.date,
        present: item.present,
      })),
    );

    const attendanceByClass = classes.map((cls) => {
      const rows = attendanceRows.filter((row) => row.class === cls.classNumber);
      return {
        classNumber: cls.classNumber,
        sessions: rows.length,
        attendancePct: rows.length
          ? Math.round((rows.filter((row) => row.present).length / rows.length) * 100)
          : 0,
      };
    });

    const weakStudents = [...studentsData]
      .sort((a, b) => (a.avgQuizScore || 0) - (b.avgQuizScore || 0))
      .slice(0, 5);
    const topPerformers = [...studentsData].sort((a, b) => b.xp - a.xp).slice(0, 5);
    const streakLeaders = [...studentsData]
      .sort((a, b) => (b.streak || 0) - (a.streak || 0))
      .slice(0, 5);

    const avgScore = quizResults.length
      ? Math.round(quizResults.reduce((sum, row) => sum + (row.score || 0), 0) / quizResults.length)
      : 0;

    const avgAttendance = attendanceByClass.length
      ? Math.round(
          attendanceByClass.reduce((sum, row) => sum + (row.attendancePct || 0), 0)
            / attendanceByClass.length,
        )
      : 0;

    const bestClass = [...classes].sort((a, b) => (b.avgQuizScore || 0) - (a.avgQuizScore || 0))[0] || null;
    const lowestClass =
      [...classes].sort((a, b) => (a.avgQuizScore || 0) - (b.avgQuizScore || 0))[0] || null;

    const weakTopicMap = new Map();
    for (const result of quizResults) {
      const subject = result.quizId?.subject || "General";
      const current = weakTopicMap.get(subject) || { subject, totalScore: 0, attempts: 0 };
      current.totalScore += result.score || 0;
      current.attempts += 1;
      weakTopicMap.set(subject, current);
    }
    const weakTopics = [...weakTopicMap.values()]
      .map((item) => ({
        subject: item.subject,
        avgScore: item.attempts ? Math.round(item.totalScore / item.attempts) : 0,
        attempts: item.attempts,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 4);

    const lessonCompletionMap = new Map();
    for (const row of progressRows.filter((item) => item.completed)) {
      const lessonTitle = row.lessonId?.title || "Lesson";
      const current = lessonCompletionMap.get(lessonTitle) || { title: lessonTitle, completions: 0 };
      current.completions += 1;
      lessonCompletionMap.set(lessonTitle, current);
    }
    const mostCompletedLessons = [...lessonCompletionMap.values()]
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 4);

    const possibleQuizAttempts = studentsData.length * quizzes.length;
    const quizCompletionRate = possibleQuizAttempts
      ? Math.min(100, Math.round((quizResults.length / possibleQuizAttempts) * 100))
      : 0;

    const lessonAnalyticsRows = lessonProgressRows.filter(
      (row) =>
        (row.watchedSeconds || row.totalWatchTime || row.watched || row.completed) &&
        (row.durationSeconds || row.lessonId?.durationSeconds || row.lessonId?.duration),
    );
    const startedLessonStudents = new Set(
      lessonAnalyticsRows
        .filter((row) => (row.watchedSeconds || row.totalWatchTime || row.watched) > 0)
        .map((row) => row.studentId.toString()),
    ).size;
    const completedLessonStudents = new Set(
      lessonAnalyticsRows
        .filter((row) => row.completed)
        .map((row) => row.studentId.toString()),
    ).size;
    const averageWatchPct = lessonAnalyticsRows.length
      ? Math.round(
          lessonAnalyticsRows.reduce((sum, row) => sum + (row.watched || 0), 0) /
            lessonAnalyticsRows.length,
        )
      : 0;
    const averageWatchTime = lessonAnalyticsRows.length
      ? Math.round(
          lessonAnalyticsRows.reduce((sum, row) => sum + (row.totalWatchTime || 0), 0) /
            lessonAnalyticsRows.length,
        )
      : 0;
    const dropOffRate = startedLessonStudents
      ? Math.max(
          0,
          Math.round(
            ((startedLessonStudents - completedLessonStudents) / startedLessonStudents) * 100,
          ),
        )
      : 0;

    const recentActivity = [
      ...quizResults.map((result) => {
        const student = studentByUserId.get(result.studentId.toString());
        return {
          type: "quiz",
          date: result.completedAt || result.createdAt,
          title: `${student?.name || "Student"} attempted ${result.quizId?.title || "a quiz"}`,
          meta: `${result.quizId?.subject || "General"} · ${result.score || 0}%`,
        };
      }),
      ...progressRows
        .filter((row) => row.completed)
        .map((row) => {
          const student = studentByUserId.get(row.studentId.toString());
          return {
            type: "lesson",
            date: row.completedAt || row.updatedAt || row.createdAt,
            title: `${student?.name || "Student"} completed ${row.lessonId?.title || "a lesson"}`,
            meta: `Class ${student?.class || "—"}`,
          };
        }),
      ...attendanceRows.map((row) => ({
        type: "attendance",
        date: row.date,
        title: `Attendance updated for ${row.name}`,
        meta: `Class ${row.class} · ${row.present ? "Present" : "Absent"}`,
      })),
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12);

    res.json({
      stats: {
        studentCount: studentsData.length,
        courseCount: courses.length,
        lessonCount: lessons.length,
        avgCompletion: avgScore,
        classCount: classes.length,
        quizCount: quizzes.length,
        avgAttendance,
        activeCourses: courses.filter((course) => course.isPublished).length,
        publishedLessons: lessons.filter((lesson) => lesson.isPublished).length,
        activeQuizzes: quizzes.filter((quiz) => quiz.isPublished).length,
        pendingReviews: 0,
      },
      students: studentsData,
      courses: courses.map((course) => ({
        ...course.toObject(),
        chapters: (course.chapters || []).map((chapter) => ({
          ...chapter.toObject(),
          lessons: chapter.lessons || [],
        })),
      })),
      lessons,
      quizzes,
      classes,
      attendance: {
        records: attendanceRows.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 100),
        byClass: attendanceByClass,
      },
      analytics: {
        weakStudents,
        topPerformers,
        streakLeaders,
        lessonAnalytics: {
          studentsStarted: startedLessonStudents,
          studentsCompleted: completedLessonStudents,
          averageWatchPct,
          averageWatchTime,
          dropOffRate,
        },
        recentActivity,
        classPerformance: {
          bestClass: bestClass
            ? {
                classNumber: bestClass.classNumber,
                avgQuizScore: bestClass.avgQuizScore || 0,
                studentCount: bestClass.studentCount || 0,
              }
            : null,
          lowestClass: lowestClass
            ? {
                classNumber: lowestClass.classNumber,
                avgQuizScore: lowestClass.avgQuizScore || 0,
                studentCount: lowestClass.studentCount || 0,
              }
            : null,
          averageScore: avgScore,
        },
        learningInsights: {
          weakTopics,
          mostCompletedLessons,
          quizCompletionRate,
        },
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/students", protect, requireRole("teacher"), async (req, res) => {
  try {
    const teacher = await User.findById(req.user.userId);
    const studentUsers = await User.find({
      role: "student",
      ...(teacher?.school ? { school: teacher.school } : {}),
    });
    const students = await Student.find({
      userId: { $in: studentUsers.map((user) => user._id) },
    }).populate("userId", "name email");
    res.json({ students });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/teacher/attendance
router.post("/attendance", protect, requireRole("teacher"), async (req, res) => {
  try {
    const { date = new Date(), records = [] } = req.body;
    const targetDate = new Date(date);
    const dateStr = targetDate.toISOString().split("T")[0];

    for (const record of records) {
      const { studentId, present } = record;
      if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) continue;
      const student = await Student.findOne({
        $or: [{ _id: studentId }, { userId: studentId }],
      });
      if (!student) continue;

      student.attendance = (student.attendance || []).filter(
        (a) => a.date && a.date.toISOString().split("T")[0] !== dateStr,
      );
      student.attendance.push({ date: targetDate, present: Boolean(present) });
      await student.save();
    }

    res.json({ message: "Attendance recorded successfully", count: records.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/teacher/assignments
router.get("/assignments", protect, requireRole("teacher"), async (req, res) => {
  try {
    const Assignment = require("../models/Assignment");
    const assignments = await Assignment.find({ teacher: req.user.userId }).sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/teacher/assignments
router.post("/assignments", protect, requireRole("teacher"), async (req, res) => {
  try {
    const Assignment = require("../models/Assignment");
    const { title, description, subject, class: cls, dueDate, points } = req.body;
    if (!title || !subject || !cls) {
      return res.status(400).json({ error: "Title, subject and class are required" });
    }
    const assignment = await Assignment.create({
      title,
      description,
      subject,
      class: parseInt(cls, 10),
      teacher: req.user.userId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      points: points ? parseInt(points, 10) : 50,
    });
    res.status(201).json({ assignment });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/teacher/assignments/:id
router.delete("/assignments/:id", protect, requireRole("teacher"), async (req, res) => {
  try {
    const Assignment = require("../models/Assignment");
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user.userId,
    });
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json({ message: "Assignment deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/teacher/assignments/:id/submissions/:subId - Grade a student's submission
router.put(
  "/assignments/:id/submissions/:subId",
  protect,
  requireRole("teacher"),
  async (req, res) => {
    try {
      const Assignment = require("../models/Assignment");
      const Notification = require("../models/Notification");
      const { marks, feedback } = req.body;

      const assignment = await Assignment.findOne({
        _id: req.params.id,
        teacher: req.user.userId,
      });
      if (!assignment)
        return res.status(404).json({ error: "Assignment not found" });

      const sub = assignment.submissions.id(req.params.subId);
      if (!sub)
        return res.status(404).json({ error: "Submission not found" });

      const prevMarks = sub.marks;
      sub.marks = typeof marks === "number" ? marks : parseInt(marks, 10);
      if (typeof feedback === "string") sub.feedback = feedback.trim();

      await assignment.save();

      // If marks were awarded or updated, reward XP delta to the student
      if (sub.student && typeof sub.marks === "number") {
        const deltaXP = sub.marks - (typeof prevMarks === "number" ? prevMarks : 0);
        if (deltaXP > 0) {
          const { awardStudentXP } = require("../services/gamificationService");
          const studentDoc = await awardStudentXP({
            studentId: sub.student,
            xpAmount: deltaXP,
            coinsAmount: Math.floor(deltaXP / 2),
          });
          if (studentDoc?.userId) {
            await Notification.create({
              userId: studentDoc.userId,
              title: "Assignment Graded! 📝",
              body: `Your submission for "${assignment.title}" received ${sub.marks}/${assignment.points || 50} marks! +${deltaXP} XP`,
              type: "assignment",
              url: "/assignments",
            }).catch(() => {});
          }
        }
      }

      res.json({ message: "Submission graded successfully", submission: sub });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

module.exports = router;
