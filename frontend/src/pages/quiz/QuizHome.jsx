import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/stores";
import api from "../../services/api";

const COLORS = [
  "#CFFAFE",
  "#EEF0FF",
  "#DCFCE7",
  "#FEF9C3",
  "#FCE7F3",
  "#FFEDD5",
];
const FG = ["#06B6D4", "#6C63FF", "#22C55E", "#F59E0B", "#EC4899", "#F97316"];

export default function QuizHome() {
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (user?.class) params.set("class", user.class);
        if (filter) params.set("subject", filter);
        const { data } = await api.get(`/quiz?${params}`);
        setQuizzes(data.quizzes || []);
      } catch (e) {
        console.error(e.message);
      }
      setLoading(false);
    };
    load();
  }, [filter]);

  return (
    <div className="anim-slide-up">
      <h1
        style={{
          fontFamily: "Baloo 2,cursive",
          fontSize: "22px",
          fontWeight: 800,
          marginBottom: "16px",
        }}
      >
        ✏️ Smart Quizzes
      </h1>

      {/* Subject filter */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {["", "Mathematics", "Science", "English", "Marathi", "GK"].map(
          (s, i) => (
            <span
              key={s || "all"}
              onClick={() => setFilter(s)}
              style={{
                padding: "8px 16px",
                borderRadius: "40px",
                background: filter === s ? "#6C63FF" : "#F3F4F6",
                color: filter === s ? "#fff" : "#6B7280",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {s || "🔥 All"}
            </span>
          ),
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
          <div>Loading quizzes...</div>
        </div>
      ) : quizzes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#9CA3AF",
            background: "#fff",
            borderRadius: "20px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✏️</div>
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "18px",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            No quizzes yet
          </div>
          <div style={{ fontSize: "13px" }}>
            Ask your teacher to create quizzes for Class {user?.class || 5}!
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: "16px",
          }}
        >
          {quizzes.map((q, idx) => {
            const bg = COLORS[idx % COLORS.length];
            const fg = FG[idx % FG.length];
            return (
              <div
                key={q._id}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "20px",
                  boxShadow: "0 4px 20px rgba(0,0,0,.07)",
                  cursor: "pointer",
                  transition: "transform .2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
                onClick={() => nav(`/quiz/${q._id}`)}
              >
                <div
                  style={{
                    background: bg,
                    borderRadius: "12px",
                    padding: "12px",
                    marginBottom: "12px",
                    fontSize: "28px",
                    width: "52px",
                    height: "52px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✏️
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "15px",
                    marginBottom: "4px",
                  }}
                >
                  {q.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9CA3AF",
                    marginBottom: "12px",
                  }}
                >
                  {q.subject} · {q.questions?.length || 0} questions · Class{" "}
                  {q.class}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      background: bg,
                      color: fg,
                      borderRadius: "20px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    ⭐ +{q.xpReward || 20} XP
                  </span>
                  <button
                    style={{
                      background: fg,
                      color: "#fff",
                      border: "none",
                      borderRadius: "20px",
                      padding: "6px 16px",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Start →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
