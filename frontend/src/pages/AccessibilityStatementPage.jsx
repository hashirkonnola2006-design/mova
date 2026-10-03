import React from 'react';
import { 
  Keyboard, 
  Eye, 
  Volume2, 
  FileCode, 
  Languages, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';

const A11Y_FEATURES = [
  {
    icon: Keyboard,
    title: 'Full Keyboard Navigability',
    desc: 'All core features, buttons, menus, and modals are accessible via Tab, Enter, Space, and Arrow keys, with high-contrast visible focus rings.'
  },
  {
    icon: Languages,
    title: 'Native Malayalam Typography',
    desc: 'Rendered with Noto Sans Malayalam and proper lang="ml" attributes to ensure native screen readers synthesize correct phonemes.'
  },
  {
    icon: Volume2,
    title: 'Integrated Speech Synthesis',
    desc: 'Automatic text-to-speech audio engine with fallback detection provides auditory voice playback for sign detections.'
  },
  {
    icon: Eye,
    title: 'WCAG High Contrast Compliant',
    desc: 'Light-themed user interfaces maintain strict 4.5:1 minimum contrast ratios across all body text, tags, and interactive button components.'
  },
  {
    icon: Smartphone,
    title: 'Responsive & Scalable Viewport',
    desc: 'Seamless scaling across mobile, tablet, and desktop monitors without breaking layout or truncating gestures.'
  },
  {
    icon: FileCode,
    title: 'Semantic HTML & ARIA Landmarks',
    desc: 'Built using semantic elements (<main>, <nav>, <header>, <section>) and clear aria-labels for assistive screen readers.'
  }
];

export default function AccessibilityStatementPage() {
  React.useEffect(() => {
    document.title = 'Accessibility Statement – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'Our ongoing commitment to making sign language translation and web tools universally accessible.';
  }, []);

  return (
    <PageLayout
      title="Accessibility Commitment"
      description="Our core mission is universal inclusion. Here is how we build, audit, and continually optimize MOVA for everyone."
    >
      <div className="pl-info-banner">
        <ShieldCheck className="pl-info-banner-icon" />
        <div>
          <p>
            <strong>Inclusive by Design:</strong> Assistive software must be accessible to people of all abilities. We strive to align with WCAG 2.1 Level AA recommendations and solicit continuous feedback from the community.
          </p>
        </div>
      </div>

      {/* Grid of Implemented Accessibility Features */}
      <h2 className="ay-heading">Implemented Standards & Features</h2>
      <div className="ay-grid">
        {A11Y_FEATURES.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div key={idx} className="ay-card">
              <div className="ay-icon-wrap">
                <IconComp size={22} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          );
        })}
      </div>

      <hr />

      {/* Known Limitations & Roadmap */}
      <h2 className="ay-heading">Known Areas for Improvement</h2>
      <div className="ay-limitation-box">
        <AlertCircle size={22} className="ay-limitation-icon" />
        <div>
          <h3 className="ay-limitation-title">Continuous Optimization Roadmap</h3>
          <p>
            While keyboard and audio features are operational, MediaPipe hand tracking requires active camera feed interaction which currently relies on visual framing. We are actively researching audio-guided boundary cues to assist visually impaired individuals in properly positioning their hands inside the camera viewport.
          </p>
        </div>
      </div>

      {/* Feedback Prompt */}
      <div className="ay-feedback-cta">
        <h3>Encountered an accessibility barrier?</h3>
        <p>If any part of MOVA is difficult to navigate or interpret with your assistive equipment, please let us know.</p>
        <a href="/contact" className="ay-cta-btn">Report an Accessibility Barrier →</a>
      </div>

      <style>{`
        .ay-heading {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }

        .ay-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .ay-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .ay-card:hover {
          transform: translateY(-2px);
          border-color: #CBD5E1;
        }

        .ay-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #EFF6FF;
          color: #1558E8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .ay-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 0.4rem;
        }

        .ay-card p {
          font-size: 0.92rem;
          color: #64748B;
          line-height: 1.6;
          margin: 0;
        }

        .ay-limitation-box {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          background: #FFFBEB;
          border: 1.5px solid #FDE68A;
          border-radius: 18px;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .ay-limitation-icon {
          color: #D97706;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .ay-limitation-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #92400E;
          margin: 0 0 0.4rem;
        }

        .ay-limitation-box p {
          font-size: 0.95rem;
          color: #78350F;
          line-height: 1.6;
          margin: 0;
        }

        .ay-feedback-cta {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.75rem 2rem;
        }

        .ay-feedback-cta h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 0.35rem;
        }

        .ay-feedback-cta p {
          font-size: 0.92rem;
          color: #64748B;
          margin: 0 0 1rem;
        }

        .ay-cta-btn {
          display: inline-block;
          font-size: 0.92rem;
          font-weight: 600;
          color: #1558E8;
          text-decoration: none;
        }

        .ay-cta-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </PageLayout>
  );
}
