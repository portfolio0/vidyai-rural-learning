import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore, useProgressStore } from "../../store/stores";
import { useNavigate } from "react-router-dom";
import { useVoice } from "../../hooks/useVoice";
import api from "../../services/api";

/* ─── SVG Illustrations ─────────────────────────────────────────────── */
const IllustrationSchool = () => (
  <svg
    viewBox="0 0 320 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <ellipse cx="60" cy="35" rx="28" ry="16" fill="white" opacity=".9" />
    <ellipse cx="80" cy="28" rx="22" ry="14" fill="white" opacity=".9" />
    <ellipse cx="45" cy="30" rx="18" ry="12" fill="white" opacity=".9" />
    <ellipse cx="200" cy="25" rx="24" ry="14" fill="white" opacity=".85" />
    <ellipse cx="220" cy="18" rx="20" ry="12" fill="white" opacity=".85" />
    <ellipse cx="185" cy="22" rx="16" ry="10" fill="white" opacity=".85" />
    <rect y="148" width="320" height="52" fill="#7EC850" />
    <rect y="162" width="320" height="38" fill="#5FAF30" />
    <circle cx="20" cy="153" r="6" fill="#FFD700" />
    <circle cx="50" cy="157" r="5" fill="#FF6B9D" />
    <circle cx="280" cy="155" r="6" fill="#FFD700" />
    <circle cx="300" cy="150" r="5" fill="#FF6B9D" />
    <rect x="100" y="68" width="140" height="88" fill="#F4A261" rx="4" />
    <rect x="100" y="58" width="140" height="20" fill="#E76F51" rx="4" />
    <polygon points="110,58 240,58 175,18" fill="#C1440E" />
    <rect x="175" y="4" width="18" height="12" fill="#FF4444" rx="1" />
    <rect x="115" y="83" width="30" height="28" fill="#AED9E0" rx="4" />
    <rect x="155" y="83" width="30" height="28" fill="#AED9E0" rx="4" />
    <rect x="195" y="83" width="30" height="28" fill="#AED9E0" rx="4" />
    <rect x="158" y="120" width="32" height="36" fill="#8B5E3C" rx="3" />
    <circle cx="181" cy="139" r="2.5" fill="#FFD700" />
    <circle
      cx="175"
      cy="46"
      r="10"
      fill="white"
      stroke="#E76F51"
      strokeWidth="2"
    />
    <line x1="175" y1="39" x2="175" y2="46" stroke="#333" strokeWidth="1.5" />
    <line x1="175" y1="46" x2="180" y2="46" stroke="#333" strokeWidth="1.5" />
    <rect x="62" y="108" width="8" height="40" fill="#8B5E3C" />
    <ellipse cx="66" cy="93" rx="22" ry="28" fill="#4CAF50" />
    <ellipse cx="66" cy="85" rx="16" ry="20" fill="#66BB6A" />
    <rect x="252" y="110" width="8" height="38" fill="#8B5E3C" />
    <ellipse cx="256" cy="96" rx="22" ry="26" fill="#4CAF50" />
    <ellipse cx="256" cy="88" rx="15" ry="18" fill="#66BB6A" />
  </svg>
);

const IllustrationKidReading = () => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <ellipse cx="30" cy="40" rx="25" ry="14" fill="#E8F4FD" opacity=".8" />
    <ellipse cx="170" cy="30" rx="20" ry="12" fill="#E8F4FD" opacity=".8" />
    <ellipse cx="100" cy="185" rx="75" ry="20" fill="#A8E063" opacity=".5" />
    <rect x="70" y="95" width="60" height="65" rx="20" fill="#7C5CBF" />
    <circle cx="100" cy="70" r="30" fill="#FDBCB4" />
    <ellipse cx="100" cy="45" rx="30" ry="15" fill="#4A3728" />
    <ellipse cx="72" cy="58" rx="10" ry="14" fill="#4A3728" />
    <ellipse cx="128" cy="58" rx="10" ry="14" fill="#4A3728" />
    <circle cx="90" cy="68" r="5" fill="white" />
    <circle cx="110" cy="68" r="5" fill="white" />
    <circle cx="91" cy="69" r="3" fill="#4A3728" />
    <circle cx="111" cy="69" r="3" fill="#4A3728" />
    <circle cx="92" cy="68" r="1" fill="white" />
    <circle cx="112" cy="68" r="1" fill="white" />
    <path
      d="M92 80 Q100 88 108 80"
      stroke="#D47B6B"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="70" cy="72" r="8" fill="#FDBCB4" />
    <circle cx="130" cy="72" r="8" fill="#FDBCB4" />
    <rect x="52" y="118" width="40" height="30" rx="4" fill="#FF8C42" />
    <rect x="92" y="118" width="40" height="30" rx="4" fill="#FF6B20" />
    <line x1="92" y1="118" x2="92" y2="148" stroke="#fff" strokeWidth="2" />
    <text x="148" y="110" fontSize="16" fill="#FFD700">
      ✦
    </text>
    <text x="20" y="130" fontSize="12" fill="#FFD700">
      ✦
    </text>
    <rect x="78" y="158" width="18" height="28" rx="9" fill="#4A90D9" />
    <rect x="104" y="158" width="18" height="28" rx="9" fill="#4A90D9" />
    <rect x="74" y="178" width="24" height="12" rx="6" fill="#F4A261" />
    <rect x="102" y="178" width="24" height="12" rx="6" fill="#F4A261" />
  </svg>
);

