import os
import sys
import glob
import json
import statistics
import cv2

GREETINGS_SLUGS = ["hello", "good_morning", "thank_you"]
VIDEOS_DIR = "include_videos"

def analyze_video(filepath):
    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        return None
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count_meta = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # Also count actual readable frames to verify against metadata
    actual_frames = 0
    while True:
        ret, _ = cap.read()
        if not ret:
            break
        actual_frames += 1
    
    cap.release()
    
    duration = actual_frames / fps if fps > 0 else 0
    return {
        "file": os.path.basename(filepath),
        "fps": fps,
        "frame_count_meta": frame_count_meta,
        "actual_frames": actual_frames,
        "width": width,
        "height": height,
        "duration_sec": duration
    }

def main():
    print("=" * 60)
    print("STAGE E: TIMING & TEMPORAL MEASUREMENT (GREETINGS VIDEOS)")
    print("=" * 60)
    
    all_results = []
    by_class = {}
    
    for slug in GREETINGS_SLUGS:
        slug_dir = os.path.join(VIDEOS_DIR, slug)
        if not os.path.exists(slug_dir):
            continue
        mov_files = sorted(glob.glob(os.path.join(slug_dir, "*.MOV")))
        by_class[slug] = []
        for f in mov_files:
            info = analyze_video(f)
            if info:
                info["slug"] = slug
                all_results.append(info)
                by_class[slug].append(info)
    
    if not all_results:
        print("No videos analyzed yet. Greetings download may still be starting.")
        return
    
    print(f"\nTotal Greetings videos analyzed: {len(all_results)} across {len(by_class)} classes")
    for slug, items in by_class.items():
        print(f"  - {slug}: {len(items)} clips")
        
    durations = [r["duration_sec"] for r in all_results]
    frame_counts = [r["actual_frames"] for r in all_results]
    fps_list = [r["fps"] for r in all_results]
    resolutions = set((r["width"], r["height"]) for r in all_results)
    
    summary = {
        "count": len(all_results),
        "fps_unique": list(set(fps_list)),
        "resolutions": [f"{w}x{h}" for w, h in resolutions],
        "duration": {
            "min": round(min(durations), 3),
            "median": round(statistics.median(durations), 3),
            "mean": round(statistics.mean(durations), 3),
            "max": round(max(durations), 3),
            "stdev": round(statistics.stdev(durations), 3) if len(durations) > 1 else 0
        },
        "frames": {
            "min": min(frame_counts),
            "median": int(statistics.median(frame_counts)),
            "mean": round(statistics.mean(frame_counts), 1),
            "max": max(frame_counts),
            "stdev": round(statistics.stdev(frame_counts), 1) if len(frame_counts) > 1 else 0
        }
    }
    
    print("\n--- MEASUREMENT SUMMARY ---")
    print(f"Resolutions: {summary['resolutions']}")
    print(f"Video FPS: {summary['fps_unique']}")
    print(f"Durations (seconds):")
    print(f"  Min:    {summary['duration']['min']:.2f} s")
    print(f"  Median: {summary['duration']['median']:.2f} s")
    print(f"  Mean:   {summary['duration']['mean']:.2f} s")
    print(f"  Max:    {summary['duration']['max']:.2f} s")
    print(f"  StdDev: {summary['duration']['stdev']:.2f} s")
    print(f"Frame Counts:")
    print(f"  Min:    {summary['frames']['min']} frames")
    print(f"  Median: {summary['frames']['median']} frames")
    print(f"  Mean:   {summary['frames']['mean']} frames")
    print(f"  Max:    {summary['frames']['max']} frames")
    print(f"  StdDev: {summary['frames']['stdev']} frames")
    
    # Detailed per-class stats
    print("\n--- PER-CLASS BREAKDOWN ---")
    for slug, items in by_class.items():
        if not items:
            continue
        c_dur = [it["duration_sec"] for it in items]
        c_frames = [it["actual_frames"] for it in items]
        print(f"{slug} (n={len(items)}):")
        print(f"  Duration: median={statistics.median(c_dur):.2f}s (min={min(c_dur):.2f}s, max={max(c_dur):.2f}s)")
        print(f"  Frames:   median={statistics.median(c_frames):.0f} (min={min(c_frames)}, max={max(c_frames)})")
    
    # Save results to json
    report = {
        "summary": summary,
        "per_class": {
            slug: {
                "count": len(items),
                "duration_median": statistics.median([it["duration_sec"] for it in items]) if items else 0,
                "frames_median": statistics.median([it["actual_frames"] for it in items]) if items else 0
            }
            for slug, items in by_class.items()
        },
        "clips": all_results
    }
    with open("stage_e_timing_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print("\nSaved detailed report to stage_e_timing_report.json")

if __name__ == "__main__":
    main()
