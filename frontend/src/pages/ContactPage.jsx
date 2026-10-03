import React, { useState } from 'react';
import PageLayout from '../components/PageLayout.jsx';
import InquiryForm from '../components/InquiryForm.jsx';
import { SITE_INFO } from '../data/siteInfo.js';
import './ContactPage.css';

export default function ContactPage() {
  React.useEffect(() => {
    document.title = 'Contact & Feedback – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'Report a bug, suggest a sign, or just say hello to the MOVA team.';
    }
  }, []);

  const [copied, setCopied] = useState(false);

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
    <PageLayout fullWidth={true}>
      <div className="ct-fullwidth-root">
        {/* Hero Band with 3D Graphic */}
        <section className="ct-hero-band">
          <div className="ct-container">
            <div className="ct-hero-grid">
              <div className="ct-hero-copy">
                <span className="ct-pill">GET IN TOUCH</span>
                <h1 className="ct-title">Contact &amp; Feedback</h1>
                <p className="ct-subtitle">
                  Report a bug, suggest a new sign, share your ideas, or partner with us.
                  Every message is delivered directly to our lead developer.
                </p>
                <div className="ct-cards-row">
                  {/* Card 1: Email */}
                  <div className="ct-contact-card">
                    <div className="ct-card-head">
                      <svg className="ct-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span className="ct-card-label">Email Direct</span>
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
                        aria-label={copied ? 'Email address copied' : 'Copy email address'}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Card 2: LinkedIn */}
                  <div className="ct-contact-card">
                    <div className="ct-card-head">
                      <svg className="ct-card-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
                        aria-label={`${SITE_INFO.name} on LinkedIn`}
                      >
                        {SITE_INFO.name}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Visual Graphic */}
              <div className="ct-hero-graphic-wrap">
                <div className="ct-3d-card">
                  <img
                    src="/images/3d/contact-support.webp"
                    alt="3D Communication and Feedback visual illustration"
                    className="ct-3d-img"
                    width="640"
                    height="360"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Band */}
        <section className="ct-form-band">
          <div className="ct-container ct-container--narrow">
            <div className="ct-form-header">
              <h2>Send an inquiry or suggestion</h2>
              <p>Fill out the form below. We usually respond within 24–48 hours.</p>
            </div>
            <div className="ct-form-wrapper">
              <InquiryForm source="/contact" compact={false} />
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
