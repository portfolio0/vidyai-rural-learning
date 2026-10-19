import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";

export default function Register() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [step, setStep] = useState("form"); // 'form' | 'verify'
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
    class: 5,
    language: "en",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [devOtpNotice, setDevOtpNotice] = useState("");
  const [debugDetails, setDebugDetails] = useState(null);

  // Teacher Invitation state
  const [inviteValidating, setInviteValidating] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [inviteError, setInviteError] = useState("");
  const nav = useNavigate();

  // Countdown timer for Resend OTP button
  useEffect(() => {
    let timer;
    if (step === "verify" && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Validate teacher invitation token on mount if provided in URL
  useEffect(() => {
    if (!inviteToken) return;

    let isMounted = true;
    setInviteValidating(true);
    setInviteError("");

    api
      .get(`/auth/verify-teacher-invite?token=${encodeURIComponent(inviteToken.trim())}`)
      .then((res) => {
        if (!isMounted) return;
        setInviteData(res.data);
        setForm((prev) => ({
          ...prev,
          email: res.data.email || prev.email,
          name: res.data.name || prev.name,
          role: "teacher",
        }));
        setInviteValidating(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg =
          err.response?.data?.error ||
          "This teacher invitation link is invalid or has expired. Please contact your administrator.";
        setInviteError(msg);
        setInviteValidating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [inviteToken]);


  const set = (k) => (e) => {
    setError("");
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  /**
   * Translates technical database or system errors into polite, human-readable instructions
   */
  const formatFriendlyError = (raw) => {
    if (!raw) return "An unexpected error occurred. Please try again.";
    const text = typeof raw === "string" ? raw : JSON.stringify(raw);

    if (text.includes("E11000") || text.includes("duplicate key")) {
      if (text.includes("phone")) {
        return "This mobile number is already in use. Please try a different number or log in.";
      }
      if (text.includes("email")) {
        return "This email address is already registered. Please log in or use a different email.";
      }
      return "An account with these details already exists. Please use different details or log in.";
    }

    if (text.toLowerCase().includes("user already exists")) {
      return "This email address is already registered. Please log in or use a different email.";
    }

    return text;
  };

  /**
   * Handle Form Submit -> sends OTP to email via Resend service
   */
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.name?.trim()) {
      return setError("Please enter your full name.");
    }
    if (!form.email?.trim()) {
      return setError("Please enter your email address.");
    }
    if (!form.password || form.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    const cleanPhone = form.phone?.trim();
    if (cleanPhone && cleanPhone.length !== 10) {
      return setError("Please enter a valid 10-digit mobile number, or leave it blank.");
    }

    if (form.role === "teacher" && !inviteToken) {
      return setError("Teacher registration requires an official invitation link sent by a school administrator.");
    }

    if (inviteError) {
      return setError("Cannot register: " + inviteError);
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");
    setDebugDetails(null);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        language: form.language,
        ...(cleanPhone && { phone: cleanPhone }),
        ...(form.role === "student" && { class: Number(form.class) }),
        ...(form.role === "teacher" && inviteToken && { inviteToken: inviteToken.trim() }),
      };


      console.log("[REGISTER ATTEMPT] Sending registration payload:", { ...payload, password: "••••••" });
      const res = await api.post("/auth/register", payload);
      console.log("[REGISTER SUCCESS] Server responded:", res.data);

      if (res.data?.devOtp) {
        setOtp(res.data.devOtp);
        setDevOtpNotice(
          res.data.notice ||
            "Render free tier blocks SMTP port 465. Code auto-filled for instant verification!"
        );
        setSuccessMsg("Account registered! Your verification code is ready below.");
      } else {
        setOtp("");
        setDevOtpNotice("");
        setSuccessMsg("Verification code sent to your email!");
      }

      setStep("verify");
      setCountdown(30);
    } catch (err) {
      console.error("[REGISTER ERROR DETECTED]", err);
      const serverMsg =
        err.response?.data?.error ||
        err.response?.data?.messages?.join(", ") ||
        (err.code === "ECONNABORTED" ? "Server request timed out. Please try again." : null) ||
        err.message ||
        "Registration could not be completed.";
      setError(formatFriendlyError(serverMsg));

      setDebugDetails({
        status: err.response?.status || "NO_RESPONSE",
        code: err.code || "ERR_NETWORK",
        message: err.message,
        serverData: err.response?.data || null,
        url: err.config?.url || "/auth/register",
        time: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Email OTP Verification -> confirms code & redirects directly to login section
   */
  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp.trim() || otp.trim().length < 6) {
      return setError("Please enter the complete 6-digit verification code.");
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-email", {
        email: form.email.trim(),
        otp: otp.trim(),
      });

      // Verification successful! Navigate directly to login with verified flag
      nav(
        `/login?verified=true&email=${encodeURIComponent(form.email.trim())}`,
        { replace: true }
      );
    } catch (err) {
      const serverMsg =
        err.response?.data?.messages?.join(", ") ||
        err.response?.data?.error ||
        "Verification failed. Please check the code and try again.";
      setError(formatFriendlyError(serverMsg));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP via email Resend service
   */
  const handleResendOTP = async () => {
    if (countdown > 0 || resending) return;
    setError("");
    setSuccessMsg("");
    setResending(true);

    try {
      const res = await api.post("/auth/resend-otp", {
        email: form.email.trim(),
      });
      if (res.data?.devOtp) {
        setOtp(res.data.devOtp);
        setDevOtpNotice(
          res.data.notice ||
            "Render free tier blocks SMTP port 465. New code auto-filled!"
        );
        setSuccessMsg("New verification code generated and ready below!");
      } else {
        setSuccessMsg("A fresh verification code has been sent to your email!");
      }
      setCountdown(30);
    } catch (err) {
      const serverMsg =
        err.response?.data?.error || "Could not resend verification code.";
      setError(formatFriendlyError(serverMsg));
    } finally {
      setResending(false);
    }
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "6px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "2px solid #E5E7EB",
    fontSize: "15px",
    fontFamily: "Nunito, sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #22C55E, #06B6D4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "28px",
          padding: "36px 32px",
          width: "100%",
          maxWidth: "430px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div style={{ fontSize: "44px", marginBottom: "4px" }}>
            {step === "verify" ? "📬" : "🌱"}
          </div>
          <h1
            style={{
              fontFamily: "Baloo 2, cursive",
              fontSize: "26px",
              fontWeight: 800,
              color: "#111827",
              margin: 0,
            }}
          >
            {step === "verify" ? "Verify Your Email" : "Create Account"}
          </h1>
          <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "4px" }}>
            {step === "verify"
              ? `We sent a 6-digit code to ${form.email}`
              : "Join VidyAI rural learning platform"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              color: "#DC2626",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            {debugDetails && (
              <details style={{ marginTop: "8px", fontSize: "11px", fontWeight: 400, color: "#991B1B", cursor: "pointer" }}>
                <summary style={{ fontWeight: 700 }}>🔍 Technical Debug Info (Click to view)</summary>
                <pre
                  style={{
                    margin: "6px 0 0",
                    padding: "8px",
                    background: "rgba(255,255,255,0.75)",
                    borderRadius: "8px",
                    overflowX: "auto",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#7F1D1D",
                    lineHeight: 1.4,
                  }}
                >
                  {JSON.stringify(debugDetails, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              background: "#DCFCE7",
              border: "1px solid #86EFAC",
              color: "#15803D",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Teacher Invitation Notice Banner */}
        {inviteValidating && (
          <div
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              color: "#1D4ED8",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⏳</span>
            <span>Verifying teacher invitation link...</span>
          </div>
        )}

        {inviteError && (
          <div
            style={{
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              color: "#DC2626",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span>
            <span>{inviteError}</span>
          </div>
        )}

        {inviteData?.valid && (
          <div
            style={{
              background: "#ECFDF5",
              border: "1.5px solid #6EE7B7",
              color: "#065F46",
              borderRadius: "14px",
              padding: "14px 16px",
              fontSize: "13px",
              marginBottom: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
              <span>🎓</span>
              <span>Verified Teacher Invitation</span>
            </div>
            <div style={{ color: "#047857", lineHeight: 1.5 }}>
              You have been invited by <strong>{inviteData.invitedBy}</strong> to join VidyAI as a Teacher{inviteData.school ? ` for ${inviteData.school}` : ""}.
            </div>
          </div>
        )}

        {/* STEP 1: REGISTRATION FORM */}
        {step === "form" ? (
          <form onSubmit={handleRegisterSubmit}>
            {/* Field: Full Name */}
            <div style={{ marginBottom: "14px" }}>
              <label htmlFor="reg-name" style={labelStyle}>
                Full Name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                id="reg-name"
                value={form.name}
                onChange={set("name")}
                placeholder="Enter your full name"
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#22C55E")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
              />
            </div>

            {/* Field: Email Address */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label htmlFor="reg-email" style={{ ...labelStyle, marginBottom: 0 }}>
                  Email Address <span style={{ color: "#EF4444" }}>*</span>
                </label>
                {inviteData?.valid && (
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", background: "#DCFCE7", padding: "2px 8px", borderRadius: "10px" }}>
                    🔒 Locked to Invited Email
                  </span>
                )}
              </div>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={inviteData?.valid ? undefined : set("email")}
                readOnly={Boolean(inviteData?.valid)}
                placeholder="e.g. rahul@example.com"
                required
                style={{
                  ...inputStyle,
                  ...(inviteData?.valid && {
                    background: "#F9FAFB",
                    cursor: "not-allowed",
                    color: "#374151",
                    borderColor: "#A7F3D0",
                  }),
                }}
                onFocus={(e) => (e.target.style.borderColor = "#22C55E")}
                onBlur={(e) => (e.target.style.borderColor = inviteData?.valid ? "#A7F3D0" : "#E5E7EB")}
              />
            </div>

            {/* Field: Mobile Number (Optional) */}
            <div style={{ marginBottom: "14px" }}>
              <label htmlFor="reg-phone" style={labelStyle}>
                Mobile Number{" "}
                <span style={{ color: "#6B7280", fontWeight: 400, fontSize: "12px" }}>
                  (Optional — 10 digits)
                </span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                maxLength={10}
                value={form.phone}
                onChange={set("phone")}
                placeholder="e.g. 9876543210"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#22C55E")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
              />
            </div>

            {/* Field: Password with Hide/Show Toggle */}
            <div style={{ marginBottom: "14px" }}>
              <label htmlFor="reg-password" style={labelStyle}>
                Password <span style={{ color: "#EF4444" }}>*</span>{" "}
                <span style={{ color: "#6B7280", fontWeight: 400, fontSize: "12px" }}>
                  (min 6 chars)
                </span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Enter a strong password"
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: "46px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#22C55E")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    fontSize: "16px",
                    color: "#6B7280",
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {/* Field: Role */}
            <div style={{ marginBottom: "14px" }}>
              <label htmlFor="reg-role" style={labelStyle}>
                I am a <span style={{ color: "#EF4444" }}>*</span>
              </label>
              {inviteData?.valid ? (
                <div
                  style={{
                    ...inputStyle,
                    background: "#F0FDF4",
                    border: "1.5px solid #86EFAC",
                    color: "#166534",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>👩‍🏫</span>
                  <span>Teacher (Official Invitation Verified)</span>
                </div>
              ) : (
                <select
                  id="reg-role"
                  value={form.role}
                  onChange={set("role")}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#22C55E")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                >
                  <option value="student">👦 Student</option>
                  <option value="parent">👨‍👩‍👧 Parent</option>
                </select>
              )}
            </div>


            {/* Field: Class (only for students) */}
            {form.role === "student" && (
              <div style={{ marginBottom: "14px" }}>
                <label htmlFor="reg-class" style={labelStyle}>
                  Class / Grade <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <select
                  id="reg-class"
                  value={form.class}
                  onChange={set("class")}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#22C55E")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Field: Preferred Language */}
            <div style={{ marginBottom: "22px" }}>
              <label htmlFor="reg-language" style={labelStyle}>
                Preferred Language <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                id="reg-language"
                value={form.language}
                onChange={set("language")}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#22C55E")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
              >
                <option value="en">🇬🇧 English</option>
                <option value="mr">🇮🇳 मराठी</option>
                <option value="hi">🇮🇳 हिंदी</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "40px",
                border: "none",
                background: loading ? "#9CA3AF" : "#22C55E",
                color: "#fff",
                fontWeight: 800,
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 20px rgba(34, 197, 94, 0.35)",
                transition: "background 0.2s, transform 0.1s",
              }}
            >
              {loading ? "Sending Code..." : "Create Account 🌱"}
            </button>
          </form>
        ) : (
          /* STEP 2: EMAIL OTP VERIFICATION */
          <form onSubmit={handleVerifyOTP}>
            {devOtpNotice ? (
              <div
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FCD34D",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#92400E",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                  💡 Immediate Verification (Render Free Tier)
                </div>
                <div>
                  Cloud SMTP ports are firewalled on Render free tier. Your verification code is:{" "}
                  <strong style={{ fontSize: "16px", letterSpacing: "2px", color: "#B45309" }}>{otp}</strong>
                  <br />
                  (Code auto-filled below — click <strong>Verify & Go to Login</strong> to complete registration!)
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#166534",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                  📩 Code Sent via Email Service
                </div>
                <div>
                  We sent a 6-digit verification code to <strong>{form.email}</strong>. Please check your inbox or spam folder.
                </div>
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="reg-otp" style={labelStyle}>
                6-Digit Verification Code <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                id="reg-otp"
                type="text"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => {
                  setError("");
                  setOtp(e.target.value.replace(/\D/g, ""));
                }}
                placeholder="• • • • • •"
                required
                style={{
                  ...inputStyle,
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: "10px",
                  textAlign: "center",
                  padding: "12px 14px",
                  fontFamily: "monospace",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#22C55E")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "40px",
                border: "none",
                background:
                  loading || otp.length < 6 ? "#9CA3AF" : "#22C55E",
                color: "#fff",
                fontWeight: 800,
                fontSize: "16px",
                cursor: loading || otp.length < 6 ? "not-allowed" : "pointer",
                boxShadow: "0 8px 20px rgba(34, 197, 94, 0.35)",
                transition: "background 0.2s",
                marginBottom: "12px",
              }}
            >
              {loading ? "Verifying..." : "Verify & Go to Login ✅"}
            </button>

            {/* Resend Service Button */}
            <div style={{ textAlign: "center", marginTop: "14px" }}>
              {countdown > 0 ? (
                <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                  Resend code in <strong style={{ color: "#374151" }}>{countdown}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#059669",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: resending ? "wait" : "pointer",
                    textDecoration: "underline",
                    padding: "4px 8px",
                  }}
                >
                  {resending ? "Resending code..." : "Resend Verification Code 🔄"}
                </button>
              )}
            </div>

            {/* Back to Form */}
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError("");
                  setSuccessMsg("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6B7280",
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                ← Edit details or change email
              </button>
            </div>
          </form>
        )}

        {/* Footer Link to Login */}
        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            fontSize: "13px",
            color: "#6B7280",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#059669", fontWeight: 700, textDecoration: "none" }}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