const IllustrationOwl = () => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <circle cx="40" cy="40" r="38" fill="#7C5CBF" />
    <ellipse cx="40" cy="50" rx="22" ry="26" fill="#9B7DD4" />
    <polygon points="22,20 28,8 34,20" fill="#7C5CBF" />
    <polygon points="46,20 52,8 58,20" fill="#7C5CBF" />
    <circle cx="30" cy="28" r="10" fill="white" />
    <circle cx="50" cy="28" r="10" fill="white" />
    <circle cx="30" cy="28" r="6" fill="#4A3728" />
    <circle cx="50" cy="28" r="6" fill="#4A3728" />
    <circle cx="28" cy="26" r="2" fill="white" />
    <circle cx="48" cy="26" r="2" fill="white" />
    <polygon points="36,34 44,34 40,40" fill="#F4A261" />
    <rect x="22" y="14" width="36" height="6" rx="2" fill="#2D2D2D" />
    <polygon points="22,14 58,14 40,4" fill="#2D2D2D" />
    <line x1="54" y1="12" x2="60" y2="22" stroke="#FFD700" strokeWidth="2" />
    <circle cx="60" cy="24" r="3" fill="#FFD700" />
    <ellipse cx="40" cy="55" rx="12" ry="14" fill="#C4A8E8" opacity=".5" />
  </svg>
);

const IllustrationFireFlame = () => (
  <svg
    viewBox="0 0 80 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <path
      d="M40 10 C30 25 15 30 18 50 C20 65 30 75 40 78 C50 75 60 65 62 50 C65 30 50 25 40 10Z"
      fill="#FF6B35"
    />
    <path
      d="M40 25 C33 35 25 40 27 55 C29 65 35 72 40 74 C45 72 51 65 53 55 C55 40 47 35 40 25Z"
      fill="#FF8C42"
    />
    <path
      d="M40 40 C36 48 32 52 34 60 C36 66 38 70 40 71 C42 70 44 66 46 60 C48 52 44 48 40 40Z"
      fill="#FFD166"
    />
    <circle cx="33" cy="55" r="4" fill="white" />
    <circle cx="47" cy="55" r="4" fill="white" />
    <circle cx="34" cy="56" r="2.5" fill="#333" />
    <circle cx="48" cy="56" r="2.5" fill="#333" />
    <circle cx="33.5" cy="55" r="1" fill="white" />
    <circle cx="47.5" cy="55" r="1" fill="white" />
    <path
      d="M34 63 Q40 68 46 63"
      stroke="#333"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const IllustrationStar = () => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <polygon
      points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
      fill="#FFD700"
      stroke="#F4A020"
      strokeWidth="2"
    />
    <ellipse cx="38" cy="48" rx="6" ry="7" fill="white" />
    <ellipse cx="62" cy="48" rx="6" ry="7" fill="white" />
    <ellipse cx="39" cy="50" rx="4" ry="5" fill="#333" />
    <ellipse cx="63" cy="50" rx="4" ry="5" fill="#333" />
    <circle cx="38" cy="47" r="1.5" fill="white" />
    <circle cx="62" cy="47" r="1.5" fill="white" />
    <path
      d="M40 62 Q50 70 60 62"
      stroke="#333"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="30" cy="58" r="5" fill="#FF9B9B" opacity=".5" />
    <circle cx="70" cy="58" r="5" fill="#FF9B9B" opacity=".5" />
  </svg>
);

