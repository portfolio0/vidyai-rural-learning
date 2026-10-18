import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/stores";
import { useTranslation } from "react-i18next";

const NAV_STUDENT = [
  { path: "/", emoji: "🏠", label: "Home", bg: "#7C5CBF", activeBg: "#EDE9FB", activeColor: "#7C5CBF" },
  { path: "/subjects", emoji: "📚", label: "My Subjects", bg: "#06B6D4", activeBg: "#CFFAFE", activeColor: "#0891B2" },
  { path: "/assignments", emoji: "📂", label: "Homework", bg: "#EC4899", activeBg: "#FCE7F3", activeColor: "#DB2777" },
  { path: "/quiz", emoji: "✏️", label: "Quizzes", bg: "#22C55E", activeBg: "#DCFCE7", activeColor: "#16A34A" },
  { path: "/reels", emoji: "🎬", label: "Reels", bg: "#F97316", activeBg: "#FFEDD5", activeColor: "#EA580C" },
  { path: "/rewards", emoji: "🏆", label: "Achievements", bg: "#F59E0B", activeBg: "#FEF9C3", activeColor: "#D97706" },
  { path: "/chat", emoji: "🤖", label: "AI Tutor", bg: "#8B5CF6", activeBg: "#EDE9FE", activeColor: "#7C3AED" },
  { path: "/offline", emoji: "📶", label: "Offline Mode", bg: "#14B8A6", activeBg: "#CCFBF1", activeColor: "#0F766E" },
  { path: "/profile", emoji: "👤", label: "Profile", bg: "#7C5CBF", activeBg: "#EDE9FB", activeColor: "#7C5CBF" },
];

const NAV_TEACHER = [
  { path: "/teacher", emoji: "📊", label: "Overview", bg: "#7C5CBF", activeBg: "#EDE9FB", activeColor: "#7C5CBF" },
  { path: "/teacher?tab=courses", emoji: "📚", label: "Courses", bg: "#06B6D4", activeBg: "#CFFAFE", activeColor: "#0891B2" },
  { path: "/teacher?tab=classes", emoji: "🏫", label: "Classes", bg: "#22C55E", activeBg: "#DCFCE7", activeColor: "#16A34A" },
  { path: "/teacher?tab=lessons", emoji: "📝", label: "Lessons", bg: "#F59E0B", activeBg: "#FEF3C7", activeColor: "#D97706" },
  { path: "/teacher?tab=quiz", emoji: "✏️", label: "Quizzes", bg: "#F97316", activeBg: "#FFEDD5", activeColor: "#EA580C" },
  { path: "/teacher?tab=assignments", emoji: "📂", label: "Assignments", bg: "#EC4899", activeBg: "#FCE7F3", activeColor: "#DB2777" },
  { path: "/teacher?tab=attendance", emoji: "🗓️", label: "Attendance", bg: "#14B8A6", activeBg: "#CCFBF1", activeColor: "#0F766E" },
  { path: "/teacher?tab=analytics", emoji: "📈", label: "Analytics", bg: "#8B5CF6", activeBg: "#EDE9FE", activeColor: "#7C3AED" },
  { path: "/teacher?tab=students", emoji: "👥", label: "Students", bg: "#0EA5E9", activeBg: "#E0F2FE", activeColor: "#0284C7" },
  { path: "/profile", emoji: "👤", label: "Profile", bg: "#7C5CBF", activeBg: "#EDE9FB", activeColor: "#7C5CBF" },
];

