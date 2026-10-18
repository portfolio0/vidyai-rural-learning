import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/stores';
import api from '../../services/api';

export default function Login() {
  const [searchParams]          = useSearchParams();
  const [email, setEmail]       = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(searchParams.get('verified') === 'true');
  const { login }               = useAuthStore();
  const nav                     = useNavigate();

  useEffect(() => {
    if (searchParams.get('email')) {
      setEmail(searchParams.get('email'));
    }
    if (searchParams.get('verified') === 'true') {
      setVerifiedSuccess(true);
    }
  }, [searchParams]);

  const getHomePath = (u) => {
    if (u?.role === 'teacher') return '/teacher';
    if (u?.role === 'parent') return '/parent';
    if (u?.role === 'admin') return '/admin';
    return '/';
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) return setError('Please enter your email address');
    if (!password) return setError('Please enter your password');

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });
      login(data.user, data.token);
      nav(getHomePath(data.user));
    } catch (err) {
      const msg =
        err.response?.data?.messages?.join(', ') ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
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
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎓</div>
          <h1
            style={{
              fontFamily: 'Baloo 2, cursive',
              fontSize: '28px',
              fontWeight: 800,
              color: '#6C63FF',
              margin: 0,
            }}
          >
            VidyAI
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
            AI-powered rural learning
          </p>
        </div>

        {verifiedSuccess && (
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
            <span>🎉</span>
            <span>Email verified successfully! Please enter your password to log in.</span>
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

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. onkar@gmail.com"
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

          <div style={{ marginBottom: '22px' }}>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '12px',
                  color: '#6C63FF',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Link>
            </div>
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
            {loading ? 'Logging in...' : 'Login with Email 🚀'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '22px',
            fontSize: '13px',
            color: '#6B7280',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: '#6C63FF', fontWeight: 700, textDecoration: 'none' }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
