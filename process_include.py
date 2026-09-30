import os
import sys
import glob
import json
import argparse
import math
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

TASK_MODEL_PATH = "hand_landmarker.task"
VIDEOS_DIR = "include_videos"
DATA_DIR = "data"
MANIFEST_FILE = "include_manifest.json"
CONFLICTS_FILE = "shared_videos_report.json"
MAP_FILE = "include50_map.json"
DEMO_WORDS_FILE = "demo_words.json"

# ================= 1. NORMALIZATION (EXACT PARITY WITH normalize.js) =================

def normalize_single_hand(landmarks):
    """
    Normalizes a single hand's 21 landmarks relative to wrist and middle MCP distance.
    Returns 63 floats.
    """
    if not landmarks or len(landmarks) != 21:
        return np.zeros(63, dtype=np.float32)

    # 1. Wrist relative translation: (x - x0, y - y0, z - z0)
    w = landmarks[0]
    pts_rel = [(lm.x - w.x, lm.y - w.y, lm.z - w.z) for lm in landmarks]

    # 2. Hand scale: distance from wrist (0) to middle MCP (9)
    mcp = pts_rel[9]
    dist = math.hypot(mcp[0], mcp[1], mcp[2])

    if dist < 1e-4:
        all_dists = [math.hypot(p[0], p[1], p[2]) for p in pts_rel]
        dist = max(all_dists) if all_dists else 1.0
        if dist < 1e-4:
            dist = 1.0

    # 3. Normalize coordinates and flatten
    out = []
    for p in pts_rel:
        out.extend([p[0] / dist, p[1] / dist, p[2] / dist])
    return np.array(out, dtype=np.float32)

def process_landmarker_result(detection_result):
    """
    Extracts 126 normalized features preserving Left (0..62) and Right (63..125) hand slots.
    Returns (feature_vector_126, hand_detected_bool).
    """
    if not detection_result or not detection_result.hand_landmarks:
        return np.zeros(126, dtype=np.float32), False

    left_landmarks = None
    right_landmarks = None

    for idx, handedness_list in enumerate(detection_result.handedness):
        if not handedness_list:
            continue
        label = handedness_list[0].category_name
        lms = detection_result.hand_landmarks[idx]
        if label == "Left" and left_landmarks is None:
            left_landmarks = lms
        elif label == "Right" and right_landmarks is None:
            right_landmarks = lms

    has_hand = (left_landmarks is not None) or (right_landmarks is not None)
    left_vec = normalize_single_hand(left_landmarks)
    right_vec = normalize_single_hand(right_landmarks)

    return np.concatenate([left_vec, right_vec]).astype(np.float32), has_hand

# ================= 2. OFFICIAL SPLIT LOADER =================

def load_official_splits():
    splits = {}
    if os.path.exists(MAP_FILE):
        with open(MAP_FILE, "r", encoding="utf-8") as f:
            map_data = json.load(f)
        for slug, zips in map_data.get("classes", {}).items():
            for zname, items in zips.items():
                for it in items:
                    vname = os.path.basename(it["video_path"])
                    splits[vname] = it.get("split", "train")
    return splits

# ================= 3. CONFLICTING VIDEOS EXCLUSION LIST =================

