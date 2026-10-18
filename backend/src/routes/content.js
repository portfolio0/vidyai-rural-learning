const fs = require("fs");
const path = require("path");
const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const { protect, optionalAuth, requireRole } = require("../middleware/auth");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Chapter = require("../models/Chapter");
const Progress = require("../models/Progress");
const {
  LESSON_COMPLETION_THRESHOLD,
  getLessonDurationSeconds,
  updateLessonProgress,
} = require("../services/lessonProgressService");

const {
  validateFileSafety,
  deleteMediaFile,
} = require("../services/storageService");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const uploadRoot = path.join(__dirname, "../../uploads/lessons");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    try {
      validateFileSafety(file);
      cb(null, true);
    } catch (err) {
      cb(new Error(err.message || "Unsupported file type"));
    }
  },
});

const mediaTypeFromFile = (file) => {
  if (!file?.mimetype) return "text";
  if (file.mimetype.startsWith("video/")) return "video";
  if (file.mimetype.startsWith("audio/")) return "audio";
  if (file.mimetype.startsWith("image/")) return "image";
  if (file.mimetype === "application/pdf") return "pdf";
  return "text";
};

const getPublicUrl = (req, fileName) =>
  `${req.protocol}://${req.get("host")}/uploads/lessons/${fileName}`;

const normalizeMediaUrl = (req, rawUrl) => {
  if (!rawUrl) return "";

  const baseOrigin = `${req.protocol}://${req.get("host")}`;

  try {
    const parsed = new URL(rawUrl, baseOrigin);
    if (parsed.pathname.startsWith("/uploads/")) {
      return `${baseOrigin}${parsed.pathname}`;
    }
    return rawUrl;
  } catch (_error) {
    if (typeof rawUrl === "string" && rawUrl.startsWith("/uploads/")) {
      return `${baseOrigin}${rawUrl}`;
    }
    return rawUrl;
  }
};

const serializeLesson = (req, lesson) => {
  const obj = lesson.toObject ? lesson.toObject() : lesson;
  const durationSeconds =
    obj.durationSeconds || getLessonDurationSeconds(obj);
  const mediaUrl = normalizeMediaUrl(
    req,
    obj.mediaUrl ||
      (obj.type !== "text" && obj.content?.startsWith("http") ? obj.content : ""),
  );
  const previewUrl = normalizeMediaUrl(
    req,
    obj.previewUrl ||
      obj.mediaUrl ||
      (obj.type === "text" ? "" : obj.content?.startsWith("http") ? obj.content : ""),
  );
  return {
    ...obj,
    isPublished:
      typeof obj.isPublished === "boolean"
        ? obj.isPublished
        : obj.status === "published",
    status: obj.status || (obj.isPublished ? "published" : "draft"),
    previewUrl,
    contentPreview:
      obj.type === "text"
        ? (obj.content || "").slice(0, 140)
        : obj.mediaName || obj.title,
    mediaUrl,
    durationSeconds,
    duration:
      obj.duration || (durationSeconds ? Math.max(1, Math.round(durationSeconds / 60)) : 0),
    subject: obj.subject || obj.courseId?.subject || "",
    class: obj.class || obj.courseId?.class || null,
    courseTitle: obj.courseTitle || obj.courseId?.title || "",
  };
};

const ensureTeacherOwnsCourse = async (teacherId, courseId) => {
  const course = await Course.findOne({ _id: courseId, teacher: teacherId });
  if (!course) {
    const err = new Error("Course not found");
    err.status = 404;
    throw err;
  }
  return course;
};

const getLessonWithCourse = async (lessonId) =>
  Lesson.findById(lessonId).populate("courseId", "teacher title class subject");

const removeFileIfExists = async (mediaUrl, currentLessonId = null) => {
  if (!mediaUrl) return;

  // If another lesson references this same media file (e.g. cloned lesson), do not delete it
  if (currentLessonId) {
    const duplicateCount = await Lesson.countDocuments({
      _id: { $ne: currentLessonId },
      mediaUrl,
    });
    if (duplicateCount > 0) return;
  }

  await deleteMediaFile(mediaUrl, "lessons");
};

