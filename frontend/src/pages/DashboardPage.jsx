import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video, ArrowRight, Volume2, AlertTriangle, Flame,
  Sparkles, BookOpen, Clock, Activity, CheckCircle2,
  Zap, Lightbulb, Shield, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './DashboardPage.css';

export default function DashboardPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = session?.name ? session.name.split(' ')[0] : 'there';

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="home-container">
      {/* ── Welcome & Status Header ───────────────────────── */}
      <header className="home-header">
        <div className="home-header-left">
          <div className="home-date-chip">{todayFormatted}</div>
          <h1 className="home-title">
            {greeting}, <span className="home-title-name">{firstName}</span> 👋
          </h1>
          <p className="home-subtitle">
            Your real-time sign language assistant and communication workspace.
          </p>
        </div>

        <div className="home-header-right">
          <div className="home-status-card">
            <div className="home-status-indicator">
              <span className="home-status-dot" />
              <span className="home-status-text">AI Translation Engine Active</span>
            </div>
            <div className="home-status-sub">
              Malayalam &amp; English ISL model connected
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Hero: Real-Time Translation Launcher ─────── */}
      <section className="home-hero-card">
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <Sparkles size={14} />
            <span>PRIMARY WORKSPACE</span>
          </div>

          <h2 className="home-hero-title">
            Translate Sign Language in Real Time
          </h2>

          <p className="home-hero-desc">
            Position your camera and sign naturally. MOVA tracks 21 hand landmarks in real time,
            converting Indian Sign Language gestures into Malayalam and English text with instant audio playback.
          </p>

          <div className="home-hero-actions">
            <button
              className="home-btn-launch"
              onClick={() => navigate('/app/sign-to-text')}
            >
              <Video size={18} />
              <span>Launch Camera Translator</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="home-btn-ghost"
              onClick={() => navigate('/app/learn-signs')}
            >
              <BookOpen size={16} />
              <span>Explore Dictionary</span>
            </button>
          </div>

          <div className="home-hero-tags">
            <span className="home-tags-label">Available Vocabulary:</span>
            <div className="home-tags-list">
              {['hello', 'good morning', 'thank you', 'good', 'father', 'boy', 'girl', 'bank', 'time'].map(word => (
                <span key={word} className="home-tag-pill">{word}</span>
              ))}
              <span className="home-tag-pill home-tag-pill-idle">+ idle release</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Visual Teaser */}
        <div className="home-hero-visual">
          <div className="home-preview-box">
            <div className="home-preview-topbar">
              <div className="home-preview-dots">
                <span className="preview-dot red" />
                <span className="preview-dot yellow" />
                <span className="preview-dot green" />
              </div>
              <span className="home-preview-status">
                <span className="home-pulse-dot" /> LIVE DETECTOR
              </span>
            </div>

            <div className="home-preview-body">
              <div className="home-preview-gesture-icon">🤟</div>
              <div className="home-preview-detected">
                <div className="home-detected-label">Recognized Gesture</div>
                <div className="home-detected-malayalam">നന്ദി</div>
                <div className="home-detected-english">"Thank You"</div>
              </div>

              <div className="home-preview-meter">
                <div className="home-meter-labels">
                  <span>Detection Confidence</span>
                  <span className="home-meter-val">94.8%</span>
                </div>
                <div className="home-meter-track">
                  <div className="home-meter-bar" style={{ width: '94.8%' }} />
                </div>
              </div>

              <div className="home-preview-badges">
                <div className="home-mini-chip">
                  <Zap size={12} />
                  <span>22ms latency</span>
                </div>
                <div className="home-mini-chip chip-confirmed">
                  <CheckCircle2 size={12} />
                  <span>Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Two-Column Operational Layout ──────────────────── */}
      <div className="home-grid">
        {/* Left Column: Sign of the Day & Quick Essentials */}
        <div className="home-col-main">
          {/* Sign of the Day */}
          <section className="home-card home-sotd-card">
            <div className="home-card-header">
              <div className="home-card-badge sotd-badge">
                <BookOpen size={13} />
                <span>SIGN OF THE DAY</span>
              </div>
              <span className="home-card-meta">Indian Sign Language (ISL)</span>
            </div>

            <div className="home-sotd-content">
              <div className="home-sotd-lead">
                <div className="home-sotd-word">
                  <span className="home-sotd-malayalam">സുപ്രഭാതം</span>
                  <span className="home-sotd-english">Good Morning</span>
                </div>
                <p className="home-sotd-instruction">
                  Start with closed fingers resting near your heart, then open your palms outward facing upward with a warm expression.
                </p>
              </div>

              <div className="home-sotd-footer">
                <div className="home-sotd-tags">
                  <span className="home-subtag">Social Courtesies</span>
                  <span className="home-subtag">Beginner</span>
                </div>
                <button
                  className="home-sotd-action"
                  onClick={() => navigate('/app/sign-to-text')}
                >
                  <span>Practice this gesture</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </section>

          {/* Quick Essentials (Only 2 high-frequency tools) */}
          <div className="home-quick-actions">
            {/* Quick Voice Synthesis */}
            <div
              className="home-action-tile"
              onClick={() => navigate('/app/text-to-speech')}
              role="button"
              tabIndex={0}
            >
              <div className="home-action-icon-wrap icon-purple">
                <Volume2 size={20} />
              </div>
              <div className="home-action-info">
                <h3 className="home-action-title">Speak a Phrase Aloud</h3>
                <p className="home-action-desc">
                  Convert text to instant synthesized voice in Malayalam or English.
                </p>
                <div className="home-action-link">
                  Open Voice Studio <ArrowRight size={14} />
                </div>
              </div>
            </div>

            {/* Emergency SOS Shortcut */}
            <div
              className="home-action-tile"
              onClick={() => navigate('/app/emergency')}
              role="button"
              tabIndex={0}
            >
              <div className="home-action-icon-wrap icon-red">
                <AlertTriangle size={20} />
              </div>
              <div className="home-action-info">
                <h3 className="home-action-title">Emergency Cards</h3>
                <p className="home-action-desc">
                  Rapid one-tap critical phrases for medical or urgent communication.
                </p>
                <div className="home-action-link text-red">
                  View Emergency Cards <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Insights, Guidelines & Streak */}
        <div className="home-col-side">
          {/* Daily Streak & Activity Card */}
          <section className="home-card home-activity-card">
            <div className="home-streak-banner">
              <div className="home-streak-left">
                <div className="home-streak-flame">
                  <Flame size={24} />
                </div>
                <div>
                  <div className="home-streak-count">3-Day Streak</div>
                  <div className="home-streak-sub">Keep practicing daily!</div>
                </div>
              </div>
              <div className="home-streak-pill">Active</div>
            </div>

            <div className="home-stats-mini-grid">
              <div className="home-mini-stat">
                <div className="stat-num">10</div>
                <div className="stat-name">Active Signs</div>
              </div>
              <div className="home-mini-stat">
                <div className="stat-num">92%</div>
                <div className="stat-name">Target Accuracy</div>
              </div>
              <div className="home-mini-stat">
                <div className="stat-num">&lt;25ms</div>
                <div className="stat-name">Avg Latency</div>
              </div>
            </div>
          </section>

          {/* Tips for Best Results */}
          <section className="home-card home-tips-card">
            <div className="home-card-header">
              <div className="home-card-badge tips-badge">
                <Lightbulb size={13} />
                <span>HELPFUL TIPS</span>
              </div>
            </div>

            <ul className="home-tips-list">
              <li className="home-tip-item">
                <CheckCircle2 size={16} className="home-tip-check" />
                <div>
                  <strong>Position yourself centered</strong>
                  <p>Keep your hands and chest clearly within the webcam boundary.</p>
                </div>
              </li>
              <li className="home-tip-item">
                <CheckCircle2 size={16} className="home-tip-check" />
                <div>
                  <strong>Steady gesture holds</strong>
                  <p>Hold each sign for ~1.5 seconds to trigger consecutive confirmation.</p>
                </div>
              </li>
              <li className="home-tip-item">
                <CheckCircle2 size={16} className="home-tip-check" />
                <div>
                  <strong>Return to idle</strong>
                  <p>Drop your hands momentarily between words to release the latch.</p>
                </div>
              </li>
            </ul>

            <div className="home-tips-footer">
              <button
                className="home-tips-link"
                onClick={() => navigate('/app/accessibility')}
              >
                <span>Adjust accessibility preferences</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
