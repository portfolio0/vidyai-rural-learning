import { useState, useEffect } from "react";
import { useAuthStore, useProgressStore } from "../../store/stores";
import api from "../../services/api";

const BADGE_DEFS = [
  {
    key: "first_lesson",
    name: "First Star",
    icon: "⭐",
    color: "#FEF9C3",
    desc: "Complete your first lesson on VidyAI",
  },
  {
    key: "streak_7",
    name: "Streak 7",
    icon: "🔥",
    color: "#FFEDD5",
    desc: "Maintain a 7-day learning streak",
  },
  {
    key: "top_reader",
    name: "Top Reader",
    icon: "📚",
    color: "#DCFCE7",
    desc: "Complete 5 or more educational lessons",
  },
  {
    key: "quiz_master",
    name: "Quiz Master",
    icon: "🧠",
    color: "#EEF0FF",
    desc: "Score 100% on a challenging quiz",
  },
  {
    key: "champion",
    name: "Champion",
    icon: "🏆",
    color: "#CFFAFE",
    desc: "Accumulate over 1,000 XP in learning",
  },
  {
    key: "explorer",
    name: "Explorer",
    icon: "🌍",
    color: "#FEF9C3",
    desc: "Study multiple subjects across terms",
  },
  {
    key: "genius",
    name: "Genius",
    icon: "💡",
    color: "#EEF0FF",
    desc: "Earn 2,000 XP through mastery",
  },
];

const card = {
  background: "#fff",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 4px 24px rgba(108,99,255,.1)",
};

export default function Rewards() {
  const { user } = useAuthStore();
  const {
    xp: localXp,
    coins,
    level: localLevel,
    streak: localStreak,
  } = useProgressStore();
  const [student, setStudent] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, lbRes, badgeRes] = await Promise.allSettled([
          api.get("/student/dashboard"),
          api.get("/student/leaderboard"),
          api.get("/student/badges"),
        ]);
        if (dashRes.status === "fulfilled") {
          setStudent(dashRes.value.data.student);
        }
        if (lbRes.status === "fulfilled") {
          setLeaderboard(lbRes.value.data.leaderboard || []);
        }
        if (badgeRes.status === "fulfilled") {
          setEarnedBadges(badgeRes.value.data.earnedBadges || []);
        }
      } catch (e) {
        console.error(e.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const xp = student?.xp ?? localXp;
  const level = student?.level ?? localLevel;
  const streak = student?.streakCurrent ?? localStreak;
  const lessons = student?.lessonsCompleted ?? 0;

  // Match against real badges stored in database
  const earnedKeys = new Set(
    earnedBadges.map((b) => (typeof b === "object" ? b.condition || b.name : b))
  );

  const badges = BADGE_DEFS.map((b) => {
    const isEarned =
      earnedKeys.has(b.key) ||
      earnedKeys.has(b.name) ||
      (b.key === "first_lesson" && lessons >= 1) ||
      (b.key === "streak_7" && streak >= 7) ||
      (b.key === "top_reader" && lessons >= 5) ||
      (b.key === "champion" && xp >= 1000) ||
      (b.key === "genius" && xp >= 2000);

    return {
      ...b,
      earned: Boolean(isEarned),
    };
  });

  return (
    <div className="anim-slide-up" style={{ width: "100%", boxSizing: "border-box" }}>
      <h1
        style={{
          fontFamily: "Baloo 2,cursive",
          fontSize: isMobile ? "20px" : "22px",
          fontWeight: 800,
          marginBottom: "20px",
        }}
      >
        🏆 Rewards & Badges
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
          marginBottom: "20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            ...card,
            background: "linear-gradient(135deg,#6C63FF,#9F95FF)",
            color: "#fff",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "4px" }}>
            Your Level
          </div>
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: isMobile ? "40px" : "52px",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            Lv.{level}
          </div>
          <div
            style={{
              height: "10px",
              background: "rgba(255,255,255,.3)",
              borderRadius: "5px",
              margin: "12px 0 6px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(((xp % 500) / 500) * 100, 100)}%`,
                background: "#fff",
                borderRadius: "5px",
              }}
            />
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            {xp} XP · {500 - (xp % 500)} to next level
          </div>
        </div>
        <div
          style={{
            ...card,
            background: "linear-gradient(135deg,#F59E0B,#FBBF24)",
            color: "#fff",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "4px" }}>
            VidyaCoins
          </div>
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: isMobile ? "40px" : "52px",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            🪙{student?.coins ?? coins}
          </div>
          <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "12px" }}>
            🔥 {streak} day streak
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <div
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "17px",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          🏅 Your Badges
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {badges.map((b) => (
            <div
              key={b.key}
              title={b.desc}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                opacity: b.earned ? 1 : 0.35,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: b.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  transition: "transform .2s",
                }}
                onMouseEnter={(e) =>
                  b.earned && (e.currentTarget.style.transform = "scale(1.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {b.icon}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textAlign: "center",
                  maxWidth: "64px",
                  color: "#6B7280",
                }}
              >
                {b.name}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: b.earned ? "#22C55E" : "#9CA3AF",
                  fontWeight: 700,
                }}
              >
                {b.earned ? "✅ Earned" : "Locked"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div style={card}>
        <div
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "17px",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          🏆 Class {student?.class || user?.class || 5} Leaderboard
        </div>
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#9CA3AF" }}
          >
            ⏳ Loading...
          </div>
        ) : leaderboard.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#9CA3AF",
              fontSize: "13px",
            }}
          >
            No other students in your class yet. Invite classmates! 👋
          </div>
        ) : (
          leaderboard.map((s) => (
            <div
              key={s.rank}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px",
                borderRadius: "12px",
                marginBottom: "4px",
                background: s.me ? "#EEF0FF" : "transparent",
                border: s.me ? "1px solid #C7D2FE" : "1px solid transparent",
              }}
            >
              <div
                style={{
                  fontFamily: "Baloo 2,cursive",
                  fontSize: "18px",
                  fontWeight: 800,
                  width: "28px",
                  textAlign: "center",
                  color:
                    s.rank === 1
                      ? "#F59E0B"
                      : s.rank === 2
                        ? "#9CA3AF"
                        : s.rank === 3
                          ? "#F97316"
                          : "#6B7280",
                }}
              >
                {s.rank === 1
                  ? "🥇"
                  : s.rank === 2
                    ? "🥈"
                    : s.rank === 3
                      ? "🥉"
                      : s.rank}
              </div>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: s.me ? "#6C63FF" : "#EEF0FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  color: s.me ? "#fff" : "#6C63FF",
                  fontSize: "14px",
                }}
              >
                {s.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>
                  {s.name}
                  {s.me ? " (You)" : ""}
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                  Class {s.class} · Lv.{s.level}
                </div>
              </div>
              <div
                style={{
                  fontWeight: 800,
                  color: "#6C63FF",
                  fontFamily: "Baloo 2,cursive",
                }}
              >
                ⭐ {s.xp.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
