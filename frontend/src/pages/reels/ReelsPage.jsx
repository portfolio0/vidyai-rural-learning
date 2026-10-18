import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuthStore, useUIStore } from "../../store/stores";
import api from "../../services/api";

const FILTERS = [
  "🔥 Trending",
  "📐 Math",
  "🔬 Science",
  "📖 English",
  "🌍 GK",
  "📜 Marathi",
];

const SUBJ_MAP = {
  "📐 Math": "Mathematics",
  "🔬 Science": "Science",
  "📖 English": "English",
  "🌍 GK": "GK",
  "📜 Marathi": "Marathi",
};

// Map any video URL (including broken legacy sample links) to working local video assets
const resolveVideoUrl = (url, subject) => {
  if (!url) {
    if (subject === "Science") return "/videos/science-lesson.mp4";
    if (subject === "English") return "/videos/english-lesson.mp4";
    if (subject === "Marathi") return "/videos/marathi-history.mp4";
    return "/videos/math-trick.mp4";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.includes("gtv-videos-bucket") || url.includes("sample")) {
      if (url.includes("Escapes") || subject === "Science") return "/videos/science-lesson.mp4";
      if (url.includes("Fun") || subject === "English") return "/videos/english-lesson.mp4";
      if (url.includes("JoyBlazes") || subject === "Marathi") return "/videos/marathi-history.mp4";
      return "/videos/math-trick.mp4";
    }
    return url;
  }
  return url;
};

