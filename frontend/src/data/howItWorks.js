/**
 * Data file for the How It Works scroll-reveal section.
 * Contains step definitions, copy, media assets, and audit notes.
 */
export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Open camera',
    // TODO: Verify against code before launch - raw camera frames are processed strictly in-memory by MediaPipe and never recorded or stored
    description: 'Allow access. Nothing is recorded.',
    image: {
      webp: '/images/how-it-works/step-1-camera.webp',
      png: '/images/how-it-works/step-1-camera.png',
      alt: 'Smartphone showing camera permission dialog with a blue Allow button',
      width: 2208,
      height: 2400,
      aspectRatio: '0.92',
      loading: 'eager',
      // Generation prompt:
      // 'A person hand holding a modern smartphone in natural daylight, the screen showing a friendly camera-permission prompt with a camera icon and a blue Allow button; the person face is softly out of focus behind the phone, studio portrait 2208x2400.'
    }
  },
  {
    number: '02',
    title: 'Sign',
    description: 'Hold your sign steady for a moment.',
    image: {
      webp: '/images/how-it-works/step-2-sign.webp',
      png: '/images/how-it-works/step-2-sign.png',
      // Technology landmark visual (TODO-REAL-PHOTO: replace with photo of a real ISL signer)
      alt: 'Hand held up with 21 MediaPipe landmark points and blue coordinate tracking lines',
      width: 2208,
      height: 2400,
      aspectRatio: '0.92',
      loading: 'lazy',
      // Generation prompt:
      // 'TODO-REAL-PHOTO: A close-up of a real-looking hand held up in front of a plain neutral studio background, with a flat 2D hand-landmark overlay (21 small solid blue dots joined by thin light-blue lines) over it, a subtle scanning frame around the hand, and a soft blue glow behind it.'
    }
  },
  {
    number: '03',
    title: 'Hear it',
    description: 'Read it in Malayalam. Play it aloud.',
    image: {
      webp: '/images/how-it-works/step-3-hear.webp',
      png: '/images/how-it-works/step-3-hear.png',
      alt: 'Smartphone screen showing the Malayalam word നന്ദി (Thank you) with audio speaker wave',
      width: 2208,
      height: 2400,
      aspectRatio: '0.92',
      loading: 'lazy',
      // Generation prompt:
      // 'A smartphone screen showing the Malayalam word നന്ദി in large bold dark text, "Thank you" beneath it in gray, and a blue circular speaker button with sound waves; a second person on the right side, softly out of focus, smiling and reading the screen.'
    },
    audio: {
      phrase: 'നന്ദി',
      fallbackText: 'Thank you',
      lang: 'ml-IN'
    }
  }
];

export default HOW_IT_WORKS_STEPS;
