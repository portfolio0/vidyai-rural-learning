import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore, useProgressStore } from "../../store/stores";

const NAV_STUDENT = [
  { path: "/", emoji: "🏠", label: "Home" },
  { path: "/subjects", emoji: "📚", label: "My Subjects" },
  { path: "/assignments", emoji: "📂", label: "Homework" },
  { path: "/quiz", emoji: "✏️", label: "Quizzes" },
  { path: "/reels", emoji: "🎬", label: "Reels" },
  { path: "/rewards", emoji: "🏆", label: "Achievements" },
  { path: "/chat", emoji: "🤖", label: "AI Tutor" },
  { path: "/offline", emoji: "📶", label: "Offline Mode" },
  { path: "/profile", emoji: "👤", label: "Profile" },
];

const NAV_TEACHER = [
  { path: "/teacher", emoji: "📊", label: "Overview" },
  { path: "/teacher?tab=courses", emoji: "📚", label: "Courses" },
  { path: "/teacher?tab=classes", emoji: "🏫", label: "Classes" },
  { path: "/teacher?tab=lessons", emoji: "📝", label: "Lessons" },
  { path: "/teacher?tab=quiz", emoji: "✏️", label: "Quizzes" },
  { path: "/teacher?tab=assignments", emoji: "📂", label: "Assignments" },
  { path: "/teacher?tab=attendance", emoji: "🗓️", label: "Attendance" },
  { path: "/teacher?tab=analytics", emoji: "📈", label: "Analytics" },
  { path: "/teacher?tab=students", emoji: "👥", label: "Students" },
  { path: "/profile", emoji: "👤", label: "Profile" },
];

const NAV_PARENT = [
  { path: "/parent", emoji: "📊", label: "Overview" },
  { path: "/parent?tab=children", emoji: "👨‍👩‍👧", label: "Children" },
  { path: "/parent?tab=progress", emoji: "📈", label: "Progress" },
  { path: "/parent?tab=attendance", emoji: "🗓️", label: "Attendance" },
  { path: "/parent?tab=assignments", emoji: "📂", label: "Assignments" },
  { path: "/parent?tab=reports", emoji: "🧾", label: "Reports" },
  { path: "/profile", emoji: "👤", label: "Profile" },
];

const NAV_ADMIN = [
  { path: "/", emoji: "🏠", label: "Home" },
  { path: "/admin", emoji: "⚙️", label: "Admin Panel" },
  { path: "/teacher", emoji: "👩‍🏫", label: "Teacher View" },
  { path: "/profile", emoji: "👤", label: "Profile" },
];

const KidAvatar = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <circle cx="40" cy="40" r="40" fill="#A8D8EA" />
    <rect x="14" y="56" width="52" height="28" rx="14" fill="#7C5CBF" />
    <circle cx="40" cy="36" r="22" fill="#FDBCB4" />
    <ellipse cx="40" cy="17" rx="22" ry="12" fill="#4A3728" />
    <ellipse cx="19" cy="30" rx="9" ry="12" fill="#4A3728" />
    <ellipse cx="61" cy="30" rx="9" ry="12" fill="#4A3728" />
    <circle cx="31" cy="34" r="5" fill="white" />
    <circle cx="49" cy="34" r="5" fill="white" />
    <circle cx="32" cy="35" r="3" fill="#333" />
    <circle cx="50" cy="35" r="3" fill="#333" />
    <circle cx="31" cy="33" r="1.2" fill="white" />
    <circle cx="49" cy="33" r="1.2" fill="white" />
    <path d="M31 46 Q40 54 49 46" stroke="#D47B6B" strokeWidth="2" fill="none" strokeLinecap="round" />
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
            : role === "parent"
              ? "linear-gradient(135deg,#FFF3E8,#EDE9FE)"
              : "linear-gradient(135deg,#EDE9FB,#D8D0F8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "36px",
      }}
    >
      {role === "teacher" ? "👩‍🏫" : role === "parent" ? "👨‍👩‍👧" : "🎓"}
    </div>
  );
}

const OwlSvg = () => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "52px", height: "52px", flexShrink: 0 }}>
    <circle cx="30" cy="30" r="28" fill="#7C5CBF" />
    <ellipse cx="30" cy="38" rx="16" ry="18" fill="#9B7DD4" />
    <polygon points="16,18 21,8 26,18" fill="#6A4CAF" />
    <polygon points="34,18 39,8 44,18" fill="#6A4CAF" />
    <circle cx="22" cy="24" r="8" fill="white" />
    <circle cx="38" cy="24" r="8" fill="white" />
    <circle cx="22" cy="24" r="5" fill="#3D2B6B" />
    <circle cx="38" cy="24" r="5" fill="#3D2B6B" />
    <polygon points="27,30 33,30 30,35" fill="#F4A261" />
  </svg>
);

