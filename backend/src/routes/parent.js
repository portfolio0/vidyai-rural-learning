const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const Student = require("../models/Student");
const User = require("../models/User");
const Progress = require("../models/Progress");
const QuizResult = require("../models/QuizResult");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");

const average = (rows, pick) => {
  if (!rows.length) return 0;
  return Math.round(rows.reduce((sum, row) => sum + pick(row), 0) / rows.length);
};

router.get("/dashboard", protect, requireRole("parent"), async (req, res) => {
  try {
    const parentId = req.user.userId;
    const children = await Student.find({ parentId }).populate({
      path: "userId",
      select: "name email school lastLogin",
      populate: { path: "school", select: "name district state" },
    });

    const uniqueClasses = [...new Set(children.map((child) => child.class).filter(Boolean))];
    const coursesByClass = new Map();

    await Promise.all(
      uniqueClasses.map(async (classNumber) => {
        const courses = await Course.find({ class: classNumber, isPublished: true }).populate({
          path: "chapters",
          populate: {
            path: "lessons",
            select: "title courseId isPublished createdAt",
          },
        });
        coursesByClass.set(classNumber, courses);
      }),
    );

    const childData = await Promise.all(
      children.map(async (child) => {
        const studentUserId = child.userId?._id || child.userId;
        const progress = await Progress.find({ studentId: studentUserId })
          .populate("lessonId", "title courseId")
          .sort({ updatedAt: -1 });
        const quizzes = await QuizResult.find({ studentId: studentUserId })
          .populate("quizId", "title subject class")
          .sort({ completedAt: -1 });

        const classCourses = coursesByClass.get(child.class) || [];
        const publishedLessons = classCourses.flatMap((course) =>
          (course.chapters || []).flatMap((chapter) =>
            (chapter.lessons || [])
              .filter((lesson) => lesson?.isPublished !== false)
              .map((lesson) => ({
                lessonId: lesson._id.toString(),
                title: lesson.title,
                subject: course.subject,
                courseTitle: course.title,
              })),
          ),
        );

        const lessonSubjectMap = new Map(
          publishedLessons.map((lesson) => [lesson.lessonId, lesson.subject || "General"]),
        );

        const completedLessonRows = progress.filter((row) => row.completed);
        const completedLessonIds = new Set(
          completedLessonRows
            .map((row) => row.lessonId?._id?.toString?.() || row.lessonId?.toString?.())
            .filter(Boolean),
        );

        const avgScore = quizzes.length ? average(quizzes, (row) => row.score || 0) : 0;
        const lessonsCompleted = completedLessonIds.size;
        const totalLessons = publishedLessons.length;
        const lessonsPending = Math.max(totalLessons - lessonsCompleted, 0);
        const completionPct = totalLessons ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

        const attendanceRows = child.attendance || [];
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 6);

        const monthlyAttendanceRows = attendanceRows.filter((row) => row.date && new Date(row.date) >= monthStart);
        const weeklyAttendanceRows = attendanceRows.filter((row) => row.date && new Date(row.date) >= weekStart);
        const attendancePct = attendanceRows.length
          ? Math.round((attendanceRows.filter((row) => row.present).length / attendanceRows.length) * 100)
          : 0;
        const monthlyAttendancePct = monthlyAttendanceRows.length
          ? Math.round((monthlyAttendanceRows.filter((row) => row.present).length / monthlyAttendanceRows.length) * 100)
          : 0;
        const weeklyAttendancePct = weeklyAttendanceRows.length
          ? Math.round((weeklyAttendanceRows.filter((row) => row.present).length / weeklyAttendanceRows.length) * 100)
          : 0;
        const absentDays = monthlyAttendanceRows.filter((row) => row.present === false).length;

        const subjectMap = new Map();
        for (const result of quizzes) {
          const subject = result.quizId?.subject || "General";
          const current = subjectMap.get(subject) || {
            subject,
            totalScore: 0,
            attempts: 0,
            lessonsCompleted: 0,
          };
          current.totalScore += result.score || 0;
          current.attempts += 1;
          subjectMap.set(subject, current);
        }
        for (const row of completedLessonRows) {
          const lessonId = row.lessonId?._id?.toString?.() || row.lessonId?.toString?.();
          const subject = lessonSubjectMap.get(lessonId) || "General";
          const current = subjectMap.get(subject) || {
            subject,
            totalScore: 0,
            attempts: 0,
            lessonsCompleted: 0,
          };
          current.lessonsCompleted += 1;
          subjectMap.set(subject, current);
        }

        const subjectPerformance = [...subjectMap.values()]
          .map((item) => ({
            subject: item.subject,
            avgScore: item.attempts ? Math.round(item.totalScore / item.attempts) : 0,
            attempts: item.attempts,
            lessonsCompleted: item.lessonsCompleted,
            trend:
              item.attempts && item.totalScore / item.attempts >= 70
                ? "strong"
                : "needs-support",
          }))
          .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));

        const weakSubjects = subjectPerformance.filter((item) => item.attempts && item.avgScore < 60).slice(0, 3);
        const strongSubjects = subjectPerformance.filter((item) => item.avgScore >= 70).slice(0, 3);

        const recentQuizzes = quizzes.slice(0, 5).map((quiz) => ({
          title: quiz.quizId?.title || "Quiz",
          subject: quiz.quizId?.subject || "General",
          score: quiz.score || 0,
          completedAt: quiz.completedAt,
        }));

        const quizTrend = quizzes
          .slice(0, 6)
          .reverse()
          .map((quiz, index) => ({
            label: `Q${index + 1}`,
            score: quiz.score || 0,
            subject: quiz.quizId?.subject || "General",
          }));

        const recentActivities = [
          ...quizzes.slice(0, 8).map((quiz) => ({
            type: "quiz",
            title: `${child.userId?.name || "Student"} completed ${quiz.quizId?.title || "a quiz"}`,
            meta: `${quiz.quizId?.subject || "General"} · ${quiz.score || 0}%`,
            date: quiz.completedAt || quiz.createdAt,
          })),
          ...completedLessonRows.slice(0, 8).map((row) => {
            const lessonId = row.lessonId?._id?.toString?.() || row.lessonId?.toString?.();
            return {
              type: "lesson",
              title: `${child.userId?.name || "Student"} completed ${row.lessonId?.title || "a lesson"}`,
              meta: `${lessonSubjectMap.get(lessonId) || "General"} lesson`,
              date: row.completedAt || row.updatedAt || row.createdAt,
            };
          }),
          ...attendanceRows.slice(-8).map((row) => ({
            type: "attendance",
            title: `Attendance marked for ${child.userId?.name || "Student"}`,
            meta: row.present ? "Present" : "Absent",
            date: row.date,
          })),
        ]
          .filter((item) => item.date)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 12);

        const lastActiveDate =
          recentActivities[0]?.date ||
          child.lastActivityDate ||
          child.userId?.lastLogin ||
          null;

        const weeklyLearningActivity = recentActivities.filter(
          (item) => new Date(item.date) >= weekStart && (item.type === "quiz" || item.type === "lesson"),
        ).length;

        const recommendations = [
          ...weakSubjects.map((item) => ({
            title: `Revise ${item.subject}`,
            description: `Recent quiz average is ${item.avgScore}%. Focus on revision and guided practice.`,
          })),
          ...publishedLessons
            .filter((lesson) => !completedLessonIds.has(lesson.lessonId))
            .slice(0, 2)
            .map((lesson) => ({
              title: `Suggested lesson: ${lesson.title}`,
              description: `${lesson.subject} · ${lesson.courseTitle}`,
            })),
        ].slice(0, 4);

        // Fetch real assignments for child's class
        const childAssignments = await Assignment.find({ class: child.class });
        let submittedAssignments = 0;
        let pendingAssignments = 0;
        const teacherFeedback = [];

        for (const a of childAssignments) {
          const sub = (a.submissions || []).find(
            (s) =>
              s.student?.toString() === child._id.toString() ||
              s.student?.toString() === child.userId?._id?.toString()
          );
          if (sub) {
            submittedAssignments++;
            if (sub.feedback) {
              teacherFeedback.push({
                assignmentTitle: a.title,
                subject: a.subject,
                marks: sub.marks,
                maxMarks: a.points || 50,
                feedback: sub.feedback,
                date: sub.submittedAt,
              });
            }
          } else {
            pendingAssignments++;
          }
        }

        return {
          _id: child._id,
          name: child.userId?.name || "Student",
          class: child.class,
          school: child.userId?.school?.name || "School not linked",
          xp: child.xp,
          level: child.level,
          streakCurrent: child.streakCurrent,
          lessonsCompleted,
          lessonsPending,
          completionPct,
          avgQuizScore: avgScore,
          recentQuizzes,
          quizTrend,
          attendancePct,
          monthlyAttendancePct,
          weeklyAttendancePct,
          absentDays,
          attendanceCount: attendanceRows.length,
          lastActiveDate,
          weeklyLearningActivity,
          subjectPerformance,
          strongSubjects,
          weakSubjects,
          recentActivities,
          pendingAssignments,
          submittedAssignments,
          teacherFeedback,
          recommendations,
        };
      }),
    );

    const childrenCount = childData.length;
    const activeStudents = childData.filter((child) =>
      child.lastActiveDate ? new Date(child.lastActiveDate) >= new Date(Date.now() - 14 * 86400000) : false,
    ).length;

    res.json({
      stats: {
        childrenCount,
        activeStudents,
        averagePerformance: average(childData, (child) => child.avgQuizScore || 0),
        attendanceOverview: average(childData, (child) => child.monthlyAttendancePct || 0),
        monthlyAttendancePct: average(childData, (child) => child.monthlyAttendancePct || 0),
        overallCompletionPct: average(childData, (child) => child.completionPct || 0),
        averageQuizScore: average(childData, (child) => child.avgQuizScore || 0),
        pendingAssignments: childData.reduce((sum, child) => sum + (child.pendingAssignments || 0), 0),
        weeklyLearningActivity: childData.reduce((sum, child) => sum + (child.weeklyLearningActivity || 0), 0),
      },
      children: childData,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
