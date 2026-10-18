const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const Student = require("../models/Student");
const Progress = require("../models/Progress");
const User = require("../models/User");

router.get("/dashboard", protect, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).populate(
      "userId",
      "name email",
    );
    if (!student)
      return res
        .status(403)
        .json({ error: "Student profile not found. Register as student." });
    res.json({ student });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/leaderboard", protect, async (req, res) => {
  try {
    const me = await Student.findOne({ userId: req.user.userId });
    const cls = me?.class || req.query.class || 5;
    // Top students same class by XP
    const topStudents = await Student.find({ class: parseInt(cls) })
      .sort({ xp: -1 })
      .limit(20)
      .populate("userId", "name");
    const meId = req.user.userId.toString();
    const list = topStudents.map((s, i) => ({
      rank: i + 1,
      name: s.userId?.name || "Student",
      xp: s.xp,
      level: s.level,
      class: s.class,
      me: s.userId?._id?.toString() === meId,
    }));
    res.json({ leaderboard: list, myClass: cls });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/progress", protect, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    const progress = await Progress.find({ studentId: req.user.userId }).limit(
      50,
    );
    res.json({ student, progress });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/profile", protect, async (req, res) => {
  try {
    const { name, language, avatar, class: classInput } = req.body;
    const userUpdates = {};
    if (typeof name === "string" && name.trim()) userUpdates.name = name.trim();
    if (typeof language === "string" && ["en", "mr", "hi"].includes(language))
      userUpdates.language = language;
    if (typeof avatar === "string") userUpdates.avatar = avatar;

    let user = null;
    if (Object.keys(userUpdates).length > 0) {
      user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: userUpdates },
        { new: true },
      ).select("-passwordHash");
    } else {
      user = await User.findById(req.user.userId).select("-passwordHash");
    }

    let student = null;
    let classVal = classInput ? parseInt(classInput, 10) : null;
    if (classVal && (classVal < 1 || classVal > 10)) classVal = null;

    if (req.user.role === "student" || classVal) {
      const studentUpdates = {};
      if (classVal) studentUpdates.class = classVal;
      student = await Student.findOneAndUpdate(
        { userId: req.user.userId },
        { $set: studentUpdates },
        { new: true, upsert: true },
      );
    }

    res.json({ user, student });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/student/assignments - list assignments for student's class