const IllustrationBear = () => (
  <svg
    viewBox="0 0 120 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <circle cx="28" cy="30" r="18" fill="#D4A056" />
    <circle cx="92" cy="30" r="18" fill="#D4A056" />
    <circle cx="28" cy="30" r="11" fill="#E8B870" />
    <circle cx="92" cy="30" r="11" fill="#E8B870" />
    <circle cx="60" cy="55" r="38" fill="#D4A056" />
    <ellipse cx="60" cy="72" rx="18" ry="13" fill="#E8B870" />
    <circle cx="44" cy="46" r="7" fill="white" />
    <circle cx="76" cy="46" r="7" fill="white" />
    <circle cx="45" cy="47" r="4" fill="#333" />
    <circle cx="77" cy="47" r="4" fill="#333" />
    <circle cx="44" cy="45" r="1.5" fill="white" />
    <circle cx="76" cy="45" r="1.5" fill="white" />
    <ellipse cx="60" cy="65" rx="6" ry="4" fill="#8B5E3C" />
    <path
      d="M50 74 Q60 82 70 74"
      stroke="#8B5E3C"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="34" cy="62" r="8" fill="#FF9B9B" opacity=".4" />
    <circle cx="86" cy="62" r="8" fill="#FF9B9B" opacity=".4" />
    <rect x="30" y="90" width="60" height="45" rx="20" fill="#5FAF30" />
    <rect x="38" y="128" width="16" height="12" rx="6" fill="#4A8A26" />
    <rect x="66" y="128" width="16" height="12" rx="6" fill="#4A8A26" />
    <text x="90" y="20" fontSize="14" fill="#FFD700">
      ⭐
    </text>
  </svg>
);

/* ─── Responsive hook ────────────────────────────────────────────────── */
function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
}

/* ─── Card wrapper ───────────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "white",
      borderRadius: "24px",
      padding: "20px",
      boxShadow: "0 2px 16px rgba(108,99,255,.07)",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ─── Stat Card ──────────────────────────────────────────────────────── */
const StatCard = ({
  label,
  value,
  gradient,
  textColor,
  subLabel,
  Illustration,
}) => (
  <div
    style={{
      background: gradient,
      borderRadius: "20px",
      padding: "16px 14px 0",
      position: "relative",
      overflow: "hidden",
      minHeight: "150px",
      boxShadow: "0 4px 16px rgba(0,0,0,.06)",
      flex: 1,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 15% 15%, rgba(255,255,255,.4) 0%, transparent 55%)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        fontSize: "13px",
        fontWeight: 700,
        color: textColor,
        opacity: 0.8,
        marginBottom: "6px",
        position: "relative",
        zIndex: 1,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: "Baloo 2,cursive",
        fontSize: "48px",
        fontWeight: 800,
        color: textColor,
        lineHeight: 1,
        position: "relative",
        zIndex: 1,
      }}
    >
      {value}
    </div>
    {subLabel && (
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: textColor,
          opacity: 0.55,
          position: "absolute",
          bottom: "14px",
          left: "14px",
          zIndex: 1,
        }}
      >
        {subLabel}
      </div>
    )}
    <span
      style={{
        position: "absolute",
        top: "12px",
        right: "90px",
        fontSize: "9px",
        color: textColor,
        opacity: 0.35,
      }}
    >
      ✦
    </span>
    <span
      style={{
        position: "absolute",
        top: "26px",
        right: "76px",
        fontSize: "6px",
        color: textColor,
        opacity: 0.25,
      }}
    >
      ✦
    </span>
    <div
      style={{
        position: "absolute",
        right: "-10px",
        bottom: "-14px",
        width: "110px",
        height: "110px",
        zIndex: 1,
      }}
    >
      {Illustration && <Illustration />}
    </div>
  </div>
);

