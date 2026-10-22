// ============================================================================
// CLINICAL NUTRITION & WHO ASIA-PACIFIC BIOMETRIC ENGINE
// ============================================================================

export function calculateBiometrics(profile) {
  const p = profile || {};
  const heightM = (p.height || 165) / 100;
  const weight = p.weight || 56;
  const age = p.age || 23;
  const gender = p.gender || 'female';
  const activity = p.activity || 'moderate';
  const goal = p.goal || 'maintain';

  // 1. BMI Calculation
  const bmiRaw = weight / (heightM * heightM);
  const bmi = Number(bmiRaw.toFixed(1));

  // 2. WHO Western Pacific Region (WPRO) Asia Classification
  let category = 'Chuẩn WHO Á Châu';
  if (bmi < 18.5) category = 'Thiếu cân';
  else if (bmi >= 18.5 && bmi <= 22.9) category = 'Chuẩn WHO Á Châu';
  else if (bmi >= 23.0 && bmi <= 24.9) category = 'Tiền béo phì';
  else category = 'Béo phì';

  // 3. Basal Metabolic Rate (Mifflin-St Jeor)
  let bmrRaw = 10 * weight + 6.25 * (p.height || 165) - 5 * age;
  if (gender === 'female') {
    bmrRaw -= 161;
  } else {
    bmrRaw += 5;
  }
  const bmr = Math.round(bmrRaw);

  // 4. Physical Activity Level (PAL) Multiplier
  const palMultipliers = {
    sedentary: 1.2,
    moderate: 1.45,
    active: 1.65
  };
  const pal = palMultipliers[activity] || 1.45;
  let tdeeRaw = bmr * pal;

  // 5. Goal Adjustment
  if (goal === 'lose') tdeeRaw -= 350;
  else if (goal === 'muscle') tdeeRaw += 250;
  const tdee = Math.round(tdeeRaw);

  // 6. Macronutrient Split
  let proteinPerKg = 1.25;
  if (goal === 'lose') proteinPerKg = 1.4;
  else if (goal === 'muscle') proteinPerKg = 1.6;
  const targetProtein = Math.round(weight * proteinPerKg);

  const fatCals = tdee * 0.28;
  const targetFat = Math.round(fatCals / 9);

  const carbCals = Math.max(0, tdee - targetProtein * 4 - fatCals);
  const targetCarbs = Math.round(carbCals / 4);

  // 7. BMI Spectrum Position (14 to 32 scale)
  const minBmi = 14;
  const maxBmi = 32;
  const bmiSpectrumPct = Math.min(100, Math.max(0, ((bmi - minBmi) / (maxBmi - minBmi)) * 100));

  return {
    bmi,
    category,
    bmr,
    tdee,
    targetProtein,
    targetCarbs,
    targetFat,
    bmiSpectrumPct
  };
}

export function calculateConsumedNutrition(dayPlan, recipesDb) {
  const recipeMap = new Map((recipesDb || []).map(r => [r.id, r]));
  
  const consumed = {
    calories: 0,
    protein: 0,
    b12: 0,
    iron: 0,
    omega3: 0,
    mealsCount: 0
  };

  const checkAndAdd = (recipeId, isCompleted) => {
    if (isCompleted && recipeId && recipeMap.has(recipeId)) {
      const r = recipeMap.get(recipeId);
      const cal = Number(r.nutrients?.calories ?? r.kcalPerServing ?? r.calories ?? 0);
      const pro = Number(r.nutrients?.protein ?? r.proteinG ?? r.protein ?? 0);
      const b12 = Number(r.nutrients?.b12 ?? r.b12Mcg ?? r.b12 ?? 0);
      const iron = Number(r.nutrients?.iron ?? r.ironMg ?? r.iron ?? 0);
      const omega3 = Number(r.nutrients?.omega3 ?? r.omega3 ?? 0);
      consumed.calories += cal;
      consumed.protein += pro;
      consumed.b12 += b12;
      consumed.iron += iron;
      consumed.omega3 += omega3;
      consumed.mealsCount += 1;
    }
  };

  if (dayPlan) {
    checkAndAdd(dayPlan.breakfast, dayPlan.completedBreakfast);
    checkAndAdd(dayPlan.lunch, dayPlan.completedLunch);
    checkAndAdd(dayPlan.dinner, dayPlan.completedDinner);
  }

  // Format decimals
  consumed.b12 = Number(consumed.b12.toFixed(1));
  consumed.iron = Number(consumed.iron.toFixed(1));
  consumed.omega3 = Number(consumed.omega3.toFixed(1));

  return consumed;
}
