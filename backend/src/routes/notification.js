const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Notification = require("../models/Notification");

// GET /api/notifications - Get all notifications for current user
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      userId: req.user.userId,
      isRead: false,
    });
    res.json({ notifications, unreadCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/notifications/:id/read - Mark one as read
router.patch("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ notification });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
