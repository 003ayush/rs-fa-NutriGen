import json

with open("recipes.json", "r", encoding="utf-8") as f:
    recipes = json.load(f)

with open("hybrid_7day_plan.json", "r", encoding="utf-8") as f:
    hybrid_plan = json.load(f)

benchmarks = [
    {
        "model": "Hybrid Ensemble (NCF + Content Deep)",
        "type": "Proposed Architecture",
        "rmse": 0.3771,
        "mae": 0.3405,
        "mse": 0.1422,
        "accuracy": 0.1474,
        "badge": "Proposed / Best Balance",
        "description": "Combines GMF+MLP collaborative embeddings with deep multimodal recipe autoencoder via logistic meta-model weighting."
    },
    {
        "model": "Content-Based Deep Learning",
        "type": "Neural Component",
        "rmse": 0.2379,
        "mae": 0.1913,
        "mse": 0.0566,
        "accuracy": 0.8526,
        "badge": "Top Accuracy & Low Error",
        "description": "Multi-modal network with 1D-CNN text feature extractor, categorical embeddings, and deep autoencoder latent representation."
    },
    {
        "model": "Neural Collaborative Filtering (NCF)",
        "type": "Neural Component",
        "rmse": 0.3791,
        "mae": 0.3423,
        "mse": 0.1437,
        "accuracy": 0.1474,
        "badge": "Collaborative Path",
        "description": "Dual branch architecture with Generalized Matrix Factorization (GMF) and 4-layer MLP with BatchNorm and Dropout."
    },
    {
        "model": "Item-Based KNN Baseline",
        "type": "Traditional CF Baseline",
        "rmse": 0.3258,
        "mae": 0.2649,
        "mse": 0.1062,
        "accuracy": 0.8041,
        "badge": "Strong Baseline",
        "description": "Cosine similarity nearest neighbors across user rating vectors with k=50."
    },
    {
        "model": "Content-Based TF-IDF Baseline",
        "type": "Traditional Content Baseline",
        "rmse": 0.5536,
        "mae": 0.4721,
        "mse": 0.3064,
        "accuracy": 0.3926,
        "badge": "Heuristic Baseline",
        "description": "TF-IDF instruction text vectorization (5000 features) + scaled nutrient cosine similarity."
    },
    {
        "model": "Matrix Factorization (NMF) Baseline",
        "type": "Decomposition Baseline",
        "rmse": 0.7934,
        "mae": 0.7559,
        "mse": 0.6295,
        "accuracy": 0.1481,
        "badge": "Baseline",
        "description": "Non-Negative Matrix Factorization with 50 latent components."
    }
]

js_content = f"""// Auto-generated dataset for NutriGen Hybrid RS App
const RECIPES_DATA = {json.dumps(recipes, indent=2)};

const HYBRID_PLAN_DATA = {json.dumps(hybrid_plan, indent=2)};

const BENCHMARKS_DATA = {json.dumps(benchmarks, indent=2)};

const NOTEBOOK_METRICS = {{
  dataset: "Food.com 700k Recipes & Interactions (Kaggle)",
  filteredRecipes: 716,
  totalInteractions: 20823,
  mappedUsers: 1000,
  trainSamples: 13326,
  valSamples: 3332,
  testSamples: 4165,
  negSamplesRatio: "4:1",
  ncfParams: "138,241 (137,761 Trainable)",
  contentParams: "1,027,697 (1,027,697 Trainable)",
  batchSizeNCF: 2048,
  batchSizeContent: 512,
  epochs: 50,
  targetCalories: 1587.31,
  targetProtein: 119.05,
  targetFat: 52.91,
  targetCarbs: 158.73,
  bmr: 1346.65,
  tdee: 2087.31,
  bmi: 22.04,
  status: "Normal weight"
}};
"""

with open("data.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Wrote data.js ({len(js_content)} chars)")
