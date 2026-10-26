import json
import re

with open("notebook_outputs_summary.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Pattern for Meal entries in Cell 11 and Cell 32
# Example:
# 🥗 Meal 1: Fresh Corn Risotto
#    📊 Hybrid Score: 0.4891 | NCF: 0.4866 | Content: 0.7762
#    💪 332 kcal | Protein: 12.0 g | Fat: 11.1 g | Carbs: 47.5 g
#    📖 Instructions: Reserve 12 the quantity of kernels...

pattern = re.compile(
    r"🥗 Meal \d+:\s*(.*?)(?:\s*\((\d+(?:\.\d+)?)\s*kcal\))?\n"
    r"(?:\s*📊 Hybrid Score:\s*([\d\.]+)\s*\|\s*NCF:\s*([\d\.]+)\s*\|\s*Content:\s*([\d\.]+)\n)?"
    r"\s*(?:💪\s*(?:(\d+(?:\.\d+)?)\s*kcal\s*\|\s*)?Protein:\s*([\d\.]+)\s*g\s*\|\s*(?:🥑\s*)?Fat:\s*([\d\.]+)\s*g\s*\|\s*(?:🍞\s*)?Carbs:\s*([\d\.]+)\s*g)\n"
    r"\s*📖 Instructions:\s*(.*?)(?=\n-|\n🥗|\n=|Day|\Z)",
    re.DOTALL
)

recipes = []
seen_names = set()

for match in pattern.finditer(text):
    name = match.group(1).strip()
    cal1 = match.group(2)
    hybrid_score = match.group(3)
    ncf_score = match.group(4)
    content_score = match.group(5)
    cal2 = match.group(6)
    protein = match.group(7)
    fat = match.group(8)
    carbs = match.group(9)
    instructions = match.group(10).strip().replace("\n", " ")
    
    cal = float(cal1) if cal1 else (float(cal2) if cal2 else 0.0)
    
    # Clean name title
    name_clean = name.title().replace("&Amp;", "&").replace("&amp;", "&").replace("Quot;", "\"")
    
    if name_clean not in seen_names:
        seen_names.add(name_clean)
        recipes.append({
            "name": name_clean,
            "calories": round(cal, 1),
            "protein": float(protein),
            "fat": float(fat),
            "carbs": float(carbs),
            "hybrid_score": float(hybrid_score) if hybrid_score else 0.4885,
            "ncf_score": float(ncf_score) if ncf_score else 0.4860,
            "content_score": float(content_score) if content_score else 0.7720,
            "instructions": instructions,
            "diet": "Vegetarian",
            "category": "Main Dish" if cal > 250 else ("Soup / Salad" if "Soup" in name_clean or "Salad" in name_clean else "Side / Snack")
        })

print(f"Extracted {len(recipes)} recipes from meal plans!")
with open("recipes.json", "w", encoding="utf-8") as f:
    json.dump(recipes, f, indent=2)