router.get("/courses", optionalAuth, async (req, res) => {
  try {
    const { class: cls, subject, language } = req.query;
    const filter = { isPublished: true };
    if (cls) filter.class = parseInt(cls, 10);
    if (subject) filter.subject = subject;
    if (language) filter.language = language;
    const courses = await Course.find(filter)
      .populate("teacher", "name")
      .sort({ createdAt: -1 });
    res.json({ courses });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/courses/:id", optionalAuth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }
    const course = await Course.findById(req.params.id)
      .populate({
        path: "chapters",
        populate: {
          path: "lessons",
          select:
            "title type duration durationSeconds thumbnail mediaUrl mediaName status isPublished content",
        },
      })
      .populate("teacher", "name avatar");
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json({
      course: {
        ...course.toObject(),
        chapters: (course.chapters || []).map((chapter) => ({
          ...chapter.toObject(),
          lessons: (chapter.lessons || []).map((lesson) => serializeLesson(req, lesson)),
        })),
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/lessons/:id", protect, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        error:
          "Invalid lesson ID. Please navigate to a real lesson from the Subjects page.",
      });
    }
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    ).populate("courseId", "title class subject");
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    const payload = { lesson: serializeLesson(req, lesson) };
    if (req.user?.role === "student") {
      const progress = await Progress.findOne({
        studentId: req.user.userId,
        lessonId: lesson._id,
      });
      payload.progress = progress || null;
      payload.completionThreshold = LESSON_COMPLETION_THRESHOLD;
    }
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/lessons/:id/complete", protect, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: "Invalid lesson ID" });
    }
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    const result = await updateLessonProgress({
      studentId: req.user.userId,
      lessonId: req.params.id,
      completed: !["video", "audio"].includes(lesson.type),
    });
    res.json({
      message: result.completedNow ? "Lesson completed" : "Completion threshold not reached yet",
      xpEarned: result.xpAwarded,
      progress: result.progress,
      completionThreshold: result.completionThreshold,
    });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

router.post("/courses", protect, requireRole("teacher"), async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      teacher: req.user.userId,
    });
    res.status(201).json({ course });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post(
  "/lessons",
  protect,
  requireRole("teacher"),
  upload.single("file"),
  async (req, res) => {
    try {
      const {
        courseId,
        title,
        content = "",
        duration,
        durationSeconds,
        type,
        status,
        isPublished,
      } = req.body;
      if (!courseId || !title) {
        return res.status(400).json({ error: "courseId and title required" });
      }
      if (!isValidId(courseId)) {
        return res.status(400).json({ error: "Invalid courseId" });
      }

      await ensureTeacherOwnsCourse(req.user.userId, courseId);

      let chapter = await Chapter.findOne({ courseId }).sort({ order: 1 });
      if (!chapter) {
        chapter = await Chapter.create({
          courseId,
          title: "Chapter 1",
          order: 1,
        });
        await Course.findByIdAndUpdate(courseId, {
          $push: { chapters: chapter._id },
        });
      }

      const resolvedType =
        type && type !== "auto" ? type : mediaTypeFromFile(req.file);
      const resolvedDurationSeconds = Math.max(
        0,
        Math.round(Number(durationSeconds || 0)),
      );
      const resolvedPublished =
        typeof isPublished === "string"
          ? isPublished === "true"
          : status
            ? status === "published"
            : true;
      const mediaUrl = req.file ? getPublicUrl(req, req.file.filename) : "";
      const lesson = await Lesson.create({
        title,
        content: resolvedType === "text" ? content : content || mediaUrl,
        duration:
          Number(duration || 0) ||
          (resolvedDurationSeconds
            ? Math.max(1, Math.round(resolvedDurationSeconds / 60))
            : 0),
        durationSeconds: resolvedDurationSeconds,
        type: resolvedType,
        chapterId: chapter._id,
        courseId,
        teacher: req.user.userId,
        mediaUrl,
        mediaName: req.file?.originalname || "",
        mediaMimeType: req.file?.mimetype || "",
        mediaSize: req.file?.size || 0,
        status:
          status || (resolvedPublished ? "published" : "draft"),
        isPublished: resolvedPublished,
      });
      await Chapter.findByIdAndUpdate(chapter._id, {
        $push: { lessons: lesson._id },
      });
      res.status(201).json({ lesson: serializeLesson(req, lesson) });
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message });
    }
  },
);

