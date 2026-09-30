import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Camera, Trash2, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, User, Tag, Play } from 'lucide-react';
import WebcamView from './WebcamView';
import labelsMap from '../labels_ml.json';

const TARGET_SAMPLES_PER_SIGN = 15;
const SEQUENCE_LENGTH = 30;

export default function CollectorPage({ onBackToTranslator }) {
  const [selectedLabel, setSelectedLabel] = useState('hello');
  const [personName, setPersonName] = useState(() => localStorage.getItem('isl_person_name') || 'person1');
  const [countsData, setCountsData] = useState({ counts_by_label: {}, counts_by_person: {}, total_samples: 0 });
  const [recordingState, setRecordingState] = useState('IDLE'); // 'IDLE' | 'COUNTDOWN' | 'RECORDING' | 'SAVING'
  const [countdownNum, setCountdownNum] = useState(3);
  const [capturedCount, setCapturedCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [timingStats, setTimingStats] = useState(null); // { meanInterval: number, totalDuration: number }

  const currentFrameRef = useRef(new Array(126).fill(0));
  const lastFrameTimeRef = useRef(0);
  const recordedSequenceRef = useRef([]);
  const sampleTimestampsRef = useRef([]);

  // Group labels by parent_label (grouped by parent_label, plus "idle")
  const groupedLabels = useMemo(() => {
    const groups = {};
    for (const [slug, item] of Object.entries(labelsMap)) {
      const parent = item.parent_label || 'Other';
      if (!groups[parent]) groups[parent] = [];
      groups[parent].push({ slug, ...item });
    }
    return groups;
  }, []);

  // Persist person name in localStorage
  useEffect(() => {
    localStorage.setItem('isl_person_name', personName);
  }, [personName]);

  // Fetch counts from backend
  const fetchCounts = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/samples/counts');
      if (res.ok) {
        const data = await res.json();
        setCountsData(data);
      }
    } catch (e) {
      console.warn('Could not fetch sample counts:', e);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  // Update current frame from WebcamView
  const handleFrame = (vec126) => {
    currentFrameRef.current = vec126;
    lastFrameTimeRef.current = performance.now();
  };

  // Fixed 100 ms timer for recording exactly 30 frames over 3.0 seconds (10 fps)
  useEffect(() => {
    if (recordingState !== 'RECORDING') return;

    sampleTimestampsRef.current = [];
    recordedSequenceRef.current = [];

    const recordTimer = setInterval(() => {
      const now = performance.now();
      sampleTimestampsRef.current.push(now);

      // Hand missing (>300ms since last detected frame) -> zeros
      const isStale = (now - lastFrameTimeRef.current) > 300;
      const frameToSample = isStale ? new Array(126).fill(0) : [...currentFrameRef.current];

      recordedSequenceRef.current.push(frameToSample);
      const currentLen = recordedSequenceRef.current.length;
      setCapturedCount(currentLen);

      if (currentLen >= SEQUENCE_LENGTH) {
        clearInterval(recordTimer);
        setRecordingState('SAVING');

        // Compute timing readout
        const ts = sampleTimestampsRef.current;
        if (ts.length >= 2) {
          const totalDur = Math.round(ts[ts.length - 1] - ts[0]);
          let sumDiff = 0;
          for (let i = 1; i < ts.length; i++) {
            sumDiff += (ts[i] - ts[i - 1]);
          }
          const meanInterval = (sumDiff / (ts.length - 1)).toFixed(1);
          setTimingStats({ meanInterval, totalDuration: totalDur, frameCount: ts.length });
        }

        saveSequence(recordedSequenceRef.current);
      }
    }, 100);

    return () => clearInterval(recordTimer);
  }, [recordingState]);

  // Start countdown and recording
  const startRecording = () => {
    if (recordingState !== 'IDLE') return;
    setStatusMessage(null);
    recordedSequenceRef.current = [];
    sampleTimestampsRef.current = [];
    setCapturedCount(0);
    setRecordingState('COUNTDOWN');
    setCountdownNum(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
      } else {
        clearInterval(interval);
        setRecordingState('RECORDING');
      }
    }, 1000);
  };

  // Save 30x126 sequence to backend
  const saveSequence = async (seq) => {
    try {
      const cleanSeq = seq.slice(0, SEQUENCE_LENGTH);
      const res = await fetch('http://127.0.0.1:8000/api/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: selectedLabel,
          person: personName.trim() || 'user',
          sequence: cleanSeq
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to save sample');
      }

      const result = await res.json();
      setStatusMessage({ type: 'success', text: `Sample saved! Total for '${selectedLabel}': ${result.count_for_label}` });
      fetchCounts();
    } catch (err) {
      console.error('Error saving sample:', err);
      setStatusMessage({ type: 'error', text: `Save error: ${err.message}` });
    } finally {
      setRecordingState('IDLE');
    }
  };

  // Delete last sample
  const handleDeleteLast = async () => {
    if (!window.confirm(`Delete the last recorded sample for '${selectedLabel}' by '${personName}'?`)) {
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/samples/delete-last', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: selectedLabel,
          person: personName.trim()
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'No samples found to delete');
      }

      const data = await res.json();
      setStatusMessage({ type: 'info', text: `Deleted '${data.deleted}'. Remaining: ${data.remaining_count}` });
      fetchCounts();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const currentCount = countsData.counts_by_label[selectedLabel] || 0;
  const remainingNeeded = Math.max(0, TARGET_SAMPLES_PER_SIGN - currentCount);
  const currentLabelObj = labelsMap[selectedLabel] || {};

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <button
            onClick={onBackToTranslator}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Translator</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.25rem' }}>ISL Training Data Collector</h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Record 30-frame normalized sequences (50 Signs + Idle = 51 Classes)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="status-pill status-connected">
            <span className="status-dot" />
            <span>Total Collected: {countsData.total_samples || 0} samples</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid-main">
        {/* Left: Camera & Recording Controls */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Controls Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '0.75rem' }}>
            {/* Grouped Label Dropdown */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                <Tag size={14} /> Select Sign Label (Grouped by Category):
              </label>
              <select
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              >
                {Object.entries(groupedLabels).map(([parentCat, items]) => (
                  <optgroup key={parentCat} label={`📁 ${parentCat}`}>
                    {items.map((it) => (
                      <option key={it.slug} value={it.slug}>
                        {it.slug} ({it.english || it.slug}) {it.malayalam ? `— ${it.malayalam}` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Person Name Input */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                <User size={14} /> Person Name:
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. rahul, anjali"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Idle Guidelines Badge */}
          {selectedLabel === 'idle' ? (
            <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem', fontSize: '0.825rem', color: '#fef3c7' }}>
              <strong>💡 Guidelines for "idle" class:</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', lineHeight: '1.4' }}>
                <li>Record hands resting completely on the table or lap</li>
                <li>Record hands moving neutrally (not forming any sign)</li>
                <li>Record frames with hands entirely out of camera frame</li>
              </ul>
            </div>
          ) : currentLabelObj.alternatives && currentLabelObj.alternatives.length > 0 ? (
            <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#bae6fd' }}>
              <strong>Category:</strong> {currentLabelObj.parent_label} | <strong>Draft Malayalam:</strong> {currentLabelObj.malayalam} | <strong>Alternatives:</strong> {currentLabelObj.alternatives.join(', ')}
            </div>
          ) : null}

          {/* Camera Frame with Recording Overlay */}
          <div style={{ position: 'relative' }}>
            <WebcamView onFrame={handleFrame} isSimulateMode={false} />

            {/* Countdown Overlay */}
            {recordingState === 'COUNTDOWN' && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                zIndex: 30, borderRadius: '0.75rem'
              }}>
                <span style={{ fontSize: '4.5rem', fontWeight: 800, color: '#38bdf8' }}>{countdownNum}</span>
                <span style={{ fontSize: '1.1rem', color: '#f8fafc' }}>Get into sign position!</span>
              </div>
            )}

            {/* Recording Progress Overlay */}
            {recordingState === 'RECORDING' && (
              <div style={{
                position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem',
                background: 'rgba(239, 68, 68, 0.9)', padding: '0.75rem', borderRadius: '0.5rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 30
              }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>🔴 RECORDING 30 FRAMES...</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{capturedCount} / {SEQUENCE_LENGTH}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary"
              onClick={startRecording}
              disabled={recordingState !== 'IDLE'}
              style={{ flex: 2, padding: '0.8rem', fontSize: '1rem' }}
            >
              <Play size={18} />
              <span>Record Sequence (3s Countdown)</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleDeleteLast}
              disabled={recordingState !== 'IDLE' || currentCount === 0}
              style={{ flex: 1 }}
              title="Delete the most recent sample for this sign and person"
            >
              <Trash2 size={16} />
              <span>Delete Last</span>
            </button>
          </div>

          {/* Feedback & Quota Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <div style={{ color: remainingNeeded === 0 ? '#10b981' : '#f59e0b' }}>
              <strong>{currentCount}</strong> collected for <strong>'{selectedLabel}'</strong>
              {remainingNeeded > 0 ? ` (${remainingNeeded} more recommended)` : ' (Goal reached! 🎉)'}
            </div>
            <button onClick={fetchCounts} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
              <RefreshCw size={12} /> Refresh Counts
            </button>
          </div>

          {statusMessage && (
            <div style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              background: statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: statusMessage.type === 'error' ? '#fca5a5' : '#86efac',
              border: `1px solid ${statusMessage.type === 'error' ? '#ef4444' : '#10b981'}`
            }}>
              {statusMessage.text}
            </div>
          )}

          {/* Timing Readout */}
          {timingStats && (
            <div style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '0.5rem',
              fontSize: '0.825rem',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span>⏱️ <strong>Last Capture Timing:</strong> Mean interval: <strong>{timingStats.meanInterval} ms</strong></span>
              <span>Total duration: <strong>{timingStats.totalDuration} ms</strong> ({timingStats.frameCount} frames @ ~10 fps)</span>
            </div>
          )}
        </div>

        {/* Right: Live Count Table of Samples per Label per Person */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>51 Classes Breakdown (Per Category & Person)</h2>
          </div>

          <div style={{ flex: 1, maxHeight: '560px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '0.5rem' }}>Category</th>
                  <th style={{ padding: '0.5rem' }}>Sign Slug</th>
                  <th style={{ padding: '0.5rem' }}>Malayalam</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Clips</th>
                  <th style={{ padding: '0.5rem' }}>By Person</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(labelsMap).map(([slug, item]) => {
                  const cnt = countsData.counts_by_label[slug] || 0;
                  const personBreakdown = countsData.detailed?.[slug] || {};
                  const isCurrent = slug === selectedLabel;

                  return (
                    <tr
                      key={slug}
                      onClick={() => setSelectedLabel(slug)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        background: isCurrent ? 'rgba(56, 189, 248, 0.12)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                        {item.parent_label}
                      </td>
                      <td style={{ padding: '0.5rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#38bdf8' : '#f8fafc' }}>
                        {slug}
                      </td>
                      <td style={{ padding: '0.5rem', fontFamily: 'var(--font-ml)', color: '#94a3b8' }}>
                        {item.malayalam || '-'}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600, color: cnt >= TARGET_SAMPLES_PER_SIGN ? '#10b981' : cnt > 0 ? '#f59e0b' : '#64748b' }}>
                        {cnt}
                      </td>
                      <td style={{ padding: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        {Object.keys(personBreakdown).length > 0
                          ? Object.entries(personBreakdown).map(([p, n]) => `${p}: ${n}`).join(', ')
                          : 'none'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
