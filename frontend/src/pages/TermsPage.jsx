import React from 'react';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck2, 
  HeartHandshake, 
  HelpCircle, 
  Sparkles 
} from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';
import './TermsPage.css';

export default function TermsPage() {
  React.useEffect(() => {
    document.title = 'Terms of Use – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'Clear, plain-language terms of service and acceptable usage guidelines for MOVA.';
    }
  }, []);

  return (
    <PageLayout fullWidth={true}>
      <div className="tr-fullwidth-root">
        {/* Hero Band with 3D Render */}
        <section className="tr-hero-band">
          <div className="tr-container">
            <div className="tr-hero-grid">
              <div className="tr-hero-copy">
                <span className="tr-pill">LEGAL &amp; USAGE GUIDELINES</span>
                <h1 className="tr-title">Transparent Terms of Use</h1>
                <p className="tr-subtitle">
                  Plain-language guidelines. We believe legal terms should be understandable,
                  transparent, and honest about what our machine learning model can and cannot do.
                </p>

                <div className="tr-stat-row">
                  <div className="tr-stat-pill">
                    <CheckCircle2 size={18} className="tr-check-icon" />
                    <span>Free for educational &amp; non-critical use</span>
                  </div>
                  <div className="tr-stat-pill">
                    <CheckCircle2 size={18} className="tr-check-icon" />
                    <span>Zero hidden tracking clauses</span>
                  </div>
                </div>
              </div>

              {/* 3D Modern Scales of Justice Render */}
              <div className="tr-hero-graphic-wrap">
                <div className="tr-3d-card">
                  <img
                    src="/images/3d/terms-guidelines.webp"
                    alt="3D Frosted Sapphire Scales of Justice and Guidelines Illustration"
                    className="tr-3d-img"
                    width="640"
                    height="360"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Terms Section */}
        <section className="tr-terms-band">
          <div className="tr-container">
            <div className="tr-section-header">
              <span className="tr-pill">KEY PRINCIPLES</span>
              <h2 className="tr-section-title">Terms &amp; Boundaries</h2>
              <p className="tr-section-sub">
                Designed to protect user safety and provide realistic machine learning expectations.
              </p>
            </div>

            <div className="tr-grid">
              {/* Card 1 */}
              <div className="tr-card">
                <div className="tr-num-badge">01</div>
                <h3>Nature of the Service</h3>
                <p>
                  MOVA is an experimental academic prototype developed at College of Engineering Thalassery.
                  It recognizes Indian Sign Language gestures and translates them to Malayalam words.
                  It is completely free to use for personal practice, learning, and communication aid.
                </p>
              </div>

              {/* Card 2: Emergency Alert */}
              <div className="tr-card tr-card--alert">
                <div className="tr-num-badge tr-num-badge--alert">02</div>
                <div className="tr-alert-head">
                  <AlertTriangle size={20} className="tr-alert-icon" />
                  <h3>Emergency Limitation</h3>
                </div>
                <p>
                  <strong>Never rely on MOVA during life-threatening medical emergencies, legal proceedings, or courtroom situations.</strong>
                  Computer vision can occasionally misclassify rapid motions or low-light video.
                  Always engage certified human interpreters for mission-critical interactions.
                </p>
              </div>

              {/* Card 3 */}
              <div className="tr-card">
                <div className="tr-num-badge">03</div>
                <h3>Acceptable Use</h3>
                <p>
                  You are welcome to practice, learn, test signs, and integrate MOVA into your daily conversations.
                  Do not attempt to reverse engineer backend infrastructure for denial-of-service attacks or abusive automated traffic.
                </p>
              </div>

              {/* Card 4 */}
              <div className="tr-card">
                <div className="tr-num-badge">04</div>
                <h3>Intellectual Property &amp; Open Science</h3>
                <p>
                  The open-source code and model architectures are shared under respectful open licenses.
                  Datasets contributed from AI4Bharat and public sign language corpuses remain credited to their respective originators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Banner */}
        <section className="tr-summary-band">
          <div className="tr-container tr-container--narrow">
            <div className="tr-summary-card">
              <HeartHandshake size={36} className="tr-summary-icon" />
              <h3>Questions About These Terms?</h3>
              <p>
                If you have questions regarding school use, research citations, or enterprise partnerships,
                feel free to reach out directly via our Contact page.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
