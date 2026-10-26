import json
import os

nb_path = r"C:\Users\LEGION\.gemini\antigravity-ide\scratch\rs_app\rs-fa2.ipynb"
with open(nb_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

print(f"Total cells: {len(nb.get('cells', []))}")
for i, cell in enumerate(nb.get("cells", [])):
    cell_type = cell.get("cell_type")
    source = "".join(cell.get("source", []))
    first_lines = "\n".join(source.splitlines()[:3])
    print(f"--- Cell {i} [{cell_type}] ---")
    print(first_lines)
