import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, User, Mail, Globe, Volume2, HardDrive,
  LogOut, Check, Save, ShieldCheck, RefreshCw, Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './SettingsPage.css';

export default function SettingsPage() {
  const { session, refresh, logOut } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(session?.name || '');
  const [email, setEmail] = useState(session?.email || '');
  const [defaultLang, setDefaultLang] = useState('Malayalam');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [voiceTesting, setVoiceTesting] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Update in localStorage
    try {
      const current = JSON.parse(localStorage.getItem('mova_session') || '{}');
      const updated = {
        ...current,
        name: name.trim(),
        email: email.trim(),
        avatar: name.trim().charAt(0).toUpperCase()
      };
      localStorage.setItem('mova_session', JSON.stringify(updated));
      refresh();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update session:', err);
    }
  };

  const handleTestVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setVoiceTesting(true);
      const phrase = defaultLang === 'Malayalam' ? 'നമസ്കാരം, സുപ്രഭാതം, നന്ദി!' : 'Hello, good morning, thank you!';
      const utter = new SpeechSynthesisUtterance(phrase);
      utter.lang = defaultLang === 'Malayalam' ? 'ml-IN' : 'en-US';
      utter.rate = speechRate;
      utter.pitch = speechPitch;
      utter.onend = () => setVoiceTesting(false);
      utter.onerror = () => setVoiceTesting(false);
      window.speechSynthesis.speak(utter);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear all local translation history and temporary caches?')) {
      localStorage.removeItem('mova_users');
      // Keep active session
      alert('Local cache cleared successfully.');
    }
  };

  const handleLogOut = () => {
    logOut();
    navigate('/');
  };

  return (
    <div className="set-root">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="set-header">
        <div>
          <div className="set-badge">
            <Settings size={14} />
            <span>ACCOUNT &amp; APPLICATION PREFERENCES</span>
          </div>
          <h1 className="set-title">Profile &amp; System Settings</h1>
          <p className="set-sub">
            Manage your account credentials, speech synthesis parameters, and local offline system caches.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="set-toast">
          <Check size={16} />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* ── Two-Column Layout ──────────────────────────────── */}
      <div className="set-grid">
        {/* Left: User Profile Form */}
        <div className="set-col">
          <section className="set-card">
            <div className="set-card-header">
              <div className="set-icon-wrap icon-blue">
                <User size={20} />
              </div>
              <div>
                <h3 className="set-card-title">User Account</h3>
                <p className="set-card-desc">Your personal identity and profile details</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="set-form">
              <div className="set-avatar-row">
                <div className="set-avatar-circle">
                  {session?.avatar || name.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <div className="set-avatar-name">{name || 'User'}</div>
                  <div className="set-avatar-role">Community Member • Active</div>
                </div>
              </div>

              <div className="set-input-group">
                <label className="set-label">Display Name</label>
                <div className="set-input-wrap">
                  <User size={16} className="set-input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="set-input"
                    required
                  />
                </div>
              </div>

              <div className="set-input-group">
                <label className="set-label">Email Address</label>
                <div className="set-input-wrap">
                  <Mail size={16} className="set-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="set-input"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="set-btn-primary">
                <Save size={15} />
                <span>Update Profile</span>
              </button>
            </form>
          </section>

          {/* Account Actions */}
          <section className="set-card">
            <div className="set-card-header">
              <div className="set-icon-wrap icon-red">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="set-card-title">Session Management</h3>
                <p className="set-card-desc">Sign out or reset your local device data</p>
              </div>
            </div>

            <div className="set-danger-actions">
              <button className="set-btn-danger" onClick={handleLogOut}>
                <LogOut size={16} />
                <span>Log Out of MOVA</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right: Audio Synthesis & Offline Engine */}
        <div className="set-col">
          {/* Audio Settings */}
          <section className="set-card">
            <div className="set-card-header">
              <div className="set-icon-wrap icon-purple">
                <Volume2 size={20} />
              </div>
              <div>
                <h3 className="set-card-title">Speech Synthesis Audio</h3>
                <p className="set-card-desc">Configure voice pitch and playback speed</p>
              </div>
            </div>

            <div className="set-audio-controls">
              <div className="set-control-row">
                <label className="set-label">Default Translation Speech Language</label>
                <select
                  className="set-select"
                  value={defaultLang}
                  onChange={e => setDefaultLang(e.target.value)}
                >
                  <option value="Malayalam">Malayalam (മലയാളം)</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="set-control-row">
                <div className="set-slider-header">
                  <span className="set-label">Speech Speed</span>
                  <span className="set-slider-val">{speechRate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.1"
                  value={speechRate}
                  onChange={e => setSpeechRate(parseFloat(e.target.value))}
                  className="set-slider"
                />
              </div>

              <div className="set-control-row">
                <div className="set-slider-header">
                  <span className="set-label">Voice Pitch</span>
                  <span className="set-slider-val">{speechPitch.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.1"
                  value={speechPitch}
                  onChange={e => setSpeechPitch(parseFloat(e.target.value))}
                  className="set-slider"
                />
              </div>

              <button
                type="button"
                className="set-btn-test-voice"
                onClick={handleTestVoice}
                disabled={voiceTesting}
              >
                <Volume2 size={16} />
                <span>{voiceTesting ? 'Speaking…' : 'Test Malayalam Voice'}</span>
              </button>
            </div>
          </section>

          {/* System & Cache Diagnostics */}
          <section className="set-card">
            <div className="set-card-header">
              <div className="set-icon-wrap icon-amber">
                <Cpu size={20} />
              </div>
              <div>
                <h3 className="set-card-title">System &amp; Offline Diagnostics</h3>
                <p className="set-card-desc">Local MediaPipe binaries and model weights</p>
              </div>
            </div>

            <div className="set-diagnostics-list">
              <div className="set-diag-item">
                <div className="set-diag-left">
                  <span className="set-diag-status-dot green" />
                  <span>MediaPipe WASM Engine</span>
                </div>
                <span className="set-diag-tag">Self-Hosted Offline</span>
              </div>

              <div className="set-diag-item">
                <div className="set-diag-left">
                  <span className="set-diag-status-dot green" />
                  <span>Hand Landmark Task Model</span>
                </div>
                <span className="set-diag-tag">Local Task Binary</span>
              </div>

              <div className="set-diag-item">
                <div className="set-diag-left">
                  <span className="set-diag-status-dot green" />
                  <span>PyTorch Classifier Architecture</span>
                </div>
                <span className="set-diag-tag">10 ISL Signs + Idle</span>
              </div>

              <div className="set-diag-item">
                <div className="set-diag-left">
                  <span className="set-diag-status-dot blue" />
                  <span>Privacy Sandbox</span>
                </div>
                <span className="set-diag-tag">0 KB Video Transmitted</span>
              </div>
            </div>

            <div className="set-cache-btn-wrap">
              <button className="set-btn-outline" onClick={handleClearCache}>
                <RefreshCw size={14} />
                <span>Clear Local Data Cache</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
