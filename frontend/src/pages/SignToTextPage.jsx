import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, Trash2, Volume2, RefreshCw, Sparkles, Hand, Zap, ShieldCheck } from 'lucide-react';
import WebcamView from '../components/WebcamView.jsx';
import { generateSyntheticSequence } from '../utils/simulate.js';
import labelsMap from '../labels_ml.json';
import './SignToTextPage.css';

const HTTP_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = HTTP_BASE.replace(/^http/, 'ws');
const WS_URL = `${WS_BASE}/ws`;

const SEND_INTERVAL_MS = 200;
const SAMPLE_INTERVAL_MS = 100; // 10 FPS
const REQUIRED_CONSECUTIVE_WINS = 5; // Responsive detection (approx 1 second hold)
const MIN_CONFIDENCE = 0.70;
const LATCH_TIMEOUT_MS = 2500;
const NO_HAND_IDLE_RELEASE_MS = 800;

// The 10 supported words
const VOCABULARY = [
  { key: 'hello',        en: 'Hello',        ml: 'നമസ്കാരം' },
  { key: 'good_morning', en: 'Good Morning', ml: 'സുപ്രഭാതം' },
  { key: 'thank_you',    en: 'Thank You',    ml: 'നന്ദി' },
  { key: 'good',         en: 'Good',         ml: 'നല്ലത്' },
  { key: 'i',            en: 'I',            ml: 'ഞാൻ' },
  { key: 'father',       en: 'Father',       ml: 'അച്ഛൻ' },
  { key: 'boy',          en: 'Boy',          ml: 'ആൺകുട്ടി' },
  { key: 'girl',         en: 'Girl',         ml: 'പെൺകുട്ടി' },
  { key: 'bank',         en: 'Bank',         ml: 'ബാങ്ക്' },
  { key: 'time',         en: 'Time',         ml: 'സമയം' },
];

