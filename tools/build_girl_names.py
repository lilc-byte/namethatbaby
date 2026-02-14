import csv
import json
from pathlib import Path

# Paths
base_dir = Path(__file__).resolve().parent
csv_path = base_dir / "girls.csv"
json_out = base_dir.parent / "src" / "data" / "girl-names.json"

MAX_NAMES = 1500  # adjust if you want more/less

names = []

with csv_path.open("r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

    # Expect columns: rank, name, alt_spellings, n_sum, n_percent, year_min, year_max, ...
    # Sort by rank ascending (1 = most popular)
    def sort_key(r):
        rank = r.get("rank")
        try:
            return int(rank)
        except (TypeError, ValueError):
            return 999999

    rows.sort(key=sort_key)

    for i, row in enumerate(rows[:MAX_NAMES], start=1):
        name = row.get("name", "").strip()
        if not name:
            continue

        names.append({
            "id": i,
            "name": name,
            "origin": "",
            "meaning": ""
        })

json_out.parent.mkdir(parents=True, exist_ok=True)
with json_out.open("w", encoding="utf-8") as f:
    json.dump(names, f, indent=2, ensure_ascii=False)

print(f"Wrote {len(names)} names to {json_out}")
