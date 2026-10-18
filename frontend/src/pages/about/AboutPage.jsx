import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/stores";
import { useVoice } from "../../hooks/useVoice";

export default function AboutPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const langCode = user?.language === "mr" ? "mr-IN" : user?.language === "hi" ? "hi-IN" : "en-IN";
  const { speak } = useVoice({ language: langCode });

  const PILLARS = [
    {
      icon: "🌐",
      title: "Vernacular First",
      subtitle: "मराठी • हिंदी • English",
      desc: "Deep native localization so rural students learn in the languages they speak at home, with built-in voice read-aloud and speech recognition.",
      bg: "#EEF0FF",
      border: "#C7D2FE",
      color: "#4338CA",
    },
    {
      icon: "📶",
      title: "Offline-First Resilience",
      subtitle: "Zero-Internet Learning",
      desc: "Built ground-up for intermittent power and patchy rural connectivity. Download lessons once and continue video playback, summaries, and quizzes offline.",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      color: "#065F46",
    },
    {
      icon: "🤖",
      title: "Child-Safe AI Tutor",
      subtitle: "Pedagogical Guardrails",
      desc: "Powered by carefully tuned LLMs designed to explain concepts simply, encourage curiosity, and maintain strict child-safety boundaries.",
      bg: "#FDF2F8",
      border: "#FBCFE8",
      color: "#9D174D",
    },
    {
      icon: "👨‍👩‍👧",
      title: "Tri-Party Synergy",
      subtitle: "Students • Teachers • Parents",
      desc: "A unified platform connecting classrooms and households. Teachers assign and grade homework while parents monitor attendance and real-time report cards.",
      bg: "#FFFBEB",
      border: "#FDE68A",
      color: "#92400E",
    },
    {
      icon: "🎮",
      title: "Gamified Motivation",
      subtitle: "XP, Badges & Streaks",
      desc: "Turning consistent study habits into rewarding milestones. Students earn XP for completed lessons and climb joyful learning levels.",
      bg: "#F5F3FF",
      border: "#DDD6FE",
      color: "#5B21B6",
    },
    {
      icon: "📱",
      title: "Ultra-Lightweight PWA",
      subtitle: "Runs on Entry-Level Phones",
      desc: "Compressed video streaming, low memory consumption, and installable PWA designed for shared low-cost Android phones in rural households.",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      color: "#1E40AF",
    },
  ];

  const IMPACT_STATS = [
    { number: "10,000+", label: "Rural Students", icon: "🎒" },
    { number: "500+", label: "Village Educators", icon: "👩‍🏫" },
    { number: "100%", label: "Curriculum Aligned", icon: "📚" },
    { number: "100%", label: "Free & Open Access", icon: "❤️" },
  ];

  return (
    <div
      className="anim-slide-up"
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        paddingBottom: "40px",
        boxSizing: "border-box",
      }}
    >
      {/* Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)",
          borderRadius: "28px",
          padding: isMobile ? "22px 16px" : "32px 28px",
          color: "white",
          marginBottom: "24px",
          boxShadow: "0 10px 32px rgba(30,27,75,0.25)",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: isMobile ? "44px" : "52px",
                  height: isMobile ? "44px" : "52px",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "24px" : "30px",
                  backdropFilter: "blur(6px)",
                  flexShrink: 0,
                }}
              >
                🎓
              </div>
              <div>
                <h1 style={{ fontFamily: "Baloo 2, cursive", fontSize: isMobile ? "24px" : "30px", fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                  About VidyAI ✨
                </h1>
                <div style={{ fontSize: isMobile ? "12px" : "14px", color: "#A5B4FC", fontWeight: 700 }}>
                  Rural & Vernacular AI Learning Platform (Classes 1–10)
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                speak("About VidyAI: An AI-powered learning platform designed to bridge the digital and educational divide for rural children across India.")
              }
              style={{
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                borderRadius: "30px",
                padding: "6px 14px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>🔊</span> Read Aloud
            </button>
          </div>

          <p style={{ marginTop: "16px", fontSize: isMobile ? "14px" : "16px", lineHeight: 1.6, opacity: 0.95, maxWidth: "680px" }}>
            VidyAI was founded with a singular mission: to make world-class, personalized, and interactive education accessible to every village child in India, regardless of internet connectivity, language barriers, or device limitations.
          </p>
        </div>

        {/* Ambient background glow */}
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "-40px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,92,191,0.4) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Impact Numbers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))",
          gap: isMobile ? "10px" : "14px",
          marginBottom: "24px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {IMPACT_STATS.map((stat, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: "18px",
              padding: isMobile ? "14px 10px" : "20px 16px",
              textAlign: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              border: "1px solid #E5E7EB",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: isMobile ? "22px" : "28px", marginBottom: "4px" }}>{stat.icon}</div>
            <div
              style={{
                fontFamily: "Baloo 2, cursive",
                fontSize: isMobile ? "20px" : "26px",
                fontWeight: 800,
                color: "#1E1B4B",
                lineHeight: 1.1,
              }}
            >
              {stat.number}
            </div>
            <div style={{ fontSize: isMobile ? "11px" : "13px", fontWeight: 700, color: "#6B7280", marginTop: "3px" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Core Architectural Pillars */}
      <div style={{ marginBottom: "28px", width: "100%", boxSizing: "border-box" }}>
        <h2 style={{ fontFamily: "Baloo 2, cursive", fontSize: isMobile ? "20px" : "24px", fontWeight: 800, color: "#1E1B4B", marginBottom: "16px" }}>
          Core Innovations & Pillars 🏛️
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "14px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {PILLARS.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: "white",
                borderRadius: "20px",
                padding: isMobile ? "16px 14px" : "20px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                border: `1.5px solid ${p.border}`,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: p.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  {p.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "15px", color: "#1E1B4B" }}>{p.title}</div>
                  <div style={{ fontSize: "11.5px", fontWeight: 700, color: p.color }}>{p.subtitle}</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#4B5563", lineHeight: 1.55 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Rural Education Needs VidyAI */}
      <div
        style={{
          background: "white",
          borderRadius: "22px",
          padding: isMobile ? "18px 14px" : "26px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          marginBottom: "24px",
          border: "1px solid #E5E7EB",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ fontFamily: "Baloo 2, cursive", fontSize: isMobile ? "20px" : "22px", fontWeight: 800, color: "#1E1B4B", marginBottom: "10px" }}>
          Why We Built VidyAI 🌾
        </h2>
        <p style={{ color: "#4B5563", fontSize: isMobile ? "13.5px" : "15px", lineHeight: 1.6, margin: "0 0 12px" }}>
          In thousands of rural schools across Maharashtra and India, single teachers often manage multi-grade classrooms with limited textbook supplies. When children return home, parents often do not have the academic background to assist with English or Mathematics homework, and home internet is either unavailable or limited to low-cost prepaid data packs.
        </p>
        <p style={{ color: "#4B5563", fontSize: isMobile ? "13.5px" : "15px", lineHeight: 1.6, margin: 0 }}>
          VidyAI serves as an always-present, patient digital tutor. Children can ask questions by speaking in Marathi or Hindi, receive clear visual explanations, take self-paced quizzes without burning mobile data, and feel the excitement of learning through gentle gamification.
        </p>
      </div>

      {/* Call to action navigation */}
      <div
        style={{
          background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
          borderRadius: "20px",
          padding: isMobile ? "18px 14px" : "24px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: "14px",
          border: "1px solid #C7D2FE",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div>
          <div style={{ fontFamily: "Baloo 2, cursive", fontSize: isMobile ? "18px" : "20px", fontWeight: 800, color: "#312E81" }}>
            Ready to explore lessons? 🚀
          </div>
          <div style={{ fontSize: "12.5px", color: "#4338CA", marginTop: "2px" }}>
            Start studying your curriculum subjects or talk to your AI tutor.
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => nav("/subjects")}
            style={{
              flex: isMobile ? 1 : "initial",
              background: "#4338CA",
              color: "white",
              border: "none",
              borderRadius: "30px",
              padding: "10px 18px",
              fontWeight: 800,
              fontSize: "13.5px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(67,56,202,0.25)",
            }}
          >
            📚 My Subjects
          </button>
          <button
            onClick={() => nav("/chat")}
            style={{
              flex: isMobile ? 1 : "initial",
              background: "white",
              color: "#4338CA",
              border: "2px solid #4338CA",
              borderRadius: "30px",
              padding: "10px 16px",
              fontWeight: 800,
              fontSize: "13.5px",
              cursor: "pointer",
            }}
          >
            🤖 AI Tutor
          </button>
        </div>
      </div>
    </div>
  );
}
