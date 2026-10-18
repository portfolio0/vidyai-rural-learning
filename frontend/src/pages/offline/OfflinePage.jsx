import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOfflineStore, useUIStore, useAuthStore } from "../../store/stores";
import { useTranslation } from "react-i18next";
import api from "../../services/api";

const SUBJECT_ICONS = {
  Science: "🌱",
  Mathematics: "➕",
  Math: "➕",
  EVS: "💧",
  English: "✏️",
  Marathi: "📜",
  Hindi: "📝",
};
const card = {
  background: "#fff",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 4px 24px rgba(108,99,255,.1)",
};

export default function OfflinePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const {
    downloadedLessons,
    cachedQuizzes,
    setCachedQuizzes,
    syncQueue,
    addDownload,
    removeDownload,
    clearSynced,
    isOnline,
  } = useOfflineStore();
  const { lowBandwidthMode, toggleLowBandwidth } = useUIStore();
  const [confirm, setConfirm] = useState(null);
  const [autoWifi, setAutoWifi] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineQuiz, setOfflineQuiz] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const handleManualSync = async () => {
    if (!syncQueue?.length) return;
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await api.post("/sync/flush", { queue: syncQueue });
      const synced = (res.data?.results || [])
        .filter((r) => r.status === "synced")
        .map((r) => r.localId);
      clearSynced(synced);
      setSyncMsg(`Synced ${synced.length} action(s) successfully!`);
    } catch (e) {
      setSyncMsg("Sync failed. Check connection.");
    } finally {
      setSyncing(false);
    }
  };

  const handlePullWeeklyLessons = async () => {
    setPulling(true);
    setSyncMsg("");
    try {
      const res = await api.get(`/sync/pull?class=${user?.class || 5}`);
      const newLessons = res.data?.lessons || [];
      const newQuizzes = res.data?.quizzes || [];
      const currentUserId = user?._id || user?.userId || user?.id;
      let saved = 0;
      for (const item of newLessons) {
        addDownload({
          id: item._id,
          userId: currentUserId,
          title: item.title,
          subject: item.subject || "General",
          duration: `${Math.round((item.duration || 300) / 60)} min`,
          size: `${Math.round((item.mediaSize || 4500000) / 1024 / 1024 || 4)} MB`,
          mediaUrl: item.mediaUrl,
          content: item.content,
          type: item.type,
          downloadedAt: new Date().toISOString(),
        });
        saved++;
      }
      setCachedQuizzes(newQuizzes);
      setSyncMsg(`📥 Downloaded ${saved} lesson(s) & ${newQuizzes.length} quiz(zes) for offline learning!`);
    } catch (e) {
      setSyncMsg("Could not sync from server. Please check connection.");
    } finally {
      setPulling(false);
    }
  };

  const handleDeleteLesson = async (lesson) => {
    try {
      if (lesson.mediaUrl && "caches" in window) {
        const cache = await caches.open("vidyai-offline-media");
        await cache.delete(lesson.mediaUrl);
      }
    } catch (e) {
      console.warn("Failed to delete media from offline cache", e);
    }
    const currentUserId = user?._id || user?.userId || user?.id;
    removeDownload(lesson.id || lesson._id, currentUserId);
    setConfirm(null);
  };


  const currentUserId = user?._id || user?.userId || user?.id;
  const downloads = (downloadedLessons || []).filter((d) => {
    if (d.userId && currentUserId) {
      return d.userId === currentUserId;
    }
    return true;
  });
  const queue = syncQueue || [];

  const totalMB = downloads.reduce((sum, d) => {
    return sum + (parseFloat(d.size?.replace(/[^0-9.]/g, "")) || 0);
  }, 0);

  const Toggle = ({ on, toggle }) => (
    <div
      onClick={toggle}
      style={{
        width: "44px",
        height: "24px",
        background: on ? "#22C55E" : "#E5E7EB",
        borderRadius: "12px",
        position: "relative",
        cursor: "pointer",
        transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          background: "#fff",
          borderRadius: "50%",
          position: "absolute",
          top: "2px",
          right: on ? "2px" : "auto",
          left: on ? "auto" : "2px",
          transition: "all .2s",
          boxShadow: "0 1px 4px rgba(0,0,0,.2)",
        }}
      />
    </div>
  );

  return (
    <div className="anim-slide-up">
      {/* Status Banner */}
      <div
        style={{
          ...card,
          marginBottom: "20px",
          background: "linear-gradient(135deg,#EEF0FF,#FCE7F3)",
          border: "2px solid #6C63FF",
        }}
      >
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ fontSize: "48px" }}>📶</div>
          <div>
            <h2
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "20px",
                fontWeight: 800,
                marginBottom: "4px",
              }}
            >
              Offline Mode
            </h2>
            <p
              style={{
                color: "#6B7280",
                fontSize: "14px",
                marginBottom: "10px",
              }}
            >
              Downloaded content works without internet. Auto-syncs when
              connected.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: "#DCFCE7",
                  color: "#16A34A",
                  borderRadius: "20px",
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                ✅ {downloads.length} Lesson{downloads.length !== 1 ? "s" : ""}{" "}
                Downloaded
              </span>
              {queue.length > 0 && (
                <span
                  style={{
                    background: "#FEF9C3",
                    color: "#F59E0B",
                    borderRadius: "20px",
                    padding: "5px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  📥 {queue.length} Queued for Sync
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Downloaded Lessons */}
        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "17px",
                fontWeight: 700,
              }}
            >
              📥 {t("offline.title", { defaultValue: "Downloaded Lessons" })}
            </div>
            <button
              onClick={handlePullWeeklyLessons}
              disabled={pulling}
              style={{
                background: "#EEF0FF",
                border: "1px solid #C7D2FE",
                color: "#4F46E5",
                borderRadius: "12px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: pulling ? "not-allowed" : "pointer",
                opacity: pulling ? 0.7 : 1,
              }}
            >
              {pulling ? "⏳ Downloading..." : "📥 Download Curriculum"}
            </button>
          </div>
          {downloads.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "24px", color: "#9CA3AF" }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
              <div style={{ fontSize: "13px" }}>No lessons saved yet.</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Open a lesson → tap "Save Offline".
              </div>
            </div>
          ) : (
            downloads.map((l) => (
              <div
                key={l.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 0",
                  borderBottom: "1px solid #F3F4F6",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: "#EEF0FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    flexShrink: 0,
                  }}
                >
                  {SUBJECT_ICONS[l.subject] || "📖"}
                </div>
                <div
                  style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                  onClick={() => navigate(`/lesson/${l.id || l._id}`)}
                  title="Open lesson"
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "#4F46E5",
                    }}
                  >
                    {l.title} ↗
                  </div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                    {l.subject} · {l.size || "—"}
                  </div>
                </div>
                {confirm === l.id ? (
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => handleDeleteLesson(l)}
                      style={{
                        background: "#EF4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirm(null)}
                      style={{
                        background: "#E5E7EB",
                        color: "#6B7280",
                        border: "none",
                        borderRadius: "8px",
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => setConfirm(l.id)}
                    style={{
                      fontSize: "18px",
                      cursor: "pointer",
                      opacity: 0.6,
                    }}
                    title="Delete"
                  >
                    🗑️
                  </span>
                )}
              </div>
            ))
          )}
          {cachedQuizzes && cachedQuizzes.length > 0 && (
            <div style={{ marginTop: "20px", borderTop: "1px solid #F3F4F6", paddingTop: "14px" }}>
              <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "15px", fontWeight: 700, marginBottom: "10px", color: "#1F2937" }}>
                ✏️ Offline Quizzes ({cachedQuizzes.length})
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                {cachedQuizzes.map((q) => (
                  <div
                    key={q._id}
                    onClick={() => navigate(`/quiz/${q._id}`)}
                    style={{
                      background: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "13px", color: "#4F46E5" }}>{q.title}</div>
                      <div style={{ fontSize: "11px", color: "#6B7280" }}>{q.subject} · {q.questions?.length || 0} Questions</div>
                    </div>
                    <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 700 }}>Practice ↗</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Storage & Settings */}
        <div style={card}>
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "17px",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            ⚙️ Storage & Sync
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              <span>Storage Used</span>
              <span>{totalMB.toFixed(1)} MB / 500 MB</span>
            </div>
            <div
              style={{
                height: "10px",
                background: "#E5E7EB",
                borderRadius: "5px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min((totalMB / 500) * 100, 100)}%`,
                  background: "#6C63FF",
                  borderRadius: "5px",
                }}
              />
            </div>
          </div>

          {[
            {
              label: "Auto Download on WiFi",
              on: autoWifi,
              toggle: () => setAutoWifi((v) => !v),
            },
            {
              label: "Auto-sync when online",
              on: autoSync,
              toggle: () => setAutoSync((v) => !v),
            },
            {
              label: "Low Bandwidth Mode",
              on: lowBandwidthMode,
              toggle: toggleLowBandwidth,
            },
            {
              label: "Offline Quizzes",
              on: offlineQuiz,
              toggle: () => setOfflineQuiz((v) => !v),
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #F3F4F6",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                {s.label}
              </span>
              <Toggle on={s.on} toggle={s.toggle} />
            </div>
          ))}

          {queue.length > 0 && (
            <div
              style={{
                marginTop: "16px",
                background: "#FEF9C3",
                borderRadius: "12px",
                padding: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#D97706",
                  }}
                >
                  📥 Sync Queue ({queue.length})
                </div>
                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  style={{
                    background: syncing ? "#9CA3AF" : "#D97706",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: syncing ? "not-allowed" : "pointer",
                  }}
                >
                  {syncing ? "Syncing..." : "Sync Now"}
                </button>
              </div>
              {syncMsg && (
                <div style={{ fontSize: "11px", color: "#B45309", marginBottom: "6px", fontWeight: 600 }}>
                  {syncMsg}
                </div>
              )}
              {queue.slice(0, 3).map((q, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "11px",
                    color: "#6B7280",
                    marginBottom: "2px",
                  }}
                >
                  • {q.action}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
