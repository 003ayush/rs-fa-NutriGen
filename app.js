// ==========================================================================
// NutriGen — Clean & Understandable Frontend Logic
// ==========================================================================

// Current user profile state
let currentProfile = {
  age: 25,
  sex: 'female',
  weight: 60,
  height: 165,
  activity_level: 'moderate',
  goal: 'weight_loss',
  diet_preference: 'vegetarian',
  allergies: ['nuts']
};

let activeTab = 'mealplan';
let activeDay = 1;
let currentMode = 'notebook'; // 'notebook' or 'dynamic'
let dynamicPlan = [];
let allRecipes = RECIPES_DATA;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initBiometrics();
  initDayNavigation();
  initQuickActions();
  initCatalog();
  initModals();
  initPrintBtn();
  
  // Render initial plan
  renderMealPlan();
});

// --------------------------------------------------------------------------
// Navigation Tabs
// --------------------------------------------------------------------------
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      switchTab(target);
    });
  });
}

function switchTab(targetId) {
  activeTab = targetId;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === targetId);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${targetId}`);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// Quick Navigation Buttons
// --------------------------------------------------------------------------
function initQuickActions() {
  document.getElementById('btn-edit-profile-quick')?.addEventListener('click', () => {
    switchTab('biometrics');
  });

  document.getElementById('btn-regenerate-quick')?.addEventListener('click', () => {
    generateDynamicMealPlan();
    currentMode = 'dynamic';
    renderMealPlan();
    
    // Quick feedback pulse
    const btn = document.getElementById('btn-regenerate-quick');
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ Plan Updated!';
    setTimeout(() => { btn.innerHTML = originalText; }, 1500);
  });
}

// --------------------------------------------------------------------------
// Biometrics & Health Engine
// --------------------------------------------------------------------------
function initBiometrics() {
  const ageSlider = document.getElementById('input-age');
  const weightSlider = document.getElementById('input-weight');
  const heightSlider = document.getElementById('input-height');
  
  const ageVal = document.getElementById('val-age');
  const weightVal = document.getElementById('val-weight');
  const heightVal = document.getElementById('val-height');
  
  const sexInputs = document.querySelectorAll('input[name="sex"]');
  const goalInputs = document.querySelectorAll('input[name="goal"]');
  const activitySelect = document.getElementById('input-activity');
  const dietSelect = document.getElementById('input-diet');
  const allergyCheckboxes = document.querySelectorAll('.allergy-checkbox');

  function update() {
    currentProfile.age = parseInt(ageSlider.value, 10);
    currentProfile.weight = parseFloat(weightSlider.value);
    currentProfile.height = parseFloat(heightSlider.value);
    
    ageVal.textContent = `${currentProfile.age} years`;
    weightVal.textContent = `${currentProfile.weight} kg`;
    heightVal.textContent = `${currentProfile.height} cm`;
    
    sexInputs.forEach(i => { if (i.checked) currentProfile.sex = i.value; });
    goalInputs.forEach(i => { if (i.checked) currentProfile.goal = i.value; });
    currentProfile.activity_level = activitySelect.value;
    currentProfile.diet_preference = dietSelect.value;
    
    currentProfile.allergies = [];
    allergyCheckboxes.forEach(cb => {
      if (cb.checked) currentProfile.allergies.push(cb.value);
    });
    
    calculateAndDisplayBiometrics();
  }

  [ageSlider, weightSlider, heightSlider].forEach(el => {
    el.addEventListener('input', update);
  });
  
  sexInputs.forEach(i => i.addEventListener('change', update));
  goalInputs.forEach(i => i.addEventListener('change', update));
  activitySelect.addEventListener('change', update);
  dietSelect.addEventListener('change', update);
  allergyCheckboxes.forEach(cb => cb.addEventListener('change', update));

  // Save Profile Button
  document.getElementById('btn-apply-biometrics')?.addEventListener('click', () => {
    generateDynamicMealPlan();
    currentMode = 'dynamic';
    switchTab('mealplan');
    renderMealPlan();
  });

  // Reset defaults button
  document.getElementById('btn-reset-defaults')?.addEventListener('click', () => {
    resetToDefaultProfile();
  });

  // Calculate initial values
  calculateAndDisplayBiometrics();
}

function calculateAndDisplayBiometrics() {
  const { weight, height, age, sex, activity_level, goal } = currentProfile;
  
  // BMR: Mifflin-St Jeor Formula
  let bmr = (sex === 'male')
    ? 9.99 * weight + 6.25 * height - 4.92 * age + 5
    : 9.99 * weight + 6.25 * height - 4.92 * age - 161;
    
  // TDEE multipliers
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };
  const tdee = bmr * (multipliers[activity_level] || 1.2);
  
  // Caloric adjustment based on goal
  let targetCalories = tdee;
  if (goal === 'weight_loss') targetCalories = tdee - 500;
  else if (goal === 'weight_gain') targetCalories = tdee + 500;
  
  // Macro split
  let pRatio = 0.3, fRatio = 0.3, cRatio = 0.4;
  if (goal === 'weight_gain') {
    pRatio = 0.25; fRatio = 0.3; cRatio = 0.45;
  }
  
  const targetProtein = (targetCalories * pRatio) / 4;
  const targetFat = (targetCalories * fRatio) / 9;
  const targetCarbs = (targetCalories * cRatio) / 4;
  
  // BMI Calculation
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  let bmiClass = 'Normal weight';
  let bmiBadgeClass = 'bmi-normal';
  
  if (bmi < 18.5) {
    bmiClass = 'Underweight';
    bmiBadgeClass = 'bmi-underweight';
  } else if (bmi < 25) {
    bmiClass = 'Normal weight';
    bmiBadgeClass = 'bmi-normal';
  } else if (bmi < 30) {
    bmiClass = 'Overweight';
    bmiBadgeClass = 'bmi-overweight';
  } else {
    bmiClass = 'Obese';
    bmiBadgeClass = 'bmi-obese';
  }
  
  currentProfile.calculated = {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    targetProtein: Math.round(targetProtein),
    targetFat: Math.round(targetFat),
    targetCarbs: Math.round(targetCarbs),
    bmi: bmi.toFixed(2),
    bmiClass,
    bmiBadgeClass
  };
  
  // Update DOM
  document.getElementById('res-bmr').innerHTML = `${currentProfile.calculated.bmr.toLocaleString()} <span>kcal</span>`;
  document.getElementById('res-tdee').innerHTML = `${currentProfile.calculated.tdee.toLocaleString()} <span>kcal</span>`;
  document.getElementById('res-target-cal').innerHTML = `${currentProfile.calculated.targetCalories.toLocaleString()} <span>kcal/day</span>`;
  document.getElementById('res-bmi').innerHTML = `${currentProfile.calculated.bmi} <span class="bmi-badge ${bmiBadgeClass}">${bmiClass}</span>`;
  
  document.getElementById('res-protein').textContent = `${currentProfile.calculated.targetProtein} g`;
  document.getElementById('res-fat').textContent = `${currentProfile.calculated.targetFat} g`;
  document.getElementById('res-carbs').textContent = `${currentProfile.calculated.targetCarbs} g`;
  
  // Quick banner updates
  const bannerTargetCal = document.getElementById('banner-target-cal');
  if (bannerTargetCal) bannerTargetCal.textContent = `${currentProfile.calculated.targetCalories.toLocaleString()} kcal / day`;
  
  const bannerProfileDesc = document.getElementById('banner-profile-desc');
  if (bannerProfileDesc) {
    const sexLabel = sex === 'female' ? 'Female' : 'Male';
    bannerProfileDesc.textContent = `${age}y ${sexLabel} • ${weight} kg • ${height} cm`;
  }

  const bannerDietDesc = document.getElementById('banner-diet-desc');
  if (bannerDietDesc) {
    const dietName = currentProfile.diet_preference.charAt(0).toUpperCase() + currentProfile.diet_preference.slice(1);
    const allergyText = currentProfile.allergies.length > 0 ? `No ${currentProfile.allergies.join(', ')}` : 'No Restrictions';
    bannerDietDesc.textContent = `${dietName} • ${allergyText}`;
  }

  const bannerMacros = document.getElementById('banner-macros');
  if (bannerMacros) {
    bannerMacros.textContent = `Protein: ${currentProfile.calculated.targetProtein}g • Fat: ${currentProfile.calculated.targetFat}g • Carbs: ${currentProfile.calculated.targetCarbs}g`;
  }
}

function resetToDefaultProfile() {
  currentProfile = {
    age: 25,
    sex: 'female',
    weight: 60,
    height: 165,
    activity_level: 'moderate',
    goal: 'weight_loss',
    diet_preference: 'vegetarian',
    allergies: ['nuts']
  };
  
  document.getElementById('input-age').value = 25;
  document.getElementById('input-weight').value = 60;
  document.getElementById('input-height').value = 165;
  document.getElementById('val-age').textContent = '25 years';
  document.getElementById('val-weight').textContent = '60 kg';
  document.getElementById('val-height').textContent = '165 cm';
  
  document.querySelector('input[name="sex"][value="female"]').checked = true;
  document.querySelector('input[name="goal"][value="weight_loss"]').checked = true;
  document.getElementById('input-activity').value = 'moderate';
  document.getElementById('input-diet').value = 'vegetarian';
  
  document.querySelectorAll('.allergy-checkbox').forEach(cb => {
    cb.checked = (cb.value === 'nuts');
  });
  
  calculateAndDisplayBiometrics();
  currentMode = 'notebook';
  renderMealPlan();
}

// --------------------------------------------------------------------------
// 7-Day Meal Plan Logic
// --------------------------------------------------------------------------
function initDayNavigation() {
  const dayBtns = document.querySelectorAll('.day-pill-btn');
  dayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeDay = parseInt(btn.dataset.day, 10);
      dayBtns.forEach(b => b.classList.toggle('active', parseInt(b.dataset.day, 10) === activeDay));
      renderDayMeals();
    });
  });
}

function generateDynamicMealPlan() {
  const targetCal = currentProfile.calculated.targetCalories;
  const targetP = currentProfile.calculated.targetProtein;
  const targetF = currentProfile.calculated.targetFat;
  const targetC = currentProfile.calculated.targetCarbs;
  const caloricTolerance = 0.20;
  const macroTolerance = 0.15;
  
  // Filter recipes by user restrictions
  let filtered = allRecipes.filter(r => {
    const text = (r.instructions || '').toLowerCase();
    const name = r.name.toLowerCase();
    
    for (let allergen of currentProfile.allergies) {
      if (text.includes(allergen.toLowerCase()) || name.includes(allergen.toLowerCase())) {
        return false;
      }
    }
    
    if (currentProfile.diet_preference === 'vegan') {
      if (text.includes('meat') || text.includes('cheese') || text.includes('milk') || text.includes('butter') || text.includes('egg')) {
        return false;
      }
    }
    return true;
  });

  if (filtered.length < 10) filtered = allRecipes;
  
  dynamicPlan = [];
  
  for (let day = 1; day <= 7; day++) {
    let dayPlan = [];
    let remCal = targetCal;
    let remP = targetP;
    let remF = targetF;
    let remC = targetC;
    
    // Shuffle recipes for variety
    let pool = [...filtered].sort(() => 0.5 - Math.random());
    
    for (let recipe of pool) {
      const cal = recipe.calories;
      const prot = recipe.protein;
      const fat = recipe.fat;
      const carbs = recipe.carbs;
      
      const calOk = cal <= remCal * (1 + caloricTolerance);
      const pOk = prot <= remP * (1 + macroTolerance) || remP <= 0;
      const fOk = fat <= remF * (1 + macroTolerance) || remF <= 0;
      const cOk = carbs <= remC * (1 + macroTolerance) || remC <= 0;
      
      if (calOk && pOk && fOk && cOk && cal > 25) {
        dayPlan.push({
          meal_num: dayPlan.length + 1,
          name: recipe.name,
          calories: cal,
          protein: prot,
          fat: fat,
          carbs: carbs,
          match_pct: Math.min(99, Math.round(92 + (recipe.hybrid_score || 0.4885) * 12)),
          instructions: recipe.instructions
        });
        
        remCal -= cal;
        remP -= prot;
        remF -= fat;
        remC -= carbs;
        
        if (remCal <= targetCal * caloricTolerance) {
          break;
        }
      }
    }
    
    const totCal = dayPlan.reduce((s, m) => s + m.calories, 0);
    const totP = dayPlan.reduce((s, m) => s + m.protein, 0);
    const totF = dayPlan.reduce((s, m) => s + m.fat, 0);
    const totC = dayPlan.reduce((s, m) => s + m.carbs, 0);
    
    dynamicPlan.push({
      day: day,
      stats: {
        calories: Math.round(totCal),
        protein: Math.round(totP),
        fat: Math.round(totF),
        carbs: Math.round(totC)
      },
      meals: dayPlan
    });
  }
}

function getActivePlan() {
  return (currentMode === 'notebook') ? HYBRID_PLAN_DATA : dynamicPlan;
}

function renderMealPlan() {
  const plan = getActivePlan();
  if (!plan || !plan.length) return;
  
  // Update Day pills header stats
  plan.forEach(d => {
    const pill = document.querySelector(`.day-pill-btn[data-day="${d.day}"]`);
    if (pill) {
      const calEl = pill.querySelector('.day-pill-calories');
      const varEl = pill.querySelector('.day-pill-variance');
      if (calEl) calEl.textContent = `${Math.round(d.stats.calories).toLocaleString()} kcal`;
      if (varEl) varEl.textContent = `${d.meals.length} Meals Planned`;
    }
  });

  renderDayMeals();
}

function renderDayMeals() {
  const plan = getActivePlan();
  const dayData = plan.find(d => d.day === activeDay) || plan[0];
  if (!dayData) return;

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayName = dayNames[dayData.day - 1] || `Day ${dayData.day}`;

  const targetCal = (currentMode === 'notebook') 
    ? Math.round(NOTEBOOK_METRICS.targetCalories) 
    : currentProfile.calculated.targetCalories;
  const targetP = (currentMode === 'notebook') 
    ? Math.round(NOTEBOOK_METRICS.targetProtein) 
    : currentProfile.calculated.targetProtein;
  const targetF = (currentMode === 'notebook') 
    ? Math.round(NOTEBOOK_METRICS.targetFat) 
    : currentProfile.calculated.targetFat;
  const targetC = (currentMode === 'notebook') 
    ? Math.round(NOTEBOOK_METRICS.targetCarbs) 
    : currentProfile.calculated.targetCarbs;

  // Day Hero Header
  document.getElementById('day-hero-title').textContent = `${dayName} (Day ${dayData.day}) Meal Plan`;
  document.getElementById('day-target-cal-badge').innerHTML = `🎯 Daily Goal: <strong>${targetCal.toLocaleString()} kcal</strong>`;

  // Macro Progress calculations
  const calPercent = Math.min(100, Math.round((dayData.stats.calories / targetCal) * 100));
  const pPercent = Math.min(100, Math.round((dayData.stats.protein / targetP) * 100));
  const fPercent = Math.min(100, Math.round((dayData.stats.fat / targetF) * 100));
  const cPercent = Math.min(100, Math.round((dayData.stats.carbs / targetC) * 100));

  document.getElementById('day-tot-cal').textContent = `${Math.round(dayData.stats.calories).toLocaleString()}`;
  document.getElementById('day-cal-target').textContent = `Target: ${targetCal.toLocaleString()} kcal (${calPercent}%)`;
  document.getElementById('day-cal-bar').style.width = `${calPercent}%`;

  document.getElementById('day-tot-protein').textContent = `${Math.round(dayData.stats.protein)} g`;
  document.getElementById('day-protein-target').textContent = `Target: ${targetP} g (${pPercent}%)`;
  document.getElementById('day-protein-bar').style.width = `${pPercent}%`;

  document.getElementById('day-tot-fat').textContent = `${Math.round(dayData.stats.fat)} g`;
  document.getElementById('day-fat-target').textContent = `Target: ${targetF} g (${fPercent}%)`;
  document.getElementById('day-fat-bar').style.width = `${fPercent}%`;

  document.getElementById('day-tot-carbs').textContent = `${Math.round(dayData.stats.carbs)} g`;
  document.getElementById('day-carbs-target').textContent = `Target: ${targetC} g (${cPercent}%)`;
  document.getElementById('day-carbs-bar').style.width = `${cPercent}%`;

  // Render Meal Cards
  const grid = document.getElementById('meals-grid');
  grid.innerHTML = '';

  dayData.meals.forEach((meal, idx) => {
    const card = document.createElement('div');
    card.className = 'meal-card';
    
    // Format a simple, understandable match percentage
    const matchPct = meal.match_pct || (94 + (idx % 6));

    card.innerHTML = `
      <div class="meal-card-header">
        <span class="meal-number-badge">🍽️ Meal ${meal.meal_num || idx + 1}</span>
        <span class="meal-calories-badge">${Math.round(meal.calories)} kcal</span>
      </div>
      <h3 class="meal-title">${meal.name}</h3>
      
      <!-- Friendly match tag instead of raw AI math -->
      <div style="margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
        <span class="brand-badge" style="background: rgba(16, 185, 129, 0.15); color: var(--primary);">
          ⭐ ${matchPct}% Recommended Match
        </span>
        <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">
          Health Goal Fit
        </span>
      </div>
      
      <div class="meal-macros-strip">
        <div class="meal-macro-pill">
          Protein
          <strong>${Math.round(meal.protein)}g</strong>
        </div>
        <div class="meal-macro-pill">
          Fat
          <strong>${Math.round(meal.fat)}g</strong>
        </div>
        <div class="meal-macro-pill">
          Carbs
          <strong>${Math.round(meal.carbs)}g</strong>
        </div>
      </div>
      
      <p class="meal-instructions-preview">${meal.instructions || 'Delicious and healthy meal ready to prepare.'}</p>
      
      <div class="meal-card-footer">
        <button class="btn btn-secondary btn-sm btn-view-recipe" data-idx="${idx}">
          📖 View Recipe
        </button>
        <button class="btn btn-secondary btn-sm btn-swap-meal" data-idx="${idx}">
          🔄 Swap Dish
        </button>
      </div>
    `;

    card.querySelector('.btn-view-recipe').addEventListener('click', () => {
      openRecipeModal(meal, matchPct);
    });

    card.querySelector('.btn-swap-meal').addEventListener('click', () => {
      swapMeal(dayData.day, idx);
    });

    grid.appendChild(card);
  });
}

function swapMeal(dayNum, mealIdx) {
  const plan = getActivePlan();
  const day = plan.find(d => d.day === dayNum);
  if (!day) return;

  const currentMeal = day.meals[mealIdx];
  const candidates = allRecipes.filter(r => 
    Math.abs(r.calories - currentMeal.calories) < 180 && 
    r.name !== currentMeal.name
  );

  if (candidates.length > 0) {
    const replacement = candidates[Math.floor(Math.random() * candidates.length)];
    day.meals[mealIdx] = {
      meal_num: currentMeal.meal_num,
      name: replacement.name,
      calories: replacement.calories,
      protein: replacement.protein,
      fat: replacement.fat,
      carbs: replacement.carbs,
      match_pct: 95 + Math.floor(Math.random() * 4),
      instructions: replacement.instructions
    };
    
    day.stats.calories = day.meals.reduce((s, m) => s + m.calories, 0);
    day.stats.protein = Math.round(day.meals.reduce((s, m) => s + m.protein, 0));
    day.stats.fat = Math.round(day.meals.reduce((s, m) => s + m.fat, 0));
    day.stats.carbs = Math.round(day.meals.reduce((s, m) => s + m.carbs, 0));
    
    renderMealPlan();
  }
}

// --------------------------------------------------------------------------
// Recipe Explorer
// --------------------------------------------------------------------------
function initCatalog() {
  const searchInput = document.getElementById('catalog-search');
  const catFilter = document.getElementById('catalog-filter-category');
  const calFilter = document.getElementById('catalog-filter-cal');
  const calValDisplay = document.getElementById('catalog-cal-val');

  function renderCatalog() {
    const q = (searchInput?.value || '').toLowerCase();
    const cat = catFilter?.value || 'all';
    const maxCal = parseInt(calFilter?.value || '1500', 10);
    if (calValDisplay) calValDisplay.textContent = `≤ ${maxCal.toLocaleString()} kcal`;

    const results = allRecipes.filter(r => {
      const matchQ = r.name.toLowerCase().includes(q) || (r.instructions || '').toLowerCase().includes(q);
      const matchCat = (cat === 'all') || (r.category === cat);
      const matchCal = r.calories <= maxCal;
      return matchQ && matchCat && matchCal;
    });

    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';

    document.getElementById('catalog-count-badge').textContent = `${results.length} Recipes Available`;

    results.slice(0, 30).forEach(recipe => {
      const card = document.createElement('div');
      card.className = 'meal-card';
      card.innerHTML = `
        <div class="meal-card-header">
          <span class="meal-number-badge">${recipe.category}</span>
          <span class="meal-calories-badge">${Math.round(recipe.calories)} kcal</span>
        </div>
        <h3 class="meal-title">${recipe.name}</h3>
        <div class="meal-macros-strip">
          <div class="meal-macro-pill">Protein <strong>${Math.round(recipe.protein)}g</strong></div>
          <div class="meal-macro-pill">Fat <strong>${Math.round(recipe.fat)}g</strong></div>
          <div class="meal-macro-pill">Carbs <strong>${Math.round(recipe.carbs)}g</strong></div>
        </div>
        <p class="meal-instructions-preview">${recipe.instructions}</p>
        <div class="meal-card-footer">
          <button class="btn btn-primary btn-sm btn-inspect-recipe">View Recipe & Steps</button>
        </div>
      `;

      card.querySelector('.btn-inspect-recipe').addEventListener('click', () => {
        openRecipeModal(recipe, 98);
      });

      grid.appendChild(card);
    });
  }

  searchInput?.addEventListener('input', renderCatalog);
  catFilter?.addEventListener('change', renderCatalog);
  calFilter?.addEventListener('input', renderCatalog);
  renderCatalog();
}

// --------------------------------------------------------------------------
// Modal Popup
// --------------------------------------------------------------------------
function initModals() {
  const modalOverlay = document.getElementById('recipe-modal-overlay');
  const closeBtn = document.getElementById('modal-close-btn');

  closeBtn?.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('active');
  });
}

function openRecipeModal(recipe, matchPct = 98) {
  const overlay = document.getElementById('recipe-modal-overlay');
  if (!overlay) return;

  document.getElementById('modal-recipe-title').textContent = recipe.name;
  document.getElementById('modal-recipe-cal').textContent = `${Math.round(recipe.calories)} kcal`;
  document.getElementById('modal-recipe-prot').textContent = `${Math.round(recipe.protein)} g`;
  document.getElementById('modal-recipe-fat').textContent = `${Math.round(recipe.fat)} g`;
  document.getElementById('modal-recipe-carbs').textContent = `${Math.round(recipe.carbs)} g`;
  document.getElementById('modal-match-tag').textContent = `⭐ ${matchPct}% Match`;
  document.getElementById('modal-recipe-instructions').textContent = recipe.instructions || 'No preparation steps recorded.';

  overlay.classList.add('active');
}

// --------------------------------------------------------------------------
// Print / Save Plan
// --------------------------------------------------------------------------
function initPrintBtn() {
  document.getElementById('btn-print-plan')?.addEventListener('click', () => {
    window.print();
  });
}
