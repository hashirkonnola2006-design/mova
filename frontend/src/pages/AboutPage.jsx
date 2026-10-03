import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout.jsx';
import StartButton from '../components/StartButton.jsx';
import { SITE_INFO } from '../data/siteInfo.js';
import { SIGNS } from '../data/signs.js';

export default function AboutPage() {
  React.useEffect(() => {
    document.title = 'About MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'A sign language to Malayalam converter, built at College of Engineering Thalassery.';
    }
  }, []);

  // Compute {N} from real vocabulary data (SIGNS list)
  const signCount = SIGNS && SIGNS.length ? SIGNS.length : null;

  return (
    <PageLayout
      title="About MOVA"
      description={`A sign language to Malayalam converter, built at ${SITE_INFO.college}.`}
    >
      {/* Dev-only note: never rendered in production */}
      {import.meta.env.DEV && (
        <div className="pl-dev-banner" role="status">
          <strong>Dev note:</strong> Team photo goes at <code>/public/images/about/team.webp</code>, Hashir photo at <code>/public/images/about/hashir.webp</code>.
        </div>
      )}

      {/* Hero image placeholder — 16:9 neutral frame for Innov8 team photo */}
      {/* TODO-REAL-PHOTO: team at Innov8, path: /public/images/about/team.webp */}
      <div className="ab-hero-frame" aria-label="Team photo placeholder" role="img">
        <div className="ab-hero-frame-inner">
          <svg className="ab-photo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span className="ab-frame-label">Team photo</span>
        </div>
      </div>

      {/* Section: How it started */}
      <section className="ab-section">
        <h2>How it started</h2>
        <p>
          MOVA began at Innov8 Season 3, a hackathon organised by the CS Association of College of Engineering Thalassery. The theme was “Code 4 Change”. We came second.
        </p>
        <p>
          Our team got stuck at first. Then we landed on one idea: a sign language to Malayalam converter. We called it MOVA.
        </p>
      </section>

      {/* Section: How we built it */}
      <section className="ab-section">
        <h2>How we built it</h2>
        <p>
          The website and the AI were built by Hashir. The model was trained with Python and PyTorch, on a dataset from AI4Bharat on Hugging Face plus signs our own team recorded.
        </p>
        <p>
          {signCount ? (
            `The very first version learned from about 50 videos for just 3 words. It was a small number, but it worked. Today MOVA knows ${signCount} signs, and the list keeps growing.`
          ) : (
            'The very first version learned from about 50 videos for just 3 words. It was a small number, but it worked.'
          )}
        </p>
      </section>

      {/* Section: What MOVA is not */}
      <section className="ab-section">
        <h2>What MOVA is not</h2>
        <p>
          MOVA is a communication aid. It is not a replacement for a sign language interpreter or for emergency services. It knows a small number of signs and it will sometimes get one wrong.
        </p>
      </section>

      {/* Section: What's next */}
      <section className="ab-section">
        <h2>What's next</h2>
        <p>
          More words. And, eventually, a Google Meet extension so MOVA can work in real conversations.
        </p>
      </section>

      {/* Section: The team */}
      <section className="ab-section">
        <h2>The team</h2>
        <div className="ab-team-list">
          {/* Hashir with photo placeholder / initials fallback, role, and LinkedIn */}
          <div className="ab-team-card ab-team-card--lead">
            <div className="ab-avatar-wrap">
              {/* TODO-REAL-PHOTO: Hashir at /public/images/about/hashir.webp */}
              <div className="ab-avatar-fallback" aria-hidden="true">
                HMK
              </div>
            </div>
            <div className="ab-team-info">
              <div className="ab-team-name-row">
                <span className="ab-team-name">{SITE_INFO.team[0]}</span>
                {SITE_INFO.linkedin && (
                  <a
                    href={SITE_INFO.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ab-linkedin-link"
                    aria-label={`${SITE_INFO.team[0]} on LinkedIn (opens in new tab)`}
                  >
                    LinkedIn
                  </a>
                )}
              </div>
              <p className="ab-team-role">{SITE_INFO.role}</p>
            </div>
          </div>

          {/* Remaining 3 team members (names only, no invented roles) */}
          <div className="ab-team-sublist">
            {SITE_INFO.team.slice(1).map((memberName, idx) => (
              <div key={idx} className="ab-team-member-item">
                <span className="ab-member-dot" aria-hidden="true" />
                <span className="ab-member-name">{memberName}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="ab-closing-line">
        Thank you to the CS Association for hosting Innov8, to the friend who recorded the signs with us, and to our team.
      </p>

      {/* Action buttons */}
      <div className="ab-btn-row">
        <Link to="/contact" className="ab-contact-btn">
          Contact us
        </Link>
        <StartButton className="ab-start-btn" />
      </div>

      <style>{`
        /* 16:9 clean neutral frame placeholder */
        .ab-hero-frame {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #F8FAFC;
          border: 1.5px dashed #CBD5E1;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2.75rem;
          color: #64748B;
        }

        .ab-hero-frame-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .ab-photo-icon {
          color: #94A3B8;
        }

        .ab-frame-label {
          font-size: 0.95rem;
          font-weight: 500;
          color: #64748B;
        }

        .ab-section {
          margin-bottom: 2rem;
        }

        .ab-section h2 {
          font-size: 1.45rem;
          font-weight: 700;
          color: #0B1020;
          margin: 0 0 0.85rem;
          letter-spacing: -0.02em;
        }

        .ab-section p {
          font-size: 1.125rem;
          line-height: 1.7;
          color: #0B1020;
          margin: 0 0 1.15rem;
        }

        .ab-section p:last-child {
          margin-bottom: 0;
        }

        /* Team styling */
        .ab-team-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 1rem;
        }

        .ab-team-card--lead {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: #F8FAFC;
          border: 1px solid #E8EDF5;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
        }

        .ab-avatar-wrap {
          flex-shrink: 0;
        }

        .ab-avatar-fallback {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #E8EDF5;
          color: #1558E8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.05em;
        }

        .ab-team-info {
          flex: 1;
        }

        .ab-team-name-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
          margin-bottom: 0.25rem;
        }

        .ab-team-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0B1020;
        }

        .ab-linkedin-link {
          font-size: 0.88rem;
          font-weight: 600;
          color: #1558E8 !important;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .ab-linkedin-link:hover {
          color: #1048C6 !important;
        }

        .ab-team-role {
          font-size: 0.95rem !important;
          color: #4A5468 !important;
          line-height: 1.5 !important;
          margin: 0 !important;
        }

        .ab-team-sublist {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .ab-team-member-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: #FFFFFF;
          border: 1px solid #E8EDF5;
          border-radius: 12px;
          padding: 0.85rem 1.1rem;
        }

        .ab-member-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1558E8;
          flex-shrink: 0;
        }

        .ab-member-name {
          font-size: 1rem;
          font-weight: 600;
          color: #0B1020;
        }

        .ab-closing-line {
          font-size: 1.125rem;
          line-height: 1.7;
          color: #4A5468 !important;
          margin: 2rem 0 2.25rem !important;
        }

        .ab-btn-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .ab-contact-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.6rem;
          border-radius: 10px;
          border: 1.5px solid #CBD5E1;
          background: #FFFFFF;
          color: #0B1020 !important;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none !important;
          min-height: 44px;
          transition: all 0.15s ease;
        }

        .ab-contact-btn:hover {
          background: #F8FAFC;
          border-color: #94A3B8;
        }

        .ab-contact-btn:focus-visible {
          outline: 2px solid #1558E8;
          outline-offset: 2px;
        }

        @media (max-width: 640px) {
          .ab-team-card--lead {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .ab-btn-row {
            flex-direction: column;
            align-items: stretch;
          }
          .ab-contact-btn {
            width: 100%;
          }
        }
      `}</style>
    </PageLayout>
  );
}
