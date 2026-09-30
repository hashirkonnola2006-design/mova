import os
import sys
import time
import json
import argparse
import urllib.request
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from normalize import process_hand_landmarker_result, normalize_both_hands

MODEL_TASK_PATH = "hand_landmarker.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
LABELS_FILE = "labels_ml.json"
DATA_DIR = "data"
SEQUENCE_LENGTH = 30
FEATURE_DIM = 126

# Hand connections (21 landmarks)
HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),        # Thumb
    (0, 5), (5, 6), (6, 7), (7, 8),        # Index
    (5, 9), (9, 10), (10, 11), (11, 12),   # Middle
    (9, 13), (13, 14), (14, 15), (15, 16), # Ring
    (13, 17), (17, 18), (18, 19), (19, 20),# Pinky
    (0, 17)                                # Palm base
]


def ensure_model_file():
    if not os.path.exists(MODEL_TASK_PATH):
        print(f"Downloading {MODEL_TASK_PATH}...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_TASK_PATH)
        print("Download complete.")


def load_labels():
    if not os.path.exists(LABELS_FILE):
        raise FileNotFoundError(f"{LABELS_FILE} not found.")
    with open(LABELS_FILE, "r", encoding="utf-8") as f:
        labels_map = json.load(f)
    return list(labels_map.keys()), labels_map


def count_existing_samples(label):
    label_dir = os.path.join(DATA_DIR, label)
    if not os.path.exists(label_dir):
        return 0
    return len([f for f in os.listdir(label_dir) if f.endswith(".npy")])


def draw_landmarks_on_image(image_bgr, detection_result):
    if not detection_result or not detection_result.hand_landmarks:
        return image_bgr

    h, w, _ = image_bgr.shape

    for hand_lms, handedness in zip(detection_result.hand_landmarks, detection_result.handedness):
        is_left = (handedness[0].category_name == "Left")
        color = (0, 255, 128) if is_left else (255, 128, 0)

        # Draw connections
        for p1_idx, p2_idx in HAND_CONNECTIONS:
            p1 = hand_lms[p1_idx]
            p2 = hand_lms[p2_idx]
            pt1 = (int(p1.x * w), int(p1.y * h))
            pt2 = (int(p2.x * w), int(p2.y * h))
            cv2.line(image_bgr, pt1, pt2, color, 2)

        # Draw points
        for lm in hand_lms:
            cx, cy = int(lm.x * w), int(lm.y * h)
            cv2.circle(image_bgr, (cx, cy), 4, (0, 0, 255), -1)

    return image_bgr



def run_collection(initial_label=None, person="user", camera_id=0):
    ensure_model_file()
    labels, labels_map = load_labels()

    current_idx = 0
    if initial_label and initial_label in labels:
        current_idx = labels.index(initial_label)

    os.makedirs(DATA_DIR, exist_ok=True)

    # Initialize HandLandmarker
    base_options = python.BaseOptions(model_asset_path=MODEL_TASK_PATH)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )
    detector = vision.HandLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        print(f"Error: Could not open camera {camera_id}.")
        print("Tip: You can generate synthetic data for testing using: python collect.py --simulate")
        detector.close()
        return

    print("\n================ ISL DATA COLLECTION ================")
    print("Controls:")
    print("  [SPACE] or [R] : Start recording 30-frame sequence")
    print("  [N]            : Next sign label")
    print("  [P]            : Previous sign label")
    print("  [Q] or [ESC]   : Exit")
    print("=====================================================\n")

    state = "IDLE"  # "IDLE", "COUNTDOWN", "RECORDING"
    countdown_start = 0.0
    recorded_frames = []

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame from camera.")
                break

            # Mirror view for intuitive user experience
            frame = cv2.flip(frame, 1)
            h, w, _ = frame.shape

            # MediaPipe tasks expects RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

            detection_result = detector.detect(mp_image)
            frame = draw_landmarks_on_image(frame, detection_result)

            current_label = labels[current_idx]
            sample_count = count_existing_samples(current_label)

            # Header Banner
            cv2.rectangle(frame, (0, 0), (w, 60), (30, 30, 30), -1)
            cv2.putText(frame, f"Sign: {current_label} ({current_idx + 1}/{len(labels)})", (20, 38),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            cv2.putText(frame, f"Saved: {sample_count}", (w - 180, 38),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)

            now = time.time()

            if state == "IDLE":
                cv2.putText(frame, "Press SPACE to Record | N: Next | P: Prev | Q: Quit",
                            (20, h - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            elif state == "COUNTDOWN":
                elapsed = now - countdown_start
                remaining = int(3.5 - elapsed)
                if remaining > 0:
                    cv2.putText(frame, f"Get Ready: {remaining}", (w // 2 - 140, h // 2),
                                cv2.FONT_HERSHEY_DUPLEX, 1.8, (0, 165, 255), 3)
                else:
                    state = "RECORDING"
                    recorded_frames = []

            elif state == "RECORDING":
                # Extract normalized 126-dim vector for this frame
                frame_vector = process_hand_landmarker_result(detection_result)
                recorded_frames.append(frame_vector)

                # Progress bar
                curr_cnt = len(recorded_frames)
                prog_w = int((curr_cnt / SEQUENCE_LENGTH) * (w - 40))
                cv2.rectangle(frame, (20, h - 50), (20 + prog_w, h - 20), (0, 0, 255), -1)
                cv2.putText(frame, f"RECORDING: {curr_cnt}/{SEQUENCE_LENGTH}", (w // 2 - 120, h // 2),
                            cv2.FONT_HERSHEY_DUPLEX, 1.2, (0, 0, 255), 2)

                if curr_cnt >= SEQUENCE_LENGTH:
                    # Save sequence as .npy
                    seq_arr = np.array(recorded_frames, dtype=np.float32)  # shape (30, 126)
                    label_dir = os.path.join(DATA_DIR, current_label)
                    os.makedirs(label_dir, exist_ok=True)
                    fname = f"{person}_{int(time.time() * 1000)}.npy"
                    np.save(os.path.join(label_dir, fname), seq_arr)
                    print(f"[{current_label}] Saved sequence #{sample_count + 1}: {fname}")
                    state = "IDLE"

            cv2.imshow("ISL to Malayalam - Data Collector", frame)
            key = cv2.waitKey(1) & 0xFF

            if key in [ord('q'), 27]:  # Q or ESC
                break
            elif key in [ord(' '), ord('r')]:
                if state == "IDLE":
                    state = "COUNTDOWN"
                    countdown_start = time.time()
            elif key in [ord('n'), ord('N')]:
                current_idx = (current_idx + 1) % len(labels)
            elif key in [ord('p'), ord('P')]:
                current_idx = (current_idx - 1) % len(labels)

    finally:
        cap.release()
        cv2.destroyAllWindows()
        detector.close()


def main():
    parser = argparse.ArgumentParser(description="Collect 30-frame ISL sequences for training.")
    parser.add_argument("--label", type=str, default=None, help="Initial sign label to collect")
    parser.add_argument("--person", type=str, default="user", help="Name or ID of person performing the signs")
    parser.add_argument("--camera", type=int, default=0, help="Webcam index (default 0)")
    args = parser.parse_args()

    run_collection(initial_label=args.label, person=args.person, camera_id=args.camera)


if __name__ == "__main__":
    main()