const NAV_PARENT = [
  { path: "/parent", emoji: "📊", label: "Overview", bg: "#7C5CBF", activeBg: "#EDE9FB", activeColor: "#7C5CBF" },
  { path: "/parent?tab=children", emoji: "👨‍👩‍👧", label: "Children", bg: "#06B6D4", activeBg: "#CFFAFE", activeColor: "#0891B2" },
  { path: "/parent?tab=progress", emoji: "📈", label: "Progress", bg: "#22C55E", activeBg: "#DCFCE7", activeColor: "#16A34A" },
  { path: "/parent?tab=attendance", emoji: "🗓️", label: "Attendance", bg: "#F59E0B", activeBg: "#FEF3C7", activeColor: "#D97706" },
  { path: "/parent?tab=assignments", emoji: "📂", label: "Assignments", bg: "#EC4899", activeBg: "#FCE7F3", activeColor: "#DB2777" },
  { path: "/parent?tab=reports", emoji: "🧾", label: "Reports", bg: "#0EA5E9", activeBg: "#E0F2FE", activeColor: "#0284C7" },
  { path: "/profile", emoji: "👤", label: "Profile", bg: "#7C5CBF", activeBg: "#EDE9FB", activeColor: "#7C5CBF" },
];

const NAV_ADMIN = [
  { path: "/", emoji: "🏠", label: "Home", bg: "#7C5CBF", activeBg: "#EDE9FB", activeColor: "#7C5CBF" },
  { path: "/admin", emoji: "⚙️", label: "Admin", bg: "#EF4444", activeBg: "#FEE2E2", activeColor: "#DC2626" },
  { path: "/teacher", emoji: "👩‍🏫", label: "Teacher", bg: "#06B6D4", activeBg: "#CFFAFE", activeColor: "#0891B2" },
  { path: "/profile", emoji: "👤", label: "Profile", bg: "#7C5CBF", activeBg: "#EDE9FB", activeColor: "#7C5CBF" },
];

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
    <circle cx="21" cy="23" r="1.5" fill="white" />
    <circle cx="37" cy="23" r="1.5" fill="white" />
    <polygon points="27,30 33,30 30,35" fill="#F4A261" />
  </svg>
);

