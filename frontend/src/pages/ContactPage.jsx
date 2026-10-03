import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Mail, 
  AlertCircle, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';
import { SITE_INFO } from '../data/siteInfo.js';

const INQUIRY_TYPES = [
  { id: 'feedback', label: 'General Feedback', desc: 'Share your thoughts on UX, performance, or ideas' },
  { id: 'dataset', label: 'Suggest or Contribute Signs', desc: 'Recommend new Malayalam signs or phrases to include' },
  { id: 'bug', label: 'Report a Bug or Detection Issue', desc: 'Camera, landmark tracking, or translation bugs' },
  { id: 'accessibility', label: 'Accessibility Barrier', desc: 'Issues with screen readers, keyboard navigation, or contrast' },
  { id: 'academic', label: 'Academic / Collaboration', desc: 'Research discussions or dataset inquiries' }
];

export default function ContactPage() {
  React.useEffect(() => {
    document.title = 'Contact & Feedback – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'Reach out to the MOVA project team for feedback, bug reports, or sign suggestions.';
  }, []);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    type: 'feedback',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Trigger mailto fallback with structured info
    const recipient = SITE_INFO.contactEmail && !SITE_INFO.contactEmail.includes('TODO') 
      ? SITE_INFO.contactEmail 
      : 'mova.project.contact@gmail.com';

    const subject = encodeURIComponent(`[MOVA Feedback] ${formState.type.toUpperCase()}: from ${formState.name || 'User'}`);
    const body = encodeURIComponent(
      `Name: ${formState.name || 'Not provided'}\nEmail: ${formState.email || 'Not provided'}\nCategory: ${formState.type}\n\nMessage:\n${formState.message}`
    );

    setTimeout(() => {
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      setSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <PageLayout
      title="Contact & Feedback"
      description="Have thoughts on sign accuracy, detected a bug, or want to contribute new gestures? We would love to hear from you."
    >
      <div className="ct-layout-grid">
        {/* Contact Form Card */}
        <div className="ct-card">
          {submitted ? (
            <div className="ct-success-state">
              <div className="ct-success-icon">
                <CheckCircle2 size={36} />
              </div>
              <h2>Thank You for Reaching Out!</h2>
              <p>
                Your feedback has been drafted in your default email client. We actively review all submissions to guide our model dataset updates and frontend improvements.
              </p>
              <button 
                type="button" 
                className="ct-again-btn"
                onClick={() => {
                  setSubmitted(false);
                  setFormState({ name: '', email: '', type: 'feedback', message: '' });
                }}
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="ct-form">
              <h2 className="ct-form-heading">Send a Message</h2>
              <p className="ct-form-sub">We usually reply within 24–48 hours for research and collaboration queries.</p>

              {/* Inquiry Category Buttons */}
              <div className="ct-field">
                <label className="ct-label">Inquiry Type</label>
                <div className="ct-type-grid">
                  {INQUIRY_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      className={`ct-type-chip ${formState.type === type.id ? 'ct-type-chip--selected' : ''}`}
                      onClick={() => setFormState(prev => ({ ...prev, type: type.id }))}
                    >
                      <span className="ct-type-title">{type.label}</span>
                      <span className="ct-type-desc">{type.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email Row */}
              <div className="ct-fields-row">
                <div className="ct-field">
                  <label className="ct-label" htmlFor="ct-name">Your Name</label>
                  <input
                    id="ct-name"
                    type="text"
                    className="ct-input"
                    placeholder="e.g. Rahul Nair"
                    value={formState.name}
                    onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="ct-field">
                  <label className="ct-label" htmlFor="ct-email">Email Address</label>
                  <input
                    id="ct-email"
                    type="email"
                    className="ct-input"
                    placeholder="name@example.com"
                    value={formState.email}
                    onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="ct-field">
                <label className="ct-label" htmlFor="ct-message">
                  Message Details <span className="ct-required">*</span>
                </label>
                <textarea
                  id="ct-message"
                  required
                  rows={5}
                  className="ct-textarea"
                  placeholder="Describe your suggestion, the specific sign or error encountered, or your device details..."
                  value={formState.message}
                  onChange={e => setFormState(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <button 
                type="submit" 
                className="ct-submit-btn" 
                disabled={submitting || !formState.message.trim()}
              >
                <Send size={18} />
                <span>{submitting ? 'Preparing Email...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Info & FAQ cards */}
        <div className="ct-sidebar">
          <div className="ct-side-card ct-side-card--blue">
            <Sparkles size={22} className="ct-side-icon" />
            <h3>Contribute ISL Signs</h3>
            <p>
              Are you an ISL signer or educator? We actively welcome native signers to help record diverse hand gesture samples across different lighting and speeds.
            </p>
          </div>

          <div className="ct-side-card">
            <Mail size={22} className="ct-side-icon" />
            <h3>Direct Contact</h3>
            <p className="ct-side-contact-lead">
              Prefer writing directly from your mailbox?
            </p>
            <a 
              href="mailto:mova.project.contact@gmail.com" 
              className="ct-email-link"
            >
              mova.project.contact@gmail.com
            </a>
          </div>

          <div className="ct-side-card">
            <HelpCircle size={22} className="ct-side-icon" />
            <h3>Looking for quick help?</h3>
            <p>
              Common issues with camera permissions, lighting, and browser support are covered step-by-step in our help guide.
            </p>
            <a href="/help" className="ct-help-link">Visit Help Center →</a>
          </div>
        </div>
      </div>

      <style>{`
        .ct-layout-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .ct-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 22px;
          padding: 2.25rem 2rem;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
        }

        .ct-form-heading {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 0.35rem;
          letter-spacing: -0.02em;
        }

        .ct-form-sub {
          font-size: 0.95rem;
          color: #64748B;
          margin: 0 0 1.75rem;
        }

        .ct-field {
          margin-bottom: 1.35rem;
        }

        .ct-fields-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .ct-label {
          display: block;
          font-size: 0.88rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 0.45rem;
        }

        .ct-required {
          color: #E11D48;
        }

        .ct-input, .ct-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1.5px solid #E2E8F0;
          font-family: inherit;
          font-size: 0.95rem;
          color: #0F172A;
          background: #FFFFFF;
          transition: all 0.2s ease;
          outline: none;
        }

        .ct-input:focus, .ct-textarea:focus {
          border-color: #1558E8;
          box-shadow: 0 0 0 4px rgba(21, 88, 232, 0.12);
        }

        .ct-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .ct-type-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.6rem;
        }

        .ct-type-chip {
          text-align: left;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-family: inherit;
        }

        .ct-type-chip:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }

        .ct-type-chip--selected {
          background: #EFF6FF !important;
          border-color: #1558E8 !important;
          box-shadow: 0 0 0 1px #1558E8;
        }

        .ct-type-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0F172A;
        }

        .ct-type-chip--selected .ct-type-title {
          color: #1558E8;
        }

        .ct-type-desc {
          font-size: 0.8rem;
          color: #64748B;
        }

        .ct-submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #1558E8;
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          padding: 0.85rem 1.75rem;
          font-size: 0.96rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(21, 88, 232, 0.25);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
          width: 100%;
        }

        .ct-submit-btn:hover:not(:disabled) {
          background: #1048C6;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(21, 88, 232, 0.35);
        }

        .ct-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Success Card */
        .ct-success-state {
          text-align: center;
          padding: 3rem 1.5rem;
        }

        .ct-success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #DCFCE7;
          color: #15803D;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .ct-success-state h2 {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 0.75rem;
        }

        .ct-success-state p {
          color: #64748B;
          line-height: 1.6;
          margin: 0 0 2rem;
          font-size: 0.98rem;
        }

        .ct-again-btn {
          background: #F1F5F9;
          color: #0F172A;
          border: 1px solid #E2E8F0;
          padding: 0.65rem 1.4rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ct-again-btn:hover {
          background: #E2E8F0;
        }

        /* Sidebar */
        .ct-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .ct-side-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.5rem;
        }

        .ct-side-card--blue {
          background: linear-gradient(135deg, #F0F6FF 0%, #FAFCFF 100%);
          border-color: #BFDBFE;
        }

        .ct-side-icon {
          color: #1558E8;
          margin-bottom: 0.75rem;
        }

        .ct-side-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 0.4rem;
        }

        .ct-side-card p {
          font-size: 0.9rem;
          color: #64748B;
          line-height: 1.55;
          margin: 0;
        }

        .ct-side-contact-lead {
          margin-bottom: 0.5rem !important;
        }

        .ct-email-link {
          font-size: 0.92rem;
          font-weight: 600;
          color: #1558E8;
          text-decoration: none;
        }

        .ct-email-link:hover {
          text-decoration: underline;
        }

        .ct-help-link {
          display: inline-block;
          margin-top: 0.75rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #1558E8;
          text-decoration: none;
        }

        .ct-help-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .ct-layout-grid {
            grid-template-columns: 1fr;
          }
          .ct-fields-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </PageLayout>
  );
}
