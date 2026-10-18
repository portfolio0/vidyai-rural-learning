import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devOtpNotice, setDevOtpNotice] = useState('');
  const nav = useNavigate();

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) return setError('Please enter your email address');

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });
      if (data?.devOtp) {
        setOtp(data.devOtp);
        setDevOtpNotice(data.notice || 'Render free tier blocks SMTP port 465. Recovery code auto-filled!');
        setSuccessMsg('Recovery code generated and auto-filled below!');
      } else {
        setDevOtpNotice('');
        setSuccessMsg(data.message || 'Recovery code sent! Please check your email inbox.');
      }
      setStep(2);
    } catch (err) {
      const msg =
        err.response?.data?.messages?.join(', ') ||
        err.response?.data?.error ||
        'Unable to send recovery code. Please check your email and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!otp.trim()) return setError('Please enter the 6-digit recovery code');
    if (!newPassword) return setError('Please enter a new password');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setSuccessMsg(data.message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => {
        nav(`/login?email=${encodeURIComponent(email.trim())}&verified=true`);
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.messages?.join(', ') ||
        err.response?.data?.error ||
        'Failed to reset password. Please verify your OTP code and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6C63FF, #EC4899)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '28px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔐</div>
          <h1
            style={{
              fontFamily: 'Baloo 2, cursive',
              fontSize: '28px',
              fontWeight: 800,
              color: '#6C63FF',
              margin: 0,
            }}
          >
            {step === 1 ? 'Reset Password' : 'Enter Recovery Code'}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
            {step === 1
              ? 'Enter your registered email to receive a 6-digit verification code'
              : `A 6-digit code was sent to ${email}`}
          </p>
        </div>

        {successMsg && (
          <div
            style={{
              background: '#DCFCE7',
              border: '1px solid #86EFAC',
              color: '#15803D',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div style={{ marginBottom: '22px' }}>
              <label
                htmlFor="reset-email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Registered Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@school.edu"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  fontSize: '15px',
                  fontFamily: 'Nunito, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6C63FF')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '40px',
                border: 'none',
                background: loading ? '#9CA3AF' : '#6C63FF',
                color: '#fff',
                fontWeight: 800,
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px rgba(108, 99, 255, 0.35)',
                transition: 'background 0.2s, transform 0.1s',
              }}
            >
              {loading ? 'Sending Code...' : 'Send Recovery Code ✉️'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            {devOtpNotice && (
              <div
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#92400E',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                  💡 Immediate Recovery (Render Free Tier)
                </div>
                <div>
                  Cloud SMTP is firewalled on Render. Your code is:{' '}
                  <strong style={{ fontSize: '16px', letterSpacing: '2px', color: '#B45309' }}>{otp}</strong>
                  <br />
                  (Pre-filled below — enter new password to reset)
                </div>
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="reset-otp"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                6-Digit Recovery Code
              </label>
              <input
                id="reset-otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  fontSize: '20px',
                  fontWeight: 800,
                  letterSpacing: '4px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6C63FF')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="reset-new-password"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 46px 12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #E5E7EB',
                    fontSize: '15px',
                    fontFamily: 'Nunito, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6C63FF')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '16px',
                    color: '#6B7280',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label
                htmlFor="reset-confirm-password"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Confirm New Password
              </label>
              <input
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  fontSize: '15px',
                  fontFamily: 'Nunito, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6C63FF')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '40px',
                border: 'none',
                background: loading ? '#9CA3AF' : '#10B981',
                color: '#fff',
                fontWeight: 800,
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
                transition: 'background 0.2s, transform 0.1s',
              }}
            >
              {loading ? 'Updating Password...' : 'Save New Password 🔒'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
                setSuccessMsg('');
              }}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Resend code or use different email
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '22px' }}>
          <Link
            to="/login"
            style={{
              color: '#6C63FF',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
