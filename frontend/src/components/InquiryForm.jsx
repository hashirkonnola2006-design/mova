import React, { useState, useEffect, useRef, useId } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { sendInquiry } from '../services/inquiry.js';
import { SITE_INFO } from '../data/siteInfo.js';

export const INQUIRY_TYPES = [
  'Question',
  'Help with the app',
  'Bug',
  'Wrong translation',
  'Suggestion',
  'I can help with signs',
  'Other'
];

/**
 * Gather non-invasive client technical metrics ONLY when consented
 */
function getSystemTechnicalDetails() {
  return {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    language: typeof navigator !== 'undefined' ? navigator.language : 'Unknown',
    screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Unknown',
    viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown',
    cameraApiSupported: typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    pagePath: typeof window !== 'undefined' ? window.location.pathname : '/'
  };
}

export default function InquiryForm({
  source = '',
  type = 'Question',
  initialMessage = '',
  compact = false,
  allowTechDetails = false,
  techContext = null,
  onSent = null,
  onCancel = null
}) {
  const { session } = useAuth();
  const uid = useId();

  const typeId = `${uid}-type`;
  const messageId = `${uid}-message`;
  const emailId = `${uid}-email`;
  const techId = `${uid}-tech`;
  const honeypotId = `${uid}-website`;

  const [selectedType, setSelectedType] = useState(type);
  const [message, setMessage] = useState(initialMessage);
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [includeTech, setIncludeTech] = useState(false);
  const [techPreview, setTechPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, msg: '', mailto: null });
  const [errorSummary, setErrorSummary] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const errorSummaryRef = useRef(null);

  // Autofill signed-in user's email if available
  useEffect(() => {
    if (session?.email && !email) {
      setEmail(session.email);
    }
  }, [session]);

  // Update initial message / type if props change
  useEffect(() => {
    if (type) setSelectedType(type);
    if (initialMessage && !message) setMessage(initialMessage);
  }, [type, initialMessage]);

  // Handle tech details consent preview
  useEffect(() => {
    if (includeTech) {
      const details = {
        ...getSystemTechnicalDetails(),
        ...(techContext || {})
      };
      setTechPreview(details);
    } else {
      setTechPreview(null);
    }
  }, [includeTech, techContext]);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setCopySuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check
    if (honeypot) {
      return;
    }

    const errors = [];
    if (!selectedType) {
      errors.push({ field: typeId, message: 'Please select a message type.' });
    }
    if (!message.trim()) {
      errors.push({ field: messageId, message: 'Please enter your message.' });
    } else if (message.length > 2000) {
      errors.push({ field: messageId, message: 'Message exceeds 2000 characters limit.' });
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push({ field: emailId, message: 'Please enter a valid email address.' });
    }

    if (errors.length > 0) {
      setErrorSummary(errors);
      setTimeout(() => {
        if (errorSummaryRef.current) errorSummaryRef.current.focus();
      }, 50);
      return;
    }

    setErrorSummary([]);
    setSubmitting(true);
    setStatus({ type: null, msg: '', mailto: null });

    const res = await sendInquiry({
      source: source || (typeof window !== 'undefined' ? window.location.pathname : ''),
      type: selectedType,
      message,
      email: email.trim(),
      techDetails: includeTech ? techPreview : null
    });

    setSubmitting(false);

    if (res.ok) {
      setStatus({
        type: 'success',
        msg: 'Sent. Thank you, Hashir will read it.'
      });
      // Clear message and state
      setMessage('');
      if (onSent) onSent();
    } else {
      // If endpoint not configured in dev, open mailto fallback and show note
      if (res.notConfigured && res.mailtoFallback) {
        window.location.href = res.mailtoFallback;
        setStatus({
          type: 'success',
          msg: 'Opening email client with your message. Hashir will read it.'
        });
        if (onSent) onSent();
        return;
      }

      setStatus({
        type: 'error',
        msg: res.isOffline
          ? 'You appear to be offline. Your message is still here.'
          : "We couldn't send it. Your message is still here.",
        subtext: res.error,
        mailto: res.mailtoFallback
      });
    }
  };

  return (
    <div className={`iq-root ${compact ? 'iq-root--compact' : ''}`}>
      {/* Dev-only configuration banner */}
      {import.meta.env.DEV && !import.meta.env.VITE_FORM_ENDPOINT && (
        <div className="iq-dev-banner" role="status">
          <strong>Dev note:</strong> Form endpoint not configured. Messages will fall back to mailto for <code>{SITE_INFO.contactEmail}</code>.
        </div>
      )}

      {/* Accessible Error Summary */}
      {errorSummary.length > 0 && (
        <div
          className="iq-error-summary"
          role="alert"
          tabIndex={-1}
          ref={errorSummaryRef}
          aria-labelledby={`${uid}-err-title`}
        >
          <h4 id={`${uid}-err-title`}>Please resolve the following issues:</h4>
          <ul>
            {errorSummary.map((err, idx) => (
              <li key={idx}>
                <a href={`#${err.field}`}>{err.message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Notification */}
      {status.type === 'success' && (
        <div className="iq-status-banner iq-status-banner--success" role="status" aria-live="polite">
          <div className="iq-status-title">✓ {status.msg}</div>
        </div>
      )}

      {/* Failure Notification with Recovery Actions */}
      {status.type === 'error' && (
        <div className="iq-status-banner iq-status-banner--error" role="alert" aria-live="polite">
          <div className="iq-status-title">⚠ {status.msg}</div>
          {status.subtext && <p className="iq-status-desc">{status.subtext}</p>}
          <div className="iq-recovery-actions">
            <button
              type="button"
              className="iq-action-btn iq-action-btn--primary"
              onClick={handleSubmit}
            >
              Try again
            </button>
            <button
              type="button"
              className="iq-action-btn"
              onClick={handleCopyMessage}
            >
              {copySuccess ? 'Copied!' : 'Copy my message'}
            </button>
            {status.mailto && (
              <a href={status.mailto} className="iq-action-btn iq-action-link">
                Email us directly
              </a>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="iq-form" aria-label="Feedback inquiry form">
        {/* Honeypot field */}
        <div className="iq-honeypot" aria-hidden="true">
          <label htmlFor={honeypotId}>Leave this field blank</label>
          <input
            id={honeypotId}
            type="text"
            name="honeypot"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
          />
        </div>

        {/* Type field */}
        {!compact ? (
          <div className="iq-field">
            <label htmlFor={typeId} className="iq-label">
              Type <span className="iq-req" aria-hidden="true">*</span>
            </label>
            <select
              id={typeId}
              className="iq-select"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              aria-required="true"
            >
              {INQUIRY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="type" value={selectedType} />
        )}

        {/* Message field */}
        <div className="iq-field">
          <div className="iq-label-row">
            <label htmlFor={messageId} className="iq-label">
              Message <span className="iq-req" aria-hidden="true">*</span>
            </label>
            <span className="iq-counter" aria-live="polite">
              {message.length} / 2000
            </span>
          </div>
          <textarea
            id={messageId}
            rows={compact ? 4 : 5}
            maxLength={2000}
            className="iq-textarea"
            placeholder={
              selectedType === 'Bug'
                ? 'Describe what happened and what you expected...'
                : selectedType === 'Wrong translation'
                ? 'Which sign was misidentified or translated incorrectly?'
                : 'Write your message...'
            }
            value={message}
            onChange={e => setMessage(e.target.value)}
            aria-required="true"
          />
        </div>

        {/* Email field (optional) */}
        <div className="iq-field">
          <label htmlFor={emailId} className="iq-label">
            Your email <span className="iq-opt">(optional)</span>
          </label>
          <input
            id={emailId}
            type="email"
            className="iq-input"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-describedby={`${emailId}-hint`}
            autoComplete="email"
          />
          <p id={`${emailId}-hint`} className="iq-hint">
            Add it only if you want a reply. It is used only to answer you.
          </p>
        </div>

        {/* Optional Technical Details consent (Help pages) */}
        {allowTechDetails && (
          <div className="iq-tech-box">
            <label className="iq-checkbox-label">
              <input
                id={techId}
                type="checkbox"
                checked={includeTech}
                onChange={e => setIncludeTech(e.target.checked)}
              />
              <span>Include technical details to help fix this</span>
            </label>
            {includeTech && techPreview && (
              <div className="iq-tech-preview" aria-live="polite">
                <span className="iq-tech-preview-title">Technical information to be sent:</span>
                <ul>
                  <li><strong>Browser:</strong> {techPreview.userAgent}</li>
                  <li><strong>Viewport:</strong> {techPreview.viewport} (Screen: {techPreview.screenResolution})</li>
                  <li><strong>Language:</strong> {techPreview.language}</li>
                  <li><strong>Camera API:</strong> {techPreview.cameraApiSupported ? 'Available' : 'Unavailable'}</li>
                  <li><strong>Path:</strong> {techPreview.pagePath}</li>
                </ul>
                <p className="iq-tech-preview-sub">No IP address, camera feed, or images are ever included.</p>
              </div>
            )}
          </div>
        )}

        {/* Always-shown privacy disclosure */}
        <p className="iq-disclosure">
          Your message is emailed to Hashir. Please don't include passwords or medical details.
        </p>

        {/* Action button row */}
        <div className="iq-btn-row">
          <button
            type="submit"
            className="iq-submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Sending...' : 'Send message'}
          </button>
          {onCancel && (
            <button
              type="button"
              className="iq-cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <style>{`
        .iq-root {
          background: #FFFFFF;
          border-radius: 16px;
        }

        .iq-root--compact {
          padding: 1.25rem;
          background: #F8FAFC;
          border: 1px solid #E8EDF5;
          margin-top: 1rem;
        }

        .iq-dev-banner {
          background: #FFFBEB;
          border: 1px solid #FCD34D;
          border-radius: 8px;
          padding: 0.6rem 0.9rem;
          margin-bottom: 1.25rem;
          font-size: 0.82rem;
          color: #92400E;
        }

        .iq-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .iq-honeypot {
          position: absolute;
          left: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .iq-field {
          display: flex;
          flex-direction: column;
        }

        .iq-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.4rem;
        }

        .iq-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0B1020;
          margin-bottom: 0.4rem;
        }

        .iq-label-row .iq-label {
          margin-bottom: 0;
        }

        .iq-req {
          color: #D92D20;
          margin-left: 2px;
        }

        .iq-opt {
          font-weight: 400;
          color: #4A5468;
          font-size: 0.85rem;
          margin-left: 4px;
        }

        .iq-counter {
          font-size: 0.82rem;
          color: #4A5468;
        }

        .iq-input, .iq-select, .iq-textarea {
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
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .iq-input:focus, .iq-select:focus, .iq-textarea:focus {
          border-color: #1558E8;
          box-shadow: 0 0 0 3px rgba(21, 88, 232, 0.15);
        }

        .iq-textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .iq-hint {
          font-size: 0.85rem;
          color: #4A5468;
          margin: 0.35rem 0 0 !important;
        }

        /* Tech details */
        .iq-tech-box {
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 0.85rem 1rem;
        }

        .iq-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          cursor: pointer;
          font-size: 0.92rem;
          font-weight: 500;
          color: #0B1020;
        }

        .iq-tech-preview {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #CBD5E1;
          font-size: 0.82rem;
          color: #475569;
        }

        .iq-tech-preview-title {
          font-weight: 600;
          color: #0B1020;
          display: block;
          margin-bottom: 0.4rem;
        }

        .iq-tech-preview ul {
          margin: 0 0 0.5rem 1.25rem;
          padding: 0;
        }

        .iq-tech-preview-sub {
          margin: 0;
          color: #64748B;
          font-style: italic;
        }

        /* Disclosure line */
        .iq-disclosure {
          font-size: 0.85rem;
          color: #4A5468;
          margin: 0 !important;
          line-height: 1.5;
        }

        /* Button row */
        .iq-btn-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .iq-submit-btn {
          background: #1558E8;
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          padding: 0.75rem 1.6rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          min-height: 44px;
          transition: background 0.15s ease;
          font-family: inherit;
        }

        .iq-submit-btn:hover:not(:disabled) {
          background: #1048C6;
        }

        .iq-submit-btn:focus-visible {
          outline: 2px solid #1558E8;
          outline-offset: 2px;
        }

        .iq-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .iq-cancel-btn {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 10px;
          padding: 0.75rem 1.25rem;
          font-size: 0.92rem;
          font-weight: 500;
          color: #4A5468;
          cursor: pointer;
          min-height: 44px;
        }

        /* Error Summary */
        .iq-error-summary {
          background: #FEF3F2;
          border: 1.5px solid #FECDCA;
          border-radius: 10px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.25rem;
        }

        .iq-error-summary:focus {
          outline: 2px solid #D92D20;
          outline-offset: 2px;
        }

        .iq-error-summary h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #B42318;
          margin: 0 0 0.35rem;
        }

        .iq-error-summary ul {
          margin: 0 0 0 1.25rem;
          padding: 0;
          color: #B42318;
          font-size: 0.88rem;
        }

        .iq-error-summary a {
          color: #B42318 !important;
          text-decoration: underline;
        }

        /* Status Banners */
        .iq-status-banner {
          border-radius: 10px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.25rem;
        }

        .iq-status-banner--success {
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          color: #065F46;
        }

        .iq-status-banner--error {
          background: #FEF3F2;
          border: 1.5px solid #FECDCA;
          color: #991B1B;
        }

        .iq-status-title {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .iq-status-desc {
          margin: 0.35rem 0 0.75rem;
          font-size: 0.88rem;
        }

        .iq-recovery-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
        }

        .iq-action-btn {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 0.4rem 0.85rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #0B1020;
          cursor: pointer;
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }

        .iq-action-btn--primary {
          background: #1558E8;
          color: #FFFFFF;
          border-color: #1558E8;
        }

        .iq-action-btn:hover {
          background: #F1F5F9;
        }

        .iq-action-btn--primary:hover {
          background: #1048C6;
        }
      `}</style>
    </div>
  );
}
