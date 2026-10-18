import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const card = {
  background: "#fff",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 4px 24px rgba(108,99,255,.08)",
};

export const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Marathi",
  "Hindi",
  "Social Studies",
  "Computer",
  "GK",
  "EVS",
];

export const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function Modal({ title, onClose, children, wide = false }) {
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
          maxWidth: wide ? "760px" : "560px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #F3F4F6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "18px",
              fontWeight: 800,
              color: "#1E1B4B",
            }}
          >
            {title}
          </div>
          <span
            onClick={onClose}
            style={{
              fontSize: "20px",
              cursor: "pointer",
              color: "#9CA3AF",
              lineHeight: 1,
            }}
          >
            ✕
          </span>
        </div>
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function Inp({ label, value, onChange, type = "text", placeholder = "" }) {
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

export function Sel({ label, value, onChange, options }) {
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
          background: "#fff",
          boxSizing: "border-box",
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

export function Btn({
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

export function Tag({ children, bg, color }) {
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

export function EmptyState({ icon, title, description, action }) {
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

export function ConfirmModal({
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

export function mediaAccept(type) {
  if (type === "video") return "video/*";
  if (type === "audio") return "audio/*";
  if (type === "image") return "image/*";
  if (type === "pdf") return "application/pdf";
  return "video/*,audio/*,image/*,application/pdf";
}

export function formatLessonDuration(durationSeconds) {
  const total = Math.max(0, Math.round(durationSeconds || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function readMediaDuration(file, type) {
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

export function UploadField({ file, setFile, type, existingUrl, existingName }) {
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