export default function DrawerMenu({ open, onClose }) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { xp, streak } = useProgressStore();
  const nav = useNavigate();
  const location = useLocation();
  const role = user?.role || "student";

  const navItems =
    role === "teacher"
      ? NAV_TEACHER
      : role === "parent"
        ? NAV_PARENT
        : role === "admin"
          ? NAV_ADMIN
          : NAV_STUDENT;

  const handleLogout = () => {
    logout();
    nav("/login");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "300px",
        background: "white",
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .3s cubic-bezier(.4,0,.2,1)",
        boxShadow: open ? "4px 0 32px rgba(0,0,0,.2)" : "none",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background:
            role === "teacher"
              ? "linear-gradient(135deg,#E0F2FE,#EDE9FE)"
              : role === "parent"
                ? "linear-gradient(135deg,#FFF3E8,#EDE9FE)"
                : "linear-gradient(135deg,#EDE9FB,#D8D0F8)",
          padding: "28px 20px 20px",
          textAlign: "center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <span style={{ position: "absolute", top: "12px", left: "20px", fontSize: "16px", color: "#C4A8E8" }}>✦</span>
        <span style={{ position: "absolute", top: "20px", right: "30px", fontSize: "10px", color: "#C4A8E8" }}>✦</span>
        <span style={{ position: "absolute", top: "50px", left: "14px", fontSize: "8px", color: "#C4A8E8" }}>✦</span>

        <div style={{ width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 12px", overflow: "hidden", border: "3px solid white", boxShadow: "0 4px 16px rgba(124,92,191,.3)" }}>
          {role === "student" ? <KidAvatar /> : <RoleAvatar role={role} />}
        </div>
        <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "20px", fontWeight: 800, color: "#2D2359" }}>
          {user?.name || role}
        </div>

        {role === "teacher" ? (
          <div style={{ fontSize: "13px", color: "#5B5BD6", fontWeight: 700, marginBottom: "14px" }}>
            Teaching workspace • {user?.subject || "Classroom lead"}
          </div>
        ) : role === "parent" ? (
          <div style={{ fontSize: "13px", color: "#7C5CBF", fontWeight: 700, marginBottom: "14px" }}>
            Parent monitoring workspace • Family learning dashboard
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <div style={{ background: "white", borderRadius: "40px", padding: "7px 14px", display: "flex", gap: "6px", alignItems: "center", fontSize: "13px", fontWeight: 800, color: "#5B3A8C", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
              ⭐ {xp} XP
            </div>
            <div style={{ background: "white", borderRadius: "40px", padding: "7px 14px", display: "flex", gap: "6px", alignItems: "center", fontSize: "13px", fontWeight: 800, color: "#8B3A00", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
              🔥 {streak} Days
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 14px", flex: 1 }}>
        {navItems.map((item, i) => (
          <NavLink
            key={`${item.path}-${i}`}
            to={item.path}
            end={item.path === "/" || item.path === "/teacher" || item.path === "/parent"}
            onClick={onClose}
            style={({ isActive }) => {
              const active =
                role === "teacher" || role === "parent"
                  ? `${location.pathname}${location.search}` === item.path
                  : isActive;
              return {
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "13px 14px",
                borderRadius: "14px",
                marginBottom: "2px",
                textDecoration: "none",
                background: active ? "#EDE9FB" : "transparent",
                color: active ? "#7C5CBF" : "#374151",
                fontWeight: 700,
                fontSize: "15px",
                fontFamily: "Nunito,sans-serif",
                transition: "background .15s",
              };
            }}
          >
            <span style={{ fontSize: "22px", width: "28px", textAlign: "center" }}>{item.emoji}</span>
            {item.label}
          </NavLink>
        ))}

        <div style={{ borderTop: "1px solid #F3F4F6", marginTop: "8px", paddingTop: "8px" }}>
          {[
            ["❓", t("nav.help", { defaultValue: "Help & Support" }), "/help"],
            ["ℹ️", t("nav.about", { defaultValue: "About VidyAI" }), "/about"],
          ].map(([emoji, label, path]) => (
            <NavLink
              key={label}
              to={path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "13px 14px",
                borderRadius: "14px",
                cursor: "pointer",
                color: isActive ? "#7C5CBF" : "#374151",
                background: isActive ? "#EDE9FB" : "transparent",
                fontWeight: 700,
                fontSize: "15px",
                fontFamily: "Nunito,sans-serif",
                textDecoration: "none",
                transition: "background .15s",
                marginBottom: "2px",
              })}
            >
              <span style={{ fontSize: "22px", width: "28px", textAlign: "center" }}>{emoji}</span>
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {role === "teacher" ? (
        <RoleFooterCard icon="📋" title="Teaching Toolkit" body="Open analytics, plan lessons, and review class progress." gradient="linear-gradient(135deg,#E0F2FE,#EDE9FE)" />
      ) : role === "parent" ? (
        <RoleFooterCard icon="🧾" title="Family Report Desk" body="View attendance, performance, and child progress snapshots." gradient="linear-gradient(135deg,#FFF3E8,#EDE9FE)" />
      ) : (
        <div style={{ margin: "0 14px 16px", background: "linear-gradient(135deg,#EDE9FB,#D8D0F8)", borderRadius: "18px", padding: "14px", display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
          <OwlSvg />
          <div>
            <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "14px", fontWeight: 800, color: "#2D2359" }}>Keep learning!</div>
            <div style={{ fontSize: "12px", color: "#7C5CBF", fontWeight: 600, lineHeight: 1.4 }}>Every step brings you closer to success! ✨</div>
          </div>
        </div>
      )}

      <div style={{ padding: "0 14px 28px", flexShrink: 0 }}>
        <button onClick={handleLogout} style={{ width: "100%", padding: "14px", borderRadius: "40px", background: "white", border: "2px solid #FCA5A5", color: "#EF4444", fontWeight: 800, fontSize: "15px", cursor: "pointer", fontFamily: "Nunito,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}

function RoleFooterCard({ icon, title, body, gradient }) {
  return (
    <div style={{ margin: "0 14px 16px", background: gradient, borderRadius: "18px", padding: "14px", display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
      <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "14px", fontWeight: 800, color: "#2D2359" }}>{title}</div>
        <div style={{ fontSize: "12px", color: "#6B5ACD", fontWeight: 600, lineHeight: 1.4 }}>{body}</div>
      </div>
    </div>
  );
}
