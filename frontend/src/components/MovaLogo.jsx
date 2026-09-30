import React from 'react';

/**
 * MOVA Brand Logo Component
 * Uses the official brand mark provided in the design specifications.
 */
export default function MovaLogo({ height = 36, showWordmark = true, className = '' }) {
  if (showWordmark) {
    return (
      <div className={`mova-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <img
          src="/mova-logo.png"
          alt="MOVA"
          style={{
            height: `${height}px`,
            width: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className={`mova-brand-icon ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <img
        src="/mova-icon.png"
        alt="MOVA"
        style={{
          height: `${height}px`,
          width: 'auto',
          display: 'block',
          objectFit: 'contain',
        }}
        loading="eager"
      />
    </div>
  );
}
