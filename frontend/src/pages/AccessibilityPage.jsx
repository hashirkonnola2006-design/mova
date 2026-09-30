import React, { useState, useEffect } from 'react';
import {
  Eye, Type, Sliders, Volume2, ShieldCheck, Sparkles,
  Check, Save, Monitor, Keyboard, Sun, Contrast
} from 'lucide-react';
import './AccessibilityPage.css';

const ACCESSIBILITY_STORAGE_KEY = 'mova_accessibility_settings';

export default function AccessibilityPage() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {
        fontSize: 'normal',
        highContrast: false,
        reduceMotion: false,
        autoSpeak: true,
        showSkeleton: true,
        sensitivity: 'balanced',
        hapticFeedback: false,
      };
    } catch {
      return {
        fontSize: 'normal',
        highContrast: false,
        reduceMotion: false,
        autoSpeak: true,
        showSkeleton: true,
        sensitivity: 'balanced',
        hapticFeedback: false,
      };
    }
  });

  const [savedToast, setSavedToast] = useState(false);

  // Apply changes to document root for real effect
  useEffect(() => {
    if (settings.highContrast) {
      document.documentElement.classList.add('mova-high-contrast');
    } else {
      document.documentElement.classList.remove('mova-high-contrast');
    }

    if (settings.reduceMotion) {
      document.documentElement.classList.add('mova-reduce-motion');
    } else {
      document.documentElement.classList.remove('mova-reduce-motion');
    }

    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(settings));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <div className="acc-root">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="acc-header">
        <div>
          <div className="acc-badge">
            <Eye size={14} />
            <span>UNIVERSAL ACCESS &amp; PREFERENCES</span>
          </div>
          <h1 className="acc-title">Accessibility &amp; Assistive Controls</h1>
          <p className="acc-sub">
            Customize visual contrast, typography scaling, camera landmark feedback, and gesture detection thresholds for your personal needs.
          </p>
        </div>

        <button className="acc-btn-save" onClick={handleSave}>
          <Save size={16} />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedToast && (
        <div className="acc-toast">
          <Check size={16} />
          <span>Accessibility preferences saved and applied to your device!</span>
        </div>
      )}

      {/* ── Settings Grid ──────────────────────────────────── */}
      <div className="acc-grid">
        {/* Visual & Typography */}
        <section className="acc-card">
          <div className="acc-card-header">
            <div className="acc-icon-wrap icon-blue">
              <Type size={20} />
            </div>
            <div>
              <h3 className="acc-card-title">Display &amp; Typography</h3>
              <p className="acc-card-desc">Adjust size, contrast, and motion effects</p>
            </div>
          </div>

          <div className="acc-options-list">
            {/* Font Size */}
            <div className="acc-option-item">
              <div>
                <div className="acc-option-label">Text Scaling</div>
                <div className="acc-option-sub">Increase font size across all translation cards</div>
              </div>
              <div className="acc-segmented-control">
                {['normal', 'large', 'xlarge'].map(size => (
                  <button
                    key={size}
                    className={`acc-seg-btn ${settings.fontSize === size ? 'active' : ''}`}
                    onClick={() => setSettings(s => ({ ...s, fontSize: size }))}
                  >
                    {size === 'normal' ? '100%' : size === 'large' ? '115%' : '130%'}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div className="acc-option-item">
              <div>
                <div className="acc-option-label">High Contrast Mode</div>
                <div className="acc-option-sub">Deepen text darkness and amplify borders</div>
              </div>
              <label className="acc-switch">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={() => handleToggle('highContrast')}
                />
                <span className="acc-slider" />
              </label>
            </div>

            {/* Reduced Motion */}
            <div className="acc-option-item">
              <div>
                <div className="acc-option-label">Reduced Motion</div>
                <div className="acc-option-sub">Eliminate pulsing animations and live transitions</div>
              </div>
              <label className="acc-switch">
                <input
                  type="checkbox"
                  checked={settings.reduceMotion}
                  onChange={() => handleToggle('reduceMotion')}
                />
                <span className="acc-slider" />
              </label>
            </div>
          </div>
        </section>

        {/* Translation & Camera Controls */}
        <section className="acc-card">
          <div className="acc-card-header">
            <div className="acc-icon-wrap icon-purple">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="acc-card-title">Translation &amp; AI Engine</h3>
              <p className="acc-card-desc">Fine-tune detection speed and audio playback</p>
            </div>
          </div>

          <div className="acc-options-list">
            {/* Auto Speak */}
            <div className="acc-option-item">
              <div>
                <div className="acc-option-label">Instant Audio Feedback</div>
                <div className="acc-option-sub">Automatically pronounce Malayalam signs upon confirmation</div>
              </div>
              <label className="acc-switch">
                <input
                  type="checkbox"
                  checked={settings.autoSpeak}
                  onChange={() => handleToggle('autoSpeak')}
                />
                <span className="acc-slider" />
              </label>
            </div>

            {/* Show Skeleton */}
            <div className="acc-option-item">
              <div>
                <div className="acc-option-label">Show 21 Landmark Hand Skeleton</div>
                <div className="acc-option-sub">Draw colored tracking lines and dots on your camera feed</div>
              </div>
              <label className="acc-switch">
                <input
                  type="checkbox"
                  checked={settings.showSkeleton}
                  onChange={() => handleToggle('showSkeleton')}
                />
                <span className="acc-slider" />
              </label>
            </div>

            {/* Detection Sensitivity */}
            <div className="acc-option-item">
              <div>
                <div className="acc-option-label">Recognition Threshold</div>
                <div className="acc-option-sub">Balanced is best for everyday home lighting</div>
              </div>
              <div className="acc-segmented-control">
                {[
                  { key: 'relaxed', label: 'Relaxed' },
                  { key: 'balanced', label: 'Balanced' },
                  { key: 'strict', label: 'Strict' }
                ].map(item => (
                  <button
                    key={item.key}
                    className={`acc-seg-btn ${settings.sensitivity === item.key ? 'active' : ''}`}
                    onClick={() => setSettings(s => ({ ...s, sensitivity: item.key }))}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Keyboard Shortcuts Guide ────────────────────────── */}
      <section className="acc-shortcuts-card">
        <div className="acc-card-header">
          <div className="acc-icon-wrap icon-amber">
            <Keyboard size={20} />
          </div>
          <div>
            <h3 className="acc-card-title">Keyboard Navigation &amp; Quick Keys</h3>
            <p className="acc-card-desc">Operate translation functions without taking your hands off the keyboard</p>
          </div>
        </div>

        <div className="acc-shortcuts-grid">
          <div className="acc-shortcut-item">
            <kbd className="acc-kbd">Space</kbd>
            <span className="acc-shortcut-label">Play / Pause Malayalam Speech</span>
          </div>
          <div className="acc-shortcut-item">
            <kbd className="acc-kbd">C</kbd>
            <span className="acc-shortcut-label">Clear translated sentence</span>
          </div>
          <div className="acc-shortcut-item">
            <kbd className="acc-kbd">1 - 9</kbd>
            <span className="acc-shortcut-label">Trigger gesture quick test</span>
          </div>
          <div className="acc-shortcut-item">
            <kbd className="acc-kbd">Esc</kbd>
            <span className="acc-shortcut-label">Return to Home Dashboard</span>
          </div>
        </div>
      </section>
    </div>
  );
}
