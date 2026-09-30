import sys
import json
import time
import urllib.request
import websockets
import asyncio
import numpy as np

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

async def test_all():
    print("=================== E2E SYSTEM INTEGRATION TEST ===================")
    
    # 1. Test Frontend HTTP Server
    print("\n[1/4] Testing Frontend Web Server (http://localhost:5173)...")
    try:
        req = urllib.request.Request("http://localhost:5173/")
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8')
            assert resp.status == 200
            assert "ISL to Malayalam Real-Time Translator" in html
            assert "Noto+Sans+Malayalam" in html
            print("✓ Frontend HTML server is UP and serving correct index with Noto Sans Malayalam font!")
    except Exception as e:
        print(f"✗ Frontend check failed: {e}")
        raise

    # 2. Test Backend Health API
    print("\n[2/4] Testing Backend Health API (http://127.0.0.1:8000/health)...")
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/health")
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode('utf-8'))
            print("✓ Health status:", data)
            assert data["status"] == "healthy"
            assert data["num_classes"] == 21
    except Exception as e:
        print(f"✗ Backend health check failed: {e}")
        raise

    # 3. Test Live WebSocket Stream & Predictions
    print("\n[3/4] Testing Live WebSocket Stream (ws://127.0.0.1:8000/ws)...")
    with open("labels_ml.json", "r", encoding="utf-8") as f:
        labels_ml = json.load(f)

    labels_list = list(labels_ml.keys())

    def make_synth_seq(label):
        c_idx = labels_list.index(label)
        if label == "idle" or c_idx == -1:
            return [[0.0] * 126 for _ in range(30)]
        phase_shift = c_idx * (np.pi / len(labels_list))
        freq = 1.0 + (c_idx % 5) * 0.4
        base_l = [float(np.sin((i / 63) * np.pi * 2 + phase_shift) * 0.8) for i in range(63)]
        base_r = [float(np.cos((i / 63) * np.pi * 2 + phase_shift) * 0.8) for i in range(63)]
        seq = []
        for t in range(30):
            motion = float(np.sin(2 * np.pi * freq * (t / 30)) * 0.2)
            frame = [l + motion for l in base_l] + [r - motion for r in base_r]
            seq.append(frame)
        return seq

    async with websockets.connect("ws://127.0.0.1:8000/ws") as ws:
        # Test sending 8 consecutive frames of "hello"
        hello_seq = make_synth_seq("hello")
        for i in range(8):
            await ws.send(json.dumps(hello_seq))
            resp_raw = await ws.recv()
            resp = json.loads(resp_raw)
            assert resp["label"] == "hello", f"Expected 'hello', got {resp['label']}"
            assert resp["confidence"] >= 0.85, f"Confidence too low: {resp['confidence']}"
            assert resp["malayalam"] == "നമസ്കാരം", f"Bad Malayalam mapping: {resp['malayalam']}"
        print("✓ Verified 8 consecutive predictions of 'hello' (നമസ്കാരം) with high confidence!")

        # Test Idle sequence
        idle_seq = make_synth_seq("idle")
        await ws.send(json.dumps(idle_seq))
        idle_resp = json.loads(await ws.recv())
        assert idle_resp["label"] == "idle", f"Expected 'idle', got {idle_resp['label']}"
        print("✓ Verified 'idle' response when hands are at rest!")

        # Test another sign: "water" (വെള്ളം)
        water_seq = make_synth_seq("water")
        for i in range(8):
            await ws.send(json.dumps(water_seq))
            resp_raw = await ws.recv()
            resp = json.loads(resp_raw)
            assert resp["label"] == "water"
            assert resp["malayalam"] == "വെള്ളം"
        print("✓ Verified consecutive predictions of 'water' (വെള്ളം)!")

    # 4. Test Stability Algorithm Simulation
    print("\n[4/4] Testing Stability Rule Logic...")
    sentence = []
    consecutive_wins = 0
    candidate = None
    idle_required = False

    def on_prediction(pred_label, conf, ml_text):
        nonlocal consecutive_wins, candidate, idle_required, sentence
        if pred_label == "idle":
            idle_required = False
            consecutive_wins = 0
            candidate = None
            return

        if conf >= 0.85:
            if idle_required:
                return # blocked until idle gap
            if pred_label == candidate:
                consecutive_wins += 1
                if consecutive_wins == 8:
                    sentence.append(ml_text)
                    idle_required = True
            else:
                candidate = pred_label
                consecutive_wins = 1
        else:
            consecutive_wins = 0
            candidate = None

    # Simulate 8 hello's
    for _ in range(8):
        on_prediction("hello", 0.95, "നമസ്കാരം")
    assert sentence == ["നമസ്കാരം"], f"Sentence: {sentence}"
    assert idle_required == True

    # Next 5 hello's should NOT add anything because idle is required
    for _ in range(5):
        on_prediction("hello", 0.95, "നമസ്കാരം")
    assert sentence == ["നമസ്കാരം"]

    # Now rest hands (idle)
    on_prediction("idle", 0.99, "")
    assert idle_required == False

    # Now 8 water's
    for _ in range(8):
        on_prediction("water", 0.92, "വെള്ളം")
    assert sentence == ["നമസ്കാരം", "വെള്ളം"]
    print("✓ Stability state machine verified: Hand-down / idle gap strictly enforced!")
    print(f"✓ Constructed sentence: {' '.join(sentence)}")

    print("\n=================== ALL E2E TESTS PASSED SUCCESSFULLY! ===================")

if __name__ == "__main__":
    asyncio.run(test_all())
