import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Video, BookOpen, Volume2, Globe, Calendar, Flame,
  Lightbulb, CheckCircle2, Copy, Check, Plus, Trash2,
  ArrowRight, ChevronRight, Sparkles, Shield, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getRecentTranslations,
  saveTranslation,
  getLearningProgress,
  getStats,
  getQuickPhrases,
  addQuickPhrase,
  deleteQuickPhrase,
  formatRelativeTime,
  ALL_SUPPORTED_SIGNS
} from '../services/userData.js';
import './DashboardPage.css';

const HELPFUL_TIPS = [
  {
    headline: 'Position yourself centered',
    text: 'Keep your hands within the camera frame and your body centered for optimal 21-point tracking.',
  },
  {
    headline: 'Use balanced front lighting',
    text: 'Ensure light falls directly on your palms without strong backlighting or shadows behind you.',
  },
  {
    headline: 'Hold signs steadily',
    text: 'Hold each gesture steady for about 1 second to confirm the gesture with high confidence.',
  },
  {
    headline: 'Neutral camera background',
    text: 'A clean background with contrast against your skin tone improves landmark precision.',
  },
  {
    headline: 'Try live conversation mode',
    text: 'Switch to Conversation mode for split-screen sign detection and audio playback with hearing speakers.',
  },
];

const VOCAB_WORDS = [
  'hello', 'good morning', 'thank you', 'good', 'i',
  'father', 'boy', 'girl', 'bank', 'time'
];

