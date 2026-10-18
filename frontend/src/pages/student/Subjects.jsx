import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/stores";
import api from "../../services/api";

const META = {
  Mathematics: { icon: "➕", bg: "#EEF0FF", fg: "#6C63FF" },
  Science: { icon: "🔬", bg: "#CFFAFE", fg: "#06B6D4" },
  English: { icon: "📖", bg: "#DCFCE7", fg: "#22C55E" },
  Marathi: { icon: "📜", bg: "#FEF9C3", fg: "#F59E0B" },
  Hindi: { icon: "🕉️", bg: "#FCE7F3", fg: "#EC4899" },
  "Social Studies": { icon: "🌍", bg: "#CFFAFE", fg: "#0891B2" },
  Computer: { icon: "💻", bg: "#EEF0FF", fg: "#7C3AED" },
  GK: { icon: "🧠", bg: "#FFEDD5", fg: "#EA580C" },
  EVS: { icon: "🌿", bg: "#DCFCE7", fg: "#16A34A" },
};

export default function Subjects() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // courseId showing lessons

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(
          `/content/courses?class=${user?.class || 5}`,
        );
        setCourses(data.courses || []);
      } catch (e) {
        console.error(e.message);
      }
      setLoading(false);
    };
    load();
  }, [user?.class]);

  const toggleCourse = async (course) => {
    if (expanded === course._id) {
      setExpanded(null);
      return;
    }
    setExpanded(course._id);
    // Load full course with lessons if not loaded
    if (!course.chaptersLoaded) {
      try {
        const { data } = await api.get(`/content/courses/${course._id}`);
        setCourses((c) =>
          c.map((x) =>
            x._id === course._id ? { ...data.course, chaptersLoaded: true } : x,
          ),
        );
      } catch (e) {
        console.error(e.message);
      }
    }
  };

  // Group by subject
  const bySubject = courses.reduce((acc, c) => {
    if (!acc[c.subject]) acc[c.subject] = [];
    acc[c.subject].push(c);
    return acc;
  }, {});

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
        <div>Loading subjects...</div>
      </div>
    );

  if (Object.keys(bySubject).length === 0)
    return (
      <div className="anim-slide-up">
        <h1
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "22px",
            fontWeight: 800,
            marginBottom: "20px",
          }}
        >
          📚 {t("nav.subjects", { defaultValue: "My Subjects" })}
        </h1>
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,.06)",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>📚</div>
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            No content yet
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#9CA3AF",
              maxWidth: "280px",
              margin: "0 auto",
            }}
          >
            Your teacher hasn't uploaded any courses for Class{" "}
            {user?.class || 5} yet. Check back soon!
          </div>
        </div>
      </div>
    );

  return (
    <div className="anim-slide-up">
      <h1
        style={{
          fontFamily: "Baloo 2,cursive",
          fontSize: "22px",
          fontWeight: 800,
          marginBottom: "20px",
        }}
      >
        📚 {t("nav.subjects", { defaultValue: "My Subjects" })}
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
          gap: "16px",
        }}
      >
        {Object.entries(bySubject).map(([subject, subCourses]) => {
          const m = META[subject] || {
            icon: "📖",
            bg: "#F3F4F6",
            fg: "#6B7280",
          };
          const totalLessons = subCourses.reduce(
            (s, c) => s + (c.chapters?.length || 0),
            0,
          );
          return (
            <div
              key={subject}
              style={{
                background: "#fff",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,.06)",
              }}
            >
              {/* Subject Header */}
              <div
                style={{
                  padding: "18px",
                  background: m.bg,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "#fff",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    flexShrink: 0,
                  }}
                >
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "16px" }}>
                    {subject}
                  </div>
                  <div
                    style={{ fontSize: "12px", color: m.fg, fontWeight: 700 }}
                  >
                    Class {user?.class || 5} · {subCourses.length} course
                    {subCourses.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              {/* Courses */}
              <div style={{ padding: "12px" }}>
                {subCourses.map((c) => (
                  <div key={c._id}>
                    <div
                      onClick={() => toggleCourse(c)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 8px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background:
                          expanded === c._id ? "#EEF0FF" : "transparent",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "13px" }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                          👩‍🏫 {c.teacher?.name || "Teacher"} ·{" "}
                          {c.chapters?.length || 0} chapters
                        </div>
                      </div>
                      <span style={{ color: m.fg, fontSize: "18px" }}>
                        {expanded === c._id ? "▲" : "▼"}
                      </span>
                    </div>
                    {/* Chapters/Lessons expanded */}
                    {expanded === c._id && (
                      <div style={{ paddingLeft: "8px", paddingBottom: "8px" }}>
                        {!c.chaptersLoaded ? (
                          <div
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#9CA3AF",
                              fontSize: "12px",
                            }}
                          >
                            ⏳ Loading chapters...
                          </div>
                        ) : !c.chapters?.length ? (
                          <div
                            style={{
                              padding: "12px",
                              color: "#9CA3AF",
                              fontSize: "12px",
                            }}
                          >
                            No chapters yet.
                          </div>
                        ) : (
                          c.chapters.map((ch) => (
                            <div key={ch._id}>
                              <div
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  color: m.fg,
                                  padding: "6px 0 4px",
                                  textTransform: "uppercase",
                                  letterSpacing: ".5px",
                                }}
                              >
                                {ch.title}
                              </div>
                              {ch.lessons?.map((lesson) => (
                                <div
                                  key={lesson._id}
                                  onClick={() => nav(`/lesson/${lesson._id}`)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 10px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    marginBottom: "2px",
                                    background: "#F9FAFB",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "#EEF0FF")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      "#F9FAFB")
                                  }
                                >
                                  <span style={{ fontSize: "14px" }}>▶</span>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      flex: 1,
                                    }}
                                  >
                                    {lesson.title}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      color: "#9CA3AF",
                                    }}
                                  >
                                    {lesson.duration || "—"} min
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