/* ─── Kid character in streak ────────────────────────────────────────── */
const KidStreak = () => (
  <svg
    viewBox="0 0 80 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%" }}
  >
    <circle cx="40" cy="28" r="22" fill="#FDBCB4" />
    <ellipse cx="40" cy="15" rx="22" ry="12" fill="#4A3728" />
    <ellipse cx="20" cy="24" rx="7" ry="10" fill="#4A3728" />
    <ellipse cx="60" cy="24" rx="7" ry="10" fill="#4A3728" />
    <circle cx="32" cy="26" r="4" fill="white" />
    <circle cx="48" cy="26" r="4" fill="white" />
    <circle cx="33" cy="27" r="2.5" fill="#333" />
    <circle cx="49" cy="27" r="2.5" fill="#333" />
    <path
      d="M33 37 Q40 43 47 37"
      stroke="#D47B6B"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <rect x="22" y="50" width="36" height="32" rx="14" fill="#7C5CBF" />
    <path d="M58 58 L72 52 Q76 50 74 56 L62 65Z" fill="#FDBCB4" />
    <path
      d="M68 50 Q72 44 70 52"
      stroke="#FDBCB4"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <rect x="28" y="78" width="10" height="20" rx="5" fill="#4A90D9" />
    <rect x="42" y="78" width="10" height="20" rx="5" fill="#4A90D9" />
  </svg>
);

