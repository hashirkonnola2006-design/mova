import React, { useState, useEffect } from 'react';
import { Sliders, Sun, Eye, Activity, Check, X } from 'lucide-react';
import './AccessibilityPanel.css';

/**
 * Working accessibility floating control panel.
 * Controls root text size, high contrast mode, and reduced motion.
 * Persists settings in localStorage and applies classes to document.documentElement.
 */
export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [largeText, setLargeText] = useState(() => localStorage.getItem('mova_a11y_largeText') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('mova_a11y_highContrast') === 'true');
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('mova_a11y_reduceMotion') === 'true');

  useEffect(() => {
    const root = document.documentElement;

    if (largeText) {
      root.classList.add('a11y-large-text');
    } else {
      root.classList.remove('a11y-large-text');
    }
    localStorage.setItem('mova_a11y_largeText', largeText);

    if (highContrast) {
      root.classList.add('a11y-high-contrast');
    } else {
      root.classList.remove('a11y-high-contrast');
    }
    localStorage.setItem('mova_a11y_highContrast', highContrast);

    if (reduceMotion) {
      root.classList.add('a11y-reduce-motion');
    } else {
      root.classList.remove('a11y-reduce-motion');
    }
    localStorage.setItem('mova_a11y_reduceMotion', reduceMotion);
  }, [largeText, highContrast, reduceMotion]);

  return (
    <div className="a11y-panel-wrapper">
      <button
        type="button"
        className={`a11y-floating-btn ${open ? 'a11y-floating-btn--active' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Accessibility options"
        aria-expanded={open}
        title="Accessibility Settings"
      >
        <Sliders size={20} />
      </button>

      {open && (
        <div className="a11y-popover" role="dialog" aria-label="Accessibility Settings">
          <div className="a11y-popover-header">
            <h4>Accessibility Settings</h4>
            <button
              type="button"
              className="a11y-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close accessibility settings"
            >
              <X size={16} />
            </button>
          </div>

          <div className="a11y-options-list">
            <button
              type="button"
              className={`a11y-option-item ${largeText ? 'a11y-option-item--on' : ''}`}
              onClick={() => setLargeText(v => !v)}
              aria-pressed={largeText}
            >
              <div className="a11y-option-info">
                <span className="a11y-option-icon"><Eye size={16} /></span>
                <div>
                  <div className="a11y-option-title">Larger Text</div>
                  <div className="a11y-option-desc">Increases page font scale</div>
                </div>
              </div>
              <span className="a11y-toggle-state">{largeText ? <Check size={16} /> : 'Off'}</span>
            </button>

            <button
              type="button"
              className={`a11y-option-item ${highContrast ? 'a11y-option-item--on' : ''}`}
              onClick={() => setHighContrast(v => !v)}
              aria-pressed={highContrast}
            >
              <div className="a11y-option-info">
                <span className="a11y-option-icon"><Sun size={16} /></span>
                <div>
                  <div className="a11y-option-title">High Contrast</div>
                  <div className="a11y-option-desc">Enhances text & border contrast</div>
                </div>
              </div>
              <span className="a11y-toggle-state">{highContrast ? <Check size={16} /> : 'Off'}</span>
            </button>

            <button
              type="button"
              className={`a11y-option-item ${reduceMotion ? 'a11y-option-item--on' : ''}`}
              onClick={() => setReduceMotion(v => !v)}
              aria-pressed={reduceMotion}
            >
              <div className="a11y-option-info">
                <span className="a11y-option-icon"><Activity size={16} /></span>
                <div>
                  <div className="a11y-option-title">Reduce Motion</div>
                  <div className="a11y-option-desc">Disables animations & float effects</div>
                </div>
              </div>
              <span className="a11y-toggle-state">{reduceMotion ? <Check size={16} /> : 'Off'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
