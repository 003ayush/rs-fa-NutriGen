import json

with open("rs-fa2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

with open("notebook_outputs_summary.txt", "w", encoding="utf-8") as out:
    for i, cell in enumerate(nb.get("cells", [])):
        outputs = cell.get("outputs", [])
        if outputs:
            out.write(f"\n{'='*30} CELL {i} OUTPUTS {'='*30}\n")
            for j, o in enumerate(outputs):
                out.write(f"-- Output {j} (type: {o.get('output_type')}) --\n")
                if "text" in o:
                    out.write("".join(o["text"]) + "\n")
                if "data" in o:
                    for mime, data in o["data"].items():
                        if mime == "text/plain":
                            out.write("".join(data) + "\n")
                        elif mime == "image/png":
                            out.write(f"[PNG Image data length: {len(data)}]\n")
                        elif mime == "text/html":
                            out.write(f"[HTML table data length: {len(data)}]\n")

print("Saved notebook_outputs_summary.txt successfully!")
