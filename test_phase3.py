import sys
import json
import numpy as np
from starlette.testclient import TestClient

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from server import app, load_resources, CONFIDENCE_THRESHOLD

def test_websocket_server():
    print("Testing FastAPI WebSocket Server...")
    load_resources()

    with TestClient(app) as client:
        # Check HTTP health
        res = client.get("/health")
        assert res.status_code == 200
        health_data = res.json()
        print(f"Health response: {health_data}")
        assert health_data["status"] == "healthy"
        assert health_data["num_classes"] == 21

        # Check WebSocket endpoint
        with client.websocket_connect("/ws") as ws:
            # 1. Send valid 30x126 sequence (zeros)
            dummy_seq = np.zeros((30, 126), dtype=float).tolist()
            ws.send_json(dummy_seq)
            data = ws.receive_json()
            print("Received response for dummy input:", data)

            assert "label" in data, "Missing 'label' in response"
            assert "confidence" in data, "Missing 'confidence' in response"
            assert "malayalam" in data, "Missing 'malayalam' in response"
            assert isinstance(data["confidence"], float)

            # 2. Test invalid shape
            invalid_seq = np.zeros((10, 50), dtype=float).tolist()
            ws.send_json(invalid_seq)
            err_data = ws.receive_json()
            assert "error" in err_data, "Expected error on invalid shape"
            print("Received expected error on invalid shape:", err_data)

            # 3. Test real sample from data directory if available
            sample_file = "data/hello"
            import os
            if os.path.exists(sample_file):
                files = [f for f in os.listdir(sample_file) if f.endswith(".npy")]
                if files:
                    real_sample = np.load(os.path.join(sample_file, files[0])).tolist()
                    ws.send_json(real_sample)
                    real_res = ws.receive_json()
                    print(f"Prediction for 'hello' sample: {real_res}")
                    assert "label" in real_res
                    assert "malayalam" in real_res
                    # Check UTF-8 characters are intact
                    if real_res["label"] == "hello":
                        assert real_res["malayalam"] == "നമസ്കാരം"

    print(">>> PHASE 3 VERIFICATION COMPLETE: ALL TESTS PASSED! <<<")


if __name__ == "__main__":
    test_websocket_server()
