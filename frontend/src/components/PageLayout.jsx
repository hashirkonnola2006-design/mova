import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MovaLogo from '../components/MovaLogo.jsx';
import NavMenuDropdown from './NavMenuDropdown.jsx';
import Footer from './Footer.jsx';
import './PageLayout.css';

/**
 * PageLayout — shared wrapper for all public support pages.
 * Renders the landing header, a page title area, a readable content column,
 * and the full footer. Also scrolls to top on route change.
 */
export default function PageLayout({ title, description, fullWidth = false, children }) {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="pl-root">
      {/* ── Minimal header ─────────────────────────────── */}
      <header className="pl-header" role="banner">
        <div className="pl-header-inner">
          <Link to="/" className="pl-brand" aria-label="MOVA – go to home page">
            <MovaLogo height={28} showWordmark={true} />
          </Link>
          <nav className="pl-header-nav" aria-label="Site navigation">
            <Link to="/#how-it-works">How it works</Link>
            <Link to="/#faq">FAQ</Link>
            <Link to="/contact">Contact</Link>
            <div className="pl-header-cta-group">
              <Link to="/login" className="pl-header-cta">Try MOVA</Link>
              <NavMenuDropdown includeMainLinksOnMobile={true} />
            </div>
          </nav>
        </div>
      </header>

      {/* ── Page title area ─────────────────────────────── */}
      {title && (
        <div className="pl-title-area" aria-label="Page title area">
          <div className="pl-title-inner">
            <h1 className="pl-page-title">{title}</h1>
            {description && (
              <p className="pl-page-description">{description}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Content column ─────────────────────────────── */}
      <main className={`pl-content ${fullWidth ? 'pl-content--fullwidth' : ''}`} id="main-content">
        {fullWidth ? (
          children
        ) : (
          <div className="pl-content-inner">
            {children}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
