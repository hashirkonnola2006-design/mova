import json

DEMO_WORDS = [
    "hello", "good_morning", "thank_you", "good", "i", "you_plural",
    "father", "brother", "boy", "girl", "bank", "store_shop", "time"
]

with open("include50_map.json", "r", encoding="utf-8") as f:
    map_data = json.load(f)

classes_map = map_data["classes"]

# Identify archives containing demo words
zip_info = {}
for slug in DEMO_WORDS:
    if slug not in classes_map:
        continue
    for zname, items in classes_map[slug].items():
        if zname not in zip_info:
            zip_info[zname] = {
                "demo_slugs": set(),
                "selected_clips_count": 0,
                "selected_bytes": 0
            }
        zip_info[zname]["demo_slugs"].add(slug)
        zip_info[zname]["selected_clips_count"] += len(items)
        zip_info[zname]["selected_bytes"] += sum(it["file_size"] for it in items)

# Get whole zip archive size from zenodo record or map if available
# We can load the zip sizes from huggyface or estimate / get from zenodo
print("=" * 75)
print(f"DEMO WORDS ARCHIVE SURVEY ({len(DEMO_WORDS)} Demo Words)")
print("=" * 75)

total_selected_clips = 0
total_selected_bytes = 0

for zname in sorted(zip_info.keys()):
    info = zip_info[zname]
    slugs_str = ", ".join(sorted(info["demo_slugs"]))
    cnt = info["selected_clips_count"]
    mb = info["selected_bytes"] / (1024 * 1024)
    total_selected_clips += cnt
    total_selected_bytes += info["selected_bytes"]
    print(f"Archive: {zname:<25} | Demo words: {slugs_str:<30} | {cnt:>2} clips | {mb:>6.1f} MB")

print("-" * 75)
print(f"TOTAL FOR 13 DEMO WORDS: {total_selected_clips} clips | {total_selected_bytes / (1024**3):.2f} GB")
print(f"Number of distinct archives containing demo words: {len(zip_info)}")
