import json
import requests

DEMO_ZIPS = [
    'Adjectives_7of8.zip', 'Animals_1of2.zip', 'Days_and_Time_3of3.zip',
    'Electronics_1of2.zip', 'Greetings_1of2.zip', 'Greetings_2of2.zip',
    'People_1of5.zip', 'People_2of5.zip', 'People_4of5.zip',
    'Places_3of4.zip', 'Places_4of4.zip', 'Pronouns_1of2.zip',
    'Pronouns_2of2.zip', 'Seasons_1of1.zip'
]

session = requests.Session()
session.headers.update({'User-Agent': 'curl/8.21.0'})

print("Fetching whole-zip sizes for the 14 demo archives...")
total_zip_bytes = 0
for zname in DEMO_ZIPS:
    url = f"https://zenodo.org/records/4010759/files/{zname}"
    res = session.head(url, timeout=10)
    size = int(res.headers.get("content-length", 0))
    total_zip_bytes += size
    print(f"  {zname:<25}: {size / (1024**3):.2f} GB ({size / (1024**2):.1f} MB)")

print("-" * 50)
print(f"Total whole-zip download size for the 14 demo archives: {total_zip_bytes / (1024**3):.2f} GB")
