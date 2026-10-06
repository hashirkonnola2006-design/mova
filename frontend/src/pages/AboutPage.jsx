import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout.jsx';
import StartButton from '../components/StartButton.jsx';
import { TEAM_MEMBERS } from '../data/team.js';
import LogoMarquee from '../components/ui/LogoMarquee.jsx';
import { TECH_STACK_ITEMS } from '../data/techStack.js';
import './AboutPage.css';

/**
 * AboutPage — MOVA About Page
 * Full-width alternating bands, light theme, mission statement,
 * tech stack, team cards, and closing CTA.
 */
export default function AboutPage() {
  useEffect(() => {
    document.title = 'About MOVA — Sign Language to Malayalam Converter';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'About MOVA: A sign language to Malayalam converter, built to make everyday communication more accessible.';
    }
  }, []);

  return (
    <PageLayout fullWidth={true}>

      <div className="ab-fullwidth-wrapper">
        {/* ── SECTION 1: HERO ────────────────────────────────────────── */}
        <section className="ab-band ab-band--white ab-hero-section" aria-label="Hero section">
          <div className="ab-container">
            <div className="ab-hero-header">
              <span className="ab-pill">ABOUT</span>
              <h1 className="ab-hero-headline">About MOVA</h1>
              <p className="ab-hero-subline">
                A sign language to Malayalam converter, built to make everyday communication more accessible.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: WHY WE BUILT MOVA (OUR MISSION) ─────────────── */}
        <section className="ab-band ab-band--tint ab-mission-section" aria-label="Our mission">
          <div className="ab-container">
            <div className="ab-mission-content">
              <span className="ab-pill">OUR MISSION</span>
              <h2 className="ab-section-title">Technology that helps people be understood.</h2>
              <p className="ab-mission-paragraph">
                Many people in the deaf and hard-of-hearing community still struggle to communicate in everyday situations, because most people around them don't know sign language. MOVA exists to close that gap. It translates Indian Sign Language into Malayalam in real time, using only a browser camera, so that communication doesn't depend on who happens to be in the room.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: TECH STACK (INFINITE LOGO MARQUEE) ───────── */}
        <section className="ab-band ab-band--white ab-built-section" aria-label="Technologies used">
          <div className="ab-container">
            <div className="ab-tech-header">
              <span className="ab-pill">TECH STACK</span>
              <h2 className="ab-section-title">Built with modern tools.</h2>
            </div>
            <LogoMarquee items={TECH_STACK_ITEMS} speed={36} gap={32} />
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

        {/* ── SECTION 5: TEAM ───────────────────────────────────────── */}
        <section className="ab-band ab-team-section" aria-label="Team members">
          <div className="ab-container ab-container--team">
            <div className="ab-team-header">
              <span className="ab-pill ab-team-pill">TEAM</span>
              <h2 className="ab-team-headline">Meet the creative minds behind our success</h2>
              <p className="ab-team-subline">
                The team building real-time Indian Sign Language to Malayalam communication.
              </p>
            </div>

            <div className="ab-team-grid">
              {TEAM_MEMBERS.map((member) => {
                const shapeClass = `tm-shape--${member.shape}`;
                const toneClass = `tm-tone--${member.tone}`;

                return (
                  <div
                    key={member.id || member.name}
                    className="tm-card"
                    tabIndex={0}
                    aria-label={`${member.name}${member.role ? `, ${member.role}` : ''}`}
                  >
                    <div className="tm-shape-wrapper">
                      {/* Geometric Backdrop Shape */}
                      <div
                        className={`tm-shape-backdrop ${shapeClass} ${toneClass}`}
                        aria-hidden="true"
                      />

                      {/* Cutout portrait with hover black & white */}
                      {member.cutout || member.photo ? (
                        <picture className="tm-picture">
                          {member.photo && <source srcSet={member.photo} type="image/webp" />}
                          <img
                            src={member.cutout || member.photo}
                            alt={member.name}
                            className="tm-photo-img"
                            loading="lazy"
                            width="600"
                            height="750"
                          />
                        </picture>
                      ) : (
                        <span className="tm-initials" aria-hidden="true">
                          {member.initials}
                        </span>
                      )}
                    </div>

                    <div className="tm-details">
                      <h3 className="tm-name">{member.name}</h3>
                      {member.role ? (
                        <p className="tm-role">{member.role}</p>
                      ) : (
                        <p className="tm-role" aria-hidden="true">&nbsp;</p>
                      )}

                      <div className="tm-links">
                        {(member.github || (member.website && member.website.includes('github.com'))) ? (
                          <a
                            href={member.github || member.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tm-icon-link tm-icon-link--github"
                            aria-label={`${member.name} on GitHub`}
                            title="GitHub"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
                            </svg>
                          </a>
                        ) : member.website ? (
                          <a
                            href={member.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tm-icon-link tm-icon-link--website"
                            aria-label={`${member.name}'s Website / Project`}
                            title="Website"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                          </a>
                        ) : null}

                        {member.linkedin ? (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tm-icon-link tm-icon-link--linkedin"
                            aria-label={`${member.name} on LinkedIn`}
                            title="LinkedIn"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.5a1.63 1.63 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63A1.63 1.63 0 0 0 7.86 6.5Z"/>
                            </svg>
                          </a>
                        ) : null}

                        {member.email ? (
                          <a
                            href={`mailto:${member.email}`}
                            className="tm-icon-link tm-icon-link--email"
                            aria-label={`Email ${member.name}`}
                            title={`Email (${member.email})`}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
                Thank you to everyone who contributed signs, feedback, and time to MOVA. We're just getting started.
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
