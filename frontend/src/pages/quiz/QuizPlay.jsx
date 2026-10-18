import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgressStore } from "../../store/stores";
import api from "../../services/api";

export default function QuizPlay() {
  const { id } = useParams();
  const nav = useNavigate();
  const { addXP } = useProgressStore();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]); // { chosen }[]
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    api
      .get(`/quiz/${id}`)
      .then(({ data }) => {
        setQuiz(data.quiz);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.response?.data?.error || "Failed to load quiz");
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
        ⏳ Loading quiz...
      </div>
    );
  if (error)
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#EF4444" }}>
        ❌ {error}
      </div>
    );
  if (!quiz) return null;

  const questions = quiz.questions || [];
  const q = questions[current];

  const answer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const isCorrect = idx === q.correctIndex;
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((a) => [...a, { questionId: q._id, chosen: idx }]);
  };

  const next = async () => {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      // Submit to backend
      const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
      try {
        const { data } = await api.post(`/quiz/${id}/submit`, {
          answers,
          timeTaken,
        });
        setResult(data);
        addXP(data.xpEarned || 0);
      } catch (e) {
        // submit failed — still show local result
        setResult({
          score: Math.round(
            ((score + (selected === q.correctIndex ? 1 : 0)) /
              questions.length) *
              100,
          ),
          xpEarned: 20,
        });
      }
      setFinished(true);
    }
  };

  // Results screen
  if (finished && result) {
    const pct = result.score;
    return (
      <div
        className="anim-slide-up"
        style={{
          width: "100%",
          maxWidth: "680px",
          margin: "0 auto",
          textAlign: "center",
          paddingBottom: "32px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 4px 24px rgba(108,99,255,.15)",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>
            {pct >= 80 ? "🏆" : pct >= 60 ? "🎉" : "💪"}
          </div>
          <h2
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "28px",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            {pct >= 80
              ? "Excellent!"
              : pct >= 60
                ? "Good Job!"
                : "Keep Practicing!"}
          </h2>
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "52px",
              fontWeight: 800,
              color: "#6C63FF",
              margin: "16px 0",
            }}
          >
            {pct}%
          </div>
          <div
            style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}
          >
            {result.correct ?? score} / {questions.length} correct
          </div>
          {result.xpEarned > 0 && (
            <div
              style={{
                background: "#FEF9C3",
                color: "#F59E0B",
                borderRadius: "40px",
                padding: "10px 20px",
                fontWeight: 800,
                fontSize: "16px",
                display: "inline-block",
                marginBottom: "24px",
              }}
            >
              ⭐ +{result.xpEarned} XP Earned!
            </div>
          )}
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center" }}
          >
            <button
              onClick={() => nav("/quiz")}
              style={{
                background: "#EEF0FF",
                color: "#6C63FF",
                border: "none",
                borderRadius: "40px",
                padding: "12px 24px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ← All Quizzes
            </button>
            <button
              onClick={() => nav("/")}
              style={{
                background: "#6C63FF",
                color: "#fff",
                border: "none",
                borderRadius: "40px",
                padding: "12px 24px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Dashboard 🏠
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="anim-slide-up"
      style={{
        width: "100%",
        maxWidth: "880px",
        margin: "0 auto",
        paddingBottom: "32px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            background: "#EEF0FF",
            color: "#6C63FF",
            borderRadius: "20px",
            padding: "6px 14px",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          Question {current + 1}/{questions.length}
        </span>
        <span
          style={{
            background: "#FEF9C3",
            color: "#F59E0B",
            borderRadius: "20px",
            padding: "6px 14px",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          ⭐ +{quiz.xpReward || 20} XP
        </span>
      </div>
      <div
        style={{
          height: "6px",
          background: "#E5E7EB",
          borderRadius: "3px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((current + 1) / questions.length) * 100}%`,
            background: "#6C63FF",
            borderRadius: "3px",
            transition: "width .5s",
          }}
        />
      </div>
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 4px 24px rgba(108,99,255,.1)",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "20px",
            marginBottom: "24px",
            lineHeight: 1.4,
          }}
        >
          {q.text}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {q.options.map((opt, i) => {
            let bg = "#F9FAFB",
              border = "#E5E7EB",
              color = "#374151";
            if (answered) {
              if (i === q.correctIndex) {
                bg = "#DCFCE7";
                border = "#22C55E";
                color = "#16A34A";
              } else if (i === selected && i !== q.correctIndex) {
                bg = "#FEE2E2";
                border = "#EF4444";
                color = "#DC2626";
              }
            } else if (i === selected) {
              bg = "#EEF0FF";
              border = "#6C63FF";
              color = "#6C63FF";
            }
            return (
              <div
                key={i}
                onClick={() => answer(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `2px solid ${border}`,
                  background: bg,
                  color,
                  cursor: answered ? "default" : "pointer",
                  transition: "all .15s",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {"ABCD"[i]}
                </span>
                {opt}
                {answered && i === q.correctIndex && (
                  <span style={{ marginLeft: "auto" }}>✅</span>
                )}
                {answered && i === selected && i !== q.correctIndex && (
                  <span style={{ marginLeft: "auto" }}>❌</span>
                )}
              </div>
            );
          })}
        </div>
        {answered && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>
              {selected === q.correctIndex ? "🎉 Correct!" : "😅 Not quite!"}
            </div>
            {q.explanation && (
              <p
                style={{
                  color: "#6B7280",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                {q.explanation}
              </p>
            )}
            {q.hint && (
              <p
                style={{
                  color: "#9CA3AF",
                  fontSize: "12px",
                  marginBottom: "16px",
                }}
              >
                💡 {q.hint}
              </p>
            )}
            <button
              onClick={next}
              style={{
                background: "#6C63FF",
                color: "#fff",
                border: "none",
                borderRadius: "40px",
                padding: "12px 32px",
                fontWeight: 800,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              {current + 1 < questions.length
                ? "Next Question →"
                : "See Results 🏆"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
