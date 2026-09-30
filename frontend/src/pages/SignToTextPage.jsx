import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, Trash2, Volume2, RefreshCw, Bug } from 'lucide-react';
import WebcamView from '../components/WebcamView.jsx';
import labelsMap from '../labels_ml.json';
import './SignToTextPage.css';

const HTTP_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = HTTP_BASE.replace(/^http/, 'ws');
const WS_URL = `${WS_BASE}/ws`;

const SEND_INTERVAL_MS = 200;
const REQUIRED_CONSECUTIVE_WINS = 8;
const MIN_CONFIDENCE = 0.85;
const NO_HAND_IDLE_RELEASE_MS = 1000;
const LATCH_TIMEOUT_MS = 3000;

export default function SignToTextPage() {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [currentPrediction, setCurrentPrediction] = useState({ label: 'idle', confidence: 0, malayalam: '', top3: [] });
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [idleRequired, setIdleRequired] = useState(false);
  const [detectedWords, setDetectedWords] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);
  const [handsInWindow, setHandsInWindow] = useState(0);

  const wsRef = useRef(null);
  const slidingWindowRef = useRef([]);
  const lastCandidateRef = useRef(null);
  const winsCountRef = useRef(0);
  const idleRequiredRef = useRef(false);
  const latchSetAtRef = useRef(null);
  const lastHandSeenRef = useRef(null);
  const handsInWindowRef = useRef(0);

  useEffect(() => { idleRequiredRef.current = idleRequired; }, [idleRequired]);

  const releaseIdle = useCallback(() => {
    idleRequiredRef.current = false;
    setIdleRequired(false);
    winsCountRef.current = 0;
    setConsecutiveWins(0);
    lastCandidateRef.current = null;
    latchSetAtRef.current = null;
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => setConnectionStatus('connected');
    ws.onclose = () => { setConnectionStatus('disconnected'); setTimeout(connectWebSocket, 2000); };
    ws.onerror = () => setConnectionStatus('disconnected');
    ws.onmessage = (event) => {
      try {
        const t0 = performance.now();
        const data = JSON.parse(event.data);
        setLatencyMs(Math.round(performance.now() - t0 + (data.latency_ms || 0)));
        const { label, confidence, top3 } = data;
        const ml = labelsMap[label] || '';
        setCurrentPrediction({ label, confidence, malayalam: ml, top3: top3 || [] });

        if (label === 'idle') {
          if (idleRequiredRef.current) releaseIdle();
          return;
        }
        if (idleRequiredRef.current) {
          const latchAge = latchSetAtRef.current ? Date.now() - latchSetAtRef.current : 0;
          if (latchAge < LATCH_TIMEOUT_MS) return;
          releaseIdle();
        }
        if (confidence < MIN_CONFIDENCE) { winsCountRef.current = 0; return; }
        if (lastCandidateRef.current !== label) {
          lastCandidateRef.current = label;
          winsCountRef.current = 1;
        } else {
          winsCountRef.current += 1;
        }
        setConsecutiveWins(winsCountRef.current);
        if (winsCountRef.current >= REQUIRED_CONSECUTIVE_WINS) {
          setDetectedWords(prev => [...prev, { label, ml }]);
          speak(ml || label);
          idleRequiredRef.current = true;
          latchSetAtRef.current = Date.now();
          setIdleRequired(true);
          winsCountRef.current = 0;
          setConsecutiveWins(0);
          lastCandidateRef.current = null;
        }
      } catch { /* ignore parse errors */ }
    };
  }, [releaseIdle]);

  useEffect(() => {
    connectWebSocket();
    return () => wsRef.current?.close();
  }, [connectWebSocket]);

  const speak = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ml-IN';
      window.speechSynthesis.speak(utter);
    }
  };

  const handleWebcamFrame = useCallback((landmarks, numHands) => {
    if (!landmarks || landmarks.length === 0) {
      const timeSinceHand = lastHandSeenRef.current
        ? Date.now() - lastHandSeenRef.current
        : Infinity;
      if (timeSinceHand > NO_HAND_IDLE_RELEASE_MS && idleRequiredRef.current) {
        releaseIdle();
      }
      handsInWindowRef.current = Math.max(0, handsInWindowRef.current - 1);
      setHandsInWindow(handsInWindowRef.current);
      return;
    }

    lastHandSeenRef.current = Date.now();
    handsInWindowRef.current = Math.min(30, handsInWindowRef.current + numHands);
    setHandsInWindow(handsInWindowRef.current);

    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    const flat = landmarks.flat();
    slidingWindowRef.current.push(flat);
    if (slidingWindowRef.current.length > 30) slidingWindowRef.current.shift();
    if (slidingWindowRef.current.length < 30) return;

    wsRef.current.send(JSON.stringify({ window: slidingWindowRef.current }));
  }, [releaseIdle]);

  const handleCopy = () => {
    const text = detectedWords.map(w => w.ml || w.label).join(' ');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleSpeak = () => speak(detectedWords.map(w => w.ml || w.label).join(' '));

  return (
    <div className="stt-root">
      {/* Page Header */}
      <div className="stt-header">
        <div>
          <h1 className="stt-title">Sign to Text</h1>
          <p className="stt-sub">Show a sign. Get instant translation.</p>
        </div>
        <div className="stt-header-actions">
          <div className={`stt-status-pill stt-status-pill--${connectionStatus}`}>
            <span className="stt-status-dot" />
            {connectionStatus === 'connected' ? 'Camera Active'
              : connectionStatus === 'connecting' ? 'Connecting…'
              : 'Disconnected'}
          </div>
          <button
            className={`stt-icon-btn ${showDebug ? 'stt-icon-btn--active' : ''}`}
            onClick={() => setShowDebug(v => !v)}
            title="Debug overlay"
          >
            <Bug size={16} />
          </button>
        </div>
      </div>

      <div className="stt-layout">
        {/* Left: Webcam */}
        <div className="stt-camera-wrap">
          <div className="stt-camera-badge">
            <span className="stt-live-dot" />
            Live
          </div>
          <WebcamView onFrame={handleWebcamFrame} isSimulateMode={false} />
        </div>

        {/* Right: Detection Panel */}
        <div className="stt-panel">
          {/* Detected Sign */}
          <div className="stt-detected-card">
            <div className="stt-detected-label">DETECTED SIGN</div>
            {currentPrediction.label !== 'idle' && currentPrediction.label ? (
              <>
                <div className="stt-detected-word">
                  {currentPrediction.label.charAt(0).toUpperCase() + currentPrediction.label.slice(1)}
                  {currentPrediction.malayalam && (
                    <span className="stt-detected-ml"> / {currentPrediction.malayalam}</span>
                  )}
                </div>
                {currentPrediction.malayalam && (
                  <div className="stt-detected-transliteration">
                    Malayalam: "{currentPrediction.malayalam}"
                  </div>
                )}
              </>
            ) : (
              <div className="stt-detected-waiting">
                {idleRequired ? (
                  <span style={{ color: '#F59E0B' }}>Return to idle position…</span>
                ) : (
                  <span>Show a sign to detect</span>
                )}
              </div>
            )}

            {/* Confidence Bar */}
            {currentPrediction.confidence > 0 && currentPrediction.label !== 'idle' && (
              <div className="stt-confidence">
                <div className="stt-confidence-row">
                  <span>Confidence</span>
                  <span className="stt-confidence-pct">
                    {(currentPrediction.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="stt-confidence-bar">
                  <div
                    className="stt-confidence-fill"
                    style={{
                      width: `${currentPrediction.confidence * 100}%`,
                      background: currentPrediction.confidence > 0.85 ? '#10B981' : '#F59E0B',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Progress dots */}
            {consecutiveWins > 0 && (
              <div className="stt-wins-row">
                {Array.from({ length: REQUIRED_CONSECUTIVE_WINS }).map((_, i) => (
                  <div
                    key={i}
                    className={`stt-win-dot ${i < consecutiveWins ? 'stt-win-dot--filled' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="stt-actions">
            <button
              className="stt-action-btn stt-action-btn--primary"
              onClick={() => window.open('/app/sign-to-text', '_self')}
            >
              ✦ TRAIN
            </button>
            <button
              className="stt-action-btn"
              onClick={handleSpeak}
              disabled={detectedWords.length === 0}
            >
              <Volume2 size={16} /> Play Audio
            </button>
            <button
              className="stt-action-btn"
              onClick={handleCopy}
              disabled={detectedWords.length === 0}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              Copy Text
            </button>
          </div>

          {/* Word History */}
          {detectedWords.length > 0 && (
            <div className="stt-word-history">
              <div className="stt-history-header">
                <span className="stt-history-label">Detected Words</span>
                <button
                  className="stt-clear-btn"
                  onClick={() => setDetectedWords([])}
                  title="Clear all"
                >
                  <Trash2 size={14} /> Clear
                </button>
              </div>
              <div className="stt-word-chips">
                {detectedWords.map((w, i) => (
                  <div key={i} className="stt-word-chip">
                    <span className="stt-word-chip-ml">{w.ml || w.label}</span>
                    <span className="stt-word-chip-en">{w.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reconnect button */}
          {connectionStatus === 'disconnected' && (
            <button className="stt-reconnect-btn" onClick={connectWebSocket}>
              <RefreshCw size={15} /> Reconnect
            </button>
          )}

          {/* Debug */}
          {showDebug && (
            <div className="stt-debug">
              <div className="stt-debug-title">Debug</div>
              <div className="stt-debug-rows">
                <div>Latency: <strong>{latencyMs} ms</strong></div>
                <div>Wins: <strong>{consecutiveWins} / {REQUIRED_CONSECUTIVE_WINS}</strong></div>
                <div>Hands: <strong>{handsInWindow} / 30</strong></div>
                <div>Latch: <strong style={{ color: idleRequired ? '#F59E0B' : '#10B981' }}>{idleRequired ? 'LOCKED' : 'CLEAR'}</strong></div>
              </div>
              {currentPrediction.top3?.length > 0 && (
                <div className="stt-top3">
                  {currentPrediction.top3.map(([lbl, conf]) => (
                    <div key={lbl} className="stt-top3-row">
                      <span>{lbl}</span>
                      <div className="stt-top3-bar-wrap">
                        <div className="stt-top3-bar" style={{ width: `${conf * 100}%` }} />
                      </div>
                      <span>{(conf * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
