import { card, Btn } from "./TeacherUI";

export function findAttendancePct(rows = [], classNumber) {
  const row = rows.find((r) => r.classNumber === classNumber);
  return row ? Math.round(row.attendancePct || 0) : 0;
}

export function miniActionStyle(color) {
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

export function TeacherHero({
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

export function TeacherWorkspaceIllustration() {
  return (
    <svg viewBox="0 0 280 220" style={{ width: "100%", maxWidth: "280px" }}>
      <rect
        x="38"
        y="42"
        width="170"
        height="110"
        rx="18"
        fill="#EEF2FF"
        stroke="#C7D2FE"
        strokeWidth="3"
      />
      <rect x="52" y="56" width="70" height="8" rx="4" fill="#6366F1" />
      <rect x="52" y="72" width="130" height="6" rx="3" fill="#E0E7FF" />
      <rect x="52" y="86" width="105" height="6" rx="3" fill="#E0E7FF" />
      <rect x="52" y="100" width="85" height="6" rx="3" fill="#E0E7FF" />
      <circle cx="188" cy="116" r="30" fill="#FEF3C7" />
      <path
        d="M174 126c6-14 22-14 28 0"
        stroke="#D97706"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="182" cy="110" r="4" fill="#D97706" />
      <circle cx="194" cy="110" r="4" fill="#D97706" />
    </svg>
  );
}

export function MetricCard({ value, label, icon, gradient }) {
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

export function QuickActionGrid({ actions }) {
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

export function InsightPanel({ title, icon, items }) {
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

export function OverviewRow({ label, value }) {
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

export function ClassOverviewGrid({
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

export function ActivityFeed({ items = [] }) {
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

export function AnalyticsCard({ title, value, caption, color, icon }) {
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

export function AnalyticsList({ title, items = [], emptyLabel, renderMeta }) {
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
