import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/stores";
import api from "../../services/api";

import {
  card,
  SUBJECTS,
  CLASSES,
} from "./components";

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
        overflowY: "hidden",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: wide
            ? "min(780px, calc(100vw - 32px))"
            : "min(560px, calc(100vw - 32px))",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,.2)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            padding: "28px 28px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "20px",
              fontWeight: 800,
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "#F3F4F6",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            padding: "0 28px 28px",
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Inp({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#6B7280",
          display: "block",
          marginBottom: "4px",
        }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "12px",
          border: "2px solid #E5E7EB",
          fontSize: "14px",
          fontFamily: "Nunito,sans-serif",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#6B7280",
          display: "block",
          marginBottom: "4px",
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "12px",
          border: "2px solid #E5E7EB",
          fontSize: "14px",
          fontFamily: "Nunito,sans-serif",
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value || o} value={o.value || o}>
            {o.label || o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  color = "#6C63FF",
  outline = false,
  fullWidth = false,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 24px",
        borderRadius: "40px",
        border: outline ? `2px solid ${color}` : "none",
        background: disabled ? "#E5E7EB" : outline ? "transparent" : color,
        color: disabled ? "#9CA3AF" : outline ? color : "#fff",
        fontWeight: 800,
        fontSize: "14px",
        cursor: disabled ? "not-allowed" : "pointer",
        width: fullWidth ? "100%" : "auto",
        fontFamily: "Nunito,sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function Tag({ children, bg, color }) {
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: "20px",
        padding: "4px 10px",
        fontSize: "11px",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>{icon}</div>
      <div style={{ fontWeight: 700, marginBottom: "8px", color: "#374151" }}>
        {title}
      </div>
      <div style={{ fontSize: "13px", marginBottom: action ? "14px" : 0 }}>
        {description}
      </div>
      {action}
    </div>
  );
}

function confirmTone(kind) {
  if (kind === "danger") return { bg: "#FEE2E2", color: "#DC2626" };
  return { bg: "#FEF9C3", color: "#D97706" };
}

function ConfirmModal({
  title,
  message,
  confirmText,
  onConfirm,
  onClose,
  kind = "danger",
}) {
  const tone = confirmTone(kind);
  return (
    <Modal title={title} onClose={onClose}>
      <div
        style={{
          background: tone.bg,
          color: tone.color,
          borderRadius: "16px",
          padding: "14px 16px",
          fontSize: "14px",
          fontWeight: 700,
          marginBottom: "18px",
        }}
      >
        {message}
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <Btn onClick={onClose} outline color="#6B7280">
          Cancel
        </Btn>
        <Btn
          onClick={onConfirm}
          color={kind === "danger" ? "#EF4444" : "#F59E0B"}
        >
          {confirmText}
        </Btn>
      </div>
    </Modal>
  );
}

function mediaAccept(type) {
  if (type === "video") return "video/*";
  if (type === "audio") return "audio/*";
  if (type === "image") return "image/*";
  if (type === "pdf") return "application/pdf";
  return "video/*,audio/*,image/*,application/pdf";
}

