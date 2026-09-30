import numpy as np

def normalize_single_hand(landmarks):
    """
    Normalizes a single hand's 21 landmarks:
    1. Translates coordinates relative to the wrist (landmark 0).
    2. Scales by hand size (distance between wrist landmark 0 and middle finger MCP landmark 9).
    
    Args:
        landmarks: iterable of 21 points, where each point has x, y, z (as attributes, dict, or tuple/list).
    Returns:
        np.ndarray of shape (63,) float32.
    """
    if landmarks is None or len(landmarks) != 21:
        return np.zeros(63, dtype=np.float32)

    coords = []
    for lm in landmarks:
        if hasattr(lm, 'x'):
            coords.append([lm.x, lm.y, lm.z])
        elif isinstance(lm, dict):
            coords.append([lm['x'], lm['y'], lm['z']])
        else:
            coords.append([lm[0], lm[1], lm[2]])
    
    pts = np.array(coords, dtype=np.float32)  # shape (21, 3)

    # 1. Wrist relative translation: (x - x0, y - y0, z - z0)
    wrist = pts[0].copy()
    pts_rel = pts - wrist

    # 2. Hand size scale: distance from wrist (0) to middle MCP (9)
    dist = float(np.linalg.norm(pts[9] - pts[0]))
    if dist < 1e-4:
        # Fallback to maximum distance from wrist across all points
        dist = float(np.max(np.linalg.norm(pts_rel, axis=1)))
        if dist < 1e-4:
            dist = 1.0

    pts_norm = pts_rel / dist
    return pts_norm.flatten()


def normalize_both_hands(left_hand_landmarks=None, right_hand_landmarks=None):
    """
    Combines normalized Left (63) and Right (63) hand vectors into 126 values.
    Zero-fills any missing hand.
    
    Returns:
        np.ndarray of shape (126,) float32.
    """
    left_vec = normalize_single_hand(left_hand_landmarks)
    right_vec = normalize_single_hand(right_hand_landmarks)
    return np.concatenate([left_vec, right_vec]).astype(np.float32)


def process_hand_landmarker_result(result):
    """
    Processes a MediaPipe HandLandmarkerResult from tasks-vision.
    Assigns Left to the first 63 values and Right to the last 63 values.
    """
    if not result or not getattr(result, 'hand_landmarks', None) or not getattr(result, 'handedness', None):
        return np.zeros(126, dtype=np.float32)

    left_hand = None
    right_hand = None

    for hand_lms, handedness_list in zip(result.hand_landmarks, result.handedness):
        if not handedness_list:
            continue
        label = handedness_list[0].category_name or handedness_list[0].display_name
        if label == "Left" and left_hand is None:
            left_hand = hand_lms
        elif label == "Right" and right_hand is None:
            right_hand = hand_lms

    return normalize_both_hands(left_hand, right_hand)
