import os
import sys
import time
import json
import zlib
import requests
from remotezip import RemoteZip

MAP_FILE = "include50_map.json"
STATE_FILE = "download_state.json"
FAILURES_LOG = "download_failures.log"
BASE_DIR = "include_videos"
BASE_ZENODO_URL = "https://zenodo.org/records/4010759/files"

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def log_failure(msg):
    with open(FAILURES_LOG, "a", encoding="utf-8") as f:
        f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")


def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "completed_files": [],
        "total_bytes_downloaded": 0,
        "greetings_finished": False,
        "start_time": time.time(),
        "status": "in_progress"
    }


def save_state(state):
    try:
        with open(STATE_FILE + ".tmp", "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
        if os.path.exists(STATE_FILE):
            os.replace(STATE_FILE + ".tmp", STATE_FILE)
        else:
            os.rename(STATE_FILE + ".tmp", STATE_FILE)
    except Exception as e:
        print(f"Warning: Failed to save state: {e}")


def main():
    print("=================== INCLUDE-50 VIDEO DOWNLOADER ===================")
    if not os.path.exists(MAP_FILE):
        print(f"Error: {MAP_FILE} not found!")
        sys.exit(1)

    with open(MAP_FILE, "r", encoding="utf-8") as f:
        map_data = json.load(f)

    classes_map = map_data["classes"]
    state = load_state()
    completed_set = set(state.get("completed_files", []))

    session = requests.Session()
    session.headers.update({
        'User-Agent': 'curl/8.21.0',
        'Accept': '*/*'
    })

    # Group files by Zip archive
    # Requirement: Greetings zips FIRST, then the rest
    zip_to_items = {}
    for slug, zips in classes_map.items():
        for zip_name, items in zips.items():
            if zip_name not in zip_to_items:
                zip_to_items[zip_name] = []
            for item in items:
                zip_to_items[zip_name].append((slug, item))

    # Order zip archives: Greetings first, then sorted
    all_zips = sorted(list(zip_to_items.keys()))
    greetings_zips = [z for z in all_zips if "Greetings" in z]
    other_zips = [z for z in all_zips if "Greetings" not in z]
    ordered_zips = greetings_zips + other_zips

    total_files = sum(len(items) for items in zip_to_items.values())
    total_bytes_target = map_data["metadata"]["total_uncompressed_bytes"]

    print(f"Total target files: {total_files} | Total size: {total_bytes_target / (1024**3):.2f} GB")
    print(f"Priority queue: Greetings zips ({len(greetings_zips)}) FIRST, then other zips ({len(other_zips)}).")
    print(f"Already completed files: {len(completed_set)}")

    bytes_downloaded_session = 0
    start_time = time.time()
    speed_500mb_reported = False

    for zip_idx, zip_name in enumerate(ordered_zips, 1):
        zip_url = f"{BASE_ZENODO_URL}/{zip_name}"
        items = zip_to_items[zip_name]
        is_greetings = "Greetings" in zip_name

        print(f"\n[{zip_idx}/{len(ordered_zips)}] Processing archive {zip_name} ({len(items)} videos)...")

        # Open remote zip
        remote_zip = None
        for attempt in range(5):
            try:
                remote_zip = RemoteZip(zip_url, session=session)
                break
            except Exception as e:
                backoff = 2 ** attempt
                print(f"  Connection attempt {attempt+1} failed for {zip_name}: {e}. Retrying in {backoff}s...")
                time.sleep(backoff)

        if remote_zip is None:
            log_failure(f"Could not open remote zip: {zip_name}")
            continue

        try:
            for item_idx, (slug, item_info) in enumerate(items, 1):
                vpath = item_info["video_path"]
                expected_size = item_info["file_size"]
                fname = os.path.basename(vpath)

                target_dir = os.path.join(BASE_DIR, slug)
                os.makedirs(target_dir, exist_ok=True)
                target_file = os.path.join(target_dir, fname)

                # Check if already exists and size matches
                if vpath in completed_set and os.path.exists(target_file):
                    if os.path.getsize(target_file) == expected_size:
                        continue

                if os.path.exists(target_file) and os.path.getsize(target_file) == expected_size:
                    completed_set.add(vpath)
                    state["completed_files"] = list(completed_set)
                    save_state(state)
                    continue

                # Download file with retries
                file_downloaded = False
                for attempt in range(4):
                    try:
                        # Find ZipInfo
                        zinfo = remote_zip.getinfo(vpath)
                        expected_crc = zinfo.CRC

                        computed_crc = 0
                        downloaded_size = 0

                        with remote_zip.open(vpath) as src_f, open(target_file + ".part", "wb") as dst_f:
                            while True:
                                chunk = src_f.read(64 * 1024)
                                if not chunk:
                                    break
                                dst_f.write(chunk)
                                downloaded_size += len(chunk)
                                bytes_downloaded_session += len(chunk)
                                computed_crc = zlib.crc32(chunk, computed_crc)

                        # Check size
                        if downloaded_size != expected_size:
                            raise ValueError(f"Size mismatch: got {downloaded_size}, expected {expected_size}")

                        # Check CRC
                        if computed_crc != expected_crc:
                            raise ValueError(f"CRC mismatch: got {computed_crc}, expected {expected_crc}")

                        # Atomically rename
                        if os.path.exists(target_file):
                            os.remove(target_file)
                        os.rename(target_file + ".part", target_file)

                        completed_set.add(vpath)
                        state["completed_files"] = list(completed_set)
                        state["total_bytes_downloaded"] += downloaded_size
                        save_state(state)
                        file_downloaded = True

                        # Report speed after first 500 MB
                        if not speed_500mb_reported and bytes_downloaded_session >= 500 * 1024 * 1024:
                            elapsed = time.time() - start_time
                            speed_mb = (bytes_downloaded_session / (1024 * 1024)) / elapsed
                            remaining_bytes = total_bytes_target - state["total_bytes_downloaded"]
                            est_sec = remaining_bytes / (speed_mb * 1024 * 1024) if speed_mb > 0 else 0
                            print(f"\n>>> [500 MB MILESTONE] Average speed: {speed_mb:.2f} MB/s | Est. total remaining time: {est_sec / 60:.1f} mins <<<\n")
                            speed_500mb_reported = True

                        sys.stdout.write(f"\r  Downloaded: {len(completed_set)}/{total_files} | {fname} ({expected_size / 1024:.0f} KB) OK")
                        sys.stdout.flush()

                        # Polite inter-video pause
                        time.sleep(0.1)
                        break

                    except Exception as e:
                        if os.path.exists(target_file + ".part"):
                            try:
                                os.remove(target_file + ".part")
                            except Exception:
                                pass
                        backoff = 2 ** (attempt + 1)
                        log_failure(f"Attempt {attempt+1} failed for {vpath}: {e}")
                        time.sleep(backoff)

                if not file_downloaded:
                    print(f"\n  Failed to download {vpath} after 4 attempts. Logged to {FAILURES_LOG}.")

        finally:
            try:
                remote_zip.close()
            except Exception:
                pass

        # Check if Greetings finished
        if is_greetings and zip_idx == len(greetings_zips):
            # Verify all Greetings clips are on disk
            greetings_slugs = ["hello", "good_morning", "thank_you"]
            all_g_done = True
            for g_slug in greetings_slugs:
                g_dir = os.path.join(BASE_DIR, g_slug)
                cnt = len([f for f in os.listdir(g_dir) if f.endswith(".MOV")]) if os.path.exists(g_dir) else 0
                if cnt < 21:
                    all_g_done = False

            if all_g_done:
                print("\n\n>>> ALL GREETINGS VIDEOS FINISHED DOWNLOADING! Flagging state. <<<")
                state["greetings_finished"] = True
                save_state(state)

    state["status"] = "completed"
    save_state(state)
    print("\n\n=================== DOWNLOAD JOB FINISHED ===================")


if __name__ == "__main__":
    main()
