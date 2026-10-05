import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './NavMenuDropdown.css';

/**
 * Ordered list of secondary pages as specified in design requirements
 */
const MORE_PAGES = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use', to: '/terms' },
];

/**
 * NavMenuDropdown — Universal navbar menu dropdown component.
 * Placed immediately after "Try MOVA" across pages.
 */
export default function NavMenuDropdown({ includeMainLinksOnMobile = false, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const containerRef = useRef(null);
  const btnRef = useRef(null);
  const linksRef = useRef([]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen]);

  // Escape key to close and return focus to toggle button
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close when user scrolls
  useEffect(() => {
    if (!isOpen) return;
    const initialScroll = window.scrollY;
    const handleScroll = () => {
      if (Math.abs(window.scrollY - initialScroll) > 20) {
        setIsOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Auto-focus first or active link when opened
  useEffect(() => {
    if (isOpen) {
      const activeIdx = MORE_PAGES.findIndex(p => p.to === location.pathname);
      const targetIdx = activeIdx >= 0 ? activeIdx : 0;
      const timer = setTimeout(() => {
        linksRef.current[targetIdx]?.focus();
      }, 45);
      return () => clearTimeout(timer);
    }
  }, [isOpen, location.pathname]);

  // Lock body scroll on mobile while menu is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Keyboard arrow navigation
  const handleKeyDown = (e) => {
    const validLinks = linksRef.current.filter(Boolean);
    if (!validLinks.length) return;
    const currentIndex = validLinks.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < validLinks.length - 1 ? currentIndex + 1 : 0;
      validLinks[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : validLinks.length - 1;
      validLinks[prevIndex]?.focus();
    } else if (e.key === 'Tab') {
      if (!e.shiftKey && currentIndex === validLinks.length - 1) {
        setIsOpen(false);
      } else if (e.shiftKey && currentIndex === 0) {
        setIsOpen(false);
        btnRef.current?.focus();
      }
    }
  };

  return (
    <div className={`mova-menu-wrap ${className}`} ref={containerRef}>
      {/* Mobile backdrop for easy tap-out dismissal */}
      {isOpen && (
        <div
          className="mova-dropdown-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Morphing Menu / Close Button */}
      <button
        ref={btnRef}
        type="button"
        id="mova-nav-menu-button"
        className={`mova-menu-btn ${isOpen ? 'mova-menu-btn--open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mova-nav-dropdown-menu"
      >
        {isOpen ? (
          <X size={20} strokeWidth={2.2} className="mova-menu-icon mova-menu-icon--close" />
        ) : (
          <Menu size={20} strokeWidth={2.2} className="mova-menu-icon mova-menu-icon--open" />
        )}
      </button>

      {/* Dropdown Card */}
      <div
        id="mova-nav-dropdown-menu"
        role="menu"
        aria-labelledby="mova-nav-menu-button"
        className={`mova-dropdown-card ${isOpen ? 'mova-dropdown-card--open' : ''}`}
        aria-hidden={!isOpen}
        onKeyDown={handleKeyDown}
      >
        <div className="mova-dropdown-inner">
          {/* If enabled, expose primary links on mobile when topbar hides them */}
          {includeMainLinksOnMobile && (
            <div className="mova-dropdown-mobile-header">
              <Link
                to="/#how-it-works"
                role="menuitem"
                className="mova-dropdown-item"
                onClick={() => setIsOpen(false)}
                tabIndex={isOpen ? 0 : -1}
              >
                <span>How it works</span>
              </Link>
              <Link
                to="/#faq"
                role="menuitem"
                className="mova-dropdown-item"
                onClick={() => setIsOpen(false)}
                tabIndex={isOpen ? 0 : -1}
              >
                <span>FAQ</span>
              </Link>
              <div className="mova-dropdown-divider" aria-hidden="true" />
            </div>
          )}

          {MORE_PAGES.map((page, idx) => {
            const isActive = location.pathname === page.to;
            return (
              <Link
                key={page.to}
                ref={el => (linksRef.current[idx] = el)}
                to={page.to}
                role="menuitem"
                className={`mova-dropdown-item ${isActive ? 'mova-dropdown-item--active' : ''}`}
                onClick={() => setIsOpen(false)}
                tabIndex={isOpen ? 0 : -1}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{page.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
