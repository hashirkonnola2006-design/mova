import React from 'react';
import { 
  Keyboard, 
  Languages, 
  Volume2, 
  Eye, 
  Smartphone, 
  FileCode, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';
import './AccessibilityStatementPage.css';

const A11Y_FEATURES = [
  {
    icon: Keyboard,
    title: 'Full Keyboard Navigation',
    desc: 'Every control, modal, and button is fully reachable and actionable via Tab, Space, and Enter, equipped with visible high-contrast focus indicators.'
  },
  {
    icon: Languages,
    title: 'Native Malayalam Typography',
    desc: 'Optimized typography using Malayalam fonts with proper semantic lang="ml" markup so assistive screen readers pronounce words correctly.'
  },
  {
    icon: Volume2,
    title: 'Integrated Speech Synthesis',
    desc: 'Audio speech engines announce detected signs aloud, ensuring seamless reciprocal communication between deaf and hearing users.'
  },
  {
    icon: Eye,
    title: 'WCAG AAA/AA Contrast Compliance',
    desc: 'Color palettes are rigorously engineered for 4.5:1 minimum body text contrast and 3:1 non-text contrast across light and high-contrast modes.'
  },
  {
    icon: Smartphone,
    title: 'Responsive & Accessible Layouts',
    desc: 'Interfaces dynamically adjust from mobile viewports to 4K ultra-wide monitors without horizontal scroll or broken gesture cameras.'
  },
  {
    icon: FileCode,
    title: 'Semantic HTML & ARIA Landmarks',
    desc: 'Clean document outlines with proper header hierarchy (h1, h2, h3), ARIA roles, and polite screen reader live regions.'
  }
];

export default function AccessibilityStatementPage() {
  React.useEffect(() => {
    document.title = 'Accessibility Statement – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'Our ongoing commitment to making sign language translation and web tools universally accessible.';
    }
  }, []);

  return (
    <PageLayout fullWidth={true}>
      <div className="ay-fullwidth-root">
        {/* Hero Band with 3D Render */}
        <section className="ay-hero-band">
          <div className="ay-container">
            <div className="ay-hero-grid">
              <div className="ay-hero-copy">
                <span className="ay-pill">INCLUSIVE TECHNOLOGY</span>
                <h1 className="ay-title">Accessibility Statement</h1>
                <p className="ay-subtitle">
                  MOVA is committed to universal digital inclusion. We build tools that empower deaf,
                  hard-of-hearing, and speech-impaired individuals through frictionless assistive technology.
                </p>

                <div className="ay-stat-row">
                  <div className="ay-stat-pill">
                    <CheckCircle2 size={18} className="ay-check-icon" />
                    <span>WCAG 2.1 Level AA target</span>
                  </div>
                  <div className="ay-stat-pill">
                    <CheckCircle2 size={18} className="ay-check-icon" />
                    <span>Universal keyboard accessibility</span>
                  </div>
                </div>
              </div>

              {/* 3D Accessibility Holographic Hand Render */}
              <div className="ay-hero-graphic-wrap">
                <div className="ay-3d-card">
                  <img
                    src="/images/3d/accessibility-vision.webp"
                    alt="3D Holographic Hand and Vision Accessibility Illustration"
                    className="ay-3d-img"
                    width="640"
                    height="360"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Band */}
        <section className="ay-features-band">
          <div className="ay-container">
            <div className="ay-section-header">
              <span className="ay-pill">STANDARDS</span>
              <h2 className="ay-section-title">Built-In Accessibility Standards</h2>
              <p className="ay-section-sub">
                Designed from the ground up to support screen readers, mobility devices, and neurodivergent users.
              </p>
            </div>

            <div className="ay-grid">
              {A11Y_FEATURES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="ay-card">
                    <div className="ay-card-icon">
                      <Icon size={24} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Commitment Statement Band */}
        <section className="ay-audit-band">
          <div className="ay-container ay-container--narrow">
            <div className="ay-audit-card">
              <ShieldCheck size={36} className="ay-audit-icon" />
              <h3>Continuous Accessibility Audits</h3>
              <p>
                We run automated automated audits (Lighthouse, axe-core) alongside manual keyboard navigation testing.
                If you encounter any barrier, please report it via our Contact page and our engineering team will address it promptly.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
