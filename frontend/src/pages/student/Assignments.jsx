import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { notify } from "../../components/ui/Toast";

const cardStyle = {
  background: "#fff",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 4px 24px rgba(108,99,255,.08)",
  marginBottom: "16px",
};

export default function Assignments() {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'submitted' | 'graded'
  const [activeModal, setActiveModal] = useState(null); // assignment object
  const [submissionText, setSubmissionText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/student/assignments");
      setAssignments(res.data.assignments || []);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async (assignmentId) => {
    if (!submissionText.trim() && !fileUrl.trim()) {
      notify.error("Please provide your answer or homework notes.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/student/assignments/${assignmentId}/submit`, {
        submissionText,
        fileUrl,
      });
      notify.success(`🎉 Homework submitted! +${res.data.xpEarned || 25} XP`);
      setActiveModal(null);
      setSubmissionText("");
      setFileUrl("");
      fetchAssignments();
    } catch (e) {
      notify.error(e.response?.data?.error || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = assignments.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  return (
    <div className="anim-slide-up" style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontFamily: "Baloo 2,cursive", fontSize: "24px", fontWeight: 800, color: "#1E1B4B", margin: 0 }}>
            📂 {t("assignments.title", { defaultValue: "Homework & Assignments" })}
          </h1>
          <p style={{ color: "#6B7280", fontSize: "14px", margin: "4px 0 0" }}>
            {t("assignments.subtitle", { defaultValue: "Submit tasks assigned by your teacher and receive feedback" })}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "18px", overflowX: "auto", paddingBottom: "4px" }}>
        {[
          { key: "all", label: "All Homework" },
          { key: "pending", label: "⏳ Pending" },
          { key: "submitted", label: "📤 Submitted" },
          { key: "graded", label: "✅ Graded" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background: filter === t.key ? "#6C63FF" : "#fff",
              color: filter === t.key ? "#fff" : "#4B5563",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,.04)",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>⏳</div>
          <div>Loading homework...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "48px 20px", color: "#9CA3AF" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: "16px", color: "#374151" }}>
            {t("assignments.noAssignments", { defaultValue: "No assignments due right now!" })}
          </div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            {t("assignments.greatJob", { defaultValue: "You are all caught up on your schoolwork." })}
          </div>
        </div>
      ) : (
        filtered.map((a) => (
          <div
            key={a._id}
            style={{
              ...cardStyle,
              borderLeft:
                a.status === "graded"
                  ? "6px solid #22C55E"
                  : a.status === "submitted"
                  ? "6px solid #F59E0B"
                  : "6px solid #6C63FF",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
              <div>
                <span
                  style={{
                    background: "#EEF0FF",
                    color: "#6C63FF",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: 800,
                    marginRight: "8px",
                  }}
                >
                  {a.subject}
                </span>
                <span style={{ fontSize: "12px", color: "#6B7280" }}>
                  Assigned by {a.teacher}
                </span>
                <h3
                  style={{
                    fontFamily: "Baloo 2,cursive",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1F2937",
                    margin: "6px 0 2px",
                  }}
                >
                  {a.title}
                </h3>
              </div>

              <div>
                {a.status === "graded" ? (
                  <span
                    style={{
                      background: "#DCFCE7",
                      color: "#16A34A",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    ⭐ {a.submission?.marks}/{a.points} Marks
                  </span>
                ) : a.status === "submitted" ? (
                  <span
                    style={{
                      background: "#FEF3C7",
                      color: "#D97706",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    📤 Submitted
                  </span>
                ) : (
                  <span
                    style={{
                      background: "#FEE2E2",
                      color: "#EF4444",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 800,
                    }}
                  >
                    ⏳ Due Soon
                  </span>
                )}
              </div>
            </div>

            {a.description && (
              <p style={{ color: "#4B5563", fontSize: "13px", lineHeight: 1.5, margin: "8px 0" }}>
                {a.description}
              </p>
            )}

            {/* Submission feedback */}
            {a.submission && (
              <div
                style={{
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "12px",
                  margin: "12px 0 8px",
                  fontSize: "12px",
                }}
              >
                <div style={{ fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                  Your Submission ({new Date(a.submission.submittedAt).toLocaleDateString()}):
                </div>
                <div style={{ color: "#4B5563", fontStyle: "italic", marginBottom: "6px" }}>
                  "{a.submission.submissionText || "File submission"}"
                </div>
                {a.submission.feedback && (
                  <div
                    style={{
                      borderTop: "1px dashed #D1D5DB",
                      paddingTop: "6px",
                      color: "#16A34A",
                      fontWeight: 600,
                    }}
                  >
                    👨‍🏫 Teacher Feedback: "{a.submission.feedback}"
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                {a.dueDate ? `📅 Due: ${new Date(a.dueDate).toLocaleDateString()}` : "No fixed deadline"} · Max {a.points} Pts
              </div>
              {a.status !== "graded" && (
                <button
                  onClick={() => {
                    setActiveModal(a);
                    setSubmissionText(a.submission?.submissionText || "");
                    setFileUrl(a.submission?.fileUrl || "");
                  }}
                  style={{
                    background: a.status === "submitted" ? "#EEF0FF" : "#6C63FF",
                    color: a.status === "submitted" ? "#6C63FF" : "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "6px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {a.status === "submitted" ? "✏️ Edit Answer" : "📝 Submit Homework"}
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Submission Modal */}
      {activeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "24px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontFamily: "Baloo 2,cursive", fontSize: "20px", fontWeight: 800, margin: 0, color: "#1F2937" }}>
                Submit: {activeModal.title}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: "none", border: "none", fontSize: "18px", color: "#9CA3AF", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px" }}>
              {activeModal.description || "Write your solution, answers, or summary below."}
            </p>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                Your Answer / Notes *
              </label>
              <textarea
                rows={5}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Type your homework answers here in English, Marathi, or Hindi..."
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "14px",
                  border: "1.5px solid #E5E7EB",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                Attachment Link or Photo URL (Optional)
              </label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/... or image link"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1.5px solid #E5E7EB",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: "#F3F4F6",
                  color: "#4B5563",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 18px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(activeModal._id)}
                disabled={submitting}
                style={{
                  background: "#6C63FF",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px 22px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Submitting..." : "Submit Homework 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
