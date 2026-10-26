@echo off
echo ========================================================
echo   Starting NutriGen Smart Meal Planner...
echo ========================================================
cd /d "C:\Users\LEGION\.gemini\antigravity-ide\scratch\rs_app"
start "" http://localhost:8080
python -m http.server 8080
pause
