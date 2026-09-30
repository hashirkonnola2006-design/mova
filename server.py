import os
import sys
import json
import logging
import argparse
from typing import List, Optional
import numpy as np
import torch
from pydantic import BaseModel
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from model import ISLClassifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ISLServer")

APP_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(APP_DIR, "model.pth")
LABELS_PATH = os.path.join(APP_DIR, "labels.json")
LABELS_ML_PATH = os.path.join(APP_DIR, "labels_ml.json")
DATA_DIR = os.path.join(APP_DIR, "data")

CONFIDENCE_THRESHOLD = 0.65

app = FastAPI(title="ISL to Malayalam Translator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Optional self-hosted frontend ─────────────────────────────────────────────
# If frontend/dist/ exists (built with `npm run build`), serve it from this
# same FastAPI process. .wasm files require application/wasm — we subclass
# StaticFiles to ensure the right Content-Type is returned.

class WasmAwareStaticFiles(StaticFiles):
    """Serve .wasm files with the application/wasm MIME type."""
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        if path.endswith(".wasm"):
            response.headers["content-type"] = "application/wasm"
        return response

FRONTEND_DIST = os.path.join(APP_DIR, "frontend", "dist")
if os.path.isdir(FRONTEND_DIST):
    logger.info(f"Serving frontend from {FRONTEND_DIST}")
    # API routes are mounted first; the SPA catch-all comes last.
    app.mount("/assets", WasmAwareStaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")
    app.mount("/mediapipe", WasmAwareStaticFiles(directory=os.path.join(FRONTEND_DIST, "mediapipe")), name="mediapipe")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        """SPA catch-all: serve index.html for any non-API GET request."""
        index = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index):
            return FileResponse(index)
        return Response(status_code=404)


# Global model state
model = None
labels: List[str] = []
labels_ml: dict = {}
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def load_labels_map():
    global labels_ml
    if not os.path.exists(LABELS_ML_PATH):
        raise FileNotFoundError(f"{LABELS_ML_PATH} not found")
    with open(LABELS_ML_PATH, "r", encoding="utf-8") as f:
        labels_ml = json.load(f)
    return labels_ml


def load_model_resources():
    global model, labels

    if not os.path.exists(MODEL_PATH):
        error_msg = (
            f"\n{'='*75}\n"
            f"CRITICAL ERROR: Model file '{MODEL_PATH}' does not exist!\n"
            f"The server cannot start without a trained model.\n"
            f"Please collect training data using the /collect page or collect.py,\n"
            f"then run 'python train.py' to generate 'model.pth'.\n"
            f"(If collecting data via browser, run: python server.py --collector)\n"
            f"{'='*75}\n"
        )
        logger.error(error_msg)
        raise RuntimeError(error_msg)

    if not os.path.exists(LABELS_PATH):
        error_msg = f"Labels file '{LABELS_PATH}' does not exist. Run train.py first."
        logger.error(error_msg)
        raise RuntimeError(error_msg)

    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        labels = json.load(f)

    logger.info(f"Loading PyTorch model from {MODEL_PATH} to {device}...")
    ckpt = torch.load(MODEL_PATH, map_location=device, weights_only=False)
    model = ISLClassifier(
        input_dim=ckpt.get("input_dim", 126),
        hidden_dim=ckpt.get("hidden_dim", 64),
        num_classes=ckpt.get("num_classes", len(labels)),
        num_layers=ckpt.get("num_layers", 2)
    ).to(device)
    model.load_state_dict(ckpt["state_dict"])
    model.eval()
    logger.info(f"Model loaded successfully with {len(labels)} classes!")


@app.on_event("startup")
async def startup_event():
    load_labels_map()
    is_collector_mode = os.environ.get("COLLECTOR_MODE", "0") == "1"
    if is_collector_mode:
        logger.info("Server started in COLLECTOR MODE: Data collection active; model inference disabled until trained.")
        if os.path.exists(MODEL_PATH):
            try:
                load_model_resources()
            except Exception as e:
                logger.warning(f"Model file present but failed to load: {e}")
    else:
        # Standard mode: MUST refuse to start if model.pth is missing
        load_model_resources()


# Pydantic schemas for data collection
class SampleUpload(BaseModel):
    label: str
    person: str
    sequence: List[List[float]]


class DeleteLastSampleRequest(BaseModel):
    label: str
    person: Optional[str] = None


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "num_classes": len(labels) if labels else 0,
        "device": str(device),
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "collector_mode": os.environ.get("COLLECTOR_MODE", "0") == "1"
    }


