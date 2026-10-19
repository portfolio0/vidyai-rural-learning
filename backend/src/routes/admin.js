const router = require("express").Router();
const crypto = require("crypto");
const { protect, requireRole } = require("../middleware/auth");
const User = require("../models/User");
const Course = require("../models/Course");
const QuizResult = require("../models/QuizResult");
const Progress = require("../models/Progress");
const Reel = require("../models/Reel");
const Notification = require("../models/Notification");
const TeacherInvite = require("../models/TeacherInvite");
const emailService = require("../services/emailService");
const { validateEmailDeliverability } = require("../services/emailValidator");

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

// POST /api/admin/invite-teacher
router.post("/invite-teacher", protect, requireRole("admin"), async (req, res) => {
  try {
    const { email, name, school } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Teacher email address is required" });
    }
    const normalizedEmail = email.toLowerCase().trim();

    // 0. Validate that the email has an active domain and is not fake/disposable
    const deliverability = await validateEmailDeliverability(normalizedEmail);
    if (!deliverability.isValid) {
      return res.status(400).json({ error: deliverability.error });
    }

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.role === "teacher") {
        return res.status(409).json({
          error: "A user is already registered as a teacher with this email address.",
        });
      }
      return res.status(409).json({
        error: `An account already exists with this email with role: "${existingUser.role}". You can change their role to Teacher directly in User Management.`,
      });
    }

    // 2. Generate secure 24-byte invite token
    const token = crypto.randomBytes(24).toString("hex");

    // 3. Invalidate previous pending invites for this email
    await TeacherInvite.updateMany(
      { email: normalizedEmail, status: "pending" },
      { status: "revoked" }
    );

    const adminId = req.user?.userId || req.user?._id;
    if (!adminId) {
      return res.status(401).json({ error: "Invalid admin session. Please log in again." });
    }

    // 4. Create new TeacherInvite
    const invite = await TeacherInvite.create({
      email: normalizedEmail,
      token,
      name: name ? name.trim() : "",
      school: school ? school.trim() : "",
      invitedBy: adminId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // 5. Build full invite URL
    const clientUrl =
      process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://vidyai-rural-learning.vercel.app"
        : "http://localhost:3000");
    const inviteUrl = `${clientUrl.replace(/\/$/, "")}/register?invite=${token}`;

    // 6. Dispatch invitation email via Brevo HTTPS API
    let emailSent = false;
    let emailNotice = null;
    let adminName = "School Administrator";
    try {
      const adminDoc = await User.findById(adminId).select("name");
      if (adminDoc?.name) adminName = adminDoc.name;

      await emailService.sendTeacherInvitationEmail({
        to: normalizedEmail,
        name: name ? name.trim() : "Educator",
        inviteUrl,
        schoolName: school ? school.trim() : "",
        adminName,
      });
      emailSent = true;
    } catch (err) {
      emailNotice = err.message;
      console.warn(`[TEACHER-INVITE NOTICE] Email delivery: ${err.message}`);
    }

    res.status(201).json({
      message: emailSent
        ? `Invitation email dispatched to ${normalizedEmail}!`
        : `Invitation created! You can copy and share the invite link directly.`,
      inviteUrl,
      emailSent,
      emailNotice,
      invite: {
        _id: invite._id,
        email: invite.email,
        name: invite.name,
        school: invite.school,
        status: invite.status,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
      },
    });
  } catch (e) {
    console.error("[ADMIN INVITE TEACHER ERROR]", e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/teacher-invites
router.get("/teacher-invites", protect, requireRole("admin"), async (req, res) => {
  try {
    const invites = await TeacherInvite.find()
      .sort({ createdAt: -1 })
      .populate("invitedBy", "name email")
      .populate("usedBy", "name email")
      .limit(50);
    res.json({ invites });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/admin/teacher-invites/:id
router.delete("/teacher-invites/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    const invite = await TeacherInvite.findById(req.params.id);
    if (!invite) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    invite.status = "revoked";
    await invite.save();
    res.json({ message: "Teacher invitation revoked successfully", invite });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

