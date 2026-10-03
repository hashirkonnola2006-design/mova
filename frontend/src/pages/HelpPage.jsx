import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  VideoOff, 
  Sun, 
  Compass, 
  HelpCircle, 
  ChevronDown, 
  ExternalLink,
  MessageSquareQuote,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';

const HELP_SECTIONS = [
  {
    id: 'camera-denied',
    icon: Camera,
    title: 'Camera permission denied or blocked',
    badge: 'Permissions',
    steps: [
      'Look for the camera / lock icon in your browser address bar (top left next to the URL).',
      'Click the icon and toggle Camera permission to "Allow".',
      'Reload the page to apply the new permissions.',
      'On macOS or Windows 11, verify that System Settings → Privacy & Security → Camera also allows your browser (Chrome/Edge).'
    ],
  },
  {
    id: 'no-camera',
    icon: VideoOff,
    title: 'No webcam or video device found',
    badge: 'Hardware',
    steps: [
      'Ensure your external webcam is securely plugged into an active USB port.',
      'Close any background video apps (Zoom, Teams, Google Meet, Skype) that may be locking camera stream.',
      'Check if your laptop has a physical privacy shutter or a function key slider (e.g., F10/Fn lock).',
      'Restart the browser after connecting any new video capture devices.'
    ],
  },
  {
    id: 'low-light',
    icon: Sun,
    title: 'Improving detection accuracy & low light conditions',
    badge: 'Environment',
    steps: [
      'Ensure bright, front-facing lighting. Avoid strong windows or bright spotlights directly behind your head.',
      'Keep both hands clearly in front of your chest within 40 cm – 90 cm from the camera lens.',
      'Avoid cluttered background movement or people walking behind you.',
      'Hold gestures steady for 1 to 1.5 seconds so the neural network can sample consecutive frames.'
    ],
  },
  {
    id: 'browser-support',
    icon: Compass,
    title: 'Browser compatibility & WebAssembly requirements',
    badge: 'System',
    steps: [
      'MOVA delivers maximum hardware acceleration on Google Chrome (v95+), Microsoft Edge, or Chromium-based browsers.',
      'Safari (macOS/iOS) supports WebRTC but may have slower WebAssembly MediaPipe landmark pipelines.',
      'Ensure "Hardware Acceleration" is enabled in browser Settings → System.',
      'Update your graphics card drivers if you notice camera frame stuttering.'
    ],
  },
  {
    id: 'not-recognized',
    icon: HelpCircle,
    title: 'Why is a specific sign not being recognized?',
    badge: 'Model',
    steps: [
      'Check the Supported Signs directory to make sure the gesture is present in the current active vocabulary.',
      'Ensure your fingers and palm orientation match the canonical ISL handshape closely.',
      'Signs must begin from an open/neutral position and resolve into the final hand configuration.',
      'If a sign repeatedly fails, report it via our Contact page so we can include more training sample variations.'
    ],
  },
];

