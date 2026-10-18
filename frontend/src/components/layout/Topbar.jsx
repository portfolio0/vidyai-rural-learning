import { useAuthStore, useProgressStore } from "../../store/stores";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";
import NotificationCenter from "./NotificationCenter";
import LanguageSwitcher from "./LanguageSwitcher";

function ProfileAvatar({ role, initial }) {
  if (role === "teacher" || role === "parent") {
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
          fontSize: "22px",
        }}
      >
        {role === "teacher" ? "👩‍🏫" : "👨‍👩‍👧"}
      </div>
    );
  }

  return (
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
      <text x="17" y="42" fontSize="10" fill="transparent">{initial}</text>
    </svg>
  );
}

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const { xp, streak } = useProgressStore();
  const nav = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const role = user?.role || "student";

  return (
    <header
      style={{
        height: "64px",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        padding: "0 28px 0 0",
        flexShrink: 0,
        justifyContent: "flex-end",
        gap: "10px",
        position: "relative",
      }}
    >
      {role === "teacher" ? (
        <>
          <HeaderChip icon="📘" label="Teacher Workspace" color="#5B3A8C" />
          <HeaderChip icon="🏫" label={user?.subject || "Classroom Lead"} color="#0F766E" />
        </>
      ) : role === "parent" ? (
        <>
          <HeaderChip icon="🧡" label="Parent Dashboard" color="#C2410C" />
          <HeaderChip icon="👨‍👩‍👧" label="Family Monitoring" color="#7C3AED" />
        </>
      ) : role === "admin" ? (
        <>
          <HeaderChip icon="⚙️" label="Platform Admin" color="#DC2626" />
        </>
      ) : (
        <>
          <div onClick={() => nav("/rewards")} style={{ ...chipStyle, color: "#5B3A8C", cursor: "pointer" }}>
            <span style={{ fontSize: "18px" }}>⭐</span>
            {xp.toLocaleString()} XP
          </div>
          <div style={{ ...chipStyle, color: "#8B3A00" }}>
            <span style={{ fontSize: "18px" }}>🔥</span>
            {streak} Days Streak
          </div>
        </>
      )}

      <LanguageSwitcher />
      <NotificationCenter />

      <div style={{ position: "relative" }}>
        <div onClick={() => setShowMenu((m) => !m)} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", border: "3px solid white", boxShadow: "0 2px 12px rgba(108,99,255,.25)", flexShrink: 0 }}>
            <ProfileAvatar role={role} initial={user?.name?.[0] || "S"} />
          </div>
          <div style={{ fontSize: "16px", color: "#6B7280", fontWeight: 700 }}>▾</div>
        </div>
        {showMenu && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "52px",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,.15)",
              padding: "8px",
              zIndex: 100,
              minWidth: "180px",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {/* User Info Header */}
            <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid #F3F4F6", marginBottom: "4px" }}>
              <div style={{ fontWeight: 800, fontSize: "14px", color: "#1F2937" }}>{user?.name || "User"}</div>
              <div style={{ fontSize: "12px", color: "#6B7280", textTransform: "capitalize" }}>
                Role: <span style={{ fontWeight: 700, color: "#6C63FF" }}>{role}</span>
              </div>
            </div>

            <div
              onClick={() => { nav("/profile"); setShowMenu(false); }}
              style={{ padding: "8px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", gap: "8px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span>👤</span> Profile & Settings
            </div>

            {role === "admin" && (
              <div
                onClick={() => { nav("/admin"); setShowMenu(false); }}
                style={{ padding: "8px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: "#DC2626", display: "flex", alignItems: "center", gap: "8px" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span>⚙️</span> Admin Console
              </div>
            )}

            <div style={{ height: "1px", background: "#F3F4F6", margin: "4px 0" }} />

            <div
              onClick={() => { logout(); nav("/login"); setShowMenu(false); }}
              style={{ padding: "8px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: "#EF4444", display: "flex", alignItems: "center", gap: "8px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span>🚪</span> Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function HeaderChip({ icon, label, color }) {
  return (
    <div style={{ ...chipStyle, color }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      {label}
    </div>
  );
}

const chipStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  background: "white",
  borderRadius: "40px",
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: 800,
  boxShadow: "0 2px 12px rgba(0,0,0,.08)",
  fontFamily: "Baloo 2,cursive",
};
