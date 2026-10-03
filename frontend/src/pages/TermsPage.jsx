import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck2, 
  AlertCircle, 
  Scale, 
  HelpCircle, 
  ShieldCheck,
  CheckCircle2,
  Ban
} from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';

export default function TermsPage() {
  React.useEffect(() => {
    document.title = 'Terms of Use – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'Plain-language terms of service and acceptable usage guidelines for MOVA.';
  }, []);

  return (
    <PageLayout
      title="Terms of Use"
      description="Clear, plain-language guidelines regarding acceptable use, safety boundaries, and assistive limitations."
    >
      <div className="pl-info-banner">
        <Scale className="pl-info-banner-icon" />
        <div>
          <p>
            <strong>Plain English Summary:</strong> MOVA is an academic assistive research prototype designed to facilitate communication and practice. Please read these brief points before relying on it for communication.
          </p>
        </div>
      </div>

      <div className="tm-sections-stack">
        <section className="tm-section-card">
          <div className="tm-section-header">
            <span className="tm-num">01</span>
            <h2>Nature of the Service</h2>
          </div>
          <p>
            MOVA operates as an experimental machine learning application. It translates recognized Indian Sign Language (ISL) hand configurations into Malayalam text and synthesized speech. It is provided free of charge for practice, research, and non-critical communication.
          </p>
        </section>

        <section className="tm-section-card tm-section-card--highlight">
          <div className="tm-section-header">
            <span className="tm-num">02</span>
            <h2>Critical Safety & Emergency Limitation</h2>
          </div>
          <p>
            <strong>MOVA must NEVER be relied upon during life-threatening emergency, high-risk medical, legal, or courtroom proceedings.</strong>
          </p>
          <p>
            Machine vision can misinterpret rapid hand movements due to camera obstruction or lighting changes. For formal or medical interactions, always engage a licensed human sign language interpreter. In case of emergency, contact national emergency services immediately.
          </p>
        </section>

        <section className="tm-section-card">
          <div className="tm-section-header">
            <span className="tm-num">03</span>
            <h2>Acceptable Usage</h2>
          </div>
          <div className="tm-rules-grid">
            <div className="tm-rule-item tm-rule-item--allowed">
              <CheckCircle2 size={18} className="tm-rule-icon" />
              <div>
                <strong>Allowed & Encouraged</strong>
                <p>Practicing sign language gestures, testing speech synthesis, educational classroom demonstrations, and academic evaluation.</p>
              </div>
            </div>
            <div className="tm-rule-item tm-rule-item--disallowed">
              <Ban size={18} className="tm-rule-icon" />
              <div>
                <strong>Prohibited</strong>
                <p>Automated scraping of services, reverse-engineering client security boundaries, or utilizing the interface to harass others.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="tm-section-card">
          <div className="tm-section-header">
            <span className="tm-num">04</span>
            <h2>No Warranty & Disclaimer</h2>
          </div>
          <p>
            MOVA is distributed "as is" without warranty of any kind, either express or implied, including fitness for a particular purpose or accuracy of continuous translation output.
          </p>
        </section>
      </div>

      <div className="tm-contact-bar">
        <div>
          <h3>Have questions regarding these terms?</h3>
          <p>We welcome queries from educators, students, and institutions.</p>
        </div>
        <Link to="/contact" className="tm-contact-btn">Contact Us →</Link>
      </div>

      <style>{`
        .tm-sections-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .tm-section-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.75rem 2rem;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
        }

        .tm-section-card--highlight {
          background: #FFFBEB;
          border-color: #FDE68A;
        }

        .tm-section-card--highlight p {
          color: #78350F;
        }

        .tm-section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .tm-num {
          font-size: 0.85rem;
          font-weight: 800;
          color: #1558E8;
          background: #EFF6FF;
          padding: 0.25rem 0.65rem;
          border-radius: 8px;
        }

        .tm-section-card--highlight .tm-num {
          color: #B45309;
          background: #FEF3C7;
        }

        .tm-section-card h2 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .tm-section-card p {
          font-size: 0.98rem;
          line-height: 1.65;
          margin: 0 0 0.85rem;
        }

        .tm-section-card p:last-child {
          margin-bottom: 0;
        }

        .tm-rules-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-top: 1rem;
        }

        .tm-rule-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          padding: 1.25rem;
          border-radius: 14px;
        }

        .tm-rule-item--allowed {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
        }

        .tm-rule-item--allowed .tm-rule-icon { color: #16A34A; }
        .tm-rule-item--allowed strong { color: #15803D; display: block; margin-bottom: 0.25rem; }
        .tm-rule-item--allowed p { color: #166534; font-size: 0.9rem; margin: 0; }

        .tm-rule-item--disallowed {
          background: #FEF2F2;
          border: 1px solid #FECACA;
        }

        .tm-rule-item--disallowed .tm-rule-icon { color: #DC2626; }
        .tm-rule-item--disallowed strong { color: #B91C1C; display: block; margin-bottom: 0.25rem; }
        .tm-rule-item--disallowed p { color: #991B1B; font-size: 0.9rem; margin: 0; }

        .tm-contact-bar {
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

        .tm-contact-bar h3 {
          margin: 0 0 0.35rem;
          font-size: 1.15rem;
          color: #0F172A;
        }

        .tm-contact-bar p {
          margin: 0;
          font-size: 0.92rem;
          color: #64748B;
        }

        .tm-contact-btn {
          font-size: 0.92rem;
          font-weight: 600;
          color: #1558E8;
          text-decoration: none;
        }

        .tm-contact-btn:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .tm-rules-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </PageLayout>
  );
}
