const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Reel = require('../models/Reel');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/reels');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `reel-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB rural upload limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are supported'), false);
    }
  },
});

// Seed default educational reels if collection is empty
const seedDefaultReelsIfNeeded = async () => {
  const count = await Reel.countDocuments();
  if (count > 0) return;

  let demoTeacher = await User.findOne({ role: 'teacher' });
  if (!demoTeacher) {
    demoTeacher = await User.findOne();
  }
  if (!demoTeacher) return;

  const defaultReels = [
    {
      title: "Mental Math Trick: Multiply by 11 in 2 Seconds",
      subject: "Mathematics",
      class: 6,
      teacher: demoTeacher._id,
      videoUrl: "/uploads/reels/math-trick.mp4",
      duration: 15,
      likes: 42,
      views: 230,
      tags: ["math", "tricks", "speed"],
      isApproved: true,
      feedScore: 95,
    },
    {
      title: "How Photosynthesis Works - 60 Second Science",
      subject: "Science",
      class: 7,
      teacher: demoTeacher._id,
      videoUrl: "/uploads/reels/science-lesson.mp4",
      duration: 30,
      likes: 89,
      views: 512,
      tags: ["science", "biology", "plants"],
      isApproved: true,
      feedScore: 98,
    },
    {
      title: "Common English Mistakes Rural Students Make",
      subject: "English",
      class: 8,
      teacher: demoTeacher._id,
      videoUrl: "/uploads/reels/english-lesson.mp4",
      duration: 45,
      likes: 35,
      views: 180,
      tags: ["english", "grammar", "tips"],
      isApproved: true,
      feedScore: 88,
    },
    {
      title: "Great Maratha Forts & Architecture",
      subject: "Marathi",
      class: 5,
      teacher: demoTeacher._id,
      videoUrl: "/uploads/reels/marathi-history.mp4",
      duration: 50,
      likes: 120,
      views: 890,
      tags: ["history", "marathi", "culture"],
      isApproved: true,
      feedScore: 99,
    },
  ];

  await Reel.insertMany(defaultReels);
};

// GET /api/reels
router.get('/', protect, async (req, res) => {
  try {
    await seedDefaultReelsIfNeeded();
    const { subject, class: cls, page = 1, lowBandwidth } = req.query;
    const filter = { isApproved: true };
    if (subject && subject !== '🔥 Trending') filter.subject = subject;
    if (cls) filter.class = parseInt(cls, 10);

    const isLowBandwidth = lowBandwidth === 'true' || req.headers['save-data'] === 'on';

    const reels = await Reel.find(filter)
      .sort(isLowBandwidth ? { duration: 1, feedScore: -1 } : { feedScore: -1, createdAt: -1 })
      .skip((page - 1) * (isLowBandwidth ? 10 : 20))
      .limit(isLowBandwidth ? 10 : 20)
      .populate('teacher', 'name avatar')
      .lean();

    res.json({ reels, isLowBandwidth });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/reels/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1, views: 1, feedScore: 2 } },
      { new: true }
    );
    res.json({ message: 'Liked', likes: reel?.likes || 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/reels/:id/view
router.post('/:id/view', protect, async (req, res) => {
  try {
    await Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ message: 'View recorded' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/reels (Teacher upload)
router.post(
  '/',
  protect,
  requireRole('teacher', 'admin'),
  upload.single('video'),
  async (req, res) => {
    try {
      let videoUrl = req.body.videoUrl;
      if (req.file) {
        videoUrl = `/uploads/reels/${req.file.filename}`;
      }

      if (!videoUrl) {
        return res.status(400).json({ error: 'Video file or videoUrl is required' });
      }

      const reel = await Reel.create({
        title: req.body.title || 'Educational Short',
        subject: req.body.subject || 'General',
        class: req.body.class ? parseInt(req.body.class) : 5,
        teacher: req.user.userId,
        videoUrl,
        thumbnailUrl: req.body.thumbnailUrl,
        duration: req.body.duration ? parseInt(req.body.duration) : 30,
        tags: req.body.tags ? (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()) : req.body.tags) : [],
        isApproved: true, // Auto-approve for seamless teacher testing & classroom use
        feedScore: 50,
      });

      const populatedReel = await Reel.findById(reel._id).populate('teacher', 'name avatar');
      res.status(201).json({ reel: populatedReel, message: 'Reel published successfully' });
    } catch (e) {
      console.error('[Reel Upload Error]', e);
      res.status(500).json({ error: e.message });
    }
  }
);

// DELETE /api/reels/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ error: 'Reel not found' });

    if (reel.teacher.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this reel' });
    }

    await Reel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reel deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
