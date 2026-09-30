import React, { useState, useRef } from 'react';
import { Play, Square, Copy, Check } from 'lucide-react';
import './TextToSpeechPage.css';

const LANGUAGES = [
  { label: 'English (US)', code: 'en-US' },
  { label: 'English (UK)', code: 'en-GB' },
  { label: 'Malayalam', code: 'ml-IN' },
  { label: 'Hindi', code: 'hi-IN' },
  { label: 'Tamil', code: 'ta-IN' },
];

const VOICES = ['Female', 'Male'];
const SPEEDS = ['Slow', 'Normal', 'Fast'];
const SPEED_MAP = { Slow: 0.75, Normal: 1.0, Fast: 1.5 };

const RECENT_PHRASES = [
  { en: 'Hello', ml: 'ഹലോ' },
  { en: 'Thank you', ml: 'നന്ദി' },
  { en: 'I need help', ml: 'എനിക്ക് സഹായം വേണം' },
  { en: 'Where is the hospital?', ml: 'ആശുപത്രി എവിടെയാണ്?' },
  { en: 'I am fine', ml: 'ഞാൻ കുഴപ്പമില്ല' },
  { en: 'Goodbye', ml: 'ഗുഡ്‌ബൈ' },
];

const MAX_CHARS = 500;

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [voice, setVoice] = useState('Female');
  const [speed, setSpeed] = useState('Normal');
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const utterRef = useRef(null);

  const handleSpeak = () => {
    if (!text.trim()) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = language;
      utter.rate = SPEED_MAP[speed];

      // Try to pick a matching voice
      const voices = window.speechSynthesis.getVoices();
      const langVoices = voices.filter(v => v.lang.startsWith(language.split('-')[0]));
      const genderMatch = langVoices.find(v =>
        voice === 'Female' ? /female|woman|girl/i.test(v.name) : /male|man|boy/i.test(v.name)
      );
      if (genderMatch) utter.voice = genderMatch;
      else if (langVoices.length > 0) utter.voice = langVoices[0];

      utter.onstart = () => setPlaying(true);
      utter.onend = () => setPlaying(false);
      utter.onerror = () => setPlaying(false);

      utterRef.current = utter;
      window.speechSynthesis.speak(utter);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

  const handleCopy = () => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="tts-root">
      {/* Page Header */}
      <div className="tts-header">
        <h1 className="tts-title">Text to Speech</h1>
        <p className="tts-sub">Type, choose a voice, and listen.</p>
      </div>

      {/* Main Card */}
      <div className="tts-card">
        {/* Text Area */}
        <div className="tts-textarea-wrap">
          <textarea
            className="tts-textarea"
            placeholder="Type your message here..."
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
            rows={6}
            aria-label="Text to speak"
          />
          {/* Audio wave viz (decorative) */}
          <div className="tts-wave" aria-hidden="true">
            {[3, 5, 8, 11, 8, 5, 3, 2, 4, 7, 10, 7, 4, 2, 3].map((h, i) => (
              <div
                key={i}
                className={`tts-bar ${playing ? 'tts-bar--active' : ''}`}
                style={{ height: `${h * 3}px`, animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
          <div className="tts-char-count">{text.length}/{MAX_CHARS}</div>
        </div>

        {/* Controls */}
        <div className="tts-controls">
          <div className="tts-select-group">
            <label className="tts-select-label">Language</label>
            <select
              className="tts-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="tts-select-group">
            <label className="tts-select-label">Voice</label>
            <select
              className="tts-select"
              value={voice}
              onChange={e => setVoice(e.target.value)}
            >
              {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="tts-select-group">
            <label className="tts-select-label">Speed</label>
            <select
              className="tts-select"
              value={speed}
              onChange={e => setSpeed(e.target.value)}
            >
              {SPEEDS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Play Button */}
        <button
          className={`tts-play-btn ${playing ? 'tts-play-btn--stop' : ''}`}
          onClick={playing ? handleStop : handleSpeak}
          disabled={!text.trim()}
        >
          {playing ? (
            <><Square size={18} fill="currentColor" /> Stop</>
          ) : (
            <><Play size={18} fill="currentColor" /> Play</>
          )}
        </button>

        {/* Secondary Actions */}
        <div className="tts-actions-row">
          <button
            className="tts-action-btn"
            onClick={handleCopy}
            disabled={!text.trim()}
            title="Copy text"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy text'}
          </button>
          <button
            className="tts-action-btn"
            onClick={() => setText('')}
            disabled={!text.trim()}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Recent Phrases */}
      <div className="tts-recent">
        <h2 className="tts-recent-title">Recent Phrases</h2>
        <div className="tts-phrases-grid">
          {RECENT_PHRASES.map(p => (
            <button
              key={p.en}
              className="tts-phrase-card"
              onClick={() => setText(p.en)}
              title={`Click to use: ${p.en}`}
            >
              <div className="tts-phrase-en">{p.en}</div>
              <div className="tts-phrase-ml">{p.ml}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
