import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/stores';
import { streamChat } from '../../services/aiService';
import { useVoice } from '../../hooks/useVoice';

const QUICK = [
  'What is photosynthesis?',
  'Explain fractions',
  'Help with grammar',
  'Solar system facts',
  'Study tips for exams',
];

export default function AIChat() {
  const { user } = useAuthStore();
  const preferredLang = user?.language || (typeof window !== 'undefined' ? localStorage.getItem('vidyai-lang') : null) || 'en';
  const [lang, setLang] = useState(preferredLang);
  const initialGreeting =
    preferredLang === 'mr'
      ? "नमस्ते! 🙏 मी विद्या, तुमची AI शिक्षिका आहे. तुमच्या धड्यांबद्दल मला काहीही विचारा!"
      : preferredLang === 'hi'
      ? "नमस्ते! 🙏 मैं विद्या, आपकी AI शिक्षिका हूँ। अपने पाठ या गृहकार्य के बारे में कुछ भी पूछें!"
      : "Namaste! 🙏 I'm Vidya, your AI tutor. Ask me anything about your lessons!";
  const [msgs, setMsgs] = useState([
    { role: 'bot', text: initialGreeting },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const historyRef = useRef([]);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const langCode = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
  const { isListening, startListening, stopListening, speak } = useVoice({
    language: langCode,
    onTranscript: (transcript) => {
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    },
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async (msg) => {
    if (!msg.trim() || loading) return;
    const text = msg.trim();
    setInput('');

    // Add user message
    setMsgs(m => [...m, { role: 'user', text }]);
    setLoading(true);

    // Build history for API (exclude initial bot greeting)
    const apiHistory = historyRef.current.slice(-10);

    // Add a streaming placeholder bot message
    const botIndex = { current: null };
    setMsgs(m => {
      botIndex.current = m.length;
      return [...m, { role: 'bot', text: '' }];
    });

    let botText = '';
    try {
      await streamChat(
        {
          message: text,
          history: apiHistory,
          language: lang,
          studentClass: user?.class || 5,
        },
        (chunk) => {
          botText += chunk;
          setMsgs(m =>
            m.map((msg, i) => (i === botIndex.current ? { ...msg, text: botText } : msg))
          );
        },
        () => {
          // Stream done - update history
          historyRef.current = [
            ...historyRef.current,
            { role: 'user', content: text },
            { role: 'assistant', content: botText },
          ];
          setLoading(false);
        }
      );
    } catch (err) {
      setMsgs(m =>
        m.map((msg, i) =>
          i === botIndex.current
            ? { ...msg, text: '⚠️ Sorry, I could not connect to the AI right now. Please check if the server is running.' }
            : msg
        )
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="anim-slide-up"
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        height: isMobile ? "calc(100vh - 164px)" : "calc(100vh - 110px)",
        boxSizing: "border-box",
        paddingBottom: isMobile ? "4px" : "12px",
      }}
    >
      {/* Top Header & Language selector */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isMobile ? "10px" : "14px",
          flexWrap: "wrap",
          gap: isMobile ? "6px" : "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: isMobile ? "34px" : "42px",
              height: isMobile ? "34px" : "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6C63FF, #9F95FF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isMobile ? "18px" : "22px",
              boxShadow: "0 4px 12px rgba(108,99,255,0.3)",
              flexShrink: 0,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontFamily: "Baloo 2, cursive",
                  fontSize: isMobile ? "17px" : "20px",
                  fontWeight: 800,
                  color: "#1E1B4B",
                }}
              >
                Vidya AI Tutor
              </span>
              <span
                style={{
                  background: "#DCFCE7",
                  color: "#16A34A",
                  fontSize: "10px",
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#22C55E",
                  }}
                />
                Active
              </span>
            </div>
            {!isMobile && (
              <div style={{ fontSize: "12px", color: "#6B7280" }}>
                Ask questions in your preferred language with voice or text
              </div>
            )}
          </div>
        </div>

        {/* Language selector */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            ["en", "English"],
            ["mr", "मराठी"],
            ["hi", "हिंदी"],
          ].map(([code, label]) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              style={{
                padding: isMobile ? "4px 10px" : "8px 16px",
                borderRadius: "30px",
                border: `2px solid ${lang === code ? "#6C63FF" : "#E5E7EB"}`,
                background: lang === code ? "#6C63FF" : "#fff",
                color: lang === code ? "#fff" : "#6B7280",
                fontWeight: 800,
                fontSize: isMobile ? "11px" : "13px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box - Takes all remaining height */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: "#fff",
          borderRadius: "24px",
          padding: isMobile ? "16px 14px" : "20px",
          boxShadow: "0 8px 30px rgba(108,99,255,.08)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            paddingRight: "8px",
            marginBottom: "14px",
          }}
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                maxWidth: "78%",
                padding: "14px 18px",
                borderRadius: "18px",
                fontSize: "15px",
                lineHeight: 1.6,
                alignSelf: m.role === "bot" ? "flex-start" : "flex-end",
                background: m.role === "bot" ? "#F0F2FE" : "#6C63FF",
                color: m.role === "bot" ? "#2D3748" : "#fff",
                borderBottomLeftRadius: m.role === "bot" ? "4px" : "18px",
                borderBottomRightRadius: m.role === "user" ? "4px" : "18px",
                whiteSpace: "pre-wrap",
                minWidth: m.text === "" ? "60px" : undefined,
                boxShadow:
                  m.role === "user"
                    ? "0 4px 14px rgba(108,99,255,0.25)"
                    : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                {m.text || (m.role === "bot" && loading ? "🤔 Thinking..." : "")}
              </div>
              {m.role === "bot" && m.text && (
                <div style={{ marginTop: "6px", textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => speak(m.text, langCode)}
                    title="Listen aloud"
                    style={{
                      background: "rgba(108,99,255,0.12)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#6C63FF",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    🔊 Read Aloud
                  </button>
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Quick Questions chips above input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "10px",
            marginBottom: "10px",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#9CA3AF",
              flexShrink: 0,
            }}
          >
            Ideas:
          </span>
          {QUICK.map((q) => (
            <span
              key={q}
              onClick={() => !loading && send(q)}
              style={{
                background: "#EEF0FF",
                color: "#6C63FF",
                borderRadius: "20px",
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {q}
            </span>
          ))}
        </div>

        {/* Input row */}
        <div style={{ display: "flex", gap: isMobile ? "6px" : "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            title={
              isListening ? "Listening... Click to stop" : "Speak to Vidya"
            }
            style={{
              width: isMobile ? "40px" : "46px",
              height: isMobile ? "40px" : "46px",
              borderRadius: "50%",
              background: isListening ? "#EF4444" : "#EEF0FF",
              color: isListening ? "#fff" : "#6C63FF",
              border: "none",
              cursor: "pointer",
              fontSize: isMobile ? "18px" : "20px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .2s ease",
              boxShadow: isListening ? "0 0 12px rgba(239,68,68,0.5)" : "none",
            }}
          >
            {isListening ? "⏹️" : "🎤"}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder={
              isListening
                ? "Listening..."
                : isMobile
                ? "Ask Vidya anything..."
                : "Ask me anything... (any subject, any language!)"
            }
            disabled={loading}
            style={{
              flex: 1,
              padding: isMobile ? "10px 14px" : "13px 20px",
              borderRadius: "40px",
              border: `2px solid ${isListening ? "#EF4444" : "#E5E7EB"}`,
              fontSize: isMobile ? "14px" : "15px",
              fontFamily: "Nunito,sans-serif",
              outline: "none",
              opacity: loading ? 0.7 : 1,
              minWidth: 0,
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{
              width: isMobile ? "40px" : "46px",
              height: isMobile ? "40px" : "46px",
              borderRadius: "50%",
              background:
                loading || !input.trim()
                  ? "#D1D5DB"
                  : "linear-gradient(135deg, #6C63FF, #7C3AED)",
              border: "none",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              color: "#fff",
              fontSize: isMobile ? "18px" : "20px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                input.trim() && !loading
                  ? "0 4px 14px rgba(108,99,255,0.3)"
                  : "none",
              transition: "all .2s ease",
            }}
          >
            ➔
          </button>
        </div>
      </div>
    </div>
  );
}
