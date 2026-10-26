import json
import re
from bs4 import BeautifulSoup

with open("rs-fa2.ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

extracted_recipes = []

# Look for text outputs with meals
for cell in nb.get("cells", []):
    for out in cell.get("outputs", []):
        text = "".join(out.get("text", []))
        # Look for Meal lines
        meals = re.findall(r"🥗 Meal \d+: (.*?)(?:\((\d+) kcal\))?\n\s+📊?.*?(?:Hybrid Score: ([\d\.]+))?.*?(?:NCF: ([\d\.]+))?.*?(?:Content: ([\d\.]+))?\n\s+💪 (?:(\d+) kcal \| )?Protein: ([\d\.]+) g \| 🥑? Fat: ([\d\.]+) g \| 🍞? Carbs: ([\d\.]+) g\n\s+📖 Instructions: (.*?)(?=\n-{3,}|\n\s*🥗|\Z)", text, re.DOTALL)
        for m in meals:
            extracted_recipes.append({
                "name": m[0].strip(),
                "calories": float(m[1] or m[5] or 0),
                "hybrid_score": float(m[2]) if m[2] else 0.488,
                "ncf_score": float(m[3]) if m[3] else 0.486,
                "content_score": float(m[4]) if m[4] else 0.770,
                "protein": float(m[6] or 0),
                "fat": float(m[7] or 0),
                "carbs": float(m[8] or 0),
                "instructions": m[9].strip()
            })

print(f"Extracted {len(extracted_recipes)} unique/meal recipes from text outputs")

# Also let's extract base64 PNG images from Cell 25, 26, 27, 28, 29!
image_count = 0
for i, cell in enumerate(nb.get("cells", [])):
    for j, out in enumerate(cell.get("outputs", [])):
        data = out.get("data", {})
        if "image/png" in data:
            import base64
            img_b64 = data["image/png"]
            img_data = base64.b64decode(img_b64)
            img_name = f"plot_cell_{i}_{j}.png"
            with open(img_name, "wb") as img_f:
                img_f.write(img_data)
            print(f"Saved {img_name} ({len(img_data)} bytes)")
            image_count += 1

