import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { signUp, logIn } from '../utils/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import './AuthPage.css';

// Google SVG icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Mobile / phone SVG icon
const MobileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);

// MOVA hand SVG logo
const MovaHandLogo = () => (
  <img src="/mova-icon.png" alt="MOVA" style={{ width: 40, height: 40, objectFit: 'contain' }} />
);

export default function AuthPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (!form.name.trim()) { setError('Please enter your full name.'); setLoading(false); return; }
      if (!form.email.trim()) { setError('Please enter your email address.'); setLoading(false); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); setLoading(false); return; }

      const result = signUp({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      if (result.error) { setError(result.error); setLoading(false); return; }

      setSuccess('Account created! Redirecting to your dashboard…');
      refresh();
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      if (!form.email.trim() || !form.password) { setError('Please enter your email and password.'); setLoading(false); return; }

      const result = logIn({ email: form.email.trim(), password: form.password });
      if (result.error) { setError(result.error); setLoading(false); return; }

      setSuccess('Welcome back! Redirecting…');
      refresh();
      setTimeout(() => navigate('/dashboard'), 800);
    }
  };

  const handleSocialMock = (provider) => {
    setError('');
    // Simulate a social auth success (mock)
    const mockResult = signUp({
      name: provider === 'google' ? 'Google User' : 'Mobile User',
      email: `${provider}_${Date.now()}@mock.mova`,
      password: 'mock_social_' + Date.now(),
    });
    if (mockResult.session || mockResult.error === 'An account with this email already exists.') {
      refresh();
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-root">
      {/* Top Bar */}
      <header className="auth-topbar">
        <Link to="/" className="auth-brand">
          <MovaHandLogo />
          <span className="auth-brand-name">MOVA</span>
        </Link>
        <nav className="auth-topbar-right">
          <span className="auth-topbar-text">Already have an account?</span>
          <button
            className="auth-topbar-login"
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          >
            Log in
          </button>
          <Link to="/" className="auth-topbar-public">← Public Site</Link>
        </nav>
      </header>

      {/* Main Split */}
      <main className="auth-main">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-left-badge">AI SIGN LANGUAGE BRIDGE</div>
          <h1 className="auth-left-title">Join MOVA</h1>
          <p className="auth-left-sub">Be part of a more inclusive world.</p>
          <p className="auth-left-desc">
            Create your account to start translating sign language, connect with people, and make communication easier for everyone.
          </p>
          <div className="auth-left-hand-wrap">
            <img src="/mova-icon.png" alt="MOVA hand icon" className="auth-left-hand" />
          </div>
          <div className="auth-left-footer">
            <div className="auth-left-footer-title">Communication without barriers.</div>
            <div className="auth-left-footer-sub">Recognizing Indian Sign Language & regional gestures</div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="auth-right">
          <div className="auth-card">
            {/* Card Header */}
            <div className="auth-card-head">
              <div>
                <h2 className="auth-card-title">
                  {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="auth-card-sub">
                  {mode === 'signup'
                    ? 'Quick access to the sign language translation engine'
                    : 'Sign in to your MOVA account'}
                </p>
              </div>
              <div className="auth-mode-toggle">
                <button
                  className={`auth-mode-btn ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                >Sign Up</button>
                <button
                  className={`auth-mode-btn ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                >Log In</button>
              </div>
            </div>

            {/* Success Banner */}
            {success && (
              <div className="auth-banner auth-banner--success">
                <span className="auth-banner-icon">✓</span>
                {success}
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="auth-banner auth-banner--error">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {mode === 'signup' && (
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-name">Full Name</label>
                  <input
                    id="auth-name"
                    className="auth-input"
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={update('name')}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-email">Email Address</label>
                <input
                  id="auth-email"
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update('email')}
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-password">Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="auth-password"
                    className="auth-input"
                    type={showPw ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Create a strong password' : 'Your password'}
                    value={form.password}
                    onChange={update('password')}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-confirm">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <input
                      id="auth-confirm"
                      className="auth-input"
                      type={showConfirmPw ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={update('confirmPassword')}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      onClick={() => setShowConfirmPw(v => !v)}
                      aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading || !!success}
              >
                {loading ? 'Please wait…' : mode === 'signup' ? 'Sign Up' : 'Log In'}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider"><span>OR</span></div>

            {/* Social Buttons */}
            <div className="auth-socials">
              <button className="auth-social-btn" onClick={() => handleSocialMock('google')}>
                <GoogleIcon /> Continue with Google
              </button>
              <button className="auth-social-btn" onClick={() => handleSocialMock('mobile')}>
                <MobileIcon /> Continue with Mobile
              </button>
            </div>

            {/* Terms */}
            {mode === 'signup' && (
              <p className="auth-terms">
                By creating an account, you agree to our{' '}
                <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
              </p>
            )}

            <p className="auth-switch">
              {mode === 'signup'
                ? <>Already have an account? <button className="auth-link-btn" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Log in</button></>
                : <>Don't have an account? <button className="auth-link-btn" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>Sign up</button></>
              }
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="auth-footer">
        <span>© 2026 MOVA · Empowering deaf and hard-of-hearing communities</span>
        <div className="auth-footer-links">
          <a href="#support">Support</a>
          <a href="#dataset">ISL Dataset</a>
          <a href="#accessibility">Accessibility Statement</a>
        </div>
      </footer>
    </div>
  );
}
