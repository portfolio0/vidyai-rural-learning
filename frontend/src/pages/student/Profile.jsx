import { useState, useEffect } from "react";
import { useAuthStore, useProgressStore } from "../../store/stores";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import NotificationCenter from "../../components/layout/NotificationCenter";

export default function Profile() {
  const { user, logout, updateUser } = useAuthStore();
  const { xp, coins, level, streak } = useProgressStore();
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const isTeacher = user?.role === "teacher";
  const isAdmin = user?.role === "admin";
  const isParent = user?.role === "parent";

  useEffect(() => {
    if (user?.role === "student") {
      api
        .get("/student/dashboard")
        .then((r) => setStudentData(r.data.student))
        .catch(() => {});
    }
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put("/student/profile", { name });
      updateUser({ name });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e.message);
    }
    setSaving(false);
  };

  const card = {
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 24px rgba(108,99,255,.08)",
    marginBottom: "16px",
  };

  const realXP = studentData?.xp ?? xp;
  const realLevel = studentData?.level ?? level;
  const realStreak = studentData?.streakCurrent ?? streak;

  return (
    <div
      className="anim-slide-up"
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        paddingBottom: "40px",
      }}
    >
      {/* Avatar Header */}
      <div
        style={{
          ...card,
          textAlign: "center",
          background: isTeacher
            ? "linear-gradient(135deg,#06B6D4,#6C63FF)"
            : isAdmin
              ? "linear-gradient(135deg,#F59E0B,#EF4444)"
              : "linear-gradient(135deg,#6C63FF,#EC4899)",
          color: "#fff",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            fontWeight: 800,
            margin: "0 auto 12px",
          }}
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <h2
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "22px",
            fontWeight: 800,
            marginBottom: "4px",
          }}
        >
          {user?.name}
        </h2>
        <p style={{ opacity: 0.8, fontSize: "14px" }}>
          {user?.email || user?.phone || "VidyAI User"}
        </p>
        <div
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,.2)",
            borderRadius: "20px",
            padding: "4px 14px",
            marginTop: "8px",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          {isTeacher
            ? "👩‍🏫 Teacher"
            : isAdmin
              ? "⚙️ Admin"
              : "👦 Student · Class " +
                (studentData?.class || user?.class || 5)}
        </div>

        {/* Student stats only */}
        {!isTeacher && !isAdmin && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              marginTop: "16px",
            }}
          >
            {[
              ["⭐", realXP, "XP"],
              ["🔥", realStreak, "Streak"],
              ["🏆", realLevel, "Level"],
              ["🪙", coins, "Coins"],
            ].map(([icon, val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "16px" }}>{icon}</div>
                <div
                  style={{
                    fontFamily: "Baloo 2,cursive",
                    fontSize: "18px",
                    fontWeight: 800,
                  }}
                >
                  {val}
                </div>
                <div style={{ fontSize: "10px", opacity: 0.7 }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
            👤 My Info
          </div>
          {saved ? (
            <span
              style={{ color: "#22C55E", fontSize: "13px", fontWeight: 700 }}
            >
              ✅ Saved!
            </span>
          ) : editing ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={saveProfile}
                disabled={saving}
                style={{
                  background: "#6C63FF",
                  color: "#fff",
                  border: "none",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  background: "#F3F4F6",
                  color: "#6B7280",
                  border: "none",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{
                background: "#EEF0FF",
                color: "#6C63FF",
                border: "none",
                borderRadius: "20px",
                padding: "6px 14px",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          )}
        </div>

        {[
          { label: "Name", value: name, editable: true },
          { label: "Email", value: user?.email || "—", editable: false },
          { label: "Mobile", value: user?.phone || "—", editable: false },
          {
            label: "Role",
            value: isTeacher ? "Teacher" : isAdmin ? "Admin" : "Student",
            editable: false,
          },
          ...(!isTeacher && !isAdmin
            ? [
                {
                  label: "Class",
                  value: `Class ${studentData?.class || user?.class || 5}`,
                  editable: false,
                },
              ]
            : []),
          {
            label: "Language",
            value:
              user?.language === "mr"
                ? "मराठी"
                : user?.language === "hi"
                  ? "हिंदी"
                  : "English",
            editable: false,
          },
        ].map((f) => (
          <div
            key={f.label}
            style={{ padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#9CA3AF",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              {f.label}
            </div>
            {editing && f.editable ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "2px solid #E5E7EB",
                  fontSize: "14px",
                  fontFamily: "Nunito,sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{f.value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Level card — students only */}
      {!isTeacher && !isAdmin && (
        <div style={card}>
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            🏆 Level {realLevel}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            <span>Progress to Level {realLevel + 1}</span>
            <span style={{ color: "#6C63FF" }}>{realXP} XP</span>
          </div>
          <div
            style={{
              height: "12px",
              background: "#E5E7EB",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(((realXP % 500) / 500) * 100, 100)}%`,
                background: "linear-gradient(90deg,#6C63FF,#EC4899)",
                borderRadius: "6px",
              }}
            />
          </div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}>
            {500 - (realXP % 500)} XP to next level
          </div>
        </div>
      )}

      {/* Teacher quick links */}
      {isTeacher && (
        <div style={card}>
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            ⚡ Quick Links
          </div>
          {[
            ["📚", "My Dashboard", () => nav("/teacher")],
            ["👦", "My Students", () => nav("/teacher")],
            ["✏️", "Create Quiz", () => nav("/teacher")],
          ].map(([i, l, a]) => (
            <div
              key={l}
              onClick={a}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #F3F4F6",
                cursor: "pointer",
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {i} {l}
              </span>
              <span style={{ color: "#9CA3AF" }}>›</span>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      <div style={card}>
        {[
          { label: "🌐 Change Language", action: () => nav("/onboarding") },
          ...(!isTeacher && !isAdmin
            ? [{ label: "📥 Offline Mode", action: () => nav("/offline") }]
            : []),
          { label: "🔔 Notifications", action: () => setShowNotifModal(true) },
        ].map((item) => (
          <div
            key={item.label}
            onClick={item.action}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: "1px solid #F3F4F6",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 600 }}>
              {item.label}
            </span>
            <span style={{ color: "#9CA3AF" }}>›</span>
          </div>
        ))}
        <button
          onClick={() => {
            logout();
            nav("/login");
          }}
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "12px",
            borderRadius: "40px",
            border: "2px solid #EF4444",
            background: "transparent",
            color: "#EF4444",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </div>

      <NotificationCenter
        forceOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        hideBell={true}
      />
    </div>
  );
}
