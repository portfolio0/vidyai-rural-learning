import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/stores";
import api from "../../services/api";

const card = {
  background: "#fff",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 4px 24px rgba(108,99,255,.1)",
};

const PARENT_TABS = [
  { key: "overview", icon: "📊", label: "Overview" },
  { key: "children", icon: "👨‍👩‍👧", label: "Children" },
  { key: "progress", icon: "📈", label: "Progress" },
  { key: "attendance", icon: "🗓️", label: "Attendance" },
  { key: "assignments", icon: "📂", label: "Assignments" },
  { key: "reports", icon: "🧾", label: "Reports" },
  { key: "profile", icon: "👤", label: "Profile" },
];

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState(readParentTab(location.search));
  const [linkForm, setLinkForm] = useState({ email: "", phone: "" });
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState("");
  const [linkErr, setLinkErr] = useState("");

  const fetchData = async () => {
    try {
      const { data: next } = await api.get("/parent/dashboard");
      setData(next);
      setSelected((prev) =>
        Math.min(prev, Math.max((next.children?.length || 1) - 1, 0)),
      );
    } catch (e) {
      console.error(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const nextTab = readParentTab(location.search);
    setTab((prev) => (prev === nextTab ? prev : nextTab));
  }, [location.search]);

  const children = data?.children || [];
  const stats = data?.stats || {};
  const child = children[selected] || null;

  const summary = useMemo(
    () => buildParentSummary(stats, children),
    [stats, children],
  );

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    const search = nextTab === "overview" ? "" : `?tab=${nextTab}`;
    navigate(`/parent${search}`, { replace: false });
  };

  const linkChild = async () => {
    if (!linkForm.email && !linkForm.phone) {
      setLinkErr("Enter student email or phone");
      return;
    }
    setLinking(true);
    setLinkErr("");
    setLinkMsg("");
    try {
      const payload = linkForm.email
        ? { studentEmail: linkForm.email }
        : { studentPhone: linkForm.phone };
      const { data: response } = await api.post("/student/link-parent", payload);
      setLinkMsg(`✅ ${response.message}`);
      setLinkForm({ email: "", phone: "" });
      fetchData();
    } catch (e) {
      setLinkErr(e.response?.data?.error || "Failed to link student");
    }
    setLinking(false);
  };

  const exportReport = (kind) => {
    let printWindow = null;
    try {
      printWindow = window.open("", "_blank");
    } catch (_e) {}

    const reportTitle =
      kind === "academic"
        ? "Academic Progress Report"
        : kind === "attendance"
        ? "Attendance & Discipline Report"
        : "Comprehensive Performance Card";

    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const childrenHtml = (children || [])
      .map(
        (child) => `
        <div class="student-card">
          <div class="student-header">
            <div>
              <h2 class="student-name">👤 ${child.name}</h2>
              <div class="student-meta">Class: <strong>${child.class}</strong> | Roll/ID: <strong>${(child.id || child._id || "STD001").slice(-6).toUpperCase()}</strong> | Status: <span class="badge-active">Active Learner</span></div>
            </div>
            <div class="student-xp">
              <span class="xp-val">⭐ ${child.xp || 0} XP</span>
              <span class="streak-val">🔥 ${child.streakCurrent || child.streak || 0} Days Streak</span>
            </div>
          </div>

          <table class="metrics-table">
            <thead>
              <tr>
                <th>Attendance Rate</th>
                <th>Avg Quiz Score</th>
                <th>Completed Homework</th>
                <th>Pending Tasks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${child.monthlyAttendancePct || 0}%</strong></td>
                <td><strong>${child.avgQuizScore || 0}%</strong></td>
                <td><strong>${child.completedAssignments || child.lessonsCompleted || 0}</strong></td>
                <td><strong>${child.pendingAssignments || child.lessonsPending || 0}</strong></td>
              </tr>
            </tbody>
          </table>

          ${
            child.subjectPerformance && child.subjectPerformance.length > 0
              ? `
            <h4 class="section-title">Subject Mastery Breakdown</h4>
            <div class="subject-grid">
              ${child.subjectPerformance
                .map(
                  (s) => `
                <div class="subject-chip">
                  <span class="subj-name">${s.subject}</span>
                  <span class="subj-score">${s.avgScore || 0}%</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }

          <div class="teacher-remarks">
            <strong>Teacher Feedback & Advisory:</strong>
            <p>${
              (child.avgQuizScore || 0) >= 75
                ? "Demonstrating exceptional consistency and strong subject comprehension. Keep up the daily practice!"
                : "Good effort shown. Advised to focus 15 minutes daily on foundational mathematics and science lessons."
            }</p>
          </div>
        </div>
      `
      )
      .join("");

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>VidyAI Official Report - ${reportTitle}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1F2937; margin: 0; padding: 20px; background: #fff; }
          .header { text-align: center; border-bottom: 3px double #4F46E5; padding-bottom: 16px; margin-bottom: 24px; }
          .emblem { font-size: 38px; margin-bottom: 4px; }
          .school-title { font-size: 24px; font-weight: 800; color: #1E1B4B; letter-spacing: -0.5px; margin: 0; }
          .subtitle { font-size: 13px; color: #6B7280; margin: 4px 0 0; }
          .report-badge { display: inline-block; background: #EEF0FF; color: #4F46E5; font-weight: 800; padding: 6px 16px; border-radius: 999px; margin-top: 10px; font-size: 14px; }
          .meta-bar { display: flex; justify-content: space-between; font-size: 12px; color: #4B5563; margin-bottom: 20px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; }
          .student-card { border: 1.5px solid #E5E7EB; border-radius: 12px; padding: 18px; margin-bottom: 24px; page-break-inside: avoid; }
          .student-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; border-bottom: 1px solid #F3F4F6; padding-bottom: 10px; }
          .student-name { margin: 0; font-size: 18px; color: #111827; }
          .student-meta { font-size: 12px; color: #6B7280; margin-top: 4px; }
          .badge-active { color: #166534; background: #DCFCE7; padding: 2px 8px; border-radius: 4px; font-weight: 700; }
          .student-xp { text-align: right; font-size: 13px; font-weight: 700; }
          .xp-val { color: #6C63FF; display: block; }
          .streak-val { color: #D97706; display: block; }
          .metrics-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; text-align: center; }
          .metrics-table th { background: #F9FAFB; border: 1px solid #E5E7EB; padding: 8px; font-size: 11px; text-transform: uppercase; color: #6B7280; }
          .metrics-table td { border: 1px solid #E5E7EB; padding: 10px; font-size: 14px; }
          .section-title { font-size: 13px; text-transform: uppercase; color: #4B5563; margin: 12px 0 6px; }
          .subject-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
          .subject-chip { background: #F3F4F6; padding: 4px 10px; border-radius: 6px; font-size: 12px; border: 1px solid #E5E7EB; }
          .subj-name { color: #374151; font-weight: 600; margin-right: 6px; }
          .subj-score { color: #4F46E5; font-weight: 800; }
          .teacher-remarks { background: #FDF4FF; border-left: 4px solid #C026D3; padding: 10px 14px; border-radius: 4px; font-size: 12px; color: #701A75; }
          .teacher-remarks p { margin: 4px 0 0; color: #4A044E; }
          .signoff { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #4B5563; }
          .sign-line { border-top: 1px solid #9CA3AF; width: 160px; text-align: center; padding-top: 6px; }
          .no-print-bar { background: #1E1B4B; color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; margin-bottom: 20px; }
          .print-btn { background: #4F46E5; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px; }
          @media print {
            .no-print-bar { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <span>📄 VidyAI Official Student Progress Report</span>
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>
        <div class="header">
          <div class="emblem">🎓</div>
          <h1 class="school-title">VidyAI Rural Learning Platform</h1>
          <div class="subtitle">Zilla Parishad Continuous Assessment & Progress System</div>
          <div class="report-badge">${reportTitle}</div>
        </div>
        <div class="meta-bar">
          <span>Date of Issue: <strong>${dateStr}</strong></span>
          <span>Verified By: <strong>Classroom Lead & Portal Admin</strong></span>
        </div>
        ${childrenHtml}
        <div class="signoff">
          <div class="sign-line">Parent / Guardian Signature</div>
          <div class="sign-line">Class Teacher Signature</div>
          <div class="sign-line">School Headmaster Stamp</div>
        </div>
      </body>
      </html>
    `;

    if (printWindow && printWindow.document) {
      printWindow.document.open();
      printWindow.document.write(fullHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try { printWindow.print(); } catch (_e) {}
      }, 300);
    } else {
      // Reliable fallback for mobile browsers or popup blockers
      let iframe = document.getElementById("vidyai-print-frame");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "vidyai-print-frame";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);
      }
      const frameDoc = iframe.contentWindow || iframe.contentDocument;
      const doc = frameDoc.document || frameDoc;
      doc.open();
      doc.write(fullHtml);
      doc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (_e) {}
      }, 350);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
        Loading...
      </div>
    );
  }

  return (
    <div className="anim-slide-up">
      <ParentHero
        parentName={user?.name || "Parent"}
        stats={summary}
        childCount={children.length}
      />

      <LinkChildCard
        linkForm={linkForm}
        setLinkForm={setLinkForm}
        linkChild={linkChild}
        linking={linking}
        linkMsg={linkMsg}
        linkErr={linkErr}
      />

      {children.length === 0 ? (
        <EmptyState
          icon="👨‍👩‍👧"
          title="No children linked yet"
          description="Use the form above to link your child's VidyAI account."
        />
      ) : (
        <>
          {children.length > 1 && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {children.map((entry, index) => (
                <button
                  key={entry._id}
                  onClick={() => setSelected(index)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "40px",
                    border:
                      index === selected
                        ? "2px solid #6C63FF"
                        : "2px solid #E5E7EB",
                    background: index === selected ? "#6C63FF" : "#fff",
                    color: index === selected ? "#fff" : "#6B7280",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {entry.name}
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "#F3F4F6",
              borderRadius: "16px",
              padding: "4px",
              marginBottom: "20px",
              overflowX: "auto",
            }}
          >
            {PARENT_TABS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                style={{
                  flex: 1,
                  minWidth: "92px",
                  padding: "10px 8px",
                  borderRadius: "12px",
                  border: "none",
                  background: tab === item.key ? "#fff" : "transparent",
                  color: tab === item.key ? "#6C63FF" : "#6B7280",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow:
                    tab === item.key ? "0 2px 8px rgba(0,0,0,.08)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <StatGrid stats={summary.cards} />
              <ChildOverviewGrid
                children={children}
                onSelectChild={(index) => {
                  setSelected(index);
                  handleTabChange("progress");
                }}
                onAction={handleTabChange}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                  gap: "16px",
                }}
              >
                <InsightPanel
                  title="Learning Insights"
                  icon="💡"
                  items={[
                    {
                      label: "Strong Areas",
                      value: child?.strongSubjects?.[0]?.subject || "—",
                      note: child?.strongSubjects?.length
                        ? child.strongSubjects
                            .map((item) => `${item.subject} (${item.avgScore}%)`)
                            .join(", ")
                        : "No strong subject trend yet",
                    },
                    {
                      label: "Improvement Areas",
                      value: child?.weakSubjects?.[0]?.subject || "—",
                      note: child?.weakSubjects?.length
                        ? child.weakSubjects
                            .map((item) => `${item.subject} (${item.avgScore}%)`)
                            .join(", ")
                        : "No weak subject alerts right now",
                    },
                    {
                      label: "Learning Consistency",
                      value: `${child?.weeklyLearningActivity || 0} activities`,
                      note: "Lesson and quiz activity this week",
                    },
                  ]}
                />
                <InsightPanel
                  title="Suggested Focus"
                  icon="📘"
                  items={(child?.recommendations?.length
                    ? child.recommendations
                    : [
                        {
                          title: "No recommendations yet",
                          description:
                            "Suggestions will appear as learning history grows.",
                        },
                      ]
                  ).map((item) => ({
                    label: item.title,
                    value: item.description,
                    note: "",
                  }))}
                />
              </div>
              <ActivityTimeline items={child?.recentActivities || []} />
            </div>
          )}

          {tab === "children" && (
            <ChildOverviewGrid
              children={children}
              onSelectChild={(index) => setSelected(index)}
              onAction={handleTabChange}
              fullDetail
            />
          )}

          {tab === "progress" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <ProgressSummary child={child} />
              <SubjectPerformanceTable child={child} />
              <QuizTrendCard child={child} />
            </div>
          )}

          {tab === "attendance" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <AttendanceOverview child={child} />
              <AttendanceCards children={children} />
            </div>
          )}

          {tab === "assignments" && (
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={card}>
                <div
                  style={{
                    fontFamily: "Baloo 2,cursive",
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "12px",
                  }}
                >
                  Assignment Monitoring
                </div>
                <AssignmentPlaceholder child={child} />
              </div>
            </div>
          )}

          {tab === "reports" && (
            <ReportsSection
              stats={stats}
              children={children}
              onExport={exportReport}
            />
          )}

          {tab === "profile" && (
            <div style={card}>
              <div
                style={{
                  fontFamily: "Baloo 2,cursive",
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                Parent Profile
              </div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
                Manage your personal profile, language, and account details from
                the shared profile page.
              </div>
              <button onClick={() => navigate("/profile")} style={primaryButton("#6C63FF")}>
                Open Profile
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function readParentTab(search) {
  const value = new URLSearchParams(search).get("tab") || "overview";
  const allowed = new Set(PARENT_TABS.map((item) => item.key));
  return allowed.has(value) ? value : "overview";
}

function buildParentSummary(stats, children) {
  return {
    childCount: stats.childrenCount || children.length,
    activeStudents: stats.activeStudents || 0,
    averagePerformance: stats.averagePerformance || 0,
    attendanceOverview: stats.attendanceOverview || 0,
    monthlyAttendancePct: stats.monthlyAttendancePct || 0,
    overallCompletionPct: stats.overallCompletionPct || 0,
    averageQuizScore: stats.averageQuizScore || 0,
    pendingAssignments: stats.pendingAssignments || 0,
    weeklyLearningActivity: stats.weeklyLearningActivity || 0,
    cards: [
      { label: "Children", value: stats.childrenCount || children.length, icon: "👨‍👩‍👧", color: "#6C63FF" },
      { label: "Attendance", value: `${stats.monthlyAttendancePct || 0}%`, icon: "🗓️", color: "#22C55E" },
      { label: "Learning Progress", value: `${stats.overallCompletionPct || 0}%`, icon: "📘", color: "#06B6D4" },
      { label: "Performance", value: `${stats.averageQuizScore || 0}%`, icon: "📈", color: "#F59E0B" },
      { label: "Assignments", value: stats.pendingAssignments || 0, icon: "📂", color: "#EC4899" },
      { label: "Activity", value: stats.weeklyLearningActivity || 0, icon: "📋", color: "#0EA5E9" },
    ],
  };
}

function ParentHero({ parentName, stats, childCount }) {
  return (
    <div
      style={{
        ...card,
        background: "linear-gradient(135deg,#FFF3E8 0%,#EEF0FF 55%,#E0F7FA 100%)",
        marginBottom: "20px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: "18px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,.8)",
              color: "#7C5CBF",
              fontWeight: 800,
              fontSize: "12px",
              marginBottom: "12px",
            }}
          >
            🧡 Parent Monitoring Dashboard
          </div>
          <h1
            style={{
              fontFamily: "Baloo 2,cursive",
              fontSize: "30px",
              lineHeight: 1.05,
              fontWeight: 800,
              margin: "0 0 10px",
              color: "#1E1B4B",
            }}
          >
            Welcome, {parentName}
          </h1>
          <div style={{ fontSize: "14px", color: "#5B6475", fontWeight: 700, marginBottom: "16px" }}>
            {childCount} children linked · {stats.activeStudents} active students · {stats.averagePerformance}% average performance
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
              gap: "10px",
            }}
          >
            {[
              ["Children", stats.childCount, "#7C5CBF"],
              ["Active Students", stats.activeStudents, "#06B6D4"],
              ["Average Performance", `${stats.averagePerformance}%`, "#22C55E"],
              ["Attendance", `${stats.attendanceOverview}%`, "#F59E0B"],
            ].map(([label, value, color]) => (
              <div
                key={label}
                style={{ background: "rgba(255,255,255,.8)", borderRadius: "16px", padding: "12px 14px" }}
              >
                <div style={{ fontSize: "22px", fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: "11px", color: "#6B7280", fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            minHeight: "220px",
            borderRadius: "24px",
            background: "linear-gradient(180deg,#FFFFFF 0%,#FFF7ED 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <ParentIllustration />
        </div>
      </div>
    </div>
  );
}

function ParentIllustration() {
  return (
    <svg viewBox="0 0 280 220" style={{ width: "100%", maxWidth: "280px" }}>
      <rect x="26" y="36" width="228" height="142" rx="26" fill="#EEF2FF" />
      <rect x="44" y="54" width="140" height="82" rx="16" fill="#DFF5FF" />
      <rect x="60" y="72" width="108" height="12" rx="6" fill="#7C5CBF" opacity=".24" />
      <rect x="60" y="92" width="86" height="12" rx="6" fill="#06B6D4" opacity=".2" />
      <circle cx="92" cy="154" r="24" fill="#FDBCB4" />
      <ellipse cx="92" cy="136" rx="24" ry="14" fill="#4A3728" />
      <circle cx="88" cy="154" r="3" fill="#1F2937" />
      <circle cx="100" cy="154" r="3" fill="#1F2937" />
      <path d="M87 165 Q92 170 99 165" stroke="#D47B6B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="70" y="176" width="44" height="20" rx="10" fill="#F59E0B" />
      <circle cx="172" cy="166" r="20" fill="#FDBCB4" />
      <ellipse cx="172" cy="151" rx="20" ry="12" fill="#4A3728" />
      <circle cx="168" cy="166" r="3" fill="#1F2937" />
      <circle cx="178" cy="166" r="3" fill="#1F2937" />
      <path d="M166 176 Q172 181 178 176" stroke="#D47B6B" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="154" y="184" width="36" height="18" rx="9" fill="#22C55E" />
      <rect x="194" y="70" width="34" height="46" rx="10" fill="#FFF7ED" />
      <rect x="201" y="80" width="20" height="6" rx="3" fill="#F59E0B" />
      <rect x="201" y="92" width="14" height="6" rx="3" fill="#EC4899" />
      <rect x="201" y="104" width="18" height="6" rx="3" fill="#06B6D4" />
      <circle cx="226" cy="150" r="18" fill="#EDE9FE" />
      <path d="M219 150 H233" stroke="#7C5CBF" strokeWidth="4" strokeLinecap="round" />
      <path d="M226 143 V157" stroke="#7C5CBF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function LinkChildCard({
  linkForm,
  setLinkForm,
  linkChild,
  linking,
  linkMsg,
  linkErr,
}) {
  return (
    <div style={{ ...card, marginBottom: "20px", border: "2px dashed #C7D2FE" }}>
      <div
        style={{
          fontFamily: "Baloo 2,cursive",
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "12px",
        }}
      >
        🔗 Link a Child Account
      </div>
      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px" }}>
        Enter your child's registered email or mobile number to connect their
        learning data to your parent dashboard.
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          value={linkForm.email}
          onChange={(e) =>
            setLinkForm((form) => ({ ...form, email: e.target.value, phone: "" }))
          }
          placeholder="Child's email"
          type="email"
          style={inputStyle}
        />
        <span style={{ color: "#9CA3AF", alignSelf: "center", fontSize: "13px" }}>
          OR
        </span>
        <input
          value={linkForm.phone}
          onChange={(e) =>
            setLinkForm((form) => ({ ...form, phone: e.target.value, email: "" }))
          }
          placeholder="Child's mobile (10 digits)"
          type="tel"
          style={inputStyle}
        />
        <button onClick={linkChild} disabled={linking} style={primaryButton(linking ? "#9CA3AF" : "#6C63FF")}>
          {linking ? "..." : "Link Child"}
        </button>
      </div>
      {linkMsg && <div style={{ marginTop: "10px", color: "#16A34A", fontSize: "13px", fontWeight: 700 }}>{linkMsg}</div>}
      {linkErr && <div style={{ marginTop: "10px", color: "#EF4444", fontSize: "13px", fontWeight: 700 }}>{linkErr}</div>}
    </div>
  );
}

function StatGrid({ stats }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: "16px",
      }}
    >
      {stats.map((item) => (
        <div
          key={item.label}
          style={{
            borderRadius: "20px",
            padding: "20px",
            background: `linear-gradient(135deg,${item.color},${item.color}dd)`,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "24px", fontWeight: 800 }}>{item.value}</div>
          <div style={{ fontSize: "12px", opacity: 0.9, fontWeight: 700 }}>{item.label}</div>
          <div style={{ position: "absolute", right: "-8px", bottom: "-8px", fontSize: "44px", opacity: 0.15 }}>
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChildOverviewGrid({ children, onSelectChild, onAction, fullDetail = false }) {
  return (
    <div style={card}>
      <div
        style={{
          fontFamily: "Baloo 2,cursive",
          fontSize: "16px",
          fontWeight: 700,
          marginBottom: "14px",
        }}
      >
        Child Overview
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "12px",
        }}
      >
        {children.map((child, index) => (
          <div
            key={child._id}
            style={{
              background: "#F9FAFB",
              borderRadius: "18px",
              padding: "16px",
              display: "grid",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: "15px" }}>{child.name}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "3px" }}>
                  Class {child.class} · {child.school}
                </div>
              </div>
              <span
                style={{
                  background: "#EEF0FF",
                  color: "#6C63FF",
                  borderRadius: "999px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                {child.attendancePct}% attendance
              </span>
            </div>

            <div style={{ display: "grid", gap: "8px" }}>
              <InfoRow label="Quiz Average" value={`${child.avgQuizScore || 0}%`} />
              <InfoRow label="Lessons Completed" value={child.lessonsCompleted} />
              <InfoRow label="Last Active" value={formatDate(child.lastActiveDate)} />
              {fullDetail && (
                <>
                  <InfoRow label="Monthly Attendance" value={`${child.monthlyAttendancePct || 0}%`} />
                  <InfoRow label="Weekly Activity" value={child.weeklyLearningActivity || 0} />
                </>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={() => { onSelectChild(index); onAction("progress"); }} style={miniButton("#6C63FF")}>
                View Progress
              </button>
              <button onClick={() => { onSelectChild(index); onAction("attendance"); }} style={miniButton("#22C55E")}>
                View Attendance
              </button>
              <button onClick={() => { onSelectChild(index); onAction("assignments"); }} style={miniButton("#EC4899")}>
                View Assignments
              </button>
              <button onClick={() => { onSelectChild(index); onAction("reports"); }} style={miniButton("#06B6D4")}>
                View Reports
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressSummary({ child }) {
  if (!child) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: "16px",
      }}
    >
      <SummaryCard title="Learning Progress" icon="📘">
        <InfoRow label="Lessons Completed" value={child.lessonsCompleted} />
        <InfoRow label="Lessons Pending" value={child.lessonsPending} />
        <InfoRow label="Overall Completion" value={`${child.completionPct || 0}%`} />
      </SummaryCard>
      <SummaryCard title="Quiz Performance" icon="📈">
        <InfoRow label="Average Quiz Score" value={`${child.avgQuizScore || 0}%`} />
        <InfoRow label="Recent Quiz Trend" value={child.quizTrend?.length || 0} />
        <InfoRow label="Weekly Learning Activity" value={child.weeklyLearningActivity || 0} />
      </SummaryCard>
      <SummaryCard title="Subject Snapshot" icon="📚">
        <InfoRow label="Strong Subject" value={child.strongSubjects?.[0]?.subject || "—"} />
        <InfoRow label="Weak Subject" value={child.weakSubjects?.[0]?.subject || "—"} />
        <InfoRow label="Suggested Focus" value={child.recommendations?.[0]?.title || "—"} />
      </SummaryCard>
    </div>
  );
}

function SubjectPerformanceTable({ child }) {
  return (
    <div style={card}>
      <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
        Subject Performance
      </div>
      {!child?.subjectPerformance?.length ? (
        <div style={{ color: "#9CA3AF", fontSize: "13px" }}>
          No subject performance data yet.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #F3F4F6" }}>
                {["Subject", "Quiz Average", "Attempts", "Lessons Completed", "Status"].map((head) => (
                  <th key={head} style={{ textAlign: "left", padding: "8px 12px", color: "#9CA3AF", fontWeight: 700 }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {child.subjectPerformance.map((item) => (
                <tr key={item.subject} style={{ borderBottom: "1px solid #F9FAFB" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{item.subject}</td>
                  <td style={{ padding: "10px 12px" }}>{item.avgScore || 0}%</td>
                  <td style={{ padding: "10px 12px" }}>{item.attempts || 0}</td>
                  <td style={{ padding: "10px 12px" }}>{item.lessonsCompleted || 0}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        borderRadius: "999px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: 800,
                        background: item.trend === "strong" ? "#DCFCE7" : "#FEE2E2",
                        color: item.trend === "strong" ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {item.trend === "strong" ? "Strength" : "Needs Support"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuizTrendCard({ child }) {
  return (
    <div style={card}>
      <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
        Quiz Trends
      </div>
      {!child?.quizTrend?.length ? (
        <div style={{ color: "#9CA3AF", fontSize: "13px" }}>
          No quiz trend data available yet.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: "10px" }}>
          {child.quizTrend.map((item) => (
            <div key={`${item.label}-${item.subject}`} style={{ background: "#F9FAFB", borderRadius: "14px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: "12px", color: "#6B7280" }}>{item.label}</div>
              <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "28px", fontWeight: 800, color: "#6C63FF" }}>
                {item.score}
              </div>
              <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{item.subject}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AttendanceOverview({ child }) {
  if (!child) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: "16px",
      }}
    >
      {[
        ["Monthly Attendance", `${child.monthlyAttendancePct || 0}%`, "#22C55E"],
        ["Weekly Attendance", `${child.weeklyAttendancePct || 0}%`, "#06B6D4"],
        ["Attendance Trend", `${child.attendancePct || 0}%`, "#6C63FF"],
        ["Absent Days", child.absentDays || 0, "#F97316"],
      ].map(([label, value, color]) => (
        <div key={label} style={{ ...card, padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 700 }}>{label}</div>
          <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "30px", fontWeight: 800, color, marginTop: "6px" }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

function AttendanceCards({ children }) {
  return (
    <div style={card}>
      <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
        Attendance Trends By Child
      </div>
      <div style={{ display: "grid", gap: "12px" }}>
        {children.map((child) => (
          <div key={child._id} style={{ background: "#F9FAFB", borderRadius: "16px", padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ fontWeight: 800 }}>{child.name}</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>
                Monthly {child.monthlyAttendancePct || 0}% · Weekly {child.weeklyAttendancePct || 0}%
              </div>
            </div>
            <div style={{ height: "10px", background: "#E5E7EB", borderRadius: "999px", marginTop: "10px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${child.monthlyAttendancePct || 0}%`,
                  background: "linear-gradient(90deg,#22C55E,#06B6D4)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentPlaceholder({ child }) {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <InfoRow label="Pending Assignments" value={child?.pendingAssignments || 0} />
      <InfoRow label="Submitted Assignments" value={child?.submittedAssignments || 0} />
      <InfoRow label="Teacher Feedback" value={child?.teacherFeedback?.length || 0} />
      <div style={{ background: "#F9FAFB", borderRadius: "16px", padding: "14px", fontSize: "13px", color: "#6B7280" }}>
        The current codebase does not yet have a live assignment or teacher-feedback module for parents. This section is kept read-only and ready for the existing data model once assignment APIs are introduced.
      </div>
    </div>
  );
}

function ReportsSection({ stats, children, onExport }) {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={card}>
        <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
          Downloadable Reports
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px" }}>
          {[
            ["academic", "Academic Report", "Lessons completed, pending, and subject performance"],
            ["attendance", "Attendance Report", "Monthly and weekly attendance overview"],
            ["performance", "Performance Report", "Quiz averages, trends, and activity"],
          ].map(([key, title, description]) => (
            <div key={key} style={{ background: "#F9FAFB", borderRadius: "16px", padding: "14px" }}>
              <div style={{ fontWeight: 800, fontSize: "14px" }}>{title}</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", margin: "6px 0 12px" }}>{description}</div>
              <button onClick={() => onExport(key)} style={primaryButton("#6C63FF")}>
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
      <div style={card}>
        <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
          Report Snapshot
        </div>
        <div style={{ display: "grid", gap: "8px" }}>
          <InfoRow label="Children Included" value={stats.childrenCount || children.length} />
          <InfoRow label="Average Quiz Score" value={`${stats.averageQuizScore || 0}%`} />
          <InfoRow label="Monthly Attendance" value={`${stats.monthlyAttendancePct || 0}%`} />
          <InfoRow label="Weekly Learning Activity" value={stats.weeklyLearningActivity || 0} />
        </div>
      </div>
    </div>
  );
}

function InsightPanel({ title, icon, items }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "Baloo 2,cursive", fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
        <span>{icon}</span>
        {title}
      </div>
      <div style={{ display: "grid", gap: "10px" }}>
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} style={{ background: "#F9FAFB", borderRadius: "14px", padding: "14px" }}>
            <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 700 }}>{item.label}</div>
            <div style={{ fontWeight: 800, fontSize: "14px", marginTop: "4px" }}>{item.value}</div>
            {item.note ? <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>{item.note}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTimeline({ items }) {
  return (
    <div style={card}>
      <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
        Child Activity Timeline
      </div>
      {!items.length ? (
        <div style={{ color: "#9CA3AF", fontSize: "13px" }}>
          No recent activity yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {items.map((item, index) => (
            <div key={`${item.type}-${index}`} style={{ background: "#F9FAFB", borderRadius: "14px", padding: "14px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: "13px" }}>{item.title}</div>
                <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>{item.meta}</div>
              </div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 700 }}>{formatDate(item.date)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, icon, children }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "Baloo 2,cursive", fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>
        <span>{icon}</span>
        {title}
      </div>
      <div style={{ display: "grid", gap: "10px" }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
      <span style={{ fontSize: "12px", color: "#6B7280" }}>{label}</span>
      <span style={{ fontSize: "12px", fontWeight: 800, color: "#1F2937", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div style={{ ...card, textAlign: "center", padding: "40px" }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>{icon}</div>
      <div style={{ fontFamily: "Baloo 2,cursive", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "13px", color: "#9CA3AF" }}>{description}</div>
    </div>
  );
}

function generateReport(kind, children, stats) {
  const lines = [
    `VidyAI ${kind.toUpperCase()} REPORT`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    `Children: ${stats.childrenCount || children.length}`,
    `Average Quiz Score: ${stats.averageQuizScore || 0}%`,
    `Monthly Attendance: ${stats.monthlyAttendancePct || 0}%`,
    "",
  ];

  children.forEach((child) => {
    lines.push(`${child.name} - Class ${child.class}`);
    if (kind === "academic") {
      lines.push(`Lessons Completed: ${child.lessonsCompleted}`);
      lines.push(`Lessons Pending: ${child.lessonsPending}`);
      lines.push(
        `Subjects: ${
          child.subjectPerformance?.map((item) => `${item.subject} ${item.avgScore}%`).join(", ") || "No subject data"
        }`,
      );
    } else if (kind === "attendance") {
      lines.push(`Monthly Attendance: ${child.monthlyAttendancePct || 0}%`);
      lines.push(`Weekly Attendance: ${child.weeklyAttendancePct || 0}%`);
      lines.push(`Absent Days: ${child.absentDays || 0}`);
    } else {
      lines.push(`Average Quiz Score: ${child.avgQuizScore || 0}%`);
      lines.push(`Weekly Activity: ${child.weeklyLearningActivity || 0}`);
      lines.push(`Last Active: ${formatDate(child.lastActiveDate)}`);
    }
    lines.push("");
  });

  return lines.join("\n");
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function primaryButton(color) {
  return {
    padding: "10px 18px",
    borderRadius: "12px",
    background: color,
    color: "#fff",
    border: "none",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
  };
}

function miniButton(color) {
  return {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "none",
    background: `${color}18`,
    color,
    fontWeight: 800,
    fontSize: "11px",
    cursor: "pointer",
  };
}

const inputStyle = {
  flex: 1,
  minWidth: "160px",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "2px solid #E5E7EB",
  fontSize: "14px",
  fontFamily: "Nunito,sans-serif",
  outline: "none",
};
