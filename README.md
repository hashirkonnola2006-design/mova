<div align="center">

# 🤟 MOVA
### Real-Time Indian Sign Language (ISL) Translator & Accessibility Suite
**Sign language isn't a barrier. It's a bridge.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Self--Hosted%20WASM-007ACC?style=flat-square)](https://developers.google.com/mediapipe)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

<br />

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Supported Vocabulary](#-supported-vocabulary) • [Project Structure](#-project-structure) • [Privacy](#-privacy--security)

</div>

---

## 📖 Overview

**MOVA** is a modern, real-time sign language translation and accessibility platform built to empower the deaf and hard-of-hearing community. By combining client-side computer vision with a bidirectional recurrent neural network, MOVA translates Indian Sign Language (ISL) gestures into **Malayalam (മലയാളം)** and **English** text and speech with ultra-low latency.

Unlike traditional computer vision apps that transmit heavy video streams to cloud servers, MOVA extracts hand landmarks **entirely in the browser** using self-hosted MediaPipe WASM. Only privacy-safe numerical landmark tensors (126 coordinates per frame) are sent via high-speed WebSockets for neural inference.

---

## ✨ Features

### 🤟 1. Live Sign to Text (`/app/sign-to-text`)
- **Real-Time Landmark Tracking**: Tracks 21 3D hand landmarks across both hands directly in your browser at 30 FPS.
- **Sliding-Window Inference**: Streams normalized 30-frame temporal sequences over WebSockets to a lightweight PyTorch GRU model (~25ms inference latency).
- **Consecutive Win Latch System**: Eliminates jitter with an 8-consecutive-window confirmation threshold and idle hand release.
- **Instant Audio Synthesis**: Text-to-speech feedback reading out confirmed translations in Malayalam or English.

### 🎙️ 2. Text to Speech Studio (`/app/text-to-speech`)
- Instant two-way bridge: type phrases or choose common communication presets to speak aloud using the Web Speech Synthesis API.
- Configurable speed, pitch, and voice presets tailored for clear, accessible communication.

### 🚨 3. Emergency SOS Cards (`/app/emergency`)
- One-tap access to critical medical, safety, and urgent phrase cards.
- High-contrast visual and audio alarms for emergencies with instant full-screen broadcast mode.

### 🏠 4. Personalized Home Workspace (`/dashboard`)
- Contextual time-sensitive greetings with current date and live AI engine status.
- Primary quick-start translator launcher with live gesture preview telemetry.
- **Sign of the Day**: Daily featured ISL gesture with step-by-step movement instructions.
- Activity streak tracking and best-practice tips for maximum camera accuracy.

### 🔐 5. Privacy-First & Offline-Ready
- **Zero CDN Dependencies**: Self-hosted MediaPipe WASM and `hand_landmarker.task` models stored directly in the frontend build.
- **Privacy Guaranteed**: Raw webcam video never leaves your browser.

---

## 🏗️ Architecture

```
                                  BROWSER (Client-Side)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   Webcam Stream ──▶  Self-Hosted MediaPipe WASM  ──▶  Hand Landmarks (21 x 3)   │
│                             (Offline)                         │                 │
│                                                               ▼                 │
│   Spoken Audio  ◀──  Web Speech Synthesis API   ◀──  Sliding Window (30 frames) │
│                                                               │                 │
└──────────────────────────────────────┬────────────────────────┼─────────────────┘
                                       │                        │
                                       │ WebSocket              │ [30, 126] Tensor
                                       │ Responses              │
                                       ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI SERVER (Backend)                              │
│                                                                                 │
│   Prediction Result ◀──  Latching Logic  ◀──  PyTorch GRU Neural Network        │
│   (Label, Conf, Top3)   (& Idle Release)         (model.pth weights)            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** (with `pip` and virtual environment support)
- **Node.js 18+** and `npm`
- A webcam connected to your computer

---

### 1. Backend Setup

```bash
# Navigate to the repository root
cd mova

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate       # Windows PowerShell / CMD
# source .venv/bin/activate  # macOS / Linux

# Install backend dependencies
pip install -r requirements.txt

# Start the FastAPI inference server
python server.py
```
> The backend server will start on **`http://localhost:8000`** with WebSocket endpoint at **`ws://localhost:8000/ws`**.

---

### 2. Frontend Setup

```bash
# In a new terminal window, navigate to the frontend folder
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
> Open your browser and navigate to **`http://localhost:5173`**.

---

## 🔑 Environment Configuration

Create a `.env` file in the `frontend/` directory (or copy from `.env.example`):

```ini
VITE_API_URL=http://localhost:8000
```

> **Production note:** When deployed over HTTPS, the application automatically upgrades WebSocket connections to `wss://`.

---

## 📚 Supported Vocabulary

| # | English Gesture | Malayalam (മലയാളം) | Category |
|---|---|---|---|
| 1 | **Hello** | ഹലോ | Greetings |
| 2 | **Good Morning** | സുപ്രഭാതം | Greetings |
| 3 | **Thank You** | നന്ദി | Social Courtesies |
| 4 | **Good** | നല്ലത് | Expressive |
| 5 | **I** | ഞാൻ | Pronouns |
| 6 | **Father** | അച്ഛൻ | Family |
| 7 | **Boy** | ആൺകുട്ടി | People |
| 8 | **Girl** | പെൺകുട്ടി | People |
| 9 | **Bank** | ബാങ്ക് | Places & Services |
| 10 | **Time** | സമയം | Daily Life |
| 11 | *Idle* | *(Resting state)* | Transition Release |

---

## 📁 Project Structure

```
mova/
├── server.py                   # FastAPI WebSocket inference server
├── model.py                    # PyTorch GRU classifier architecture
├── train.py                    # Model training script with session splits
├── model.pth                   # Pre-trained GRU weights
├── labels.json                 # Label-to-index mapping
├── labels_ml.json              # English-to-Malayalam translation dictionary
├── demo_words_10.json          # 10-word benchmark configuration
├── requirements.txt            # Python server dependencies
├── requirements-train.txt      # Data processing & training dependencies
│
└── frontend/                   # React + Vite application
    ├── public/
    │   ├── mediapipe/          # Self-hosted MediaPipe WASM and models
    │   │   ├── wasm/           # vision_wasm_internal binaries
    │   │   └── hand_landmarker.task
    │   ├── mova-icon.png       # MOVA brand identity
    │   └── mova-hero-hands.jpg # Hero illustration
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx # User session & auth state provider
    │   ├── pages/
    │   │   ├── LandingPage.jsx     # Modern public landing page
    │   │   ├── AuthPage.jsx        # Login & Sign Up split panel
    │   │   ├── AppShell.jsx        # Responsive navigation sidebar & header
    │   │   ├── DashboardPage.jsx   # Personalized home workspace
    │   │   ├── SignToTextPage.jsx  # Live camera sign translator
    │   │   ├── TextToSpeechPage.jsx# Voice synthesis studio
    │   │   ├── EmergencyPage.jsx   # Emergency assistance cards
    │   │   └── PlaceholderPages.jsx# Conversation, Learn Signs, Settings
    │   ├── components/
    │   │   ├── WebcamView.jsx  # MediaPipe landmark capture & skeleton canvas
    │   │   └── CollectorPage.jsx   # Dataset recording & annotation studio
    │   └── utils/
    │       ├── auth.js         # Authentication helpers (localStorage)
    │       └── normalize.js    # Landmark coordinate normalization
    ├── package.json
    └── vite.config.js
```

---

## 🔒 Privacy & Security

- **Edge Landmark Extraction**: Video frames from your webcam are processed locally within your browser using WebAssembly.
- **Zero Raw Video Storage**: No webcam frames, video recordings, or facial images are ever transmitted to or stored on our servers.
- **Minimal Data Footprint**: Only lightweight 3D skeletal landmark coordinates `[x, y, z]` are transmitted during live translation sessions.

---

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m "feat: add amazing feature"`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ to make communication accessible for everyone.</sub>
</div>
