import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';
import StartButton from '../components/StartButton.jsx';
import { SITE_INFO } from '../data/siteInfo.js';
import { SIGNS } from '../data/signs.js';

// Team members mapping with photos and geometric background styles matching reference design
const TEAM_MEMBERS = [
  {
    name: SITE_INFO.team[0], // Hashir Muhiyudheen Konnola
    role: "Tech Lead & AI Developer",
    image: "/images/team/hashir.jpg",
    shapeClass: "tm-shape--clover",
    linkedin: SITE_INFO.linkedin,
    website: "https://mova.app"
  },
  {
    name: SITE_INFO.team[1], // Mohamed Resin Kizhapat
    role: "Computer Science Student",
    image: "/images/team/resin.jpg",
    shapeClass: "tm-shape--arch",
    linkedin: SITE_INFO.linkedin,
    website: "https://mova.app"
  },
  {
    name: SITE_INFO.team[2], // Ashiqa Asharaf P K
    role: "Computer Science Student",
    image: "/images/team/ashiqa.jpg",
    shapeClass: "tm-shape--arch-wide",
    linkedin: SITE_INFO.linkedin,
    website: "https://mova.app"
  },
  {
    name: SITE_INFO.team[3], // Aaditya Pramod V
    role: "Computer Science Student",
    image: "/images/team/aaditya.jpg",
    shapeClass: "tm-shape--scallop",
    linkedin: SITE_INFO.linkedin,
    website: "https://mova.app"
  }
];

export default function AboutPage() {
  React.useEffect(() => {
    document.title = 'About MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'A sign language to Malayalam converter, built at College of Engineering Thalassery.';
    }
  }, []);

  const signCount = SIGNS && SIGNS.length ? SIGNS.length : null;

  return (
    <PageLayout
      title="About MOVA"
      description={`A sign language to Malayalam converter, built at ${SITE_INFO.college}.`}
    >
      {/* Dev-only note */}
      {import.meta.env.DEV && (
        <div className="pl-dev-banner" role="status">
          <strong>Dev note:</strong> Team photo placeholder at <code>/public/images/about/team.webp</code>. AI generated team avatars loaded from <code>/public/images/team/</code>.
        </div>
      )}

      {/* Hero image placeholder — 16:9 neutral frame for Innov8 team photo */}
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

      {/* ── REFERENCE DESIGN TEAM SHOWCASE SECTION ── */}
      <section className="ab-team-showcase" aria-label="Team Members">
        <div className="ab-team-showcase-badge">Team</div>
        <h2 className="ab-team-showcase-title">
          Meet the creative minds<br />behind our success
        </h2>

        <div className="ab-team-grid">
          {TEAM_MEMBERS.map((member, idx) => (
            <div key={idx} className="tm-card" tabIndex={0}>
              <div className="tm-portrait-wrap">
                {/* Custom geometric shape backdrop */}
                <div className={`tm-shape-bg ${member.shapeClass}`} />
                {/* Portrait with hover black & white transition */}
                <img
                  src={member.image}
                  alt={member.name}
                  className="tm-portrait-img"
                  loading="lazy"
                />
              </div>

              <div className="tm-details">
                <h3 className="tm-name">{member.name}</h3>
                <p className="tm-role">{member.role}</p>

                <div className="tm-links">
                  {member.website && (
                    <a
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tm-icon-link"
                      aria-label={`${member.name} website`}
                    >
                      <Globe size={16} />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tm-icon-link"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.5a1.63 1.63 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63A1.63 1.63 0 0 0 7.86 6.5Z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
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

        /* ── REFERENCE DESIGN TEAM SHOWCASE ── */
        .ab-team-showcase {
          background: #0B0F19;
          border-radius: 28px;
          padding: 4.5rem 2.5rem 4rem;
          margin: 3.5rem -2.5rem;
          text-align: center;
          color: #FFFFFF;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
        }

        .ab-team-showcase-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #E2E8F0;
          padding: 0.35rem 0.95rem;
          border-radius: 9999px;
          margin-bottom: 1.25rem;
        }

        .ab-team-showcase-title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.2;
          letter-spacing: -0.03em;
          margin: 0 0 3.5rem;
        }

        .ab-team-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          align-items: start;
        }

        .tm-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          outline: none;
          cursor: pointer;
        }

        .tm-portrait-wrap {
          position: relative;
          width: 100%;
          max-width: 175px;
          aspect-ratio: 1 / 1.15;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        /* Distinct organic background shapes */
        .tm-shape-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tm-shape--clover {
          background: #4F46E5; /* Vibrant indigo */
          border-radius: 36px 36px 28px 28px;
          clip-path: inset(0 round 40px 40px 30px 30px);
        }

        .tm-shape--arch {
          background: #F97316; /* Warm energetic orange */
          border-radius: 90px 90px 24px 24px;
        }

        .tm-shape--arch-wide {
          background: #EAB308; /* Radiant yellow */
          border-radius: 9999px 9999px 24px 24px;
        }

        .tm-shape--scallop {
          background: #38BDF8; /* Sky cyan */
          border-radius: 32px;
        }

        /* Portrait Image with B&W Hover Filter */
        .tm-portrait-img {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: inherit;
          filter: grayscale(0%);
          transition: filter 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Hover & Focus state: Turns Black and White! */
        .tm-card:hover .tm-portrait-img,
        .tm-card:focus-visible .tm-portrait-img {
          filter: grayscale(100%) contrast(108%);
          transform: translateY(-4px) scale(1.02);
        }

        .tm-card:hover .tm-shape-bg,
        .tm-card:focus-visible .tm-shape-bg {
          transform: scale(1.03);
        }

        .tm-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
        }

        .tm-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          letter-spacing: -0.015em;
        }

        .tm-role {
          font-size: 0.85rem;
          color: #94A3B8;
          margin: 0 0 0.5rem;
        }

        .tm-links {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .tm-icon-link {
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease, transform 0.15s ease;
          padding: 0.25rem;
        }

        .tm-icon-link:hover {
          color: #FFFFFF;
          transform: translateY(-1px);
        }

        /* Closing and buttons */
        .ab-closing-line {
          font-size: 1.125rem;
          line-height: 1.7;
          color: #4A5468 !important;
          margin: 2.5rem 0 2rem !important;
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

        @media (max-width: 900px) {
          .ab-team-showcase {
            margin: 2.5rem -1.25rem;
            padding: 3.5rem 1.5rem;
          }
          .ab-team-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.25rem 1.5rem;
          }
          .tm-portrait-wrap {
            max-width: 155px;
          }
        }

        @media (max-width: 540px) {
          .ab-team-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .tm-portrait-wrap {
            max-width: 175px;
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
