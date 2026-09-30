import os
import json
import numpy as np
import normalize

def test_normalization():
    print("Testing normalization logic...")
    # 1. Missing both hands -> 126 zeros
    v0 = normalize.normalize_both_hands(None, None)
    assert v0.shape == (126,), f"Expected shape (126,), got {v0.shape}"
    assert np.all(v0 == 0), "Expected all zeros when both hands missing"

    # 2. Scale invariance test
    # Create a dummy hand with 21 landmarks
    hand_a = [{'x': 0.1 * i, 'y': 0.2 * i, 'z': 0.05 * i} for i in range(21)]
    hand_b = [{'x': 0.2 * i, 'y': 0.4 * i, 'z': 0.1 * i} for i in range(21)]  # scaled 2x

    vec_a = normalize.normalize_single_hand(hand_a)
    vec_b = normalize.normalize_single_hand(hand_b)
    assert vec_a.shape == (63,), f"Expected shape (63,), got {vec_a.shape}"
    assert np.allclose(vec_a, vec_b, atol=1e-5), "Normalization should be scale-invariant!"

    # 3. Translation invariance test
    hand_c = [{'x': 0.1 * i + 5.0, 'y': 0.2 * i - 3.0, 'z': 0.05 * i + 1.2} for i in range(21)]
    vec_c = normalize.normalize_single_hand(hand_c)
    assert np.allclose(vec_a, vec_c, atol=1e-5), "Normalization should be translation-invariant!"

    # 4. Zero-filling of missing hand
    vec_both = normalize.normalize_both_hands(hand_a, None)
    assert vec_both.shape == (126,)
    assert not np.all(vec_both[:63] == 0), "Left hand should be populated"
    assert np.all(vec_both[63:] == 0), "Right hand should be zero-filled"

    print("Normalization tests passed successfully!")


def test_collected_data():
    print("Testing collected data directory and file integrity...")
    with open("labels_ml.json", "r", encoding="utf-8") as f:
        labels_map = json.load(f)

    assert len(labels_map) == 21, f"Expected 21 classes, got {len(labels_map)}"

    data_dir = "data"
    assert os.path.exists(data_dir), "Data directory does not exist!"

    for label in labels_map.keys():
        label_path = os.path.join(data_dir, label)
        assert os.path.exists(label_path), f"Missing data dir for {label}"
        files = [f for f in os.listdir(label_path) if f.endswith(".npy")]
        assert len(files) > 0, f"No sequences found for {label}"

        # Inspect first file
        sample = np.load(os.path.join(label_path, files[0]))
        assert sample.shape == (30, 126), f"Expected shape (30, 126) for {files[0]}, got {sample.shape}"
        assert sample.dtype == np.float32, f"Expected dtype float32, got {sample.dtype}"

    print(f"All {len(labels_map)} classes verified with valid (30, 126) sequences!")


if __name__ == "__main__":
    test_normalization()
    test_collected_data()
    print("\n>>> PHASE 1 VERIFICATION COMPLETE: ALL TESTS PASSED! <<<")
