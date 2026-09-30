import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, RefreshCw, Video, Sparkles, Database, Bug, Activity, Layers, ArrowLeft } from 'lucide-react';
import WebcamView from '../components/WebcamView.jsx';
import SentencePanel from '../components/SentencePanel.jsx';
import SimulatePanel from '../components/SimulatePanel.jsx';
import { generateSyntheticSequence } from '../utils/simulate.js';
import labelsMap from '../labels_ml.json';

// ── Environment-driven URLs (set VITE_API_URL in .env for production) ─────────
const HTTP_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = HTTP_BASE.replace(/^http/, 'ws');          // http→ws, https→wss
const WS_URL = `${WS_BASE}/ws`;

const SEND_INTERVAL_MS = 200;
const REQUIRED_CONSECUTIVE_WINS = 8;
const MIN_CONFIDENCE = 0.85;

// How long (ms) with no hands before auto-releasing the idle latch
const NO_HAND_IDLE_RELEASE_MS = 1000;
// Absolute timeout (ms) before the latch auto-releases regardless
const LATCH_TIMEOUT_MS = 3000;

export default function TranslatorApp() {
  const navigate = useNavigate();

  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeTab, setActiveTab] = useState('webcam');
  const [sentenceWords, setSentenceWords] = useState([]);
  const [currentPrediction, setCurrentPrediction] = useState({ label: 'idle', confidence: 0, malayalam: '', top3: [] });
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [idleRequired, setIdleRequired] = useState(false);
  const [activeSimulatingSign, setActiveSimulatingSign] = useState(null);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);
  const [handsInWindow, setHandsInWindow] = useState(0);

  const wsRef = useRef(null);
  const slidingWindowRef = useRef([]);
  const lastCandidateRef = useRef(null);
  const winsCountRef = useRef(0);
  const idleRequiredRef = useRef(false);
  const latchSetAtRef = useRef(null);       // timestamp when latch was engaged
  const lastHandSeenRef = useRef(null);     // timestamp of last frame with ≥1 hand
  const handsInWindowRef = useRef(0);       // count of frames with a hand in current window

  // Keep idle ref in sync
  useEffect(() => {
    idleRequiredRef.current = idleRequired;
  }, [idleRequired]);

  const releaseIdle = useCallback(() => {
    idleRequiredRef.current = false;
    setIdleRequired(false);
    winsCountRef.current = 0;
    setConsecutiveWins(0);
    lastCandidateRef.current = null;
    latchSetAtRef.current = null;
  }, []);

  // ── Latch auto-release timers ────────────────────────────────────────────────
  useEffect(() => {
    if (!idleRequired) return;

    // 3-second hard timeout
    const hardTimeout = setTimeout(() => {
      releaseIdle();
    }, LATCH_TIMEOUT_MS);

    // Poll every 200 ms: if no hand seen for NO_HAND_IDLE_RELEASE_MS, release
    const pollTimer = setInterval(() => {
      const noHandMs = lastHandSeenRef.current
        ? performance.now() - lastHandSeenRef.current
        : Infinity;
      if (noHandMs >= NO_HAND_IDLE_RELEASE_MS) {
        releaseIdle();
      }
    }, 200);

    return () => {
      clearTimeout(hardTimeout);
      clearInterval(pollTimer);
    };
  }, [idleRequired, releaseIdle]);

  // WebSocket Connection with Auto-Reconnect
  useEffect(() => {
    let reconnectTimeout = null;
    let isComponentMounted = true;

    function connect() {
      if (!isComponentMounted) return;
      setConnectionStatus('connecting');
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => { if (isComponentMounted) setConnectionStatus('connected'); };
      ws.onmessage = (event) => {
        if (!isComponentMounted) return;
        try { handleServerResponse(JSON.parse(event.data)); }
        catch (err) { console.error('Error parsing server message:', err); }
      };
      ws.onerror = (err) => console.warn('WebSocket error:', err);
      ws.onclose = () => {
        if (!isComponentMounted) return;
        setConnectionStatus('disconnected');
        reconnectTimeout = setTimeout(connect, 2000);
      };
    }

    connect();
    return () => {
      isComponentMounted = false;
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleServerResponse = (res) => {
    if (res.error) { console.warn('Server error:', res.error); return; }

    if (res.client_timestamp) {
      setLatencyMs(Math.max(1, Math.round(performance.now() - res.client_timestamp)));
    }

    const { label, confidence, malayalam, top3 } = res;
    setCurrentPrediction({ label, confidence, malayalam, top3: top3 || [] });

    // Model predicts idle OR < 5 of 30 frames had a hand → treat as idle gap
    const isIdleFrame = label === 'idle' || handsInWindowRef.current < 5;

    if (isIdleFrame) {
      releaseIdle();
      return;
    }

    if (confidence >= MIN_CONFIDENCE) {
      if (idleRequiredRef.current) return; // locked until idle gap

      if (label === lastCandidateRef.current) {
        winsCountRef.current += 1;
        setConsecutiveWins(winsCountRef.current);

        if (winsCountRef.current === REQUIRED_CONSECUTIVE_WINS) {
          if (malayalam) setSentenceWords((prev) => [...prev, malayalam]);
          idleRequiredRef.current = true;
          latchSetAtRef.current = performance.now();
          setIdleRequired(true);
        }
      } else {
        lastCandidateRef.current = label;
        winsCountRef.current = 1;
        setConsecutiveWins(1);
      }
    } else {
      winsCountRef.current = 0;
      setConsecutiveWins(0);
      lastCandidateRef.current = null;
    }
  };

  const latestFrameRef = useRef(new Array(126).fill(0));
  const lastFrameTimeRef = useRef(0);
  const latestHandCountRef = useRef(0);

  const handleWebcamFrame = useCallback((frame126, handCount = 0) => {
    latestFrameRef.current = frame126;
    lastFrameTimeRef.current = performance.now();
    latestHandCountRef.current = handCount;
    if (handCount > 0) lastHandSeenRef.current = performance.now();
  }, []);

  // 10 FPS sampling into sliding window (30 frames = 3 s)
  useEffect(() => {
    if (activeTab !== 'webcam') return;

    const sampleTimer = setInterval(() => {
      const now = performance.now();
      const isStale = (now - lastFrameTimeRef.current) > 300;
      const frameToPush = isStale ? new Array(126).fill(0) : [...latestFrameRef.current];
      const handCount = isStale ? 0 : latestHandCountRef.current;

      slidingWindowRef.current.push({ frame: frameToPush, hands: handCount });
      if (slidingWindowRef.current.length > 30) slidingWindowRef.current.shift();

      // Count frames with ≥1 hand in current window
      const hCount = slidingWindowRef.current.filter(f => f.hands > 0).length;
      handsInWindowRef.current = hCount;
      setHandsInWindow(hCount);
    }, 100);

    return () => clearInterval(sampleTimer);
  }, [activeTab]);

  // Dispatch sliding window to server ~5×/s
  useEffect(() => {
    const timer = setInterval(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const windowData = slidingWindowRef.current;
      if (windowData.length === 0) return;

      let payload = windowData.map(f => f.frame || f);
      while (payload.length < 30) payload.unshift(new Array(126).fill(0));

      ws.send(JSON.stringify({ sequence: payload, client_timestamp: performance.now() }));
    }, SEND_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  // Simulate mode
  const handleInjectSign = (signKey) => {
    setActiveSimulatingSign(signKey);
    const seq = generateSyntheticSequence(signKey);
    slidingWindowRef.current = seq.map(f => ({ frame: f, hands: 1 }));
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      let bursts = 0;
      const burstInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN && bursts < 9) {
          ws.send(JSON.stringify({ sequence: seq, client_timestamp: performance.now() }));
          bursts++;
        } else {
          clearInterval(burstInterval);
          setTimeout(() => setActiveSimulatingSign(null), 300);
        }
      }, 60);
    }
  };

  const handleInjectIdle = () => {
    const idleSeq = generateSyntheticSequence('idle');
    slidingWindowRef.current = idleSeq.map(f => ({ frame: f, hands: 0 }));
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ sequence: idleSeq, client_timestamp: performance.now() }));
    }
    releaseIdle();
  };

  const handleClear = () => setSentenceWords([]);
  const handleBackspace = () => setSentenceWords((prev) => prev.slice(0, -1));

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'inherit' }}
          >
            <div className="brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/mova-icon.png" alt="MOVA" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1>MOVA Translator</h1>
                <span className="brand-badge">Real-Time</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                ഇന്ത്യൻ ആംഗ്യഭാഷ തത്സമയം മലയാളത്തിലേക്ക് മാറ്റുന്നു
              </p>
            </div>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="tabs-nav">
            <button className={`tab-btn ${activeTab === 'webcam' ? 'active' : ''}`} onClick={() => setActiveTab('webcam')}>
              <Video size={15} /><span>Webcam</span>
            </button>
            <button className={`tab-btn ${activeTab === 'simulate' ? 'active' : ''}`} onClick={() => setActiveTab('simulate')}>
              <Sparkles size={15} /><span>Simulate</span>
            </button>
          </div>

          <button className={`btn ${showDebugOverlay ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowDebugOverlay(!showDebugOverlay)}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
            <Bug size={15} /><span>Debug</span>
          </button>

          <div className={`status-pill status-${connectionStatus}`}>
            <span className="status-dot" />
            <span>
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'disconnected' && 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid-main">
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <WebcamView onFrame={handleWebcamFrame} isSimulateMode={activeTab === 'simulate'} />
          <div className="live-prediction-tag">
            <span className="prediction-label">Live Recognition:</span>
            <span className="prediction-val">
              {currentPrediction.label}
              {currentPrediction.confidence > 0 && ` (${(currentPrediction.confidence * 100).toFixed(1)}%)`}
            </span>
            {currentPrediction.malayalam && (
              <>
                <span style={{ color: '#64748b' }}>➔</span>
                <span className="prediction-ml">{currentPrediction.malayalam}</span>
              </>
            )}
          </div>
        </div>

        <div>
          <SentencePanel
            sentenceWords={sentenceWords}
            onClear={handleClear}
            onBackspace={handleBackspace}
            currentPrediction={currentPrediction}
            consecutiveWins={consecutiveWins}
            idleRequired={idleRequired}
          />
        </div>
      </div>

      {/* Debug Overlay */}
      {showDebugOverlay && (
        <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.25rem', border: '1px solid rgba(56,189,248,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity className="text-cyan-400" size={18} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#38bdf8' }}>Debug Overlay</h3>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
              <div>Latency: <strong style={{ color: latencyMs < 80 ? '#10b981' : '#f59e0b' }}>{latencyMs} ms</strong></div>
              <div>Wins: <strong style={{ color: consecutiveWins >= 8 ? '#10b981' : '#38bdf8' }}>{consecutiveWins} / 8</strong></div>
              <div>Hands in window: <strong style={{ color: handsInWindow >= 5 ? '#10b981' : '#f59e0b' }}>{handsInWindow} / 30</strong></div>
              <div>Latch: <strong style={{ color: idleRequired ? '#f59e0b' : '#10b981' }}>{idleRequired ? 'LOCKED (auto-releases in 3 s or on hands-down)' : 'CLEAR'}</strong></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Top-3 */}
            <div style={{ background: 'rgba(15,23,42,0.7)', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Layers size={14} /> Top-3 Model Softmax Predictions:
              </div>
              {currentPrediction.top3 && currentPrediction.top3.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentPrediction.top3.map((pred, i) => {
                    const pct = Math.round(pred.confidence * 100);
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                          <span>#{i + 1} <strong>{pred.label}</strong> {pred.malayalam ? `(${pred.malayalam})` : ''}</span>
                          <span style={{ fontWeight: 600 }}>{pct}%</span>
                        </div>
                        <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: i === 0 ? '#38bdf8' : i === 1 ? '#a855f7' : '#64748b', borderRadius: '9999px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Awaiting WebSocket stream...</div>
              )}
            </div>

            {/* Pipeline info */}
            <div style={{ background: 'rgba(15,23,42,0.7)', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.825rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              <div><strong>Sliding Window:</strong> 30 frames × 126 values (2 hands × 21 × 3)</div>
              <div><strong>Dispatch:</strong> ~5×/s (200 ms tick)</div>
              <div><strong>Stability:</strong> 8 consecutive wins ≥ 0.85 confidence</div>
              <div><strong>Idle trigger:</strong> model=idle OR hands-in-window &lt; 5</div>
              <div><strong>Latch timeout:</strong> 3 s hard-release, 1 s no-hand-release</div>
              <div><strong>Server:</strong> {WS_URL}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'simulate' && (
        <SimulatePanel
          onInjectSign={handleInjectSign}
          onInjectIdle={handleInjectIdle}
          activeSimulatingSign={activeSimulatingSign}
        />
      )}
    </div>
  );
}
