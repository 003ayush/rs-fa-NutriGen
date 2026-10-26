import json

with open("rs-fa2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

with open("extracted_code.py", "w", encoding="utf-8") as f:
    for i, cell in enumerate(nb.get("cells", [])):
        f.write(f"# {'='*20} CELL {i} ({cell.get('cell_type')}) {'='*20}\n")
        f.write("".join(cell.get("source", [])) + "\n\n")

print("Done extracting!")
