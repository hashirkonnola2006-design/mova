import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MovaLogo from '../MovaLogo.jsx';
import StartButton from '../StartButton.jsx';
import MenuToggleIcon from '../ui/MenuToggleIcon.jsx';
import { useScrolled } from '../../hooks/useScrolled.js';
import './Header.css';

const NAV_ITEMS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Emergency', href: '#emergency', isEmergency: true },
  { label: 'FAQ', href: '#faq' }
];

export default function Header() {
  const isScrolled = useScrolled(10);
  const location = useLocation();

  const [activeSection, setActiveSection] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [availableLinks, setAvailableLinks] = useState(NAV_ITEMS);

  const toggleBtnRef = useRef(null);
  const mobilePanelRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Check section availability on mount so links to non-existent sections are hidden
  useEffect(() => {
    const valid = NAV_ITEMS.filter(item => {
      const id = item.href.replace('#', '');
      return !!document.getElementById(id);
    });
    setAvailableLinks(valid);
  }, []);

  // Scroll-spy with IntersectionObserver
  useEffect(() => {
    const sectionIds = ['how-it-works', 'emergency', 'faq'];
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -55% 0px',
        threshold: 0.15
      }
    );

    sections.forEach(sec => observer.observe(sec));
    return () => observer.disconnect();
  }, [availableLinks]);

  // Smooth-scroll navigation
  const handleNavClick = useCallback((e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(targetId);
      if (window.history.pushState) {
        window.history.pushState(null, '', href);
      } else {
        window.location.hash = href;
      }
    }
    setMenuOpen(false);
  }, []);

  // Handle Logo click (scroll to top)
  const handleLogoClick = useCallback((e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('');
    if (window.history.pushState) {
      window.history.pushState(null, '', window.location.pathname);
    }
    setMenuOpen(false);
  }, []);

  // Body scroll lock on mobile menu open
  useEffect(() => {
    if (menuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [menuOpen]);

  // Close menu on resize to desktop (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu on route or hash change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Focus trap & Escape key listener for mobile menu
  useEffect(() => {
    if (!menuOpen) return;

    // Focus first link when menu opens
    const timer = setTimeout(() => {
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleBtnRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && mobilePanelRef.current) {
        const focusables = mobilePanelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // Return focus to toggle button when closed by user
  const handleToggleMenu = () => {
    setMenuOpen(prev => {
      const next = !prev;
      if (!next) {
        setTimeout(() => toggleBtnRef.current?.focus(), 50);
      }
      return next;
    });
  };

  return (
    <>
      {/* Accessible Skip-to-Content Link */}
      <a href="#hero" className="lp-skip-to-content">
        Skip to content
      </a>

      {/* Header Outer Sticky Container */}
      <div className={`lp-header-wrapper ${isScrolled ? 'lp-header-wrapper--scrolled' : ''}`}>
        <header
          className={`lp-header ${isScrolled ? 'lp-header--scrolled' : ''}`}
          role="banner"
        >
          <div className="lp-header-container">
            {/* Logo: Link to Top */}
            <a
              href="/"
              className="lp-header-logo-link"
              onClick={handleLogoClick}
              aria-label="MOVA Home"
            >
              <MovaLogo height={32} showWordmark={true} />
            </a>

            {/* Desktop Navigation Links */}
            <nav className="lp-header-nav" aria-label="Primary">
              {availableLinks.map(item => {
                const secId = item.href.replace('#', '');
                const isActive = activeSection === secId;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`lp-header-link ${isActive ? 'lp-header-link--active' : ''} ${item.isEmergency ? 'lp-header-link--emergency' : ''}`}
                    onClick={(e) => handleNavClick(e, item.href)}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    {item.isEmergency && <span className="lp-header-emergency-dot" aria-hidden="true" />}
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="lp-header-actions">
              <Link to="/login" className="lp-header-login-link">
                Log in
              </Link>
              <StartButton
                label="Try MOVA"
                showArrow={false}
                className="lp-header-try-btn"
              />
            </div>

            {/* Mobile Hamburger Toggle Button (44x44 tap target) */}
            <button
              ref={toggleBtnRef}
              type="button"
              className="lp-header-mobile-toggle"
              onClick={handleToggleMenu}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
            >
              <MenuToggleIcon open={menuOpen} size={22} />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Full-Screen Navigation Panel (below 768px) */}
      <div
        id="mobile-nav-panel"
        ref={mobilePanelRef}
        className={`lp-mobile-menu-overlay ${menuOpen ? 'lp-mobile-menu-overlay--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="lp-mobile-menu-content">
          <nav className="lp-mobile-nav-links" aria-label="Mobile Navigation">
            {availableLinks.map((item, idx) => {
              const secId = item.href.replace('#', '');
              const isActive = activeSection === secId;

              return (
                <a
                  key={item.href}
                  ref={idx === 0 ? firstFocusableRef : null}
                  href={item.href}
                  className={`lp-mobile-nav-link ${isActive ? 'lp-mobile-nav-link--active' : ''}`}
                  onClick={(e) => handleNavClick(e, item.href)}
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span>{item.label}</span>
                  {item.isEmergency && (
                    <span className="lp-mobile-emergency-badge">Emergency</span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Bottom Pinned Mobile Actions */}
          <div className="lp-mobile-menu-footer">
            <Link
              to="/login"
              className="lp-mobile-login-link"
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>
            <StartButton
              label="Try MOVA"
              showArrow={true}
              className="lp-mobile-try-btn"
            />
          </div>
        </div>
      </div>
    </>
  );
}
