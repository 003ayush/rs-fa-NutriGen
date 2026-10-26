import json

with open("rs-fa2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

for i, cell in enumerate(nb.get("cells", [])):
    outputs = cell.get("outputs", [])
    if outputs:
        print(f"Cell {i} has {len(outputs)} outputs:")
        for out in outputs[:2]:
            if "text" in out:
                lines = "".join(out["text"])[:200].replace("\n", " ")
                print(f"  [text]: {lines}")
            elif "data" in out:
                print(f"  [data keys]: {list(out['data'].keys())}")
