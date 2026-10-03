import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout.jsx';
import StartButton from '../components/StartButton.jsx';
import { SITE_INFO } from '../data/siteInfo.js';
import { TEAM_MEMBERS } from '../data/team.js';
import { ABOUT_TIMELINE, BUILT_WITH_CHIPS } from '../data/about.js';
import './AboutPage.css';

/**
 * AboutPage — Redesigned MOVA About Page
 * Full-width alternating bands, light theme, 6 distinct sections,
 * and custom SVG clipPath geometric cutouts for the team cards.
 */
export default function AboutPage() {
  const [teamHeroImgError, setTeamHeroImgError] = useState(false);
  const [timelineVisible, setTimelineVisible] = useState(false);
  const timelineRef = useRef(null);

  useEffect(() => {
    document.title = 'About MOVA — Sign Language to Malayalam Converter';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'About MOVA: A sign language to Malayalam converter, built at College of Engineering Thalassery.';
    }
  }, []);

  // Intersection observer for timeline line draw-in
  useEffect(() => {
    if (!timelineRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimelineVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(timelineRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <PageLayout fullWidth={true}>
      {/* ── Hidden Inline SVG with objectBoundingBox ClipPaths ─────────── */}
      <svg className="ab-svg-defs" aria-hidden="true" focusable="false">
        <defs>
          {/* 1. Stacked figure-eight shape with smooth concave side notches */}
          <clipPath id="shape-figure-eight" clipPathUnits="objectBoundingBox">
            <path d="M 0.25,0 C 0.75,0 1,0.05 1,0.22 C 1,0.38 0.78,0.44 0.72,0.5 C 0.78,0.56 1,0.62 1,0.78 C 1,0.95 0.75,1 0.25,1 C 0.1,1 0,0.95 0,0.78 C 0,0.62 0.22,0.56 0.28,0.5 C 0.22,0.44 0,0.38 0,0.22 C 0,0.05 0.1,0 0.25,0 Z" />
          </clipPath>

          {/* 2. Classical Arch: semicircular top, straight flat sides, softly rounded base */}
          <clipPath id="shape-arch" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.35 C 0,0.1 0.2,0 0.5,0 C 0.8,0 1,0.1 1,0.35 L 1,0.92 C 1,0.97 0.95,1 0.9,1 L 0.1,1 C 0.05,1 0,0.97 0,0.92 Z" />
          </clipPath>

          {/* 3. Tall Oval / Egg Arch */}
          <clipPath id="shape-oval-arch" clipPathUnits="objectBoundingBox">
            <path d="M 0.5,0 C 0.85,0 1,0.18 1,0.5 C 1,0.82 0.85,1 0.5,1 C 0.15,1 0,0.82 0,0.5 C 0,0.18 0.15,0 0.5,0 Z" />
          </clipPath>

          {/* 4. Triple-Lobe stacked geometric silhouette */}
          <clipPath id="shape-triple-lobe" clipPathUnits="objectBoundingBox">
            <path d="M 0.25,0 C 0.75,0 1,0.04 1,0.16 C 1,0.28 0.82,0.31 0.76,0.34 C 0.82,0.37 1,0.40 1,0.50 C 1,0.60 0.82,0.63 0.76,0.66 C 0.82,0.69 1,0.72 1,0.84 C 1,0.96 0.75,1 0.25,1 C 0.08,1 0,0.96 0,0.84 C 0,0.72 0.18,0.69 0.24,0.66 C 0.18,0.63 0,0.60 0,0.50 C 0,0.40 0.18,0.37 0.24,0.34 C 0.18,0.31 0,0.28 0,0.16 C 0,0.04 0.08,0 0.25,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="ab-fullwidth-wrapper">
        {/* ── SECTION 1: HERO ────────────────────────────────────────── */}
        <section className="ab-band ab-band--white ab-hero-section" aria-label="Hero section">
          <div className="ab-container">
            <div className="ab-hero-header">
              <span className="ab-pill">ABOUT</span>
              <h1 className="ab-hero-headline">About MOVA</h1>
              <p className="ab-hero-subline">
                A sign language to Malayalam converter, built at {SITE_INFO.college}.
              </p>
            </div>

            {/* 21:9 full-bleed team photo frame */}
            <div className="ab-team-hero-media" aria-label="Team photo" role="img">
              {!teamHeroImgError ? (
                <img
                  src="/images/about/team.webp"
                  alt="MOVA Team at College of Engineering Thalassery"
                  className="ab-team-hero-img"
                  width="1320"
                  height="565"
                  onError={() => setTeamHeroImgError(true)}
                />
              ) : (
                /* Clean neutral placeholder with label (TODO-REAL-PHOTO) */
                <div className="ab-hero-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <span className="ab-hero-placeholder-label">Team photo</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SECTION 2: STORY TIMELINE ──────────────────────────────── */}
        <section className="ab-band ab-band--tint ab-story-section" aria-label="Our story" ref={timelineRef}>
          <div className="ab-container">
            <div className="ab-section-eyebrow">
              <span className="ab-pill">OUR JOURNEY</span>
              <h2 className="ab-section-title">How MOVA came to life</h2>
            </div>

            <div className="ab-timeline-track">
              {/* Animated connector line */}
              <div
                className="ab-timeline-line"
                style={{
                  transform: timelineVisible ? 'scaleX(1)' : 'scaleX(0)'
                }}
                aria-hidden="true"
              />

              {ABOUT_TIMELINE.map((item, idx) => (
                <div
                  key={idx}
                  className="ab-timeline-step"
                  style={{
                    opacity: timelineVisible ? 1 : 0,
                    transform: timelineVisible ? 'translateY(0)' : 'translateY(16px)',
                    transitionDelay: `${idx * 120}ms`
                  }}
                >
                  <div className="ab-step-dot" aria-hidden="true">
                    <div className="ab-step-dot-inner" />
                  </div>
                  <div className="ab-step-content">
                    <div className="ab-step-num">{item.label}</div>
                    <h3 className="ab-step-title">{item.title}</h3>
                    <p className="ab-step-desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: BUILT WITH ──────────────────────────────────── */}
        <section className="ab-band ab-band--white ab-built-section" aria-label="Technologies used">
          <div className="ab-container">
            <div className="ab-chips-row" role="list">
              {BUILT_WITH_CHIPS.map((chip, idx) => (
                <div key={idx} className="ab-chip" role="listitem">
                  {chip}
                </div>
              ))}
            </div>
            <p className="ab-built-author">
              The website and the AI were built by <strong>Hashir</strong>.
            </p>
          </div>
        </section>

        {/* ── SECTION 4: WHAT MOVA IS NOT ────────────────────────────── */}
        <section className="ab-band ab-band--soft-blue ab-disclaimer-band" aria-label="Important limitation note">
          <div className="ab-container">
            <div className="ab-disclaimer-box">
              <p className="ab-disclaimer-text">
                MOVA is a communication aid. It is not a replacement for a sign language interpreter or for emergency services. It knows a limited set of signs and it will sometimes get one wrong.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: TEAM (LIGHT THEME + SHAPE CUTOUTS) ──────────── */}
        <section className="ab-band ab-band--tint ab-team-section" aria-label="Team members">
          <div className="ab-container">
            <div className="ab-team-header">
              <span className="ab-pill">TEAM</span>
              <h2 className="ab-section-title">The people behind MOVA.</h2>
            </div>

            <div className="ab-team-grid">
              {TEAM_MEMBERS.map((member, idx) => {
                const shapeClipClass = `tm-clip--${member.shape}`;
                const toneClass = `tm-tone--${member.tone}`;

                return (
                  <div key={idx} className="tm-card" tabIndex={0} aria-label={`${member.name}${member.role ? `, ${member.role}` : ''}`}>
                    {/* Outer wrapper provides drop-shadow outside the clipped SVG */}
                    <div className="tm-shape-wrapper">
                      {/* Inner element is clipped via SVG clipPath */}
                      <div className={`tm-shape-container ${shapeClipClass} ${toneClass}`}>
                        {member.cutout ? (
                          <img
                            src={member.cutout}
                            alt={member.name}
                            className="tm-photo-img"
                            loading="lazy"
                            width="220"
                            height="293"
                          />
                        ) : member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="tm-photo-img"
                            loading="lazy"
                            width="220"
                            height="293"
                            onError={(e) => {
                              // Fallback to initials if photo path is not yet present
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const span = document.createElement('span');
                                span.className = 'tm-initials';
                                span.textContent = member.initials;
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span className="tm-initials" aria-hidden="true">
                            {member.initials}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="tm-details">
                      <h3 className="tm-name">{member.name}</h3>
                      {member.role ? (
                        <p className="tm-role">{member.role}</p>
                      ) : (
                        <p className="tm-role" aria-hidden="true">&nbsp;</p>
                      )}

                      <div className="tm-links">
                        {member.linkedin ? (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tm-icon-link"
                            aria-label={`${member.name} on LinkedIn`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.5a1.63 1.63 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63A1.63 1.63 0 0 0 7.86 6.5Z"/>
                            </svg>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 6: CLOSING ─────────────────────────────────────── */}
        <section className="ab-band ab-band--white ab-closing-section" aria-label="Closing notes">
          <div className="ab-container">
            <div className="ab-closing-box">
              <p className="ab-closing-line">
                Thank you to the CS Association for hosting Innov8, to the friend who recorded the signs with us, and to our team.
              </p>
              <div className="ab-btn-row">
                <Link to="/contact" className="ab-contact-btn">
                  Contact us
                </Link>
                <StartButton />
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
