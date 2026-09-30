import sys
import json
import pandas as pd
from datasets import load_dataset

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def main():
    ds = load_dataset('ai4bharat/INCLUDE')
    df = pd.concat([ds[s].to_pandas().assign(split=s) for s in ['train', 'val', 'test']])
    inc = df[df['include_50'] == True]

    shared = []
    cross_split_issues = []

    for vpath, grp in inc.groupby('video_path'):
        if len(grp) > 1:
            labels_info = grp[['parent_label', 'label', 'split']].to_dict(orient='records')
            unique_splits = grp['split'].unique().tolist()
            if len(unique_splits) > 1:
                cross_split_issues.append({'video_path': vpath, 'assignments': labels_info})
            shared.append({
                'video_path': vpath,
                'occurrences': len(grp),
                'splits': unique_splits,
                'assignments': labels_info
            })

    print(f"Total shared physical video files: {len(shared)}")
    print(f"Videos appearing across multiple splits (e.g. train AND test): {len(cross_split_issues)}")

    with open('shared_videos_report.json', 'w', encoding='utf-8') as f:
        json.dump({'shared_videos': shared, 'cross_split_issues': cross_split_issues}, f, indent=2)

    print("\nDetailed list of the 15 shared videos:")
    print("=" * 80)
    for i, s in enumerate(shared, 1):
        print(f"{i:2d}. Path: {s['video_path']}")
        for a in s['assignments']:
            print(f"    - Assigned Class: '{a['label']}' | Category: {a['parent_label']} | Split: {a['split']}")
        if len(s['splits']) > 1:
            print(f"    ⚠️ WARNING: Crosses splits: {s['splits']}")
        else:
            print(f"    ✓ Stays within split: {s['splits'][0]}")
        print()

if __name__ == '__main__':
    main()
