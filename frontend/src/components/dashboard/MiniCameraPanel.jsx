import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Volume2, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import labelsMap from '../../labels_ml.json';
import './MiniCameraPanel.css';

const WASM_PATH = `${import.meta.env.BASE_URL}mediapipe/wasm`;
const MODEL_PATH = `${import.meta.env.BASE_URL}mediapipe/hand_landmarker.task`;

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

export default function MiniCameraPanel({ onSignDetected }) {
  const [cameraState, setCameraState] = useState('idle'); // 'idle' | 'loading' | 'active' | 'denied'
  const [statusMessage, setStatusMessage] = useState('Camera is off');
  const [latestSign, setLatestSign] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const wsRef = useRef(null);
  const lastDetectedRef = useRef(null);
  const lastDetectionTimeRef = useRef(0);

  // Stop camera tracks and teardown
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setCameraState('idle');
    setStatusMessage('Camera stopped');
  }, []);

  // Teardown when tab is hidden or on unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopCamera();
    };
  }, [stopCamera]);

  // Handle recognized gesture
  const handleRecognized = useCallback((label, ml, conf = 0.92) => {
    const now = Date.now();
    // Debounce detections (1.8s latch)
    if (lastDetectedRef.current === label && now - lastDetectionTimeRef.current < 2000) {
      return;
    }
    lastDetectedRef.current = label;
    lastDetectionTimeRef.current = now;

    // Resolve readable English label
    const en = label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const signObj = { en, ml: ml || labelsMap[label]?.malayalam || label, label, confidence: conf };

    setLatestSign(signObj);
    setStatusMessage(`Recognized ${en}`);

    if (onSignDetected) {
      onSignDetected(signObj);
    }
  }, [onSignDetected]);

  // Connect WebSocket for live AI model predictions
  const initWebSocket = useCallback(() => {
    const httpBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsBase = httpBase.replace(/^http/, 'ws');
    const wsUrl = `${wsBase}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.label && data.label !== 'idle' && data.confidence > 0.70) {
            handleRecognized(data.label, data.malayalam, data.confidence);
          }
        } catch {}
      };

      ws.onerror = () => {};
    } catch {}
  }, [handleRecognized]);

  // Start Camera & MediaPipe
  const startCamera = async () => {
    setCameraState('loading');
    setStatusMessage('Starting camera and MediaPipe…');

    try {
      // 1. Get webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;

      // 2. Load MediaPipe Hand Landmarker if not yet loaded
      if (!landmarkerRef.current) {
        setStatusMessage('Loading hand tracking model…');
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        try {
          landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        } catch {
          // Fallback to CPU delegate if GPU fails
          landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'CPU' },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        }
      }

      // 3. Connect to backend websocket if available
      initWebSocket();

      setCameraState('active');
      setStatusMessage('Camera active. Tracking hand landmarks.');
    } catch (err) {
      console.error('Camera startup error:', err);
      setCameraState('denied');
      setStatusMessage('Camera permission denied or camera not found.');
    }
  };

  // Video metadata loaded -> start render loop
  useEffect(() => {
    if (cameraState !== 'active' || !videoRef.current || !streamRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch(() => {});

    let lastVideoTime = -1;
    let lastProcessedTime = 0;
    let lastTimestampMs = 0;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (video && canvas && landmarker && video.readyState >= 2) {
        const now = performance.now();
        const timestampMs = Math.max(lastTimestampMs + 1, Math.round(now));
        lastTimestampMs = timestampMs;

        if (video.currentTime !== lastVideoTime || (now - lastProcessedTime) > 35) {
          lastVideoTime = video.currentTime;
          lastProcessedTime = now;

          let results = null;
          try {
            results = landmarker.detectForVideo(video, timestampMs);
          } catch {}

          const ctx = canvas.getContext('2d');
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results?.landmarks?.length) {
            // Draw skeleton & landmarks
            for (let hIdx = 0; hIdx < results.landmarks.length; hIdx++) {
              const landmarks = results.landmarks[hIdx];
              const handedness = results.handednesses?.[hIdx]?.[0]?.categoryName;
              const strokeColor = handedness === 'Left' ? '#10B981' : '#38BDF8';

              ctx.strokeStyle = strokeColor;
              ctx.lineWidth = 3;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';

              for (const [p1, p2] of HAND_CONNECTIONS) {
                const pt1 = landmarks[p1];
                const pt2 = landmarks[p2];
                if (pt1 && pt2) {
                  ctx.beginPath();
                  ctx.moveTo(pt1.x * canvas.width, pt1.y * canvas.height);
                  ctx.lineTo(pt2.x * canvas.width, pt2.y * canvas.height);
                  ctx.stroke();
                }
              }

              for (const pt of landmarks) {
                ctx.fillStyle = '#1558E8';
                ctx.beginPath();
                ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 1.8, 0, 2 * Math.PI);
                ctx.fill();
              }
            }

            // Send landmarks array to websocket if connected
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              const flat = new Array(126).fill(0);
              const firstHand = results.landmarks[0] || [];
              firstHand.slice(0, 21).forEach((pt, i) => {
                flat[i * 3] = pt.x;
                flat[i * 3 + 1] = pt.y;
                flat[i * 3 + 2] = pt.z || 0;
              });
              wsRef.current.send(JSON.stringify({ landmarks: flat, timestamp: Date.now() }));
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [cameraState]);

  // Speak recognized word
  const speakLatest = () => {
    if (!latestSign?.ml || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(latestSign.ml);
    utter.lang = 'ml-IN';
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="mini-cam-root">
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        {statusMessage}
      </div>

      {/* Top Bar */}
      <div className="mini-cam-topbar">
        <div className="mini-cam-badge">
          {cameraState === 'active' ? (
            <>
              <span className="mini-cam-pulse-dot" /> LIVE PREVIEW
            </>
          ) : (
            'MINI CAMERA'
          )}
        </div>
        {cameraState === 'active' && (
          <button
            type="button"
            className="mini-cam-stop-btn"
            onClick={stopCamera}
            aria-label="Stop camera"
          >
            Stop
          </button>
        )}
      </div>

      {/* 4:3 Viewfinder Area */}
      <div className="mini-cam-viewport">
        {/* Viewfinder corner brackets in blue */}
        <span className="mini-corner-bracket mini-corner-tl" aria-hidden="true" />
        <span className="mini-corner-bracket mini-corner-tr" aria-hidden="true" />
        <span className="mini-corner-bracket mini-corner-bl" aria-hidden="true" />
        <span className="mini-corner-bracket mini-corner-br" aria-hidden="true" />

        {/* 1. Idle State */}
        {cameraState === 'idle' && (
          <div className="mini-cam-idle">
            <div className="mini-cam-icon-circle">
              <Camera size={24} />
            </div>
            <h4 className="mini-cam-idle-title">Ready to Translate</h4>
            <p className="mini-cam-idle-desc">
              Track 21 hand landmarks directly from your dashboard.
            </p>
            <button
              type="button"
              className="mini-cam-start-btn"
              onClick={startCamera}
            >
              <Camera size={16} />
              <span>Start camera</span>
            </button>
          </div>
        )}

        {/* 2. Loading State */}
        {cameraState === 'loading' && (
          <div className="mini-cam-idle">
            <RefreshCw size={28} className="animate-spin text-blue-600" />
            <h4 className="mini-cam-idle-title">Starting Camera…</h4>
            <p className="mini-cam-idle-desc">Initialising MediaPipe hand tracking</p>
          </div>
        )}

        {/* 3. Denied / Error State */}
        {cameraState === 'denied' && (
          <div className="mini-cam-denied">
            <div className="mini-cam-denied-icon">
              <AlertTriangle size={22} />
            </div>
            <h4 className="mini-cam-denied-title">Camera Unavailable</h4>
            <p className="mini-cam-denied-desc">
              Please allow camera permissions in your browser to detect hand gestures.
            </p>
            <Link to="/help" className="mini-cam-help-link">
              How to allow camera →
            </Link>
            <button
              type="button"
              className="mini-cam-retry-btn"
              onClick={startCamera}
            >
              Try again
            </button>
          </div>
        )}

        {/* 4. Active State */}
        {cameraState === 'active' && (
          <div className="mini-cam-active-wrap">
            <video
              ref={videoRef}
              className="mini-cam-video"
              playsInline
              muted
              autoPlay
            />
            <canvas ref={canvasRef} className="mini-cam-canvas" />
          </div>
        )}
      </div>

      {/* Output Bar Below Preview */}
      <div className="mini-cam-results">
        <div className="mini-cam-res-left">
          <div className="mini-cam-res-sub">LATEST RECOGNIZED SIGN</div>
          <div className="mini-cam-res-ml">
            {latestSign ? latestSign.ml : 'നമസ്കാരം'}
          </div>
          <div className="mini-cam-res-en">
            {latestSign ? `"${latestSign.en}"` : '"Hello"'}
          </div>
        </div>

        <button
          type="button"
          className="mini-cam-speak-btn"
          onClick={speakLatest}
          aria-label="Speak latest translation aloud"
          title="Speak aloud"
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* Footer link to full translator */}
      <div className="mini-cam-footer">
        <Link to="/app/sign-to-text" className="mini-cam-full-link">
          <span>Open full translator</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
