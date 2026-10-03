/**
 * Short, honest FAQ items for MOVA landing page.
 * Each answer is strictly 1 to 2 crisp, factual sentences.
 */
export const FAQ_ITEMS = [
  {
    id: 'free',
    question: 'Is MOVA free to use?',
    answer: 'Yes, MOVA is completely free to use directly in your browser without subscriptions or paywalls.'
  },
  {
    id: 'privacy',
    question: 'Is my camera video recorded or stored anywhere?',
    answer: 'No. Video frames are processed live in your browser by MediaPipe to extract landmark coordinates, and no video is ever saved, recorded, or sent to a server.'
  },
  {
    id: 'signs',
    question: 'Which signs does the translator recognize right now?',
    answer: 'The current model recognizes 13 everyday Indian Sign Language gestures across common greetings, courtesies, family, and places.'
  },
  {
    id: 'languages',
    question: 'Which languages are supported?',
    answer: 'Sign translations are provided in Malayalam script alongside English, with voice synthesis available for Malayalam, Hindi, and English.'
  },
  {
    id: 'mobile',
    question: 'Does it work on mobile phones?',
    answer: 'Yes, it runs on any modern mobile browser that supports camera access and WebAssembly.'
  },
  {
    id: 'unrecognized',
    question: 'What happens if a sign is not recognized?',
    answer: 'If gesture confidence is below the threshold, the app stays idle rather than outputting false translations.'
  }
];

export default FAQ_ITEMS;
