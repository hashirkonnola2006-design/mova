/**
 * Data file for the How It Works scroll-reveal section.
 * Contains step definitions, copy, media assets, and audit notes.
 */
export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Open camera',
    description: 'Allow access. Nothing is recorded.',
    image: {
      webp: '/images/how-it-works/step1.webp',
      fallback: '/images/how-it-works/step1.jpg',
      alt: 'Person holding a smartphone showing MOVA camera permission dialog in natural daylight',
      width: 1122,
      height: 1402,
      aspectRatio: '0.80',
      loading: 'eager',
    }
  },
  {
    number: '02',
    title: 'Sign',
    description: 'Hold your sign steady for a moment.',
    image: {
      webp: '/images/how-it-works/step2.webp',
      fallback: '/images/how-it-works/step2.jpg',
      alt: 'Young Indian man making a clear hand sign facing the camera with relaxed expression',
      width: 896,
      height: 1200,
      aspectRatio: '0.75',
      loading: 'lazy',
    }
  },
  {
    number: '03',
    title: 'Hear it',
    description: 'Read it in Malayalam. Play it aloud.',
    image: {
      webp: '/images/how-it-works/step3.webp',
      fallback: '/images/how-it-works/step3.jpg',
      alt: 'Deaf woman and hearing receptionist smiling and reading translation together on a phone',
      width: 896,
      height: 1200,
      aspectRatio: '0.75',
      loading: 'lazy',
    },
    audio: {
      phrase: 'നന്ദി',
      fallbackText: 'Thank you',
      lang: 'ml-IN'
    }
  }
];

export default HOW_IT_WORKS_STEPS;
