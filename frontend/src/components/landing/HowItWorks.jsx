import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../../data/howItWorks.js';
import './HowItWorks.css';

// Reusable speech synthesis helper for Step 3
const speakPhrase = (text, fallbackText, lang = 'ml-IN', onToast) => {
  if (!('speechSynthesis' in window)) {
    if (onToast) onToast('Speech audio is not supported in this browser.');
    return;
  }
  window.speechSynthesis.cancel();

  const voices = window.speechSynthesis.getVoices();
  const mlVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ml'));

  let phraseToSpeak = text;
  let targetLang = lang;

  if (mlVoice) {
    targetLang = 'ml-IN';
  } else {
    phraseToSpeak = fallbackText || text;
    targetLang = 'en-US';
    if (onToast) onToast('No Malayalam voice on this device');
  }

  const utterance = new SpeechSynthesisUtterance(phraseToSpeak);
  utterance.lang = targetLang;
  if (mlVoice) utterance.voice = mlVoice;
  utterance.rate = 0.95;

  window.speechSynthesis.speak(utterance);
};

export default function HowItWorks({ onToast }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // Active step index (0, 1, 2)
  const [activeStep, setActiveStep] = useState(0);

  // Line fill progress for steps [0..1, 0..1, 0..1]
  const [lineProgress, setLineProgress] = useState([0, 0, 0]);

  // Audio speaking state for Step 3
  const [speaking, setSpeaking] = useState(false);

  // High-performance, frame-accurate scroll tracker for sticky pinned steps
  useEffect(() => {
    let rafId = null;

    const updateScrollProgress = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const navH = 88;
      const trackHeight = rect.height;
      const viewportH = window.innerHeight;

      // Scrollable distance while the sticky container is pinned inside the track
      const scrollableDistance = trackHeight - (viewportH - navH);
      if (scrollableDistance <= 0) return;

      // Distance scrolled into the track past the navigation header
      const scrolled = navH - rect.top;
      const progress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);

      let stepIndex = 0;
      if (progress >= 0.66) {
        stepIndex = 2;
      } else if (progress >= 0.33) {
        stepIndex = 1;
      } else {
        stepIndex = 0;
      }
      setActiveStep(stepIndex);

      // Compute smooth vertical fill for each step indicator line
      const p0 = Math.min(Math.max(progress / 0.33, 0), 1);
      const p1 = Math.min(Math.max((progress - 0.33) / 0.33, 0), 1);
      const p2 = Math.min(Math.max((progress - 0.66) / 0.34, 0), 1);

      setLineProgress([p0, p1, p2]);
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScrollProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScrollProgress();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Step click navigation: smooth scroll to that step's trigger point
  const handleStepClick = useCallback((index) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const currentScrollY = window.scrollY;
    const trackTop = currentScrollY + rect.top;
    const navH = 88;
    const trackHeight = trackRef.current.offsetHeight;
    const viewportH = window.innerHeight;
    const scrollableDistance = trackHeight - (viewportH - navH);

    // Target scroll fraction: index 0 -> 0.05, 1 -> 0.48, 2 -> 0.88
    const targetFraction = index === 0 ? 0.05 : index === 1 ? 0.48 : 0.88;
    const targetScrollY = trackTop - navH + (targetFraction * scrollableDistance);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }, []);

  const handleStepAudio = (e) => {
    e.stopPropagation();
    setSpeaking(true);
    speakPhrase('നന്ദി', 'Thank you', 'ml-IN', onToast);
    setTimeout(() => setSpeaking(false), 1400);
  };

  return (
    <section id="how-it-works" className="hiw-root" ref={containerRef}>
      {/* Header in normal flow above sticky area */}
      <div className="hiw-header">
        <div className="lp-pill">HOW IT WORKS</div>
        <h2 className="lp-headline">Sign. See. Hear.</h2>
      </div>

      {/* ── DESKTOP PINNED SCROLL-REVEAL TRACK (~240vh total height) ────── */}
      <div className="hiw-pinned-track" ref={trackRef}>
        <div className="hiw-sticky-container">
          <div className="hiw-sticky-inner">
            {/* Left Column: Numbered steps with vertical progress lines */}
            <div className="hiw-steps-col" role="tablist" aria-label="How it works step progression">
              {HOW_IT_WORKS_STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                const isPassed = activeStep > idx;
                const fillRatio = isPassed ? 1 : lineProgress[idx] || 0;

                return (
                  <button
                    key={step.number}
                    type="button"
                    role="tab"
                    id={`hiw-step-btn-${idx}`}
                    aria-selected={isActive}
                    aria-current={isActive ? 'step' : undefined}
                    aria-controls={`hiw-panel-${idx}`}
                    className={`hiw-step-item ${isActive ? 'hiw-step-item--active' : ''}`}
                    onClick={() => handleStepClick(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStepClick(idx);
                      }
                    }}
                  >
                    {/* Left vertical progress track & fill line */}
                    <div className="hiw-line-track" aria-hidden="true">
                      <div
                        className="hiw-line-fill"
                        style={{ transform: `scaleY(${fillRatio})` }}
                      />
                    </div>

                    {/* Step Content */}
                    <div className="hiw-step-content">
                      <div className="hiw-step-num">{step.number}</div>
                      <h3 className="hiw-step-title">{step.title}</h3>
                      <p className="hiw-step-desc">{step.description}</p>

                      {/* Step 3 Speaker Audio Button */}
                      {idx === 2 && (
                        <div className="hiw-audio-btn-wrap">
                          <button
                            type="button"
                            className={`hiw-speaker-btn ${speaking ? 'hiw-speaker-btn--active' : ''}`}
                            onClick={handleStepAudio}
                            aria-label="Listen to Malayalam pronunciation of Thank You"
                            title="Click to speak: നന്ദി"
                          >
                            <Volume2 size={18} className={speaking ? 'lp-icon-pulse' : ''} />
                            <span>Hear "നന്ദി"</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Stacked crossfading image showcase */}
            <div className="hiw-image-col">
              <div className="hiw-image-box">
                {HOW_IT_WORKS_STEPS.map((step, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <div
                      key={step.number}
                      id={`hiw-panel-${idx}`}
                      role="tabpanel"
                      aria-labelledby={`hiw-step-btn-${idx}`}
                      className={`hiw-image-slide ${isActive ? 'hiw-image-slide--active' : ''}`}
                      aria-hidden={!isActive}
                    >
                      <picture>
                        <source srcSet={step.image.webp} type="image/webp" />
                        <img
                          src={step.image.png}
                          alt={step.image.alt}
                          className="hiw-img"
                          width={step.image.width}
                          height={step.image.height}
                          loading={step.image.loading || 'lazy'}
                          decoding="async"
                        />
                      </picture>

                      {/* Interactive speaker overlay badge on Step 3 */}
                      {idx === 2 && (
                        <button
                          type="button"
                          className={`hiw-img-audio-overlay ${speaking ? 'hiw-img-audio-overlay--active' : ''}`}
                          onClick={handleStepAudio}
                          aria-label="Listen to Malayalam pronunciation"
                        >
                          <Volume2 size={20} className={speaking ? 'lp-icon-pulse' : ''} />
                          <span>Speak aloud</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE / TABLET / REDUCED-MOTION STACKED LAYOUT (Below 1024px) ── */}
      <div className="hiw-mobile-stacked">
        {HOW_IT_WORKS_STEPS.map((step, idx) => (
          <div key={step.number} className="hiw-mobile-card">
            {/* Image on top (full width, stable 0.92 aspect ratio) */}
            <div className="hiw-mobile-img-box">
              <picture>
                <source srcSet={step.image.webp} type="image/webp" />
                <img
                  src={step.image.png}
                  alt={step.image.alt}
                  className="hiw-img"
                  width={step.image.width}
                  height={step.image.height}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>

            {/* Step metadata below */}
            <div className="hiw-mobile-card-body">
              <div className="hiw-mobile-num-line">
                <span className="hiw-step-num">{step.number}</span>
                <div className="hiw-mobile-divider" aria-hidden="true" />
              </div>
              <h3 className="hiw-step-title">{step.title}</h3>
              <p className="hiw-step-desc">{step.description}</p>

              {idx === 2 && (
                <button
                  type="button"
                  className={`hiw-speaker-btn ${speaking ? 'hiw-speaker-btn--active' : ''}`}
                  onClick={handleStepAudio}
                  aria-label="Listen to Malayalam pronunciation of Thank You"
                >
                  <Volume2 size={18} className={speaking ? 'lp-icon-pulse' : ''} />
                  <span>Hear "നന്ദി"</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
