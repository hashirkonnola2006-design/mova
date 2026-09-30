import time
import json
import os
import subprocess
import sys

STATE_FILE = "download_state.json"

print("Waiting for Greetings videos to finish downloading...")
last_count = 0

while True:
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                state = json.load(f)
            count = len(state.get("completed_files", []))
            g_done = state.get("greetings_finished", False)
            mb = state.get("total_bytes_downloaded", 0) / (1024 * 1024)
            
            if count != last_count:
                print(f"[{time.strftime('%H:%M:%S')}] Completed: {count}/63 Greetings | Total downloaded: {mb:.1f} MB")
                last_count = count
                
            if g_done:
                print("\n>>> GREETINGS DOWNLOAD FINISHED! Running Stage E timing measurement... <<<\n")
                subprocess.run([sys.executable, "measure_timing.py"], check=True)
                break
        except Exception as e:
            print(f"Warning reading state: {e}")
            
    time.sleep(10)
