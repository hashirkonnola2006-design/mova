import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  HardDrive, 
  Server, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';

export default function PrivacyPage() {
  React.useEffect(() => {
    document.title = 'Privacy Architecture & Data Transparency – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'Understand how MOVA ensures video privacy through local on-device machine vision with zero cloud uploads.';
  }, []);

  return (
    <PageLayout
      title="Privacy Policy"
      description="We believe privacy is an intrinsic human right. Here is our transparent, complete disclosure of how data flows through MOVA."
    >
      {/* Privacy Guarantee Header Card */}
      <div className="pr-guarantee-card">
        <div className="pr-guarantee-icon">
          <EyeOff size={28} />
        </div>
        <div>
          <h2>Your Camera Frames Never Leave Your Device</h2>
          <p>
            When you grant camera access, video frames are processed entirely inside your browser's WebAssembly 
            memory using MediaPipe. MOVA does not stream, capture, or save your camera image feed to any external cloud server.
          </p>
        </div>
      </div>

      {/* Technical Data Flow Architecture */}
      <h2 className="pr-section-title">Data Handling Architecture</h2>
      <div className="pr-grid">
        <div className="pr-card">
          <div className="pr-card-icon pr-card-icon--green">
            <Lock size={22} />
          </div>
          <h3>Local Video Processing</h3>
          <p>
            Video frames from <code>navigator.mediaDevices.getUserMedia</code> are consumed in-memory by client-side WebAssembly models. When you turn off the camera or navigate away, memory allocations are instantly cleared.
          </p>
        </div>

        <div className="pr-card">
          <div className="pr-card-icon pr-card-icon--blue">
            <Server size={22} />
          </div>
          <h3>Landmark Coordinates</h3>
          <p>
            Only normalized skeletal landmark coordinates (x, y, z finger joints) are evaluated for classification. No recognizable human faces, room backgrounds, or image pixels are ever transmitted or stored.
          </p>
        </div>

        <div className="pr-card">
          <div className="pr-card-icon pr-card-icon--purple">
            <HardDrive size={22} />
          </div>
          <h3>Client-Side Preferences</h3>
          <p>
            User preferences (such as speech volume, speech speed, and session state) are saved exclusively to your browser's local storage (<code>localStorage</code>) on your own machine.
          </p>
        </div>
      </div>

      <hr />

      {/* Cookies & Tracking Section */}
      <h2 className="pr-section-title">Zero Analytics or Third-Party Trackers</h2>
      <div className="pr-text-block">
        <p>
          MOVA does not embed Google Analytics, Meta Pixel, PostHog, Mixpanel, or advertising cookies. 
          There is no cross-site profiling or tracking across your browsing sessions.
        </p>
        <p>
          External requests are strictly limited to necessary CDN assets:
        </p>
        <ul>
          <li><strong>Google Fonts:</strong> Web fonts (Inter and Noto Sans Malayalam) loaded for multilingual typography.</li>
          <li><strong>Self-Hosted MediaPipe:</strong> The landmark extraction models are served directly from the same origin.</li>
        </ul>
      </div>

      <hr />

      {/* Questions & Contact */}
      <div className="pr-contact-box">
        <h3>Questions regarding security or data flow?</h3>
        <p>We are dedicated to total transparency in open source and assistive research.</p>
        <Link to="/contact" className="pr-contact-link">Contact our team →</Link>
      </div>

      <style>{`
        .pr-guarantee-card {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          background: linear-gradient(135deg, #F0FDF4 0%, #FAFCFF 100%);
          border: 1.5px solid #BBF7D0;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2.75rem;
          box-shadow: 0 4px 14px rgba(22, 101, 52, 0.04);
        }

        .pr-guarantee-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #DCFCE7;
          color: #15803D;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pr-guarantee-card h2 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #14532D;
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
        }

        .pr-guarantee-card p {
          font-size: 1rem;
          color: #166534;
          line-height: 1.6;
          margin: 0;
        }

        .pr-section-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }

        .pr-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .pr-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
        }

        .pr-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .pr-card-icon--green { background: #ECFDF5; color: #059669; }
        .pr-card-icon--blue { background: #EFF6FF; color: #1558E8; }
        .pr-card-icon--purple { background: #F5F3FF; color: #7C3AED; }

        .pr-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 0.45rem;
        }

        .pr-card p {
          font-size: 0.92rem;
          color: #64748B;
          line-height: 1.6;
          margin: 0;
        }

        .pr-text-block {
          font-size: 1rem;
          color: #334155;
          line-height: 1.7;
        }

        .pr-contact-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.75rem 2rem;
        }

        .pr-contact-box h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 0.35rem;
        }

        .pr-contact-box p {
          font-size: 0.92rem;
          color: #64748B;
          margin: 0 0 0.85rem;
        }

        .pr-contact-link {
          font-size: 0.92rem;
          font-weight: 600;
          color: #1558E8;
          text-decoration: none;
        }

        .pr-contact-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .pr-guarantee-card {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </PageLayout>
  );
}
