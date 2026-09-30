import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Camera, VideoOff, RefreshCw, AlertCircle } from 'lucide-react';
import { processLandmarkerResult } from '../utils/normalize';

// ── Self-hosted MediaPipe paths (no CDN, no external requests) ────────────────
// Files live in frontend/public/mediapipe/ and are served from the same origin.
// BASE_URL is "/" in dev and may be a subpath in production (set via vite.config).
const WASM_PATH  = `${import.meta.env.BASE_URL}mediapipe/wasm`;
const MODEL_PATH = `${import.meta.env.BASE_URL}mediapipe/hand_landmarker.task`;

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

export default function WebcamView({ onFrame, isSimulateMode }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [loadingModel, setLoadingModel] = useState(true);
  const [loadingStage, setLoadingStage] = useState('Initialising…');
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [handsDetectedCount, setHandsDetectedCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // ── MediaPipe initialisation ────────────────────────────────────────────────
  const initMediaPipe = useCallback(async () => {
    setLoadingModel(true);
    setErrorMsg(null);
    setLoadingStage('Loading WASM runtime…');

    let vision;
    try {
      vision = await FilesetResolver.forVisionTasks(WASM_PATH);
    } catch (err) {
      console.error('FilesetResolver failed:', err);
      setErrorMsg(
        `Failed to load MediaPipe WASM runtime from ${WASM_PATH}. ` +
        'Make sure the frontend/public/mediapipe/wasm/ folder was copied correctly.'
      );
      setLoadingModel(false);
      return;
    }

    setLoadingStage('Loading hand landmark model…');

    // Try GPU delegate first, fall back to CPU automatically
    let landmarker;
    for (const delegate of ['GPU', 'CPU']) {
      try {
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_PATH,
            delegate,
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.3,
          minHandPresenceConfidence: 0.3,
          minTrackingConfidence: 0.3,
        });
        console.info(`HandLandmarker loaded with ${delegate} delegate.`);
        break; // success — stop trying
      } catch (err) {
        console.warn(`HandLandmarker ${delegate} delegate failed:`, err);
        if (delegate === 'CPU') {
          // Both delegates failed
          setErrorMsg(
            'Failed to load the hand landmark model. ' +
            'Check that frontend/public/mediapipe/hand_landmarker.task exists and is intact. ' +
            'You can still use Simulate Mode below.'
          );
          setLoadingModel(false);
          return;
        }
        // else try CPU on next iteration
      }
    }

    landmarkerRef.current = landmarker;
    setLoadingModel(false);
    setLoadingStage('');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await initMediaPipe();
      if (cancelled && landmarkerRef.current) {
        try { landmarkerRef.current.close(); } catch (_) {}
        landmarkerRef.current = null;
      }
    };
    run();

    return () => {
      cancelled = true;
      if (landmarkerRef.current) {
        try { landmarkerRef.current.close(); } catch (_) {}
        landmarkerRef.current = null;
      }
    };
  }, [initMediaPipe, retryCount]); // retryCount triggers a fresh init on Retry

  // ── Camera control ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 30 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('Camera access denied or unavailable. Use Simulate Mode below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!loadingModel && !isSimulateMode) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [loadingModel, isSimulateMode]);

  // ── Render loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let lastVideoTime = -1;
    let lastProcessedTime = 0;
    let lastTimestampMs = 0;

    const renderLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (video && canvas && landmarker && cameraActive && video.readyState >= 2) {
        const now = performance.now();
        const timestampMs = Math.max(lastTimestampMs + 1, Math.round(now));
        lastTimestampMs = timestampMs;

        if (video.currentTime !== lastVideoTime || (now - lastProcessedTime) > 30) {
          lastVideoTime = video.currentTime;
          lastProcessedTime = now;

          let results = null;
          try {
            results = landmarker.detectForVideo(video, timestampMs);
          } catch (err) {
            console.warn('detectForVideo error:', err);
          }

          const ctx = canvas.getContext('2d');
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results?.landmarks?.length) {
            setHandsDetectedCount(results.landmarks.length);

            for (let hIdx = 0; hIdx < results.landmarks.length; hIdx++) {
              const landmarks = results.landmarks[hIdx];
              const handedness = results.handednesses?.[hIdx]?.[0]?.categoryName;
              const strokeColor = handedness === 'Left' ? '#10B981' : '#38BDF8';

              ctx.strokeStyle = strokeColor;
              ctx.lineWidth = 3.5;
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
                ctx.fillStyle = '#F43F5E';
                ctx.beginPath();
                ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4.5, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 2, 0, 2 * Math.PI);
                ctx.fill();
              }
            }

            // Extract 126 normalized values and pass hand count to parent
            const featureVector = processLandmarkerResult(results);
            onFrame(featureVector, results.landmarks.length);
          } else {
            setHandsDetectedCount(0);
            onFrame(new Array(126).fill(0), 0);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    if (cameraActive) {
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [cameraActive, onFrame]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="video-wrapper">
      <video ref={videoRef} playsInline muted />
      <canvas ref={canvasRef} />

      {/* Camera status badge */}
      <div className="camera-overlay-badge">
        <Camera size={14} className={cameraActive ? 'text-emerald-400' : 'text-slate-400'} />
        <span>{cameraActive ? `Active (${handsDetectedCount} hand${handsDetectedCount !== 1 ? 's' : ''})` : 'Camera Off'}</span>
      </div>

      {/* Loading indicator */}
      {loadingModel && (
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 20 }}>
          <RefreshCw className="animate-spin text-cyan-400" size={36} />
          <span style={{ fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center', maxWidth: '260px' }}>
            {loadingStage}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Loading from local server (no CDN)
          </span>
        </div>
      )}

      {/* Error with Retry button */}
      {errorMsg && !loadingModel && (
        <div style={{
          position: 'absolute',
          padding: '1rem 1.25rem',
          background: 'rgba(244,63,94,0.15)',
          border: '1px solid #f43f5e',
          borderRadius: '0.75rem',
          margin: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 20,
          maxWidth: '320px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertCircle size={20} color="#f43f5e" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '0.82rem', color: '#fecdd3', lineHeight: 1.5 }}>{errorMsg}</span>
          </div>
          <button
            onClick={() => {
              setRetryCount(c => c + 1);
            }}
            style={{
              background: 'rgba(244,63,94,0.25)',
              border: '1px solid #f43f5e',
              borderRadius: '0.5rem',
              color: '#fecdd3',
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '0.45rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              alignSelf: 'flex-start',
            }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Simulate-mode overlay */}
      {!cameraActive && !loadingModel && !errorMsg && (
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 20 }}>
          <VideoOff size={40} color="#64748b" />
          <span style={{ color: '#94a3b8' }}>Webcam is paused (Simulate Mode active)</span>
        </div>
      )}
    </div>
  );
}
