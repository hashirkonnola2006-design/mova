# MOVA — Real-Time Sign Language Translator

**MOVA** translates Indian Sign Language (ISL) into Malayalam text in real time, directly in your browser. It uses MediaPipe for hand-landmark detection and a lightweight GRU neural network for sign classification.

> ⚠️ **Early demo.** Trained on a limited vocabulary (10 signs). Video never leaves your browser — only hand-landmark coordinates are sent to the server.

---

## Features

- 🤟 **Real-time ISL recognition** via your webcam
- 🌐 **Runs in any modern browser** — no app install required
- 🔒 **Privacy-first** — video frames stay on your device; only numerical landmark data is transmitted
- 📝 **Malayalam output** built sentence by sentence
- 🧪 **Simulate mode** — test without a camera

---

## Quick Start (local dev)

### 1 · Backend

```bash
# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # Mac/Linux

# Install server dependencies (CPU PyTorch)
pip install -r requirements.txt

# Run the FastAPI server
python server.py
# → listening on http://localhost:8000
```

### 2 · Frontend

```bash
cd frontend
npm install
npm run dev
# → Vite dev server on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

Create a `.env` file in the **frontend/** folder (copy from `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL. Set to your production URL for deployment. The app automatically uses `wss://` when served over HTTPS. |

---

## Re-training (optional)

Training data is **not included** in this repository.

```bash
# Install training extras (OpenCV, MediaPipe, etc.)
pip install -r requirements-train.txt

# Process INCLUDE-50 videos into .npy tensors
python process_include.py

# Train the classifier (10 signs + idle)
python train.py --classes demo_words_10.json
```

The trained model is saved as `model.pth` and `labels.json`.

---

## Project Structure

```
.
├── server.py               # FastAPI WebSocket inference server
├── model.py                # GRU classifier definition
├── train.py                # Training script
├── process_include.py      # Video → .npy pipeline for INCLUDE-50
├── model.pth               # Trained weights (committed, 249 KB)
├── labels.json             # Class order matching the trained model
├── labels_ml.json          # English→Malayalam translation map
├── demo_words_10.json      # 10-class word list used for training
├── requirements.txt        # Server runtime dependencies
├── requirements-train.txt  # Data-processing extras (not for prod)
└── frontend/               # React + Vite frontend
    ├── src/
    │   ├── pages/
    │   │   ├── LandingPage.jsx   # "/" route
    │   │   └── TranslatorApp.jsx # "/app" route
    │   ├── components/           # WebcamView, SentencePanel, …
    │   └── utils/                # normalize.js, simulate.js
    └── public/
        └── hero-hands.jpg        # Hero illustration
```

---

## Vocabulary (v0.1)

| English | Malayalam |
|---|---|
| hello | ഹലോ |
| good morning | സുപ്രഭാതം |
| thank you | നന്ദി |
| good | നല്ലത് |
| I | ഞാൻ |
| father | അച്ഛൻ |
| boy | ആൺകുട്ടി |
| girl | പെൺകുട്ടി |
| bank | ബാങ്ക് |
| time | സമയം |

---

## Licence

MIT — see [LICENSE](LICENSE) (to be added).
