import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOfflineStore, useAuthStore } from "../../store/stores";
import { notify } from "../../components/ui/Toast";
import { idb } from "../../utils/db";
import api from "../../services/api";

const COMPLETION_THRESHOLD = 90;
export default function LessonView() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const { addToQueue, addDownload, isOnline } = useOfflineStore();
  const mediaRef = useRef(null);
  const syncRef = useRef({
    lastSentAt: 0,
    lastWatchedSeconds: 0,
    lastResumePosition: 0,
    lastTotalWatchTime: 0,
  });
  const watchRef = useRef({ lastTickAt: 0, totalWatchTime: 0 });

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("notes");
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [resumePosition, setResumePosition] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState(0);

  const isWatchTracked = lesson?.type === "video" || lesson?.type === "audio";

  useEffect(() => {
    let mounted = true;
    const loadLesson = async () => {
      try {
        const [lessonResponse, cachedProgress] = await Promise.all([
          api.get(`/content/lessons/${id}`),
          idb.get("progress", id),
        ]);
        if (!mounted) return;
        const nextLesson = lessonResponse.data.lesson;
        const serverProgress = lessonResponse.data.progress || null;
        const completionThreshold =
          lessonResponse.data.completionThreshold || COMPLETION_THRESHOLD;
        const activeProgress = mergeProgress(serverProgress, cachedProgress);

        setLesson(nextLesson);
        setDurationSeconds(
          activeProgress?.durationSeconds ||
            nextLesson.durationSeconds ||
            durationToSeconds(nextLesson.duration || 0),
        );
        setResumePosition(activeProgress?.resumePosition || 0);
        setWatchedSeconds(activeProgress?.watchedSeconds || 0);
        setTotalWatchTime(activeProgress?.totalWatchTime || 0);
        watchRef.current.totalWatchTime = activeProgress?.totalWatchTime || 0;
        setProgressPct(activeProgress?.watched || 0);
        setCompleted(
          activeProgress?.completed ||
            (activeProgress?.watched || 0) >= completionThreshold,
        );
      } catch (e) {
        const currentUserId = user?._id || user?.userId || user?.id;
        const offlineLesson = (useOfflineStore.getState().downloadedLessons || []).find(
          (l) =>
            (l.id === id || l._id === id) &&
            (!l.userId || !currentUserId || l.userId === currentUserId),
        );
        if (offlineLesson) {
          const cachedProgress = await idb.get("progress", id).catch(() => null);
          let mediaUrl = offlineLesson.mediaUrl;
          if (typeof window !== "undefined" && "caches" in window && mediaUrl) {
            try {
              const cache = await caches.open("vidyai-offline-media");
              const matched = await cache.match(mediaUrl);
              if (matched) {
                const blob = await matched.blob();
                mediaUrl = URL.createObjectURL(blob);
              }
            } catch (err) {
              console.warn("Could not load cached media blob", err);
            }
          }

          setLesson({ ...offlineLesson, mediaUrl });
          setDurationSeconds(
            offlineLesson.durationSeconds || durationToSeconds(offlineLesson.duration || 0),
          );
          setResumePosition(cachedProgress?.resumePosition || 0);
          setWatchedSeconds(cachedProgress?.watchedSeconds || 0);
          setProgressPct(cachedProgress?.watched || 0);
          setCompleted(cachedProgress?.completed || false);
          setError("");
          return;
        }
        setError(e.response?.data?.error || "Lesson not found");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadLesson();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (lesson && isWatchTracked) {
        void persistProgress({ force: true, keepPlayingState: false });
      }
    };
  }, [lesson, isWatchTracked]);

  const playerStatus = useMemo(() => {
    if (completed) return "Completed ✓";
    if (isWatchTracked) {
      return playing ? `Watching... ${progressPct}%` : `Progress ${progressPct}%`;
    }
    return "Open the lesson content below";
  }, [completed, isWatchTracked, playing, progressPct]);

  const handleDownload = async () => {
    let cachedMedia = false;
    if (typeof window !== "undefined" && "caches" in window && lesson?.mediaUrl) {
      try {
        const cache = await caches.open("vidyai-offline-media");
        await cache.add(lesson.mediaUrl);
        cachedMedia = true;
      } catch (err) {
        console.warn("Cache API download failed, storing metadata", err);
      }
    }

    const currentUserId = user?._id || user?.userId || user?.id;
    addDownload({
      ...lesson,
      id,
      _id: id,
      userId: currentUserId,
      title: lesson.title,
      subject: lesson.subject,
      size: `${(((lesson.mediaSize || 0) / (1024 * 1024)) || 1.2).toFixed(1)} MB`,
      cachedAt: new Date(),
      mediaUrl: lesson.mediaUrl,
      type: lesson.type,
      durationSeconds: lesson.durationSeconds || durationSeconds,
      hasOfflineMedia: cachedMedia,
    });
    notify.success("📥 Lesson saved for offline learning!");
  };

  const handleLoadedMetadata = () => {
    const media = mediaRef.current;
    if (!media) return;
    const actualDuration = Number.isFinite(media.duration)
      ? Math.round(media.duration)
      : durationSeconds;
    if (actualDuration && actualDuration !== durationSeconds) {
      setDurationSeconds(actualDuration);
    }
    if (resumePosition > 0 && resumePosition < actualDuration - 2) {
      media.currentTime = resumePosition;
    }
  };

  const handlePlay = () => {
    setPlaying(true);
    watchRef.current.lastTickAt = Date.now();
  };

  const handlePause = () => {
    accumulateWatchTime();
    setPlaying(false);
    void persistProgress({ force: true, keepPlayingState: false });
  };

  const handleEnded = () => {
    accumulateWatchTime();
    setPlaying(false);
    const finalDuration =
      durationSeconds || Math.round(mediaRef.current?.duration || 0);
    applyPlaybackState({
      currentTime: finalDuration,
      totalDuration: finalDuration,
      watchTimeSeconds: watchRef.current.totalWatchTime,
    });
    void persistProgress({ force: true, keepPlayingState: false });
  };

  const handleTimeUpdate = () => {
    const media = mediaRef.current;
    if (!media) return;
    const totalDuration =
      durationSeconds || Math.round(media.duration || 0) || lesson?.durationSeconds || 0;
    accumulateWatchTime();
    applyPlaybackState({
      currentTime: media.currentTime,
      totalDuration,
      watchTimeSeconds: watchRef.current.totalWatchTime,
    });
    void persistProgress({ force: false, keepPlayingState: true });
  };

  const applyPlaybackState = ({
    currentTime,
    totalDuration,
    watchTimeSeconds,
  }) => {
    const normalizedDuration = Math.max(0, Math.round(totalDuration || 0));
    const normalizedWatchedSeconds = Math.min(
      normalizedDuration || Math.round(currentTime),
      Math.max(watchedSeconds, Math.round(currentTime || 0)),
    );
    const watchedPct = normalizedDuration
      ? Math.min(
          100,
          Math.round((normalizedWatchedSeconds / normalizedDuration) * 100),
        )
      : 0;
    const nextCompleted = watchedPct >= COMPLETION_THRESHOLD;
    setDurationSeconds(normalizedDuration);
    setWatchedSeconds(normalizedWatchedSeconds);
    setProgressPct(watchedPct);
    setTotalWatchTime(Math.max(totalWatchTime, Math.round(watchTimeSeconds || 0)));
    setResumePosition(nextCompleted ? 0 : Math.round(currentTime || 0));
    if (nextCompleted && !completed) {
      setCompleted(true);
      notify.success("✅ Lesson completed automatically");
    }
  };

  const accumulateWatchTime = () => {
    const now = Date.now();
    const lastTickAt = watchRef.current.lastTickAt || now;
    if (playing && now > lastTickAt) {
      watchRef.current.totalWatchTime += (now - lastTickAt) / 1000;
      setTotalWatchTime(Math.round(watchRef.current.totalWatchTime));
    }
    watchRef.current.lastTickAt = now;
  };

  const persistProgress = async ({ force, keepPlayingState }) => {
    if (!lesson || !isWatchTracked) return;
    const media = mediaRef.current;
    const liveCurrentTime = media ? Math.round(media.currentTime || 0) : resumePosition;
    const liveDuration =
      media && Number.isFinite(media.duration)
        ? Math.round(media.duration)
        : durationSeconds || lesson.durationSeconds || durationToSeconds(lesson.duration || 0);
    const liveWatchedSeconds = Math.max(watchedSeconds, liveCurrentTime);
    const liveWatchedPct = liveDuration
      ? Math.min(100, Math.round((liveWatchedSeconds / liveDuration) * 100))
      : progressPct;
    const payload = {
      lessonId: id,
      watched: liveWatchedPct,
      watchedSeconds: liveWatchedSeconds,
      durationSeconds: liveDuration,
      resumePosition: completed ? 0 : liveCurrentTime,
      totalWatchTime: Math.round(watchRef.current.totalWatchTime || totalWatchTime || 0),
    };

    await idb.put("progress", {
      id,
      ...payload,
      completed,
      updatedAt: new Date().toISOString(),
    });

    const changedEnough =
      force ||
      Math.abs(payload.watchedSeconds - syncRef.current.lastWatchedSeconds) >= 5 ||
      Math.abs(payload.resumePosition - syncRef.current.lastResumePosition) >= 5 ||
      Math.abs(payload.totalWatchTime - syncRef.current.lastTotalWatchTime) >= 5 ||
      completed;

    if (!changedEnough) return;

    syncRef.current.lastWatchedSeconds = payload.watchedSeconds;
    syncRef.current.lastResumePosition = payload.resumePosition;
    syncRef.current.lastTotalWatchTime = payload.totalWatchTime;
    syncRef.current.lastSentAt = Date.now();

    if (isOnline) {
      try {
        const { data } = await api.post("/progress/update", payload);
        const serverProgress = data.progress || data?.progress;
        if (data?.completedNow) {
          setCompleted(true);
          notify.xp(data.xpAwarded || 10);
        }
        if (serverProgress) {
          setProgressPct(serverProgress.watched || payload.watched);
          setCompleted(serverProgress.completed || false);
          setResumePosition(serverProgress.resumePosition || payload.resumePosition);
          setWatchedSeconds(serverProgress.watchedSeconds || payload.watchedSeconds);
        }
      } catch (e) {
        addToQueue("progress_update", { ...payload, completed });
        if (!keepPlayingState) console.error(e.message);
      }
    } else {
      addToQueue("progress_update", { ...payload, completed });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
        ⏳ Loading lesson...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>😕</div>
        <div style={{ color: "#EF4444", marginBottom: "16px" }}>{error}</div>
        <button onClick={() => nav("/subjects")} style={primaryButton}>
          ← Back to Subjects
        </button>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div
      className="anim-slide-up"
      style={{
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        paddingBottom: "40px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontSize: "13px", color: "#9CA3AF" }}>
        <span style={{ cursor: "pointer", color: "#6C63FF" }} onClick={() => nav("/subjects")}>
          Subjects
        </span>
        <span>›</span>
        <span>{lesson.subject || lesson.courseTitle || "Lesson"}</span>
        <span>›</span>
        <span style={{ color: "#374151", fontWeight: 700 }}>{lesson.title}</span>
      </div>

      <div style={playerShellStyle}>
        {renderLessonMedia({
          lesson,
          mediaRef,
          handleLoadedMetadata,
          handlePlay,
          handlePause,
          handleEnded,
          handleTimeUpdate,
        })}
        {isWatchTracked ? (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: "rgba(255,255,255,.2)" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "#6C63FF", transition: "width .3s" }} />
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ ...statusPillStyle, background: completed ? "#DCFCE7" : "#EEF0FF", color: completed ? "#16A34A" : "#6C63FF" }}>
          {playerStatus}
        </div>
        {isWatchTracked ? (
          <div style={{ ...statusPillStyle, background: "#F9FAFB", color: "#374151" }}>
            {formatDuration(resumePosition)} / {formatDuration(durationSeconds || lesson.durationSeconds || 0)}
          </div>
        ) : null}
        <button onClick={handleDownload} style={outlineButton}>
          📥 Save Offline
        </button>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: "#F3F4F6", borderRadius: "16px", padding: "4px" }}>
        {["notes", "summary", "quiz"].map((nextTab) => (
          <button
            key={nextTab}
            onClick={() => setTab(nextTab)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "12px",
              border: "none",
              background: tab === nextTab ? "#fff" : "transparent",
              color: tab === nextTab ? "#6C63FF" : "#6B7280",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "13px",
              textTransform: "capitalize",
              boxShadow: tab === nextTab ? "0 2px 8px rgba(0,0,0,.08)" : "none",
            }}
          >
            {nextTab === "notes" ? "📝 Notes" : nextTab === "summary" ? "🤖 AI Summary" : "✏️ Quiz"}
          </button>
        ))}
      </div>

      {tab === "notes" && (
        <div style={card}>
          <h3 style={{ fontFamily: "Baloo 2,cursive", fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>
            {lesson.title}
          </h3>
          <div style={{ color: "#374151", lineHeight: 1.8, fontSize: "15px", marginBottom: "16px" }}>
            {lesson.content || "No content available."}
          </div>
          {lesson.aiKeyPoints?.length > 0 && (
            <>
              <h4 style={{ fontFamily: "Baloo 2,cursive", fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>
                🔑 Key Points
              </h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {lesson.aiKeyPoints.map((point, index) => (
                  <li key={`${point}-${index}`} style={{ display: "flex", gap: "10px", padding: "10px 14px", background: "#EEF0FF", borderRadius: "12px", fontSize: "14px" }}>
                    <span style={{ color: "#6C63FF", fontWeight: 800 }}>{index + 1}.</span>
                    {point}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {tab === "summary" && (
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg,#6C63FF,#9F95FF)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              🤖
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "15px" }}>AI Summary by Vidya</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Powered by Groq AI</div>
            </div>
          </div>
          {lesson.aiSummary ? (
            <p style={{ background: "#EEF0FF", borderRadius: "16px", padding: "16px", color: "#374151", lineHeight: 1.8, fontSize: "14px" }}>
              {lesson.aiSummary}
            </p>
          ) : (
            <div style={{ textAlign: "center", padding: "24px", color: "#9CA3AF" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🤖</div>
              <div style={{ fontSize: "13px" }}>AI summary not available for this lesson yet.</div>
            </div>
          )}
        </div>
      )}

      {tab === "quiz" && (
        <div style={{ ...card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✏️</div>
          <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
            Practice Quiz
          </div>
          <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "20px" }}>
            Test your knowledge on {lesson.subject || "this lesson"}!
          </div>
          <button onClick={() => nav("/quiz")} style={{ ...primaryButton, padding: "12px 32px", fontSize: "15px" }}>
            Go to Quizzes →
          </button>
        </div>
      )}
    </div>
  );
}

function renderLessonMedia({
  lesson,
  mediaRef,
  handleLoadedMetadata,
  handlePlay,
  handlePause,
  handleEnded,
  handleTimeUpdate,
}) {
  const sharedStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: "20px",
    background: "#1A1A2E",
  };

  if (lesson.type === "video") {
    return (
      <video
        ref={mediaRef}
        src={lesson.mediaUrl}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        style={sharedStyle}
      />
    );
  }

  if (lesson.type === "audio") {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: "16px", padding: "24px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "24px", fontWeight: 700 }}>{lesson.title}</div>
        <audio
          ref={mediaRef}
          src={lesson.mediaUrl}
          controls
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          style={{ width: "100%" }}
        />
      </div>
    );
  }

  if (lesson.type === "image") {
    return <img src={lesson.mediaUrl} alt={lesson.title} style={sharedStyle} />;
  }

  if (lesson.type === "pdf") {
    return (
      <iframe
        src={lesson.mediaUrl}
        title={lesson.title}
        style={{ width: "100%", height: "100%", border: "none", borderRadius: "20px", background: "#fff" }}
      />
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", padding: "30px", boxSizing: "border-box", textAlign: "center" }}>
      <div>
        <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>{lesson.title}</div>
        <div style={{ fontSize: "14px", opacity: 0.8 }}>
          Read the lesson notes below to continue learning.
        </div>
      </div>
    </div>
  );
}

function mergeProgress(serverProgress, cachedProgress) {
  if (!serverProgress) return cachedProgress || null;
  if (!cachedProgress) return serverProgress;
  const serverUpdatedAt = new Date(serverProgress.updatedAt || 0).getTime();
  const cachedUpdatedAt = new Date(cachedProgress.updatedAt || 0).getTime();
  return cachedUpdatedAt > serverUpdatedAt ? cachedProgress : serverProgress;
}

function durationToSeconds(duration) {
  return Math.round(Number(duration || 0) * 60);
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

const playerShellStyle = {
  background: "#1A1A2E",
  borderRadius: "20px",
  aspectRatio: "16/9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "20px",
  position: "relative",
  overflow: "hidden",
};

const card = {
  background: "#fff",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 4px 24px rgba(108,99,255,.08)",
};

const primaryButton = {
  background: "#6C63FF",
  color: "#fff",
  border: "none",
  borderRadius: "40px",
  padding: "10px 24px",
  fontWeight: 700,
  cursor: "pointer",
};

const outlineButton = {
  padding: "12px 20px",
  borderRadius: "40px",
  border: "2px solid #6C63FF",
  background: "transparent",
  color: "#6C63FF",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "14px",
};

const statusPillStyle = {
  padding: "12px 18px",
  borderRadius: "40px",
  fontWeight: 800,
  fontSize: "14px",
};
