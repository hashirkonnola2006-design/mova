import sys
import json
import subprocess
import numpy as np
import normalize

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def run_js_normalize(left_landmarks, right_landmarks):
    """
    Executes frontend/src/utils/normalize.js using Node.js and returns the normalized 126 floats.
    """
    input_data = {
        "left": left_landmarks,
        "right": right_landmarks
    }

    js_code = """
import { normalizeBothHands } from './frontend/src/utils/normalize.js';
import fs from 'fs';

const input = JSON.parse(process.argv[1]);
const result = normalizeBothHands(input.left, input.right);
process.stdout.write(JSON.stringify(result));
"""

    res = subprocess.run(
        ["node", "--input-type=module", "-e", js_code, json.dumps(input_data)],
        capture_output=True,
        text=True,
        check=True
    )
    return np.array(json.loads(res.stdout), dtype=np.float32)


def generate_hand(seed=0, scale=1.0, offset=(0.0, 0.0, 0.0)):
    rng = np.random.RandomState(seed)
    lms = []
    for i in range(21):
        x = float(rng.uniform(0.1, 0.9) * scale + offset[0])
        y = float(rng.uniform(0.1, 0.9) * scale + offset[1])
        z = float(rng.uniform(-0.2, 0.2) * scale + offset[2])
        lms.append({"x": x, "y": y, "z": z})
    return lms


def test_parity():
    print("=================== NORMALIZATION PARITY TEST ===================")
    print("Testing parity between Python normalize.py and JavaScript normalize.js...")

    test_cases = [
        ("Test 1: Both Hands Present", generate_hand(1), generate_hand(2)),
        ("Test 2: Left Hand Only (Right Zero-filled)", generate_hand(3), None),
        ("Test 3: Right Hand Only (Left Zero-filled)", None, generate_hand(4)),
        ("Test 4: Both Hands Missing (All Zeros)", None, None),
        ("Test 5: Scaled & Shifted Hand", generate_hand(5, scale=2.5, offset=(10.0, -5.0, 3.2)), generate_hand(6, scale=0.5, offset=(-2.0, 4.0, 1.0))),
        ("Test 6: Degenerate Collocated Wrist & MCP", [{"x": 0.5, "y": 0.5, "z": 0.0} for _ in range(21)], None),
    ]

    tolerance = 1e-5
    all_passed = True

    for name, left_lms, right_lms in test_cases:
        py_vec = normalize.normalize_both_hands(left_lms, right_lms)
        js_vec = run_js_normalize(left_lms, right_lms)

        assert py_vec.shape == (126,), f"Python shape mismatch: {py_vec.shape}"
        assert js_vec.shape == (126,), f"JavaScript shape mismatch: {js_vec.shape}"

        max_diff = float(np.max(np.abs(py_vec - js_vec)))
        mean_diff = float(np.mean(np.abs(py_vec - js_vec)))

        print(f"\n{name}")
        print(f"  Max Absolute Difference:  {max_diff:.2e}")
        print(f"  Mean Absolute Difference: {mean_diff:.2e}")

        if max_diff < tolerance:
            print(f"  ✓ PASSED (within {tolerance})")
        else:
            print(f"  ✗ FAILED: Difference {max_diff} exceeds tolerance {tolerance}!")
            all_passed = False

    assert all_passed, "One or more parity test cases failed!"
    print("\n>>> STEP 3 PARITY TEST COMPLETE: ALL OUTPUTS MATCH WITHIN 1e-5! <<<")


if __name__ == "__main__":
    test_parity()
