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

  // Teacher Invite state
  const [inviteForm, setInviteForm] = useState({ email: "", name: "", school: "" });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [invitesList, setInvitesList] = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  const loadInvites = async () => {
    setInvitesLoading(true);
    try {
      const res = await api.get("/admin/teacher-invites");
      setInvitesList(res.data.invites || []);
    } catch (e) {
      console.error(e.message);
    } finally {
      setInvitesLoading(false);
    }
  };

  const openInviteModal = () => {
    setActiveModal("inviteTeacher");
    setInviteResult(null);
    setInviteForm({ email: "", name: "", school: "" });
    loadInvites();
  };

  const handleSendTeacherInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;
    setInviteLoading(true);
    try {
      const res = await api.post("/admin/invite-teacher", inviteForm);
      setInviteResult(res.data);
      showToast(res.data.message || "Invitation created!");
      loadInvites();
      setInviteForm({ email: "", name: "", school: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send teacher invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevokeInvite = async (inviteId) => {
    if (!window.confirm("Are you sure you want to revoke this teacher invitation link?")) return;
    try {
      await api.delete(`/admin/teacher-invites/${inviteId}`);
      showToast("Invitation revoked");
      loadInvites();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to revoke invitation");
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id || "main");
    setTimeout(() => setCopiedToken(null), 2500);
  };

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
            icon: "✉️",
            title: "Invite Teacher",
            desc: "Send registration link",
            action: openInviteModal,
          },
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

      {/* TEACHER INVITATION MODAL */}
      {activeModal === "inviteTeacher" &&
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
                width: "100%",
                maxWidth: "640px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "28px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontFamily: "Baloo 2, cursive",
                      fontWeight: 800,
                      color: "#1E1B4B",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>👩‍🏫</span>
                    <span>Teacher Invitation Portal</span>
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6B7280" }}>
                    Send verified registration links to educators. Public self-registration for teachers is disabled.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: "#F3F4F6",
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#6B7280",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Invitation Creation Form */}
              <form
                onSubmit={handleSendTeacherInvite}
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "18px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "14px", color: "#1E293B", marginBottom: "12px" }}>
                  ✉️ Issue New Teacher Invitation
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                    Teacher Email Address <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sunita.teacher@school.org"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      boxSizing: "border-box",
                      fontSize: "13px",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                      Teacher Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sunita Sharma"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #CBD5E1",
                        boxSizing: "border-box",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                      School / Subject (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Z.P. High School / Science"
                      value={inviteForm.school}
                      onChange={(e) => setInviteForm({ ...inviteForm, school: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #CBD5E1",
                        boxSizing: "border-box",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={inviteLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background: inviteLoading ? "#94A3B8" : "#10B981",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: inviteLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                  }}
                >
                  {inviteLoading ? "Generating & Sending Invitation..." : "🚀 Send Teacher Invitation"}
                </button>
              </form>

              {/* Success Result Banner & Quick Link Copy */}
              {inviteResult && (
                <div
                  style={{
                    background: "#ECFDF5",
                    border: "1.5px solid #86EFAC",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#166534", fontSize: "14px", marginBottom: "8px" }}>
                    <span>✅</span>
                    <span>{inviteResult.message}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#15803D", marginBottom: "8px" }}>
                    Share this unique registration link directly with the teacher via WhatsApp, SMS, or Email:
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      readOnly
                      value={inviteResult.inviteUrl}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #86EFAC",
                        background: "#fff",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "#065F46",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(inviteResult.inviteUrl, "main")}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: copiedToken === "main" ? "#047857" : "#10B981",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "12px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {copiedToken === "main" ? "✓ Copied!" : "📋 Copy Link"}
                    </button>
                  </div>
                </div>
              )}

              {/* List of Sent Invitations */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontWeight: 800, fontSize: "15px", color: "#1E293B" }}>
                    📋 Sent Teacher Invitations ({invitesList.length})
                  </div>
                  <button
                    onClick={loadInvites}
                    style={{ background: "none", border: "none", color: "#6C63FF", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    🔄 Refresh
                  </button>
                </div>

                {invitesLoading ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#94A3B8", fontSize: "13px" }}>
                    Loading invitations...
                  </div>
                ) : invitesList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px", color: "#94A3B8", fontSize: "13px", background: "#F8FAFC", borderRadius: "12px" }}>
                    No teacher invitations sent yet. Fill out the form above to invite your first teacher!
                  </div>
                ) : (
                  <div style={{ maxHeight: "260px", overflowY: "auto", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", textAlign: "left", color: "#64748B" }}>
                          <th style={{ padding: "8px 12px" }}>Teacher</th>
                          <th style={{ padding: "8px 12px" }}>School</th>
                          <th style={{ padding: "8px 12px" }}>Status</th>
                          <th style={{ padding: "8px 12px", textAlign: "right" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitesList.map((inv) => {
                          const origin = window.location.origin;
                          const link = `${origin}/register?invite=${inv.token}`;
                          const isExpired = new Date(inv.expiresAt) < new Date();
                          return (
                            <tr key={inv._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                              <td style={{ padding: "8px 12px" }}>
                                <div style={{ fontWeight: 700, color: "#1E293B" }}>{inv.name || "Educator"}</div>
                                <div style={{ color: "#64748B", fontSize: "11px" }}>{inv.email}</div>
                              </td>
                              <td style={{ padding: "8px 12px", color: "#64748B" }}>
                                {inv.school || "—"}
                              </td>
                              <td style={{ padding: "8px 12px" }}>
                                {inv.status === "used" ? (
                                  <span style={{ background: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontWeight: 700, fontSize: "10px" }}>
                                    ✅ Registered
                                  </span>
                                ) : inv.status === "revoked" ? (
                                  <span style={{ background: "#FEE2E2", color: "#991B1B", padding: "2px 8px", borderRadius: "10px", fontWeight: 700, fontSize: "10px" }}>
                                    ✕ Revoked
                                  </span>
                                ) : isExpired ? (
                                  <span style={{ background: "#F1F5F9", color: "#64748B", padding: "2px 8px", borderRadius: "10px", fontWeight: 700, fontSize: "10px" }}>
                                    Expired
                                  </span>
                                ) : (
                                  <span style={{ background: "#FEF9C3", color: "#854D0E", padding: "2px 8px", borderRadius: "10px", fontWeight: 700, fontSize: "10px" }}>
                                    ⏳ Pending
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "8px 12px", textAlign: "right" }}>
                                {inv.status === "pending" && !isExpired && (
                                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(link, inv._id)}
                                      style={{
                                        padding: "4px 8px",
                                        borderRadius: "6px",
                                        border: "1px solid #CBD5E1",
                                        background: copiedToken === inv._id ? "#DCFCE7" : "#fff",
                                        color: copiedToken === inv._id ? "#166534" : "#475569",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {copiedToken === inv._id ? "✓ Copied" : "Copy"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRevokeInvite(inv._id)}
                                      style={{
                                        padding: "4px 8px",
                                        borderRadius: "6px",
                                        border: "1px solid #FCA5A5",
                                        background: "#fff",
                                        color: "#DC2626",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Revoke
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

