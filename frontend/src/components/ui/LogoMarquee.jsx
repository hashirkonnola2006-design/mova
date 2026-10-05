import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'motion/react';
import useMeasure from 'react-use-measure';
import { cn } from '../../lib/utils.js';
import './LogoMarquee.css';

/**
 * LogoMarquee Component
 * Continuous floating marquee with pause-on-hover, original brand colors,
 * responsive design, and prefers-reduced-motion static fallback.
 */
export default function LogoMarquee({
  items = [],
  speed = 40,
  className = '',
  gap = 40
}) {
  const [ref, { width }] = useMeasure();
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const x = useMotionValue(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useAnimationFrame((time, delta) => {
    if (prefersReducedMotion || !width) return;

    // Slow down on hover (25% speed) instead of abrupt jump, or pause smoothly
    const currentSpeed = isHovered ? speed * 0.15 : speed;
    const moveBy = (currentSpeed * (delta / 1000));
    
    let newX = x.get() - moveBy;
    if (newX <= -width) {
      newX = 0;
    }
    x.set(newX);
  });

  if (prefersReducedMotion) {
    return (
      <div className={cn('lm-static-grid', className)}>
        {items.map((item, idx) => (
          <div key={`static-${idx}`} className="lm-item">
            {item.svg ? (
              <img
                src={item.svg}
                alt={item.name}
                className="lm-logo-img"
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="lm-badge">{item.badge || item.name}</span>
            )}
            <span className="lm-label">{item.name}</span>
          </div>
        ))}
      </div>
    );
  }

  // Render two duplicate tracks so when track 1 translates by its measured width,
  // track 2 seamlessly replaces it in an infinite continuous loop.
  return (
    <div
      className={cn('lm-marquee-wrapper', className)}
      style={{ '--marquee-gap': `${gap}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="lm-fade-left" aria-hidden="true" />
      <div className="lm-fade-right" aria-hidden="true" />

      <motion.div className="lm-track" style={{ x }}>
        {/* Measured primary track */}
        <div ref={ref} className="lm-track" style={{ display: 'flex', gap: `${gap}px` }}>
          {items.map((item, idx) => (
            <div key={`track1-${idx}`} className="lm-item">
              {item.svg ? (
                <img
                  src={item.svg}
                  alt={item.name}
                  className="lm-logo-img"
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="lm-badge">{item.badge || item.name}</span>
              )}
              <span className="lm-label">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Duplicate seamless track */}
        <div className="lm-track" style={{ display: 'flex', gap: `${gap}px` }} aria-hidden="true">
          {items.map((item, idx) => (
            <div key={`track2-${idx}`} className="lm-item">
              {item.svg ? (
                <img
                  src={item.svg}
                  alt=""
                  className="lm-logo-img"
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="lm-badge">{item.badge || item.name}</span>
              )}
              <span className="lm-label">{item.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