// ══ VERTICAL SNAP FEED (YouTube Shorts / Instagram Reels) ══
function VerticalReelsFeed({
  reels,
  initialIdx = 0,
  onClose,
  liked,
  onLike,
  onShare,
  copiedLink,
}) {
  const [activeIdx, setActiveIdx] = useState(initialIdx);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayAnim, setShowPlayAnim] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef(null);
  const videoRefs = useRef({});

  // Scroll to initial index on mount
  useEffect(() => {
    if (containerRef.current && initialIdx > 0) {
      containerRef.current.scrollTop = initialIdx * window.innerHeight;
    }
  }, [initialIdx]);

  // Lock body scroll while feed is active
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  // Manage auto-play on active index change
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const idx = Number(key);
      const vid = videoRefs.current[idx];
      if (!vid) return;

      if (idx === activeIdx) {
        vid.currentTime = 0;
        vid.muted = isMuted;
        vid
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
        const current = reels[activeIdx];
        if (current?._id) {
          api.post(`/reels/${current._id}/view`).catch(() => {});
        }
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [activeIdx, reels]);

  // Sync mute state across videos
  useEffect(() => {
    const activeVid = videoRefs.current[activeIdx];
    if (activeVid) activeVid.muted = isMuted;
  }, [isMuted, activeIdx]);

  // Track vertical snap scroll index
  const handleScroll = (e) => {
    const st = e.currentTarget.scrollTop;
    const h = window.innerHeight;
    const idx = Math.round(st / h);
    if (idx !== activeIdx && idx >= 0 && idx < reels.length) {
      setActiveIdx(idx);
      setProgress(0);
    }
  };

  const scrollToIdx = (targetIdx) => {
    if (targetIdx < 0 || targetIdx >= reels.length || !containerRef.current) return;
    containerRef.current.scrollTo({
      top: targetIdx * window.innerHeight,
      behavior: "smooth",
    });
  };

  const togglePlay = () => {
    const vid = videoRefs.current[activeIdx];
    if (!vid) return;
    if (vid.paused) {
      vid
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      vid.pause();
      setIsPlaying(false);
    }
    setShowPlayAnim(true);
    setTimeout(() => setShowPlayAnim(false), 500);
  };

  const handleDoubleClick = (reelId) => {
    onLike(null, reelId);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 800);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown" || e.key === "j" || e.key === "PageDown") {
        e.preventDefault();
        scrollToIdx(activeIdx + 1);
      } else if (e.key === "ArrowUp" || e.key === "k" || e.key === "PageUp") {
        e.preventDefault();
        scrollToIdx(activeIdx - 1);
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m" || e.key === "M") {
        setIsMuted((m) => !m);
      } else if (e.key === "f" || e.key === "F") {
        setIsFullscreen((f) => !f);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIdx, reels.length]);

  return createPortal(
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#05050A",
        zIndex: 999999,
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}
    >
      {/* Top Floating App Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 40,
          background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#fff",
            fontFamily: "Baloo 2, cursive",
            fontSize: "20px",
            fontWeight: 800,
            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            pointerEvents: "auto",
          }}
        >
          <span>🎬</span>
          <span>VidyAI Shorts</span>
        </div>

        <button
          onClick={onClose}
          title="Close Feed (Esc)"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            borderRadius: "50%",
            width: "42px",
            height: "42px",
            cursor: "pointer",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
            pointerEvents: "auto",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ✕
        </button>
      </div>

      {/* Desktop Vertical Next / Prev buttons beside the reel (YouTube Shorts style) */}
      <div
        style={{
          position: "fixed",
          right: isFullscreen ? "24px" : "calc(50% - 310px)",
          bottom: "50%",
          transform: "translateY(50%)",
          display: window.innerWidth < 880 && !isFullscreen ? "none" : "flex",
          flexDirection: "column",
          gap: "14px",
          zIndex: 40,
        }}
      >
        <button
          onClick={() => scrollToIdx(activeIdx - 1)}
          disabled={activeIdx === 0}
          title="Previous short (↑ or k)"
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: activeIdx === 0 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.18)",
            color: activeIdx === 0 ? "rgba(255,255,255,0.2)" : "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            fontSize: "18px",
            cursor: activeIdx === 0 ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            transition: "all 0.15s ease",
          }}
        >
          ▲
        </button>
        <button
          onClick={() => scrollToIdx(activeIdx + 1)}
          disabled={activeIdx === reels.length - 1}
          title="Next short (↓ or j)"
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background:
              activeIdx === reels.length - 1 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.18)",
            color: activeIdx === reels.length - 1 ? "rgba(255,255,255,0.2)" : "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            fontSize: "18px",
            cursor: activeIdx === reels.length - 1 ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            transition: "all 0.15s ease",
          }}
        >
          ▼
        </button>
      </div>

      {/* Vertical Snap Sections for Each Reel */}
      {reels.map((r, idx) => {
        const isCurrent = idx === activeIdx;
        const isReelLiked = liked[r._id];
        const videoSrc = resolveVideoUrl(r.videoUrl, r.subject);

        return (
          <div
            key={r._id || idx}
            style={{
              width: "100vw",
              height: "100vh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Ambient backdrop glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at center, rgba(79,70,229,0.15) 0%, rgba(5,5,10,0.95) 75%)",
                pointerEvents: "none",
              }}
            />

            {/* Reel Frame Container */}
            <div
              style={{
                position: "relative",
                width:
                  isFullscreen || window.innerWidth < 768
                    ? "100vw"
                    : "min(460px, calc(100vw - 32px))",
                height:
                  isFullscreen || window.innerWidth < 768
                    ? "100vh"
                    : "min(880px, calc(100vh - 32px))",
                borderRadius: isFullscreen || window.innerWidth < 768 ? "0px" : "24px",
                overflow: "hidden",
                background: "#000",
                boxShadow:
                  isFullscreen || window.innerWidth < 768
                    ? "none"
                    : "0 25px 80px rgba(0,0,0,0.9), 0 0 50px rgba(79,70,229,0.25)",
                display: "flex",
                flexDirection: "column",
                transition: "width 0.2s, height 0.2s, border-radius 0.2s",
              }}
            >
              {/* Video Player Display */}
              <div
                onClick={togglePlay}
                onDoubleClick={() => handleDoubleClick(r._id)}
                style={{
                  flex: 1,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#000",
                  cursor: "pointer",
                }}
              >
                <video
                  ref={(el) => (videoRefs.current[idx] = el)}
                  src={videoSrc}
                  muted={isMuted}
                  loop
                  playsInline
                  autoPlay={isCurrent}
                  onTimeUpdate={(e) => {
                    if (isCurrent && e.target.duration) {
                      setProgress((e.target.currentTime / e.target.duration) * 100);
                    }
                  }}
                  onError={(e) => {
                    if (e.target.src !== "/videos/math-trick.mp4") {
                      e.target.src = "/videos/math-trick.mp4";
                      e.target.play().catch(() => {});
                    }
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: isFullscreen ? "contain" : "cover",
                    background: "#000",
                  }}
                />

                {/* Animated Play / Pause Indicator */}
                {showPlayAnim && isCurrent && (
                  <div
                    style={{
                      position: "absolute",
                      width: "80px",
                      height: "80px",
                      background: "rgba(0,0,0,0.65)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "36px",
                      color: "#fff",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {isPlaying ? "▶" : "⏸"}
                  </div>
                )}

                {/* Animated Heart on Double Tap */}
                {heartAnim && isCurrent && (
                  <div
                    style={{
                      position: "absolute",
                      fontSize: "90px",
                      color: "#EF4444",
                      filter: "drop-shadow(0 4px 20px rgba(239,68,68,0.6))",
                      pointerEvents: "none",
                    }}
                  >
                    ❤️
                  </div>
                )}

                {/* Top Video Header: Subject + Class Badges */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: "16px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    zIndex: 20,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%)",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", pointerEvents: "auto" }}>
                    <span
                      style={{
                        background: "rgba(79, 70, 229, 0.9)",
                        color: "#fff",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      {r.subject}
                    </span>
                    <span
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                        borderRadius: "20px",
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      Class {r.class || 6}
                    </span>
                  </div>
                </div>

                {/* Right Side Vertical Action Rail */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    right: "12px",
                    bottom: "70px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                    alignItems: "center",
                    zIndex: 25,
                  }}
                >
                  {/* Like Button */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <button
                      onClick={(e) => onLike(e, r._id)}
                      title="Like Reel"
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "50%",
                        width: "48px",
                        height: "48px",
                        color: isReelLiked ? "#EF4444" : "#fff",
                        cursor: "pointer",
                        fontSize: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      {isReelLiked ? "❤️" : "🤍"}
                    </button>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: 700,
                        marginTop: "4px",
                        textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                      }}
                    >
                      {r.likes || 0}
                    </span>
                  </div>

                  {/* Share Button */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <button
                      onClick={(e) => onShare(e, r)}
                      title="Share Reel"
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "50%",
                        width: "48px",
                        height: "48px",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      📤
                    </button>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 700,
                        marginTop: "4px",
                        textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                      }}
                    >
                      {copiedLink ? "Copied!" : "Share"}
                    </span>
                  </div>

                  {/* Sound Toggle Button */}
                  <button
                    onClick={() => setIsMuted((m) => !m)}
                    title={isMuted ? "Unmute (m)" : "Mute (m)"}
                    style={{
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "50%",
                      width: "48px",
                      height: "48px",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    }}
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>

                  {/* Fullscreen Expand Toggle */}
                  <button
                    onClick={() => setIsFullscreen((f) => !f)}
                    title={isFullscreen ? "Exit Fullscreen" : "Full Screen (f)"}
                    style={{
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "50%",
                      width: "48px",
                      height: "48px",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    }}
                  >
                    {isFullscreen ? "⤡" : "⛶"}
                  </button>
                </div>

                {/* Bottom Metadata Overlay */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "24px 18px 18px",
                    background:
                      "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 60%, transparent 100%)",
                    zIndex: 20,
                  }}
                >
                  {/* Creator Info */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #F59E0B, #EC4899)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      }}
                    >
                      {r.teacher?.avatar || "👨‍🏫"}
                    </div>
                    <div>
                      <div
                        style={{
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {r.teacher?.name || "VidyAI Teacher"}
                        <span style={{ fontSize: "12px", opacity: 0.8 }}>✓</span>
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>
                        Educator • VidyAI
                      </div>
                    </div>
                  </div>

                  {/* Reel Title */}
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "15px",
                      lineHeight: "1.35",
                      marginBottom: "6px",
                      paddingRight: "65px",
                    }}
                  >
                    {r.title}
                  </div>

                  {/* Tags */}
                  {r.tags && r.tags.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        fontSize: "12px",
                        color: "#A5B4FC",
                        fontWeight: 600,
                      }}
                    >
                      {r.tags.map((tag, tIdx) => (
                        <span key={tIdx}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Progress Bar along the bottom (YouTube Shorts style) */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "rgba(255,255,255,0.25)",
                    zIndex: 25,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${isCurrent ? progress : 0}%`,
                      background: "linear-gradient(90deg, #6C63FF, #EF4444)",
                      transition: "width 0.15s linear",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

export default function ReelsPage() {
  const { user } = useAuthStore();
  const { lowBandwidthMode, toggleLowBandwidth } = useUIStore();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("🔥 Trending");
  const [liked, setLiked] = useState({});
  const [feedActiveIdx, setFeedActiveIdx] = useState(null); // When not null, vertical feed is open
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: "",
    subject: "Mathematics",
    class: user?.class || 6,
    videoUrl: "",
    tags: "",
  });
  const [videoFile, setVideoFile] = useState(null);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (user?.class) params.set("class", user.class);
      if (lowBandwidthMode) params.set("lowBandwidth", "true");
      const subj = SUBJ_MAP[filter];
      if (subj) params.set("subject", subj);
      const { data } = await api.get(`/reels?${params}`);
      setReels(data.reels || []);
    } catch (e) {
      console.error("[Reels Fetch Error]", e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReels();
  }, [filter, lowBandwidthMode]);

  const handleLike = async (e, id) => {
    if (e) e.stopPropagation();
    if (liked[id]) return;
    setLiked((prev) => ({ ...prev, [id]: true }));
    setReels((prev) =>
      prev.map((x) => (x._id === id ? { ...x, likes: (x.likes || 0) + 1 } : x)),
    );
    try {
      await api.post(`/reels/${id}/like`);
    } catch (err) {
      console.error("[Like Error]", err.message);
    }
  };

  const handleShare = async (e, r) => {
    if (e) e.stopPropagation();
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: r.title,
          text: `Check out "${r.title}" on VidyAI!`,
          url: shareUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError("");
    if (!uploadForm.title.trim()) {
      setUploadError("Please provide a title");
      return;
    }
    if (!videoFile && !uploadForm.videoUrl.trim()) {
      setUploadError("Please upload a video file or enter a video URL");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("subject", uploadForm.subject);
      formData.append("class", uploadForm.class);
      formData.append("tags", uploadForm.tags);
      if (videoFile) {
        formData.append("video", videoFile);
      } else {
        formData.append("videoUrl", uploadForm.videoUrl);
      }

      const res = await api.post("/reels", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.reel) {
        setReels((prev) => [res.data.reel, ...prev]);
      }
      setShowUploadModal(false);
      setUploadForm({
        title: "",
        subject: "Mathematics",
        class: user?.class || 6,
        videoUrl: "",
        tags: "",
      });
      setVideoFile(null);
    } catch (err) {
      setUploadError(err.response?.data?.error || err.message || "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  return (
    <div style={{ paddingBottom: "40px", width: "100%" }}>
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Baloo 2, cursive",
              fontSize: "26px",
              fontWeight: 800,
              color: "#1E1B4B",
              margin: 0,
            }}
          >
            🎬 Learning Reels
          </h1>
          <p style={{ margin: "3px 0 0", color: "#6B7280", fontSize: "14px" }}>
            Bite-sized, practical lessons made for curious learners
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={toggleLowBandwidth}
            style={{
              background: lowBandwidthMode ? "#DCFCE7" : "#F3F4F6",
              color: lowBandwidthMode ? "#166534" : "#4B5563",
              border: lowBandwidthMode ? "1.5px solid #86EFAC" : "1px solid #D1D5DB",
              borderRadius: "14px",
              padding: "10px 14px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            title="Toggle rural data saving mode"
          >
            <span>📶</span> {lowBandwidthMode ? "Data Saver: ON" : "Data Saver: OFF"}
          </button>
          {reels.length > 0 && (
            <button
              onClick={() => setFeedActiveIdx(0)}
              style={{
                background: "linear-gradient(135deg, #EC4899, #8B5CF6)",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                padding: "10px 18px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(236, 72, 153, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>▶</span> Open Reels Feed
            </button>
          )}

          {isTeacherOrAdmin && (
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                padding: "10px 18px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>➕</span> Upload Reel
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {FILTERS.map((f) => (
          <span
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 18px",
              borderRadius: "40px",
              background: filter === f ? "#4F46E5" : "#FFFFFF",
              color: filter === f ? "#fff" : "#4B5563",
              border: filter === f ? "1px solid #4F46E5" : "1px solid #E5E7EB",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all .15s ease",
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* Feed Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
          ⏳ Loading learning shorts...
        </div>
      ) : reels.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            background: "#fff",
            borderRadius: "20px",
            color: "#9CA3AF",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>🎬</div>
          <div
            style={{
              fontFamily: "Baloo 2, cursive",
              fontSize: "18px",
              fontWeight: 700,
              marginBottom: "8px",
              color: "#1F2937",
            }}
          >
            No reels in this category yet
          </div>
          <div style={{ fontSize: "13px", color: "#6B7280" }}>
            {isTeacherOrAdmin
              ? "Be the first to upload a short lesson reel for students!"
              : "Check other subjects or come back soon!"}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "20px",
            width: "100%",
          }}
        >
          {reels.map((r, idx) => (
            <div
              key={r._id || idx}
              onClick={() => setFeedActiveIdx(idx)}
              style={{
                background: "#fff",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "transform .2s, box-shadow .2s",
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(79, 70, 229, 0.16)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
              }}
            >
              {/* Thumbnail / Video Preview Box */}
              <div
                style={{
                  height: "260px",
                  background: "#0F172A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  color: "#fff",
                  overflow: "hidden",
                }}
              >
                <video
                  src={resolveVideoUrl(r.videoUrl, r.subject)}
                  muted
                  playsInline
                  preload={lowBandwidthMode ? "none" : "metadata"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.9,
                  }}
                  onMouseEnter={(e) => {
                    if (!lowBandwidthMode) e.currentTarget.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    if (!lowBandwidthMode) {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    width: "48px",
                    height: "48px",
                    background: "rgba(255,255,255,0.92)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    color: "#4F46E5",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
                    pointerEvents: "none",
                  }}
                >
                  ▶
                </div>
                <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                  <span
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      borderRadius: "12px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {r.duration ? `${r.duration}s` : "Short"}
                  </span>
                </div>
                <div style={{ position: "absolute", bottom: "12px", left: "12px" }}>
                  <span
                    style={{
                      background: "rgba(79, 70, 229, 0.9)",
                      backdropFilter: "blur(4px)",
                      color: "#fff",
                      borderRadius: "20px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {r.subject}
                  </span>
                </div>
              </div>

              {/* Reel Card Details */}
              <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "14px",
                    lineHeight: "1.35",
                    marginBottom: "6px",
                    color: "#111827",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {r.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6B7280",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>👩‍🏫 {r.teacher?.name || "Teacher"}</span>
                  <span>·</span>
                  <span>👁 {r.views || 0}</span>
                </div>
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    alignItems: "center",
                    borderTop: "1px solid #F3F4F6",
                    paddingTop: "10px",
                  }}
                >
                  <span
                    onClick={(e) => handleLike(e, r._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: liked[r._id] ? "#EF4444" : "#6B7280",
                      fontWeight: 700,
                    }}
                  >
                    {liked[r._id] ? "❤️" : "🤍"} {r.likes || 0}
                  </span>
                  <span
                    onClick={(e) => handleShare(e, r)}
                    title="Share Reel"
                    style={{ cursor: "pointer", color: "#6B7280", fontSize: "13px" }}
                  >
                    📤 Share
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ VERTICAL SNAP FEED OVERLAY (YouTube Shorts / Instagram Style) ══ */}
      {feedActiveIdx !== null && reels.length > 0 && (
        <VerticalReelsFeed
          reels={reels}
          initialIdx={feedActiveIdx}
          onClose={() => setFeedActiveIdx(null)}
          liked={liked}
          onLike={handleLike}
          onShare={handleShare}
          copiedLink={copiedLink}
        />
      )}

      {/* ══ PORTALED UPLOAD REEL MODAL ══ */}
      {showUploadModal &&
        createPortal(
          <div
            onClick={() => setShowUploadModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              zIndex: 999999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: "24px",
                padding: "26px",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "Baloo 2, cursive",
                    fontSize: "20px",
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  📹 Upload Learning Reel
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "#9CA3AF",
                  }}
                >
                  ✕
                </button>
              </div>

              {uploadError && (
                <div
                  style={{
                    background: "#FEE2E2",
                    color: "#DC2626",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    marginBottom: "12px",
                  }}
                >
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadSubmit}>
                <div style={{ marginBottom: "12px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Reel Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 60-Second Math Shortcut"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, title: e.target.value })
                    }
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#374151",
                        marginBottom: "4px",
                      }}
                    >
                      Subject
                    </label>
                    <select
                      value={uploadForm.subject}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, subject: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #D1D5DB",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="GK">General Knowledge</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#374151",
                        marginBottom: "4px",
                      }}
                    >
                      Target Class (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={uploadForm.class}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, class: e.target.value })
                      }
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
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Upload Video File (MP4, WebM)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "10px",
                      border: "1px dashed #D1D5DB",
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    OR Direct Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../video.mp4"
                    value={uploadForm.videoUrl}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, videoUrl: e.target.value })
                    }
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

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                      background: "#F9FAFB",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "10px",
                      border: "none",
                      background: uploadLoading ? "#9CA3AF" : "#4F46E5",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: uploadLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {uploadLoading ? "Publishing..." : "Publish Reel"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
