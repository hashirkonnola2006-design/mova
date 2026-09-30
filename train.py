import os
import re
import json
import argparse
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split, GroupShuffleSplit
from sklearn.metrics import classification_report, confusion_matrix

from model import ISLClassifier

DATA_DIR = "data"
LABELS_FILE = "labels_ml.json"
MODEL_SAVE_PATH = "model.pth"
LABEL_LIST_SAVE_PATH = "labels.json"


# ================= DATA AUGMENTATION (TRAINING SET ONLY) =================

def augment_sequence(seq_30x126):
    """
    Applies real-time landmark augmentations to a single 30x126 sequence:
    1. Small rotation (+/- 10 degrees) in the x-y plane
    2. Scale jitter (+/- 10%)
    3. Gaussian noise (sigma = 0.015)
    4. Slight time stretching (resampling +/- 15% and interpolating to 30 frames)
    Leaves missing (zero-filled) hands intact.
    """
    seq = seq_30x126.copy()  # shape (30, 126)

    # 1. Time stretching / resampling
    stretch_factor = np.random.uniform(0.85, 1.15)
    orig_steps = np.arange(30)
    stretched_steps = np.linspace(0, 29, int(30 * stretch_factor))
    # Interpolate each feature back to 30 frames
    resampled_seq = np.zeros((30, 126), dtype=np.float32)
    for feat_idx in range(126):
        resampled_seq[:, feat_idx] = np.interp(
            np.linspace(0, len(stretched_steps) - 1, 30),
            np.arange(len(stretched_steps)),
            np.interp(stretched_steps, orig_steps, seq[:, feat_idx])
        )
    seq = resampled_seq

    # Process Left Hand (0..62) and Right Hand (63..125)
    for start_col in [0, 63]:
        hand_data = seq[:, start_col:start_col + 63]  # shape (30, 63)
        # Only augment if hand is not zero-filled
        if np.max(np.abs(hand_data)) < 1e-4:
            continue

        # Reshape to (30, 21, 3)
        pts = hand_data.reshape(30, 21, 3)

        # 2. Small random rotation around z-axis (camera plane)
        angle = np.random.uniform(-np.radians(10), np.radians(10))
        cos_a, sin_a = np.cos(angle), np.sin(angle)
        rot_matrix = np.array([
            [cos_a, -sin_a, 0],
            [sin_a,  cos_a, 0],
            [0,      0,     1]
        ], dtype=np.float32)
        pts = np.einsum('tli,ij->tlj', pts, rot_matrix)

        # 3. Scale jitter (0.90 to 1.10)
        scale = np.random.uniform(0.90, 1.10)
        pts = pts * scale

        # 4. Gaussian landmark noise
        noise = np.random.normal(0, 0.015, pts.shape).astype(np.float32)
        pts = pts + noise

        seq[:, start_col:start_col + 63] = pts.reshape(30, 63)

    return seq.astype(np.float32)


class AugmentedDataset(Dataset):
    def __init__(self, X, y, augment=False, augment_factor=2):
        self.samples = []
        self.targets = []

        for seq, label_idx in zip(X, y):
            self.samples.append(seq)
            self.targets.append(label_idx)

            if augment:
                # Add augmented variations
                for _ in range(augment_factor):
                    self.samples.append(augment_sequence(seq))
                    self.targets.append(label_idx)

        self.samples = torch.tensor(np.array(self.samples), dtype=torch.float32)
        self.targets = torch.tensor(np.array(self.targets), dtype=torch.long)

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        return self.samples[idx], self.targets[idx]


