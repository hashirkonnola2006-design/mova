import json
import time
import sys
import os
import requests
from remotezip import RemoteZip
from datasets import load_dataset

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def main():
    print("=================== BUILDING INCLUDE-50 VIDEO MAP ===================")

    # 1. Load slugs map
    with open('class_slugs.json', 'r', encoding='utf-8') as f:
        slugs_dict = json.load(f)

    # Invert mapping: (parent_label, label) -> slug
    parent_label_to_slug = {}
    for slug, info in slugs_dict.items():
        parent_label_to_slug[(info['parent_label'], info['label'])] = slug

    # 2. Load Hugging Face INCLUDE dataset (include_50 == True)
    print("Loading HF dataset table...")
    ds_dict = load_dataset('ai4bharat/INCLUDE')
    target_videos = {} # video_path -> { slug, parent_label, label, split }
    
    for split_name in ['train', 'val', 'test']:
        for row in ds_dict[split_name]:
            if row['include_50']:
                vpath = row['video_path'].replace('\\', '/')
                slug = parent_label_to_slug.get((row['parent_label'], row['label']))
                target_videos[vpath] = {
                    'slug': slug,
                    'parent_label': row['parent_label'],
                    'label': row['label'],
                    'split': split_name,
                    'video_path': vpath
                }

    print(f"Total target videos for include_50: {len(target_videos)} across {len(slugs_dict)} classes.")

    # 3. List of all 44 category zip files on Zenodo
    # Derived from Zenodo record 4010759
    zip_categories = [
        ("Adjectives", 8),
        ("Animals", 2),
        ("Clothes", 2),
        ("Colours", 2),
        ("Days_and_Time", 3),
        ("Electronics", 2),
        ("Greetings", 2),
        ("Home", 4),
        ("Jobs", 2),
        ("Means_of_Transportation", 2),
        ("People", 5),
        ("Places", 4),
        ("Pronouns", 2),
        ("Seasons", 1),
        ("Society", 3),
    ]

    all_zip_files = []
    for cat, count in zip_categories:
        if count == 1:
            all_zip_files.append(f"{cat}_1of1.zip")
        else:
            for i in range(1, count + 1):
                all_zip_files.append(f"{cat}_{i}of{count}.zip")

    print(f"Total zip files to query remotely: {len(all_zip_files)}")

    session = requests.Session()
    session.headers.update({
        'User-Agent': 'curl/8.21.0',
        'Accept': '*/*'
    })

    # Results mapping
    # include50_map: slug -> { zip_name: { paths: [ { path, size, split } ] } }
    matched_videos = {}
    zip_matches = {} # zip_name -> list of matched paths
    total_size_bytes = 0

    base_url = "https://zenodo.org/records/4010759/files"

    for idx, zip_name in enumerate(all_zip_files, 1):
        zip_url = f"{base_url}/{zip_name}"
        sys.stdout.write(f"[{idx:02d}/{len(all_zip_files)}] Scanning {zip_name:<32} ... ")
        sys.stdout.flush()

        # Retry loop for resilience
        success = False
        for attempt in range(3):
            try:
                with RemoteZip(zip_url, session=session) as z:
                    zip_entries = z.infolist()
                    count_in_zip = 0

                    for entry in zip_entries:
                        epath = entry.filename.replace('\\', '/')
                        if epath in target_videos:
                            count_in_zip += 1
                            meta = target_videos[epath]
                            slug = meta['slug']

                            if slug not in matched_videos:
                                matched_videos[slug] = {}
                            if zip_name not in matched_videos[slug]:
                                matched_videos[slug][zip_name] = []

                            video_info = {
                                'video_path': epath,
                                'file_size': entry.file_size,
                                'compress_size': entry.compress_size,
                                'split': meta['split'],
                                'label': meta['label'],
                                'parent_label': meta['parent_label']
                            }
                            matched_videos[slug][zip_name].append(video_info)
                            total_size_bytes += entry.file_size

                    if count_in_zip > 0:
                        zip_matches[zip_name] = count_in_zip
                        print(f"FOUND {count_in_zip:3d} clips")
                    else:
                        print("0 clips")

                    success = True
                    break

            except Exception as e:
                time.sleep(1.5 * (attempt + 1))
                if attempt == 2:
                    print(f"FAILED: {e}")

        # Polite rate-limiting delay between requests
        time.sleep(0.3)

    # Check for missing clips per class
    print("\n=================== SCAN RESULTS ===================")
    print(f"Zips containing include_50 clips ({len(zip_matches)} zips):")
    for zname, cnt in sorted(zip_matches.items()):
        print(f"  {zname:<35} : {cnt:3d} clips")

    total_matched_clips = sum(
        len(v) for s in matched_videos.values() for v in s.values()
    )
    total_size_gb = total_size_bytes / (1024**3)
    total_size_mb = total_size_bytes / (1024**2)

    print(f"\nTotal selected videos matched: {total_matched_clips} / {len(target_videos)}")
    print(f"Total uncompressed download size: {total_size_gb:.3f} GB ({total_size_mb:.1f} MB)")

    # Check any missing classes or clips
    missing_classes = []
    partially_missing = []
    for slug, info in slugs_dict.items():
        if slug not in matched_videos:
            missing_classes.append(slug)
        else:
            clips_found = sum(len(paths) for paths in matched_videos[slug].values())
            # Find expected from target_videos
            expected = sum(1 for v in target_videos.values() if v['slug'] == slug)
            if clips_found < expected:
                partially_missing.append((slug, clips_found, expected))

    if missing_classes:
        print(f"\n⚠️ Completely missing classes: {missing_classes}")
    else:
        print("\n✓ No completely missing classes!")

    if partially_missing:
        print(f"⚠️ Partially missing clips: {partially_missing}")
    else:
        print("✓ All 50 classes have 100% of their clips matched (958/958)!")

    # Write include50_map.json
    output_map = {
        "metadata": {
            "total_classes": len(slugs_dict),
            "total_clips": total_matched_clips,
            "total_uncompressed_bytes": total_size_bytes,
            "total_uncompressed_gb": round(total_size_gb, 3),
            "total_zips_involved": len(zip_matches)
        },
        "classes": matched_videos
    }

    with open('include50_map.json', 'w', encoding='utf-8') as f:
        json.dump(output_map, f, indent=2, ensure_ascii=False)

    print("\nSaved include50_map.json successfully!")


if __name__ == '__main__':
    main()
