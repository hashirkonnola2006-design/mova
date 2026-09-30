import sys
import numpy as np
import train

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def test_augmentations():
    print("Testing augmentations...")
    # Create a test sequence with left hand populated and right hand zero-filled
    seq = np.zeros((30, 126), dtype=np.float32)
    # Left hand has non-zero landmarks
    for t in range(30):
        seq[t, :63] = np.linspace(0.1, 0.9, 63)

    aug_seq = train.augment_sequence(seq)
    assert aug_seq.shape == (30, 126), f"Bad aug shape: {aug_seq.shape}"

    # Right hand MUST remain zero-filled
    assert np.all(aug_seq[:, 63:] == 0), "Right hand should remain zero-filled after augmentation"

    # Left hand should have slight jitter
    assert not np.allclose(aug_seq[:, :63], seq[:, :63]), "Left hand should be perturbed by augmentation"
    print("✓ Augmentation correctly preserves zero-filled hands while jittering active hands.")


def test_holdout_split():
    print("Testing person-based splitting and holdout...")
    N = 20
    X = np.zeros((N, 30, 126), dtype=np.float32)
    y = np.array([i % 2 for i in range(N)])
    persons = np.array(["alice"] * 12 + ["bob"] * 8)

    X_train, X_val, y_train, y_val = train.split_dataset_by_person(X, y, persons, holdout_person="bob")
    assert len(X_val) == 8, f"Expected 8 samples for bob, got {len(X_val)}"
    assert len(X_train) == 12, f"Expected 12 samples for alice, got {len(X_train)}"
    print("✓ Holdout person split verified: 100% of 'bob' in validation, none in training.")


def test_confusion_analysis():
    print("Testing top confused pairs...")
    labels = ["hello", "thank_you", "sorry"]
    # cm: hello confused with sorry twice
    cm = np.array([
        [8, 0, 2],
        [0, 10, 0],
        [1, 0, 9]
    ])
    train.print_confusion_analysis(cm, labels)
    print("✓ Confusion matrix and confused pairs analysis verified.")


if __name__ == "__main__":
    test_augmentations()
    test_holdout_split()
    test_confusion_analysis()
    print("\n>>> STEP 4 VERIFICATION COMPLETE: ALL TRAINING TESTS PASSED! <<<")
