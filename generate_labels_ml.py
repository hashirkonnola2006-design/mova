import json
import os

with open("class_slugs.json", "r", encoding="utf-8") as f:
    class_slugs = json.load(f)

# Comprehensive Malayalam draft mappings with parent labels, English names, and context alternatives
DRAFTS = {
    "bank": {
        "english": "Bank",
        "malayalam": "ബാങ്ക്",
        "alternatives": []
    },
    "big_large": {
        "english": "big large",
        "malayalam": "വലിയത്",
        "alternatives": ["വലുത്"]
    },
    "bird": {
        "english": "Bird",
        "malayalam": "പക്ഷി",
        "alternatives": ["കിളി"]
    },
    "black": {
        "english": "Black",
        "malayalam": "കറുപ്പ്",
        "alternatives": ["കറുത്ത"]
    },
    "boy": {
        "english": "Boy",
        "malayalam": "ആൺകുട്ടി",
        "alternatives": []
    },
    "brother": {
        "english": "Brother",
        "malayalam": "സഹോദരൻ",
        "alternatives": ["അനിയൻ", "ജ്യേഷ്ഠൻ"]
    },
    "car": {
        "english": "Car",
        "malayalam": "കാർ",
        "alternatives": ["വാഹനം"]
    },
    "cell_phone": {
        "english": "Cell phone",
        "malayalam": "മൊബൈൽ ഫോൺ",
        "alternatives": ["ഫോൺ"]
    },
    "court": {
        "english": "Court",
        "malayalam": "കോടതി",
        "alternatives": []
    },
    "cow": {
        "english": "Cow",
        "malayalam": "പശു",
        "alternatives": ["മാട്"]
    },
    "death": {
        "english": "Death",
        "malayalam": "മരണം",
        "alternatives": ["നിര്യാണം"]
    },
    "dog": {
        "english": "Dog",
        "malayalam": "പട്ടി",
        "alternatives": ["നായ"]
    },
    "dry": {
        "english": "dry",
        "malayalam": "ഉണങ്ങിയത്",
        "alternatives": ["വരണ്ടത്", "ഉണങ്ങിയ"]
    },
    "election": {
        "english": "Election",
        "malayalam": "തിരഞ്ഞെടുപ്പ്",
        "alternatives": ["ഇലക്ഷൻ"]
    },
    "fall": {
        "english": "Fall",
        "malayalam": "ശരത്കാലം",
        "alternatives": ["വീഴ്ച", "വീഴുക"]
    },
    "fan": {
        "english": "Fan",
        "malayalam": "ഫാൻ",
        "alternatives": ["വിശറി"]
    },
    "father": {
        "english": "Father",
        "malayalam": "അച്ഛൻ",
        "alternatives": ["പിതാവ്"]
    },
    "girl": {
        "english": "Girl",
        "malayalam": "പെൺകുട്ടി",
        "alternatives": []
    },
    "good": {
        "english": "good",
        "malayalam": "നല്ലത്",
        "alternatives": ["നല്ല"]
    },
    "good_morning": {
        "english": "Good Morning",
        "malayalam": "ശുഭോദയം",
        "alternatives": ["പ്രഭാതവന്ദനം"]
    },
    "happy": {
        "english": "happy",
        "malayalam": "സന്തോഷം",
        "alternatives": ["സന്തോഷമുള്ള"]
    },
    "hat": {
        "english": "Hat",
        "malayalam": "തൊപ്പി",
        "alternatives": []
    },
    "hello": {
        "english": "Hello",
        "malayalam": "നമസ്കാരം",
        "alternatives": []
    },
    "hot": {
        "english": "hot",
        "malayalam": "ചൂട്",
        "alternatives": ["ചൂടുള്ള"]
    },
    "house": {
        "english": "House",
        "malayalam": "വീട്",
        "alternatives": ["ഭവനം"]
    },
    "i": {
        "english": "I",
        "malayalam": "ഞാൻ",
        "alternatives": ["എനിക്ക്"]
    },
    "it": {
        "english": "it",
        "malayalam": "അത്",
        "alternatives": ["ഇത്"]
    },
    "long": {
        "english": "long",
        "malayalam": "നീളമുള്ളത്",
        "alternatives": ["ദീർഘമായ"]
    },
    "loud": {
        "english": "loud",
        "malayalam": "ഉച്ചത്തിൽ",
        "alternatives": ["വലിയ ശബ്ദം"]
    },
    "monday": {
        "english": "Monday",
        "malayalam": "തിങ്കളാഴ്ച",
        "alternatives": ["തിങ്കൾ"]
    },
    "new": {
        "english": "new",
        "malayalam": "പുതിയത്",
        "alternatives": ["പുത്തൻ"]
    },
    "paint": {
        "english": "Paint",
        "malayalam": "പെയിന്റ്",
        "alternatives": ["നിറം", "ചായം"]
    },
    "pen": {
        "english": "Pen",
        "malayalam": "പേന",
        "alternatives": []
    },
    "priest": {
        "english": "Priest",
        "malayalam": "പുരോഹിതൻ",
        "alternatives": ["പൂജാരി", "അച്ചൻ"]
    },
    "quiet": {
        "english": "quiet",
        "malayalam": "ശാന്തം",
        "alternatives": ["നിശബ്ദം"]
    },
    "red": {
        "english": "Red",
        "malayalam": "ചുവപ്പ്",
        "alternatives": ["ചുവന്ന"]
    },
    "shoes": {
        "english": "Shoes",
        "malayalam": "ഷൂസ്",
        "alternatives": ["പാദരക്ഷകൾ", "ചെരുപ്പ്"]
    },
    "short": {
        "english": "short",
        "malayalam": "നീളം കുറഞ്ഞത്",
        "alternatives": ["കുറിയത്"]
    },
    "small_little": {
        "english": "small little",
        "malayalam": "ചെറിയത്",
        "alternatives": ["ചെറുത്"]
    },
    "store_shop": {
        "english": "Store or Shop",
        "malayalam": "കട",
        "alternatives": ["അങ്ങാടി"]
    },
    "summer": {
        "english": "Summer",
        "malayalam": "വേനൽക്കാലം",
        "alternatives": ["വേനൽ"]
    },
    "teacher": {
        "english": "Teacher",
        "malayalam": "അധ്യാപകൻ",
        "alternatives": ["അധ്യാപിക", "ഗുരു"]
    },
    "thank_you": {
        "english": "Thank you",
        "malayalam": "നന്ദി",
        "alternatives": []
    },
    "time": {
        "english": "Time",
        "malayalam": "സമയം",
        "alternatives": ["നേരം"]
    },
    "train_ticket": {
        "english": "train ticket",
        "malayalam": "ട്രെയിൻ ടിക്കറ്റ്",
        "alternatives": ["തീവണ്ടി ടിക്കറ്റ്"]
    },
    "tshirt": {
        "english": "T-Shirt",
        "malayalam": "ടി-ഷർട്ട്",
        "alternatives": ["കുപ്പായം"]
    },
    "white": {
        "english": "White",
        "malayalam": "വെള്ള",
        "alternatives": ["വെളുപ്പ്"]
    },
    "window": {
        "english": "Window",
        "malayalam": "ജനൽ",
        "alternatives": ["ജനാല"]
    },
    "year": {
        "english": "Year",
        "malayalam": "വർഷം",
        "alternatives": ["ആണ്ട്", "കൊല്ലം"]
    },
    "you_plural": {
        "english": "you (plural)",
        "malayalam": "നിങ്ങൾ",
        "alternatives": ["നിങ്ങളെ"]
    }
}

