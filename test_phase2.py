import json
import torch
import numpy as np
from model import ISLClassifier

def test_saved_model():
    print("Testing saved model and label list...")
    # Load labels
    with open("labels.json", "r", encoding="utf-8") as f:
        labels = json.load(f)
    assert len(labels) == 21, f"Expected 21 classes, got {len(labels)}"

    # Load checkpoint
    ckpt = torch.load("model.pth", map_location="cpu", weights_only=False)
    assert "state_dict" in ckpt
    assert ckpt["num_classes"] == 21

    model = ISLClassifier(
        input_dim=ckpt["input_dim"],
        hidden_dim=ckpt["hidden_dim"],
        num_classes=ckpt["num_classes"]
    )
    model.load_state_dict(ckpt["state_dict"])
    model.eval()

    # Forward pass on dummy 30x126 sequence
    dummy_input = torch.zeros((1, 30, 126), dtype=torch.float32)
    with torch.no_grad():
        logits = model(dummy_input)
        probs = torch.softmax(logits, dim=1).numpy()[0]

    assert logits.shape == (1, 21), f"Expected logits shape (1, 21), got {logits.shape}"
    top_idx = int(np.argmax(probs))
    confidence = float(probs[top_idx])

    print(f"Inference successful! Predicted class: '{labels[top_idx]}' with confidence {confidence:.3f}")
    print(">>> PHASE 2 VERIFICATION COMPLETE: ALL TESTS PASSED! <<<")

if __name__ == "__main__":
    test_saved_model()
