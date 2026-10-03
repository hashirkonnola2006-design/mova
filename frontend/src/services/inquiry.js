import { SITE_INFO } from '../data/siteInfo.js';

// 30 second throttle tracking
let lastSentTime = 0;
const THROTTLE_MS = 30000;

/**
 * Strip HTML tags to prevent XSS / markup injection
 */
function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Build mailto link as fallback
 */
export function buildMailtoFallback({ type, message, email, source, techDetails }) {
  const recipient = SITE_INFO.contactEmail;
  const shortSource = source ? source.replace(/^[/\\]+/, '') || 'home' : 'site';
  const subject = `[MOVA] ${type || 'Inquiry'} · ${shortSource}`;

  const path = typeof window !== 'undefined' ? window.location.pathname : (source || '/');
  const lines = [
    `Type: ${type || 'General'}`,
    `Message:\n${message}`,
    email ? `Reply-to: ${email}` : null,
    `Source page: ${path}`,
    `Time: ${new Date().toISOString()}`,
    techDetails ? `\nTechnical Details:\n${JSON.stringify(techDetails, null, 2)}` : null
  ].filter(Boolean);

  const body = encodeURIComponent(lines.join('\n\n'));
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

/**
 * Send inquiry through unified transport
 * @param {Object} options
 * @param {string} options.source - Path or section source
 * @param {string} options.type - Inquiry type
 * @param {string} options.message - User message text
 * @param {string} [options.email] - Optional user email for reply
 * @param {Object} [options.techDetails] - Optional technical details (only when user explicitly consented)
 * @returns {Promise<{ ok: boolean, error?: string, isOffline?: boolean, mailtoFallback?: string }>}
 */
export async function sendInquiry({ source, type, message, email, techDetails }) {
  // Check online status
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      ok: false,
      isOffline: true,
      error: 'You appear to be offline. Check your internet connection and try again.',
      mailtoFallback: buildMailtoFallback({ type, message, email, source, techDetails })
    };
  }

  // 30s throttle check
  const now = Date.now();
  if (now - lastSentTime < THROTTLE_MS) {
    const remainingSecs = Math.ceil((THROTTLE_MS - (now - lastSentTime)) / 1000);
    return {
      ok: false,
      error: `Please wait ${remainingSecs} seconds before sending another message.`,
      mailtoFallback: buildMailtoFallback({ type, message, email, source, techDetails })
    };
  }

  const cleanMessage = sanitizeText(message);
  const cleanEmail = sanitizeText(email);
  const cleanType = sanitizeText(type) || 'General';
  const cleanSource = sanitizeText(source) || window.location.pathname;

  if (!cleanMessage) {
    return {
      ok: false,
      error: 'Please enter a message before sending.'
    };
  }

  const endpoint = import.meta.env.VITE_FORM_ENDPOINT;
  const accessKey = import.meta.env.VITE_FORM_ACCESS_KEY;

  const payload = {
    type: cleanType,
    message: cleanMessage,
    source_path: typeof window !== 'undefined' ? window.location.pathname : cleanSource,
    timestamp: new Date().toISOString()
  };

  if (accessKey) {
    payload.access_key = accessKey;
  }

  if (cleanEmail) {
    payload.email = cleanEmail;
    payload._replyto = cleanEmail;
  }

  if (techDetails && typeof techDetails === 'object') {
    payload.tech_details = techDetails;
  }

  // If no endpoint configured (e.g. dev or unconfigured deployment), use mailto fallback
  if (!endpoint) {
    return {
      ok: false,
      notConfigured: true,
      error: 'Form endpoint is not configured.',
      mailtoFallback: buildMailtoFallback({
        type: cleanType,
        message: cleanMessage,
        email: cleanEmail,
        source: cleanSource,
        techDetails
      })
    };
  }

  // Timeout controller (15s limit)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errText = `Server error (${res.status})`;
      try {
        const data = await res.json();
        if (data && (data.error || data.message)) {
          errText = data.error || data.message;
        }
      } catch {
        // use default status
      }
      return {
        ok: false,
        error: errText,
        mailtoFallback: buildMailtoFallback({
          type: cleanType,
          message: cleanMessage,
          email: cleanEmail,
          source: cleanSource,
          techDetails
        })
      };
    }

    lastSentTime = Date.now();
    return { ok: true };
  } catch (err) {
    clearTimeout(timeoutId);

    const isTimeout = err.name === 'AbortError';
    const errorMsg = isTimeout
      ? 'The request timed out after 15 seconds.'
      : (err.message || 'Network request failed.');

    return {
      ok: false,
      error: errorMsg,
      mailtoFallback: buildMailtoFallback({
        type: cleanType,
        message: cleanMessage,
        email: cleanEmail,
        source: cleanSource,
        techDetails
      })
    };
  }
}
