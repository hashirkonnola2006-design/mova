import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import './EmergencyPage.css';

const PHRASES = [
  {
    id: 'help',
    icon: '🆘',
    iconBg: '#FEF2F2',
    title: 'Help',
    en: 'I need help',
    ml: 'എനിക്ക് സഹായം വേണം',
  },
  {
    id: 'water',
    icon: '🧪',
    iconBg: '#ECFDF5',
    title: 'I need water',
    en: 'I need water',
    ml: 'എനിക്ക് വെള്ളം വേണം',
  },
  {
    id: 'medical',
    icon: '➕',
    iconBg: '#ECFDF5',
    title: 'Medical Help',
    en: 'I need medical help',
    ml: 'എനിക്ക് വൈദ്യസഹായം വേണം',
    iconColor: '#ffffff',
    iconBgColor: '#10B981',
  },
  {
    id: 'hospital',
    icon: '📍',
    iconBg: '#FFFBEB',
    title: 'Where is the hospital?',
    en: 'Where is the hospital?',
    ml: 'ആശുപത്രി എവിടെയാണ്?',
  },
  {
    id: 'emergency',
    icon: '⚠️',
    iconBg: '#FFF7ED',
    title: 'Emergency',
    en: "It's an emergency",
    ml: 'ഇത് അടിയന്തരാവസ്ഥയാണ്',
  },
  {
    id: 'thank-you',
    icon: '❤️',
    iconBg: '#FFF1F2',
    title: 'Thank you',
    en: 'Thank you',
    ml: 'നന്ദി',
  },
];

export default function EmergencyPage() {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [activePhraseId, setActivePhraseId] = useState(null);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
  };

  const handleCardClick = (phrase) => {
    if (emergencyMode) {
      setActivePhraseId(phrase.id);
      speak(phrase.en);
      setTimeout(() => setActivePhraseId(null), 2500);
    }
  };

  const activateEmergency = () => {
    setEmergencyMode(true);
    speak('Emergency mode activated. Tap any card to speak.');
  };

  const deactivateEmergency = () => {
    setEmergencyMode(false);
    window.speechSynthesis.cancel();
    setActivePhraseId(null);
  };

  return (
    <div className="emrg-root">
      {/* Header */}
      <div className="emrg-header">
        <h1 className="emrg-title">Emergency Phrases</h1>
        <p className="emrg-sub">Quick access to help when you need it most.</p>
      </div>

      {/* Emergency mode overlay banner */}
      {emergencyMode && (
        <div className="emrg-mode-banner">
          <AlertTriangle size={20} />
          <span><strong>Emergency Mode active.</strong> Tap any card to speak it aloud immediately.</span>
          <button className="emrg-mode-deactivate" onClick={deactivateEmergency}>
            Deactivate
          </button>
        </div>
      )}

      {/* Phrase Cards Grid */}
      <div className="emrg-grid">
        {PHRASES.map(p => (
          <button
            key={p.id}
            className={`emrg-card ${emergencyMode ? 'emrg-card--clickable' : ''} ${activePhraseId === p.id ? 'emrg-card--speaking' : ''}`}
            onClick={() => handleCardClick(p)}
            aria-label={`${p.title}: ${p.en} / ${p.ml}`}
          >
            <div
              className="emrg-card-icon"
              style={{
                background: p.iconBgColor || p.iconBg,
                color: p.iconColor || 'inherit',
              }}
            >
              <span>{p.icon}</span>
            </div>

            <div className="emrg-card-body">
              <h3 className="emrg-card-title">{p.title}</h3>
              <div className="emrg-card-text">
                {p.en}{' '}
                <span className="emrg-card-ml">/ {p.ml}</span>
              </div>
            </div>

            {activePhraseId === p.id && (
              <div className="emrg-speaking-indicator" aria-live="polite">
                Speaking…
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Emergency Mode Activation Strip */}
      <div className="emrg-mode-strip">
        <div className="emrg-mode-strip-left">
          <AlertTriangle size={20} className="emrg-mode-strip-icon" />
          <div>
            <div className="emrg-mode-strip-title">Emergency Mode</div>
            <div className="emrg-mode-strip-desc">
              {emergencyMode
                ? 'Active — tap any card above to speak it immediately.'
                : 'Shows a large message and plays audio immediately.'}
            </div>
          </div>
        </div>
        <button
          className={`emrg-activate-btn ${emergencyMode ? 'emrg-activate-btn--off' : ''}`}
          onClick={emergencyMode ? deactivateEmergency : activateEmergency}
        >
          {emergencyMode ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  );
}
