import json
import os

LABELS_DATA = {
  "idle": {
    "malayalam": "",
    "english": "idle",
    "parent_label": "System",
    "needs_review": True,
    "alternatives": ["നിഷ്ക്രിയം"]
  },
  "loud": {
    "malayalam": "ഉച്ചത്തിൽ",
    "english": "1. loud",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["ശബ്ദമുള്ള", "ഉറക്കെ"]
  },
  "quiet": {
    "malayalam": "ശാന്തം",
    "english": "2. quiet",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["നിശബ്ദം", "മിണ്ടാതിരിക്കുക"]
  },
  "happy": {
    "malayalam": "സന്തോഷം",
    "english": "3. happy",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["ആനന്ദം", "സന്തോഷമുള്ള"]
  },
  "long": {
    "malayalam": "നീളമുള്ള",
    "english": "78. long",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["നീളം"]
  },
  "short": {
    "malayalam": "കുറഞ്ഞ",
    "english": "79. short",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["നീളം കുറഞ്ഞ", "പൊക്കം കുറഞ്ഞ (height)"]
  },
  "big_large": {
    "malayalam": "വലുത്",
    "english": "83. big large",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["വലിയ", "വലിപ്പമുള്ള"]
  },
  "small_little": {
    "malayalam": "ചെറുത്",
    "english": "84. small little",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["ചെറിയ", "അല്പം"]
  },
  "hot": {
    "malayalam": "ചൂടുള്ള",
    "english": "87. hot",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["ചൂട്"]
  },
  "new": {
    "malayalam": "പുതിയത്",
    "english": "91. new",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["പുതിയ"]
  },
  "good": {
    "malayalam": "നല്ലത്",
    "english": "94. good",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["നല്ല"]
  },
  "dry": {
    "malayalam": "വരണ്ട",
    "english": "97. dry",
    "parent_label": "Adjectives",
    "needs_review": True,
    "alternatives": ["ഉണങ്ങിയ"]
  },
  "dog": {
    "malayalam": "നായ",
    "english": "1. Dog",
    "parent_label": "Animals",
    "needs_review": True,
    "alternatives": ["പട്ടി"]
  },
  "bird": {
    "malayalam": "പക്ഷി",
    "english": "4. Bird",
    "parent_label": "Animals",
    "needs_review": True,
    "alternatives": ["കിളി"]
  },
  "cow": {
    "malayalam": "പശു",
    "english": "5. Cow",
    "parent_label": "Animals",
    "needs_review": True,
    "alternatives": ["മാട്"]
  },
  "hat": {
    "malayalam": "തൊപ്പി",
    "english": "37. Hat",
    "parent_label": "Clothes",
    "needs_review": True,
    "alternatives": []
  },
  "tshirt": {
    "malayalam": "ടി-ഷർട്ട്",
    "english": "42. T-Shirt",
    "parent_label": "Clothes",
    "needs_review": True,
    "alternatives": ["കുപ്പായം"]
  },
  "shoes": {
    "malayalam": "പാദരക്ഷകൾ",
    "english": "44. Shoes",
    "parent_label": "Clothes",
    "needs_review": True,
    "alternatives": ["ഷൂസ്", "ചെരിപ്പ്"]
  },
  "red": {
    "malayalam": "ചുവപ്പ്",
    "english": "47. Red",
    "parent_label": "Colours",
    "needs_review": True,
    "alternatives": ["ചുവപ്പ് നിറം"]
  },
  "black": {
    "malayalam": "കറുപ്പ്",
    "english": "54. Black",
    "parent_label": "Colours",
    "needs_review": True,
    "alternatives": ["കറുപ്പ് നിറം"]
  },
  "white": {
    "malayalam": "വെള്ള",
    "english": "55. White",
    "parent_label": "Colours",
    "needs_review": True,
    "alternatives": ["വെളുപ്പ് നിറം"]
  },
  "monday": {
    "malayalam": "തിങ്കളാഴ്ച",
    "english": "67. Monday",
    "parent_label": "Days_and_Time",
    "needs_review": True,
    "alternatives": ["തിങ്കൾ"]
  },
  "year": {
    "malayalam": "വർഷം",
    "english": "78. Year",
    "parent_label": "Days_and_Time",
    "needs_review": True,
    "alternatives": ["ആണ്ട്", "കൊല്ലം"]
  },
  "time": {
    "malayalam": "സമയം",
    "english": "86. Time",
    "parent_label": "Days_and_Time",
    "needs_review": True,
    "alternatives": ["നേരം", "കാലം (era)"]
  },
  "fan": {
    "malayalam": "ഫാൻ",
    "english": "53. Fan",
    "parent_label": "Electronics",
    "needs_review": True,
    "alternatives": ["വീശറി"]
  },
  "cell_phone": {
    "malayalam": "മൊബൈൽ ഫോൺ",
    "english": "54. Cell phone",
    "parent_label": "Electronics",
    "needs_review": True,
    "alternatives": ["സെൽഫോൺ", "ഫോൺ"]
  },
  "hello": {
    "malayalam": "നമസ്കാരം",
    "english": "48. Hello",
    "parent_label": "Greetings",
    "needs_review": True,
    "alternatives": ["ഹലോ"]
  },
  "good_morning": {
    "malayalam": "സുപ്രഭാതം",
    "english": "51. Good Morning",
    "parent_label": "Greetings",
    "needs_review": True,
    "alternatives": []
  },
  "thank_you": {
    "malayalam": "നന്ദി",
    "english": "55. Thank you",
    "parent_label": "Greetings",
    "needs_review": True,
    "alternatives": []
  },
  "window": {
    "malayalam": "ജനൽ",
    "english": "28. Window",
    "parent_label": "Home",
    "needs_review": True,
    "alternatives": ["കിളിവാതിൽ"]
  },
  "pen": {
    "malayalam": "പേന",
    "english": "34. Pen",
    "parent_label": "Home",
    "needs_review": True,
    "alternatives": []
  },
  "paint": {
    "malayalam": "പെയിന്റ്",
    "english": "40. Paint",
    "parent_label": "Home",
    "needs_review": True,
    "alternatives": ["ചായം", "വർണ്ണം", "പെയിന്റ് അടിക്കുക (verb)"]
  },
  "teacher": {
    "malayalam": "അധ്യാപകൻ",
    "english": "84. Teacher",
    "parent_label": "Jobs",
    "needs_review": True,
    "alternatives": ["അധ്യാപിക (female)", "ഗുരു", "ടീച്ചർ"]
  },
  "priest": {
    "malayalam": "പുരോഹിതൻ",
    "english": "91. Priest",
    "parent_label": "Jobs",
    "needs_review": True,
    "alternatives": ["പൂജാരി (temple)", "അച്ചൻ (church)"]
  },
  "car": {
    "malayalam": "കാർ",
    "english": "11. Car",
    "parent_label": "Means_of_Transportation",
    "needs_review": True,
    "alternatives": ["വാഹനം"]
  },
  "train_ticket": {
    "malayalam": "ട്രെയിൻ ടിക്കറ്റ്",
    "english": "16. train ticket",
    "parent_label": "Means_of_Transportation",
    "needs_review": True,
    "alternatives": ["തീവണ്ടി ടിക്കറ്റ്"]
  },
  "father": {
    "malayalam": "അച്ഛൻ",
    "english": "61. Father",
    "parent_label": "People",
    "needs_review": True,
    "alternatives": ["പിതാവ്", "ബാപ്പ"]
  },
  "brother": {
    "malayalam": "സഹോദരൻ",
    "english": "66. Brother",
    "parent_label": "People",
    "needs_review": True,
    "alternatives": ["ചേട്ടൻ (elder)", "അനിയൻ (younger)"]
  },
  "boy": {
    "malayalam": "ആൺകുട്ടി",
    "english": "77. Boy",
    "parent_label": "People",
    "needs_review": True,
    "alternatives": ["ബാലൻ", "ചെറുക്കൻ"]
  },
  "girl": {
    "malayalam": "പെൺകുട്ടി",
    "english": "78. Girl",
    "parent_label": "People",
    "needs_review": True,
    "alternatives": ["ബാലിക", "പെൺകൊടി"]
  },
  "house": {
    "malayalam": "വീട്",
    "english": "19. House",
    "parent_label": "Places",
    "needs_review": True,
    "alternatives": ["ഭവനം", "ഗൃഹം"]
  },
  "court": {
    "malayalam": "കോടതി",
    "english": "23. Court",
    "parent_label": "Places",
    "needs_review": True,
    "alternatives": ["ന്യായാസനം"]
  },
  "store_shop": {
    "malayalam": "കട",
    "english": "28. Store or Shop",
    "parent_label": "Places",
    "needs_review": True,
    "alternatives": ["അങ്ങാടി", "സ്റ്റോർ"]
  },
  "bank": {
    "malayalam": "ബാങ്ക്",
    "english": "35. Bank",
    "parent_label": "Places",
    "needs_review": True,
    "alternatives": ["ധനകാര്യ സ്ഥാപനം"]
  },
  "i": {
    "malayalam": "ഞാൻ",
    "english": "40. I",
    "parent_label": "Pronouns",
    "needs_review": True,
    "alternatives": ["എനിക്ക് (dative: to me)"]
  },
  "it": {
    "malayalam": "ഇത്",
    "english": "44. it",
    "parent_label": "Pronouns",
    "needs_review": True,
    "alternatives": ["അത് (that/distant)", "ഇത് (this/proximate)"]
  },
  "you_plural": {
    "malayalam": "നിങ്ങൾ",
    "english": "46. you (plural)",
    "parent_label": "Pronouns",
    "needs_review": True,
    "alternatives": ["നിങ്ങളെല്ലാവരും"]
  },
  "summer": {
    "malayalam": "വേനൽക്കാലം",
    "english": "61. Summer",
    "parent_label": "Seasons",
    "needs_review": True,
    "alternatives": ["വേനൽ", "ഉഷ്ണകാലം"]
  },
  "fall": {
    "malayalam": "ശരത്കാലം",
    "english": "64. Fall",
    "parent_label": "Seasons",
    "needs_review": True,
    "alternatives": ["ഇലപൊഴിയും കാലം (autumn season)", "വീഴുക (verb to fall)"]
  },
  "election": {
    "malayalam": "തിരഞ്ഞെടുപ്പ്",
    "english": "14. Election",
    "parent_label": "Society",
    "needs_review": True,
    "alternatives": ["വോട്ടെടുപ്പ്"]
  },
  "death": {
    "malayalam": "മരണം",
    "english": "2. Death",
    "parent_label": "Society",
    "needs_review": True,
    "alternatives": ["നിര്യാണം", "ചാാവ്"]
  }
}

print(f"Total entries in drafted labels_ml.json: {len(LABELS_DATA)}")
with open("labels_ml.json", "w", encoding="utf-8") as f:
    json.dump(LABELS_DATA, f, indent=2, ensure_ascii=False)

frontend_path = os.path.join("frontend", "src", "labels_ml.json")
with open(frontend_path, "w", encoding="utf-8") as f:
    json.dump(LABELS_DATA, f, indent=2, ensure_ascii=False)

print("Saved labels_ml.json to root and frontend/src/labels_ml.json successfully!")