def load_conflicting_videos():
    if os.path.exists(CONFLICTS_FILE):
        with open(CONFLICTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        conflicts = set()
        for item in data.get("shared_videos", []):
            labels = set(a["label"] for a in item.get("assignments", []))
            if len(labels) > 1:
                conflicts.add(item["video_path"])
        return conflicts
    return set()

# ================= 4. VIDEO PROCESSOR (3.0s @ 10 FPS with 3 Shifts) =================

def process_video_clip(filepath, landmarker):
    """
    Decodes video at 25 fps, runs HandLandmarker, extracts active hand window,
    and returns 3 shift augmentations (-0.5s, 0.0s, +0.5s) sampled at 10 fps (30 frames).
    """
    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        return None, 0.0

    raw_features = []
    hand_detected_mask = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # MediaPipe expects RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        detection_result = landmarker.detect(mp_image)

        feat, has_hand = process_landmarker_result(detection_result)
        raw_features.append(feat)
        hand_detected_mask.append(has_hand)

    cap.release()
    total_frames = len(raw_features)
    if total_frames == 0:
        return None, 0.0

    hand_ratio = sum(hand_detected_mask) / total_frames

    # Determine gesture center in seconds
    active_indices = [i for i, h in enumerate(hand_detected_mask) if h]
    if active_indices:
        center_frame = (min(active_indices) + max(active_indices)) / 2.0
    else:
        center_frame = total_frames / 2.0

    t_center = center_frame / 25.0
    duration_sec = total_frames / 25.0

    # Generate 3 shift copies: -0.5s, 0.0s, +0.5s
    shifts = [-0.5, 0.0, 0.5]
    shift_samples = []

    for shift_sec in shifts:
        t_mid = t_center + shift_sec
        t_start = t_mid - 1.5  # 3.0s window centered at t_mid

        seq_30 = []
        for k in range(30):
            t_k = t_start + k * 0.1  # 10 fps -> 100 ms step
            if t_k < 0.0 or t_k >= duration_sec:
                seq_30.append(np.zeros(126, dtype=np.float32))
            else:
                idx = int(round(t_k * 25.0))
                idx = max(0, min(total_frames - 1, idx))
                seq_30.append(raw_features[idx])

        seq_array = np.array(seq_30, dtype=np.float32)
        shift_samples.append((shift_sec, seq_array))

    return shift_samples, hand_ratio

# ================= 5. MAIN PROCESSING PIPELINE =================

def main():
    parser = argparse.ArgumentParser(description="Process INCLUDE-50 videos to 30x126 landmark tensors.")
    parser.add_argument("--all", action="store_true", help="Process all 50 classes instead of demo_words.json")
    parser.add_argument("--slug", type=str, default=None, help="Process a specific slug only (e.g. hello)")
    args = parser.parse_args()

    print("=" * 65)
    print("INCLUDE-50 LANDMARK EXTRACTION & 10 FPS TEMPORAL AUGMENTATION")
    print("=" * 65)

    if not os.path.exists(TASK_MODEL_PATH):
        print(f"Error: Model task file {TASK_MODEL_PATH} not found!")
        sys.exit(1)

    # Load target classes
    if args.slug:
        target_slugs = [args.slug]
    elif args.all:
        with open("class_slugs.json", "r", encoding="utf-8") as f:
            target_slugs = list(json.load(f).keys())
    else:
        with open(DEMO_WORDS_FILE, "r", encoding="utf-8") as f:
            target_slugs = [s for s in json.load(f) if s != "idle"]

    print(f"Target classes ({len(target_slugs)}): {target_slugs}")

    splits_map = load_official_splits()
    conflicts_set = load_conflicting_videos()
    print(f"Loaded {len(splits_map)} official split entries. Skipping {len(conflicts_set)} conflicting videos.")

    # Initialize MediaPipe HandLandmarker in IMAGE mode
    base_options = python.BaseOptions(model_asset_path=TASK_MODEL_PATH)
    options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=2, running_mode=vision.RunningMode.IMAGE)
    landmarker = vision.HandLandmarker.create_from_options(options)

    # Load existing manifest if any
    manifest = []
    if os.path.exists(MANIFEST_FILE):
        try:
            with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            manifest = []

    manifest_lookup = {item["npy_path"]: item for item in manifest}
    already_processed_clips = set(
        (item["slug"], item["source_video"])
        for item in manifest
        if os.path.exists(item.get("npy_path", ""))
    )

    # Load mapping of (slug, fname) -> (video_path, split)
    clip_info_map = {}
    if os.path.exists(MAP_FILE):
        with open(MAP_FILE, "r", encoding="utf-8") as f:
            map_data = json.load(f)
        for slug_k, zips in map_data.get("classes", {}).items():
            for zname, items in zips.items():
                for it in items:
                    vpath = it["video_path"]
                    clip_info_map[(slug_k, os.path.basename(vpath))] = {
                        "video_path": vpath,
                        "split": it.get("split", "train")
                    }

    total_clips_processed = 0
    total_samples_saved = 0
    hands_over_50_count = 0
    example_array = None

    for slug in target_slugs:
        slug_dir = os.path.join(VIDEOS_DIR, slug)
        if not os.path.exists(slug_dir):
            continue

        # Find all .mov and .mp4 files case-insensitively
        video_files = sorted([
            os.path.join(slug_dir, f)
            for f in os.listdir(slug_dir)
            if f.lower().endswith((".mov", ".mp4"))
        ])
        if not video_files:
            continue

        out_dir = os.path.join(DATA_DIR, slug)
        os.makedirs(out_dir, exist_ok=True)

        pending_files = [f for f in video_files if (slug, os.path.basename(f)) not in already_processed_clips]
        print(f"\nProcessing slug: {slug} ({len(video_files)} total on disk, {len(pending_files)} pending)...")

        for mov_path in video_files:
            fname = os.path.basename(mov_path)
            clip_info = clip_info_map.get((slug, fname), {})
            vpath = clip_info.get("video_path", "")
            split = clip_info.get("split", splits_map.get(fname, "train"))
            
            # Check for conflict using exact video_path
            is_conflicted = (vpath in conflicts_set) if vpath else any(fname in c for c in conflicts_set)
            if is_conflicted:
                print(f"  [SKIPPED] {fname} (conflicting video: {vpath})")
                continue

            # Idempotent skip: if already processed into manifest and files exist on disk
            if (slug, fname) in already_processed_clips:
                continue

            # Process video with 3 temporal shifts
            shift_samples, hand_ratio = process_video_clip(mov_path, landmarker)
            if not shift_samples:
                continue

            total_clips_processed += 1
            if hand_ratio >= 0.5:
                hands_over_50_count += 1

            for shift_sec, seq_array in shift_samples:
                if example_array is None and hand_ratio >= 0.5:
                    example_array = seq_array

                shift_tag = f"p{int(shift_sec*10):02d}" if shift_sec >= 0 else f"m{int(abs(shift_sec)*10):02d}"
                clean_name = os.path.splitext(fname)[0]
                npy_filename = f"inc_{clean_name}_{shift_tag}.npy"
                npy_filepath = os.path.join(out_dir, npy_filename)

                np.save(npy_filepath, seq_array)
                total_samples_saved += 1

                manifest_entry = {
                    "npy_path": npy_filepath,
                    "slug": slug,
                    "source_video": fname,
                    "split": split,
                    "shift_sec": shift_sec,
                    "hand_ratio": round(hand_ratio, 3)
                }
                manifest_lookup[npy_filepath] = manifest_entry

            already_processed_clips.add((slug, fname))
            # Save manifest incrementally after each video
            with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
                json.dump(list(manifest_lookup.values()), f, indent=2)

            print(f"  Processed {fname} -> 3 samples saved (hands detected: {hand_ratio*100:.1f}% frames, split: {split})")

    landmarker.close()

    print("\n" + "=" * 65)
    print("PROCESSING SUMMARY:")
    print(f"  Total video clips processed:        {total_clips_processed}")
    print(f"  Total 30x126 augmented samples:     {total_samples_saved}")
    print(f"  Clips with hands in >50% of frames: {hands_over_50_count} / {total_clips_processed} ({hands_over_50_count/max(1, total_clips_processed)*100:.1f}%)")
    if example_array is not None:
        print(f"  Example tensor shape:               {example_array.shape}")
        print(f"  Example values range:               min={example_array.min():.4f}, max={example_array.max():.4f}")
        print(f"  Example non-zero values count:      {np.count_nonzero(example_array)} / {example_array.size}")
    print("=" * 65)

if __name__ == "__main__":
    main()