/* ════════════════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const langCode = user?.language === 'hi' ? 'hi-IN' : user?.language === 'mr' ? 'mr-IN' : 'en-IN';
  const { speak } = useVoice({ language: langCode });
  const { xp, streak, level } = useProgressStore();
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          api.get("/student/dashboard"),
          api.get(`/content/courses?class=${user?.class || 5}`),
        ]);
        setData(sRes.data);
        setCourses(cRes.data.courses || []);
      } catch (e) {
        console.error(e.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  const student = data?.student;
  const realXP = student?.xp ?? xp;
  const realStreak = student?.streakCurrent ?? streak;
  const realLevel = student?.level ?? level;
  const lessonsD = student?.lessonsCompleted ?? 0;
  const subjectCount = [...new Set(courses.map((c) => c.subject))].length;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ width: "56px", height: "56px" }}>
          <IllustrationOwl />
        </div>
        <div
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "16px",
            color: "#7C5CBF",
            fontWeight: 700,
          }}
        >
          Loading...
        </div>
      </div>
    );

  const gap = isMobile ? "12px" : "16px";

  return (
    <div
      style={{
        fontFamily: "Nunito,sans-serif",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        paddingBottom: "32px",
      }}
    >
      {/* ══ HERO — sky bg + school illus ══ */}
      <div
        style={{
          position: "relative",
          background:
            "linear-gradient(155deg,#C5DEFF 0%,#D8EEFF 40%,#EEF4FF 100%)",
          borderRadius: "28px",
          padding: isMobile ? "20px 16px 90px" : "24px 24px 100px",
          marginBottom: "-72px",
          overflow: "hidden",
        }}
      >
        {/* Clouds */}
        <svg
          viewBox="0 0 600 80"
          fill="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "80px",
            pointerEvents: "none",
          }}
        >
          <ellipse cx="80" cy="30" rx="55" ry="24" fill="white" opacity=".75" />
          <ellipse
            cx="120"
            cy="20"
            rx="45"
            ry="18"
            fill="white"
            opacity=".75"
          />
          <ellipse cx="55" cy="26" rx="35" ry="16" fill="white" opacity=".75" />
          <ellipse cx="380" cy="22" rx="50" ry="20" fill="white" opacity=".6" />
          <ellipse cx="415" cy="13" rx="38" ry="16" fill="white" opacity=".6" />
          <ellipse cx="520" cy="28" rx="42" ry="18" fill="white" opacity=".5" />
        </svg>

        {/* Greeting */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: isMobile ? "calc(100% - 130px)" : "55%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: isMobile ? "26px" : "30px",
                fontWeight: 800,
                color: "#1A1060",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {t("common.namaste", { defaultValue: "Namaste" })}, {user?.name || t("common.student", { defaultValue: "Student" })}! 👋
            </h1>
            <button
              type="button"
              onClick={() =>
                speak(
                  `${t("common.namaste", { defaultValue: "Namaste" })}, ${user?.name || "Student"}! ${t("common.class", { defaultValue: "Class" })} ${data?.student?.class || user?.class || 5}. ${t("common.readyToLearn", { defaultValue: "Ready to learn something amazing today?" })}`
                )
              }
              title={t("voice.readAloud", { defaultValue: "Read Aloud" })}
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1.5px solid #C7D2FE",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                boxShadow: "0 2px 6px rgba(108,99,255,0.15)",
                flexShrink: 0,
              }}
            >
              🔊
            </button>
          </div>
          <p
            style={{
              color: "#4C3D8F",
              fontSize: "13px",
              margin: "6px 0 0",
              fontWeight: 600,
            }}
          >
            {t("common.class", { defaultValue: "Class" })} {data?.student?.class || user?.class || 5} • {t("common.readyToLearn", { defaultValue: "Ready to learn something amazing today?" })}
          </p>
        </div>

        {/* School illustration — top right, bleeds out */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? "-4px" : "-8px",
            right: isMobile ? "-8px" : "-4px",
            width: isMobile ? "140px" : "260px",
            height: isMobile ? "130px" : "200px",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <IllustrationSchool />
        </div>

        {/* Soft hill */}
        <svg
          viewBox="0 0 800 48"
          fill="none"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            pointerEvents: "none",
          }}
          preserveAspectRatio="none"
        >
          <path
            d="M0 48 Q200 16 400 32 Q600 48 800 20 L800 48 Z"
            fill="#F0F4FF"
          />
        </svg>
      </div>

      {/* ══ STAT CARDS — float over hero ══ */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
          gap,
          marginBottom: gap,
          padding: "0 2px",
        }}
      >
        {/* My Subjects */}
        <div
          style={{
            background: "linear-gradient(145deg,#EDE9FB,#DDD6FE)",
            borderRadius: "20px",
            padding: "16px 14px 0",
            position: "relative",
            overflow: "hidden",
            minHeight: "150px",
            boxShadow: "0 4px 16px rgba(124,92,191,.14)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 15% 15%,rgba(255,255,255,.4) 0%,transparent 55%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#4C1D95",
              opacity: 0.8,
              marginBottom: "6px",
              position: "relative",
              zIndex: 1,
            }}
          >
            My Subjects
          </div>
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "48px",
              fontWeight: 800,
              color: "#4C1D95",
              lineHeight: 1,
              position: "relative",
              zIndex: 1,
            }}
          >
            {subjectCount || "0"}
          </div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#4C1D95",
              opacity: 0.5,
              position: "absolute",
              bottom: "14px",
              left: "14px",
              zIndex: 1,
            }}
          >
            Subjects
          </div>
          <span
            style={{
              position: "absolute",
              top: "12px",
              right: "90px",
              fontSize: "9px",
              color: "#4C1D95",
              opacity: 0.3,
            }}
          >
            ✦
          </span>
          <span
            style={{
              position: "absolute",
              top: "28px",
              right: "72px",
              fontSize: "6px",
              color: "#4C1D95",
              opacity: 0.2,
            }}
          >
            ✦
          </span>
          <div
            style={{
              position: "absolute",
              right: "-10px",
              bottom: "-14px",
              width: "110px",
              height: "110px",
              zIndex: 1,
            }}
          >
            <svg
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "100%" }}
            >
              <rect
                x="5"
                y="52"
                width="30"
                height="20"
                rx="4"
                fill="#7C5CBF"
                transform="rotate(-18 5 52)"
              />
              <rect
                x="24"
                y="42"
                width="30"
                height="20"
                rx="4"
                fill="#9B7DD4"
              />
              <rect
                x="16"
                y="32"
                width="30"
                height="20"
                rx="4"
                fill="#F4A261"
                transform="rotate(12 16 32)"
              />
              <polygon
                points="54,16 57,24 66,24 59,29 62,38 54,33 46,38 49,29 42,24 51,24"
                fill="#F4A020"
              />
            </svg>
          </div>
        </div>

        <StatCard
          label="Lessons Done"
          value={lessonsD}
          gradient="linear-gradient(145deg,#FFF3CD,#FDE68A)"
          textColor="#78350F"
          subLabel="Lessons"
          Illustration={() => (
            <svg
              viewBox="0 0 80 80"
              fill="none"
              style={{ width: "100%", height: "100%" }}
            >
              <circle cx="40" cy="40" r="30" fill="#FFD166" opacity=".3" />
              <polygon
                points="40,12 45,35 70,35 50,50 58,73 40,58 22,73 30,50 10,35 35,35"
                fill="#F4A020"
              />
              <text x="30" y="50" fontSize="20">
                🎯
              </text>
            </svg>
          )}
        />

        <StatCard
          label="Current Streak"
          value={realStreak}
          gradient="linear-gradient(145deg,#FED7AA,#FDBA74)"
          textColor="#7C2D12"
          Illustration={IllustrationFireFlame}
        />

        <StatCard
          label="XP Points"
          value={realXP}
          gradient="linear-gradient(145deg,#BFDBFE,#93C5FD)"
          textColor="#1E3A8A"
          Illustration={IllustrationStar}
        />
      </div>

      {/* ══ MY PROGRESS + STREAK ══ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap,
          marginBottom: gap,
        }}
      >
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "10px",
                background: "linear-gradient(135deg,#EDE9FB,#C4B5FD)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              📈
            </div>
            <span
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "16px",
                fontWeight: 800,
                color: "#1A1060",
              }}
            >
              My Progress
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#EDE9FB,#DDD6FE)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  boxShadow: "0 4px 12px rgba(124,92,191,.18)",
                }}
              >
                <span
                  style={{
                    fontFamily: "Baloo 2,cursive",
                    fontSize: "30px",
                    fontWeight: 800,
                    color: "#7C5CBF",
                  }}
                >
                  {realLevel}
                </span>
              </div>
              <div
                style={{
                  background: "linear-gradient(90deg,#7C5CBF,#A78BFA)",
                  color: "white",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "inline-block",
                }}
              >
                Level {realLevel}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#6B5B9E",
                  marginBottom: "6px",
                }}
              >
                <span>XP Progress</span>
                <span style={{ color: "#7C5CBF" }}>{realXP} / 500</span>
              </div>
              <div
                style={{
                  height: "10px",
                  background: "#EDE9FB",
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(((realXP % 500) / 500) * 100, 100)}%`,
                    background: "linear-gradient(90deg,#7C5CBF,#A78BFA)",
                    borderRadius: "5px",
                    transition: "width 1s",
                  }}
                />
              </div>
              <div style={{ fontSize: "11px", color: "#A0AEC0" }}>
                {500 - (realXP % 500)} XP to next level
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "10px",
                background: "linear-gradient(135deg,#FED7AA,#FDBA74)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              🔥
            </div>
            <span
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "16px",
                fontWeight: 800,
                color: "#1A1060",
              }}
            >
              Streak
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              marginBottom: "12px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Baloo 2,cursive",
                  fontSize: "44px",
                  fontWeight: 800,
                  color: "#EA580C",
                  lineHeight: 1,
                }}
              >
                {realStreak}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#9CA3AF",
                  fontWeight: 700,
                  marginTop: "3px",
                }}
              >
                Current 🔥
              </div>
            </div>
            <div style={{ width: "64px", height: "80px" }}>
              <KidStreak />
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Baloo 2,cursive",
                  fontSize: "44px",
                  fontWeight: 800,
                  color: "#F59E0B",
                  lineHeight: 1,
                }}
              >
                {student?.streakMax || 0}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#9CA3AF",
                  fontWeight: 700,
                  marginTop: "3px",
                }}
              >
                Best 🏆
              </div>
            </div>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg,#FEF9C3,#FEF08A)",
              borderRadius: "14px",
              padding: "10px 14px",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 700,
              color: "#92400E",
            }}
          >
            {realStreak > 0
              ? `Keep it up! ${realStreak} day streak! 🎉`
              : "Start your streak today! 💪"}
          </div>
        </Card>
      </div>

      {/* ══ FUN ACTIVITIES — 4 cols, no buttons, matching ref ══ */}
      <Card style={{ marginBottom: gap }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "8px",
          }}
        >
          {[
            {
              icon: "❓",
              iconBg: "#22C55E",
              label: "Quiz Time",
              desc: "Test your knowledge!",
              action: () => nav("/quiz"),
            },
            {
              icon: "⭐",
              iconBg: "#F59E0B",
              label: "Daily Challenge",
              desc: "Complete daily tasks!",
              action: () => nav("/quiz"),
            },
            {
              icon: "✏️",
              iconBg: "#7C5CBF",
              label: "Practice Zone",
              desc: "Practice makes perfect!",
              action: () => nav("/subjects"),
            },
            {
              icon: "🎮",
              iconBg: "#06B6D4",
              label: "Fun Games",
              desc: "Learn with fun games!",
              action: () => nav("/quiz"),
            },
          ].map((a) => (
            <div
              key={a.label}
              onClick={a.action}
              style={{
                textAlign: "center",
                cursor: "pointer",
                padding: "12px 6px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: a.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  margin: "0 auto 10px",
                  boxShadow: `0 4px 12px ${a.iconBg}55`,
                }}
              >
                {a.icon}
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "12px",
                  color: "#1A1060",
                  marginBottom: "4px",
                }}
              >
                {a.label}
              </div>
              <div
                style={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.4 }}
              >
                {a.desc}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ══ CONTINUE LEARNING ══ */}
      <Card style={{ marginBottom: gap }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "10px",
                background: "linear-gradient(135deg,#DCFCE7,#86EFAC)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              📖
            </div>
            <span
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "16px",
                fontWeight: 800,
                color: "#1A1060",
              }}
            >
              Continue Learning
            </span>
          </div>
          <button
            onClick={() => nav("/subjects")}
            style={{
              background: "none",
              border: "none",
              color: "#7C5CBF",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            View All →
          </button>
        </div>

        {courses.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {courses.slice(0, 3).map((c) => (
              <div
                key={c._id}
                onClick={() => nav("/subjects")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "#F5F3FF",
                  borderRadius: "16px",
                  padding: "10px 14px",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  📚
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "13px",
                      color: "#1A1060",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                    {c.subject} · Class {c.class}
                  </div>
                </div>
                <button
                  style={{
                    background: "linear-gradient(90deg,#7C5CBF,#A78BFA)",
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Continue →
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state — kid illustration LEFT, text RIGHT, exactly like ref */
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0",
              minHeight: "160px",
            }}
          >
            <div
              style={{
                width: isMobile ? "130px" : "160px",
                flexShrink: 0,
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,.12))",
              }}
            >
              <IllustrationKidReading />
            </div>
            <div style={{ flex: 1, paddingLeft: "8px" }}>
              <div
                style={{
                  fontFamily: "Baloo 2,cursive",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#1A1060",
                  marginBottom: "6px",
                }}
              >
                No lessons yet!
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#9CA3AF",
                  marginBottom: "16px",
                  lineHeight: 1.6,
                }}
              >
                Your next adventure is waiting. Let's start learning!
              </div>
              <button
                onClick={() => nav("/subjects")}
                style={{
                  background: "linear-gradient(90deg,#7C5CBF,#A78BFA)",
                  color: "white",
                  border: "none",
                  borderRadius: "40px",
                  padding: "11px 24px",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(124,92,191,.35)",
                }}
              >
                Explore Lessons
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ══ BOTTOM BANNER — owl + motivational, cream bg matching ref ══ */}
      <div
        style={{
          background: "linear-gradient(135deg,#FFF9E6,#FEF3C7)",
          borderRadius: "28px",
          padding: "20px 20px 0",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 4px 20px rgba(245,158,11,.12)",
          minHeight: "120px",
        }}
      >
        {/* Sparkles */}
        {[
          ["14px", "16px"],
          ["60px", "8px"],
          ["120px", "20px"],
          ["200px", "10px"],
        ].map(([l, t], i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: l,
              top: t,
              fontSize: i % 2 ? "8px" : "12px",
              color: "#F59E0B",
              opacity: 0.5,
            }}
          >
            ✦
          </span>
        ))}
        {/* Flowers */}
        <span
          style={{
            position: "absolute",
            bottom: "8px",
            left: "20px",
            fontSize: "22px",
            opacity: 0.7,
          }}
        >
          🌸
        </span>
        <span
          style={{
            position: "absolute",
            bottom: "8px",
            right: "130px",
            fontSize: "18px",
            opacity: 0.7,
          }}
        >
          🌷
        </span>

        <div style={{ zIndex: 1, flex: 1, paddingBottom: "20px" }}>
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: 800,
              color: "#7C5CBF",
              marginBottom: "6px",
            }}
          >
            Keep going, {user?.name || "Student"}!
          </div>
          <div style={{ fontSize: "13px", color: "#6B5B9E", lineHeight: 1.6 }}>
            Every day is a new chance to learn something new! 🚀
          </div>
          {/* Dots pagination matching ref */}
          <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#7C5CBF",
              }}
            />
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#DDD6FE",
              }}
            />
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#DDD6FE",
              }}
            />
          </div>
        </div>

        {/* Owl illustration bottom-right */}
        <div
          style={{
            width: isMobile ? "80px" : "100px",
            flexShrink: 0,
            alignSelf: "flex-end",
            zIndex: 1,
          }}
        >
          <IllustrationOwl />
        </div>
      </div>
    </div>
  );
}
