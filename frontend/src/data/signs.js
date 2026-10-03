/**
 * signs.js — Generated from labels_ml.json (the real vocabulary).
 * 48 sign categories. "idle" is excluded (it is a system state, not a sign).
 *
 * Each entry:
 *   key       — internal slug used by the model
 *   english   — English word
 *   malayalam — Malayalam translation
 *   category  — grouping label
 */
export const SIGNS = [
  { key: 'bank',          english: 'Bank',           malayalam: 'ബാങ്ക്',          category: 'Places' },
  { key: 'big_large',     english: 'Big / Large',    malayalam: 'വലിയത്',          category: 'Adjectives' },
  { key: 'bird',          english: 'Bird',           malayalam: 'പക്ഷി',           category: 'Animals' },
  { key: 'black',         english: 'Black',          malayalam: 'കറുപ്പ്',         category: 'Colours' },
  { key: 'boy',           english: 'Boy',            malayalam: 'ആൺകുട്ടി',        category: 'People' },
  { key: 'brother',       english: 'Brother',        malayalam: 'സഹോദരൻ',          category: 'People' },
  { key: 'car',           english: 'Car',            malayalam: 'കാർ',             category: 'Transport' },
  { key: 'cell_phone',    english: 'Cell phone',     malayalam: 'മൊബൈൽ ഫോൺ',      category: 'Electronics' },
  { key: 'court',         english: 'Court',          malayalam: 'കോടതി',           category: 'Places' },
  { key: 'cow',           english: 'Cow',            malayalam: 'പശു',             category: 'Animals' },
  { key: 'death',         english: 'Death',          malayalam: 'മരണം',            category: 'General' },
  { key: 'dog',           english: 'Dog',            malayalam: 'നായ',             category: 'Animals' },
  { key: 'dry',           english: 'Dry',            malayalam: 'ഉണങ്ങിയത്',       category: 'Adjectives' },
  { key: 'election',      english: 'Election',       malayalam: 'തിരഞ്ഞെടുപ്പ്',   category: 'General' },
  { key: 'fall',          english: 'Fall',           malayalam: 'ശരത്കാലം',        category: 'Seasons' },
  { key: 'fan',           english: 'Fan',            malayalam: 'ഫാൻ',             category: 'Electronics' },
  { key: 'father',        english: 'Father',         malayalam: 'അച്ഛൻ',           category: 'People' },
  { key: 'girl',          english: 'Girl',           malayalam: 'പെൺകുട്ടി',       category: 'People' },
  { key: 'good',          english: 'Good',           malayalam: 'നല്ലത്',          category: 'Adjectives' },
  { key: 'good_morning',  english: 'Good Morning',   malayalam: 'സുപ്രഭാതം',       category: 'Greetings' },
  { key: 'happy',         english: 'Happy',          malayalam: 'സന്തോഷം',         category: 'Adjectives' },
  { key: 'hat',           english: 'Hat',            malayalam: 'തൊപ്പി',          category: 'Clothes' },
  { key: 'hello',         english: 'Hello',          malayalam: 'നമസ്കാരം',        category: 'Greetings' },
  { key: 'hot',           english: 'Hot',            malayalam: 'ചൂട്',            category: 'Adjectives' },
  { key: 'house',         english: 'House',          malayalam: 'വീട്',            category: 'Places' },
  { key: 'i',             english: 'I',              malayalam: 'ഞാൻ',             category: 'Pronouns' },
  { key: 'it',            english: 'It',             malayalam: 'അത്',             category: 'Pronouns' },
  { key: 'long',          english: 'Long',           malayalam: 'നീളമുള്ളത്',      category: 'Adjectives' },
  { key: 'loud',          english: 'Loud',           malayalam: 'ഉച്ചത്തിൽ',       category: 'Adjectives' },
  { key: 'monday',        english: 'Monday',         malayalam: 'തിങ്കളാഴ്ച',      category: 'Days & Time' },
  { key: 'new',           english: 'New',            malayalam: 'പുതിയത്',         category: 'Adjectives' },
  { key: 'paint',         english: 'Paint',          malayalam: 'പെയിന്റ്',        category: 'Home' },
  { key: 'pen',           english: 'Pen',            malayalam: 'പേന',             category: 'Home' },
  { key: 'priest',        english: 'Priest',         malayalam: 'പുരോഹിതൻ',        category: 'People' },
  { key: 'quiet',         english: 'Quiet',          malayalam: 'ശാന്തം',          category: 'Adjectives' },
  { key: 'red',           english: 'Red',            malayalam: 'ചുവപ്പ്',         category: 'Colours' },
  { key: 'shoes',         english: 'Shoes',          malayalam: 'ഷൂസ്',            category: 'Clothes' },
  { key: 'short',         english: 'Short',          malayalam: 'നീളം കുറഞ്ഞത്',  category: 'Adjectives' },
  { key: 'small_little',  english: 'Small / Little', malayalam: 'ചെറിയത്',         category: 'Adjectives' },
  { key: 'store_shop',    english: 'Store / Shop',   malayalam: 'കട',              category: 'Places' },
  { key: 'summer',        english: 'Summer',         malayalam: 'വേനൽക്കാലം',      category: 'Seasons' },
  { key: 'teacher',       english: 'Teacher',        malayalam: 'അധ്യാപകൻ',        category: 'People' },
  { key: 'thank_you',     english: 'Thank you',      malayalam: 'നന്ദി',           category: 'Greetings' },
  { key: 'time',          english: 'Time',           malayalam: 'സമയം',            category: 'Days & Time' },
  { key: 'train_ticket',  english: 'Train ticket',   malayalam: 'ട്രെയിൻ ടിക്കറ്റ്', category: 'Transport' },
  { key: 'tshirt',        english: 'T-Shirt',        malayalam: 'ടി-ഷർട്ട്',      category: 'Clothes' },
  { key: 'white',         english: 'White',          malayalam: 'വെള്ള',           category: 'Colours' },
  { key: 'window',        english: 'Window',         malayalam: 'ജനൽ',             category: 'Home' },
  { key: 'year',          english: 'Year',           malayalam: 'വർഷം',            category: 'Days & Time' },
  { key: 'you_plural',    english: 'You (plural)',   malayalam: 'നിങ്ങൾ',          category: 'Pronouns' },
];

export const SIGN_CATEGORIES = [...new Set(SIGNS.map(s => s.category))].sort();

/** The 10 signs currently active in the trained model (labels.json has 14 classes including idle) */
export const ACTIVE_SIGN_KEYS = [
  'hello', 'good_morning', 'thank_you', 'good', 'i',
  'father', 'boy', 'girl', 'bank', 'time',
];
