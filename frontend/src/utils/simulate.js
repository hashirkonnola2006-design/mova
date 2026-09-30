import labelsMap from '../labels_ml.json';

const labelsList = Object.keys(labelsMap);

/**
 * Generates a 30x126 sequence for a given sign label to test or demo without a camera.
 */
export function generateSyntheticSequence(label) {
  const cIdx = labelsList.indexOf(label);
  const sequence = [];

  if (cIdx === -1 || label === 'idle') {
    // Return subtle idle noise
    for (let t = 0; t < 30; t++) {
      sequence.push(new Array(126).fill(0));
    }
    return sequence;
  }

  const phaseShift = cIdx * (Math.PI / labelsList.length);
  const freq = 1.0 + (cIdx % 5) * 0.4;

  const baseLeft = [];
  const baseRight = [];
  for (let i = 0; i < 63; i++) {
    const val = (i / 63) * Math.PI * 2 + phaseShift;
    baseLeft.push(Math.sin(val) * 0.8);
    baseRight.push(Math.cos(val) * 0.8);
  }

  for (let t = 0; t < 30; t++) {
    const motion = Math.sin(2 * Math.PI * freq * (t / 30)) * 0.2;
    const frame = [];

    // Left hand
    for (let i = 0; i < 63; i++) {
      frame.push(baseLeft[i] + motion);
    }
    // Right hand
    for (let i = 0; i < 63; i++) {
      frame.push(baseRight[i] - motion);
    }
    sequence.push(frame);
  }

  return sequence;
}
