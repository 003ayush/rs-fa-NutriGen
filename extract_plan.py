import json
import re

with open("notebook_outputs_summary.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Isolate CELL 32 OUTPUTS
cell_32_idx = text.find("CELL 32 OUTPUTS")
if cell_32_idx != -1:
    c32_text = text[cell_32_idx:]
else:
    c32_text = text

day_sections = re.split(r"🍽️\s*DAY\s*(\d+)\s*MEAL PLAN", c32_text)
# day_sections: [preamble, '1', content_day1, '2', content_day2, ...]

days_plan = []
for i in range(1, len(day_sections), 2):
    day_num = int(day_sections[i])
    day_content = day_sections[i+1]
    
    # Extract totals
    tot_cal_m = re.search(r"Total Calories:\s*([\d\.]+)\s*kcal(?:\s*\(Target:\s*(\d+),\s*Diff:\s*([\d\.]+)%\))?", day_content)
    tot_prot_m = re.search(r"Protein:\s*([\d\.]+)\s*g(?:\s*\(Target:\s*([\d\.]+),\s*Diff:\s*([\d\.]+)%\))?", day_content)
    tot_fat_m = re.search(r"Fat:\s*([\d\.]+)\s*g(?:\s*\(Target:\s*([\d\.]+),\s*Diff:\s*([\d\.]+)%\))?", day_content)
    tot_carbs_m = re.search(r"Carbs:\s*([\d\.]+)\s*g(?:\s*\(Target:\s*([\d\.]+),\s*Diff:\s*([\d\.]+)%\))?", day_content)
    
    day_stats = {
        "calories": float(tot_cal_m.group(1)) if tot_cal_m else 0,
        "protein": float(tot_prot_m.group(1)) if tot_prot_m else 0,
        "fat": float(tot_fat_m.group(1)) if tot_fat_m else 0,
        "carbs": float(tot_carbs_m.group(1)) if tot_carbs_m else 0,
    }
    
    meal_pattern = re.compile(
        r"🥗 Meal (\d+):\s*(.*?)\n"
        r"\s*📊 Hybrid Score:\s*([\d\.]+)\s*\|\s*NCF:\s*([\d\.]+)\s*\|\s*Content:\s*([\d\.]+)\n"
        r"\s*💪\s*([\d\.]+)\s*kcal\s*\|\s*Protein:\s*([\d\.]+)\s*g\s*\|\s*Fat:\s*([\d\.]+)\s*g\s*\|\s*Carbs:\s*([\d\.]+)\s*g\n"
        r"\s*📖 Instructions:\s*(.*?)(?=\n-|\n🥗|\n=|Day|\Z)",
        re.DOTALL
    )
    
    meals = []
    for m in meal_pattern.finditer(day_content):
        meals.append({
            "meal_num": int(m.group(1)),
            "name": m.group(2).strip().title().replace("&Amp;", "&").replace("Quot;", "\""),
            "hybrid_score": float(m.group(3)),
            "ncf_score": float(m.group(4)),
            "content_score": float(m.group(5)),
            "calories": float(m.group(6)),
            "protein": float(m.group(7)),
            "fat": float(m.group(8)),
            "carbs": float(m.group(9)),
            "instructions": m.group(10).strip()
        })
    
    days_plan.append({
        "day": day_num,
        "stats": day_stats,
        "meals": meals
    })

print(f"Extracted {len(days_plan)} days from Cell 32 hybrid plan!")
with open("hybrid_7day_plan.json", "w", encoding="utf-8") as f:
    json.dump(days_plan, f, indent=2)
