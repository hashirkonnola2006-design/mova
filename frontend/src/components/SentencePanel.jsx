import React from 'react';
import { Trash2, Delete, Copy, Volume2, CheckCircle2, Hand } from 'lucide-react';

export default function SentencePanel({
  sentenceWords,
  onClear,
  onBackspace,
  currentPrediction,
  consecutiveWins,
  idleRequired
}) {
  const fullSentence = sentenceWords.join(' ');

  const handleCopy = () => {
    if (fullSentence) {
      navigator.clipboard.writeText(fullSentence);
    }
  };

  const handleSpeak = () => {
    if (!fullSentence || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(fullSentence);
    utterance.lang = 'ml-IN'; // Malayalam
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const progressPercent = Math.min(100, Math.round((consecutiveWins / 8) * 100));

  return (
    <div className="glass-card malayalam-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title">
          <span>മലയാള വാചകം (Malayalam Output)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className="btn btn-secondary"
            onClick={handleCopy}
            disabled={!sentenceWords.length}
            title="വാചകം പകർത്തുക (Copy)"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Copy size={15} />
            <span>Copy</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleSpeak}
            disabled={!sentenceWords.length}
            title="വായിക്കുക (Speak)"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Volume2 size={15} />
            <span>Speak</span>
          </button>
        </div>
      </div>

      {/* Big Malayalam Text Display */}
      <div className="big-text-display">
        {sentenceWords.length === 0 ? (
          <div className="text-placeholder">
            <span>ആംഗ്യഭാഷ കാണിക്കുക... വാചകം ഇവിടെ ദൃശ്യമാകും</span>
            <br />
            <small style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem' }}>
              (Show ISL signs or click simulate buttons to construct your sentence)
            </small>
          </div>
        ) : (
          sentenceWords.map((word, idx) => (
            <span key={idx} className="malayalam-word-chip">
              {word}
            </span>
          ))
        )}
      </div>

      {/* Stability & Detection Status Indicator */}
      <div className="stability-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {idleRequired ? (
              <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <Hand size={16} /> താഴ്ത്തുക (Rest hands down for next sign)
              </span>
            ) : currentPrediction && currentPrediction.label !== 'idle' ? (
              <span>
                ലക്ഷ്യം (Detecting): <strong style={{ color: '#38bdf8' }}>{currentPrediction.label}</strong> ({currentPrediction.malayalam})
              </span>
            ) : (
              <span style={{ color: '#64748b' }}>കാത്തിരിക്കുന്നു (Waiting for sign...)</span>
            )}
          </div>
          <div style={{ fontWeight: 600, color: consecutiveWins >= 8 ? '#10b981' : '#94a3b8' }}>
            {consecutiveWins}/8 wins
          </div>
        </div>

        {/* Progress Bar */}
        <div className="stability-bar-track">
          <div
            className="stability-bar-fill"
            style={{
              width: `${progressPercent}%`,
              background: idleRequired ? '#f59e0b' : consecutiveWins >= 8 ? '#10b981' : 'linear-gradient(90deg, #38bdf8, #10b981)'
            }}
          />
        </div>
      </div>

      {/* Action Bar: Clear & Backspace */}
      <div className="action-bar">
        <button
          className="btn btn-secondary"
          onClick={onBackspace}
          disabled={!sentenceWords.length}
          style={{ flex: 1 }}
        >
          <Delete size={17} />
          <span>Backspace (ഒഴിവാക്കുക)</span>
        </button>
        <button
          className="btn btn-danger"
          onClick={onClear}
          disabled={!sentenceWords.length}
          style={{ flex: 1 }}
        >
          <Trash2 size={17} />
          <span>Clear All (എല്ലാം മായ്ക്കുക)</span>
        </button>
      </div>
    </div>
  );
}