router.get("/assignments", protect, requireRole("student"), async (req, res) => {
  try {
    const Assignment = require("../models/Assignment");
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ error: "Student profile not found" });

    const studentClass = student.class || 5;
    const assignments = await Assignment.find({ class: studentClass })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    const formatted = assignments.map((a) => {
      const sub = (a.submissions || []).find(
        (s) =>
          s.student?.toString() === student._id.toString() ||
          s.student?.toString() === req.user.userId.toString()
      );

      let status = "pending";
      if (sub) {
        status = typeof sub.marks === "number" ? "graded" : "submitted";
      }

      return {
        _id: a._id,
        title: a.title,
        description: a.description,
        subject: a.subject,
        class: a.class,
        teacher: a.teacher?.name || "Teacher",
        dueDate: a.dueDate,
        points: a.points || 50,
        createdAt: a.createdAt,
        status,
        submission: sub
          ? {
              submittedAt: sub.submittedAt,
              submissionText: sub.submissionText,
              fileUrl: sub.fileUrl,
              marks: sub.marks,
              feedback: sub.feedback,
            }
          : null,
      };
    });

    res.json({ assignments: formatted });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/student/assignments/:id/submit - submit homework response
router.post(
  "/assignments/:id/submit",
  protect,
  requireRole("student"),
  async (req, res) => {
    try {
      const Assignment = require("../models/Assignment");
      const { submissionText, fileUrl } = req.body;
      if (!submissionText?.trim() && !fileUrl?.trim()) {
        return res
          .status(400)
          .json({ error: "Submission text or file is required" });
      }

      const student = await Student.findOne({ userId: req.user.userId });
      const user = await User.findById(req.user.userId);
      if (!student)
        return res.status(404).json({ error: "Student profile not found" });

      const assignment = await Assignment.findById(req.params.id);
      if (!assignment)
        return res.status(404).json({ error: "Assignment not found" });

      // Check if already submitted
      const existingIdx = (assignment.submissions || []).findIndex(
        (s) =>
          s.student?.toString() === student._id.toString() ||
          s.student?.toString() === req.user.userId.toString()
      );

      const submissionData = {
        student: student._id,
        studentName: user?.name || "Student",
        submissionText: submissionText ? submissionText.trim() : "",
        fileUrl: fileUrl ? fileUrl.trim() : "",
        submittedAt: new Date(),
      };

      let xpAwarded = 0;
      if (existingIdx >= 0) {
        // Update existing submission if not graded yet
        if (typeof assignment.submissions[existingIdx].marks === "number") {
          return res
            .status(400)
            .json({ error: "Assignment has already been graded and cannot be resubmitted." });
        }
        assignment.submissions[existingIdx].submissionText = submissionData.submissionText;
        assignment.submissions[existingIdx].fileUrl = submissionData.fileUrl;
        assignment.submissions[existingIdx].submittedAt = new Date();
      } else {
        assignment.submissions.push(submissionData);
        xpAwarded = 25; // Initial submission bonus
        student.xp = (student.xp || 0) + xpAwarded;
        student.coins = (student.coins || 0) + 5;
        await student.save();
      }

      await assignment.save();

      res.status(200).json({
        message: "Assignment submitted successfully!",
        xpEarned: xpAwarded,
        assignmentId: assignment._id,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// GET /api/student/badges - get student's badges and all available system badges
router.get("/badges", protect, requireRole("student"), async (req, res) => {
  try {
    const { SYSTEM_BADGES } = require("../services/badgeService");
    const student = await Student.findOne({ userId: req.user.userId }).populate("badges");
    if (!student) return res.status(404).json({ error: "Student profile not found" });

    res.json({
      earnedBadges: student.badges || [],
      systemBadges: SYSTEM_BADGES,
      xp: student.xp,
      level: student.level,
      streak: student.streakCurrent,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Link parent to student (parent provides student's email/phone)
router.post(
  "/link-parent",
  protect,
  requireRole("parent"),
  async (req, res) => {
    try {
      const { studentEmail, studentPhone } = req.body;
      const cleanEmail = studentEmail ? String(studentEmail).trim().toLowerCase() : null;
      const cleanPhone = studentPhone ? String(studentPhone).trim() : null;

      if (!cleanEmail && !cleanPhone) {
        return res.status(400).json({ error: "Please provide the student's email address or registered mobile number." });
      }

      const query = cleanEmail ? { email: cleanEmail } : { phone: cleanPhone };
      const studentUser = await User.findOne({ ...query, role: "student" });
      if (!studentUser) {
        return res.status(404).json({ error: "No student account found with the provided details." });
      }

      const existingStudent = await Student.findOne({ userId: studentUser._id });
      if (!existingStudent) {
        return res.status(404).json({ error: "Student profile not initialized." });
      }

      if (existingStudent.parentId && existingStudent.parentId.toString() !== req.user.userId) {
        return res.status(409).json({
          error: "This student is already linked to a registered parent account. Contact school support to transfer linkage.",
        });
      }

      existingStudent.parentId = req.user.userId;
      await existingStudent.save();

      const Notification = require("../models/Notification");
      await Notification.create({
        userId: studentUser._id,
        title: "Parent Linked 👨‍👩‍👧",
        body: `A parent account has linked with your profile.`,
        type: "announcement",
        url: "/profile",
      }).catch(() => {});

      res.json({ message: "Student linked to your account successfully", student: existingStudent });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

module.exports = router;