@app.get("/labels")
def get_labels():
    if not labels_ml:
        load_labels_map()
    return {
        "labels": labels if labels else list(labels_ml.keys()),
        "labels_ml": labels_ml
    }


# ================= DATA COLLECTION ENDPOINTS =================

@app.get("/api/samples/counts")
def get_sample_counts():
    """
    Returns breakdown of samples collected per label and per person.
    """
    if not labels_ml:
        load_labels_map()

    counts_by_label = {k: 0 for k in labels_ml.keys()}
    counts_by_person = {}
    detailed = {}

    if os.path.exists(DATA_DIR):
        for label in labels_ml.keys():
            label_dir = os.path.join(DATA_DIR, label)
            detailed[label] = {}
            if os.path.isdir(label_dir):
                files = [f for f in os.listdir(label_dir) if f.endswith(".npy")]
                counts_by_label[label] = len(files)
                for f in files:
                    person = f.split("_")[0] if "_" in f else "unknown"
                    counts_by_person[person] = counts_by_person.get(person, 0) + 1
                    detailed[label][person] = detailed[label].get(person, 0) + 1

    return {
        "counts_by_label": counts_by_label,
        "counts_by_person": counts_by_person,
        "detailed": detailed,
        "total_samples": sum(counts_by_label.values())
    }


@app.post("/api/samples")
def save_sample(payload: SampleUpload):
    """
    Saves a 30x126 sequence as data/<label>/<person>_<timestamp>.npy
    """
    if not labels_ml:
        load_labels_map()

    label = payload.label.strip()
    person = "".join(c for c in payload.person.strip() if c.isalnum() or c in ("-", "_"))
    if not person:
        person = "anonymous"

    if label not in labels_ml:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown label '{label}'. Must be one of: {list(labels_ml.keys())}"
        )

    arr = np.array(payload.sequence, dtype=np.float32)
    if arr.shape != (30, 126):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sequence shape {arr.shape}. Exactly (30, 126) is required."
        )

    # Save to data/<label>/<person>_<timestamp>.npy
    label_dir = os.path.join(DATA_DIR, label)
    os.makedirs(label_dir, exist_ok=True)

    timestamp = int(np.round(np.datetime64('now').astype('datetime64[ms]').astype(int)))
    filename = f"{person}_{timestamp}.npy"
    filepath = os.path.join(label_dir, filename)

    np.save(filepath, arr)
    logger.info(f"Saved sample: {filepath}")

    total_for_label = len([f for f in os.listdir(label_dir) if f.endswith(".npy")])
    return {
        "status": "ok",
        "filename": filename,
        "label": label,
        "person": person,
        "count_for_label": total_for_label
    }


@app.post("/api/samples/delete-last")
def delete_last_sample(req: DeleteLastSampleRequest):
    """
    Deletes the most recently saved sample for a given label (optionally filtered by person).
    """
    label = req.label.strip()
    label_dir = os.path.join(DATA_DIR, label)
    if not os.path.exists(label_dir):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No samples for label '{label}'")

    files = [f for f in os.listdir(label_dir) if f.endswith(".npy")]
    if req.person:
        clean_person = "".join(c for c in req.person.strip() if c.isalnum() or c in ("-", "_"))
        files = [f for f in files if f.startswith(f"{clean_person}_")]

    if not files:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No matching samples found to delete.")

    # Sort by timestamp (filename format: <person>_<timestamp>.npy) or modification time
    files.sort(key=lambda f: os.path.getmtime(os.path.join(label_dir, f)), reverse=True)
    target_file = files[0]
    os.remove(os.path.join(label_dir, target_file))
    logger.info(f"Deleted sample: {target_file}")

    remaining = len([f for f in os.listdir(label_dir) if f.endswith(".npy")])
    return {
        "status": "ok",
        "deleted": target_file,
        "label": label,
        "remaining_count": remaining
    }


