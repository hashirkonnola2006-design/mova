import React from 'react';
import { Link } from 'react-router-dom';
import MovaLogo from '../components/MovaLogo.jsx';
import './PrivacyPage.css';

export default function PrivacyPage() {
  return (
    <div className="privacy-page-root">
      <header className="privacy-header">
        <div className="privacy-header-inner">
          <Link to="/" className="privacy-brand">
            <MovaLogo height={32} showWordmark={true} />
          </Link>
          <Link to="/" className="privacy-back-link">← Back to MOVA</Link>
        </div>
      </header>

      <main className="privacy-main">
        <div className="privacy-container">
          <span className="privacy-badge">TRANSPARENCY & DATA ETHICS</span>
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-subtitle">Last updated: October 2026</p>

          <section className="privacy-section">
            <h2>1. Camera Stream and Video Frames</h2>
            <p>
              MOVA accesses your camera solely to translate sign language gestures into text and speech.
              Video frame analysis is performed locally in your browser using Google MediaPipe WebAssembly.
              Raw camera frames are processed in-memory frame by frame and are <strong>never recorded, stored on disk, or uploaded to any remote server</strong>.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Coordinate Landmarks Transmission</h2>
            <p>
              When active sign translation is running, numerical (X, Y, Z) coordinates of detected hand landmarks (126 floating-point values per frame)
              are sent over a secure local WebSocket connection to the inference model. No facial images, background room video, or identifiable visual information is contained in these coordinate streams.
            </p>
          </section>

          <section className="privacy-section">
            <h2>3. Local Storage & Preferences</h2>
            <p>
              We store non-identifying preferences locally in your browser’s <code>localStorage</code>, including your active translation language, text-to-speech volume, and accessibility adjustments (such as high-contrast and reduced motion mode).
            </p>
          </section>

          <section className="privacy-section">
            <h2>4. Third-Party Analytics and Trackers</h2>
            <p>
              MOVA contains no third-party marketing trackers, advertising networks, or user profiling scripts. The code is designed to empower communication freely and respectfully.
            </p>
          </section>

          <div className="privacy-actions">
            <Link to="/" className="privacy-btn-home">Return to Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