export default function DashboardPage() {
  const { session, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // User details
  const isGuest = !isAuthenticated || !session?.email || session?.isGuest || session?.id === 'guest';
  const userId = isGuest ? null : (session?.id || session?.email || null);
  const rawName = isGuest ? 'Friend' : (session?.name || 'Friend');
  const firstName = rawName.split(' ')[0];

  // Dynamic time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  }, []);

  // Formatted date string
  const todayUpper = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  }, []);

  const todayNormal = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Data states
  const [translations, setTranslations] = useState([]);
  const [practicedSigns, setPracticedSigns] = useState([]);
  const [quickPhrases, setQuickPhrases] = useState([]);
  const [stats, setStats] = useState({ signsPracticed: 0, totalSigns: 10, translationsToday: 0, dayStreak: 1 });
  const [loading, setLoading] = useState(true);

  // Interaction states
  const [copiedId, setCopiedId] = useState(null);
  const [speakingPhraseId, setSpeakingPhraseId] = useState(null);
  const [showAddPhraseModal, setShowAddPhraseModal] = useState(false);
  const [newPhraseEn, setNewPhraseEn] = useState('');
  const [newPhraseMl, setNewPhraseMl] = useState('');
  const [dismissGuestBanner, setDismissGuestBanner] = useState(false);

  // Rotating tip for this visit
  const tip = useMemo(() => {
    const storedIdx = parseInt(sessionStorage.getItem('mova_tip_idx') || '0', 10);
    const nextIdx = (storedIdx + 1) % HELPFUL_TIPS.length;
    sessionStorage.setItem('mova_tip_idx', nextIdx.toString());
    return HELPFUL_TIPS[storedIdx % HELPFUL_TIPS.length];
  }, []);

  // Sign of the day (based on day of year)
  const signOfTheDay = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return ALL_SUPPORTED_SIGNS[dayOfYear % ALL_SUPPORTED_SIGNS.length];
  }, []);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [txList, progressList, phraseList] = await Promise.all([
        getRecentTranslations(userId),
        getLearningProgress(userId),
        getQuickPhrases(userId),
      ]);
      setTranslations(txList);
      setPracticedSigns(progressList);
      setQuickPhrases(phraseList);
      setStats(getStats(userId, progressList, txList));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Speak aloud helper
  const handleSpeak = (text, id = null) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (id) setSpeakingPhraseId(id);

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ml-IN';
    utter.rate = 0.95;
    utter.onend = () => {
      if (id) setSpeakingPhraseId(null);
    };
    utter.onerror = () => {
      if (id) setSpeakingPhraseId(null);
    };
    window.speechSynthesis.speak(utter);
  };

  // Copy to clipboard helper
  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Add custom phrase
  const handleAddPhrase = async (e) => {
    e.preventDefault();
    if (!newPhraseEn.trim() || !newPhraseMl.trim()) return;
    const updated = await addQuickPhrase(userId, {
      en: newPhraseEn.trim(),
      ml: newPhraseMl.trim(),
    });
    setQuickPhrases(updated);
    setNewPhraseEn('');
    setNewPhraseMl('');
    setShowAddPhraseModal(false);
  };

  // Delete custom phrase
  const handleDeletePhrase = async (id) => {
    const updated = await deleteQuickPhrase(userId, id);
    setQuickPhrases(updated);
  };

  // Next unpracticed sign
  const nextUnpracticed = useMemo(() => {
    return ALL_SUPPORTED_SIGNS.find(s => !practicedSigns.includes(s.id)) || ALL_SUPPORTED_SIGNS[0];
  }, [practicedSigns]);

  return (
    <div className="dash-container">
      {/* ── Guest Sync Banner (if not logged in) ────────────────────── */}
      {isGuest && !dismissGuestBanner && (
        <aside className="dash-guest-banner" role="status">
          <div className="dash-guest-content">
            <Sparkles size={16} className="dash-guest-sparkle" />
            <span>
              <strong>Guest mode:</strong> Sign in to sync your translations, streak, and learning progress across devices.
            </span>
          </div>
          <div className="dash-guest-actions">
            <Link to="/login" className="dash-guest-btn">Sign in</Link>
            <button
              type="button"
              className="dash-guest-dismiss"
              onClick={() => setDismissGuestBanner(true)}
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </aside>
      )}

      {/* ── 1. Page Header ─────────────────────────────────────────── */}
      <header className="dash-header">
        <div className="dash-date-eyebrow">{todayUpper}</div>
        <h1 className="dash-greeting">
          {greeting}, <span className="dash-name">{firstName}</span>
        </h1>
        <p className="dash-subtitle">
          Your real-time sign language assistant and communication workspace.
        </p>
      </header>

      {/* ── 2. Primary Workspace (Hero Card + Mini Camera) ─────────── */}
      <section className="dash-hero-card">
        {/* Left Side: Launch Actions & Info */}
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
                + explore all
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Quick Actions Row (4 Compact Cards) ──────────────────── */}
      <section className="dash-quick-actions-grid" aria-label="Quick actions">
        <Link to="/app/sign-to-text" className="dash-quick-card">
          <div className="dash-quick-icon-wrap dash-quick-icon--blue">
            <Video size={20} />
          </div>
          <div className="dash-quick-info">
            <span className="dash-quick-title">Sign to Text</span>
            <span className="dash-quick-desc">Camera detection & translation</span>
          </div>
        </Link>

        <Link to="/app/text-to-speech" className="dash-quick-card">
          <div className="dash-quick-icon-wrap dash-quick-icon--emerald">
            <Volume2 size={20} />
          </div>
          <div className="dash-quick-info">
            <span className="dash-quick-title">Text to Speech</span>
            <span className="dash-quick-desc">Malayalam voice synthesizer</span>
          </div>
        </Link>

        <Link to="/app/conversation" className="dash-quick-card">
          <div className="dash-quick-icon-wrap dash-quick-icon--indigo">
            <Globe size={20} />
          </div>
          <div className="dash-quick-info">
            <span className="dash-quick-title">Conversation</span>
            <span className="dash-quick-desc">Two-way live split screen</span>
          </div>
        </Link>

        <Link to="/app/learn-signs" className="dash-quick-card">
          <div className="dash-quick-icon-wrap dash-quick-icon--amber">
            <BookOpen size={20} />
          </div>
          <div className="dash-quick-info">
            <span className="dash-quick-title">Learn Signs</span>
            <span className="dash-quick-desc">Interactive visual lessons</span>
          </div>
        </Link>
      </section>

      {/* ── 4. Real Stats Row ───────────────────────────────────────── */}
      <section className="dash-card dash-stats-card" aria-label="Usage stats">
        <div className="dash-stats-grid">
          <div className="dash-stat-item">
            <div className="dash-stat-digit">
              {stats.signsPracticed} <span className="dash-stat-denom">/ {stats.totalSigns}</span>
            </div>
            <div className="dash-stat-label">Signs Practised</div>
          </div>

          <div className="dash-stat-divider" aria-hidden="true" />

          <div className="dash-stat-item">
            <div className="dash-stat-digit">{stats.translationsToday}</div>
            <div className="dash-stat-label">Translations Today</div>
          </div>

          <div className="dash-stat-divider" aria-hidden="true" />

          <div className="dash-stat-item">
            <div className="dash-stat-digit dash-stat-digit--streak">
              <Flame size={20} className="dash-streak-icon" />
              <span>{stats.dayStreak} {stats.dayStreak === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="dash-stat-label">Day Streak</div>
          </div>
        </div>
      </section>

      {/* ── 5. Main 12-Column Responsive Grid ───────────────────────── */}
      <div className="dash-main-grid">
        {/* Left Column (7 cols): Recent Translations + Learning Progress */}
        <div className="dash-col-primary">
          {/* Recent Translations Card */}
          <section className="dash-card dash-recent-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">Recent Translations</h3>
              <Link to="/app/sign-to-text" className="dash-card-link">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="dash-skeleton-list">
                <div className="dash-skeleton-row" />
                <div className="dash-skeleton-row" />
                <div className="dash-skeleton-row" />
              </div>
            ) : translations.length === 0 ? (
              <div className="dash-empty-state">
                <Video size={28} className="dash-empty-icon" />
                <p className="dash-empty-title">Your translations will show up here.</p>
                <p className="dash-empty-sub">
                  Turn on the mini camera or launch the translator to begin translating ISL signs.
                </p>
              </div>
            ) : (
              <ul className="dash-translations-list" role="list">
                {translations.map((item) => (
                  <li key={item.id} className="dash-translation-row">
                    <div className="dash-tx-texts">
                      <span className="dash-tx-ml">{item.ml || item.malayalam_text}</span>
                      <span className="dash-tx-en">{item.en || item.english_text}</span>
                    </div>

                    <div className="dash-tx-meta">
                      <span className="dash-tx-time">
                        {formatRelativeTime(item.created_at)}
                      </span>

                      <div className="dash-tx-actions">
                        <button
                          type="button"
                          className="dash-tx-action-btn"
                          onClick={() => handleSpeak(item.ml || item.malayalam_text)}
                          aria-label={`Speak ${item.en || item.english_text} in Malayalam`}
                          title="Speak aloud"
                        >
                          <Volume2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="dash-tx-action-btn"
                          onClick={() => handleCopy(`${item.ml || item.malayalam_text} (${item.en || item.english_text})`, item.id)}
                          aria-label="Copy translation"
                          title="Copy"
                        >
                          {copiedId === item.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Learning Progress Card */}
          <section className="dash-card dash-progress-card">
            <div className="dash-card-header">
              <div>
                <h3 className="dash-card-title">Learning Progress</h3>
                <span className="dash-progress-sub">
                  Signs learned: {stats.signsPracticed} of {stats.totalSigns}
                </span>
              </div>
              <span className="dash-progress-pct">
                {Math.round((stats.signsPracticed / stats.totalSigns) * 100)}%
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="dash-progress-track">
              <div
                className="dash-progress-bar"
                style={{ width: `${(stats.signsPracticed / stats.totalSigns) * 100}%` }}
              />
            </div>

            {/* Grid of 10 supported signs */}
            <div className="dash-signs-grid" role="list">
              {ALL_SUPPORTED_SIGNS.map((sign) => {
                const isPracticed = practicedSigns.includes(sign.id);
                return (
                  <button
                    key={sign.id}
                    type="button"
                    className={`dash-sign-chip ${isPracticed ? 'dash-sign-chip--practiced' : 'dash-sign-chip--unpracticed'}`}
                    onClick={() => navigate('/app/learn-signs', { state: { signId: sign.id } })}
                    title={`Practice ${sign.en} in Learn Signs`}
                  >
                    <span className="dash-sign-icon">{sign.icon}</span>
                    <span className="dash-sign-name">{sign.en}</span>
                    {isPracticed && <CheckCircle2 size={14} className="dash-sign-check" />}
                  </button>
                );
              })}
            </div>

            <div className="dash-progress-footer">
              <button
                type="button"
                className="dash-btn-continue"
                onClick={() => navigate('/app/learn-signs', { state: { signId: nextUnpracticed.id } })}
              >
                <span>Continue learning: {nextUnpracticed.en}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Quick Phrases + Sign of Day + Helpful Tips */}
        <div className="dash-col-secondary">
          {/* Quick Phrases Card */}
          <section className="dash-card dash-phrases-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">Quick Phrases</h3>
              <button
                type="button"
                className="dash-add-phrase-trigger"
                onClick={() => setShowAddPhraseModal(prev => !prev)}
                aria-label="Add custom phrase"
              >
                <Plus size={15} />
                <span>Add</span>
              </button>
            </div>

            <p className="dash-card-desc">
              Tap any phrase to pronounce it aloud in Malayalam.
            </p>

            {/* Inline Add Phrase Form */}
            {showAddPhraseModal && (
              <form onSubmit={handleAddPhrase} className="dash-add-phrase-form">
                <input
                  type="text"
                  placeholder="English meaning (e.g. Yes)"
                  value={newPhraseEn}
                  onChange={(e) => setNewPhraseEn(e.target.value)}
                  className="dash-phrase-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Malayalam text (e.g. അതെ)"
                  value={newPhraseMl}
                  onChange={(e) => setNewPhraseMl(e.target.value)}
                  className="dash-phrase-input dash-phrase-input--ml"
                  required
                />
                <div className="dash-phrase-form-btns">
                  <button type="submit" className="dash-phrase-save-btn">Save</button>
                  <button
                    type="button"
                    className="dash-phrase-cancel-btn"
                    onClick={() => setShowAddPhraseModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Phrases Chips Row */}
            <div className="dash-phrases-row">
              {quickPhrases.map((phrase) => {
                const isSpeaking = speakingPhraseId === phrase.id;
                return (
                  <div
                    key={phrase.id}
                    className={`dash-phrase-chip ${isSpeaking ? 'dash-phrase-chip--speaking' : ''}`}
                  >
                    <button
                      type="button"
                      className="dash-phrase-tap-btn"
                      onClick={() => handleSpeak(phrase.ml, phrase.id)}
                    >
                      <Volume2 size={14} className={isSpeaking ? 'animate-bounce text-blue-600' : ''} />
                      <span className="dash-phrase-text-en">{phrase.en}</span>
                      <span className="dash-phrase-text-ml">{phrase.ml}</span>
                      {isSpeaking && <span className="dash-phrase-badge">Speaking…</span>}
                    </button>

                    {phrase.isCustom && (
                      <button
                        type="button"
                        className="dash-phrase-del-btn"
                        onClick={() => handleDeletePhrase(phrase.id)}
                        aria-label={`Remove ${phrase.en}`}
                        title="Remove phrase"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Sign of the Day Card */}
          <section className="dash-card dash-sotd-card">
            <div className="dash-sotd-header">
              <div className="dash-sotd-title-group">
                <Calendar size={17} className="dash-sotd-cal-icon" />
                <span className="dash-sotd-title">Sign of the Day</span>
              </div>
              <span className="dash-sotd-date">{todayNormal}</span>
            </div>

            <div className="dash-sotd-body">
              <div className="dash-sotd-text-side">
                <div className="dash-sotd-ml">{signOfTheDay.ml}</div>
                <div className="dash-sotd-en">{signOfTheDay.en}</div>
                <p className="dash-sotd-desc">
                  Start your day by expanding your ISL vocabulary. Master this daily gesture with guided hand feedback.
                </p>

                <button
                  type="button"
                  className="dash-sotd-practice-btn"
                  onClick={() => navigate('/app/learn-signs', { state: { signId: signOfTheDay.id } })}
                >
                  <BookOpen size={14} />
                  <span>Practise this sign</span>
                </button>
              </div>

              <div className="dash-sotd-divider" aria-hidden="true" />

              <div className="dash-sotd-art-side">
                <div className="dash-hand-art-wrap">
                  <span className="dash-sotd-big-emoji">{signOfTheDay.icon}</span>
                </div>
                <span className="dash-hand-art-label">{signOfTheDay.en}</span>
              </div>
            </div>
          </section>

          {/* Helpful Tips Card */}
          <section
            className="dash-card dash-tips-card"
            onClick={() => navigate('/app/accessibility')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/app/accessibility'); }}
          >
            <div className="dash-tips-header">
              <div className="dash-tips-title-wrap">
                <Lightbulb size={18} className="dash-tips-icon" />
                <span className="dash-card-heading">Helpful Tip</span>
              </div>
              <ChevronRight size={17} className="dash-tips-chevron" />
            </div>

            <div className="dash-tips-content">
              <div className="dash-tips-headline">{tip.headline}</div>
              <p className="dash-tips-text">{tip.text}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
