import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/stores";

const NAV_BY_ROLE = {
  student: [
    { path: "/", emoji: "🏠", label: "Home" },
    { path: "/subjects", emoji: "📚", label: "Subjects" },
    { path: "/assignments", emoji: "📂", label: "Homework" },
    { path: "/quiz", emoji: "✏️", label: "Quiz" },
    { path: "/profile", emoji: "👤", label: "Profile" },
  ],
  teacher: [
    { path: "/teacher", emoji: "📊", label: "Overview" },
    { path: "/teacher?tab=courses", emoji: "📚", label: "Courses" },
    { path: "/teacher?tab=lessons", emoji: "📝", label: "Lessons" },
    { path: "/teacher?tab=quiz", emoji: "✏️", label: "Quizzes" },
    { path: "/profile", emoji: "👤", label: "Profile" },
  ],
  parent: [
    { path: "/parent", emoji: "📊", label: "Overview" },
    { path: "/parent?tab=children", emoji: "👨‍👩‍👧", label: "Children" },
    { path: "/parent?tab=progress", emoji: "📈", label: "Progress" },
    { path: "/parent?tab=reports", emoji: "🧾", label: "Reports" },
    { path: "/profile", emoji: "👤", label: "Profile" },
  ],
  admin: [
    { path: "/", emoji: "🏠", label: "Home" },
    { path: "/admin", emoji: "⚙️", label: "Admin" },
    { path: "/teacher", emoji: "👩‍🏫", label: "Teacher" },
    { path: "/profile", emoji: "👤", label: "Profile" },
  ],
};

export default function BottomNav() {
  const { user } = useAuthStore();
  const location = useLocation();
  const role = user?.role || "student";
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.student;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "1px solid #E5E7EB",
        padding: "6px 0 max(10px, env(safe-area-inset-bottom, 10px))",
        zIndex: 50,
        boxShadow: "0 -4px 20px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {items.map((item) => {
          const isTabActive = item.path.includes("?tab=")
            ? `${location.pathname}${location.search}` === item.path
            : location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/" || item.path === "/teacher" || item.path === "/parent"}
              style={({ isActive }) => {
                const active = isTabActive || isActive;
                return {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  textDecoration: "none",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  minWidth: "52px",
                  color: active ? "#7C5CBF" : "#9CA3AF",
                  fontFamily: "Nunito,sans-serif",
                };
              }}
            >
              {({ isActive }) => {
                const active = isTabActive || isActive;
                return (
                  <>
                    <div
                      style={{
                        fontSize: "22px",
                        lineHeight: 1,
                        filter: active ? "none" : "grayscale(50%) opacity(0.6)",
                      }}
                    >
                      {item.emoji}
                    </div>
                    <span
                      style={{ fontSize: "10px", fontWeight: active ? 800 : 600 }}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <div
                        style={{
                          width: "20px",
                          height: "3px",
                          background: "#7C5CBF",
                          borderRadius: "2px",
                          marginTop: "1px",
                        }}
                      />
                    )}
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
