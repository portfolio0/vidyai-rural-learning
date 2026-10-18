const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const User = require("../models/User");
const Course = require("../models/Course");
const QuizResult = require("../models/QuizResult");
const Progress = require("../models/Progress");
const Reel = require("../models/Reel");
const Notification = require("../models/Notification");

// GET /api/admin/dashboard
router.get("/dashboard", protect, requireRole("admin"), async (req, res) => {
  try {
    const [students, teachers, parents, courses, quizResults, progress] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "teacher" }),
        User.countDocuments({ role: "parent" }),
        Course.countDocuments({ isPublished: true }),
        QuizResult.countDocuments(),
        Progress.countDocuments({ completed: true }),
      ]);

    // Recent registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name role createdAt email phone");

    // Active users (logged in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeCount = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo },
    });
    const totalUsers = students + teachers + parents;
    const activeRate =
      totalUsers > 0 ? Math.round((activeCount / totalUsers) * 100) : 0;

    res.json({
      stats: {
        students,
        teachers,
        parents,
        courses,
        quizResults,
        lessonsCompleted: progress,
        activeRate,
      },
      recentUsers,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/users
router.get("/users", protect, requireRole("admin"), async (req, res) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const filter = role && role !== "all" ? { role } : {};
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-passwordHash");
    const total = await User.countDocuments(filter);
    res.json({ users, total, page: parseInt(page) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", protect, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "teacher", "parent", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-passwordHash");
    res.json({ user: updated, message: "User role updated successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/moderation/reels
router.get("/moderation/reels", protect, requireRole("admin"), async (req, res) => {
  try {
    const reels = await Reel.find()
      .sort({ createdAt: -1 })
      .populate("teacher", "name email");
    res.json({ reels });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/admin/moderation/reels/:id
router.patch("/moderation/reels/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    const { isApproved } = req.body;
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { isApproved: Boolean(isApproved) },
      { new: true }
    );
    res.json({ reel, message: `Reel ${isApproved ? "approved" : "rejected"}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/broadcast
router.post("/broadcast", protect, requireRole("admin"), async (req, res) => {
  try {
    const { title, body, targetRole = "all" } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const userFilter = targetRole !== "all" ? { role: targetRole } : {};
    const recipients = await User.find(userFilter).select("_id");

    const notifs = recipients.map((u) => ({
      userId: u._id,
      title,
      body: body || "",
      type: "announcement",
      url: "/",
    }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    res.json({ message: `Notification broadcast to ${notifs.length} users` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const School = require("../models/School");

// GET /api/admin/schools
router.get("/schools", protect, requireRole("admin"), async (req, res) => {
  try {
    const schools = await School.find().sort({ name: 1 });
    res.json({ schools });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/schools
router.post("/schools", protect, requireRole("admin"), async (req, res) => {
  try {
    const { name, district, state, pincode } = req.body;
    if (!name) return res.status(400).json({ error: "School name is required" });
    const school = await School.create({ name, district, state, pincode });
    res.status(201).json({ school, message: "School created successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
