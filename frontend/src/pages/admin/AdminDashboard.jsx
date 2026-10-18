import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api";

const card = {
  background: "#fff",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 4px 24px rgba(108,99,255,.1)",
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'moderation' | 'users' | 'broadcast'

  // Users state
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [usersLoading, setUsersLoading] = useState(false);

  // Moderation state
  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(false);

  // Broadcast state
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    body: "",
    targetRole: "all",
  });
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const loadDashboard = () => {
    api
      .get("/admin/dashboard")
      .then(({ data }) => {
        setData(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const openUsersModal = async () => {
    setActiveModal("users");
    setUsersLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${userRoleFilter}`);
      setUsers(res.data.users || []);
    } catch (e) {
      console.error(e.message);
    }
    setUsersLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      showToast("User role updated successfully");
      loadDashboard();
    } catch (e) {
      alert("Failed to update role");
    }
  };

  const openModerationModal = async () => {
    setActiveModal("moderation");
    setReelsLoading(true);
    try {
      const res = await api.get("/admin/moderation/reels");
      setReels(res.data.reels || []);
    } catch (e) {
      console.error(e.message);
    }
    setReelsLoading(false);
  };

  const handleModerateReel = async (reelId, isApproved) => {
    try {
      await api.patch(`/admin/moderation/reels/${reelId}`, { isApproved });
      setReels((prev) =>
        prev.map((r) => (r._id === reelId ? { ...r, isApproved } : r))
      );
      showToast(`Reel ${isApproved ? "approved" : "rejected"}`);
    } catch (e) {
      alert("Failed to update reel status");
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim()) return;
    setBroadcastSending(true);
    try {
      const res = await api.post("/admin/broadcast", broadcastForm);
      showToast(res.data?.message || "Notification sent!");
      setActiveModal(null);
      setBroadcastForm({ title: "", body: "", targetRole: "all" });
    } catch (e) {
      alert("Failed to send notification");
    } finally {
      setBroadcastSending(false);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
        Loading admin panel...
      </div>
    );

  const s = data?.stats || {};
  const recentUsers = data?.recentUsers || [];

  return (
    <div className="anim-slide-up" style={{ paddingBottom: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1
          style={{
            fontFamily: "Baloo 2,cursive",
            fontSize: "24px",
            fontWeight: 800,
            margin: 0,
            color: "#1E1B4B",
          }}
        >
          ⚙️ Admin Panel
        </h1>
        {toastMsg && (
          <span
            style={{
              background: "#DCFCE7",
              color: "#16A34A",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            ✓ {toastMsg}
          </span>
        )}
      </div>

      {/* Live Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {[
          [s.students ?? "—", "Students", "👦", "#6C63FF"],
          [s.teachers ?? "—", "Teachers", "👩‍🏫", "#22C55E"],
          [s.courses ?? "—", "Courses", "📚", "#F59E0B"],
          [`${s.activeRate ?? "—"}%`, "Active Rate", "📈", "#06B6D4"],
        ].map(([v, l, i, c]) => (
          <div
            key={l}
            style={{
              borderRadius: "20px",
              padding: "20px",
              background: `linear-gradient(135deg,${c},${c}dd)`,
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "28px",
                fontWeight: 800,
              }}
            >
              {v}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.9, fontWeight: 700 }}>
              {l}
            </div>
            <div
              style={{
                position: "absolute",
                right: "-8px",
                bottom: "-8px",
                fontSize: "44px",
                opacity: 0.2,
              }}
            >
              {i}
            </div>
          </div>
        ))}
      </div>

      {/* More stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {[
          [s.quizResults ?? "—", "Quizzes Done", "✅"],
          [s.lessonsCompleted ?? "—", "Lessons Done", "🎯"],
          [s.parents ?? "—", "Parents", "👨‍👩‍👧"],
        ].map(([v, l, i]) => (
          <div key={l} style={{ ...card, textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>{i}</div>
            <div
              style={{
                fontFamily: "Baloo 2,cursive",
                fontSize: "22px",
                fontWeight: 800,
              }}
            >
              {v}
            </div>
            <div
              style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 700 }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {[
          {
            icon: "🛡️",
            title: "Content Moderation",
            desc: "Review & approve reels",
            action: openModerationModal,
          },
          {
            icon: "👥",
            title: "User Management",
            desc: "Change roles & access",
            action: openUsersModal,
          },
          {
            icon: "🔔",
            title: "Broadcast Announcement",
            desc: "Push notification to users",
            action: () => setActiveModal("broadcast"),
          },
          {
            icon: "🌐",
            title: "Languages Active",
            desc: "3 languages: EN / MR / HI",
            action: () => showToast("Supported: English, Marathi, Hindi"),
          },
        ].map((item) => (
          <div
            key={item.title}
            onClick={item.action}
            style={{
              ...card,
              cursor: "pointer",
              transition: "transform .2s, box-shadow .2s",
              border: "1px solid #E5E7EB",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(108,99,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(108,99,255,.1)";
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>{item.icon}</div>
            <div
              style={{ fontWeight: 800, fontSize: "14px", marginBottom: "4px" }}
            >
              {item.title}
            </div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Recent Registrations Table */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            👤 Recent Registrations
          </div>
          <button
            onClick={openUsersModal}
            style={{
              background: "#EEF0FF",
              color: "#4F46E5",
              border: "none",
              borderRadius: "12px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            View All Users →
          </button>
        </div>

        {recentUsers.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#9CA3AF",
              fontSize: "13px",
            }}
          >
            No users yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #F3F4F6" }}>
                  {["Name", "Role", "Email / Phone", "Joined"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        color: "#9CA3AF",
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #F9FAFB" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                      {u.name}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          background:
                            u.role === "student"
                              ? "#EEF0FF"
                              : u.role === "teacher"
                                ? "#DCFCE7"
                                : "#FEF9C3",
                          color:
                            u.role === "student"
                              ? "#4F46E5"
                              : u.role === "teacher"
                                ? "#16A34A"
                                : "#D97706",
                          borderRadius: "20px",
                          padding: "3px 8px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#6B7280" }}>
                      {u.email || u.phone || "—"}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#9CA3AF" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* USER MANAGEMENT MODAL */}
      {activeModal === "users" &&
        createPortal(
          <div
            onClick={() => setActiveModal(null)}
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
                padding: "24px",
                width: "100%",
                maxWidth: "760px",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
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
                  👥 User Management ({users.length})
                </h2>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                {usersLoading ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    ⏳ Loading users...
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #F3F4F6" }}>
                        <th style={{ textAlign: "left", padding: "8px" }}>Name</th>
                        <th style={{ textAlign: "left", padding: "8px" }}>Contact</th>
                        <th style={{ textAlign: "left", padding: "8px" }}>Current Role</th>
                        <th style={{ textAlign: "left", padding: "8px" }}>Change Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} style={{ borderBottom: "1px solid #F9FAFB" }}>
                          <td style={{ padding: "8px", fontWeight: 700 }}>{u.name}</td>
                          <td style={{ padding: "8px", color: "#6B7280" }}>{u.email || u.phone || "—"}</td>
                          <td style={{ padding: "8px" }}>
                            <span
                              style={{
                                background: "#EEF0FF",
                                color: "#4F46E5",
                                borderRadius: "12px",
                                padding: "2px 8px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: "8px" }}>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "8px",
                                border: "1px solid #D1D5DB",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              <option value="student">student</option>
                              <option value="teacher">teacher</option>
                              <option value="parent">parent</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* CONTENT MODERATION MODAL */}
      {activeModal === "moderation" &&
        createPortal(
          <div
            onClick={() => setActiveModal(null)}
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
                padding: "24px",
                width: "100%",
                maxWidth: "760px",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
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
                  🛡️ Reel Content Moderation ({reels.length})
                </h2>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                {reelsLoading ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    ⏳ Loading content...
                  </div>
                ) : reels.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    No reels to review.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {reels.map((r) => (
                      <div
                        key={r._id}
                        style={{
                          border: "1px solid #E5E7EB",
                          borderRadius: "14px",
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "14px" }}>{r.title}</div>
                          <div style={{ fontSize: "11px", color: "#6B7280" }}>
                            Subject: {r.subject} · Class {r.class} · Teacher: {r.teacher?.name || "Teacher"}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span
                            style={{
                              background: r.isApproved ? "#DCFCE7" : "#FEF3C7",
                              color: r.isApproved ? "#16A34A" : "#D97706",
                              padding: "3px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {r.isApproved ? "Approved" : "Pending"}
                          </span>
                          <button
                            onClick={() => handleModerateReel(r._id, !r.isApproved)}
                            style={{
                              background: r.isApproved ? "#FEE2E2" : "#DCFCE7",
                              color: r.isApproved ? "#DC2626" : "#16A34A",
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {r.isApproved ? "Reject" : "Approve"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* BROADCAST NOTIFICATION MODAL */}
      {activeModal === "broadcast" &&
        createPortal(
          <div
            onClick={() => setActiveModal(null)}
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
                padding: "24px",
                width: "100%",
                maxWidth: "480px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
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
                  📢 Broadcast Announcement
                </h2>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBroadcastSubmit}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Village Science Fair this Saturday!"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #D1D5DB", boxSizing: "border-box" }}
                    required
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                    Target Audience
                  </label>
                  <select
                    value={broadcastForm.targetRole}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #D1D5DB", boxSizing: "border-box" }}
                  >
                    <option value="all">All Users (Students, Teachers & Parents)</option>
                    <option value="student">Students Only</option>
                    <option value="teacher">Teachers Only</option>
                    <option value="parent">Parents Only</option>
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                    Message Content
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Details about the announcement..."
                    value={broadcastForm.body}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #D1D5DB", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid #E5E7EB", background: "#F9FAFB", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcastSending}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "10px",
                      border: "none",
                      background: broadcastSending ? "#9CA3AF" : "#4F46E5",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: broadcastSending ? "not-allowed" : "pointer",
                    }}
                  >
                    {broadcastSending ? "Sending..." : "Send Broadcast"}
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