function formatLessonDuration(durationSeconds) {
  const total = Math.max(0, Math.round(durationSeconds || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function readMediaDuration(file, type) {
  if (!file || !["video", "audio"].includes(type)) {
    return Promise.resolve(0);
  }

  return new Promise((resolve, reject) => {
    const media = document.createElement(type);
    const objectUrl = URL.createObjectURL(file);
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      media.removeAttribute("src");
      media.load?.();
    };

    media.preload = "metadata";
    media.onloadedmetadata = () => {
      const duration = Number.isFinite(media.duration)
        ? Math.max(0, Math.round(media.duration))
        : 0;
      cleanup();
      resolve(duration);
    };
    media.onerror = () => {
      cleanup();
      reject(new Error("Unable to read media metadata"));
    };
    media.src = objectUrl;
  });
}

function UploadField({ file, setFile, type, existingUrl, existingName }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return existingUrl || "";
  }, [file, existingUrl]);

  useEffect(() => {
    return () => {
      if (file && previewUrl?.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl);
    };
  }, [file, previewUrl]);

  const onPick = (picked) => {
    if (!picked) return;
    setFile(picked);
  };

  return (
    <div style={{ marginBottom: "14px" }}>
      <label
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#6B7280",
          display: "block",
          marginBottom: "6px",
        }}
      >
        Media Upload
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onPick(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "#6C63FF" : "#D1D5DB"}`,
          background: dragging ? "#EEF0FF" : "#F9FAFB",
          borderRadius: "16px",
          padding: "18px",
          cursor: "pointer",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={mediaAccept(type)}
          style={{ display: "none" }}
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <div style={{ fontWeight: 800, fontSize: "13px", marginBottom: "4px" }}>
          Drag & drop or tap to choose a file
        </div>
        <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
          Supports video, audio, image and PDF on mobile and desktop.
        </div>
        {(file || existingName) && (
          <div
            style={{
              marginTop: "12px",
              background: "#fff",
              borderRadius: "12px",
              padding: "10px 12px",
              fontSize: "12px",
              color: "#374151",
              fontWeight: 700,
            }}
          >
            {file?.name || existingName}
          </div>
        )}
      </div>
      {previewUrl && (
        <div
          style={{
            marginTop: "12px",
            background: "#F9FAFB",
            borderRadius: "16px",
            padding: "12px",
          }}
        >
          {type === "image" && (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "220px",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />
          )}
          {type === "video" && (
            <video
              src={previewUrl}
              controls
              style={{
                width: "100%",
                maxHeight: "220px",
                borderRadius: "12px",
              }}
            />
          )}
          {type === "audio" && (
            <audio src={previewUrl} controls style={{ width: "100%" }} />
          )}
          {type === "pdf" && (
            <div
              style={{ fontSize: "13px", fontWeight: 700, color: "#6C63FF" }}
            >
              PDF ready to upload
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LessonModal({
  courses,
  initialLesson,
  defaultCourseId,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    title: initialLesson?.title || "",
    courseId: initialLesson?.courseId || defaultCourseId || "",
    content: initialLesson?.type === "text" ? initialLesson?.content || "" : "",
    duration: initialLesson?.duration || 0,
    durationSeconds:
      initialLesson?.durationSeconds ||
      (initialLesson?.duration ? initialLesson.duration * 60 : 0),
    type: initialLesson?.type || "text",
    status:
      initialLesson?.status ||
      (initialLesson?.isPublished ? "published" : "draft") ||
      "published",
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [progress, setProgress] = useState(0);

  const set = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (["video", "audio"].includes(form.type)) return;
    setForm((prev) =>
      prev.durationSeconds || prev.duration
        ? { ...prev, durationSeconds: 0, duration: 0 }
        : prev,
    );
  }, [form.type]);

  const handleFileSelect = async (pickedFile) => {
    setErr("");
    setFile(pickedFile);
    if (!pickedFile || !["video", "audio"].includes(form.type)) return;
    try {
      const detectedDuration = await readMediaDuration(pickedFile, form.type);
      setForm((prev) => ({
        ...prev,
        durationSeconds: detectedDuration,
        duration: detectedDuration
          ? Math.max(1, Math.round(detectedDuration / 60))
          : 0,
      }));
    } catch (e) {
      setForm((prev) => ({ ...prev, durationSeconds: 0, duration: 0 }));
      setErr("Unable to read media duration. Choose a valid video or audio file.");
      console.error(e.message);
    }
  };

  const submit = async () => {
    if (!form.title) return setErr("Lesson title is required");
    if (!form.courseId) return setErr("Select a course");
    if (form.type === "text" && !form.content.trim()) {
      return setErr("Add lesson notes for a text lesson");
    }
    if (form.type !== "text" && !file && !initialLesson?.mediaUrl) {
      return setErr("Choose a media file for this lesson type");
    }
    if (["video", "audio"].includes(form.type) && !form.durationSeconds) {
      return setErr("Video/audio duration must be read from the selected file.");
    }

    setSaving(true);
    setErr("");
    setProgress(0);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        payload.append(key, value),
      );
      if (file) payload.append("file", file);

      const req = initialLesson
        ? api.put(`/content/lessons/${initialLesson._id}`, payload, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
              if (evt.total)
                setProgress(Math.round((evt.loaded / evt.total) * 100));
            },
          })
        : api.post("/content/lessons", payload, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
              if (evt.total)
                setProgress(Math.round((evt.loaded / evt.total) * 100));
            },
          });

      await req;
      onSuccess();
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to save lesson");
    }
    setSaving(false);
  };

  return (
    <Modal
      title={initialLesson ? "📝 Edit Lesson" : "📄 Add Lesson"}
      onClose={onClose}
      wide
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "0 16px",
        }}
      >
        <Sel
          label="Course *"
          value={form.courseId}
          onChange={set("courseId")}
          options={[
            { value: "", label: "Select course..." },
            ...courses.map((course) => ({
              value: course._id,
              label: `${course.subject}: ${course.title}`,
            })),
          ]}
        />
        <Sel
          label="Lesson Type"
          value={form.type}
          onChange={set("type")}
          options={[
            { value: "text", label: "Text Lesson" },
            { value: "video", label: "Video Lesson" },
            { value: "pdf", label: "PDF Lesson" },
            { value: "image", label: "Image Lesson" },
            { value: "audio", label: "Audio Lesson" },
          ]}
        />
        <Inp
          label="Lesson Title *"
          value={form.title}
          onChange={set("title")}
          placeholder="e.g. Introduction to Photosynthesis"
        />
      </div>

      {["video", "audio"].includes(form.type) && (
        <div
          style={{
            marginBottom: "14px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#F9FAFB",
            color: "#6B7280",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          Duration is detected automatically from the uploaded file.
          <span style={{ color: "#1F2937", marginLeft: "6px" }}>
            {form.durationSeconds
              ? formatLessonDuration(form.durationSeconds)
              : "Will appear after file selection"}
          </span>
        </div>
      )}

      <Sel
        label="Visibility"
        value={form.status}
        onChange={set("status")}
        options={[
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
        ]}
      />

      {form.type === "text" ? (
        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#6B7280",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Lesson Content / Notes
          </label>
          <textarea
            value={form.content}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, content: e.target.value }))
            }
            rows={6}
            placeholder="Type lesson content, explanation, notes..."
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              fontSize: "14px",
              fontFamily: "Nunito,sans-serif",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>
      ) : (
        <UploadField
          file={file}
          setFile={handleFileSelect}
          type={form.type}
          existingUrl={initialLesson?.mediaUrl}
          existingName={initialLesson?.mediaName}
        />
      )}

      {saving && progress > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              height: "8px",
              background: "#E5E7EB",
              borderRadius: "99px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#6C63FF",
              }}
            />
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "6px" }}>
            Uploading... {progress}%
          </div>
        </div>
      )}

      {err && (
        <div
          style={{ color: "#EF4444", fontSize: "13px", marginBottom: "12px" }}
        >
          {err}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <Btn onClick={onClose} outline color="#6B7280">
          Cancel
        </Btn>
        <Btn onClick={submit} disabled={saving} color="#22C55E">
          {saving ? "Saving..." : initialLesson ? "Save Lesson" : "Add Lesson"}
        </Btn>
      </div>
    </Modal>
  );
}

function CreateCourseModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    subject: "Mathematics",
    class: 5,
    description: "",
    language: "en",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!form.title) return setErr("Title is required");
    setSaving(true);
    setErr("");
    try {
      await api.post("/content/courses", { ...form, isPublished: true });
      onSuccess();
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to create course");
    }
    setSaving(false);
  };

  return (
    <Modal title="📚 Create New Course" onClose={onClose}>
      <Inp
        label="Course Title *"
        value={form.title}
        onChange={set("title")}
        placeholder="e.g. Chapter 3: Photosynthesis"
      />
      <Sel
        label="Subject *"
        value={form.subject}
        onChange={set("subject")}
        options={SUBJECTS}
      />
      <Sel
        label="Class *"
        value={form.class}
        onChange={(value) => set("class")(parseInt(value, 10))}
        options={CLASSES.map((c) => ({ value: c, label: `Class ${c}` }))}
      />
      <Sel
        label="Language"
        value={form.language}
        onChange={set("language")}
        options={[
          { value: "en", label: "English" },
          { value: "mr", label: "Marathi" },
          { value: "hi", label: "Hindi" },
        ]}
      />
      <div style={{ marginBottom: "14px" }}>
        <label
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#6B7280",
            display: "block",
            marginBottom: "4px",
          }}
        >
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          placeholder="What will students learn?"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "12px",
            border: "2px solid #E5E7EB",
            fontSize: "14px",
            fontFamily: "Nunito,sans-serif",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>
      {err && (
        <div
          style={{ color: "#EF4444", fontSize: "13px", marginBottom: "12px" }}
        >
          {err}
        </div>
      )}
      <Btn onClick={save} disabled={saving} fullWidth>
        {saving ? "Creating..." : "Create Course 📚"}
      </Btn>
    </Modal>
  );
}

function QuizModal({ initialQuiz, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: initialQuiz?.title || "",
    subject: initialQuiz?.subject || "Mathematics",
    class: initialQuiz?.class || 5,
    xpReward: initialQuiz?.xpReward || 20,
    isPublished:
      typeof initialQuiz?.isPublished === "boolean"
        ? initialQuiz.isPublished
        : true,
  });
  const [questions, setQuestions] = useState(
    initialQuiz?.questions?.length
      ? initialQuiz.questions.map((q) => ({
          text: q.text || "",
          options: q.options?.length ? q.options : ["", "", "", ""],
          correctIndex: q.correctIndex || 0,
        }))
      : [{ text: "", options: ["", "", "", ""], correctIndex: 0 }],
  );
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [err, setErr] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);

  const set = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      { text: "", options: ["", "", "", ""], correctIndex: 0 },
    ]);
  const setQuestion = (index, key, value) =>
    setQuestions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  const setOption = (qIndex, optionIndex, value) =>
    setQuestions((prev) =>
      prev.map((item, i) =>
        i === qIndex
          ? {
              ...item,
              options: item.options.map((opt, oi) =>
                oi === optionIndex ? value : opt,
              ),
            }
          : item,
      ),
    );
  const removeQuestion = (index) =>
    setQuestions((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
    );

  const save = async () => {
    if (!form.title) return setErr("Quiz title is required");
    if (questions.some((q) => !q.text.trim()))
      return setErr("Every question needs text");
    if (questions.some((q) => q.options.some((opt) => !opt.trim()))) {
      return setErr("Every option must be filled");
    }
    setSaving(true);
    setErr("");
    try {
      const payload = { ...form, questions };
      if (initialQuiz) {
        await api.put(`/quiz/${initialQuiz._id}`, payload);
      } else {
        await api.post("/quiz", payload);
      }
      onSuccess();
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to save quiz");
    }
    setSaving(false);
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim())
      return setErr("Enter a topic to generate AI questions");
    setGenerating(true);
    setErr("");
    try {
      const { data } = await api.post("/ai/quiz-generate", {
        topic: aiTopic,
        subject: form.subject,
        studentClass: form.class,
        count: aiCount,
      });
      if (!data.questions?.length) {
        setErr("AI could not generate questions for this topic");
      } else {
        setQuestions(
          data.questions.map((question) => ({
            text: question.text || "",
            options:
              question.options?.length >= 4
                ? question.options.slice(0, 4)
                : [...(question.options || []), "", "", "", ""].slice(0, 4),
            correctIndex: question.correctIndex || 0,
          })),
        );
      }
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to generate AI quiz");
    }
    setGenerating(false);
  };

  return (
    <Modal
      title={initialQuiz ? "✏️ Edit Quiz" : "✏️ Create Quiz"}
      onClose={onClose}
      wide
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "0 16px",
        }}
      >
        <Inp
          label="Quiz Title *"
          value={form.title}
          onChange={set("title")}
          placeholder="e.g. Chapter 3 Quiz"
        />
        <Sel
          label="Subject"
          value={form.subject}
          onChange={set("subject")}
          options={SUBJECTS}
        />
        <Sel
          label="Class"
          value={form.class}
          onChange={(value) => set("class")(parseInt(value, 10))}
          options={CLASSES.map((c) => ({ value: c, label: `Class ${c}` }))}
        />
        <Inp
          label="XP Reward"
          value={form.xpReward}
          onChange={(value) => set("xpReward")(parseInt(value, 10) || 20)}
          type="number"
        />
      </div>

      <Sel
        label="Visibility"
        value={form.isPublished ? "published" : "draft"}
        onChange={(value) =>
          setForm((prev) => ({ ...prev, isPublished: value === "published" }))
        }
        options={[
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
        ]}
      />

      <div
        style={{
          background: "#EEF0FF",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "15px",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          🤖 AI Quiz Generator
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "0 12px",
            alignItems: "end",
          }}
        >
          <Inp
            label="Topic"
            value={aiTopic}
            onChange={setAiTopic}
            placeholder="e.g. Fractions"
          />
          <Inp
            label="Questions"
            value={aiCount}
            onChange={(value) =>
              setAiCount(Math.max(1, Math.min(10, parseInt(value, 10) || 5)))
            }
            type="number"
          />
        </div>
        <Btn onClick={generateWithAI} disabled={generating} color="#06B6D4">
          {generating ? "Generating..." : "Generate with AI"}
        </Btn>
      </div>

      <div
        style={{
          fontFamily: "Baloo 2,cursive",
          fontSize: "15px",
          fontWeight: 700,
          margin: "16px 0 12px",
        }}
      >
        Questions
      </div>
      {questions.map((question, index) => (
        <div
          key={index}
          style={{
            background: "#F9FAFB",
            borderRadius: "14px",
            padding: "14px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <div
              style={{ fontSize: "12px", fontWeight: 800, color: "#6C63FF" }}
            >
              Q{index + 1}
            </div>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(index)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#EF4444",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Delete
              </button>
            )}
          </div>
          <Inp
            label="Question text *"
            value={question.text}
            onChange={(value) => setQuestion(index, "text", value)}
            placeholder="Enter question..."
          />
          {question.options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <input
                type="radio"
                checked={question.correctIndex === optionIndex}
                onChange={() => setQuestion(index, "correctIndex", optionIndex)}
                style={{ cursor: "pointer" }}
              />
              <input
                value={option}
                onChange={(e) => setOption(index, optionIndex, e.target.value)}
                placeholder={`Option ${"ABCD"[optionIndex]}`}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: `2px solid ${
                    question.correctIndex === optionIndex
                      ? "#22C55E"
                      : "#E5E7EB"
                  }`,
                  fontSize: "13px",
                  fontFamily: "Nunito,sans-serif",
                  outline: "none",
                }}
              />
            </div>
          ))}
        </div>
      ))}
      <Btn onClick={addQuestion} outline color="#6C63FF">
        + Add Question
      </Btn>
      {err && (
        <div style={{ color: "#EF4444", fontSize: "13px", margin: "12px 0" }}>
          {err}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "16px",
        }}
      >
        <Btn onClick={save} disabled={saving} color="#F59E0B">
          {saving ? "Saving..." : initialQuiz ? "Save Quiz" : "Publish Quiz ✏️"}
        </Btn>
      </div>
    </Modal>
  );
}

function TeacherProfile({ user, onSaved }) {
  const updateUser = useAuthStore((state) => state.updateUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    subject: user?.subject || "",
    school: user?.schoolName || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/student/profile", {
        name: form.name,
        phone: form.phone,
        subject: form.subject,
        bio: form.bio,
      });
      updateUser({ ...(data.user || {}), name: form.name, phone: form.phone });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
      onSaved?.();
    } catch (e) {
      console.error(e.message);
    }
    setSaving(false);
  };

  const Field = ({ label, value, keyName, type = "text" }) => (
    <div style={{ marginBottom: "14px" }}>
      <div
        style={{
          fontSize: "12px",
          color: "#9CA3AF",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      {editing ? (
        <input
          value={form[keyName] || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, [keyName]: e.target.value }))
          }
          type={type}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "12px",
            border: "2px solid #E5E7EB",
            fontSize: "14px",
            fontFamily: "Nunito,sans-serif",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            padding: "4px 0",
            color: value ? "#374151" : "#9CA3AF",
          }}
        >
          {value || "Not set"}
        </div>
      )}
    </div>
  );

  return (
    <div style={card}>
      <div
        style={{
          background: "linear-gradient(135deg,#6C63FF,#06B6D4)",
          borderRadius: "16px",
          padding: "28px",
          textAlign: "center",
          marginBottom: "20px",
          color: "#fff",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(255,255,255,.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: 800,
            margin: "0 auto 12px",
          }}
        >
          {user?.name?.[0]?.toUpperCase() || "T"}
        </div>
        <div
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "22px",
            fontWeight: 800,
          }}
        >
          {form.name}
        </div>
        <div style={{ opacity: 0.8, fontSize: "14px", marginTop: "4px" }}>
          👩‍🏫 Teacher · VidyAI
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          👤 My Info
        </div>
        {saved ? (
          <span style={{ color: "#22C55E", fontSize: "13px", fontWeight: 700 }}>
            Saved!
          </span>
        ) : editing ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <Btn onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Btn>
            <Btn onClick={() => setEditing(false)} outline color="#6B7280">
              Cancel
            </Btn>
          </div>
        ) : (
          <Btn onClick={() => setEditing(true)} outline color="#6C63FF">
            Edit Profile
          </Btn>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "0 20px",
        }}
      >
        <Field label="Full Name" value={form.name} keyName="name" />
        <Field label="Email" value={user?.email} keyName="email" />
        <Field label="Mobile" value={form.phone} keyName="phone" type="tel" />
        <Field
          label="School / Institution"
          value={form.school}
          keyName="school"
        />
        <Field label="Primary Subject" value={form.subject} keyName="subject" />
      </div>
      <Field label="Short Bio" value={form.bio} keyName="bio" />
    </div>
  );
}

const flattenLessons = (courses) =>
  courses.flatMap((course) =>
    (course.chapters || []).flatMap((chapter) =>
      (chapter.lessons || []).map((lesson) => ({
        ...lesson,
        courseId: lesson.courseId || course._id,
        courseTitle: course.title,
        courseSubject: course.subject,
        courseClass: course.class,
      })),
    ),
  );

const statGradient = [
  ["#6C63FF", "#6C63FFcc"],
  ["#22C55E", "#22C55Ecc"],
  ["#F59E0B", "#F59E0Bcc"],
  ["#06B6D4", "#06B6D4cc"],
];

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(readTeacherTab(location.search));
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentClassFilter, setStudentClassFilter] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [viewingAssignmentSubmissions, setViewingAssignmentSubmissions] = useState(null);
  const [gradingSubId, setGradingSubId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: "", feedback: "" });
  const [gradingSaving, setGradingSaving] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    subject: "Mathematics",
    class: 5,
    dueDate: "",
    points: 50,
  });
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [markingClass, setMarkingClass] = useState(5);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [attendanceChecklist, setAttendanceChecklist] = useState({});
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  const load = async () => {
    try {
      const [dashRes, assignRes] = await Promise.allSettled([
        api.get("/teacher/dashboard"),
        api.get("/teacher/assignments"),
      ]);
      if (dashRes.status === "fulfilled") {
        const next = dashRes.value.data;
        setData(next);
        setSelectedClass((prev) =>
          prev
            ? next.classes?.find(
                (item) => item.classNumber === prev.classNumber,
              ) || null
            : next.classes?.[0] || null,
        );
      }
      if (assignRes.status === "fulfilled") {
        setAssignments(assignRes.value.data.assignments || []);
      }
    } catch (e) {
      console.error(e.message);
    }
    setLoading(false);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/teacher/assignments", assignmentForm);
      if (res.data?.assignment) {
        setAssignments((prev) => [res.data.assignment, ...prev]);
      }
      setShowAssignmentModal(false);
      setAssignmentForm({
        title: "",
        description: "",
        subject: "Mathematics",
        class: 5,
        dueDate: "",
        points: 50,
      });
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to create assignment");
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      await api.delete(`/teacher/assignments/${id}`);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      if (viewingAssignmentSubmissions?._id === id) {
        setViewingAssignmentSubmissions(null);
      }
    } catch (err) {
      alert("Failed to delete assignment");
    }
  };

  const handleGradeSubmission = async (assignmentId, subId) => {
    if (gradeForm.marks === "" || isNaN(gradeForm.marks)) {
      alert("Please enter a valid marks score");
      return;
    }
    setGradingSaving(true);
    try {
      const res = await api.put(
        `/teacher/assignments/${assignmentId}/submissions/${subId}`,
        {
          marks: Number(gradeForm.marks),
          feedback: gradeForm.feedback || "",
        }
      );
      const updatedMarks = Number(gradeForm.marks);
      const updatedFeedback = gradeForm.feedback || "";
      setAssignments((prev) =>
        prev.map((a) => {
          if (a._id !== assignmentId) return a;
          return {
            ...a,
            submissions: (a.submissions || []).map((s) =>
              s._id === subId
                ? { ...s, marks: updatedMarks, feedback: updatedFeedback }
                : s
            ),
          };
        })
      );
      setViewingAssignmentSubmissions((prev) => {
        if (!prev || prev._id !== assignmentId) return prev;
        return {
          ...prev,
          submissions: (prev.submissions || []).map((s) =>
            s._id === subId
              ? { ...s, marks: updatedMarks, feedback: updatedFeedback }
              : s
          ),
        };
      });
      setGradingSubId(null);
      setGradeForm({ marks: "", feedback: "" });
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to submit evaluation");
    } finally {
      setGradingSaving(false);
    }
  };

  const handleSaveAttendance = async () => {
    setAttendanceSaving(true);
    try {
      const classStudents = students.filter((s) => Number(s.class) === Number(markingClass));
      const records = classStudents.map((s) => ({
        studentId: s._id || s.userId,
        present: attendanceChecklist[s.userId || s._id] ?? true,
      }));
      await api.post("/teacher/attendance", {
        date: attendanceDate,
        records,
      });
      setShowAttendanceModal(false);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save attendance");
    } finally {
      setAttendanceSaving(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const nextTab = readTeacherTab(location.search);
    setTab((prev) => (prev === nextTab ? prev : nextTab));
  }, [location.search]);

  const stats = data?.stats || {};
  const students = data?.students || [];
  const courses = data?.courses || [];
  const quizzes = data?.quizzes || [];
  const classes = data?.classes || [];
  const attendance = data?.attendance || { records: [], byClass: [] };
  const analytics = data?.analytics || {};
  const lessons = useMemo(() => flattenLessons(courses), [courses]);
  const teacherSubject = useMemo(
    () => pickTeacherSubject(user, courses),
    [courses, user],
  );
  const overviewStats = useMemo(
    () =>
      buildTeacherOverviewStats(
        stats,
        analytics,
        attendance,
        classes,
        students,
      ),
    [analytics, attendance, classes, stats, students],
  );
  const recentActivity = analytics.recentActivity || [];

  const filteredStudents =
    studentClassFilter === "all"
      ? students
      : students.filter(
          (student) => String(student.class) === studentClassFilter,
        );

  const openLessonCreate = (courseId = "") =>
    setModal({ type: "lesson", courseId });
  const openLessonEdit = (lesson) => setModal({ type: "lesson", lesson });
  const openQuizEdit = (quiz) => setModal({ type: "quiz", quiz });

  const refreshAndClose = async () => {
    setModal(null);
    await load();
  };

  const runLessonAction = async (url, method = "post") => {
    setBusyId(url);
    try {
      await api[method](url);
      setConfirm(null);
      await load();
    } catch (e) {
      console.error(e.message);
    }
    setBusyId("");
  };

  const runQuizAction = async (url, method = "post") => {
    setBusyId(url);
    try {
      await api[method](url);
      setConfirm(null);
      await load();
    } catch (e) {
      console.error(e.message);
    }
    setBusyId("");
  };

  const TABS = [
    { key: "overview", icon: "📊", label: "Overview" },
    { key: "courses", icon: "📚", label: "Courses" },
    { key: "classes", icon: "🏫", label: "My Classes" },
    { key: "quiz", icon: "✏️", label: "Quizzes" },
    { key: "students", icon: "👦", label: "Students" },
    { key: "attendance", icon: "🗓️", label: "Attendance" },
    { key: "analytics", icon: "📈", label: "Analytics" },
    { key: "profile", icon: "👤", label: "Profile" },
  ];

  const teacherTabs = [
    { key: "overview", icon: "📊", label: "Overview" },
    { key: "courses", icon: "📚", label: "Courses" },
    { key: "classes", icon: "🏫", label: "Classes" },
    { key: "lessons", icon: "📝", label: "Lessons" },
    { key: "quiz", icon: "✏️", label: "Quizzes" },
    { key: "assignments", icon: "📂", label: "Assignments" },
    { key: "students", icon: "👥", label: "Students" },
    { key: "attendance", icon: "🗓️", label: "Attendance" },
    { key: "analytics", icon: "📈", label: "Analytics" },
    { key: "profile", icon: "👤", label: "Profile" },
  ];

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    const search = nextTab === "overview" ? "" : `?tab=${nextTab}`;
    navigate(`/teacher${search}`, { replace: false });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
        Loading...
      </div>
    );
  }

  return (
    <div className="anim-slide-up">
      {modal?.type === "course" && (
        <CreateCourseModal
          onClose={() => setModal(null)}
          onSuccess={refreshAndClose}
        />
      )}
      {modal?.type === "lesson" && (
        <LessonModal
          courses={courses}
          initialLesson={modal.lesson}
          defaultCourseId={modal.courseId}
          onClose={() => setModal(null)}
          onSuccess={refreshAndClose}
        />
      )}
      {modal?.type === "quiz" && (
        <QuizModal
          initialQuiz={modal.quiz}
          onClose={() => setModal(null)}
          onSuccess={refreshAndClose}
        />
      )}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmText={
            busyId === confirm.busyKey ? "Working..." : confirm.confirmText
          }
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
          kind={confirm.kind}
        />
      )}

      <TeacherHero
        teacherName={user?.name}
        subject={teacherSubject}
        stats={overviewStats}
        onCreateCourse={() => setModal({ type: "course" })}
        onCreateLesson={() => openLessonCreate()}
        onCreateQuiz={() => setModal({ type: "quiz" })}
      />

      <div
        style={{
          display: "none",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h1
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "22px",
            fontWeight: 800,
            margin: 0,
          }}
        >
          👩‍🏫 Welcome, {user?.name}!
        </h1>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Btn onClick={() => setModal({ type: "course" })} color="#6C63FF">
            + Course
          </Btn>
          <Btn onClick={() => openLessonCreate()} color="#22C55E">
            + Lesson
          </Btn>
          <Btn onClick={() => setModal({ type: "quiz" })} color="#F59E0B">
            + Quiz
          </Btn>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "4px",
          background: "#F3F4F6",
          borderRadius: "16px",
          padding: "4px",
          marginBottom: "20px",
          overflowX: "auto",
        }}
      >
        {teacherTabs.map((item) => (
          <button
            key={item.key}
            onClick={() => handleTabChange(item.key)}
            style={{
              flex: 1,
              minWidth: "92px",
              padding: "10px 8px",
              borderRadius: "12px",
              border: "none",
              background: tab === item.key ? "#fff" : "transparent",
              color: tab === item.key ? "#6C63FF" : "#6B7280",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow:
                tab === item.key ? "0 2px 8px rgba(0,0,0,.08)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gap: "16px", marginBottom: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: "16px",
            }}
          >
            {overviewStats.cards.map((item, index) => (
              <MetricCard
                key={item.label}
                value={item.value}
                label={item.label}
                icon={item.icon}
                gradient={statGradient[index % statGradient.length]}
              />
            ))}
          </div>

          <QuickActionGrid
            actions={[
              {
                icon: "📚",
                title: "Create Course",
                description: "Start a new course for your class plan.",
                onClick: () => setModal({ type: "course" }),
              },
              {
                icon: "📝",
                title: "Create Lesson",
                description: "Add notes, videos, PDFs, or audio lessons.",
                onClick: () => openLessonCreate(),
              },
              {
                icon: "✏️",
                title: "Create Quiz",
                description: "Build a quiz or generate one with AI.",
                onClick: () => setModal({ type: "quiz" }),
              },
              {
                icon: "📂",
                title: "Create Assignment",
                description: "Open the assignment workspace for reviews.",
                onClick: () => handleTabChange("assignments"),
              },
              {
                icon: "🏫",
                title: "View Classes",
                description: "Open class performance and student lists.",
                onClick: () => handleTabChange("classes"),
              },
              {
                icon: "📈",
                title: "View Analytics",
                description: "Track class scores, weak areas, and trends.",
                onClick: () => handleTabChange("analytics"),
              },
              {
                icon: "🗓️",
                title: "Attendance Reports",
                description: "Review attendance patterns by class.",
                onClick: () => handleTabChange("attendance"),
              },
            ]}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: "16px",
            }}
          >
            <InsightPanel
              title="Class Performance"
              icon="🏫"
              items={[
                {
                  label: "Best Performing Class",
                  value: overviewStats.bestClass
                    ? `Class ${overviewStats.bestClass.classNumber}`
                    : "—",
                  note: overviewStats.bestClass
                    ? `${overviewStats.bestClass.avgQuizScore}% average score`
                    : "No class data yet",
                },
                {
                  label: "Lowest Performing Class",
                  value: overviewStats.lowestClass
                    ? `Class ${overviewStats.lowestClass.classNumber}`
                    : "—",
                  note: overviewStats.lowestClass
                    ? `${overviewStats.lowestClass.avgQuizScore}% average score`
                    : "No class data yet",
                },
                {
                  label: "Average Score",
                  value: `${overviewStats.avgScore}%`,
                  note: "Across recent quiz attempts",
                },
              ]}
            />
            <InsightPanel
              title="Student Progress"
              icon="👥"
              items={[
                {
                  label: "Students At Risk",
                  value: overviewStats.atRiskCount,
                  note: "Learners with the lowest recent quiz averages",
                },
                {
                  label: "Top Performers",
                  value: overviewStats.topPerformerName,
                  note: "Highest XP learner in your current roster",
                },
                {
                  label: "Recent Activity",
                  value: recentActivity.length,
                  note: "Latest lesson, quiz, and attendance updates",
                },
              ]}
            />
            <InsightPanel
              title="Learning Insights"
              icon="💡"
              items={[
                {
                  label: "Weak Topics",
                  value: overviewStats.weakTopicLabel,
                  note: overviewStats.weakTopicNote,
                },
                {
                  label: "Most Completed Lesson",
                  value: overviewStats.topLessonTitle,
                  note: overviewStats.topLessonNote,
                },
                {
                  label: "Quiz Completion Rate",
                  value: `${overviewStats.quizCompletionRate}%`,
                  note: "Share of possible quiz attempts completed",
                },
              ]}
            />
          </div>

          <ClassOverviewGrid
            classes={classes}
            attendanceByClass={attendance.byClass || []}
            onOpenClass={(classNumber) => {
              const nextClass = classes.find(
                (item) => item.classNumber === classNumber,
              );
              if (nextClass) {
                setSelectedClass(nextClass);
                handleTabChange("classes");
              }
            }}
          />

          <ActivityFeed items={recentActivity} />
        </div>
      )}

      {false && tab === "overview" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {[
              [stats.studentCount ?? "—", "Students", "👦"],
              [stats.courseCount ?? "—", "Courses", "📚"],
              [stats.lessonCount ?? "—", "Lessons", "📝"],
              [`${stats.avgCompletion ?? "—"}%`, "Avg Score", "✅"],
            ].map(([value, label, icon], index) => (
              <div
                key={label}
                style={{
                  borderRadius: "20px",
                  padding: "20px",
                  background: `linear-gradient(135deg,${statGradient[index][0]},${statGradient[index][1]})`,
                  color: "#fff",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontFamily: "Baloo 2,cursive",
                    fontSize: "28px",
                    fontWeight: 800,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{ fontSize: "12px", opacity: 0.85, fontWeight: 700 }}
                >
                  {label}
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: "-8px",
                    bottom: "-8px",
                    fontSize: "44px",
                    opacity: 0.15,
                  }}
                >
                  {icon}
                </div>
              </div>
            ))}
          </div>

          <div style={card}>
            <div
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              ⚡ Quick Actions
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
                gap: "10px",
              }}
            >
              {[
                [
                  "📚",
                  "Create Course",
                  "Create a new subject course",
                  () => setModal({ type: "course" }),
                ],
                [
                  "📄",
                  "Add Lesson",
                  "Upload notes or media lessons",
                  () => openLessonCreate(),
                ],
                [
                  "✏️",
                  "Create Quiz",
                  "Make a quiz for students",
                  () => setModal({ type: "quiz" }),
                ],
                [
                  "🏫",
                  "My Classes",
                  "Open class progress and leaderboard",
                  () => setTab("classes"),
                ],
                [
                  "📈",
                  "Analytics",
                  "Track performance and streaks",
                  () => setTab("analytics"),
                ],
              ].map(([icon, title, description, action]) => (
                <div
                  key={title}
                  onClick={action}
                  style={{
                    background: "#F9FAFB",
                    borderRadius: "14px",
                    padding: "14px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "6px" }}>
                    {icon}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "13px" }}>
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9CA3AF",
                      marginTop: "2px",
                    }}
                  >
                    {description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "courses" && (
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              📚 My Courses ({courses.length})
            </div>
            <Btn onClick={() => setModal({ type: "course" })} color="#6C63FF">
              + New Course
            </Btn>
          </div>
          {courses.length === 0 ? (
            <EmptyState
              icon="📚"
              title="No courses yet"
              description="Create your first course to start building lessons."
              action={
                <Btn
                  onClick={() => setModal({ type: "course" })}
                  color="#6C63FF"
                >
                  Create First Course
                </Btn>
              }
            />
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {courses.map((course) => {
                const courseLessons = flattenLessons([course]);
                return (
                  <div
                    key={course._id}
                    style={{
                      border: "1px solid #F3F4F6",
                      borderRadius: "18px",
                      padding: "18px",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "14px",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "15px" }}>
                          {course.title}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#9CA3AF",
                            marginTop: "3px",
                          }}
                        >
                          {course.subject} · Class {course.class} ·{" "}
                          {courseLessons.length} lessons
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Tag
                          bg={course.isPublished ? "#DCFCE7" : "#FEF3C7"}
                          color={course.isPublished ? "#16A34A" : "#D97706"}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </Tag>
                        <Btn
                          onClick={() => openLessonCreate(course._id)}
                          outline
                          color="#6C63FF"
                        >
                          + Lesson
                        </Btn>
                      </div>
                    </div>

                    {courseLessons.length === 0 ? (
                      <div
                        style={{
                          background: "#F9FAFB",
                          borderRadius: "14px",
                          padding: "14px",
                          color: "#9CA3AF",
                          fontSize: "13px",
                        }}
                      >
                        No lessons in this course yet.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: "10px" }}>
                        {courseLessons.map((lesson) => (
                          <div
                            key={lesson._id}
                            style={{
                              background: "#F9FAFB",
                              borderRadius: "14px",
                              padding: "14px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "12px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <div
                                style={{ fontWeight: 800, fontSize: "13px" }}
                              >
                                {lesson.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#9CA3AF",
                                  marginTop: "4px",
                                }}
                              >
                                {lesson.type} · {lesson.duration || 0} min
                                {lesson.contentPreview
                                  ? ` · ${lesson.contentPreview}`
                                  : ""}
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <Tag
                                bg={lesson.isPublished ? "#DCFCE7" : "#FEF3C7"}
                                color={
                                  lesson.isPublished ? "#16A34A" : "#D97706"
                                }
                              >
                                {lesson.isPublished ? "Published" : "Draft"}
                              </Tag>
                              <button
                                onClick={() => openLessonEdit(lesson)}
                                style={miniActionStyle("#6C63FF")}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  runLessonAction(
                                    `/content/lessons/${lesson._id}/duplicate`,
                                  )
                                }
                                style={miniActionStyle("#06B6D4")}
                              >
                                Duplicate
                              </button>
                              <button
                                onClick={() =>
                                  runLessonAction(
                                    `/content/lessons/${lesson._id}/${lesson.isPublished ? "unpublish" : "publish"}`,
                                    "patch",
                                  )
                                }
                                style={miniActionStyle(
                                  lesson.isPublished ? "#F59E0B" : "#22C55E",
                                )}
                              >
                                {lesson.isPublished ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                onClick={() =>
                                  setConfirm({
                                    title: "Delete Lesson",
                                    message: `Delete "${lesson.title}"? This cannot be undone.`,
                                    confirmText: "Delete Lesson",
                                    busyKey: `/content/lessons/${lesson._id}`,
                                    onConfirm: () =>
                                      runLessonAction(
                                        `/content/lessons/${lesson._id}`,
                                        "delete",
                                      ),
                                    kind: "danger",
                                  })
                                }
                                style={miniActionStyle("#EF4444")}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "lessons" && (
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Lessons Workspace ({lessons.length})
            </div>
            <Btn onClick={() => openLessonCreate()} color="#22C55E">
              + New Lesson
            </Btn>
          </div>
          {lessons.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No lessons yet"
              description="Create your first lesson to start building classroom content."
              action={
                <Btn onClick={() => openLessonCreate()} color="#22C55E">
                  Create Lesson
                </Btn>
              }
            />
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  style={{
                    background: "#F9FAFB",
                    borderRadius: "16px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "14px" }}>
                      {lesson.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9CA3AF",
                        marginTop: "4px",
                      }}
                    >
                      {lesson.courseSubject || lesson.subject || "General"} ·
                      Class {lesson.courseClass || lesson.class || "—"} ·{" "}
                      {lesson.type} · {lesson.duration || 0} min
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <Tag
                      bg={lesson.isPublished ? "#DCFCE7" : "#FEF3C7"}
                      color={lesson.isPublished ? "#16A34A" : "#D97706"}
                    >
                      {lesson.isPublished ? "Published" : "Draft"}
                    </Tag>
                    <button
                      onClick={() => openLessonEdit(lesson)}
                      style={miniActionStyle("#6C63FF")}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        runLessonAction(
                          `/content/lessons/${lesson._id}/duplicate`,
                        )
                      }
                      style={miniActionStyle("#06B6D4")}
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() =>
                        runLessonAction(
                          `/content/lessons/${lesson._id}/${lesson.isPublished ? "unpublish" : "publish"}`,
                          "patch",
                        )
                      }
                      style={miniActionStyle(
                        lesson.isPublished ? "#F59E0B" : "#22C55E",
                      )}
                    >
                      {lesson.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() =>
                        setConfirm({
                          title: "Delete Lesson",
                          message: `Delete "${lesson.title}"? This cannot be undone.`,
                          confirmText: "Delete Lesson",
                          busyKey: `/content/lessons/${lesson._id}`,
                          onConfirm: () =>
                            runLessonAction(
                              `/content/lessons/${lesson._id}`,
                              "delete",
                            ),
                          kind: "danger",
                        })
                      }
                      style={miniActionStyle("#EF4444")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "assignments" && (
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Baloo 2,cursive",
                  fontSize: "18px",
                  fontWeight: 800,
                }}
              >
                📂 Assignment Workspace
              </div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                Create and track homework and classroom assignments.
              </div>
            </div>
            <Btn onClick={() => setShowAssignmentModal(true)}>
              ➕ Create Assignment
            </Btn>
          </div>

          {assignments.length === 0 ? (
            <EmptyState
              icon="📂"
              title="No assignments created yet"
              description="Create practice tasks, homework, or weekly challenges for your students."
              action={
                <Btn onClick={() => setShowAssignmentModal(true)}>
                  Create Your First Assignment
                </Btn>
              }
            />
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {assignments.map((a) => (
                <div
                  key={a._id}
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "16px",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                      <Tag bg="#EEF0FF" color="#4F46E5">
                        {a.subject}
                      </Tag>
                      <Tag bg="#FEF3C7" color="#D97706">
                        Class {a.class}
                      </Tag>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#10B981" }}>
                        💎 {a.points || 50} pts
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "15px", color: "#1F2937" }}>
                      {a.title}
                    </div>
                    {a.description && (
                      <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px" }}>
                        {a.description}
                      </div>
                    )}
                    <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "8px" }}>
                      {a.dueDate ? `📅 Due: ${new Date(a.dueDate).toLocaleDateString()}` : "No due date"}
                      {" · "}
                      📥 {a.submissions?.length || 0} Submissions
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      onClick={() => {
                        setViewingAssignmentSubmissions(a);
                        setGradingSubId(null);
                      }}
                      style={{
                        ...miniActionStyle("#6C63FF"),
                        background: "#EEF0FF",
                        color: "#4F46E5",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      📥 Submissions ({a.submissions?.length || 0})
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(a._id)}
                      style={miniActionStyle("#EF4444")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAssignmentModal && (
            <Modal
              title="Create New Assignment"
              onClose={() => setShowAssignmentModal(false)}
            >
              <form onSubmit={handleCreateAssignment}>
                <Inp
                  label="Assignment Title *"
                  value={assignmentForm.title}
                  onChange={(v) => setAssignmentForm({ ...assignmentForm, title: v })}
                  placeholder="e.g. Chapter 4 Math Word Problems"
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Sel
                    label="Subject"
                    value={assignmentForm.subject}
                    onChange={(v) => setAssignmentForm({ ...assignmentForm, subject: v })}
                    options={SUBJECTS}
                  />
                  <Sel
                    label="Class"
                    value={assignmentForm.class}
                    onChange={(v) => setAssignmentForm({ ...assignmentForm, class: Number(v) })}
                    options={CLASSES.map((c) => ({ value: c, label: `Class ${c}` }))}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Inp
                    label="Due Date"
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(v) => setAssignmentForm({ ...assignmentForm, dueDate: v })}
                  />
                  <Inp
                    label="Reward Points"
                    type="number"
                    value={assignmentForm.points}
                    onChange={(v) => setAssignmentForm({ ...assignmentForm, points: Number(v) })}
                  />
                </div>
                <Inp
                  label="Instructions / Description"
                  value={assignmentForm.description}
                  onChange={(v) => setAssignmentForm({ ...assignmentForm, description: v })}
                  placeholder="Describe homework tasks or exercise questions..."
                />
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
                  <Btn outline onClick={() => setShowAssignmentModal(false)}>
                    Cancel
                  </Btn>
                  <Btn type="submit">
                    Publish Assignment
                  </Btn>
                </div>
              </form>
            </Modal>
          )}

          {viewingAssignmentSubmissions && (
            <Modal
              title={`Submissions: ${viewingAssignmentSubmissions.title}`}
              onClose={() => {
                setViewingAssignmentSubmissions(null);
                setGradingSubId(null);
              }}
              wide={true}
            >
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #E5E7EB",
                  paddingBottom: "12px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ fontSize: "13px", color: "#6B7280" }}>
                  Subject: <strong>{viewingAssignmentSubmissions.subject}</strong> · Class: <strong>{viewingAssignmentSubmissions.class}</strong> · Max Marks: <strong>{viewingAssignmentSubmissions.points || 50}</strong>
                </div>
                <Tag bg="#EEF0FF" color="#4F46E5">
                  {viewingAssignmentSubmissions.submissions?.length || 0} Total Submissions
                </Tag>
              </div>

              {(!viewingAssignmentSubmissions.submissions || viewingAssignmentSubmissions.submissions.length === 0) ? (
                <EmptyState
                  icon="📝"
                  title="No submissions received yet"
                  description="Students in this class have not turned in work for this assignment yet."
                />
              ) : (
                <div style={{ display: "grid", gap: "14px", maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
                  {viewingAssignmentSubmissions.submissions.map((sub) => {
                    const isGraded = typeof sub.marks === "number";
                    const isGradingThis = gradingSubId === sub._id;
                    return (
                      <div
                        key={sub._id}
                        style={{
                          border: isGraded ? "1px solid #10B98144" : "1px solid #F59E0B66",
                          background: isGraded ? "#F0FDF4" : "#FFFBEB",
                          borderRadius: "12px",
                          padding: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "8px",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 800, fontSize: "15px", color: "#1F2937" }}>
                              👤 {sub.studentName || "Student"}
                            </span>
                            <span style={{ fontSize: "11px", color: "#6B7280", marginLeft: "10px" }}>
                              🕒 {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "Recently"}
                            </span>
                          </div>
                          <div>
                            {isGraded ? (
                              <span style={{ background: "#DCFCE7", color: "#166534", padding: "4px 10px", borderRadius: "999px", fontWeight: 700, fontSize: "12px" }}>
                                ✅ Graded: {sub.marks} / {viewingAssignmentSubmissions.points || 50} pts
                              </span>
                            ) : (
                              <span style={{ background: "#FEF3C7", color: "#92400E", padding: "4px 10px", borderRadius: "999px", fontWeight: 700, fontSize: "12px" }}>
                                ⏳ Needs Evaluation
                              </span>
                            )}
                          </div>
                        </div>

                        {sub.submissionText && (
                          <div
                            style={{
                              background: "#FFFFFF",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #E5E7EB",
                              margin: "8px 0",
                              fontSize: "13px",
                              color: "#374151",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            <div style={{ fontWeight: 700, marginBottom: "4px", color: "#4B5563" }}>Student Response:</div>
                            {sub.submissionText}
                          </div>
                        )}

                        {sub.fileUrl && (
                          <div style={{ margin: "8px 0" }}>
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: "12px",
                                color: "#4F46E5",
                                textDecoration: "underline",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontWeight: 700,
                              }}
                            >
                              📎 View Attached File / Link
                            </a>
                          </div>
                        )}

                        {isGraded && !isGradingThis && (
                          <div style={{ marginTop: "8px", fontSize: "13px", color: "#065F46" }}>
                            <strong>Feedback:</strong> {sub.feedback || "Good job!"}
                            <div style={{ marginTop: "6px" }}>
                              <button
                                onClick={() => {
                                  setGradingSubId(sub._id);
                                  setGradeForm({ marks: sub.marks, feedback: sub.feedback || "" });
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#4F46E5",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  textDecoration: "underline",
                                  padding: 0,
                                  fontWeight: 700,
                                }}
                              >
                                ✏️ Edit Grade / Feedback
                              </button>
                            </div>
                          </div>
                        )}

                        {(!isGraded || isGradingThis) && (
                          <div
                            style={{
                              marginTop: "12px",
                              background: "#FFFFFF",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                              padding: "12px",
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px", color: "#1F2937" }}>
                              {isGraded ? "Edit Evaluation" : "Evaluate & Award Marks"}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "10px", alignItems: "center" }}>
                              <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4B5563", marginBottom: "4px" }}>
                                  Marks (Max {viewingAssignmentSubmissions.points || 50})
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={viewingAssignmentSubmissions.points || 50}
                                  value={isGradingThis ? gradeForm.marks : ""}
                                  onChange={(e) => {
                                    if (!isGradingThis) {
                                      setGradingSubId(sub._id);
                                      setGradeForm({ marks: e.target.value, feedback: sub.feedback || "" });
                                    } else {
                                      setGradeForm({ ...gradeForm, marks: e.target.value });
                                    }
                                  }}
                                  placeholder={`0-${viewingAssignmentSubmissions.points || 50}`}
                                  style={{
                                    width: "100%",
                                    padding: "7px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid #D1D5DB",
                                    fontSize: "13px",
                                    boxSizing: "border-box",
                                  }}
                                />
                              </div>
                              <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#4B5563", marginBottom: "4px" }}>
                                  Teacher Feedback Note
                                </label>
                                <input
                                  type="text"
                                  value={isGradingThis ? gradeForm.feedback : ""}
                                  onChange={(e) => {
                                    if (!isGradingThis) {
                                      setGradingSubId(sub._id);
                                      setGradeForm({ marks: sub.marks || "", feedback: e.target.value });
                                    } else {
                                      setGradeForm({ ...gradeForm, feedback: e.target.value });
                                    }
                                  }}
                                  placeholder="e.g. Well done! Correct method applied."
                                  style={{
                                    width: "100%",
                                    padding: "7px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid #D1D5DB",
                                    fontSize: "13px",
                                    boxSizing: "border-box",
                                  }}
                                />
                              </div>
                            </div>
                            {isGradingThis && (
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "10px" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGradingSubId(null);
                                    setGradeForm({ marks: "", feedback: "" });
                                  }}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #D1D5DB",
                                    background: "#F3F4F6",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Cancel
                                </button>
                                <Btn
                                  onClick={() =>
                                    handleGradeSubmission(
                                      viewingAssignmentSubmissions._id,
                                      sub._id
                                    )
                                  }
                                  disabled={gradingSaving || gradeForm.marks === ""}
                                >
                                  {gradingSaving ? "Saving..." : "Save Grade & Award XP"}
                                </Btn>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Modal>
          )}
        </div>
      )}

      {tab === "classes" && (
        <div style={{ display: "grid", gap: "16px" }}>
          <ClassOverviewGrid
            classes={classes}
            attendanceByClass={attendance.byClass || []}
            onOpenClass={(classNumber) => {
              const nextClass = classes.find(
                (item) => item.classNumber === classNumber,
              );
              if (nextClass) setSelectedClass(nextClass);
            }}
          />

          {selectedClass && (
            <div style={card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "Baloo 2,cursive",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    Class {selectedClass.classNumber} Details
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      marginTop: "4px",
                    }}
                  >
                    Review learners, completion, and attendance together.
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Tag bg="#DCFCE7" color="#16A34A">
                    Quiz {selectedClass.avgQuizScore || 0}%
                  </Tag>
                  <Tag bg="#FFF7ED" color="#F97316">
                    Lessons {selectedClass.lessonsCompleted || 0}
                  </Tag>
                  <Tag bg="#E0F2FE" color="#0284C7">
                    {findAttendancePct(
                      attendance.byClass || [],
                      selectedClass.classNumber,
                    )}
                    % attendance
                  </Tag>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                  gap: "16px",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "2px solid #F3F4F6" }}>
                        {[
                          "Student Name",
                          "Attendance",
                          "Lessons",
                          "Quiz Score",
                          "Completed Lessons",
                        ].map((head) => (
                          <th
                            key={head}
                            style={{
                              textAlign: "left",
                              padding: "8px 12px",
                              color: "#9CA3AF",
                              fontWeight: 700,
                            }}
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClass.students.map((student) => (
                        <tr
                          key={student._id}
                          style={{ borderBottom: "1px solid #F9FAFB" }}
                        >
                          <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                            {student.name}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {student.attendanceCount || 0} records
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {student.lessonsCompleted}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {student.avgQuizScore || 0}%
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {student.completedLessons || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    background: "#F9FAFB",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Baloo 2,cursive",
                      fontSize: "15px",
                      fontWeight: 700,
                      marginBottom: "12px",
                    }}
                  >
                    Top Learners In This Class
                  </div>
                  {selectedClass.students?.length ? (
                    [...selectedClass.students]
                      .sort(
                        (a, b) => (b.avgQuizScore || 0) - (a.avgQuizScore || 0),
                      )
                      .slice(0, 5)
                      .map((student, index) => (
                        <div
                          key={student._id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom: "1px solid #EEF2F7",
                            fontSize: "13px",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800 }}>
                              {index + 1}. {student.name}
                            </div>
                            <div style={{ color: "#9CA3AF", fontSize: "11px" }}>
                              {student.lessonsCompleted || 0} lessons ·{" "}
                              {student.completedLessons || 0} completed
                            </div>
                          </div>
                          <div style={{ color: "#6C63FF", fontWeight: 800 }}>
                            {student.avgQuizScore || 0}%
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ color: "#9CA3AF", fontSize: "13px" }}>
                      No top-learner data yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {false && tab === "classes" && (
        <div style={{ display: "grid", gap: "16px" }}>
          <div style={card}>
            <div
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              🏫 My Classes ({classes.length})
            </div>
            {classes.length === 0 ? (
              <EmptyState
                icon="🏫"
                title="No classes assigned yet"
                description="Classes appear from your current course coverage."
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                  gap: "12px",
                }}
              >
                {classes.map((item) => (
                  <div
                    key={item.classNumber}
                    onClick={() => setSelectedClass(item)}
                    style={{
                      background:
                        selectedClass?.classNumber === item.classNumber
                          ? "#EEF0FF"
                          : "#F9FAFB",
                      border:
                        selectedClass?.classNumber === item.classNumber
                          ? "2px solid #6C63FF"
                          : "2px solid transparent",
                      borderRadius: "16px",
                      padding: "16px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: "15px",
                        marginBottom: "6px",
                      }}
                    >
                      Class {item.classNumber}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9CA3AF",
                        marginBottom: "10px",
                      }}
                    >
                      {item.studentCount} students
                    </div>
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      <Tag bg="#DCFCE7" color="#16A34A">
                        Quiz {item.avgQuizScore || 0}%
                      </Tag>
                      <Tag bg="#E0F2FE" color="#0284C7">
                        {findAttendancePct(
                          attendance.byClass || [],
                          item.classNumber,
                        )}
                        % attendance
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedClass && (
            <div style={card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "Baloo 2,cursive",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    📘 Class {selectedClass.classNumber} Details
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      marginTop: "4px",
                    }}
                  >
                    Progress, attendance, and student performance in one place.
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Tag bg="#DCFCE7" color="#16A34A">
                    Quiz {selectedClass.avgQuizScore || 0}%
                  </Tag>
                  <Tag bg="#FFF7ED" color="#F97316">
                    Lessons {selectedClass.lessonsCompleted || 0}
                  </Tag>
                  <Tag bg="#E0F2FE" color="#0284C7">
                    {findAttendancePct(
                      attendance.byClass || [],
                      selectedClass.classNumber,
                    )}
                    % attendance
                  </Tag>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr",
                  gap: "16px",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "2px solid #F3F4F6" }}>
                        {[
                          "Student Name",
                          "Attendance",
                          "Lessons",
                          "Quiz Score",
                          "Progress",
                        ].map((head) => (
                          <th
                            key={head}
                            style={{
                              textAlign: "left",
                              padding: "8px 12px",
                              color: "#9CA3AF",
                              fontWeight: 700,
                            }}
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClass.students.map((student) => (
                        <tr
                          key={student._id}
                          style={{ borderBottom: "1px solid #F9FAFB" }}
                        >
                          <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                            {student.name}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#6C63FF",
                              fontWeight: 800,
                            }}
                          >
                            ⭐ {student.xp}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            Lv.{student.level}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {student.lessonsCompleted}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {student.avgQuizScore || 0}%
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            🔥 {student.streak || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    background: "#F9FAFB",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Baloo 2,cursive",
                      fontSize: "15px",
                      fontWeight: 700,
                      marginBottom: "12px",
                    }}
                  >
                    🏆 Class Leaderboard
                  </div>
                  {selectedClass.leaderboard?.length ? (
                    selectedClass.leaderboard.map((student) => (
                      <div
                        key={student.rank}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 0",
                          borderBottom: "1px solid #EEF2F7",
                          fontSize: "13px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800 }}>
                            {student.rank}. {student.name}
                          </div>
                          <div style={{ color: "#9CA3AF", fontSize: "11px" }}>
                            Lv.{student.level} · 🔥 {student.streak || 0}
                          </div>
                        </div>
                        <div style={{ color: "#6C63FF", fontWeight: 800 }}>
                          ⭐ {student.xp}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "#9CA3AF", fontSize: "13px" }}>
                      No leaderboard data yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "quiz" && (
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              ✏️ My Quizzes ({quizzes.length})
            </div>
            <Btn onClick={() => setModal({ type: "quiz" })} color="#F59E0B">
              + New Quiz
            </Btn>
          </div>

          {quizzes.length === 0 ? (
            <EmptyState
              icon="✏️"
              title="No quizzes yet"
              description="Create your first quiz for students."
            />
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 0",
                  borderBottom: "1px solid #F3F4F6",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: "14px" }}>
                    {quiz.title}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      marginTop: "4px",
                    }}
                  >
                    {quiz.subject} · Class {quiz.class} ·{" "}
                    {quiz.questions?.length || 0} questions · +
                    {quiz.xpReward || 20} XP
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <Tag
                    bg={quiz.isPublished ? "#DCFCE7" : "#FEF3C7"}
                    color={quiz.isPublished ? "#16A34A" : "#D97706"}
                  >
                    {quiz.isPublished ? "Live" : "Draft"}
                  </Tag>
                  <button
                    onClick={() => openQuizEdit(quiz)}
                    style={miniActionStyle("#6C63FF")}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => runQuizAction(`/quiz/${quiz._id}/duplicate`)}
                    style={miniActionStyle("#06B6D4")}
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() =>
                      runQuizAction(
                        `/quiz/${quiz._id}/${quiz.isPublished ? "unpublish" : "publish"}`,
                        "patch",
                      )
                    }
                    style={miniActionStyle(
                      quiz.isPublished ? "#F59E0B" : "#22C55E",
                    )}
                  >
                    {quiz.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() =>
                      setConfirm({
                        title: "Delete Quiz",
                        message: `Delete "${quiz.title}"? Existing attempts will also be removed.`,
                        confirmText: "Delete Quiz",
                        busyKey: `/quiz/${quiz._id}`,
                        onConfirm: () =>
                          runQuizAction(`/quiz/${quiz._id}`, "delete"),
                        kind: "danger",
                      })
                    }
                    style={miniActionStyle("#EF4444")}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "students" && (
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Student Monitor ({filteredStudents.length})
            </div>
            <select
              value={studentClassFilter}
              onChange={(e) => setStudentClassFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "2px solid #E5E7EB",
                fontSize: "13px",
                fontFamily: "Nunito,sans-serif",
              }}
            >
              <option value="all">All Classes</option>
              {classes.map((item) => (
                <option key={item.classNumber} value={String(item.classNumber)}>
                  Class {item.classNumber}
                </option>
              ))}
            </select>
          </div>
          {filteredStudents.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No students available"
              description="Students will appear here once your classes have enrolled learners."
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #F3F4F6" }}>
                    {[
                      "Student",
                      "Class",
                      "Lesson Progress",
                      "Quiz Average",
                      "Attendance Records",
                      "Completed Lessons",
                    ].map((head) => (
                      <th
                        key={head}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          color: "#9CA3AF",
                          fontWeight: 700,
                        }}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      style={{ borderBottom: "1px solid #F9FAFB" }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                        {student.name}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        Class {student.class}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {student.lessonsCompleted}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {student.avgQuizScore || 0}%
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {student.attendanceCount || 0}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {student.completedLessons || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {false && tab === "students" && (
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              👦 Student Monitor ({filteredStudents.length})
            </div>
            <select
              value={studentClassFilter}
              onChange={(e) => setStudentClassFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                border: "2px solid #E5E7EB",
                fontSize: "13px",
                fontFamily: "Nunito,sans-serif",
              }}
            >
              <option value="all">All Classes</option>
              {classes.map((item) => (
                <option key={item.classNumber} value={String(item.classNumber)}>
                  Class {item.classNumber}
                </option>
              ))}
            </select>
          </div>
          {filteredStudents.length === 0 ? (
            <EmptyState
              icon="👦"
              title="No students available"
              description="Students will appear here once your classes have enrolled learners."
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #F3F4F6" }}>
                    {[
                      "Student",
                      "Class",
                      "Lessons",
                      "Quiz Score",
                      "Streak",
                      "XP",
                      "Level",
                    ].map((head) => (
                      <th
                        key={head}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          color: "#9CA3AF",
                          fontWeight: 700,
                        }}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      style={{ borderBottom: "1px solid #F9FAFB" }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                        {student.name}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        Class {student.class}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {student.lessonsCompleted}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {student.avgQuizScore || 0}%
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        🔥 {student.streak || 0}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontWeight: 800,
                          color: "#6C63FF",
                        }}
                      >
                        ⭐ {student.xp}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        Lv.{student.level}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "attendance" && (
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Baloo 2,cursive",
                  fontSize: "18px",
                  fontWeight: 800,
                }}
              >
                🗓️ Attendance Tracking
              </div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                Record daily attendance and review student consistency.
              </div>
            </div>
            <Btn onClick={() => setShowAttendanceModal(true)}>
              ➕ Mark Attendance
            </Btn>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            {(attendance.byClass || []).map((item) => (
              <div
                key={item.classNumber}
                style={{
                  background: "#F9FAFB",
                  borderRadius: "16px",
                  padding: "14px",
                }}
              >
                <div style={{ fontWeight: 800 }}>Class {item.classNumber}</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9CA3AF",
                    marginTop: "4px",
                  }}
                >
                  {item.sessions} records
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    color: "#16A34A",
                    fontWeight: 800,
                  }}
                >
                  {item.attendancePct || 0}% present
                </div>
              </div>
            ))}
          </div>
          {(attendance.records || []).length === 0 ? (
            <EmptyState
              icon="🗓️"
              title="No attendance records yet"
              description="Attendance reporting will appear as soon as student attendance is recorded."
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #F3F4F6" }}>
                    {["Student", "Class", "Date", "Status"].map((head) => (
                      <th
                        key={head}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          color: "#9CA3AF",
                          fontWeight: 700,
                        }}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendance.records.map((row, index) => (
                    <tr
                      key={`${row.studentId}-${index}`}
                      style={{ borderBottom: "1px solid #F9FAFB" }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                        {row.name}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        Class {row.class}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {row.date
                          ? new Date(row.date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <Tag
                          bg={row.present ? "#DCFCE7" : "#FEE2E2"}
                          color={row.present ? "#16A34A" : "#DC2626"}
                        >
                          {row.present ? "Present" : "Absent"}
                        </Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showAttendanceModal && (
            <Modal
              title="Mark Student Attendance"
              onClose={() => setShowAttendanceModal(false)}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <Sel
                  label="Select Class"
                  value={markingClass}
                  onChange={(v) => setMarkingClass(Number(v))}
                  options={CLASSES.map((c) => ({
                    value: c,
                    label: `Class ${c}`,
                  }))}
                />
                <Inp
                  label="Attendance Date"
                  type="date"
                  value={attendanceDate}
                  onChange={(v) => setAttendanceDate(v)}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  Students in Class {markingClass} (
                  {
                    students.filter(
                      (s) => Number(s.class) === Number(markingClass),
                    ).length
                  }
                  )
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allPresent = {};
                    students
                      .filter((s) => Number(s.class) === Number(markingClass))
                      .forEach((s) => {
                        allPresent[s.userId || s._id] = true;
                      });
                    setAttendanceChecklist(allPresent);
                  }}
                  style={{
                    background: "#DCFCE7",
                    color: "#16A34A",
                    border: "none",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ✓ Mark All Present
                </button>
              </div>

              <div
                style={{
                  maxHeight: "280px",
                  overflowY: "auto",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  marginBottom: "16px",
                }}
              >
                {students.filter(
                  (s) => Number(s.class) === Number(markingClass),
                ).length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#9CA3AF",
                      fontSize: "13px",
                    }}
                  >
                    No students enrolled in Class {markingClass} yet.
                  </div>
                ) : (
                  students
                    .filter((s) => Number(s.class) === Number(markingClass))
                    .map((s) => {
                      const id = s.userId || s._id;
                      const isPresent = attendanceChecklist[id] ?? true;
                      return (
                        <div
                          key={id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom: "1px solid #F3F4F6",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "13px" }}>
                              {s.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                              XP: {s.xp} · Level {s.level}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setAttendanceChecklist((prev) => ({
                                ...prev,
                                [id]: !isPresent,
                              }))
                            }
                            style={{
                              background: isPresent ? "#DCFCE7" : "#FEE2E2",
                              color: isPresent ? "#16A34A" : "#DC2626",
                              border: "none",
                              borderRadius: "20px",
                              padding: "4px 12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {isPresent ? "✓ Present" : "✕ Absent"}
                          </button>
                        </div>
                      );
                    })
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <Btn outline onClick={() => setShowAttendanceModal(false)}>
                  Cancel
                </Btn>
                <Btn
                  onClick={handleSaveAttendance}
                  disabled={
                    attendanceSaving ||
                    students.filter(
                      (s) => Number(s.class) === Number(markingClass),
                    ).length === 0
                  }
                >
                  {attendanceSaving ? "Saving..." : "Save Attendance"}
                </Btn>
              </div>
            </Modal>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div style={{ display: "grid", gap: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "16px",
            }}
          >
            <AnalyticsCard
              title="Average Score"
              value={`${overviewStats.avgScore}%`}
              caption="Across recent teacher-linked quiz attempts"
              color="#F59E0B"
              icon="📈"
            />
            <AnalyticsCard
              title="Average Attendance"
              value={`${overviewStats.avgAttendance}%`}
              caption="Average attendance across assigned classes"
              color="#14B8A6"
              icon="🗓️"
            />
            <AnalyticsCard
              title="Active Quizzes"
              value={overviewStats.activeQuizzes}
              caption="Published quizzes currently available"
              color="#6C63FF"
              icon="✏️"
            />
            <AnalyticsCard
              title="Published Lessons"
              value={overviewStats.publishedLessons}
              caption="Lessons currently visible to students"
              color="#22C55E"
              icon="📝"
            />
            <AnalyticsCard
              title="Average Watch %"
              value={`${analytics.lessonAnalytics?.averageWatchPct || 0}%`}
              caption="Actual watch progress across started lessons"
              color="#EC4899"
              icon="🎥"
            />
            <AnalyticsCard
              title="Drop-off Rate"
              value={`${analytics.lessonAnalytics?.dropOffRate || 0}%`}
              caption="Students who started but did not complete"
              color="#0EA5E9"
              icon="📉"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: "16px",
            }}
          >
            <AnalyticsList
              title="Top Performers"
              items={analytics.topPerformers}
              emptyLabel="No top performers yet."
              renderMeta={(item) =>
                `Quiz ${item.avgQuizScore || 0}% · Lessons ${item.lessonsCompleted || 0}`
              }
            />
            <AnalyticsList
              title="Students At Risk"
              items={analytics.weakStudents}
              emptyLabel="No risk data yet."
              renderMeta={(item) =>
                `Quiz ${item.avgQuizScore || 0}% · Attendance ${item.attendanceCount || 0}`
              }
            />
            <AnalyticsList
              title="Recent Activity"
              items={recentActivity}
              emptyLabel="No recent activity yet."
              renderMeta={(item) => item.meta}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: "16px",
            }}
          >
            <InsightPanel
              title="Class Performance"
              icon="🏫"
              items={[
                {
                  label: "Best Class",
                  value: overviewStats.bestClass
                    ? `Class ${overviewStats.bestClass.classNumber}`
                    : "—",
                  note: overviewStats.bestClass
                    ? `${overviewStats.bestClass.avgQuizScore}% average`
                    : "No class data yet",
                },
                {
                  label: "Lowest Class",
                  value: overviewStats.lowestClass
                    ? `Class ${overviewStats.lowestClass.classNumber}`
                    : "—",
                  note: overviewStats.lowestClass
                    ? `${overviewStats.lowestClass.avgQuizScore}% average`
                    : "No class data yet",
                },
                {
                  label: "Assigned Classes",
                  value: overviewStats.classCount,
                  note: "Classes connected to your active course coverage",
                },
              ]}
            />
            <InsightPanel
              title="Learning Insights"
              icon="💡"
              items={[
                {
                  label: "Weak Topics",
                  value: overviewStats.weakTopicLabel,
                  note: overviewStats.weakTopicNote,
                },
                {
                  label: "Most Completed Lesson",
                  value: overviewStats.topLessonTitle,
                  note: overviewStats.topLessonNote,
                },
                {
                  label: "Quiz Completion Rate",
                  value: `${overviewStats.quizCompletionRate}%`,
                  note: "Completed attempts versus possible attempts",
                },
                {
                  label: "Average Watch Time",
                  value: `${analytics.lessonAnalytics?.averageWatchTime || 0}s`,
                  note: "Real time students spent watching lesson media",
                },
              ]}
            />
            <InsightPanel
              title="Lesson Analytics"
              icon="🎥"
              items={[
                {
                  label: "Students Started",
                  value: analytics.lessonAnalytics?.studentsStarted || 0,
                  note: "Learners who began lesson playback",
                },
                {
                  label: "Students Completed",
                  value: analytics.lessonAnalytics?.studentsCompleted || 0,
                  note: "Reached the automatic completion threshold",
                },
                {
                  label: "Average Watch %",
                  value: `${analytics.lessonAnalytics?.averageWatchPct || 0}%`,
                  note: "Tracked from actual watch time instead of manual marking",
                },
              ]}
            />
          </div>
        </div>
      )}

      {false && tab === "analytics" && (
        <div style={{ display: "grid", gap: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "16px",
            }}
          >
            <AnalyticsCard
              title="Lesson Completion"
              value={stats.lessonCount || 0}
              caption="Tracked lessons in your workspace"
              color="#22C55E"
              icon="📄"
            />
            <AnalyticsCard
              title="Quiz Performance"
              value={`${stats.avgCompletion || 0}%`}
              caption="Average score across recent attempts"
              color="#F59E0B"
              icon="✏️"
            />
            <AnalyticsCard
              title="Student Progress"
              value={students.length}
              caption="Students currently visible to you"
              color="#6C63FF"
              icon="👦"
            />
            <AnalyticsCard
              title="Learning Streaks"
              value={analytics.streakLeaders?.[0]?.streak || 0}
              caption="Top active streak among learners"
              color="#06B6D4"
              icon="🔥"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: "16px",
            }}
          >
            <AnalyticsList
              title="Top Performers"
              items={analytics.topPerformers}
              emptyLabel="No top performers yet."
              renderMeta={(item) => `⭐ ${item.xp} · Lv.${item.level}`}
            />
            <AnalyticsList
              title="Weak Students"
              items={analytics.weakStudents}
              emptyLabel="No weak-student data yet."
              renderMeta={(item) =>
                `Quiz ${item.avgQuizScore || 0}% · Lessons ${item.lessonsCompleted || 0}`
              }
            />
            <AnalyticsList
              title="Streak Leaders"
              items={analytics.streakLeaders}
              emptyLabel="No streak data yet."
              renderMeta={(item) =>
                `🔥 ${item.streak || 0} days · ⭐ ${item.xp}`
              }
            />
          </div>
        </div>
      )}

      {tab === "profile" && <TeacherProfile user={user} onSaved={load} />}
    </div>
  );
}

function readTeacherTab(search) {
  const value = new URLSearchParams(search).get("tab") || "overview";
  const allowed = new Set([
    "overview",
    "courses",
    "classes",
    "lessons",
    "quiz",
    "assignments",
    "students",
    "attendance",
    "analytics",
    "profile",
  ]);
  return allowed.has(value) ? value : "overview";
}

function pickTeacherSubject(user, courses = []) {
  if (user?.subject) return user.subject;
  const subjectCounts = courses.reduce((acc, course) => {
    if (course.subject) acc[course.subject] = (acc[course.subject] || 0) + 1;
    return acc;
  }, {});
  const [subject] =
    Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0] || [];
  return subject || "General Teaching";
}

function buildTeacherOverviewStats(
  stats = {},
  analytics = {},
  attendance = {},
  classes = [],
  students = [],
) {
  const bestClass = analytics.classPerformance?.bestClass || null;
  const lowestClass = analytics.classPerformance?.lowestClass || null;
  const weakTopic = analytics.learningInsights?.weakTopics?.[0] || null;
  const topLesson =
    analytics.learningInsights?.mostCompletedLessons?.[0] || null;
  return {
    studentCount: stats.studentCount || students.length,
    classCount: stats.classCount || classes.length,
    activeCourses: stats.activeCourses ?? stats.courseCount ?? 0,
    activeQuizzes: stats.activeQuizzes ?? stats.quizCount ?? 0,
    publishedLessons: stats.publishedLessons ?? stats.lessonCount ?? 0,
    avgAttendance: stats.avgAttendance || 0,
    avgScore: stats.avgCompletion || 0,
    pendingReviews: stats.pendingReviews || 0,
    atRiskCount: analytics.weakStudents?.length || 0,
    topPerformerName: analytics.topPerformers?.[0]?.name || "—",
    bestClass,
    lowestClass,
    weakTopicLabel: weakTopic?.subject || "—",
    weakTopicNote: weakTopic
      ? `${weakTopic.avgScore}% average across ${weakTopic.attempts} attempts`
      : "No weak-topic trend yet",
    topLessonTitle: topLesson?.title || "—",
    topLessonNote: topLesson
      ? `${topLesson.completions} completions`
      : "No lesson completion trend yet",
    quizCompletionRate: analytics.learningInsights?.quizCompletionRate || 0,
    cards: [
      { label: "Students", value: stats.studentCount ?? 0, icon: "👥" },
      { label: "Classes", value: stats.classCount ?? 0, icon: "🏫" },
      {
        label: "Courses",
        value: stats.activeCourses ?? stats.courseCount ?? 0,
        icon: "📚",
      },
      {
        label: "Lessons",
        value: stats.publishedLessons ?? stats.lessonCount ?? 0,
        icon: "📝",
      },
      {
        label: "Quizzes",
        value: stats.activeQuizzes ?? stats.quizCount ?? 0,
        icon: "✏️",
      },
      {
        label: "Attendance",
        value: `${stats.avgAttendance || 0}%`,
        icon: "🗓️",
      },
      { label: "Assignments", value: stats.pendingReviews || 0, icon: "📂" },
      {
        label: "Performance",
        value: `${stats.avgCompletion || 0}%`,
        icon: "📈",
      },
    ],
  };
}

function findAttendancePct(rows = [], classNumber) {
  return (
    rows.find((item) => item.classNumber === classNumber)?.attendancePct || 0
  );
}

function TeacherHero({
  teacherName,
  subject,
  stats,
  onCreateCourse,
  onCreateLesson,
  onCreateQuiz,
}) {
  return (
    <div
      style={{
        ...card,
        background:
          "linear-gradient(135deg,#EEF0FF 0%,#DFF5FF 55%,#FFF4E8 100%)",
        marginBottom: "20px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: "18px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,.8)",
              color: "#5B5BD6",
              fontWeight: 800,
              fontSize: "12px",
              marginBottom: "12px",
            }}
          >
            📘 Teacher Workspace
          </div>
          <h1
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "30px",
              lineHeight: 1.05,
              fontWeight: 800,
              margin: "0 0 10px",
              color: "#1E1B4B",
            }}
          >
            Welcome back, {teacherName || "Teacher"}
          </h1>
          <div
            style={{
              fontSize: "14px",
              color: "#5B6475",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            {subject} · {stats.classCount} classes · {stats.studentCount}{" "}
            students
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            {[
              ["Assigned Classes", stats.classCount, "#7C5CBF"],
              ["Total Students", stats.studentCount, "#06B6D4"],
              ["Active Courses", stats.activeCourses, "#22C55E"],
              ["Active Quizzes", stats.activeQuizzes, "#F59E0B"],
            ].map(([label, value, color]) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,.78)",
                  borderRadius: "16px",
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: 800, color }}>
                  {value}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6B7280",
                    fontWeight: 700,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Btn onClick={onCreateCourse} color="#6C63FF">
              + Course
            </Btn>
            <Btn onClick={onCreateLesson} color="#22C55E">
              + Lesson
            </Btn>
            <Btn onClick={onCreateQuiz} color="#F59E0B">
              + Quiz
            </Btn>
          </div>
        </div>

        <div
          style={{
            minHeight: "220px",
            borderRadius: "24px",
            background: "linear-gradient(180deg,#FFFFFF 0%,#EEF4FF 100%)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TeacherWorkspaceIllustration />
        </div>
      </div>
    </div>
  );
}

function TeacherWorkspaceIllustration() {
  return (
    <svg viewBox="0 0 280 220" style={{ width: "100%", maxWidth: "280px" }}>
      <rect
        x="38"
        y="42"
        width="170"
        height="92"
        rx="16"
        fill="#1E3A8A"
        opacity=".1"
      />
      <rect x="48" y="50" width="154" height="80" rx="14" fill="#2D2359" />
      <rect
        x="62"
        y="64"
        width="126"
        height="52"
        rx="10"
        fill="#22C55E"
        opacity=".22"
      />
      <rect
        x="72"
        y="78"
        width="64"
        height="8"
        rx="4"
        fill="#FFFFFF"
        opacity=".9"
      />
      <rect
        x="72"
        y="92"
        width="88"
        height="8"
        rx="4"
        fill="#FFFFFF"
        opacity=".7"
      />
      <circle cx="214" cy="140" r="38" fill="#FBBF24" opacity=".22" />
      <circle cx="150" cy="154" r="30" fill="#FDBCB4" />
      <rect x="122" y="180" width="58" height="28" rx="14" fill="#7C5CBF" />
      <ellipse cx="150" cy="132" rx="30" ry="18" fill="#4A3728" />
      <circle cx="138" cy="154" r="4" fill="#1F2937" />
      <circle cx="162" cy="154" r="4" fill="#1F2937" />
      <path
        d="M138 168 Q150 176 162 168"
        stroke="#D47B6B"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="198" y="56" width="44" height="56" rx="12" fill="#FFF7ED" />
      <rect x="206" y="66" width="28" height="8" rx="4" fill="#F59E0B" />
      <rect x="206" y="80" width="22" height="8" rx="4" fill="#FB7185" />
      <rect x="206" y="94" width="26" height="8" rx="4" fill="#06B6D4" />
      <circle cx="62" cy="164" r="18" fill="#EDE9FE" />
      <path
        d="M54 164 H70"
        stroke="#6C63FF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M62 156 V172"
        stroke="#6C63FF"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MetricCard({ value, label, icon, gradient }) {
  return (
    <div
      style={{
        borderRadius: "20px",
        padding: "20px",
        background: `linear-gradient(135deg,${gradient[0]},${gradient[1]})`,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: "Baloo 2,cursive",
          fontSize: "28px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "12px", opacity: 0.9, fontWeight: 700 }}>
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          right: "-8px",
          bottom: "-8px",
          fontSize: "44px",
          opacity: 0.15,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

function QuickActionGrid({ actions }) {
  return (
    <div style={card}>
      <div
        style={{
          fontFamily: "Baloo 2,cursive",
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "14px",
        }}
      >
        Quick Actions
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
          gap: "10px",
        }}
      >
        {actions.map((item) => (
          <div
            key={item.title}
            onClick={item.onClick}
            style={{
              background: "#F9FAFB",
              borderRadius: "16px",
              padding: "14px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>
              {item.icon}
            </div>
            <div style={{ fontWeight: 800, fontSize: "13px" }}>
              {item.title}
            </div>
            <div
              style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}
            >
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightPanel({ title, icon, items }) {
  return (
    <div style={card}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "Baloo 2,cursive",
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "14px",
        }}
      >
        <span>{icon}</span>
        {title}
      </div>
      <div style={{ display: "grid", gap: "12px" }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              background: "#F9FAFB",
              borderRadius: "14px",
              padding: "14px",
            }}
          >
            <div
              style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 700 }}
            >
              {item.label}
            </div>
            <div
              style={{ fontSize: "18px", fontWeight: 800, marginTop: "4px" }}
            >
              {item.value}
            </div>
            <div
              style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}
            >
              {item.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassOverviewGrid({
  classes = [],
  attendanceByClass = [],
  onOpenClass,
}) {
  return (
    <div style={card}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "Baloo 2,cursive",
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "14px",
        }}
      >
        <span>🏫</span>
        Teacher Class Overview
      </div>
      {classes.length === 0 ? (
        <div style={{ color: "#9CA3AF", fontSize: "13px" }}>
          No class cards are available yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "12px",
          }}
        >
          {classes.map((item) => (
            <div
              key={item.classNumber}
              onClick={() => onOpenClass(item.classNumber)}
              style={{
                background: "#F9FAFB",
                borderRadius: "18px",
                padding: "16px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "15px",
                  marginBottom: "10px",
                }}
              >
                Class {item.classNumber}
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                <OverviewRow
                  label="Student Count"
                  value={item.studentCount || 0}
                />
                <OverviewRow
                  label="Average Score"
                  value={`${item.avgQuizScore || 0}%`}
                />
                <OverviewRow
                  label="Attendance"
                  value={`${findAttendancePct(attendanceByClass, item.classNumber)}%`}
                />
                <OverviewRow
                  label="Progress"
                  value={`${item.lessonsCompleted || 0} lessons`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityFeed({ items = [] }) {
  return (
    <div style={card}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "Baloo 2,cursive",
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "14px",
        }}
      >
        <span>📋</span>
        Teacher Activity Feed
      </div>
      {items.length === 0 ? (
        <div style={{ color: "#9CA3AF", fontSize: "13px" }}>
          No recent teacher activity yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {items.map((item, index) => (
            <div
              key={`${item.type}-${item.title}-${index}`}
              style={{
                background: "#F9FAFB",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: "13px" }}>
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6B7280",
                    marginTop: "4px",
                  }}
                >
                  {item.meta}
                </div>
              </div>
              <div
                style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 700 }}
              >
                {item.date
                  ? new Date(item.date).toLocaleDateString()
                  : "Recent"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OverviewRow({ label, value }) {
  return (
    <div
      style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}
    >
      <span style={{ fontSize: "12px", color: "#6B7280" }}>{label}</span>
      <span style={{ fontSize: "12px", fontWeight: 800, color: "#1F2937" }}>
        {value}
      </span>
    </div>
  );
}

function AnalyticsCard({ title, value, caption, color, icon }) {
  return (
    <div
      style={{
        ...card,
        background: `linear-gradient(135deg,${color},${color}cc)`,
        color: "#fff",
      }}
    >
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
      <div
        style={{
          fontFamily: "Baloo 2,cursive",
          fontSize: "28px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>
      <div style={{ fontWeight: 800, fontSize: "13px", marginTop: "2px" }}>
        {title}
      </div>
      <div style={{ opacity: 0.85, fontSize: "12px", marginTop: "4px" }}>
        {caption}
      </div>
    </div>
  );
}

function AnalyticsList({ title, items = [], emptyLabel, renderMeta }) {
  return (
    <div style={card}>
      <div
        style={{
          fontFamily: "Baloo 2,cursive",
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "14px",
        }}
      >
        {title}
      </div>
      {items.length === 0 ? (
        <div style={{ color: "#9CA3AF", fontSize: "13px" }}>{emptyLabel}</div>
      ) : (
        items.map((item, index) => (
          <div
            key={`${title}-${item._id || item.name}-${index}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #F3F4F6",
              gap: "10px",
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: "13px" }}>
                {item.title || item.name || `Student ${index + 1}`}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "3px" }}
              >
                {renderMeta(item)}
              </div>
            </div>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#EEF0FF",
                color: "#6C63FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
              }}
            >
              {index + 1}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function miniActionStyle(color) {
  return {
    border: "none",
    borderRadius: "20px",
    background: `${color}18`,
    color,
    padding: "6px 10px",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "Nunito,sans-serif",
  };
}
