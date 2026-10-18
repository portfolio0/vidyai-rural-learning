const router = require("express").Router();
const ctrl = require("../controllers/aiController");
const { protect, optionalAuth } = require("../middleware/auth");

// Chat — optionalAuth so it works even before login (for testing/guests)
router.post("/chat", optionalAuth, ctrl.chat);

// These require login (need studentId context)
router.post("/quiz-generate", protect, ctrl.generateQuiz);
router.post("/summarize", protect, ctrl.summarizeLesson);
router.get("/weak-topics/:studentId", protect, ctrl.detectWeakTopics);
router.post("/career-guide", protect, ctrl.careerGuide);

module.exports = router;
