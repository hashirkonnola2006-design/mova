import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MovaLogo from '../MovaLogo.jsx';
import StartButton from '../StartButton.jsx';
import MenuToggleIcon from '../ui/MenuToggleIcon.jsx';
import { useScrolled } from '../../hooks/useScrolled.js';
import './Header.css';

const NAV_ITEMS = [
  { label: 'Home', href: '#hero' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
  { label: 'About', to: '/about' }
];

const MORE_PAGES = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use', to: '/terms' }
];

export default function Header() {
  const isScrolled = useScrolled(10);
  const location = useLocation();

  const [activeSection, setActiveSection] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availableLinks, setAvailableLinks] = useState(NAV_ITEMS);

  const toggleBtnRef = useRef(null);
  const mobilePanelRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const dropdownContainerRef = useRef(null);
  const dropdownBtnRef = useRef(null);
  const dropdownLinksRef = useRef([]);

  // Check section availability on mount so links to non-existent sections are hidden
  useEffect(() => {
    const valid = NAV_ITEMS.filter(item => {
      if (item.to) return true;
      const id = item.href.replace('#', '');
      return !!document.getElementById(id);
    });
    setAvailableLinks(valid);
  }, []);

  // Scroll-spy with IntersectionObserver
  useEffect(() => {
    const sectionIds = ['how-it-works', 'features', 'faq'];
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

  // Close mobile and desktop menus on route or hash change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Desktop dropdown: click outside listener
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [dropdownOpen]);

  // Desktop dropdown: Escape key closes and returns focus to button
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        dropdownBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  // Desktop dropdown: Close when user scrolls
  useEffect(() => {
    if (!dropdownOpen) return;
    const initialScroll = window.scrollY;
    const handleScroll = () => {
      if (Math.abs(window.scrollY - initialScroll) > 20) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dropdownOpen]);

  // Desktop dropdown: Auto-focus first or active item when opened
  useEffect(() => {
    if (dropdownOpen) {
      const activeIdx = MORE_PAGES.findIndex(p => p.to === location.pathname);
      const targetIdx = activeIdx >= 0 ? activeIdx : 0;
      const timer = setTimeout(() => {
        dropdownLinksRef.current[targetIdx]?.focus();
      }, 45);
      return () => clearTimeout(timer);
    }
  }, [dropdownOpen, location.pathname]);

  // Desktop dropdown: Keyboard arrow up and down navigation
  const handleDropdownKeyDown = (e) => {
    const links = dropdownLinksRef.current.filter(Boolean);
    if (!links.length) return;
    const currentIndex = links.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < links.length - 1 ? currentIndex + 1 : 0;
      links[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1;
      links[prevIndex]?.focus();
    } else if (e.key === 'Tab') {
      // Smooth exit if tabbing out
      if (!e.shiftKey && currentIndex === links.length - 1) {
        setDropdownOpen(false);
      } else if (e.shiftKey && currentIndex === 0) {
        setDropdownOpen(false);
        dropdownBtnRef.current?.focus();
      }
    }
  };

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
                if (item.to) {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`lp-header-link ${isActive ? 'lp-header-link--active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                }
                const secId = item.href.replace('#', '');
                const isActive = activeSection === secId;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`lp-header-link ${isActive ? 'lp-header-link--active' : ''}`}
                    onClick={(e) => handleNavClick(e, item.href)}
                    aria-current={isActive ? 'location' : undefined}
                  >
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
              <div className="lp-header-btn-group">
                <StartButton
                  label="Try MOVA"
                  showArrow={false}
                  className="lp-header-try-btn"
                />

                {/* Desktop Menu Dropdown Toggle */}
                <div className="lp-header-menu-wrap" ref={dropdownContainerRef}>
                  <button
                    ref={dropdownBtnRef}
                    id="nav-dropdown-button"
                    type="button"
                    className={`lp-header-menu-btn ${dropdownOpen ? 'lp-header-menu-btn--open' : ''}`}
                    onClick={() => setDropdownOpen(prev => !prev)}
                    aria-label={dropdownOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={dropdownOpen}
                    aria-controls="nav-dropdown-menu"
                  >
                    {dropdownOpen ? (
                      <X size={20} strokeWidth={2.2} className="lp-menu-icon lp-menu-icon--close" />
                    ) : (
                      <Menu size={20} strokeWidth={2.2} className="lp-menu-icon lp-menu-icon--open" />
                    )}
                  </button>

                  {/* Dropdown Card */}
                  <div
                    id="nav-dropdown-menu"
                    role="menu"
                    aria-labelledby="nav-dropdown-button"
                    className={`lp-nav-dropdown ${dropdownOpen ? 'lp-nav-dropdown--open' : ''}`}
                    aria-hidden={!dropdownOpen}
                    onKeyDown={handleDropdownKeyDown}
                  >
                    <div className="lp-nav-dropdown-inner">
                      {MORE_PAGES.map((page, idx) => {
                        const isActive = location.pathname === page.to;
                        return (
                          <Link
                            key={page.to}
                            ref={el => (dropdownLinksRef.current[idx] = el)}
                            to={page.to}
                            role="menuitem"
                            className={`lp-nav-dropdown-item ${isActive ? 'lp-nav-dropdown-item--active' : ''}`}
                            onClick={() => setDropdownOpen(false)}
                            tabIndex={dropdownOpen ? 0 : -1}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <span>{page.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
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
              if (item.to) {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    ref={idx === 0 ? firstFocusableRef : null}
                    to={item.to}
                    className={`lp-mobile-nav-link ${isActive ? 'lp-mobile-nav-link--active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              }
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
                </a>
              );
            })}
          </nav>

          {/* Separate group for More pages */}
          <div className="lp-mobile-menu-divider" aria-hidden="true" />
          <div className="lp-mobile-group-label">More</div>
          <nav className="lp-mobile-subnav-links" aria-label="More pages">
            {MORE_PAGES.map(page => {
              const isActive = location.pathname === page.to;
              return (
                <Link
                  key={page.to}
                  to={page.to}
                  className={`lp-mobile-subnav-link ${isActive ? 'lp-mobile-subnav-link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{page.label}</span>
                </Link>
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