router.put(
  "/lessons/:id",
  protect,
  requireRole("teacher"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      const lesson = await getLessonWithCourse(req.params.id);
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      const ownerId =
        lesson.courseId?.teacher?.toString?.() || lesson.teacher?.toString?.();
      if (ownerId !== req.user.userId) {
        return res.status(403).json({ error: "Not allowed" });
      }

      const updates = {};
      const fields = ["title", "content", "type", "status"];
      for (const field of fields) {
        if (typeof req.body[field] !== "undefined") updates[field] = req.body[field];
      }
      if (typeof req.body.durationSeconds !== "undefined") {
        updates.durationSeconds = Math.max(
          0,
          Math.round(Number(req.body.durationSeconds || 0)),
        );
        updates.duration =
          updates.durationSeconds > 0
            ? Math.max(1, Math.round(updates.durationSeconds / 60))
            : 0;
      } else if (typeof req.body.duration !== "undefined") {
        updates.duration = Math.max(0, Number(req.body.duration || 0));
      }
      if (typeof req.body.isPublished !== "undefined") {
        updates.isPublished = req.body.isPublished === "true" || req.body.isPublished === true;
      }
      if (updates.status) {
        updates.isPublished = updates.status === "published";
      } else if (typeof updates.isPublished === "boolean") {
        updates.status = updates.isPublished ? "published" : "draft";
      }

      if (req.file) {
        await removeFileIfExists(lesson.mediaUrl, lesson._id);
        updates.mediaUrl = getPublicUrl(req, req.file.filename);
        updates.mediaName = req.file.originalname;
        updates.mediaMimeType = req.file.mimetype;
        updates.mediaSize = req.file.size;
        if (!updates.type || updates.type === "auto") {
          updates.type = mediaTypeFromFile(req.file);
        }
        if (!updates.content || updates.type !== "text") {
          updates.content = req.body.content || updates.mediaUrl;
        }
      }

      const updated = await Lesson.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      });
      res.json({ lesson: serializeLesson(req, updated) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

router.post(
  "/lessons/:id/duplicate",
  protect,
  requireRole("teacher"),
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      const lesson = await getLessonWithCourse(req.params.id);
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      const ownerId =
        lesson.courseId?.teacher?.toString?.() || lesson.teacher?.toString?.();
      if (ownerId !== req.user.userId) {
        return res.status(403).json({ error: "Not allowed" });
      }

      const clone = await Lesson.create({
        ...lesson.toObject(),
        _id: undefined,
        title: `${lesson.title} Copy`,
        views: 0,
        completions: 0,
        createdAt: undefined,
        updatedAt: undefined,
      });
      await Chapter.findByIdAndUpdate(lesson.chapterId, {
        $push: { lessons: clone._id },
      });
      res.status(201).json({ lesson: serializeLesson(req, clone) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

router.patch(
  "/lessons/:id/publish",
  protect,
  requireRole("teacher"),
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      const lesson = await getLessonWithCourse(req.params.id);
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      const ownerId =
        lesson.courseId?.teacher?.toString?.() || lesson.teacher?.toString?.();
      if (ownerId !== req.user.userId) {
        return res.status(403).json({ error: "Not allowed" });
      }
      const updated = await Lesson.findByIdAndUpdate(
        req.params.id,
        { isPublished: true, status: "published" },
        { new: true },
      );
      res.json({ lesson: serializeLesson(req, updated) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

router.patch(
  "/lessons/:id/unpublish",
  protect,
  requireRole("teacher"),
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      const lesson = await getLessonWithCourse(req.params.id);
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      const ownerId =
        lesson.courseId?.teacher?.toString?.() || lesson.teacher?.toString?.();
      if (ownerId !== req.user.userId) {
        return res.status(403).json({ error: "Not allowed" });
      }
      const updated = await Lesson.findByIdAndUpdate(
        req.params.id,
        { isPublished: false, status: "draft" },
        { new: true },
      );
      res.json({ lesson: serializeLesson(req, updated) });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

router.delete(
  "/lessons/:id",
  protect,
  requireRole("teacher"),
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      const lesson = await getLessonWithCourse(req.params.id);
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      const ownerId =
        lesson.courseId?.teacher?.toString?.() || lesson.teacher?.toString?.();
      if (ownerId !== req.user.userId) {
        return res.status(403).json({ error: "Not allowed" });
      }
      await removeFileIfExists(lesson.mediaUrl, lesson._id);
      await Chapter.findByIdAndUpdate(lesson.chapterId, {
        $pull: { lessons: lesson._id },
      });
      await Lesson.findByIdAndDelete(lesson._id);
      res.json({ message: "Lesson deleted" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
);

module.exports = router;
