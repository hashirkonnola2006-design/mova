/**
 * about.js — Structured content for the redesigned About page.
 * Read verified model sign count from signs.json / labels.json.
 */
import signsData from './signs.json';

// Number of signs the trained model actually recognizes
export const VERIFIED_MODEL_SIGN_COUNT = Array.isArray(signsData) ? signsData.length : 13;

export const ABOUT_TIMELINE = [
  {
    step: "01",
    label: "Hackathon",
    title: "Innov8 Season 3",
    description: "Innov8 Season 3, organised by the CS Association of College of Engineering Thalassery. Theme: Code 4 Change. We came second."
  },
  {
    step: "02",
    label: "The idea",
    title: "The idea",
    description: "A sign language to Malayalam converter. We called it MOVA."
  },
  {
    step: "03",
    label: "First model",
    title: "First model",
    description: "About 50 recorded videos. Just 3 words. It worked."
  },
  {
    step: "04",
    label: "Today",
    title: "Today",
    description: `${VERIFIED_MODEL_SIGN_COUNT} signs and growing.`
  },
  {
    step: "05",
    label: "Next",
    title: "Next",
    description: "More words. A Google Meet extension, so MOVA can work in real conversations."
  }
];

export const BUILT_WITH_CHIPS = [
  "Python",
  "PyTorch",
  "AI4Bharat dataset",
  "Signs recorded by our team"
];
