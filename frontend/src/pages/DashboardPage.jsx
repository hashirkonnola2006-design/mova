import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video, BookOpen, Calendar, Flame, Lightbulb,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './DashboardPage.css';

export default function DashboardPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  // User first name (e.g. "hashir")
  const firstName = session?.name ? session.name.split(' ')[0].toLowerCase() : 'hashir';

  // Date strings
  const todayUpper = 'WEDNESDAY, SEP 30';
  const todayNormal = 'Wednesday, Sep 30';

  const VOCAB_WORDS = [
    'hello',
    'good morning',
    'thank you',
    'good',
    'father',
    'boy',
    'girl',
    'bank',
    'tree'
  ];

  return (
    <div className="dash-container">
      {/* ── 1. Page Header ─────────────────────────────────── */}
      <header className="dash-header">
        <div className="dash-date-eyebrow">{todayUpper}</div>
        <h1 className="dash-greeting">
          Good afternoon, <span className="dash-name">{firstName}</span>
        </h1>
        <p className="dash-subtitle">
          Your real-time sign language assistant and communication workspace.
        </p>
      </header>

      {/* ── 2. Primary Workspace (Hero Card) ───────────────── */}
      <section className="dash-hero-card">
        <div className="dash-hero-left">
          <div className="dash-eyebrow">PRIMARY WORKSPACE</div>

          <h2 className="dash-hero-title">
            Translate Sign Language<br />
            in Real Time
          </h2>

          <p className="dash-hero-desc">
            Position your camera and allow MOVA to track 21 hand landmarks in real time,
            converting Indian Sign Language gestures into Malayalam and English text with instant audio playback.
          </p>

          <div className="dash-hero-actions">
            <button
              className="dash-btn-launch"
              onClick={() => navigate('/app/sign-to-text')}
            >
              <Video size={16} />
              <span>Launch Camera Translator</span>
              <ChevronRight size={16} />
            </button>

            <button
              className="dash-btn-explore"
              onClick={() => navigate('/app/learn-signs')}
            >
              <BookOpen size={16} />
              <span>Explore Dictionary</span>
            </button>
          </div>

          <div className="dash-vocab-section">
            <div className="dash-vocab-label">AVAILABLE VOCABULARY</div>
            <div className="dash-vocab-chips">
              {VOCAB_WORDS.map(word => (
                <span key={word} className="dash-vocab-chip">{word}</span>
              ))}
              <button
                className="dash-vocab-more"
                onClick={() => navigate('/app/learn-signs')}
              >
                + 16 more
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Live Detector Window Preview */}
        <div className="dash-hero-right">
          <div className="dash-detector-window">
            <div className="dash-detector-topbar">
              <div className="dash-window-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="dash-detector-badge">
                <span className="pulse-green-dot" /> LIVE DETECTOR
              </div>
            </div>

            {/* Hand Landmark Visual */}
            <div className="dash-detector-screen">
              <div className="dash-hand-mockup">
                {/* Bounding Box Overlay */}
                <div className="dash-bounding-box">
                  <svg className="dash-skeleton-svg" viewBox="0 0 160 200" fill="none">
                    {/* Bounding rectangle */}
                    <rect x="15" y="15" width="130" height="170" stroke="#0B4FE0" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                    {/* Skeleton mesh lines */}
                    <line x1="80" y1="165" x2="55" y2="125" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="55" y1="125" x2="35" y2="100" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="35" y1="100" x2="25" y2="75" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="25" y1="75" x2="20" y2="55" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />

                    <line x1="80" y1="165" x2="65" y2="115" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="65" y1="115" x2="60" y2="75" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="60" y1="75" x2="58" y2="50" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="58" y1="50" x2="55" y2="30" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />

                    <line x1="80" y1="165" x2="80" y2="110" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="80" y1="110" x2="80" y2="70" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="80" y1="70" x2="80" y2="45" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="80" y1="45" x2="80" y2="25" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />

                    <line x1="80" y1="165" x2="95" y2="115" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="95" y1="115" x2="100" y2="75" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="100" y1="75" x2="102" y2="52" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="102" y1="52" x2="105" y2="32" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />

                    <line x1="80" y1="165" x2="110" y2="125" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="110" y1="125" x2="122" y2="95" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="122" y1="95" x2="130" y2="75" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />
                    <line x1="130" y1="75" x2="135" y2="58" stroke="#3B82F6" strokeWidth="1.2" opacity="0.75" />

                    {/* Nodes (21 hand landmark points) */}
                    {[
                      [80, 165],
                      [55, 125], [35, 100], [25, 75], [20, 55],
                      [65, 115], [60, 75], [58, 50], [55, 30],
                      [80, 110], [80, 70], [80, 45], [80, 25],
                      [95, 115], [100, 75], [102, 52], [105, 32],
                      [110, 125], [122, 95], [130, 75], [135, 58]
                    ].map(([cx, cy], i) => (
                      <circle key={i} cx={cx} cy={cy} r="3" fill="#0B4FE0" stroke="#ffffff" strokeWidth="1" />
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            {/* Results Output Bar */}
            <div className="dash-detector-results">
              <div className="dash-result-left">
                <div className="dash-result-sub">RECOGNIZED GESTURE</div>
                <div className="dash-result-ml">നമസ്കാരം</div>
                <div className="dash-result-en">"Hello"</div>
              </div>

              <div className="dash-result-divider" />

              <div className="dash-result-right">
                <div className="dash-result-sub">CONFIDENCE</div>
                <div className="dash-result-pct">92.4%</div>
              </div>
            </div>

            {/* Horizontal progress bar */}
            <div className="dash-detector-progress">
              <div className="dash-progress-fill" style={{ width: '92.4%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Bottom Row: Sign of the Day + Sidebar Cards ── */}
      <div className="dash-bottom-grid">
        {/* Left: Sign of the Day Card */}
        <section className="dash-card dash-sotd-card">
          <div className="dash-sotd-header">
            <div className="dash-sotd-title-group">
              <Calendar size={18} className="dash-sotd-cal-icon" />
              <span className="dash-sotd-title">Sign of the Day</span>
            </div>
            <span className="dash-sotd-date">{todayNormal}</span>
          </div>

          <div className="dash-sotd-body">
            <div className="dash-sotd-text-side">
              <div className="dash-sotd-ml">സുപ്രഭാതം</div>
              <div className="dash-sotd-en">Good Morning</div>
              <p className="dash-sotd-desc">
                Start with a good morning and spread positivity. This sign helps you greet others in a warm and friendly way.
              </p>
              <div className="dash-sotd-tag">Daily Sign</div>
            </div>

            <div className="dash-sotd-divider" />

            {/* Hand Line Art Graphic */}
            <div className="dash-sotd-art-side">
              <div className="dash-hand-art-wrap">
                <svg className="dash-hand-svg" viewBox="0 0 100 120" fill="none" stroke="#0A0F2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {/* Stylized open hand line art matching reference */}
                  <path d="M45,115 C45,95 40,75 35,65 C32,60 28,55 24,58 C20,62 25,75 30,85" />
                  <path d="M35,65 C33,50 30,35 30,28 C30,22 36,22 38,28 C40,40 43,62 43,62" />
                  <path d="M43,62 C43,45 45,22 47,15 C48,10 55,10 56,15 C58,30 58,60 58,60" />
                  <path d="M58,60 C60,45 64,25 66,20 C68,15 74,16 74,22 C74,38 72,62 72,62" />
                  <path d="M72,62 C75,50 78,35 80,32 C82,28 87,30 86,36 C84,52 82,75 78,88 C74,100 68,115 65,115" />
                  <path d="M45,115 L65,115" strokeWidth="1.2" />
                </svg>
              </div>
              <span className="dash-hand-art-label">Good Morning</span>
            </div>
          </div>
        </section>

        {/* Right: Stacked Cards (3-Day Streak + Helpful Tips) */}
        <div className="dash-side-stack">
          {/* 3-Day Streak */}
          <section className="dash-card dash-streak-card">
            <div className="dash-streak-header">
              <div className="dash-streak-title-wrap">
                <Flame size={18} className="dash-flame-icon" />
                <span className="dash-card-heading">3-Day Streak</span>
              </div>
              <span className="dash-active-pill">Active</span>
            </div>

            <div className="dash-stats-columns">
              <div className="dash-stat-col">
                <div className="dash-stat-digit">10</div>
                <div className="dash-stat-sub">Active Signs</div>
              </div>

              <div className="dash-stat-divider" />

              <div className="dash-stat-col">
                <div className="dash-stat-digit">92%</div>
                <div className="dash-stat-sub">Target Accuracy</div>
              </div>

              <div className="dash-stat-divider" />

              <div className="dash-stat-col">
                <div className="dash-stat-digit">&lt;25ms</div>
                <div className="dash-stat-sub">Avg. Latency</div>
              </div>
            </div>
          </section>

          {/* Helpful Tips */}
          <section
            className="dash-card dash-tips-card"
            onClick={() => navigate('/app/accessibility')}
            role="button"
            tabIndex={0}
          >
            <div className="dash-tips-header">
              <div className="dash-tips-title-wrap">
                <Lightbulb size={18} className="dash-tips-icon" />
                <span className="dash-card-heading">Helpful Tips</span>
              </div>
              <ChevronRight size={18} className="dash-tips-chevron" />
            </div>

            <div className="dash-tips-content">
              <div className="dash-tips-headline">Position yourself centered</div>
              <p className="dash-tips-text">
                Keep your hands within the camera frame and your body centered for better accuracy.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
