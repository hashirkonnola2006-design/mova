import time
import requests

URL = "https://zenodo.org/records/4010759/files/Greetings_1of2.zip"
HEADERS = {
    'User-Agent': 'curl/8.21.0',
    'Accept': '*/*',
    'Range': 'bytes=0-104857599'  # Exactly 100 MB (100 * 1024 * 1024 - 1 bytes)
}

print("Measuring raw throughput for a 100 MB range read from Zenodo...")
t0 = time.time()
res = requests.get(URL, headers=HEADERS, stream=True, timeout=30)

if res.status_code != 206:
    print(f"Error: Unexpected status code {res.status_code}")
    exit(1)

total_bytes = 0
for chunk in res.iter_content(chunk_size=1024 * 1024):
    total_bytes += len(chunk)

t1 = time.time()
elapsed = t1 - t0
mb = total_bytes / (1024 * 1024)
speed_mbs = mb / elapsed if elapsed > 0 else 0

print(f"Downloaded: {mb:.2f} MB in {elapsed:.2f} s")
print(f"Raw Throughput: {speed_mbs:.2f} MB/s")
