import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SITE_INFO } from '../../data/siteInfo.js';
import './CurvedMenu.css';

// Default navigation links matching user's requested pages from image 2
export const MOVA_NAV_ITEMS = [
  {
    heading: 'About',
    href: '/about',
    subheading: 'Our mission and the team behind MOVA'
  },
  {
    heading: 'Contact',
    href: '/contact',
    subheading: 'Get in touch or report an issue'
  },
  {
    heading: 'Accessibility',
    href: '/accessibility',
    subheading: 'WCAG compliance and inclusive design'
  },
  {
    heading: 'Privacy Policy',
    href: '/privacy',
    subheading: 'How we safeguard your camera and sign data'
  },
  {
    heading: 'Terms of Use',
    href: '/terms',
    subheading: 'Our usage terms and community guidelines'
  }
];

const MENU_SLIDE_ANIMATION = {
  initial: { x: 'calc(100% + 100px)' },
  enter: {
    x: '0',
    transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] }
  },
  exit: {
    x: 'calc(100% + 100px)',
    transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] }
  }
};

const CustomFooter = () => {
  return (
    <div className="curved-menu-footer">
      <div className="curved-menu-footer-links">
        <a
          href={SITE_INFO.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="curved-menu-social-icon"
          aria-label="LinkedIn"
          title="LinkedIn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.5a1.63 1.63 0 0 0-1.63 1.62c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63A1.63 1.63 0 0 0 7.86 6.5Z"/>
          </svg>
        </a>
        <a
          href={SITE_INFO.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="curved-menu-social-icon"
          aria-label="GitHub"
          title="GitHub"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/>
          </svg>
        </a>
        <a
          href="/"
          className="curved-menu-social-icon"
          aria-label="MOVA Home"
          title="MOVA Home"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </a>
      </div>
      <span className="curved-menu-footer-brand">MOVA · 2026</span>
    </div>
  );
};

const NavLink = ({ heading, href, setIsActive, index }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleClick = () => {
    setIsActive(false);
  };

  return (
    <motion.div
      onClick={handleClick}
      initial="initial"
      whileHover="whileHover"
      className="curved-menu-nav-item"
    >
      <Link ref={ref} onMouseMove={handleMouseMove} to={href} className="curved-menu-link-wrapper">
        <span className="curved-menu-item-num">0{index}.</span>
        <div className="curved-menu-letters-box">
          <motion.span
            variants={{
              initial: { x: 0 },
              whileHover: { x: -8 }
            }}
            transition={{
              type: 'spring',
              staggerChildren: 0.05,
              delayChildren: 0.15
            }}
            className="curved-menu-letter-container"
          >
            {heading.split('').map((letter, i) => (
              <motion.span
                key={i}
                variants={{
                  initial: { x: 0 },
                  whileHover: { x: 8 }
                }}
                transition={{ type: 'spring' }}
                className="curved-menu-letter"
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
};

const Curve = () => {
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const initialPath = `M100 0 L200 0 L200 ${windowHeight} L100 ${windowHeight} Q-100 ${windowHeight / 2} 100 0`;
  const targetPath = `M100 0 L200 0 L200 ${windowHeight} L100 ${windowHeight} Q100 ${windowHeight / 2} 100 0`;

  const curve = {
    initial: { d: initialPath },
    enter: {
      d: targetPath,
      transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] }
    },
    exit: {
      d: initialPath,
      transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] }
    }
  };

  return (
    <svg className="curved-menu-svg-curve" aria-hidden="true">
      <motion.path
        variants={curve}
        initial="initial"
        animate="enter"
        exit="exit"
      />
    </svg>
  );
};

export const CurvedNavbar = ({ setIsActive, navItems, footer }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsActive]);

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="curved-menu-backdrop"
        onClick={() => setIsActive(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <motion.div
        variants={MENU_SLIDE_ANIMATION}
        initial="initial"
        animate="enter"
        exit="exit"
        className="curved-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation"
      >
        <div className="curved-menu-container">
          <div>
            <div className="curved-menu-category">
              <p className="curved-menu-category-text">Navigation</p>
            </div>
            <nav className="curved-menu-nav-list" aria-label="Expanded Navigation">
              {navItems.map((item, index) => (
                <NavLink
                  key={item.href}
                  {...item}
                  setIsActive={setIsActive}
                  index={index + 1}
                />
              ))}
            </nav>
          </div>

          {footer}
        </div>

        <Curve />
      </motion.div>
    </>
  );
};

export default function CurvedMenu({
  navItems = MOVA_NAV_ITEMS,
  footer = <CustomFooter />
}) {
  const [isActive, setIsActive] = useState(false);

  // Lock body scroll when menu is active
  useEffect(() => {
    if (isActive) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isActive]);

  return (
    <>
      {/* Floating Morphing Trigger Button */}
      <button
        type="button"
        onClick={() => setIsActive(prev => !prev)}
        className={`curved-menu-toggle-btn ${isActive ? 'curved-menu-toggle-btn--active' : ''}`}
        aria-label={isActive ? 'Close menu' : 'Open menu'}
        aria-expanded={isActive}
      >
        <div className="curved-menu-burger-box">
          <span
            className={`curved-menu-burger-line ${isActive ? 'curved-menu-burger-line--top-active' : ''}`}
          />
          <span
            className={`curved-menu-burger-line ${isActive ? 'curved-menu-burger-line--mid-active' : ''}`}
          />
          <span
            className={`curved-menu-burger-line ${isActive ? 'curved-menu-burger-line--bot-active' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence mode="wait">
        {isActive && (
          <CurvedNavbar
            setIsActive={setIsActive}
            navItems={navItems}
            footer={footer}
          />
        )}
      </AnimatePresence>
    </>
  );
}
