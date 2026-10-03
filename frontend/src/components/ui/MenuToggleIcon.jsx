import React from 'react';

/**
 * Animated SVG hamburger icon that morphs into an 'X' over 300ms.
 * 
 * @param {boolean} open - Whether the menu is currently expanded
 * @param {string} className - Optional additional CSS class
 * @param {number} size - Size in pixels (default: 24)
 */
export default function MenuToggleIcon({ open = false, className = '', size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`menu-toggle-icon ${open ? 'menu-toggle-icon--open' : ''} ${className}`}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <style>{`
        .menu-toggle-icon line {
          transform-origin: center;
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease;
        }
        .menu-toggle-icon--open .line-top {
          transform: translateY(6px) rotate(45deg);
        }
        .menu-toggle-icon--open .line-mid {
          opacity: 0;
          transform: scaleX(0);
        }
        .menu-toggle-icon--open .line-bot {
          transform: translateY(-6px) rotate(-45deg);
        }
        @media (prefers-reduced-motion: reduce) {
          .menu-toggle-icon line {
            transition: none !important;
          }
        }
      `}</style>
      <line x1="4" y1="6" x2="20" y2="6" className="line-top" />
      <line x1="4" y1="12" x2="20" y2="12" className="line-mid" />
      <line x1="4" y1="18" x2="20" y2="18" className="line-bot" />
    </svg>
  );
}
