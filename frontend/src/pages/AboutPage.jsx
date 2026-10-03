import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  Target, 
  AlertTriangle, 
  Cpu, 
  GraduationCap, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';
import { SIGNS, ACTIVE_SIGN_KEYS } from '../data/signs.js';

export default function AboutPage() {
  React.useEffect(() => {
    document.title = 'About MOVA – AI Sign Language Interpreter';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'MOVA is an accessible assistive tool bridging Indian Sign Language and Malayalam using browser-based AI vision.';
  }, []);

  return (
    <PageLayout
      title="About MOVA"
      description="Bridging Indian Sign Language (ISL) and Malayalam through accessible, privacy-focused machine perception."
    >
      {/* Lead Vision Card */}
      <div className="ab-hero-card">
        <div className="ab-hero-badge">
          <HeartHandshake size={16} /> Accessible Assistive Tech
        </div>
        <h2 className="ab-hero-title">Empowering bidirectional conversations in native languages.</h2>
        <p className="ab-hero-lead">
          MOVA was created to dismantle daily communication barriers between the Deaf/Hard-of-Hearing community 
          in Kerala and non-signers. By transforming Indian Sign Language gestures into instant Malayalam text 
          and synthesized speech, we strive to make public interactions, education, and daily life universally accessible.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="ab-pillars-grid">
        <div className="ab-pillar-card">
          <div className="ab-pillar-icon ab-pillar-icon--blue">
            <Cpu size={24} />
          </div>
          <h3>Edge Computing</h3>
          <p>
            MediaPipe hand tracking and landmark extraction run directly inside your client browser, 
            ensuring real-time response times with zero cloud video uploads.
          </p>
        </div>

        <div className="ab-pillar-card">
          <div className="ab-pillar-icon ab-pillar-icon--green">
            <Target size={24} />
          </div>
          <h3>Native Malayalam</h3>
          <p>
            Rather than generic English-only pipelines, MOVA focuses on natural Malayalam vocabulary, 
            regional phrasing, and realistic conversational nuances.
          </p>
        </div>

        <div className="ab-pillar-card">
          <div className="ab-pillar-icon ab-pillar-icon--purple">
            <GraduationCap size={24} />
          </div>
          <h3>Academic Research</h3>
          <p>
            Engineered at College of Engineering & Technology (CET) Thalassery as a focused final-year 
            engineering initiative to pioneer localized assistive AI solutions.
          </p>
        </div>
      </div>

      <hr />

      {/* Scope and Non-Scope Comparison */}
      <h2 className="ab-section-heading">Project Scope & Guidelines</h2>
      <div className="ab-scope-comparison">
        <div className="ab-scope-box ab-scope-box--positive">
          <div className="ab-scope-header">
            <span className="ab-scope-tag ab-scope-tag--positive">✓ What MOVA is</span>
          </div>
          <ul className="ab-scope-list">
            <li>An intuitive assistive communication companion running locally in any modern browser.</li>
            <li>A self-paced practice and dictionary tool for students learning Indian Sign Language.</li>
            <li>A working prototype advancing multilingual accessibility research for Kerala.</li>
          </ul>
        </div>

        <div className="ab-scope-box ab-scope-box--caution">
          <div className="ab-scope-header">
            <span className="ab-scope-tag ab-scope-tag--caution">⚠ What MOVA is not</span>
          </div>
          <ul className="ab-scope-list">
            <li><strong>Not a certified legal or medical interpreter:</strong> Formal legal and medical contexts require licensed professional human interpreters.</li>
            <li><strong>Not a standalone emergency responder:</strong> In emergencies, always reach out to police (112) or medical dispatch directly.</li>
            <li><strong>Not an exhaustive dialect encyclopedia:</strong> Regional variations exist across Kerala and India.</li>
          </ul>
        </div>
      </div>

      <hr />

      {/* Model Status & Stats */}
      <div className="ab-stats-banner">
        <div className="ab-stat-item">
          <span className="ab-stat-num">{SIGNS.length}</span>
          <span className="ab-stat-label">Total Vocabulary Signs</span>
        </div>
        <div className="ab-stat-divider" />
        <div className="ab-stat-item">
          <span className="ab-stat-num">{ACTIVE_SIGN_KEYS.length}</span>
          <span className="ab-stat-label">Active Real-Time Signs</span>
        </div>
        <div className="ab-stat-divider" />
        <div className="ab-stat-item">
          <span className="ab-stat-num">0 ms</span>
          <span className="ab-stat-label">Cloud Video Lag (Local AI)</span>
        </div>
      </div>

      {/* Explore callout */}
      <div className="ab-explore-bar">
        <div>
          <h3>Interested in seeing the gesture dataset?</h3>
          <p>Browse our vocabulary cards and listen to accurate Malayalam pronunciations.</p>
        </div>
        <Link to="/supported-signs" className="ab-explore-btn">
          View Supported Signs <ArrowRight size={16} />
        </Link>
      </div>

      <style>{`
        .ab-hero-card {
          background: linear-gradient(135deg, #F0F5FF 0%, #FAFCFF 100%);
          border: 1px solid #D8E5FD;
          border-radius: 24px;
          padding: 2.75rem 2.25rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 4px 20px rgba(21, 88, 232, 0.05);
        }

        .ab-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #DBEAFE;
          color: #1558E8;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          margin-bottom: 1.25rem;
          letter-spacing: 0.02em;
        }

        .ab-hero-title {
          font-size: clamp(1.5rem, 3vw, 2.1rem);
          font-weight: 800;
          color: #0B1020;
          line-height: 1.25;
          letter-spacing: -0.03em;
          margin: 0 0 1rem;
        }

        .ab-hero-lead {
          font-size: 1.12rem;
          line-height: 1.7;
          color: #334155;
          margin: 0;
        }

        .ab-pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .ab-pillar-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 20px;
          padding: 1.75rem 1.5rem;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .ab-pillar-card:hover {
          transform: translateY(-2px);
          border-color: #CBD5E1;
        }

        .ab-pillar-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .ab-pillar-icon--blue { background: #EFF6FF; color: #1558E8; }
        .ab-pillar-icon--green { background: #ECFDF5; color: #059669; }
        .ab-pillar-icon--purple { background: #F5F3FF; color: #7C3AED; }

        .ab-pillar-card h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 0.5rem;
        }

        .ab-pillar-card p {
          font-size: 0.95rem;
          color: #64748B;
          line-height: 1.6;
          margin: 0;
        }

        .ab-section-heading {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 1.25rem;
          letter-spacing: -0.02em;
        }

        .ab-scope-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .ab-scope-box {
          border-radius: 18px;
          padding: 1.75rem 1.5rem;
          border: 1.5px solid transparent;
        }

        .ab-scope-box--positive {
          background: #F8FAFC;
          border-color: #E2E8F0;
        }

        .ab-scope-box--caution {
          background: #FFFBEB;
          border-color: #FDE68A;
        }

        .ab-scope-tag {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ab-scope-tag--positive { background: #E2E8F0; color: #334155; }
        .ab-scope-tag--caution { background: #FEF3C7; color: #92400E; }

        .ab-scope-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          font-size: 0.96rem;
          color: #334155;
          line-height: 1.55;
        }

        .ab-scope-list li strong {
          color: #0F172A;
        }

        .ab-stats-banner {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: #0B1020;
          color: #FFFFFF;
          border-radius: 22px;
          padding: 2.25rem 1.5rem;
          margin: 2.5rem 0;
        }

        .ab-stat-item {
          text-align: center;
        }

        .ab-stat-num {
          display: block;
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 800;
          color: #38BDF8;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }

        .ab-stat-label {
          font-size: 0.85rem;
          color: #94A3B8;
          font-weight: 500;
        }

        .ab-stat-divider {
          width: 1px;
          height: 48px;
          background: rgba(255, 255, 255, 0.12);
        }

        .ab-explore-bar {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.75rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .ab-explore-bar h3 {
          margin: 0 0 0.35rem;
          font-size: 1.15rem;
          color: #0F172A;
        }

        .ab-explore-bar p {
          margin: 0;
          font-size: 0.92rem;
          color: #64748B;
        }

        .ab-explore-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #1558E8;
          color: #FFFFFF !important;
          text-decoration: none !important;
          padding: 0.7rem 1.35rem;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(21, 88, 232, 0.2);
          transition: all 0.2s ease;
        }

        .ab-explore-btn:hover {
          background: #1048C6;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .ab-scope-comparison {
            grid-template-columns: 1fr;
          }
          .ab-stats-banner {
            flex-direction: column;
            gap: 1.5rem;
          }
          .ab-stat-divider {
            display: none;
          }
        }
      `}</style>
    </PageLayout>
  );
}
