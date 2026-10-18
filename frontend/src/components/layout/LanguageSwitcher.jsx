import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { setAppLanguage } from "../../i18n";
import { useAuthStore } from "../../store/stores";
import api from "../../services/api";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = async (code) => {
    setAppLanguage(code);
    setOpen(false);
    if (user) {
      updateUser({ language: code });
      try {
        await api.put("/student/profile", { language: code });
      } catch (e) {
        // Silently continue if network fails
      }
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: "#FFFFFF",
          border: "1.5px solid #E5E7EB",
          borderRadius: "20px",
          padding: compact ? "4px 8px" : "6px 12px",
          fontSize: "12px",
          fontWeight: 700,
          color: "#4B5563",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          transition: "all 0.15s ease",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
        title="Change Language"
      >
        <span style={{ fontSize: "14px" }}>{currentLang.flag}</span>
        <span style={{ fontSize: compact ? "11px" : "12px", fontWeight: 800 }}>
          {compact ? currentLang.code.toUpperCase() : currentLang.label}
        </span>
        <span style={{ fontSize: "9px", color: "#9CA3AF" }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
            padding: "6px",
            minWidth: "130px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {LANGUAGES.map((item) => {
            const active = item.code === i18n.language;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "none",
                  background: active ? "#EEF0FF" : "transparent",
                  color: active ? "#4F46E5" : "#374151",
                  fontWeight: active ? 800 : 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
              >
                <span>{item.flag}</span>
                <span>{item.label}</span>
                {active && <span style={{ marginLeft: "auto", fontSize: "11px" }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
