/**
 * Assets manifest for MOVA minimal, image-led landing page.
 * Tracks source paths, alternate formats, alt text, intended dimensions, and review status.
 */
export const LANDING_ASSETS = [
  {
    id: 'step-camera',
    webp: '/images/landing/step-camera.webp',
    png: '/images/landing/step-camera.png',
    altText: 'Smartphone displaying camera permission dialog with blue Allow button over live viewfinder',
    intendedWidth: 1200,
    intendedHeight: 1500,
    aspectRatio: '4/5',
    status: 'final',
    // Prompt for future reshoots:
    // 'Close-up studio photograph of an iPhone held steadily against a clean, soft off-white background, displaying a browser camera permission dialog with a clear blue Allow button, natural daylight, subtle soft shadows, high resolution, realistic depth of field.'
  },
  {
    id: 'step-sign',
    webp: '/images/landing/step-sign.webp',
    png: '/images/landing/step-sign.png',
    altText: 'Human hand with subtle 2D MediaPipe landmark coordinate dots and tracking lines',
    intendedWidth: 715,
    intendedHeight: 768,
    aspectRatio: '1/1',
    status: 'final', // TODO-REAL-PHOTO: Replace with professional studio photo of a native Deaf Indian Sign Language signer
    // Prompt for real photo reshoot:
    // 'Professional studio photograph of a native ISL signer hand gesture, natural skin tone, neutral daylight, sharp focus on hand, transparent background or pale neutral studio cyclorama, overlaid with precise 21-point MediaPipe hand landmark tracking mesh in cyan and cobalt.'
  },
  {
    id: 'step-hear',
    webp: '/images/landing/step-hear.webp',
    png: '/images/landing/step-hear.png',
    altText: 'Smartphone screen showing translated Malayalam word നന്ദി (Thank you) with audio speaker wave',
    intendedWidth: 1200,
    intendedHeight: 1500,
    aspectRatio: '4/5',
    status: 'final',
    // Prompt for future reshoots:
    // 'Clean editorial photograph of a smartphone display in hand showing translated text in Malayalam script, warm ambient lighting, modern UI with sound wave speaker icon, subtle depth of field with a conversational partner in the soft background.'
  },
  {
    id: 'cta-hands-bg',
    webp: '/images/landing/cta-hands-bg.webp',
    png: '/images/landing/cta-hands-bg.png',
    altText: 'Two hands reaching toward each other with fingertips almost touching, representing human connection through sign language',
    intendedWidth: 3200,
    intendedHeight: 1200,
    aspectRatio: '8/3',
    status: 'final',
    // High-resolution 3200px transparent hand banner for final CTA card accent
  }
];

export default LANDING_ASSETS;