export default function Sidebar() {
  const { user } = useAuthStore();
  const nav = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const role = user?.role || "student";

  const getLabel = (label) => {
    const map = {
      "Home": t("nav.home", "Home"),
      "My Subjects": t("nav.subjects", "My Subjects"),
      "Homework": t("nav.homework", "Homework"),
      "Quizzes": t("nav.quizzes", "Quizzes"),
      "Reels": t("nav.reels", "Reels"),
      "Achievements": t("nav.achievements", "Achievements"),
      "AI Tutor": t("nav.aiTutor", "AI Tutor"),
      "Offline Mode": t("nav.offline", "Offline Mode"),
      "Profile": t("nav.profile", "Profile"),
      "Overview": t("nav.overview", "Overview"),
      "Courses": t("nav.courses", "Courses"),
      "Classes": t("nav.classes", "Classes"),
      "Lessons": t("nav.lessons", "Lessons"),
      "Attendance": t("nav.attendance", "Attendance"),
      "Analytics": t("nav.analytics", "Analytics"),
      "Students": t("nav.students", "Students"),
      "Children": t("nav.children", "Children"),
      "Progress": t("nav.progress", "Progress"),
      "Reports": t("nav.reports", "Reports"),
      "Admin": t("nav.admin", "Admin"),
    };
    return map[label] || label;
  };

  const navItems =
    role === "teacher"
      ? NAV_TEACHER
      : role === "parent"
        ? NAV_PARENT
        : role === "admin"
          ? NAV_ADMIN
          : NAV_STUDENT;

  return (
    <nav
      style={{
        width: "195px",
        flexShrink: 0,
        background: "white",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px 16px",
        gap: "2px",
        boxShadow: "2px 0 12px rgba(108,99,255,.08)",
        overflow: "hidden",
        height: "100vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "22px", paddingLeft: "4px" }}>
        <div style={{ fontSize: "28px", lineHeight: 1 }}>🎓</div>
        <span style={{ fontFamily: "Baloo 2,cursive", fontWeight: 800, fontSize: "22px", color: "#7C5CBF", letterSpacing: "-0.5px" }}>
          VidyAI
        </span>
        <span style={{ fontSize: "16px", marginLeft: "-2px" }}>✨</span>
      </div>

      {navItems.map((item) => (
        <NavLink
          key={item.path + item.label}
          to={item.path}
          end={item.path === "/" || item.path === "/teacher" || item.path === "/parent"}
          style={({ isActive }) => {
            const active =
              role === "teacher" || role === "parent"
                ? `${location.pathname}${location.search}` === item.path
                : isActive;
            return {
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 12px",
              borderRadius: "14px",
              textDecoration: "none",
              background: active ? item.activeBg : "transparent",
              color: active ? item.activeColor : "#6B7280",
              fontWeight: 700,
              fontSize: "14px",
              fontFamily: "Nunito,sans-serif",
              transition: "all .15s",
              marginBottom: "2px",
            };
          }}
        >
          {({ isActive }) => {
            const active =
              role === "teacher" || role === "parent"
                ? `${location.pathname}${location.search}` === item.path
                : isActive;
            return (
              <>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    background: active ? item.bg : "#F3F4F6",
                  }}
                >
                  {item.emoji}
                </div>
                <span>{getLabel(item.label)}</span>
              </>
            );
          }}
        </NavLink>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        <NavLink
          to="/help"
          style={({ isActive }) => ({
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            padding: "8px 6px",
            borderRadius: "12px",
            textDecoration: "none",
            background: isActive ? "#EDE9FB" : "#F9FAFB",
            color: isActive ? "#7C5CBF" : "#6B7280",
            fontSize: "12px",
            fontWeight: 700,
            border: "1px solid",
            borderColor: isActive ? "#DDD6FE" : "#E5E7EB",
            transition: "all .15s",
          })}
        >
          <span>❓</span> {t("nav.help", { defaultValue: "Help" })}
        </NavLink>
        <NavLink
          to="/about"
          style={({ isActive }) => ({
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            padding: "8px 6px",
            borderRadius: "12px",
            textDecoration: "none",
            background: isActive ? "#EDE9FB" : "#F9FAFB",
            color: isActive ? "#7C5CBF" : "#6B7280",
            fontSize: "12px",
            fontWeight: 700,
            border: "1px solid",
            borderColor: isActive ? "#DDD6FE" : "#E5E7EB",
            transition: "all .15s",
          })}
        >
          <span>ℹ️</span> {t("nav.about", { defaultValue: "About" })}
        </NavLink>
      </div>

      {role === "teacher" ? (
        <RoleFooterCard
          icon="👩‍🏫"
          title="Teacher Help Desk"
          body="Plan lessons, ask AI, and manage your class day."
          gradient="linear-gradient(135deg,#E0F2FE,#EDE9FE)"
          onClick={() => nav("/chat")}
        />
      ) : role === "parent" ? (
        <RoleFooterCard
          icon="👨‍👩‍👧"
          title="Family Learning Hub"
          body="Track progress, attendance, and reports for your children."
          gradient="linear-gradient(135deg,#FFF3E8,#EDE9FE)"
          onClick={() => nav("/parent")}
        />
      ) : (
        <div
          style={{
            background: "linear-gradient(135deg,#EDE9FB,#D8D0F8)",
            borderRadius: "18px",
            padding: "14px 12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
          }}
          onClick={() => nav("/chat")}
        >
          <OwlSvg />
          <div>
            <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "13px", fontWeight: 800, color: "#2D2359", lineHeight: 1.2 }}>
              Hey Superstar! 🌟
            </div>
            <div style={{ fontSize: "11px", color: "#7C5CBF", fontWeight: 600, marginTop: "2px", lineHeight: 1.3 }}>
              Keep learning and shine bright!
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function RoleFooterCard({ icon, title, body, gradient, onClick }) {
  return (
    <div
      style={{
        background: gradient,
        borderRadius: "18px",
        padding: "14px 12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "16px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          flexShrink: 0,
          boxShadow: "0 8px 20px rgba(108,99,255,.12)",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "13px", fontWeight: 800, color: "#2D2359", lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: "11px", color: "#6B5ACD", fontWeight: 600, marginTop: "2px", lineHeight: 1.3 }}>
          {body}
        </div>
      </div>
    </div>
  );
}
