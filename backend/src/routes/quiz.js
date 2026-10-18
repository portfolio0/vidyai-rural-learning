const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const Student = require("../models/Student");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const teacherFilter = (teacherId) => ({
  $or: [{ createdBy: teacherId }, { teacher: teacherId }],
});

router.get("/", protect, async (req, res) => {
  try {
    const { subject, class: cls, mine } = req.query;
    const filter = {};
    if (mine === "true") {
      Object.assign(filter, teacherFilter(req.user.userId));
    } else {
      filter.isPublished = true;
    }
    if (subject) filter.subject = subject;
    if (cls) filter.class = parseInt(cls, 10);
    const quizzes = await Quiz.find(filter)
      .select("-questions.correctIndex")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ quizzes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", protect, requireRole("teacher"), async (req, res) => {
  try {
    const {
      title,
      subject,
      class: cls,
      questions,
      xpReward,
      isPublished,
      duration,
    } = req.body;
    if (!title || !questions?.length) {
      return res.status(400).json({ error: "title and questions required" });
    }
    const quiz = await Quiz.create({
      title,
      subject,
      class: parseInt(cls, 10) || 5,
      questions,
      xpReward: xpReward || 20,
      duration: Number(duration || 600),
      createdBy: req.user.userId,
      teacher: req.user.userId,
      isPublished:
        typeof isPublished === "boolean" ? isPublished : true,
    });
    res.status(201).json({ quiz });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    const query = Quiz.findById(req.params.id);
    const isTeacherOrAdmin =
      req.user?.role === "teacher" || req.user?.role === "admin";
    if (!isTeacherOrAdmin) {
      query.select("-questions.correctIndex -questions.explanation");
    }
    const quiz = await query;
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json({ quiz });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", protect, requireRole("teacher"), async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      ...teacherFilter(req.user.userId),
    });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    const updates = {};
    const fields = [
      "title",
      "subject",
      "questions",
      "xpReward",
      "duration",
      "isPublished",
    ];
    for (const field of fields) {
      if (typeof req.body[field] !== "undefined") updates[field] = req.body[field];
    }
    if (typeof updates.class !== "undefined") {
      updates.class = parseInt(updates.class, 10) || quiz.class || 5;
    } else if (typeof req.body.class !== "undefined") {
      updates.class = parseInt(req.body.class, 10) || quiz.class || 5;
    }
    const updated = await Quiz.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.json({ quiz: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/:id/duplicate", protect, requireRole("teacher"), async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      ...teacherFilter(req.user.userId),
    });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    const copy = await Quiz.create({
      ...quiz.toObject(),
      _id: undefined,
      title: `${quiz.title} Copy`,
      createdBy: req.user.userId,
      teacher: req.user.userId,
      isPublished: false,
      createdAt: undefined,
      updatedAt: undefined,
    });
    res.status(201).json({ quiz: copy });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id/publish", protect, requireRole("teacher"), async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, ...teacherFilter(req.user.userId) },
      { isPublished: true },
      { new: true },
    );
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json({ quiz });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id/unpublish", protect, requireRole("teacher"), async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, ...teacherFilter(req.user.userId) },
      { isPublished: false },
      { new: true },
    );
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json({ quiz });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", protect, requireRole("teacher"), async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      ...teacherFilter(req.user.userId),
    });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    await QuizResult.deleteMany({ quizId: quiz._id });
    res.json({ message: "Quiz deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/:id/submit", protect, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }
    const { answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    let correct = 0;
    const graded = (answers || []).map((a, i) => {
      const question =
        (a.questionId ? quiz.questions.find((q) => q._id.toString() === a.questionId.toString()) : null) ||
        quiz.questions[i];
      const isCorrect = question ? a.chosen === question.correctIndex : false;
      if (isCorrect) correct++;
      return {
        questionId: question?._id || a.questionId,
        chosen: a.chosen,
        correct: isCorrect,
      };
    });
    const totalCount = Math.max(quiz.questions.length, 1);
    const score = Math.round((correct / totalCount) * 100);
    const xpEarned =
      score === 100 ? quiz.xpReward * 2 : score >= 60 ? quiz.xpReward : 0;

    await QuizResult.create({
      studentId: req.user.userId,
      quizId: quiz._id,
      answers: graded,
      score,
      timeTaken,
      xpEarned,
    });

    let newBadges = [];
    const { checkAndAwardBadges } = require("../services/badgeService");
    if (xpEarned > 0) {
      const { awardStudentXP } = require("../services/gamificationService");
      await awardStudentXP({
        studentId: req.user.userId,
        xpAmount: xpEarned,
        coinsAmount: Math.floor(xpEarned / 2),
      });
    }

    if (score >= 100) {
      newBadges = await checkAndAwardBadges(req.user.userId, "quiz_perfect", 100);
    } else {
      newBadges = await checkAndAwardBadges(req.user.userId, "quiz_submit", score);
    }

    res.json({
      score,
      correct,
      total: quiz.questions.length,
      xpEarned,
      answers: graded,
      newBadges,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
