import React from 'react';
import { 
  Lock, 
  EyeOff, 
  Server, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Database, 
  WifiOff 
} from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';
import './PrivacyPage.css';

export default function PrivacyPage() {
  React.useEffect(() => {
    document.title = 'Privacy Architecture & Data Transparency – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'Understand how MOVA ensures video privacy through local on-device machine vision with zero cloud uploads.';
    }
  }, []);

  return (
    <PageLayout fullWidth={true}>
      <div className="pv-fullwidth-root">
        {/* ── Hero Band with 3D Graphic ───────────────────────── */}
        <section className="pv-hero-band">
          <div className="pv-container">
            <div className="pv-hero-grid">
              <div className="pv-hero-copy">
                <span className="pv-pill">DATA &amp; PRIVACY GUARANTEE</span>
                <h1 className="pv-title">Private by Design. Zero Video Uploads.</h1>
                <p className="pv-subtitle">
                  We believe privacy is an intrinsic human right. Video feeds never touch a cloud server.
                  Computer vision landmarks are derived locally in browser WebAssembly memory and processed strictly on your machine.
                </p>
                
                <div className="pv-stat-row">
                  <div className="pv-stat-pill">
                    <CheckCircle2 size={18} className="pv-check-icon" />
                    <span>0 bytes of video streamed to cloud</span>
                  </div>
                  <div className="pv-stat-pill">
                    <CheckCircle2 size={18} className="pv-check-icon" />
                    <span>Local MediaPipe WASM extraction</span>
                  </div>
                </div>
              </div>

              {/* 3D Privacy Shield Render */}
              <div className="pv-hero-graphic-wrap">
                <div className="pv-3d-card">
                  <img
                    src="/images/3d/privacy-shield.webp"
                    alt="3D Frosted Glass Security Shield and Data Privacy Illustration"
                    className="pv-3d-img"
                    width="640"
                    height="360"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Architecture Cards Band ─────────────────────────── */}
        <section className="pv-arch-band">
          <div className="pv-container">
            <div className="pv-section-header">
              <span className="pv-pill">HOW IT WORKS</span>
              <h2 className="pv-section-title">Technical Privacy Architecture</h2>
              <p className="pv-section-sub">
                Every frame captured by your webcam stays under your direct hardware control.
              </p>
            </div>

            <div className="pv-grid">
              <div className="pv-card">
                <div className="pv-card-icon pv-card-icon--blue">
                  <Lock size={24} />
                </div>
                <h3>In-Memory Frame Processing</h3>
                <p>
                  Video frames from <code>navigator.mediaDevices.getUserMedia</code> are consumed directly in local memory.
                  Frames are never written to disk, cookies, or localStorage. When the camera is closed, memory allocations are flushed immediately.
                </p>
              </div>

              <div className="pv-card">
                <div className="pv-card-icon pv-card-icon--sky">
                  <Cpu size={24} />
                </div>
                <h3>126 Coordinate Landmarks Only</h3>
                <p>
                  MediaPipe extracts 21 skeletal joints per hand (x, y, z normalized floats).
                  Only numeric coordinates are passed for translation. No recognizable facial features, room backgrounds, or image pixels are preserved.
                </p>
              </div>

              <div className="pv-card">
                <div className="pv-card-icon pv-card-icon--navy">
                  <WifiOff size={24} />
                </div>
                <h3>Local WebSocket AI Server</h3>
                <p>
                  During active translation, coordinate arrays are sent via <code>ws://localhost:8000/ws</code> to a local PyTorch process running on your device.
                  No external analytics or tracking pixels observe your gestures.
                </p>
              </div>

              <div className="pv-card">
                <div className="pv-card-icon pv-card-icon--green">
                  <Database size={24} />
                </div>
                <h3>No Account Required for Core Use</h3>
                <p>
                  MOVA does not require an account or login to translate sign language.
                  Your translations are entirely ephemeral and disappear as soon as you close your browser tab.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Summary Statement Band ──────────────────────────── */}
        <section className="pv-summary-band">
          <div className="pv-container pv-container--narrow">
            <div className="pv-summary-card">
              <ShieldCheck size={36} className="pv-summary-shield" />
              <h3>Academic Research Transparency</h3>
              <p>
                MOVA was built at College of Engineering Thalassery as an academic research project.
                Our complete source code is public on GitHub, allowing independent verification of every privacy and data handling claim.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
