/**
 * about.js — Structured content for the redesigned About page.
 * Read verified model sign count from signs.json / labels.json.
 */
import signsData from './signs.json';

// Number of signs the trained model actually recognizes
export const VERIFIED_MODEL_SIGN_COUNT = Array.isArray(signsData) ? signsData.length : 13;


