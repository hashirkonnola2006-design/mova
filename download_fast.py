import os
import sys
import time
import json
import zlib
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from remotezip import RemoteZip

MAP_FILE = "include50_map.json"
STATE_FILE = "download_state.json"
FAILURES_LOG = "download_failures.log"
DOWNLOAD_LOG = "download.log"
BASE_DIR = "include_videos"
BASE_ZENODO_URL = "https://zenodo.org/records/4010759/files"

DEMO_WORDS = [
    "hello", "good_morning", "thank_you", "good", "i", "you_plural",
    "father", "brother", "boy", "girl", "bank", "store_shop", "time"
]

lock = threading.RLock()

def log_to_file(filepath, msg):
    with lock:
        with open(filepath, "a", encoding="utf-8") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")

def load_state():
    with lock:
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
    with lock:
        try:
            with open(STATE_FILE + ".tmp", "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2)
            if os.path.exists(STATE_FILE):
                os.replace(STATE_FILE + ".tmp", STATE_FILE)
            else:
                os.rename(STATE_FILE + ".tmp", STATE_FILE)
        except Exception as e:
            pass

def process_archive(zip_name, items, state, completed_set, total_files, total_bytes_target):
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'curl/8.21.0',
        'Accept': '*/*'
    })
    
    zip_url = f"{BASE_ZENODO_URL}/{zip_name}"
    
    # Check if all items already completed
    all_done = True
    for slug, it in items:
        vpath = it["video_path"]
        expected_size = it["file_size"]
        target_file = os.path.join(BASE_DIR, slug, os.path.basename(vpath))
        if vpath not in completed_set or not (os.path.exists(target_file) and os.path.getsize(target_file) == expected_size):
            all_done = False
            break
            
    if all_done:
        return zip_name, 0
    
    remote_zip = None
    for attempt in range(5):
        try:
            remote_zip = RemoteZip(zip_url, session=session)
            break
        except Exception as e:
            backoff = 2 ** attempt
            log_to_file(FAILURES_LOG, f"Archive {zip_name} connect attempt {attempt+1} failed: {e}. Backoff {backoff}s")
            time.sleep(backoff)
            
    if remote_zip is None:
        log_to_file(FAILURES_LOG, f"CRITICAL: Failed to open archive {zip_name} after 5 attempts.")
        return zip_name, 0
    
    bytes_downloaded_archive = 0
    try:
        # Sort items: demo words first
        sorted_items = sorted(items, key=lambda x: (0 if x[0] in DEMO_WORDS else 1, x[0]))
        
        for slug, item_info in sorted_items:
            vpath = item_info["video_path"]
            expected_size = item_info["file_size"]
            fname = os.path.basename(vpath)
            
            target_dir = os.path.join(BASE_DIR, slug)
            os.makedirs(target_dir, exist_ok=True)
            target_file = os.path.join(target_dir, fname)
            
            with lock:
                if vpath in completed_set and os.path.exists(target_file) and os.path.getsize(target_file) == expected_size:
                    continue
                if os.path.exists(target_file) and os.path.getsize(target_file) == expected_size:
                    completed_set.add(vpath)
                    state["completed_files"] = list(completed_set)
                    save_state(state)
                    continue
            
            file_success = False
            for attempt in range(4):
                try:
                    zinfo = remote_zip.getinfo(vpath)
                    expected_crc = zinfo.CRC
                    
                    computed_crc = 0
                    downloaded_size = 0
                    
                    with remote_zip.open(vpath) as src_f, open(target_file + ".part", "wb") as dst_f:
                        while True:
                            chunk = src_f.read(128 * 1024)
                            if not chunk:
                                break
                            dst_f.write(chunk)
                            downloaded_size += len(chunk)
                            computed_crc = zlib.crc32(chunk, computed_crc)
                    
                    if downloaded_size != expected_size:
                        raise ValueError(f"Size mismatch: {downloaded_size} vs {expected_size}")
                    if computed_crc != expected_crc:
                        raise ValueError(f"CRC mismatch: {computed_crc} vs {expected_crc}")
                        
                    if os.path.exists(target_file):
                        os.remove(target_file)
                    os.rename(target_file + ".part", target_file)
                    
                    with lock:
                        completed_set.add(vpath)
                        state["completed_files"] = list(completed_set)
                        state["total_bytes_downloaded"] += downloaded_size
                        save_state(state)
                        
                    bytes_downloaded_archive += downloaded_size
                    file_success = True
                    break
                except Exception as e:
                    if os.path.exists(target_file + ".part"):
                        try:
                            os.remove(target_file + ".part")
                        except Exception:
                            pass
                    backoff = 2 ** (attempt + 1)
                    log_to_file(FAILURES_LOG, f"Attempt {attempt+1} failed for {vpath}: {e}")
                    time.sleep(backoff)
                    
            if not file_success:
                log_to_file(FAILURES_LOG, f"Permanent failure downloading {vpath}")
    finally:
        try:
            remote_zip.close()
        except Exception:
            pass
            
    return zip_name, bytes_downloaded_archive