# ================= WEBSOCKET TRANSLATION ENDPOINT =================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    if model is None:
        await websocket.close(code=1008, reason="Model not loaded. Train model.pth first.")
        return

    await websocket.accept()
    logger.info(f"WebSocket client connected: {websocket.client}")

    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)

            if isinstance(data, dict):
                raw_seq = data.get("sequence", data.get("landmarks", []))
                client_timestamp = data.get("client_timestamp", None)
            elif isinstance(data, list):
                raw_seq = data
                client_timestamp = None
            else:
                await websocket.send_json({"error": "Invalid format. Expected JSON array of shape (30, 126)."})
                continue

            arr = np.array(raw_seq, dtype=np.float32)
            if arr.shape != (30, 126):
                await websocket.send_json({"error": f"Invalid shape {arr.shape}. Expected (30, 126)."})
                continue

            tensor_seq = torch.tensor(arr, dtype=torch.float32).unsqueeze(0).to(device)
            with torch.no_grad():
                logits = model(tensor_seq)
                probs = torch.softmax(logits, dim=1).cpu().numpy()[0]

            # Helper to get Malayalam string from dictionary structure
            def get_ml_text(lbl):
                v = labels_ml.get(lbl, "")
                if isinstance(v, dict):
                    return v.get("malayalam", "")
                return str(v) if v else ""

            # Top-3 predictions
            top_indices = np.argsort(probs)[::-1][:3]
            top3 = [
                {
                    "label": labels[idx],
                    "confidence": round(float(probs[idx]), 4),
                    "malayalam": get_ml_text(labels[idx])
                }
                for idx in top_indices
            ]

            top_idx = int(top_indices[0])
            confidence = float(probs[top_idx])
            pred_label = labels[top_idx]

            final_label = "idle" if confidence < CONFIDENCE_THRESHOLD else pred_label
            malayalam_text = get_ml_text(final_label)

            response = {
                "label": final_label,
                "confidence": round(confidence, 4),
                "malayalam": malayalam_text,
                "top3": top3,
                "client_timestamp": client_timestamp
            }
            await websocket.send_json(response)

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: {websocket.client}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        try:
            await websocket.close()
        except Exception:
            pass


def main():
    parser = argparse.ArgumentParser(description="Start ISL to Malayalam backend server.")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host interface")
    parser.add_argument("--port", type=int, default=8000, help="Port")
    parser.add_argument("--collector", action="store_true", help="Start in data-collector mode without requiring model.pth")
    args = parser.parse_args()

    if args.collector:
        os.environ["COLLECTOR_MODE"] = "1"
    else:
        # Step 1 Requirement: refuse to start with a clear error if model.pth does not exist
        if not os.path.exists(MODEL_PATH):
            sys.stderr.write(
                f"\n{'='*75}\n"
                f"CRITICAL ERROR: Model file '{MODEL_PATH}' does not exist!\n"
                f"The server cannot start without a trained model.\n"
                f"Please collect training data using the /collect page or collect.py,\n"
                f"then run 'python train.py' to generate 'model.pth'.\n"
                f"(To run the server specifically in collector mode, run with --collector)\n"
                f"{'='*75}\n\n"
            )
            sys.exit(1)

    import uvicorn
    uvicorn.run("server:app", host=args.host, port=args.port, reload=False)


if __name__ == "__main__":
    main()