export default function HelpPage() {
  React.useEffect(() => {
    document.title = 'Help & Troubleshooting – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'Troubleshooting guide for MOVA: camera permissions, lighting, supported browsers, and sign detection tips.';
  }, []);

  const [openSection, setOpenSection] = useState('camera-denied');

  const toggleSection = (id) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  return (
    <PageLayout
      title="Help & Support"
      description="Step-by-step troubleshooting guides and practical tips to ensure your camera, lighting, and gestures work smoothly."
    >
      <div className="pl-info-banner">
        <ShieldCheck className="pl-info-banner-icon" />
        <div>
          <p>
            <strong>Quick Check:</strong> MOVA runs AI landmark detection directly in your web browser. Your video feed is never uploaded to the cloud or saved anywhere.
          </p>
        </div>
      </div>

      {/* Accordion FAQ Cards */}
      <div className="hp-accordion-container" role="region" aria-label="Troubleshooting Topics">
        {HELP_SECTIONS.map((section) => {
          const isOpen = openSection === section.id;
          const IconComp = section.icon;

          return (
            <div
              key={section.id}
              className={`hp-card ${isOpen ? 'hp-card--open' : ''}`}
            >
              <button
                type="button"
                className="hp-card-header"
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
                aria-controls={`panel-${section.id}`}
              >
                <div className="hp-card-header-left">
                  <div className="hp-icon-bubble">
                    <IconComp size={20} />
                  </div>
                  <div>
                    <span className="hp-badge">{section.badge}</span>
                    <h2 className="hp-card-title">{section.title}</h2>
                  </div>
                </div>
                <div className={`hp-chevron ${isOpen ? 'hp-chevron--rotated' : ''}`}>
                  <ChevronDown size={20} />
                </div>
              </button>

              {isOpen && (
                <div
                  id={`panel-${section.id}`}
                  className="hp-card-body"
                  role="region"
                >
                  <ol className="hp-steps-list">
                    {section.steps.map((step, idx) => (
                      <li key={idx} className="hp-step-item">
                        <span className="hp-step-num">{idx + 1}</span>
                        <span className="hp-step-text">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Footer / Call to action */}
      <div className="hp-footer-prompt">
        <div className="hp-footer-prompt-inner">
          <MessageSquareQuote size={28} className="hp-prompt-icon" />
          <div>
            <h3>Still encountering issues?</h3>
            <p>Our team is happy to help test camera setups or look into unexpected detection results.</p>
          </div>
          <Link to="/contact" className="hp-contact-btn">
            Contact Support <ExternalLink size={15} />
          </Link>
        </div>
      </div>

      <style>{`
        .hp-accordion-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 3.5rem;
        }

        .hp-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 18px;
          overflow: hidden;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.02);
        }

        .hp-card:hover {
          border-color: #CBD5E1;
        }

        .hp-card--open {
          border-color: #BFDBFE;
          box-shadow: 0 10px 25px rgba(21, 88, 232, 0.06);
        }

        .hp-card-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.35rem 1.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
        }

        .hp-card-header-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .hp-icon-bubble {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #EFF6FF;
          color: #1558E8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .hp-card--open .hp-icon-bubble {
          background: #1558E8;
          color: #FFFFFF;
        }

        .hp-badge {
          display: inline-block;
          font-size: 0.73rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748B;
          margin-bottom: 0.25rem;
        }

        .hp-card-title {
          font-size: 1.12rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.015em;
        }

        .hp-chevron {
          color: #94A3B8;
          transition: transform 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hp-chevron--rotated {
          transform: rotate(180deg);
          color: #1558E8;
        }

        .hp-card-body {
          padding: 0 1.5rem 1.6rem 5.25rem;
          animation: hpSlideDown 0.2s ease-out;
        }

        @keyframes hpSlideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hp-steps-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .hp-step-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          font-size: 0.98rem;
          color: #475569;
          line-height: 1.6;
        }

        .hp-step-num {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          background: #F1F5F9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #1558E8;
          margin-top: 2px;
        }

        .hp-footer-prompt {
          background: linear-gradient(135deg, #F8FAFC 0%, #EEF4FF 100%);
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 2rem;
        }

        .hp-footer-prompt-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .hp-prompt-icon {
          color: #1558E8;
          flex-shrink: 0;
        }

        .hp-footer-prompt h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 0.35rem;
        }

        .hp-footer-prompt p {
          font-size: 0.92rem;
          color: #64748B;
          margin: 0;
        }

        .hp-contact-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #1558E8;
          color: #FFFFFF !important;
          text-decoration: none !important;
          padding: 0.7rem 1.35rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(21, 88, 232, 0.2);
          transition: all 0.2s ease;
        }

        .hp-contact-btn:hover {
          background: #1048C6;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(21, 88, 232, 0.3);
        }

        @media (max-width: 640px) {
          .hp-card-body {
            padding: 0 1.25rem 1.25rem 1.25rem;
          }
          .hp-card-header {
            padding: 1.15rem;
          }
          .hp-card-header-left {
            gap: 0.85rem;
          }
          .hp-icon-bubble {
            width: 38px;
            height: 38px;
          }
          .hp-card-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </PageLayout>
  );
}
