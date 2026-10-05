import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu, X, Volume2, ShieldCheck, Lock, Globe,
  ChevronDown, Info, Video, Sparkles
} from 'lucide-react';
import MovaLogo from '../components/MovaLogo.jsx';
import StartButton from '../components/StartButton.jsx';
import Header from '../components/landing/Header.jsx';
import Footer from '../components/Footer.jsx';
import AccessibilityPanel from '../components/AccessibilityPanel.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import Features from '../components/landing/Features.jsx';
import InquiryForm from '../components/InquiryForm.jsx';
import { FAQ_ITEMS } from '../data/faq.js';
import { LANDING_ASSETS } from '../data/landingAssets.js';
import './LandingPage.css';

const HERO_FEATURES = [
  { id: 'sign-to-text', title: 'Sign to Text', subtitle: 'Real-time sign detection', icon: Video, to: '/app/sign-to-text' },
  { id: 'text-to-speech', title: 'Text to Speech', subtitle: 'Speech in many languages', icon: Volume2, to: '/app/text-to-speech' },
  { id: 'live-convo', title: 'Live Conversation', subtitle: 'Two-way conversation', icon: Globe, to: '/app/conversation' },
  { id: 'features', title: 'Features', subtitle: 'Explore all capabilities', icon: Sparkles, to: '#features' },
  { id: 'learn-signs', title: 'Learn Signs', subtitle: 'Practice sign language', icon: ShieldCheck, to: '/app/learn' }
];

