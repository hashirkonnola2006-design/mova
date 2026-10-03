import React, { useState, useRef, useId } from 'react';
import PageLayout from '../components/PageLayout.jsx';
import { SITE_INFO } from '../data/siteInfo.js';

const INQUIRY_TYPES = [
  'Bug',
  'Wrong translation',
  'Suggestion',
  'I can help with signs',
  'Other',
];

export default function ContactPage() {
  React.useEffect(() => {
    document.title = 'Contact & Feedback – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'Report a bug, suggest a sign, or just say hello.';
    }
  }, []);

  const uid = useId();
  const typeId = `${uid}-type`;
  const messageId = `${uid}-message`;
  const emailId = `${uid}-email`;
  const honeypotId = `${uid}-website`;

  const [copied, setCopied] = useState(false);
  const [formState, setFormState] = useState({
    type: '',
    message: '',
    email: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState('idle'); // idle | submitting | success | error
  const [errorSummary, setErrorSummary] = useState([]);

  const errorSummaryRef = useRef(null);

  // Copy email helper
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE_INFO.contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const validate = () => {
    const errs = {};
    const summary = [];

    if (!formState.type) {
      errs.type = 'Please select a type of message.';
      summary.push({ field: typeId, message: 'Please select a message type.' });
    }

    if (!formState.message.trim()) {
      errs.message = 'Please enter your message.';
      summary.push({ field: messageId, message: 'Please write a message.' });
    } else if (formState.message.length > 2000) {
      errs.message = 'Message must be 2000 characters or fewer.';
      summary.push({ field: messageId, message: 'Message is too long (over 2000 characters).' });
    }

    if (formState.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errs.email = 'Please enter a valid email address.';
      summary.push({ field: emailId, message: 'Invalid email address format.' });
    }

    return { errs, summary };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Honeypot check
    if (formState.honeypot) {
      return;
    }

    const { errs, summary } = validate();
    if (summary.length > 0) {
      setErrors(errs);
      setErrorSummary(summary);
      setTimeout(() => {
        if (errorSummaryRef.current) {
          errorSummaryRef.current.focus();
        }
      }, 50);
      return;
    }

    setErrors({});
    setErrorSummary([]);
    setSubmitState('submitting');

    // Mailto fallback (Supabase feedback table does not exist in this client)
    const subject = encodeURIComponent(`MOVA feedback: ${formState.type}`);
    const bodyText = [
      `Type: ${formState.type}`,
      `Message:\n${formState.message}`,
      formState.email ? `Reply-to: ${formState.email}` : 'Reply-to: (none provided)'
    ].join('\n\n');

    const mailtoUrl = `mailto:${SITE_INFO.contactEmail}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

    try {
      window.location.href = mailtoUrl;
      setSubmitState('success');
    } catch {
      setSubmitState('error');
    }
  };

  return (
    <PageLayout
      title="Contact & Feedback"
      description="Report a bug, suggest a sign, or just say hello."
    >
      {/* Dev-only banner: never rendered in production */}
      {import.meta.env.DEV && (
        <div className="pl-dev-banner" role="status">
          <strong>Dev note:</strong> Contact email is <code>{SITE_INFO.contactEmail}</code>. Form uses accessible mailto fallback.
        </div>
      )}

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

      {/* Form Section */}
      <section className="ct-form-section">
        <h2>Or send a message here</h2>

        {/* Error Summary box (receives focus on submit error) */}
        {errorSummary.length > 0 && (
          <div
            className="ct-error-summary"
            role="alert"
            tabIndex={-1}
            ref={errorSummaryRef}
            aria-labelledby="ct-error-summary-title"
          >
            <h3 id="ct-error-summary-title">There is a problem with your message</h3>
            <ul>
              {errorSummary.map((err, idx) => (
                <li key={idx}>
                  <a href={`#${err.field}`}>{err.message}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {submitState === 'success' && (
          <div className="ct-status-card ct-status-card--success" role="status">
            <h3>Ready to send in your email client</h3>
            <p>
              Your default email app should now open with your message pre-filled. If it did not open, you can send your note directly to{' '}
              <a href={`mailto:${SITE_INFO.contactEmail}`}>{SITE_INFO.contactEmail}</a> using the email card above.
            </p>
            <button
              type="button"
              className="ct-reset-btn"
              onClick={() => {
                setSubmitState('idle');
                setFormState({ type: '', message: '', email: '', honeypot: '' });
              }}
            >
              Write another message
            </button>
          </div>
        )}

        {submitState === 'error' && (
          <div className="ct-status-card ct-status-card--error" role="alert">
            <h3>Unable to open email client automatically</h3>
            <p>
              Please copy your message and write to us directly at{' '}
              <a href={`mailto:${SITE_INFO.contactEmail}`}>{SITE_INFO.contactEmail}</a>.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="ct-form" aria-label="Contact and feedback form">
          {/* Honeypot field (hidden from real users) */}
          <div className="ct-honeypot" aria-hidden="true">
            <label htmlFor={honeypotId}>Do not fill this field</label>
            <input
              id={honeypotId}
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={formState.honeypot}
              onChange={e => setFormState(prev => ({ ...prev, honeypot: e.target.value }))}
            />
          </div>

          {/* Type field */}
          <div className="ct-field">
            <label htmlFor={typeId} className="ct-label">
              Type <span className="ct-required" aria-hidden="true">*</span>
              <span className="sr-only"> (required)</span>
            </label>
            <select
              id={typeId}
              name="type"
              className={`ct-select ${errors.type ? 'ct-input--error' : ''}`}
              value={formState.type}
              onChange={e => {
                const val = e.target.value;
                setFormState(prev => ({ ...prev, type: val }));
                if (errors.type) setErrors(prev => ({ ...prev, type: undefined }));
              }}
              aria-required="true"
              aria-invalid={!!errors.type}
              aria-describedby={errors.type ? `${typeId}-error` : undefined}
            >
              <option value="">Select a type…</option>
              {INQUIRY_TYPES.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.type && (
              <p id={`${typeId}-error`} className="ct-error-msg" role="alert">
                {errors.type}
              </p>
            )}

            {/* Helper line when "I can help with signs" is selected */}
            {formState.type === 'I can help with signs' && (
              <p className="ct-help-note">
                Know Indian Sign Language? Tell us how you'd like to help.
              </p>
            )}
          </div>

          {/* Message field */}
          <div className="ct-field">
            <div className="ct-label-row">
              <label htmlFor={messageId} className="ct-label">
                Message <span className="ct-required" aria-hidden="true">*</span>
                <span className="sr-only"> (required)</span>
              </label>
              <span className="ct-char-count" aria-live="polite">
                {formState.message.length} / 2000
              </span>
            </div>
            <textarea
              id={messageId}
              name="message"
              rows={6}
              maxLength={2000}
              className={`ct-textarea ${errors.message ? 'ct-input--error' : ''}`}
              placeholder="What happened or what would you like to share?"
              value={formState.message}
              onChange={e => {
                const val = e.target.value;
                setFormState(prev => ({ ...prev, message: val }));
                if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
              }}
              aria-required="true"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? `${messageId}-error` : undefined}
            />
            {errors.message && (
              <p id={`${messageId}-error`} className="ct-error-msg" role="alert">
                {errors.message}
              </p>
            )}
          </div>

          {/* Email field (optional) */}
          <div className="ct-field">
            <label htmlFor={emailId} className="ct-label">
              Your email <span className="ct-optional">(optional)</span>
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              className={`ct-input ${errors.email ? 'ct-input--error' : ''}`}
              placeholder="you@example.com"
              value={formState.email}
              onChange={e => {
                const val = e.target.value;
                setFormState(prev => ({ ...prev, email: val }));
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              aria-invalid={!!errors.email}
              aria-describedby={`${emailId}-hint ${errors.email ? `${emailId}-error` : ''}`}
              autoComplete="email"
            />
            <p id={`${emailId}-hint`} className="ct-hint">
              Add it only if you want a reply. It is used only to answer you.
            </p>
            {errors.email && (
              <p id={`${emailId}-error`} className="ct-error-msg" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="ct-submit-btn"
            disabled={submitState === 'submitting'}
          >
            {submitState === 'submitting' ? 'Opening email…' : 'Send message'}
          </button>
        </form>
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

        /* Form */
        .ct-form-section {
          margin-top: 1.5rem;
        }

        .ct-form-section h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0B1020;
          margin: 0 0 1.5rem;
        }

        .ct-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .ct-honeypot {
          position: absolute;
          left: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .ct-field {
          display: flex;
          flex-direction: column;
        }

        .ct-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.45rem;
        }

        .ct-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0B1020;
          margin-bottom: 0.45rem;
        }

        .ct-label-row .ct-label {
          margin-bottom: 0;
        }

        .ct-required {
          color: #D92D20;
          font-weight: 700;
          margin-left: 2px;
        }

        .ct-optional {
          font-weight: 400;
          color: #4A5468;
          font-size: 0.88rem;
          margin-left: 4px;
        }

        .ct-char-count {
          font-size: 0.82rem;
          color: #4A5468;
        }

        .ct-input, .ct-select, .ct-textarea {
          width: 100%;
          box-sizing: border-box;
          background: #FFFFFF;
          color: #0B1020;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          font-family: inherit;
          min-height: 44px;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }

        .ct-input::placeholder, .ct-textarea::placeholder {
          color: #64748B;
        }

        .ct-input:focus, .ct-select:focus, .ct-textarea:focus {
          border-color: #1558E8;
          box-shadow: 0 0 0 3px rgba(21, 88, 232, 0.15);
        }

        .ct-input--error {
          border-color: #D92D20 !important;
        }

        .ct-textarea {
          resize: vertical;
          min-height: 130px;
          line-height: 1.6;
        }

        .ct-hint {
          font-size: 0.88rem;
          color: #4A5468;
          margin: 0.4rem 0 0 !important;
        }

        .ct-help-note {
          font-size: 0.92rem;
          color: #1558E8;
          background: #F0F5FF;
          border: 1px solid #D8E5FD;
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          margin: 0.65rem 0 0 !important;
        }

        .ct-error-msg {
          font-size: 0.88rem;
          color: #D92D20;
          margin: 0.4rem 0 0 !important;
          font-weight: 500;
        }

        /* Error Summary */
        .ct-error-summary {
          background: #FEF3F2;
          border: 1.5px solid #FECDCA;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.75rem;
        }

        .ct-error-summary:focus {
          outline: 2px solid #D92D20;
          outline-offset: 2px;
        }

        .ct-error-summary h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #B42318;
          margin: 0 0 0.5rem;
        }

        .ct-error-summary ul {
          margin: 0 0 0 1.25rem;
          padding: 0;
          color: #B42318;
        }

        .ct-error-summary a {
          color: #B42318 !important;
          text-decoration: underline;
        }

        /* Status Cards */
        .ct-status-card {
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        .ct-status-card--success {
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          color: #065F46;
        }

        .ct-status-card--success h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #065F46;
          margin: 0 0 0.35rem;
        }

        .ct-status-card--success p {
          color: #065F46 !important;
          margin: 0 0 1rem !important;
        }

        .ct-status-card--error {
          background: #FEF3F2;
          border: 1px solid #FECDCA;
          color: #991B1B;
        }

        .ct-reset-btn {
          background: #FFFFFF;
          border: 1px solid #A7F3D0;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #065F46;
          cursor: pointer;
        }

        .ct-submit-btn {
          background: #1558E8;
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          padding: 0.75rem 1.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          min-height: 48px;
          transition: background 0.15s ease;
          align-self: flex-start;
          font-family: inherit;
        }

        .ct-submit-btn:hover:not(:disabled) {
          background: #1048C6;
        }

        .ct-submit-btn:focus-visible {
          outline: 2px solid #1558E8;
          outline-offset: 3px;
        }

        .ct-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        @media (max-width: 640px) {
          .ct-cards-row {
            grid-template-columns: 1fr;
          }
          .ct-submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </PageLayout>
  );
}
