import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Play, Menu, X, ShieldCheck, BookOpen,
  Volume2, MessageSquare, ScanFace, ChevronRight, Check,
  Camera, Lock, Sparkles, HelpCircle, Layers
} from 'lucide-react';
import MovaLogo from '../components/MovaLogo.jsx';
import './LandingPage.css';

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Accessibility', href: '#accessibility' },
  { label: 'About', href: '#about' },
];

// Feature strip items directly from the reference design
const FEATURES = [
  {
    id: 'sign-to-text',
    title: 'Sign to Text',
    subtitle: 'Real-time sign detection',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4FE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M7 10h4" />
        <path d="M9 7v6" />
        <path d="M14 15l2-5 2 5" />
        <path d="M14.8 13.5h2.4" />
      </svg>
    ),
  },
  {
    id: 'text-to-speech',
    title: 'Text to Speech',
    subtitle: 'Speech in many languages',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4FE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    ),
  },
  {
    id: 'live-conversation',
    title: 'Live Conversation',
    subtitle: 'Two-way conversation',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4FE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="8" cy="10" r="1" fill="#0B4FE0" />
        <circle cx="12" cy="10" r="1" fill="#0B4FE0" />
        <circle cx="16" cy="10" r="1" fill="#0B4FE0" />
      </svg>
    ),
  },
  {
    id: 'emergency-support',
    title: 'Emergency Support',
    subtitle: 'Help when it matters',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4FE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    id: 'learn-signs',
    title: 'Learn Signs',
    subtitle: 'Practice sign language',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B4FE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Allow camera access',
    desc: 'MOVA runs right in your browser. Video frames are analyzed locally — no video is recorded, saved, or uploaded to any cloud server.',
    icon: Camera,
  },
  {
    step: '02',
    title: 'Sign naturally in frame',
    desc: 'Hold your sign for about 1.5 seconds. MediaPipe extracts 21 hand landmarks with millimeter precision at 30 frames per second.',
    icon: ScanFace,
  },
  {
    step: '03',
    title: 'Instant Malayalam output',
    desc: 'Watch the recognized words appear in clear Malayalam script. Build sentences word-by-word with instant audio speech playback.',
    icon: Volume2,
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [heroRef, heroIn] = useInView(0.05);
  const [featRef, featIn] = useInView(0.05);
  const [stepsRef, stepsIn] = useInView(0.1);
  const [a11yRef, a11yIn] = useInView(0.1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const smoothScroll = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginToast(true);
    setTimeout(() => setLoginToast(false), 2500);
  };

  return (
    <div className="lp-root">


      {/* ── Navigation Bar ────────────────────────────────────────────── */}
      <header className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">

          {/* MOVA Logo */}
          <a
            href="/"
            className="lp-logo-link"
            onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            aria-label="MOVA Home"
          >
            <MovaLogo height={34} showWordmark={true} />
          </a>

          {/* Navigation Links */}
          <nav className={`lp-nav-links ${menuOpen ? 'lp-nav-links--open' : ''}`} aria-label="Main navigation">
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="lp-nav-link"
                onClick={e => smoothScroll(e, l.href)}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Actions: Log in + Try MOVA */}
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-nav-login">
              Log in
            </Link>
            <button
              className="lp-btn-try"
              onClick={() => navigate('/login')}
            >
              Try MOVA
            </button>
            <button
              className="lp-hamburger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section id="product" className="lp-hero" ref={heroRef}>
        {/* Soft Radial Ambient Glow */}
        <div className="lp-hero-ambient-glow" aria-hidden="true" />

        <div className="lp-hero-container">
          {/* Centered Headlines & CTAs */}
          <div className={`lp-hero-header ${heroIn ? 'lp-in-view' : ''}`}>
            <h1 className="lp-hero-title">
              <span className="lp-title-dark">Every sign.</span>
              <span className="lp-title-blue">Understood.</span>
            </h1>

            <p className="lp-hero-sub">
              Real-time sign language translation that helps everyone
              communicate, understand, and connect.
            </p>

            <div className="lp-hero-actions">
              <button
                className="lp-btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                Start translating <ArrowRight size={18} className="lp-arrow-icon" />
              </button>

              <a
                href="#how-it-works"
                className="lp-btn-secondary"
                onClick={e => smoothScroll(e, '#how-it-works')}
              >
                <span className="lp-play-circle">
                  <Play size={12} fill="#0B4FE0" color="#0B4FE0" />
                </span>
                See how it works
              </a>
            </div>

            <div className="lp-hero-meta">
              <span>Free to try</span>
              <span className="lp-meta-dot">·</span>
              <span>Works in your browser</span>
              <span className="lp-meta-dot">·</span>
              <span>Malayalam, Hindi and English</span>
            </div>
          </div>

          {/* Hero Visual: Reaching hands with tracking landmarks */}
          <div className="lp-hero-visual-wrap" aria-label="AI Sign translation visualization">
            <img
              src="/hero-hands.jpg"
              alt="Two hands reaching toward each other with digital landmark tracking wireframe"
              className="lp-hero-hands-img"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ── Feature Strip ─────────────────────────────────────────────── */}
      <section className="lp-feature-strip" ref={featRef} aria-label="Key features">
        <div className="lp-feature-container">
          <div className="lp-feature-eyebrow">
            BUILT FOR A MORE INCLUSIVE TOMORROW
          </div>

          <div className="lp-feature-row">
            {FEATURES.map((f, i) => (
              <React.Fragment key={f.id}>
                {i > 0 && <div className="lp-feature-divider" aria-hidden="true" />}
                <div className="lp-feature-card">
                  <div className="lp-feature-icon-box" aria-hidden="true">
                    {f.icon}
                  </div>
                  <div className="lp-feature-content">
                    <div className="lp-feature-title">{f.title}</div>
                    <div className="lp-feature-subtitle">{f.subtitle}</div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ──────────────────────────────────────── */}
      <section id="how-it-works" className="lp-section lp-how-it-works" ref={stepsRef}>
        <div className="lp-section-inner">
          <div className="lp-badge-tag">HOW IT WORKS</div>
          <h2 className="lp-section-heading">Three steps to seamless understanding</h2>
          <p className="lp-section-desc">
            Powered by next-generation on-device machine vision. Your camera frames never leave your computer.
          </p>

          <div className="lp-steps-grid">
            {STEPS.map(s => {
              const IconComp = s.icon;
              return (
                <div key={s.step} className="lp-step-item">
                  <div className="lp-step-top">
                    <span className="lp-step-num">{s.step}</span>
                    <div className="lp-step-icon">
                      <IconComp size={20} />
                    </div>
                  </div>
                  <h3 className="lp-step-name">{s.title}</h3>
                  <p className="lp-step-text">{s.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="lp-steps-cta">
            <button className="lp-btn-primary" onClick={() => navigate('/dashboard')}>
              Launch Live Translator <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Accessibility & Privacy ───────────────────────────────────── */}
      <section id="accessibility" className="lp-section lp-privacy-section" ref={a11yRef}>
        <div className="lp-section-inner">
          <div className="lp-badge-tag">ACCESSIBILITY & ETHICS</div>
          <h2 className="lp-section-heading">Private by architecture. Inclusive by design.</h2>

          <div className="lp-cards-dual">
            {/* Card 1: 100% On-Device Privacy */}
            <div className="lp-info-card">
              <div className="lp-info-icon-badge">
                <Lock size={24} />
              </div>
              <h3 className="lp-info-title">100% On-Device Privacy</h3>
              <p className="lp-info-text">
                MOVA runs MediaPipe hand landmark detection entirely inside your browser via WebAssembly.
                Your camera video feed never leaves your local device. No recordings, no facial scans,
                and no tracking data is ever stored on external cloud infrastructure.
              </p>
              <div className="lp-checklist">
                <div className="lp-check-item">
                  <Check size={16} className="lp-check-icon" />
                  <span>Zero video stream transmitted</span>
                </div>
                <div className="lp-check-item">
                  <Check size={16} className="lp-check-icon" />
                  <span>Anonymized coordinate-only processing</span>
                </div>
                <div className="lp-check-item">
                  <Check size={16} className="lp-check-icon" />
                  <span>Works offline with cached WASM</span>
                </div>
              </div>
            </div>

            {/* Card 2: Designed for Everyone */}
            <div id="about" className="lp-info-card">
              <div className="lp-info-icon-badge">
                <Sparkles size={24} />
              </div>
              <h3 className="lp-info-title">Designed for Everyone</h3>
              <p className="lp-info-text">
                Built specifically to bridge the communication gap between Deaf or hard of hearing individuals
                and hearing families, educators, and service providers across Kerala and beyond.
                Compliant with WCAG 2.1 AA accessibility guidelines.
              </p>
              <div className="lp-checklist">
                <div className="lp-check-item">
                  <Check size={16} className="lp-check-icon" />
                  <span>High-contrast Malayalam & English scripts</span>
                </div>
                <div className="lp-check-item">
                  <Check size={16} className="lp-check-icon" />
                  <span>Integrated text-to-speech audio playback</span>
                </div>
                <div className="lp-check-item">
                  <Check size={16} className="lp-check-icon" />
                  <span>Keyboard-navigable & reduced-motion friendly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ready to Translate Banner ─────────────────────────────────── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-banner-inner">
          <h2 className="lp-cta-title">Ready to experience real-time sign translation?</h2>
          <p className="lp-cta-sub">
            Open the translator right now in your browser. No sign-up, no downloads, free forever.
          </p>
          <button className="lp-btn-primary lp-btn-banner" onClick={() => navigate('/dashboard')}>
            Start translating now <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <MovaLogo height={32} showWordmark={true} />
              <p className="lp-footer-tagline">
                Real-time Indian Sign Language to Malayalam translation powered by local artificial intelligence.
              </p>
            </div>

            <div className="lp-footer-links-group">
              <div className="lp-footer-col">
                <div className="lp-footer-col-title">Product</div>
                <a href="#product" onClick={e => smoothScroll(e, '#product')}>Overview</a>
                <a href="#how-it-works" onClick={e => smoothScroll(e, '#how-it-works')}>How it Works</a>
                <button className="lp-footer-text-btn" onClick={() => navigate('/dashboard')}>Live App</button>
              </div>

              <div className="lp-footer-col">
                <div className="lp-footer-col-title">Inclusion</div>
                <a href="#accessibility" onClick={e => smoothScroll(e, '#accessibility')}>Accessibility</a>
                <a href="#about" onClick={e => smoothScroll(e, '#about')}>About MOVA</a>
                <a href="#privacy" onClick={handleLogin}>Privacy Policy</a>
                <button className="lp-footer-text-btn" onClick={() => navigate('/collect')}>Sign Collector</button>
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <p className="lp-footer-copy">
              © {new Date().getFullYear()} MOVA. All rights reserved. Built for an inclusive tomorrow.
            </p>
            <div className="lp-footer-badges">
              <span>MediaPipe Vision</span>
              <span>·</span>
              <span>ISL to Malayalam</span>
              <span>·</span>
              <span>WCAG 2.1 AA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
