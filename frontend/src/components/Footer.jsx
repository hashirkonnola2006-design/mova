import React from 'react';
import { Link } from 'react-router-dom';
import MovaLogo from '../components/MovaLogo.jsx';
import { SITE_INFO } from '../data/siteInfo.js';
import './Footer.css';

/**
 * Footer — used on all landing and support pages.
 * Three columns + bottom row. Social links hidden if empty.
 */
export default function Footer() {
  const year = SITE_INFO.copyrightYear;

  return (
    <footer className="ft-root" role="contentinfo" aria-label="Site footer">
      <div className="ft-inner">
        {/* ── Three columns ───────────────────────────── */}
        <div className="ft-cols">
          {/* Col 1: Brand */}
          <div className="ft-col ft-col--brand">
            <Link to="/" className="ft-logo" aria-label="MOVA home">
              <MovaLogo height={26} showWordmark={true} />
            </Link>
            <p className="ft-tagline">
              Real-time ISL to Malayalam translation.
              Runs in your browser.
            </p>
            {/* Social links — hidden if empty */}
            {(SITE_INFO.githubUrl || SITE_INFO.linkedinUrl || SITE_INFO.twitterUrl) && (
              <div className="ft-social">
                {SITE_INFO.githubUrl && (
                  <a href={SITE_INFO.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="ft-social-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                  </a>
                )}
                {SITE_INFO.linkedinUrl && (
                  <a href={SITE_INFO.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="ft-social-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {SITE_INFO.twitterUrl && (
                  <a href={SITE_INFO.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="ft-social-link">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Col 2: Product */}
          <div className="ft-col">
            <h3 className="ft-col-heading">Product</h3>
            <nav aria-label="Product navigation">
              <ul className="ft-links">
                <li><a href="/#how-it-works" className="ft-link">How it works</a></li>
                <li><a href="/#faq" className="ft-link">FAQ</a></li>
                <li><Link to="/supported-signs" className="ft-link">Supported signs</Link></li>
                <li><Link to="/login" className="ft-link">Start translating</Link></li>
                <li><Link to="/help" className="ft-link">Help</Link></li>
              </ul>
            </nav>
          </div>

          {/* Col 3: Company & Legal */}
          <div className="ft-col">
            <h3 className="ft-col-heading">Company & Legal</h3>
            <nav aria-label="Company and legal navigation">
              <ul className="ft-links">
                <li><Link to="/about" className="ft-link">About</Link></li>
                <li><Link to="/contact" className="ft-link">Contact</Link></li>
                <li><Link to="/accessibility" className="ft-link">Accessibility</Link></li>
                <li><Link to="/privacy" className="ft-link">Privacy Policy</Link></li>
                <li><Link to="/terms" className="ft-link">Terms of Use</Link></li>
              </ul>
            </nav>
          </div>
        </div>

        {/* ── Bottom row ──────────────────────────────── */}
        <div className="ft-bottom">
          <p className="ft-copyright">
            © {year} MOVA.{' '}
            <span>Built at {SITE_INFO.collegeName}.</span>
          </p>
          <p className="ft-disclaimer">
            MOVA is a communication aid. Not for emergency or medical use.
          </p>
        </div>
      </div>
    </footer>
  );
}