labels_ml = {}
for slug in sorted(class_slugs.keys()):
    meta = class_slugs[slug]
    draft = DRAFTS.get(slug, {
        "english": meta["label"],
        "malayalam": slug,
        "alternatives": []
    })
    labels_ml[slug] = {
        "english": draft["english"],
        "parent_label": meta["parent_label"],
        "label": meta["label"],
        "malayalam": draft["malayalam"],
        "needs_review": True,
        "alternatives": draft["alternatives"]
    }

# Idle entry: MUST have an empty display string per user specification
labels_ml["idle"] = {
    "english": "Idle",
    "parent_label": "System",
    "label": "Idle",
    "malayalam": "",
    "needs_review": True,
    "alternatives": []
}

# Write to root
with open("labels_ml.json", "w", encoding="utf-8") as f:
    json.dump(labels_ml, f, ensure_ascii=False, indent=2)

# Write to frontend/src/
frontend_path = os.path.join("frontend", "src", "labels_ml.json")
if os.path.exists(os.path.dirname(frontend_path)):
    with open(frontend_path, "w", encoding="utf-8") as f:
        json.dump(labels_ml, f, ensure_ascii=False, indent=2)

print(f"Successfully generated labels_ml.json with {len(labels_ml)} classes (50 INCLUDE-50 + idle)!")
