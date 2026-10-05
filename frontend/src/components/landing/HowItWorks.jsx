import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HOW_IT_WORKS_STEPS } from '../../data/howItWorks.js';
import './HowItWorks.css';

export default function HowItWorks({ onToast }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // Active step index (0, 1, 2)
  const [activeStep, setActiveStep] = useState(0);

  // Line fill progress for steps [0..1, 0..1, 0..1]
  const [lineProgress, setLineProgress] = useState([0, 0, 0]);

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
                          src={step.image.fallback || step.image.png}
                          alt={step.image.alt}
                          className="hiw-img"
                          width={step.image.width}
                          height={step.image.height}
                          loading={step.image.loading || 'lazy'}
                          decoding="async"
                        />
                      </picture>

                      {/* Step 2 Real-Time Landmarks & Viewfinder Overlay */}
                      {idx === 1 && (
                        <div className="hiw-landmarks-overlay" aria-hidden="true">
                          {/* Corner bracket viewfinder */}
                          <div className="hiw-viewfinder-frame">
                            <span className="hiw-corner hiw-corner--tl" />
                            <span className="hiw-corner hiw-corner--tr" />
                            <span className="hiw-corner hiw-corner--bl" />
                            <span className="hiw-corner hiw-corner--br" />
                          </div>

                          {/* 21 MediaPipe Landmarks SVG */}
                          <svg className="hiw-landmarks-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {/* Palm connections */}
                            <path d="M 40,73 L 42,66 L 44,61 L 43,62 L 40,64 L 40,73 Z" className="hiw-landmark-bone" />
                            {/* Thumb (0->1->2->3->4) */}
                            <polyline points="40,73 47,70 51,64 52,59 51,57" className="hiw-landmark-bone" />
                            {/* Index finger forming the O loop with thumb (0->5->6->7->8) */}
                            <polyline points="42,66 45,59 47,56 49,56 50,57" className="hiw-landmark-bone" />
                            {/* Middle finger upright (0->9->10->11->12) */}
                            <polyline points="44,61 41,53 39,47 38,44" className="hiw-landmark-bone" />
                            {/* Ring finger upright (0->13->14->15->16) */}
                            <polyline points="43,62 36,54 34,49 33,46" className="hiw-landmark-bone" />
                            {/* Pinky finger upright (0->17->18->19->20) */}
                            <polyline points="40,64 32,58 29,54 28,52" className="hiw-landmark-bone" />

                            {/* 21 Landmark Joint Points */}
                            {/* Wrist */}
                            <circle cx="40" cy="73" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--wrist" />
                            {/* Thumb */}
                            <circle cx="47" cy="70" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="51" cy="64" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="52" cy="59" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="51" cy="57" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--tip" />
                            {/* Index */}
                            <circle cx="42" cy="66" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="45" cy="59" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="47" cy="56" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="49" cy="56" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="50" cy="57" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--tip" />
                            {/* Middle */}
                            <circle cx="44" cy="61" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="41" cy="53" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="39" cy="47" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="38" cy="44" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--tip" />
                            {/* Ring */}
                            <circle cx="43" cy="62" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="36" cy="54" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="34" cy="49" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="33" cy="46" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--tip" />
                            {/* Pinky */}
                            <circle cx="40" cy="64" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="32" cy="58" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="29" cy="54" r="1.1" className="hiw-landmark-dot" />
                            <circle cx="28" cy="52" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--tip" />
                          </svg>

                          {/* Tracking status badge */}
                          <div className="hiw-landmarks-pill">
                            <span className="hiw-pulse-dot" />
                            21 LANDMARKS · 30 FPS · CLIENT-SIDE
                          </div>
                        </div>
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
            {/* Image on top */}
            <div className="hiw-mobile-img-box">
              <picture>
                <source srcSet={step.image.webp} type="image/webp" />
                <img
                  src={step.image.fallback || step.image.png}
                  alt={step.image.alt}
                  className="hiw-img"
                  width={step.image.width}
                  height={step.image.height}
                  loading="lazy"
                  decoding="async"
                />
              </picture>

              {/* Step 2 Mobile Overlay */}
              {idx === 1 && (
                <div className="hiw-landmarks-overlay" aria-hidden="true">
                  <div className="hiw-viewfinder-frame">
                    <span className="hiw-corner hiw-corner--tl" />
                    <span className="hiw-corner hiw-corner--tr" />
                    <span className="hiw-corner hiw-corner--bl" />
                    <span className="hiw-corner hiw-corner--br" />
                  </div>
                  <svg className="hiw-landmarks-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 40,73 L 42,66 L 44,61 L 43,62 L 40,64 L 40,73 Z" className="hiw-landmark-bone" />
                    <polyline points="40,73 47,70 51,64 52,59 51,57" className="hiw-landmark-bone" />
                    <polyline points="42,66 45,59 47,56 49,56 50,57" className="hiw-landmark-bone" />
                    <polyline points="44,61 41,53 39,47 38,44" className="hiw-landmark-bone" />
                    <polyline points="43,62 36,54 34,49 33,46" className="hiw-landmark-bone" />
                    <polyline points="40,64 32,58 29,54 28,52" className="hiw-landmark-bone" />
                    <circle cx="40" cy="73" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--wrist" />
                    <circle cx="47" cy="70" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="51" cy="64" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="52" cy="59" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="51" cy="57" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--tip" />
                    <circle cx="42" cy="66" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="45" cy="59" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="47" cy="56" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="49" cy="56" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="50" cy="57" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--tip" />
                    <circle cx="44" cy="61" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="41" cy="53" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="39" cy="47" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="38" cy="44" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--tip" />
                    <circle cx="43" cy="62" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="36" cy="54" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="34" cy="49" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="33" cy="46" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--tip" />
                    <circle cx="40" cy="64" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="32" cy="58" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="29" cy="54" r="1.1" className="hiw-landmark-dot" />
                    <circle cx="28" cy="52" r="1.3" className="hiw-landmark-dot hiw-landmark-dot--tip" />
                  </svg>
                  <div className="hiw-landmarks-pill">
                    <span className="hiw-pulse-dot" />
                    21 LANDMARKS · 30 FPS · CLIENT-SIDE
                  </div>
                </div>
              )}
            </div>

            {/* Step metadata below */}
            <div className="hiw-mobile-card-body">
              <div className="hiw-mobile-num-line">
                <span className="hiw-step-num">{step.number}</span>
                <div className="hiw-mobile-divider" aria-hidden="true" />
              </div>
              <h3 className="hiw-step-title">{step.title}</h3>
              <p className="hiw-step-desc">{step.description}</p>


            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
