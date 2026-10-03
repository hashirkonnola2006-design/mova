import React, { useState } from 'react';
import PageLayout from '../components/PageLayout.jsx';
import InquiryForm from '../components/InquiryForm.jsx';
import { SITE_INFO } from '../data/siteInfo.js';

export default function ContactPage() {
  React.useEffect(() => {
    document.title = 'Contact & Feedback – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'Report a bug, suggest a sign, or just say hello.';
    }
  }, []);

  const [copied, setCopied] = useState(false);

  // Copy email helper
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE_INFO.contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <PageLayout
      title="Contact & Feedback"
      description="Report a bug, suggest a sign, or just say hello."
    >
      {/* Top row of two large tappable contact cards */}
      <div className="ct-cards-row" role="region" aria-label="Direct contact options">
        {/* Card 1: Email */}
        <div className="ct-contact-card">
          <div className="ct-card-head">
            <svg className="ct-card-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="ct-card-label">Email</span>
          </div>
          <div className="ct-card-value-wrap">
            <a
              href={`mailto:${SITE_INFO.contactEmail}`}
              className="ct-card-link"
              aria-label={`Send email to ${SITE_INFO.contactEmail}`}
            >
              {SITE_INFO.contactEmail}
            </a>
            <button
              type="button"
              className="ct-copy-btn"
              onClick={handleCopyEmail}
              aria-label={copied ? 'Email address copied to clipboard' : 'Copy email address'}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Card 2: LinkedIn */}
        <div className="ct-contact-card">
          <div className="ct-card-head">
            <svg className="ct-card-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.5a1.63 1.63 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63A1.63 1.63 0 0 0 7.86 6.5Z"/>
            </svg>
            <span className="ct-card-label">LinkedIn</span>
          </div>
          <div className="ct-card-value-wrap">
            <a
              href={SITE_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="ct-card-link"
              aria-label={`${SITE_INFO.name} on LinkedIn (opens in new tab)`}
            >
              {SITE_INFO.name}
            </a>
          </div>
        </div>
      </div>

      <p className="ct-lead-note">
        I read every message. Email is the fastest way to reach me.
      </p>

      <hr />

      {/* Shared Inquiry Form */}
      <section className="ct-form-section">
        <h2>Or send a message here</h2>
        <InquiryForm source="/contact" compact={false} />
      </section>

      <style>{`
        /* Contact cards */
        .ct-cards-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .ct-contact-card {
          background: #F8FAFC;
          border: 1px solid #E8EDF5;
          border-radius: 16px;
          padding: 1.35rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .ct-card-head {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .ct-card-icon {
          color: #1558E8;
          flex-shrink: 0;
        }

        .ct-card-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: #4A5468;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ct-card-value-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .ct-card-link {
          font-size: 1.05rem;
          font-weight: 600;
          color: #0B1020 !important;
          text-decoration: none !important;
          word-break: break-all;
        }

        .ct-card-link:hover {
          color: #1558E8 !important;
          text-decoration: underline !important;
        }

        .ct-copy-btn {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 0.35rem 0.75rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: #0B1020;
          cursor: pointer;
          min-height: 36px;
          min-width: 60px;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .ct-copy-btn:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
        }

        .ct-copy-btn:focus-visible {
          outline: 2px solid #1558E8;
          outline-offset: 2px;
        }

        .ct-lead-note {
          font-size: 1.05rem !important;
          color: #4A5468 !important;
          margin: 0 0 1.5rem !important;
        }

        .ct-form-section {
          margin-top: 1.5rem;
        }

        .ct-form-section h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0B1020;
          margin: 0 0 1.5rem;
        }

        @media (max-width: 640px) {
          .ct-cards-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </PageLayout>
  );
}
