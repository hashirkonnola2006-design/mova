import sys
import json
import urllib.request
import urllib.error

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def test_api():
    print("Testing Collector API endpoints...")
    base_url = "http://127.0.0.1:8000"

    # 1. Invalid shape test: should return 400 Bad Request
    bad_payload = {
        "label": "hello",
        "person": "tester",
        "sequence": [[0.0] * 50 for _ in range(10)]
    }
    req = urllib.request.Request(
        f"{base_url}/api/samples",
        data=json.dumps(bad_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        urllib.request.urlopen(req)
        assert False, "Should have failed with 400 Bad Request"
    except urllib.error.HTTPError as e:
        assert e.code == 400
        print(f"✓ Invalid shape rejected with 400 Bad Request: {e.read().decode('utf-8')}")

    # 2. Invalid label test: should return 400 Bad Request
    bad_label_payload = {
        "label": "unknown_label_123",
        "person": "tester",
        "sequence": [[0.0] * 126 for _ in range(30)]
    }
    req = urllib.request.Request(
        f"{base_url}/api/samples",
        data=json.dumps(bad_label_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        urllib.request.urlopen(req)
        assert False, "Should have failed with 400 Bad Request"
    except urllib.error.HTTPError as e:
        assert e.code == 400
        print(f"✓ Invalid label rejected with 400 Bad Request: {e.read().decode('utf-8')}")

    # 3. Valid sample test
    valid_payload = {
        "label": "hello",
        "person": "tester",
        "sequence": [[0.0] * 126 for _ in range(30)]
    }
    req = urllib.request.Request(
        f"{base_url}/api/samples",
        data=json.dumps(valid_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    assert res.status == 200
    res_data = json.loads(res.read().decode('utf-8'))
    print(f"✓ Valid sample accepted and saved: {res_data}")
    assert res_data["status"] == "ok"
    assert res_data["label"] == "hello"

    # 4. Check counts endpoint
    res_counts = urllib.request.urlopen(f"{base_url}/api/samples/counts")
    counts = json.loads(res_counts.read().decode('utf-8'))
    assert counts["counts_by_label"]["hello"] >= 1
    assert "tester" in counts["counts_by_person"]
    print(f"✓ Counts endpoint returns updated breakdown: {counts['counts_by_label']['hello']} samples for 'hello'")

    # 5. Delete last sample test
    del_req = urllib.request.Request(
        f"{base_url}/api/samples/delete-last",
        data=json.dumps({"label": "hello", "person": "tester"}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    del_res = urllib.request.urlopen(del_req)
    del_data = json.loads(del_res.read().decode('utf-8'))
    print(f"✓ Delete last sample successful: {del_data}")
    assert del_data["status"] == "ok"

    print("\n>>> ALL COLLECTOR API TESTS PASSED SUCCESSFULLY! <<<")


if __name__ == "__main__":
    test_api()
