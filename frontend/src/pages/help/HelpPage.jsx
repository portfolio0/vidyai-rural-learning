import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/stores";
import { useVoice } from "../../hooks/useVoice";
import { notify } from "../../components/ui/Toast";

const FAQS = [
  {
    category: "offline",
    q: "How does Offline Mode work when I don't have internet?",
    qMr: "इंटरनेट नसताना ऑफलाइन मोड कसा चालतो?",
    qHi: "इंटरनेट न होने पर ऑफलाइन मोड कैसे काम करता है?",
    a: "You can download any lesson, video, or quiz while connected to Wi-Fi or mobile data. Once saved, you can watch videos, read summaries, and take quizzes completely offline without any internet connection. When you reconnect, your scores and progress will automatically sync to your teacher's dashboard!",
  },
  {
    category: "ai",
    q: "Can I ask the AI Tutor questions in Marathi or Hindi?",
    qMr: "मी AI शिक्षिकेला मराठी किंवा हिंदीमध्ये प्रश्न विचारू शकतो का?",
    qHi: "क्या मैं AI शिक्षक से मराठी या हिंदी में सवाल पूछ सकता हूँ?",
    a: "Yes! Vidya AI Tutor is trained specifically for Indian vernacular languages. You can switch between English, मराठी (Marathi), and हिंदी (Hindi) with one tap, or tap the microphone button to speak your question naturally.",
  },
  {
    category: "homework",
    q: "How do I submit homework assignments to my teacher?",
    qMr: "माझ्या शिक्षकांना गृहपाठ कसा जमा करावा?",
    qHi: "मैं अपने शिक्षक को होमवर्क कैसे जमा करूँ?",
    a: "Go to the 'Homework' tab from the menu or bottom navigation bar. Tap on any pending assignment, type your answer or notes in the solution box, and tap 'Submit Homework'. You'll instantly receive XP and your teacher will be notified to review and grade it.",
  },
  {
    category: "rewards",
    q: "How do I earn XP, Stars, and maintain my Streak?",
    qMr: "मला XP आणि रोजचा Streak कसा मिळवता येईल?",
    qHi: "मैं XP और अपना दैनिक Streak कैसे बना सकता हूँ?",
    a: "You earn XP every time you complete a lesson, submit homework (+25 XP), or score well on quizzes. Learning every consecutive day keeps your Day Streak on fire 🔥 and unlocks badges on your Achievements page!",
  },
  {
    category: "parents",
    q: "Can my parents and teachers see my progress?",
    qMr: "माझे पालक आणि शिक्षक माझी प्रगती पाहू शकतात का?",
    qHi: "क्या मेरे माता-पिता और शिक्षक मेरी प्रगति देख सकते हैं?",
    a: "Yes! Teachers have a live dashboard where they can see who completed lessons, grade homework, and identify topics students struggle with. Parents have their own dedicated Family Portal to check attendance, subject mastery, and download PDF progress cards.",
  },
  {
    category: "offline",
    q: "What if my phone has low storage or slow 2G internet?",
    qMr: "माझ्या फोनमध्ये कमी स्टोरेज किंवा संथ 2G इंटरनेट असेल तर काय?",
    qHi: "अगर मेरे फोन में कम स्टोरेज या धीमा 2G इंटरनेट हो तो क्या करें?",
    a: "Turn on 'Low Bandwidth Mode' inside the Offline Mode settings. VidyAI will automatically compress lessons and stream ultra-light audio-visual content optimized for rural mobile networks and entry-level smartphones.",
  },
];

