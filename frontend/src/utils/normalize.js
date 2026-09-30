/**
 * Landmark normalization module mirrored exactly from Python normalize.py.
 * 21 landmarks x 3 coords x 2 hands = 126 values.
 * Zero-fills missing hands.
 */

export function normalizeSingleHand(landmarks) {
  if (!landmarks || landmarks.length !== 21) {
    return new Array(63).fill(0);
  }

  // 1. Wrist relative translation: (x - x0, y - y0, z - z0)
  const wrist = landmarks[0];
  const ptsRel = landmarks.map(lm => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z
  }));

  // 2. Hand size scale: distance from wrist (0) to middle MCP (9)
  const mcp = ptsRel[9];
  let dist = Math.hypot(mcp.x, mcp.y, mcp.z);

  if (dist < 1e-4) {
    // Fallback to maximum distance from wrist across all points
    dist = Math.max(...ptsRel.map(p => Math.hypot(p.x, p.y, p.z)));
    if (dist < 1e-4) {
      dist = 1.0;
    }
  }

  // 3. Normalize coordinates and flatten to 63 floats
  const out = [];
  for (let i = 0; i < 21; i++) {
    out.push(ptsRel[i].x / dist);
    out.push(ptsRel[i].y / dist);
    out.push(ptsRel[i].z / dist);
  }
  return out;
}

export function normalizeBothHands(leftHandLandmarks, rightHandLandmarks) {
  const leftVec = normalizeSingleHand(leftHandLandmarks);
  const rightVec = normalizeSingleHand(rightHandLandmarks);
  return [...leftVec, ...rightVec];
}

export function processLandmarkerResult(result) {
  if (!result || !result.landmarks || !result.handednesses || result.landmarks.length === 0) {
    return new Array(126).fill(0);
  }

  let leftHand = null;
  let rightHand = null;

  for (let i = 0; i < result.landmarks.length; i++) {
    const lms = result.landmarks[i];
    // Handedness in @mediapipe/tasks-vision is inside handednesses array
    const handednessList = result.handednesses[i];
    if (!handednessList || handednessList.length === 0) continue;

    const label = handednessList[0].categoryName || handednessList[0].displayName;
    if (label === 'Left' && !leftHand) {
      leftHand = lms;
    } else if (label === 'Right' && !rightHand) {
      rightHand = lms;
    }
  }

  return normalizeBothHands(leftHand, rightHand);
}
