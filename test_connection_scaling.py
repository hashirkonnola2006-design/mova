import time
import sys
from concurrent.futures import ThreadPoolExecutor
import requests
from requests.adapters import HTTPAdapter

URL = "https://zenodo.org/records/4010759/files/Greetings_1of2.zip"
RANGE_BYTES = 30 * 1024 * 1024  # 30 MB

def run_worker(session, offset, worker_id):
    headers = {
        'User-Agent': 'curl/8.21.0',
        'Accept': '*/*',
        'Range': f'bytes={offset}-{offset + RANGE_BYTES - 1}'
    }
    t0 = time.time()
    res = session.get(URL, headers=headers, stream=True, timeout=60)
    if res.status_code != 206:
        raise ValueError(f"Worker {worker_id} got status {res.status_code}")
    
    total = 0
    for chunk in res.iter_content(chunk_size=256 * 1024):
        total += len(chunk)
    elapsed = time.time() - t0
    return total, elapsed

def test_connections(num_workers):
    print(f"\n--- Testing {num_workers} connection(s) (30 MB each, {num_workers * 30} MB total) ---", flush=True)
    session = requests.Session()
    adapter = HTTPAdapter(pool_connections=num_workers + 2, pool_maxsize=num_workers + 2)
    session.mount("https://", adapter)
    
    offsets = [i * 35 * 1024 * 1024 for i in range(num_workers)]
    
    t_start = time.time()
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = [
            executor.submit(run_worker, session, offset, i)
            for i, offset in enumerate(offsets)
        ]
        results = [f.result() for f in futures]
    t_total = time.time() - t_start
    
    total_bytes = sum(r[0] for r in results)
    total_mb = total_bytes / (1024 * 1024)
    speed_mbs = total_mb / t_total if t_total > 0 else 0
    print(f"-> {num_workers} connections: Transferred {total_mb:.1f} MB in {t_total:.2f}s | Aggregate Speed: {speed_mbs:.2f} MB/s", flush=True)
    return speed_mbs

def main():
    print("=" * 65, flush=True)
    print("ZENODO CONNECTION-SCALING TEST (30 MB range read per connection)", flush=True)
    print("=" * 65, flush=True)
    
    s1 = test_connections(1)
    s4 = test_connections(4)
    s8 = test_connections(8)
    
    print("\n" + "=" * 65, flush=True)
    print("CONNECTION SCALING SUMMARY:", flush=True)
    print(f"  1 connection:  {s1:.2f} MB/s", flush=True)
    print(f"  4 connections: {s4:.2f} MB/s ({s4/s1:.1f}x speedup)", flush=True)
    print(f"  8 connections: {s8:.2f} MB/s ({s8/s1:.1f}x speedup)", flush=True)
    print("=" * 65, flush=True)

if __name__ == "__main__":
    main()