def background_logger(state, target_vpaths, total_bytes_target, target_sizes, stop_event):
    start_time = time.time()
    total_files = len(target_vpaths)

    with open(DOWNLOAD_LOG, "a", encoding="utf-8") as f:
        f.write(f"\n=== DEMO SUBSET DOWNLOADER (13 WORDS) STARTED at {time.strftime('%Y-%m-%d %H:%M:%S')} ===\n")
        f.flush()

    def get_metrics():
        with lock:
            completed_set = set(state.get("completed_files", []))
        demo_completed = completed_set & target_vpaths
        done_files = len(demo_completed)
        done_bytes = sum(target_sizes.get(vp, 0) for vp in demo_completed)
        return done_files, done_bytes

    initial_files, initial_bytes = get_metrics()

    def write_log_entry():
        now = time.time()
        elapsed = now - start_time
        done_files, done_bytes = get_metrics()

        session_bytes = max(0, done_bytes - initial_bytes)
        speed_mbs = (session_bytes / (1024 * 1024)) / elapsed if elapsed > 1.0 else 0.0
        rem_bytes = max(0, total_bytes_target - done_bytes)
        rem_mins = (rem_bytes / (speed_mbs * 1024 * 1024 * 60)) if speed_mbs > 0 else 0.0

        # Check Greetings status
        greetings_slugs = ["hello", "good_morning", "thank_you"]
        g_done = True
        for g_slug in greetings_slugs:
            g_dir = os.path.join(BASE_DIR, g_slug)
            cnt = len([f for f in os.listdir(g_dir) if f.endswith(".MOV")]) if os.path.exists(g_dir) else 0
            if cnt < 21:
                g_done = False

        with lock:
            if g_done and not state.get("greetings_finished", False):
                state["greetings_finished"] = True
                save_state(state)

        log_line = (
            f"[{time.strftime('%H:%M:%S')}] "
            f"Demo Progress: {done_files}/{total_files} files ({done_bytes / (1024**3):.2f}/{total_bytes_target / (1024**3):.2f} GB) | "
            f"Speed: {speed_mbs:.2f} MB/s | "
            f"ETA: {rem_mins:.1f} mins | "
            f"Greetings: {'DONE' if g_done else 'IN PROGRESS'}"
        )
        with open(DOWNLOAD_LOG, "a", encoding="utf-8") as f:
            f.write(log_line + "\n")
            f.flush()

    # Log initial status immediately
    write_log_entry()
    
    while not stop_event.is_set():
        stop_event.wait(30.0)
        if not stop_event.is_set():
            write_log_entry()

def main():
    with open(MAP_FILE, "r", encoding="utf-8") as f:
        map_data = json.load(f)
        
    classes_map = map_data.get("classes", {})

    # Load conflicting videos to skip
    conflicts_set = set()
    if os.path.exists("shared_videos_report.json"):
        with open("shared_videos_report.json", "r", encoding="utf-8") as f:
            for item in json.load(f).get("shared_videos", []):
                labels = set(a["label"] for a in item.get("assignments", []))
                if len(labels) > 1:
                    conflicts_set.add(item["video_path"])

    zip_to_items = {}
    target_vpaths = set()
    total_bytes_target = 0

    for slug in DEMO_WORDS:
        zips = classes_map.get(slug, {})
        for zip_name, items in zips.items():
            for item in items:
                vpath = item["video_path"]
                if vpath in conflicts_set:
                    continue
                if zip_name not in zip_to_items:
                    zip_to_items[zip_name] = []
                zip_to_items[zip_name].append((slug, item))
                target_vpaths.add(vpath)
                total_bytes_target += item["file_size"]

    total_files = len(target_vpaths)

    # Priority sorting:
    # 1. Greetings zips first
    # 2. Other demo word zips
    def get_zip_priority(zname):
        return 0 if "Greetings" in zname else 1

    ordered_zips = sorted(list(zip_to_items.keys()), key=lambda z: (get_zip_priority(z), z))
    
    state = load_state()
    completed_set = set(state.get("completed_files", []))
    target_sizes = {it["video_path"]: it["file_size"] for items in zip_to_items.values() for s, it in items}
    stop_event = threading.Event()
    logger_thread = threading.Thread(
        target=background_logger,
        args=(state, target_vpaths, total_bytes_target, target_sizes, stop_event),
        daemon=True
    )
    logger_thread.start()
    
    # Download 3 archives in parallel
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(
                process_archive,
                zname,
                zip_to_items[zname],
                state,
                completed_set,
                total_files,
                total_bytes_target
            ): zname
            for zname in ordered_zips
        }
        for future in as_completed(futures):
            zname = futures[future]
            try:
                future.result()
            except Exception as e:
                log_to_file(FAILURES_LOG, f"Error in archive worker {zname}: {e}")
                
    stop_event.set()
    state["status"] = "completed"
    save_state(state)
    with open(DOWNLOAD_LOG, "a", encoding="utf-8") as f:
        f.write(f"=== DOWNLOAD FINISHED at {time.strftime('%Y-%m-%d %H:%M:%S')} ===\n")

if __name__ == "__main__":
    main()
