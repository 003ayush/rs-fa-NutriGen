# NutriGen — Personalized Smart Meal Planner 🥗🤖

NutriGen is an intelligent, data-driven meal recommendation and 7-day planning web application powered by machine learning architectures (Hybrid Deep Learning, Collaborative Filtering, and Content-Based Filtering).

---

## 🌟 Key Features

- **Personalized 7-Day Meal Plans**: Automatically generates breakfast, lunch, snack, and dinner schedules tailored to caloric goals, macro balance, and dietary preferences.
- **Machine Learning Evaluation & Visualizations**:
  - Model Performance Comparisons (Hybrid vs Baseline)
  - Training History & Loss Curves
  - Prediction Distributions and Error Margins
- **Interactive Recipe Explorer**: Rich recipe catalog with detailed nutritional breakdowns (protein, carbs, fat, micronutrients) and ingredient lists.
- **Modern Responsive UI**: Built with dynamic charts, sleek cards, and accessible navigation.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+ (for local HTTP server and data extraction scripts)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Quick Run
On Windows, simply run:
```bat
run_app.bat
```
Or start a local web server manually:
```bash
python -m http.server 8080
```
Then navigate to `http://localhost:8080` in your browser.

---

## 📁 Project Structure

```text
├── index.html                  # Main application UI
├── app.js                      # Application controller and UI logic
├── data.js                     # Precomputed recipe database and model metrics
├── styles.css                  # UI styling and design system
├── recipes.json                # Recipe database
├── hybrid_7day_plan.json       # Precomputed 7-day optimal meal plan
├── rs-fa2.ipynb                # ML model training and recommendation notebook
├── run_app.bat                 # One-click launcher for Windows
└── *.png                       # Model architecture and performance visualizations
```

---

## 📊 Models & Architecture

NutriGen evaluates multiple recommendation approaches:
1. **Hybrid Deep Model**: Combines user embeddings, nutritional constraints, and ingredient vectors.
2. **Matrix Factorization / Collaborative Filtering**: Latent factor modeling for user preference matching.
3. **Content-Based Filtering**: Feature matching based on ingredients and nutritional profiles.
