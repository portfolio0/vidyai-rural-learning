import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api";

export default function NotificationCenter({
  forceOpen = false,
  onClose = null,
  hideBell = false,
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isModalOpen = forceOpen || open;
  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      // silently fail if offline or unauthorized
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e.message);
    }
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <>
      {!hideBell && (
        <div
          onClick={() => {
            setOpen(true);
            fetchNotifications();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 2px 10px rgba(0,0,0,.06)",
            cursor: "pointer",
            position: "relative",
            userSelect: "none",
            transition: "transform 0.15s",
          }}
          title="Notifications"
        >
          <span style={{ fontSize: "18px" }}>🔔</span>
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                background: "#EF4444",
                color: "white",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: 800,
                minWidth: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                boxShadow: "0 2px 4px rgba(239,68,68,.4)",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      )}

      {isModalOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.45)",
              zIndex: 999999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={handleClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: "24px",
                width: "100%",
                maxWidth: "480px",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,.2)",
                animation: "scaleUp 0.2s ease-out",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid #F3F4F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "linear-gradient(135deg,#EEF2FF,#F8FAFC)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px" }}>🔔</span>
                  <span
                    style={{
                      fontFamily: "Baloo 2,cursive",
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#1F2937",
                    }}
                  >
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: "#EEF0FF",
                        color: "#6C63FF",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#6C63FF",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "18px",
                      color: "#9CA3AF",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* List */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {notifications.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 20px",
                      color: "#9CA3AF",
                    }}
                  >
                    <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔕</div>
                    <div style={{ fontWeight: 700, fontSize: "14px" }}>
                      No notifications yet
                    </div>
                    <div style={{ fontSize: "12px", marginTop: "4px" }}>
                      Announcements, test results, and homework marks will appear here.
                    </div>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markOneRead(n._id)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "16px",
                        background: n.isRead ? "#F9FAFB" : "#EEF2FF",
                        border: n.isRead
                          ? "1px solid #E5E7EB"
                          : "1px solid #C7D2FE",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: n.isRead ? "#E5E7EB" : "#E0E7FF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      >
                        {n.type === "badge"
                          ? "🏆"
                          : n.type === "assignment"
                          ? "📝"
                          : n.type === "quiz"
                          ? "✏️"
                          : "📢"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "13px",
                            color: n.isRead ? "#374151" : "#1E1B4B",
                            marginBottom: "2px",
                          }}
                        >
                          {n.title}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: n.isRead ? "#6B7280" : "#4338CA",
                            lineHeight: 1.4,
                          }}
                        >
                          {n.body}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#9CA3AF",
                            marginTop: "4px",
                          }}
                        >
                          {new Date(n.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {!n.isRead && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#6C63FF",
                            flexShrink: 0,
                            marginTop: "6px",
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