def load_dataset(classes_file=None, min_hand_ratio=0.30, live_in_train=False):
    if classes_file and os.path.exists(classes_file):
        with open(classes_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        label_list = data if isinstance(data, list) else list(data.keys())
        print(f"Using class subset from {classes_file} ({len(label_list)} classes).")
    else:
        with open(LABELS_FILE, "r", encoding="utf-8") as f:
            labels_map = json.load(f)
        label_list = list(labels_map.keys())

    label_to_idx = {name: idx for idx, name in enumerate(label_list)}

    # Load include_manifest.json for official splits and hand_ratio
    manifest_map = {}
    if os.path.exists("include_manifest.json"):
        try:
            with open("include_manifest.json", "r", encoding="utf-8") as f:
                manifest_data = json.load(f)
                for entry in manifest_data:
                    manifest_map[os.path.normpath(entry["npy_path"])] = entry
                    manifest_map[os.path.basename(entry["npy_path"])] = entry
        except Exception as e:
            print(f"Warning loading include_manifest.json: {e}")

    splits = {
        "train": {"X": [], "y": [], "persons": []},
        "val": {"X": [], "y": [], "persons": []},
        "test": {"X": [], "y": [], "persons": []},
        "live_test": {"X": [], "y": [], "persons": []}
    }
    excluded_low_detection = []

    for label_name in label_list:
        label_dir = os.path.join(DATA_DIR, label_name)
        if not os.path.exists(label_dir):
            continue

        files = sorted([f for f in os.listdir(label_dir) if f.endswith(".npy")])

        # Handle 'idle' class: random 70/15/15 split across collector-recorded samples
        if label_name == "idle":
            rng = np.random.RandomState(42)
            idle_files = list(files)
            rng.shuffle(idle_files)
            n_total = len(idle_files)
            n_train = int(round(0.70 * n_total))
            n_val = int(round(0.15 * n_total))

            for i, fname in enumerate(idle_files):
                fpath = os.path.join(label_dir, fname)
                try:
                    seq = np.load(fpath)
                    if seq.shape == (30, 126):
                        if i < n_train:
                            sp_key = "train"
                        elif i < n_train + n_val:
                            sp_key = "val"
                        else:
                            sp_key = "test"
                        splits[sp_key]["X"].append(seq)
                        splits[sp_key]["y"].append(label_to_idx[label_name])
                        person = fname.split("_")[0] if "_" in fname else "user"
                        splits[sp_key]["persons"].append(person)
                except Exception as e:
                    print(f"Warning: Failed loading idle file {fpath}: {e}")
            continue

        # Separate INCLUDE files (inc_ prefix) from own collector takes (non-inc_)
        inc_files = [f for f in files if f.startswith("inc_")]
        own_files = [f for f in files if not f.startswith("inc_")]

        # Process INCLUDE files
        for fname in inc_files:
            fpath = os.path.join(label_dir, fname)
            meta = manifest_map.get(os.path.normpath(fpath)) or manifest_map.get(fname)
            if meta:
                hr = meta.get("hand_ratio", 1.0)
                if hr < min_hand_ratio:
                    excluded_low_detection.append((label_name, meta.get("source_video", fname), hr))
                    continue
                sp_key = meta.get("split", "train")
                if sp_key not in ("train", "val", "test"):
                    sp_key = "train"
            else:
                sp_key = "train"

            try:
                seq = np.load(fpath)
                if seq.shape == (30, 126):
                    splits[sp_key]["X"].append(seq)
                    splits[sp_key]["y"].append(label_to_idx[label_name])
                    splits[sp_key]["persons"].append("include")
            except Exception as e:
                print(f"Warning: Failed loading {fpath}: {e}")

        # Process own collector-recorded takes
        if own_files:
            rng = np.random.RandomState(42)
            shuffled_own = list(own_files)
            rng.shuffle(shuffled_own)
            n_own = len(shuffled_own)

            # If live_in_train: half to train, half to live_test. Else all to live_test.
            n_own_train = (n_own // 2) if live_in_train else 0

            for i, fname in enumerate(shuffled_own):
                fpath = os.path.join(label_dir, fname)
                sp_key = "train" if i < n_own_train else "live_test"
                try:
                    seq = np.load(fpath)
                    if seq.shape == (30, 126):
                        splits[sp_key]["X"].append(seq)
                        splits[sp_key]["y"].append(label_to_idx[label_name])
                        person = fname.split("_")[0] if "_" in fname else "user"
                        splits[sp_key]["persons"].append(person)
                except Exception as e:
                    print(f"Warning: Failed loading own take {fpath}: {e}")

    if excluded_low_detection:
        print(f"\nFiltered out {len(excluded_low_detection)} samples below {min_hand_ratio:.0%} hand detection:")
        for s, v, r in sorted(set(excluded_low_detection)):
            print(f"  - [{s}] {v} (hand ratio: {r*100:.1f}%)")

    X_train = np.array(splits["train"]["X"], dtype=np.float32)
    y_train = np.array(splits["train"]["y"], dtype=np.int64)
    X_val = np.array(splits["val"]["X"], dtype=np.float32)
    y_val = np.array(splits["val"]["y"], dtype=np.int64)
    X_test = np.array(splits["test"]["X"], dtype=np.float32)
    y_test = np.array(splits["test"]["y"], dtype=np.int64)
    X_live = np.array(splits["live_test"]["X"], dtype=np.float32)
    y_live = np.array(splits["live_test"]["y"], dtype=np.int64)

    print(f"\nDataset splits summary:")
    print(f"  Train:     {len(X_train)} samples")
    print(f"  Val:       {len(X_val)} samples")
    print(f"  Test:      {len(X_test)} samples (official INCLUDE + idle)")
    print(f"  Live-Test: {len(X_live)} samples (own collector takes)")
    return (X_train, y_train), (X_val, y_val), (X_test, y_test), (X_live, y_live), label_list


def split_dataset_by_person(X, y, persons, holdout_person=None, test_size=0.2):
    unique_persons = np.unique(persons)
    print(f"Detected persons in dataset: {list(unique_persons)}")

    if holdout_person:
        clean_holdout = holdout_person.strip()
        if clean_holdout not in unique_persons:
            raise ValueError(f"Holdout person '{clean_holdout}' not found in dataset! Available persons: {list(unique_persons)}")

        val_mask = (persons == clean_holdout)
        train_mask = ~val_mask

        if np.sum(train_mask) == 0:
            raise ValueError(f"Cannot hold out '{clean_holdout}': all samples in dataset belong to this person!")

        print(f"\nHolding out person: '{clean_holdout}' for unseen evaluation.")
        print(f"  Training samples:   {np.sum(train_mask)} ({len(np.unique(persons[train_mask]))} persons)")
        print(f"  Validation samples: {np.sum(val_mask)} (Holdout person: '{clean_holdout}')")
        return X[train_mask], X[val_mask], y[train_mask], y[val_mask]

    # Split by person groups if multiple persons exist
    if len(unique_persons) >= 2:
        print("\nSplitting dataset by person using GroupShuffleSplit...")
        gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=42)
        train_idx, val_idx = next(gss.split(X, y, persons))
        val_persons = np.unique(persons[val_idx])
        train_persons = np.unique(persons[train_idx])
        print(f"  Train persons: {list(train_persons)} ({len(train_idx)} samples)")
        print(f"  Val persons:   {list(val_persons)} ({len(val_idx)} samples)")
        return X[train_idx], X[val_idx], y[train_idx], y[val_idx]

    # Fallback to stratified split if only 1 person
    print(f"\nNotice: Only 1 person found in dataset ('{unique_persons[0]}'). Using stratified random split.")
    train_idx, val_idx = train_test_split(np.arange(len(y)), test_size=test_size, stratify=y, random_state=42)
    return X[train_idx], X[val_idx], y[train_idx], y[val_idx]


def print_confusion_analysis(cm, labels):
    print("\n" + "=" * 65)
    print("CONFUSION MATRIX:")
    print("=" * 65)

    col_width = 10
    header = f"{'True \\ Pred':<{col_width}}" + "".join([f"{l[:8]:>{col_width}}" for l in labels])
    print(header)
    print("-" * len(header))

    confused_pairs = []

    for i, row in enumerate(cm):
        row_str = f"{labels[i][:9]:<{col_width}}" + "".join([f"{val:>{col_width}}" for val in row])
        print(row_str)

        for j, val in enumerate(row):
            if i != j and val > 0:
                confused_pairs.append((labels[i], labels[j], int(val)))

    print("=" * 65)

    print("\nTOP CONFUSED PAIRS:")
    if not confused_pairs:
        print("  ✓ No confused pairs! 100% accuracy on validation set.")
    else:
        confused_pairs.sort(key=lambda x: x[2], reverse=True)
        for rank, (true_cls, pred_cls, count) in enumerate(confused_pairs[:10], 1):
            print(f"  {rank}. True: '{true_cls}' -> Predicted: '{pred_cls}' ({count} instances)")
    print()


# ================= TRAINING LOOP =================

def train(epochs=30, batch_size=16, lr=0.001, hidden_dim=64, holdout_person=None, augment=True, classes_file=None, min_hand_ratio=0.30, live_in_train=False):
    dataset_res = load_dataset(classes_file=classes_file, min_hand_ratio=min_hand_ratio, live_in_train=live_in_train)
    if len(dataset_res) == 5:
        (X_train, y_train), (X_val, y_val), (X_test, y_test), (X_live, y_live), label_list = dataset_res
        if len(X_train) == 0:
            raise RuntimeError("No training samples found in data/ directory!")
    else:
        raise RuntimeError("Unexpected return format from load_dataset.")

    # Augmented training dataset (Validation, Test, and Live-Test are NEVER augmented!)
    train_dataset = AugmentedDataset(X_train, y_train, augment=augment, augment_factor=2)
    val_dataset = AugmentedDataset(X_val, y_val, augment=False)

    print(f"Total training tensors (with augmentations): {len(train_dataset)} | Validation tensors: {len(val_dataset)}")
    if X_test is not None:
        print(f"Test tensors (official split): {len(X_test)}")
    if X_live is not None:
        print(f"Live-Test tensors (own collector takes): {len(X_live)}")

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    num_classes = len(label_list)
    model = ISLClassifier(input_dim=126, hidden_dim=hidden_dim, num_classes=num_classes).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    best_val_acc = 0.0

    print("\nStarting model training...")
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        train_correct = 0
        total_train = 0

        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            logits = model(batch_x)
            loss = criterion(logits, batch_y)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * len(batch_y)
            train_correct += (logits.argmax(dim=1) == batch_y).sum().item()
            total_train += len(batch_y)

        train_loss /= total_train
        train_acc = train_correct / total_train

        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        total_val = 0

        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                batch_x, batch_y = batch_x.to(device), batch_y.to(device)
                logits = model(batch_x)
                loss = criterion(logits, batch_y)

                val_loss += loss.item() * len(batch_y)
                val_correct += (logits.argmax(dim=1) == batch_y).sum().item()
                total_val += len(batch_y)

        val_loss /= total_val
        val_acc = val_correct / total_val

        if val_acc > best_val_acc:
            best_val_acc = val_acc

        if epoch % 5 == 0 or epoch == epochs:
            print(f"Epoch {epoch:02d}/{epochs:02d} - Train Loss: {train_loss:.4f}, Train Acc: {train_acc*100:.1f}% | Val Loss: {val_loss:.4f}, Val Acc: {val_acc*100:.1f}%")

    print(f"\nBest Validation Accuracy: {best_val_acc*100:.2f}%")

    # Final detailed evaluation on validation set
    model.eval()
    all_preds = []
    all_targets = []
    with torch.no_grad():
        for batch_x, batch_y in val_loader:
            batch_x = batch_x.to(device)
            preds = model(batch_x).argmax(dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_targets.extend(batch_y.numpy())

    cm = confusion_matrix(all_targets, all_preds, labels=list(range(num_classes)))
    print_confusion_analysis(cm, label_list)

    print("VALIDATION SET CLASSIFICATION REPORT:")
    print(classification_report(all_targets, all_preds, labels=list(range(num_classes)), target_names=label_list, digits=3, zero_division=0))

    # Evaluate on official test set if available
    if X_test is not None and len(X_test) > 0:
        test_dataset = AugmentedDataset(X_test, y_test, augment=False)
        test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
        test_preds = []
        test_targets = []
        with torch.no_grad():
            for batch_x, batch_y in test_loader:
                batch_x = batch_x.to(device)
                preds = model(batch_x).argmax(dim=1).cpu().numpy()
                test_preds.extend(preds)
                test_targets.extend(batch_y.numpy())

        test_acc = np.mean(np.array(test_preds) == np.array(test_targets))
        print("\n" + "=" * 65)
        print(f"OFFICIAL TEST SET EVALUATION: Accuracy = {test_acc*100:.2f}% ({len(X_test)} samples)")
        print("=" * 65)

        test_cm = confusion_matrix(test_targets, test_preds, labels=list(range(num_classes)))
        print_confusion_analysis(test_cm, label_list)

        print("TEST SET CLASSIFICATION REPORT:")
        print(classification_report(test_targets, test_preds, labels=list(range(num_classes)), target_names=label_list, digits=3, zero_division=0))

    # Evaluate on LIVE-TEST set (own collector takes)
    if X_live is not None and len(X_live) > 0:
        live_dataset = AugmentedDataset(X_live, y_live, augment=False)
        live_loader = DataLoader(live_dataset, batch_size=batch_size, shuffle=False)
        live_preds = []
        live_targets = []
        with torch.no_grad():
            for batch_x, batch_y in live_loader:
                batch_x = batch_x.to(device)
                preds = model(batch_x).argmax(dim=1).cpu().numpy()
                live_preds.extend(preds)
                live_targets.extend(batch_y.numpy())

        live_acc = np.mean(np.array(live_preds) == np.array(live_targets))
        print("\n" + "=" * 65)
        print(f"LIVE-TEST SET EVALUATION (Own Takes): Accuracy = {live_acc*100:.2f}% ({len(X_live)} samples)")
        print("=" * 65)

        live_cm = confusion_matrix(live_targets, live_preds, labels=list(range(num_classes)))
        print_confusion_analysis(live_cm, label_list)

        print("LIVE-TEST CLASSIFICATION REPORT:")
        print(classification_report(live_targets, live_preds, labels=list(range(num_classes)), target_names=label_list, digits=3, zero_division=0))
    else:
        print("\nLIVE-TEST SET EVALUATION: 0 samples available (no own collector takes in data/ folders).")

    # Step 4 Requirement: Save normalization settings and label order alongside model.pth
    normalization_settings = {
        "hands": 2,
        "landmarks_per_hand": 21,
        "coords_per_landmark": 3,
        "feature_dim": 126,
        "wrist_relative": True,
        "scale_metric": "wrist_to_middle_mcp_distance",
        "wrist_landmark_idx": 0,
        "middle_mcp_idx": 9,
        "left_hand_slice": [0, 63],
        "right_hand_slice": [63, 126],
        "zero_fill_missing": True
    }

    print(f"Saving model and normalization metadata to {MODEL_SAVE_PATH}...")
    torch.save({
        "state_dict": model.state_dict(),
        "input_dim": 126,
        "hidden_dim": hidden_dim,
        "num_classes": num_classes,
        "num_layers": 2,
        "labels": label_list,
        "normalization_settings": normalization_settings
    }, MODEL_SAVE_PATH)

    print(f"Saving label list to {LABEL_LIST_SAVE_PATH}...")
    with open(LABEL_LIST_SAVE_PATH, "w", encoding="utf-8") as f:
        json.dump(label_list, f, indent=2, ensure_ascii=False)

    print("Training finished successfully!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ISL sequence classifier.")
    parser.add_argument("--epochs", type=int, default=25, help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--holdout-person", type=str, default=None, help="Person name to hold out as unseen validation set")
    parser.add_argument("--no-augment", action="store_true", help="Disable training data augmentation")
    parser.add_argument("--classes", type=str, default=None, help="Path to JSON file specifying subset of classes (e.g. demo_words.json)")
    parser.add_argument("--min-hand-ratio", type=float, default=0.30, help="Minimum hand detection ratio to include a clip (default: 0.30)")
    parser.add_argument("--live-in-train", action="store_true", help="Add half of each class's own takes to train and keep other half in live_test")
    args = parser.parse_args()

    train(
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        holdout_person=args.holdout_person,
        augment=not args.no_augment,
        classes_file=args.classes,
        min_hand_ratio=args.min_hand_ratio,
        live_in_train=args.live_in_train
    )
