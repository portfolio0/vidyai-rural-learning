import { useAuthStore, useProgressStore } from "../../store/stores";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";
import LanguageSwitcher from "./LanguageSwitcher";

const KidAvatar = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <circle cx="24" cy="24" r="24" fill="#A8D8EA" />
    <rect x="10" y="32" width="28" height="16" rx="8" fill="#7C5CBF" />
    <circle cx="24" cy="22" r="13" fill="#FDBCB4" />
    <ellipse cx="24" cy="11" rx="13" ry="7" fill="#4A3728" />
    <ellipse cx="12" cy="18" rx="5" ry="7" fill="#4A3728" />
    <ellipse cx="36" cy="18" rx="5" ry="7" fill="#4A3728" />
    <circle cx="19" cy="21" r="3" fill="white" />
    <circle cx="29" cy="21" r="3" fill="white" />
    <circle cx="19.5" cy="21.5" r="1.8" fill="#333" />
    <circle cx="29.5" cy="21.5" r="1.8" fill="#333" />
    <path d="M19 28 Q24 33 29 28" stroke="#D47B6B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

function RoleAvatar({ role }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background:
          role === "teacher"
            ? "linear-gradient(135deg,#E0F2FE,#EDE9FE)"
            : "linear-gradient(135deg,#FFF3E8,#EDE9FE)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
      }}
    >
      {role === "teacher" ? "👩‍🏫" : "👨‍👩‍👧"}
    </div>
  );
}

export default function MobileTopbar({ onHamburger }) {
  const { user } = useAuthStore();
  const { xp, streak } = useProgressStore();
  const nav = useNavigate();
  const role = user?.role || "student";

  return (
    <header
      style={{
        minHeight: "calc(62px + env(safe-area-inset-top, 0px))",
        paddingTop: "max(8px, env(safe-area-inset-top, 0px))",
        paddingBottom: "6px",
        paddingLeft: "14px",
        paddingRight: "14px",
        boxSizing: "border-box",
        background: "white",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 2px 12px rgba(0,0,0,.06)",
        borderBottom: "1px solid rgba(0,0,0,.06)",
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      <button
        onClick={onHamburger}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "#F3F4F6",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          flexShrink: 0,
        }}
      >
        <div style={{ width: "18px", height: "2px", background: "#374151", borderRadius: "2px" }} />
        <div style={{ width: "18px", height: "2px", background: "#374151", borderRadius: "2px" }} />
        <div style={{ width: "18px", height: "2px", background: "#374151", borderRadius: "2px" }} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
        <span style={{ fontSize: "20px" }}>🎓</span>
        <span style={{ fontFamily: "Baloo 2,cursive", fontWeight: 800, fontSize: "20px", color: "#7C5CBF" }}>
          VidyAI
        </span>
        <span style={{ fontSize: "13px" }}>✨</span>
      </div>

      {role === "teacher" ? (
        <SmallChip icon="📘" label="Teacher" color="#5B3A8C" border="#D9D6FE" background="#EEF4FF" />
      ) : role === "parent" ? (
        <SmallChip icon="🧡" label="Parent" color="#C2410C" border="#FED7AA" background="#FFF7ED" />
      ) : (
        <div
          onClick={() => nav("/rewards")}
          style={{
            ...mobileChipStyle,
            background: "#FFF9E6",
            color: "#5B3A8C",
            border: "1px solid #FFE08A",
            cursor: "pointer",
            flexShrink: 0,
            padding: "4px 8px",
          }}
          title={`${xp} XP`}
        >
          <span>⭐</span> {xp}
        </div>
      )}

      <LanguageSwitcher compact />
      <NotificationCenter />

      <div
        onClick={() => nav("/profile")}
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid #7C5CBF",
          cursor: "pointer",
          flexShrink: 0,
        }}
        title="Profile"
      >
        {role === "student" ? <KidAvatar /> : <RoleAvatar role={role} />}
      </div>
    </header>
  );
}

function SmallChip({ icon, label, color, border, background }) {
  return (
    <div style={{ ...mobileChipStyle, background, color, border: `1px solid ${border}` }}>
      <span>{icon}</span> {label}
    </div>
  );
}

const mobileChipStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  borderRadius: "40px",
  padding: "6px 10px",
  fontSize: "12px",
  fontWeight: 800,
};
