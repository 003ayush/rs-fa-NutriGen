import json
import base64
import os

with open("rs-fa2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

img_names = {
    25: "model_comparison.png",
    26: "training_history.png",
    27: "prediction_distributions.png",
    28: "predictions_vs_actual.png",
    29: "architecture_diagram.png"
}

for i, cell in enumerate(nb.get("cells", [])):
    for j, out in enumerate(cell.get("outputs", [])):
        data = out.get("data", {})
        if "image/png" in data:
            name = img_names.get(i, f"plot_cell_{i}.png")
            img_bytes = base64.b64decode(data["image/png"])
            with open(name, "wb") as f_out:
                f_out.write(img_bytes)
            print(f"Saved {name} ({len(img_bytes)} bytes)")

print("Extracted images done!")
