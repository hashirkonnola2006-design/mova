import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, Send, Volume2, Video, Trash2,
  Copy, Check, User, Sparkles, CornerDownLeft
} from 'lucide-react';
import WebcamView from '../components/WebcamView.jsx';
import { generateSyntheticSequence } from '../utils/simulate.js';
import labelsMap from '../labels_ml.json';
import './ConversationPage.css';

const QUICK_RESPONSES = [
  'Yes, I understand',
  'No, please repeat',
  'One moment please',
  'Thank you very much',
  'Nice to meet you',
  'Where is the bank?',
];

export default function ConversationPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'signer',
      senderName: 'Signer (ISL)',
      text: 'നമസ്കാരം (Hello)',
      time: 'Just now'
    },
    {
      id: 2,
      sender: 'speaker',
      senderName: 'Speaker',
      text: 'Hello! How can I help you today?',
      time: 'Just now'
    }
  ]);

  const [speakerInput, setSpeakerInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeGesture, setActiveGesture] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text, lang = 'ml-IN') => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      window.speechSynthesis.speak(utter);
    }
  };

  const handleSendSpeakerMessage = (e) => {
    if (e) e.preventDefault();
    if (!speakerInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'speaker',
      senderName: 'Speaker',
      text: speakerInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    speakText(speakerInput.trim(), 'en-US');
    setSpeakerInput('');
  };

  const handleSignerGesture = (en, ml) => {
    setActiveGesture(ml);
    const newMsg = {
      id: Date.now(),
      sender: 'signer',
      senderName: 'Signer (ISL)',
      text: `${ml} (${en})`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    speakText(ml, 'ml-IN');
    setTimeout(() => setActiveGesture(null), 1200);
  };

  const handleCopyTranscript = () => {
    const transcript = messages.map(m => `[${m.senderName}]: ${m.text}`).join('\n');
    navigator.clipboard.writeText(transcript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="conv-root">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="conv-header">
        <div>
          <div className="conv-badge">
            <MessageCircle size={14} />
            <span>TWO-WAY CONVERSATION BRIDGE</span>
          </div>
          <h1 className="conv-title">Two-Way Live Conversation</h1>
          <p className="conv-sub">
            Real-time interactive split screen connecting an ISL signer with a hearing speaker through live gesture translation and speech synthesis.
          </p>
        </div>

        <div className="conv-header-actions">
          <button className="conv-btn-subtle" onClick={handleCopyTranscript}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? 'Copied Transcript' : 'Copy Chat'}</span>
          </button>
          <button className="conv-btn-subtle danger" onClick={() => setMessages([])}>
            <Trash2 size={15} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* ── Two-Column Operational Layout ──────────────────── */}
      <div className="conv-layout">
        {/* Left Column: Signer Camera / Quick Sign Toolbar */}
        <div className="conv-col conv-col-signer">
          <div className="conv-card-title-row">
            <span className="conv-badge-tag tag-blue">🤟 SIGNER PANEL (ISL)</span>
            <span className="conv-camera-status">● Camera Active</span>
          </div>

          <div className="conv-camera-box">
            <WebcamView onFrame={() => {}} isSimulateMode={false} />
          </div>

          <div className="conv-gestures-toolbar">
            <span className="conv-toolbar-title">Instant Sign Shortcuts:</span>
            <div className="conv-gestures-grid">
              {[
                { en: 'Hello', ml: 'നമസ്കാരം' },
                { en: 'Thank You', ml: 'നന്ദി' },
                { en: 'Good Morning', ml: 'സുപ്രഭാതം' },
                { en: 'Good', ml: 'നല്ലത്' },
                { en: 'Father', ml: 'അച്ഛൻ' },
                { en: 'Time', ml: 'സമയം' }
              ].map(g => (
                <button
                  key={g.en}
                  className={`conv-gesture-btn ${activeGesture === g.ml ? 'active' : ''}`}
                  onClick={() => handleSignerGesture(g.en, g.ml)}
                >
                  <span className="gesture-ml">{g.ml}</span>
                  <span className="gesture-en">{g.en}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dialogue Stream & Speaker Input */}
        <div className="conv-col conv-col-chat">
          <div className="conv-card-title-row">
            <span className="conv-badge-tag tag-purple">💬 LIVE DIALOGUE STREAM</span>
            <span className="conv-message-count">{messages.length} messages</span>
          </div>

          {/* Chat Messages Log */}
          <div className="conv-chat-feed">
            {messages.length === 0 ? (
              <div className="conv-empty-chat">
                Sign a gesture or type a reply below to begin the conversation.
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`conv-msg-row ${msg.sender === 'signer' ? 'signer-msg' : 'speaker-msg'}`}
                >
                  <div className="conv-msg-bubble">
                    <div className="conv-msg-meta">
                      <span className="conv-sender-label">{msg.senderName}</span>
                      <span className="conv-time-label">{msg.time}</span>
                    </div>
                    <div className="conv-msg-text">{msg.text}</div>
                  </div>
                  <button
                    className="conv-msg-speak"
                    onClick={() => speakText(msg.text, msg.sender === 'signer' ? 'ml-IN' : 'en-US')}
                    title="Speak message aloud"
                  >
                    <Volume2 size={14} />
                  </button>
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Speaker Replies */}
          <div className="conv-quick-replies">
            {QUICK_RESPONSES.map(resp => (
              <button
                key={resp}
                className="conv-reply-chip"
                onClick={() => {
                  setSpeakerInput(resp);
                }}
              >
                {resp}
              </button>
            ))}
          </div>

          {/* Speaker Text Input Bar */}
          <form onSubmit={handleSendSpeakerMessage} className="conv-input-form">
            <input
              type="text"
              className="conv-text-input"
              placeholder="Type your response to speak aloud…"
              value={speakerInput}
              onChange={e => setSpeakerInput(e.target.value)}
            />
            <button
              type="submit"
              className="conv-btn-send"
              disabled={!speakerInput.trim()}
            >
              <Send size={15} />
              <span>Send &amp; Speak</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