export default function SignToTextPage() {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [currentPrediction, setCurrentPrediction] = useState({
    label: 'idle',
    confidence: 0,
    malayalam: '',
    top3: []
  });
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [idleRequired, setIdleRequired] = useState(false);
  const [detectedWords, setDetectedWords] = useState([]);
  const [copied, setCopied] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);
  const [activeTestingWord, setActiveTestingWord] = useState(null);

  const wsRef = useRef(null);
  const slidingWindowRef = useRef([]);
  const lastCandidateRef = useRef(null);
  const winsCountRef = useRef(0);
  const idleRequiredRef = useRef(false);
  const latchSetAtRef = useRef(null);
  const lastHandSeenRef = useRef(null);
  const latestFrameRef = useRef(new Array(126).fill(0));
  const lastFrameTimeRef = useRef(0);
  const latestHandCountRef = useRef(0);

  useEffect(() => {
    idleRequiredRef.current = idleRequired;
  }, [idleRequired]);

  // Release latch so next sign can be detected
  const releaseIdle = useCallback(() => {
    idleRequiredRef.current = false;
    setIdleRequired(false);
    winsCountRef.current = 0;
    setConsecutiveWins(0);
    lastCandidateRef.current = null;
    latchSetAtRef.current = null;
  }, []);

  // Web Speech synthesis in Malayalam
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ml-IN';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    }
  }, []);

  // Handle detection response from server
  const handleServerResponse = useCallback((data) => {
    if (!data || data.error) return;

    if (data.client_timestamp) {
      setLatencyMs(Math.max(1, Math.round(performance.now() - data.client_timestamp)));
    }

    const label = data.label || 'idle';
    const confidence = typeof data.confidence === 'number' ? data.confidence : 0;
    
    // Resolve Malayalam text from server or dictionary
    let ml = data.malayalam || '';
    if (!ml && labelsMap[label]) {
      ml = typeof labelsMap[label] === 'object' ? labelsMap[label].malayalam : labelsMap[label];
    }

    setCurrentPrediction({
      label,
      confidence,
      malayalam: ml,
      top3: data.top3 || []
    });

    // Check how many frames in the current window actually had a hand detected
    const handsInCurrentWindow = slidingWindowRef.current.filter(f => f.hands > 0).length;
    if (label === 'idle' || handsInCurrentWindow < 6) {
      if (idleRequiredRef.current) releaseIdle();
      winsCountRef.current = 0;
      setConsecutiveWins(0);
      lastCandidateRef.current = null;
      setCurrentPrediction({
        label: 'idle',
        confidence: 0,
        malayalam: '',
        top3: []
      });
      return;
    }

    // Only accept supported vocabulary words (filters out unwanted dataset classes like store_shop)
    const isSupported = VOCABULARY.some(v => v.key === label);
    if (!isSupported) {
      winsCountRef.current = 0;
      setConsecutiveWins(0);
      return;
    }

    // If currently locked after confirming a sign, wait for latch timeout or idle
    if (idleRequiredRef.current) {
      const latchAge = latchSetAtRef.current ? performance.now() - latchSetAtRef.current : 0;
      if (latchAge < LATCH_TIMEOUT_MS) return;
      releaseIdle();
    }

    // Check confidence threshold
    if (confidence < MIN_CONFIDENCE) {
      winsCountRef.current = 0;
      setConsecutiveWins(0);
      return;
    }

    // Count consecutive consistent frames
    if (lastCandidateRef.current !== label) {
      lastCandidateRef.current = label;
      winsCountRef.current = 1;
    } else {
      winsCountRef.current += 1;
    }

    setConsecutiveWins(winsCountRef.current);

    // Confirm gesture once threshold is met
    if (winsCountRef.current >= REQUIRED_CONSECUTIVE_WINS) {
      setDetectedWords(prev => [...prev, { label, ml }]);
      speak(ml || label);
      idleRequiredRef.current = true;
      latchSetAtRef.current = performance.now();
      setIdleRequired(true);
      winsCountRef.current = 0;
      setConsecutiveWins(0);
      lastCandidateRef.current = null;
    }
  }, [releaseIdle, speak]);

  // Connect WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setConnectionStatus('connected');
    ws.onclose = () => {
      setConnectionStatus('disconnected');
      setTimeout(connectWebSocket, 2000);
    };
    ws.onerror = () => setConnectionStatus('disconnected');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleServerResponse(data);
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };
  }, [handleServerResponse]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket]);

  // Sample incoming webcam frames at 10 FPS (100ms)
  const handleWebcamFrame = useCallback((frame126, handCount = 0) => {
    latestFrameRef.current = frame126;
    lastFrameTimeRef.current = performance.now();
    latestHandCountRef.current = handCount;
    if (handCount > 0) {
      lastHandSeenRef.current = performance.now();
    }
  }, []);

  // 10 FPS buffer ingestion
  useEffect(() => {
    const sampleTimer = setInterval(() => {
      const now = performance.now();
      const isStale = (now - lastFrameTimeRef.current) > 300;
      const frameToPush = isStale ? new Array(126).fill(0) : [...latestFrameRef.current];
      const handCount = isStale ? 0 : latestHandCountRef.current;

      // Auto-release latch if no hands seen for NO_HAND_IDLE_RELEASE_MS
      if (handCount === 0 && idleRequiredRef.current) {
        const noHandMs = lastHandSeenRef.current ? now - lastHandSeenRef.current : Infinity;
        if (noHandMs >= NO_HAND_IDLE_RELEASE_MS) {
          releaseIdle();
        }
      }

      slidingWindowRef.current.push({ frame: frameToPush, hands: handCount });
      if (slidingWindowRef.current.length > 30) {
        slidingWindowRef.current.shift();
      }
    }, SAMPLE_INTERVAL_MS);

    return () => clearInterval(sampleTimer);
  }, [releaseIdle]);

  // Dispatch 30-frame window to server every 200ms
  useEffect(() => {
    const dispatchTimer = setInterval(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const windowData = slidingWindowRef.current;
      if (windowData.length === 0) return;

      let payload = windowData.map(f => f.frame || f);
      while (payload.length < 30) {
        payload.unshift(new Array(126).fill(0));
      }

      ws.send(JSON.stringify({
        sequence: payload,
        client_timestamp: performance.now()
      }));
    }, SEND_INTERVAL_MS);

    return () => clearInterval(dispatchTimer);
  }, []);

  // One-click quick test for a specific sign
  const handleTestSign = (item) => {
    setActiveTestingWord(item.key);
    const synthetic = generateSyntheticSequence(item.key);
    slidingWindowRef.current = synthetic.map(f => ({ frame: f, hands: 1 }));

    // Send sequence immediately
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        sequence: synthetic,
        client_timestamp: performance.now()
      }));
    }

    // Set immediate visual preview
    setCurrentPrediction({
      label: item.key,
      confidence: 0.96,
      malayalam: item.ml,
      top3: [{ label: item.key, confidence: 0.96, malayalam: item.ml }]
    });

    setDetectedWords(prev => [...prev, { label: item.key, ml: item.ml }]);
    speak(item.ml);

    setTimeout(() => {
      setActiveTestingWord(null);
    }, 1500);
  };

  const handleCopy = () => {
    const text = detectedWords.map(w => w.ml || w.label).join(' ');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleSpeakAll = () => {
    const text = detectedWords.map(w => w.ml || w.label).join(' ');
    speak(text);
  };

  return (
    <div className="stt-root">
      {/* Page Header */}
      <div className="stt-header">
        <div>
          <h1 className="stt-title">Live Sign to Malayalam Translator</h1>
          <p className="stt-sub">
            Show a sign to your webcam or click any gesture preset below to get the Malayalam translation instantly.
          </p>
        </div>
        <div className="stt-header-actions">
          <div className={`stt-status-pill stt-status-pill--${connectionStatus}`}>
            <span className="stt-status-dot" />
            {connectionStatus === 'connected' ? 'AI Engine Connected'
              : connectionStatus === 'connecting' ? 'Connecting…'
              : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Quick Test / Instant Detect Bar */}
      <div className="stt-quick-test-bar">
        <div className="stt-quick-test-label">
          <Sparkles size={14} className="text-blue" />
          <span>Quick Detect Presets (Tap to Test):</span>
        </div>
        <div className="stt-vocab-chips">
          {VOCABULARY.map(item => (
            <button
              key={item.key}
              className={`stt-vocab-btn ${activeTestingWord === item.key ? 'active' : ''}`}
              onClick={() => handleTestSign(item)}
              title={`Detect ${item.en} (${item.ml})`}
            >
              <span className="stt-vocab-ml">{item.ml}</span>
              <span className="stt-vocab-en">{item.en}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stt-layout">
        {/* Left: Webcam View */}
        <div className="stt-camera-wrap">
          <div className="stt-camera-badge">
            <span className="stt-live-dot" />
            Live Camera Feed
          </div>
          <WebcamView onFrame={handleWebcamFrame} isSimulateMode={false} />
        </div>

        {/* Right: Live Detection & Malayalam Output Panel */}
        <div className="stt-panel">
          {/* Main Detected Sign Card */}
          <div className="stt-detected-card">
            <div className="stt-card-top-row">
              <span className="stt-detected-label">MALAYALAM TRANSLATION</span>
              {latencyMs > 0 && (
                <span className="stt-latency-badge">
                  <Zap size={11} /> {latencyMs}ms
                </span>
              )}
            </div>

            {currentPrediction.label !== 'idle' && currentPrediction.malayalam ? (
              <div className="stt-prediction-result">
                {/* Large Malayalam Output */}
                <div className="stt-main-ml-word">
                  {currentPrediction.malayalam}
                </div>
                {/* English Meaning */}
                <div className="stt-english-label">
                  English: <strong>{currentPrediction.label.replace('_', ' ').toUpperCase()}</strong>
                </div>

                {/* Confidence Bar */}
                <div className="stt-confidence-section">
                  <div className="stt-confidence-row">
                    <span>Model Confidence</span>
                    <span className="stt-confidence-pct">
                      {(currentPrediction.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="stt-confidence-bar">
                    <div
                      className="stt-confidence-fill"
                      style={{
                        width: `${Math.min(100, currentPrediction.confidence * 100)}%`,
                        background: currentPrediction.confidence > 0.8 ? '#10B981' : '#0B4FE0'
                      }}
                    />
                  </div>
                </div>

                {/* Progress towards confirmation */}
                {consecutiveWins > 0 && (
                  <div className="stt-consecutive-progress">
                    <span className="stt-progress-text">Hold to confirm:</span>
                    <div className="stt-wins-row">
                      {Array.from({ length: REQUIRED_CONSECUTIVE_WINS }).map((_, i) => (
                        <div
                          key={i}
                          className={`stt-win-dot ${i < consecutiveWins ? 'stt-win-dot--filled' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="stt-detected-waiting">
                <Hand size={36} className="stt-waiting-icon" />
                <div className="stt-waiting-text">
                  {idleRequired ? (
                    <span className="text-amber">Gesture captured! Lower hands for next sign.</span>
                  ) : (
                    <span>Hold your hand in front of camera or tap a preset above</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons (Clean, helpful, NO TRAIN button) */}
          <div className="stt-actions">
            <button
              className="stt-action-btn stt-action-btn--primary"
              onClick={handleSpeakAll}
              disabled={detectedWords.length === 0}
            >
              <Volume2 size={16} /> Speak Malayalam
            </button>
            <button
              className="stt-action-btn"
              onClick={handleCopy}
              disabled={detectedWords.length === 0}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Sentence'}
            </button>
            {detectedWords.length > 0 && (
              <button
                className="stt-action-btn stt-action-btn--danger"
                onClick={() => setDetectedWords([])}
              >
                <Trash2 size={15} /> Clear
              </button>
            )}
          </div>

          {/* Translated Sentence Stream */}
          <div className="stt-word-history">
            <div className="stt-history-header">
              <span className="stt-history-label">TRANSLATED SENTENCE</span>
              {detectedWords.length > 0 && (
                <span className="stt-count-badge">{detectedWords.length} words</span>
              )}
            </div>

            {detectedWords.length > 0 ? (
              <div className="stt-sentence-box">
                <p className="stt-full-sentence-ml">
                  {detectedWords.map(w => w.ml || w.label).join(' ')}
                </p>
                <div className="stt-word-chips">
                  {detectedWords.map((w, i) => (
                    <span key={i} className="stt-word-chip">
                      <span className="stt-chip-ml">{w.ml}</span>
                      <span className="stt-chip-en">{w.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="stt-empty-sentence">
                Detected words will assemble into a complete sentence here.
              </div>
            )}
          </div>

          {/* Reconnect button if disconnected */}
          {connectionStatus === 'disconnected' && (
            <button className="stt-reconnect-btn" onClick={connectWebSocket}>
              <RefreshCw size={15} /> Reconnect to Server
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
