import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  RECIPES_DB,
  DEFAULT_PROFILE,
  DEMO_PROFILES,
  INITIAL_WEEKLY_PLAN
} from '../data/nutritionData';
import {
  calculateBiometrics,
  calculateConsumedNutrition
} from '../utils/nutritionEngine';

const VeggieNutritionContext = createContext(null);

export function VeggieNutritionProvider({ children }) {
  // 1. User Profile State (persisted in localStorage)
  const [profile, setProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem('veggie_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load profile from storage', e);
    }
    return DEFAULT_PROFILE;
  });

  // 2. Weekly Plan State
  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('veggie_weekly_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load plan from storage', e);
    }
    return INITIAL_WEEKLY_PLAN;
  });

  // 3. Navigation & Day selection
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // 4. Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // 5. Update Profile helper
  const updateProfile = (updated) => {
    setProfileState(updated);
    try {
      localStorage.setItem('veggie_user_profile', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // 6. Switch Demo Profile
  const switchDemoProfile = (profileId) => {
    const found = DEMO_PROFILES.find(p => p.id === profileId);
    if (found) {
      updateProfile(found.profile);
      if (found.plan) {
        setWeeklyPlan(found.plan);
        try {
          localStorage.setItem('veggie_weekly_plan', JSON.stringify(found.plan));
        } catch (e) {
          console.warn(e);
        }
      }
      showToast(`Đã chuyển sang hồ sơ ${found.name}`);
    }
  };

  // 7. Toggle Bookmark Recipe
  const toggleSaveRecipe = (recipeId) => {
    const currentSaved = profile.savedRecipeIds || [];
    const isSaved = currentSaved.includes(recipeId);
    const nextSaved = isSaved
      ? currentSaved.filter(id => id !== recipeId)
      : [...currentSaved, recipeId];

    const updated = { ...profile, savedRecipeIds: nextSaved };
    updateProfile(updated);
    showToast(isSaved ? 'Đã bỏ lưu công thức' : 'Đã lưu công thức vào mục yêu thích');
  };

  // 8. Update specific meal in weekly plan
  const updateDayMeal = (dayIdx, mealType, recipeId) => {
    setWeeklyPlan(prev => {
      const copy = [...prev];
      copy[dayIdx] = {
        ...copy[dayIdx],
        [mealType]: recipeId
      };
      try {
        localStorage.setItem('veggie_weekly_plan', JSON.stringify(copy));
      } catch (e) {
        console.warn(e);
      }
      return copy;
    });
    showToast('Đã đổi món thành công!');
  };

  // 9. Toggle meal completed (Log meal vs Plan meal)
  const toggleMealCompleted = (dayIdx, mealType) => {
    const fieldKey =
      mealType === 'breakfast'
        ? 'completedBreakfast'
        : mealType === 'lunch'
        ? 'completedLunch'
        : 'completedDinner';

    setWeeklyPlan(prev => {
      const copy = [...prev];
      const currentVal = !!copy[dayIdx][fieldKey];
      copy[dayIdx] = {
        ...copy[dayIdx],
        [fieldKey]: !currentVal
      };
      try {
        localStorage.setItem('veggie_weekly_plan', JSON.stringify(copy));
      } catch (e) {
        console.warn(e);
      }
      return copy;
    });

    const mealName = mealType === 'breakfast' ? 'Bữa sáng' : mealType === 'lunch' ? 'Bữa trưa' : 'Bữa tối';
    showToast(`Đã cập nhật trạng thái ${mealName}`);
  };

  // 10. Memoized WHO Biometric Metrics
  const metrics = useMemo(() => {
    return calculateBiometrics(profile);
  }, [profile]);

  // 11. Memoized Actual Consumed Nutrition for Selected Day
  const currentDayPlan = weeklyPlan[selectedDayIdx] || weeklyPlan[0];
  const consumedToday = useMemo(() => {
    return calculateConsumedNutrition(currentDayPlan, RECIPES_DB);
  }, [currentDayPlan]);

  const value = {
    profile,
    updateProfile,
    switchDemoProfile,
    metrics,
    weeklyPlan,
    selectedDayIdx,
    setSelectedDayIdx,
    currentDayPlan,
    consumedToday,
    recipesDb: RECIPES_DB,
    toggleSaveRecipe,
    updateDayMeal,
    toggleMealCompleted,
    toastMessage,
    showToast
  };

  return (
    <VeggieNutritionContext.Provider value={value}>
      {children}
      {/* Global Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest text-alabaster px-4 py-2.5 rounded-2xl shadow-elevated border border-white/20 text-xs font-semibold flex items-center gap-2 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </VeggieNutritionContext.Provider>
  );
}

export function useVeggieNutrition() {
  const context = useContext(VeggieNutritionContext);
  if (!context) {
    throw new Error('useVeggieNutrition must be used within VeggieNutritionProvider');
  }
  return context;
}