export default function HelpPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  const [ticket, setTicket] = useState({
    name: user?.name || "",
    role: user?.role || "student",
    category: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const langCode = user?.language === "mr" ? "mr-IN" : user?.language === "hi" ? "hi-IN" : "en-IN";
  const { speak } = useVoice({ language: langCode });

  const filteredFaqs =
    activeTab === "all" ? FAQS : FAQS.filter((f) => f.category === activeTab);

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticket.message.trim()) {
      notify.error("Please enter your question or issue description.");
      return;
    }
    setSubmitted(true);
    notify.success("🙏 Thank you! Your help request has been received (Ref: #VIDYA-" + Math.floor(1000 + Math.random() * 9000) + ")");
    setTicket((prev) => ({ ...prev, message: "" }));
  };

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
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #7C5CBF 0%, #4F39A8 100%)",
          borderRadius: "24px",
          padding: isMobile ? "20px 16px" : "28px 24px",
          color: "white",
          marginBottom: "20px",
          boxShadow: "0 8px 28px rgba(124,92,191,0.2)",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "32px" }}>❓</span>
              <h1 style={{ fontFamily: "Baloo 2, cursive", fontSize: isMobile ? "24px" : "28px", fontWeight: 800, margin: 0 }}>
                {t("help.title", { defaultValue: "Help & Support" })}
              </h1>
            </div>
            <button
              onClick={() =>
                speak("Welcome to VidyAI Help and Support. Find answers to common questions about offline lessons, AI tutor, homework, and rural helpline support.")
              }
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.4)",
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
          <p style={{ margin: "10px 0 0", fontSize: isMobile ? "13.5px" : "15px", opacity: 0.95, maxWidth: "600px", lineHeight: 1.5 }}>
            Need guidance on using VidyAI, offline downloads, homework, or vernacular languages? We are here to support every student, teacher, and parent!
          </p>
        </div>

        {/* Decorative background circle */}
        <div
          style={{
            position: "absolute",
            right: "-20px",
            bottom: "-30px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Quick Direct Helpline Contact Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "18px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            border: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#DCFCE7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0,
            }}
          >
            📞
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "15px", color: "#1E1B4B" }}>Toll-Free Helpline</div>
            <div style={{ color: "#16A34A", fontWeight: 800, fontSize: "16px", marginTop: "2px" }}>
              1800-120-VIDYA
            </div>
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              Mon–Sat, 8:00 AM – 8:00 PM
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "18px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            border: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#EDE9FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0,
            }}
          >
            💬
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "15px", color: "#1E1B4B" }}>WhatsApp Support</div>
            <div style={{ color: "#7C5CBF", fontWeight: 800, fontSize: "15px", marginTop: "2px" }}>
              +91 98765 43210
            </div>
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              Instant AI and Teacher Guides
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "18px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            border: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              flexShrink: 0,
            }}
          >
            ✉️
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "15px", color: "#1E1B4B" }}>Email Desk</div>
            <div style={{ color: "#D97706", fontWeight: 800, fontSize: "14px", marginTop: "2px" }}>
              support@vidyai.org
            </div>
            <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
              Quick 24-hour response
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: isMobile ? "18px 14px" : "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          marginBottom: "24px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ fontFamily: "Baloo 2, cursive", fontSize: isMobile ? "20px" : "22px", fontWeight: 800, color: "#1E1B4B", marginBottom: "16px" }}>
          Frequently Asked Questions (FAQ) 📖
        </h2>

        {/* Category Pills */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "18px", width: "100%", boxSizing: "border-box" }}>
          {[
            { id: "all", label: "🌟 All Topics" },
            { id: "offline", label: "📶 Offline Learning" },
            { id: "ai", label: "🤖 AI Tutor" },
            { id: "homework", label: "📂 Homework" },
            { id: "rewards", label: "⭐ Rewards & XP" },
            { id: "parents", label: "👨‍👩‍👧 Parents & Reports" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              style={{
                padding: "8px 14px",
                borderRadius: "30px",
                border: activeTab === cat.id ? "2px solid #7C5CBF" : "1px solid #E5E7EB",
                background: activeTab === cat.id ? "#7C5CBF" : "#F9FAFB",
                color: activeTab === cat.id ? "white" : "#4B5563",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Items Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  border: "1.5px solid",
                  borderColor: isOpen ? "#C7D2FE" : "#F3F4F6",
                  borderRadius: "14px",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: isOpen ? "#EEF2FF" : "#FAFAFA",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: 700,
                    fontSize: isMobile ? "14px" : "15px",
                    color: isOpen ? "#4338CA" : "#1F2937",
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: "16px", marginLeft: "12px", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: "14px 16px", background: "white", color: "#4B5563", fontSize: "14px", lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}>{faq.a}</p>
                    <div style={{ marginTop: "10px" }}>
                      <button
                        onClick={() => speak(faq.a)}
                        style={{
                          background: "#EEF2FF",
                          border: "none",
                          borderRadius: "16px",
                          color: "#4F46E5",
                          padding: "4px 10px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        🔊 Listen to answer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ask a Question / Support Form */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: isMobile ? "18px 14px" : "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ fontFamily: "Baloo 2, cursive", fontSize: isMobile ? "20px" : "22px", fontWeight: 800, color: "#1E1B4B", marginBottom: "8px" }}>
          Have another question or experiencing an issue? ✍️
        </h2>
        <p style={{ color: "#6B7280", fontSize: isMobile ? "13px" : "14px", marginTop: 0, marginBottom: "20px" }}>
          Send your question directly to the VidyAI technical & teaching team. We will review and assist you.
        </p>

        {submitted ? (
          <div
            style={{
              background: "#DCFCE7",
              border: "1px solid #86EFAC",
              borderRadius: "14px",
              padding: "16px",
              color: "#166534",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>🎉 Your message has been sent successfully! Our support mentors will contact you.</span>
            <button
              onClick={() => setSubmitted(false)}
              style={{
                background: "#166534",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "4px 10px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Ask Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", width: "100%", boxSizing: "border-box" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={ticket.name}
                  onChange={(e) => setTicket({ ...ticket, name: e.target.value })}
                  placeholder="Enter student or teacher name"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #D1D5DB",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                  Issue Category
                </label>
                <select
                  value={ticket.category}
                  onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #D1D5DB",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    background: "white",
                  }}
                >
                  <option value="general">General Support</option>
                  <option value="offline">Offline Downloads & Sync</option>
                  <option value="ai">AI Tutor Behavior</option>
                  <option value="homework">Homework / Submission</option>
                  <option value="account">Account / Login / OTP</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                Your Question or Description
              </label>
              <textarea
                rows={4}
                value={ticket.message}
                onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                placeholder="Describe what you need help with or any difficulty you experienced..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #7C5CBF, #5B3A8C)",
                  color: "white",
                  border: "none",
                  borderRadius: "30px",
                  padding: "12px 24px",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(124,92,191,0.3)",
                }}
              >
                🚀 Submit Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