export default function LandingPage() {
  const navigate = useNavigate();

  // Navigation state
  const [activeSection, setActiveSection] = useState('hero');

  // Notification toast state
  const [toastMessage, setToastMessage] = useState(null);

  // FAQ accordion state (one open at a time)
  const [openFaqId, setOpenFaqId] = useState(FAQ_ITEMS[0]?.id || null);
  const [showFaqForm, setShowFaqForm] = useState(false);

  // Section in-view states
  const [howIn, setHowIn] = useState(false);
  const [featuresIn, setFeaturesIn] = useState(false);
  const [trustIn, setTrustIn] = useState(false);
  const [faqIn, setFaqIn] = useState(false);
  const [ctaIn, setCtaIn] = useState(false);

  // Section refs for IntersectionObserver
  const heroRef = useRef(null);
  const howRef = useRef(null);
  const featuresRef = useRef(null);
  const trustRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  // Toast timer helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  // Shared IntersectionObserver for fade-up animations & scroll-spy
  useEffect(() => {
    const sectionEntries = [
      { id: 'hero', ref: heroRef, setter: null },
      { id: 'how-it-works', ref: howRef, setter: setHowIn },
      { id: 'features', ref: featuresRef, setter: setFeaturesIn },
      { id: 'trust', ref: trustRef, setter: setTrustIn },
      { id: 'faq', ref: faqRef, setter: setFaqIn },
      { id: 'cta', ref: ctaRef, setter: setCtaIn }
    ];

    const observers = sectionEntries.map(({ id, ref, setter }) => {
      if (!ref.current) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (setter) setter(true);
            if (id !== 'trust' && id !== 'cta') {
              setActiveSection(id);
            }
          }
        },
        { threshold: 0.25, rootMargin: '-60px 0px -40% 0px' }
      );
      obs.observe(ref.current);
      return obs;
    });

    return () => {
      observers.forEach(obs => obs?.disconnect());
    };
  }, []);

  const smoothScroll = (e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(targetId);
    }
  };

  const toggleFaq = (id) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <div className="lp-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="lp-toast" role="alert" aria-live="assertive">
          <Info size={18} className="lp-toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Accessibility Settings Panel (Bottom-Left) */}
      <AccessibilityPanel />

      {/* ── Adaptive Floating Pill Header ────────────────────────────── */}
      <Header />

      {/* ── SECTION 1: HERO (Unchanged layout & hands) ────────────────── */}
      <section id="hero" className="lp-hero" ref={heroRef}>
        <div className="lp-hero-ambient-glow" aria-hidden="true" />
        <div className="lp-hero-center-glow" aria-hidden="true" />

        {/* Full-Bleed Hands Layers Flanking Hero */}
        <div className="lp-hands-layer" aria-hidden="true">
          <div className="lp-hand-side lp-hand-side--left">
            <img
              src="/hand-left.png"
              alt="Hand displaying digital landmark wireframe"
              className="lp-hand-img lp-hand-img--left"
              width={715}
              height={768}
            />
          </div>

          <div className="lp-hand-side lp-hand-side--right">
            <img
              src="/hand-right.png"
              alt="Natural hand reaching out"
              className="lp-hand-img lp-hand-img--right"
              width={716}
              height={768}
            />
          </div>
        </div>

        <div className="lp-hero-container">
          <div className="lp-hero-header lp-in-view">
            <h1 className="lp-hero-title">
              <span className="lp-title-dark">Every sign.</span>
              <span className="lp-title-blue">Understood.</span>
            </h1>

            <p className="lp-hero-sub">
              Real-time sign language translation that helps everyone
              communicate, understand, and connect.
            </p>

            <div className="lp-hero-actions">
              <StartButton />

              <a
                href="#how-it-works"
                className="lp-btn-secondary"
                onClick={e => smoothScroll(e, '#how-it-works')}
              >
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
        </div>

        {/* Feature Dock anchored in hero section */}
        <div className="lp-feature-strip-wrap">
          <div className="lp-feature-container">
            <div className="lp-feature-eyebrow">
              BUILT FOR A MORE INCLUSIVE TOMORROW
            </div>

            <div className="lp-feature-row" role="region" aria-label="Feature Quick Access Dock">
              {HERO_FEATURES.map((f, i) => {
                const IconComponent = f.icon;
                const isAnchor = f.to?.startsWith('#');
                return (
                  <React.Fragment key={f.id}>
                    {i > 0 && <div className="lp-feature-divider" aria-hidden="true" />}
                    {isAnchor ? (
                      <a
                        href={f.to}
                        className="lp-feature-card"
                        onClick={e => smoothScroll(e, f.to)}
                        title={f.title}
                      >
                        <div className="lp-feature-icon-box" aria-hidden="true">
                          <IconComponent size={22} strokeWidth={2} />
                        </div>
                        <div className="lp-feature-content">
                          <div className="lp-feature-title">{f.title}</div>
                          <div className="lp-feature-subtitle">{f.subtitle}</div>
                        </div>
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="lp-feature-card"
                        onClick={() => navigate(f.to)}
                        title={f.title}
                      >
                        <div className="lp-feature-icon-box" aria-hidden="true">
                          <IconComponent size={22} strokeWidth={2} />
                        </div>
                        <div className="lp-feature-content">
                          <div className="lp-feature-title">{f.title}</div>
                          <div className="lp-feature-subtitle">{f.subtitle}</div>
                        </div>
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: HOW IT WORKS (Sticky Scroll-Reveal Component) ── */}
      <HowItWorks onToast={showToast} />

      {/* ── SECTION 3: FEATURES (id="features") ───────────────────────── */}
      <Features ref={featuresRef} inView={featuresIn} />

      {/* ── SECTION 4: TRUST STRIP ────────────────────────────────────── */}
      <section id="trust" className="lp-trust-section" ref={trustRef}>
        <div className={`lp-trust-container ${trustIn ? 'lp-fade-up' : ''}`}>
          <div className="lp-trust-badges">
            {/* TODO: Verify against code - MediaPipe WebAssembly landmark detection runs purely client-side */}
            <div className="lp-trust-badge">
              <ShieldCheck size={20} className="lp-trust-icon" aria-hidden="true" />
              <span className="lp-trust-text">Runs in your browser</span>
            </div>

            {/* TODO: Verify against code - Raw camera video frames are processed in-memory and never stored */}
            <div className="lp-trust-badge">
              <Lock size={19} className="lp-trust-icon" aria-hidden="true" />
              <span className="lp-trust-text">Video stays on your device</span>
            </div>

            {/* TODO: Verify against code - Synthesis and translation output support Malayalam, Hindi, and English */}
            <div className="lp-trust-badge">
              <Globe size={20} className="lp-trust-icon" aria-hidden="true" />
              <span className="lp-trust-text">Malayalam · Hindi · English</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: FAQ (id="faq") ─────────────────────────────────── */}
      <section id="faq" className="lp-section lp-section--white" ref={faqRef}>
        <div className={`lp-section-inner ${faqIn ? 'lp-fade-up' : ''}`}>
          <div className="lp-pill">FAQ</div>
          <h2 className="lp-headline">Common questions.</h2>

          <div className="lp-faq-accordion" role="region" aria-label="Frequently Asked Questions">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqId === item.id;
              const buttonId = `faq-btn-${item.id}`;
              const panelId = `faq-panel-${item.id}`;

              return (
                <div key={item.id} className={`lp-faq-item ${isOpen ? 'lp-faq-item--open' : ''}`}>
                  <button
                    id={buttonId}
                    type="button"
                    className="lp-faq-question-btn"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className="lp-faq-question-text">{item.question}</span>
                    <span className={`lp-faq-chevron ${isOpen ? 'lp-faq-chevron--rotated' : ''}`} aria-hidden="true">
                      <ChevronDown size={20} />
                    </span>
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`lp-faq-answer-wrap ${isOpen ? 'lp-faq-answer-wrap--open' : ''}`}
                  >
                    <div className="lp-faq-answer-content">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ask Us Inquiry Prompt */}
          <div className="lp-faq-ask-wrap">
            {!showFaqForm ? (
              <button
                type="button"
                className="lp-faq-ask-btn"
                onClick={() => setShowFaqForm(true)}
              >
                Didn't find your answer? Ask us
              </button>
            ) : (
              <div className="lp-faq-form-card">
                <InquiryForm
                  source="/#faq"
                  type="Question"
                  compact={true}
                  onCancel={() => setShowFaqForm(false)}
                  onSent={() => setShowFaqForm(false)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FINAL CTA + FOOTER ─────────────────────────────── */}
      <section id="cta" className="lp-section lp-section--pale lp-section--cta" ref={ctaRef}>
        <div className={`lp-section-inner ${ctaIn ? 'lp-fade-up' : ''}`}>
          {/* Rounded Blue Block with Faded Hands Accent */}
          <div className="lp-cta-card">
            <div
              className="lp-cta-hands-accent"
              style={{ backgroundImage: `url('/images/landing/cta-hands-bg.webp')` }}
              aria-hidden="true"
            />
            <div className="lp-cta-content">
              <h2 className="lp-cta-title">Start understanding.</h2>
              <div className="lp-cta-action">
                <StartButton className="lp-start-btn--white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comprehensive Site Footer ─────────────────────────────── */}
      <Footer />
    </div>
  );
}
