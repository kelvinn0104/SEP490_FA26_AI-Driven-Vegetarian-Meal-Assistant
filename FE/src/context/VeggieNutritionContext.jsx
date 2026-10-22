import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
import {
  healthCheckService,
  healthProfileService,
  mealPlanService,
  nutritionService,
  recipeService,
  getAuthToken
} from '../api';

const VeggieNutritionContext = createContext(null);

export function VeggieNutritionProvider({ children }) {
  // 1. Connection & Loading Status
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);

  // 2. User Profile State (persisted in localStorage + synced with Backend)
  const [profile, setProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem('veggie_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load profile from storage', e);
    }
    return DEFAULT_PROFILE;
  });

  // 3. Weekly Plan State (persisted in localStorage + synced with Backend)
  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('veggie_weekly_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load plan from storage', e);
    }
    return INITIAL_WEEKLY_PLAN;
  });

  // Active Plan Metadata from Backend (e.g. planId, status, dailyTargets)
  const [activePlanMeta, setActivePlanMeta] = useState(null);

  // 4. Navigation & Day selection
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // 5. Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 6. Check Backend Health & Sync Data on Mount / Token change
  const syncWithBackend = useCallback(async () => {
    try {
      const health = await healthCheckService.checkHealth();
      const isOnline = !!health && (health.status === 'Healthy' || !!health.service);
      setIsBackendConnected(isOnline);

      if (!isOnline) {
        console.info('[VeggieAI] Backend đang offline hoặc không kết nối được -> Dùng chế độ mô phỏng.');
        return;
      }

      const token = getAuthToken();
      if (!token) return;

      // 6.1 Sync Health Profile from Backend
      try {
        const hp = await healthProfileService.getHealthProfile();
        if (hp) {
          setProfileState(prev => {
            const merged = {
              ...prev,
              id: hp.id,
              gender: hp.gender || prev.gender,
              height: hp.heightCm || prev.height,
              weight: hp.weightKg || prev.weight,
              activityLevel: hp.activityLevel || prev.activityLevel,
              goal: hp.healthGoal || prev.goal,
              diet: prev.diet || 'Thuần chay (Vegan)',
              needsUpdate: hp.needsUpdate || false,
              serverTargets: hp.targets || null,
              allergies: hp.allergies || []
            };
            try {
              localStorage.setItem('veggie_user_profile', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      } catch (err) {
        console.warn('Không thể đồng bộ hồ sơ từ Backend:', err.message);
      }

      // 6.2 Sync Current Active Meal Plan from Backend
      try {
        const currentPlan = await mealPlanService.getCurrentPlan();
        if (currentPlan && currentPlan.days && currentPlan.days.length > 0) {
          setActivePlanMeta(currentPlan);
          // Map backend days format to FE weekly plan format
          const mappedWeekly = currentPlan.days.map((d, index) => {
            const breakfastItem = d.meals?.find(m => m.mealType === 'breakfast');
            const lunchItem = d.meals?.find(m => m.mealType === 'lunch');
            const dinnerItem = d.meals?.find(m => m.mealType === 'dinner');

            return {
              day: `Ngày ${index + 1}`,
              date: d.date,
              breakfast: breakfastItem?.recipeId ? `r${breakfastItem.recipeId}` : (weeklyPlan[index]?.breakfast || 'r4'),
              breakfastItemId: breakfastItem?.id || null,
              completedBreakfast: false,
              lunch: lunchItem?.recipeId ? `r${lunchItem.recipeId}` : (weeklyPlan[index]?.lunch || 'r1'),
              lunchItemId: lunchItem?.id || null,
              completedLunch: false,
              dinner: dinnerItem?.recipeId ? `r${dinnerItem.recipeId}` : (weeklyPlan[index]?.dinner || 'r6'),
              dinnerItemId: dinnerItem?.id || null,
              completedDinner: false
            };
          });

          if (mappedWeekly.length > 0) {
            setWeeklyPlan(mappedWeekly);
            try {
              localStorage.setItem('veggie_weekly_plan', JSON.stringify(mappedWeekly));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Không thể đồng bộ thực đơn từ Backend:', err.message);
      }

      // 6.3 Sync Daily Nutrition Logs for today
      try {
        const dailyNutr = await nutritionService.getDailyNutrition();
        if (dailyNutr && dailyNutr.logs) {
          // If meals were logged in DB, mark them completed in the current day plan
          const todayPlan = weeklyPlan[selectedDayIdx];
          if (todayPlan) {
            const hasB = dailyNutr.logs.some(l => l.mealType === 'breakfast');
            const hasL = dailyNutr.logs.some(l => l.mealType === 'lunch');
            const hasD = dailyNutr.logs.some(l => l.mealType === 'dinner');

            if (hasB || hasL || hasD) {
              setWeeklyPlan(prev => {
                const copy = [...prev];
                copy[selectedDayIdx] = {
                  ...copy[selectedDayIdx],
                  completedBreakfast: hasB,
                  completedLunch: hasL,
                  completedDinner: hasD
                };
                return copy;
              });
            }
          }
        }
      } catch (err) {
        console.warn('Không thể đồng bộ nhật ký dinh dưỡng từ Backend:', err.message);
      }

    } catch (e) {
      setIsBackendConnected(false);
    }
  }, [weeklyPlan, selectedDayIdx]);

  useEffect(() => {
    syncWithBackend();
  }, []);

  // 7. Update Profile helper (Local + Backend sync)
  const updateProfile = async (updated) => {
    setProfileState(updated);
    try {
      localStorage.setItem('veggie_user_profile', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    if (isBackendConnected && getAuthToken()) {
      try {
        const dto = {
          gender: updated.gender || 'female',
          dateOfBirth: updated.dateOfBirth || '2000-01-01',
          heightCm: Number(updated.height),
          weightKg: Number(updated.weight),
          activityLevel: updated.activityLevel || 'moderate',
          healthGoal: updated.goal || 'maintain',
          allergyIds: updated.allergyIds || []
        };
        await healthProfileService.updateHealthProfile(dto);
        showToast('Đã lưu hồ sơ lên máy chủ Backend thành công!');
      } catch (err) {
        console.warn('Backend profile update failed:', err.message);
        showToast('Đã lưu hồ sơ cục bộ (Máy chủ chưa phản hồi).');
      }
    } else {
      showToast('Đã cập nhật hồ sơ thể trạng!');
    }
  };

  // 8. Switch Demo Profile
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

  // 9. Toggle Bookmark Recipe
  const toggleSaveRecipe = async (recipeId) => {
    const currentSaved = profile.savedRecipeIds || [];
    const isSaved = currentSaved.includes(recipeId);
    const nextSaved = isSaved
      ? currentSaved.filter(id => id !== recipeId)
      : [...currentSaved, recipeId];

    const updated = { ...profile, savedRecipeIds: nextSaved };
    updateProfile(updated);

    // Call Backend if connected
    if (isBackendConnected && getAuthToken()) {
      try {
        const numId = parseInt(recipeId.toString().replace(/\D/g, ''), 10) || 1;
        if (isSaved) {
          await recipeService.removeFavorite(numId);
        } else {
          await recipeService.addFavorite(numId);
        }
      } catch (err) {
        console.warn('Favorite API call failed:', err.message);
      }
    }

    showToast(isSaved ? 'Đã bỏ lưu công thức' : 'Đã lưu công thức vào mục yêu thích');
  };

  // 10. Update specific meal in weekly plan (Local + Swap API)
  const updateDayMeal = async (dayIdx, mealType, recipeId, reason = 'Đổi món theo nhu cầu') => {
    // 10.1 Optimistic local update
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

    // 10.2 Call Backend swap if activePlanMeta exists
    const dayItem = weeklyPlan[dayIdx];
    const itemId = mealType === 'breakfast' ? dayItem?.breakfastItemId : mealType === 'lunch' ? dayItem?.lunchItemId : dayItem?.dinnerItemId;

    if (isBackendConnected && activePlanMeta?.id && itemId && getAuthToken()) {
      try {
        await mealPlanService.swapMeal(activePlanMeta.id, itemId, reason);
        showToast('Đã đổi món và đồng bộ với máy chủ Backend!');
        return;
      } catch (err) {
        console.warn('Backend swap meal failed, kept local change:', err.message);
      }
    }

    showToast('Đã đổi món thành công!');
  };

  // 11. Toggle meal completed (Log meal vs Plan meal)
  const toggleMealCompleted = async (dayIdx, mealType) => {
    const fieldKey =
      mealType === 'breakfast'
        ? 'completedBreakfast'
        : mealType === 'lunch'
        ? 'completedLunch'
        : 'completedDinner';

    const dayItem = weeklyPlan[dayIdx];
    const currentVal = !!dayItem[fieldKey];
    const willBeCompleted = !currentVal;

    // 11.1 Optimistic state update
    setWeeklyPlan(prev => {
      const copy = [...prev];
      copy[dayIdx] = {
        ...copy[dayIdx],
        [fieldKey]: willBeCompleted
      };
      try {
        localStorage.setItem('veggie_weekly_plan', JSON.stringify(copy));
      } catch (e) {
        console.warn(e);
      }
      return copy;
    });

    const mealName = mealType === 'breakfast' ? 'Bữa sáng' : mealType === 'lunch' ? 'Bữa trưa' : 'Bữa tối';

    // 11.2 Call Backend nutrition log if connected
    if (isBackendConnected && willBeCompleted && getAuthToken()) {
      try {
        const planItemId = mealType === 'breakfast' ? dayItem?.breakfastItemId : mealType === 'lunch' ? dayItem?.lunchItemId : dayItem?.dinnerItemId;
        if (planItemId) {
          await nutritionService.logMeal({ planItemId });
        } else {
          const rawRecipeId = dayItem[mealType];
          const numRecipeId = parseInt(rawRecipeId.toString().replace(/\D/g, ''), 10) || 1;
          await nutritionService.logMeal({
            recipeId: numRecipeId,
            mealType,
            servings: 1
          });
        }
        showToast(`Đã ghi nhận ${mealName} vào nhật ký dinh dưỡng Backend!`);
        return;
      } catch (err) {
        console.warn('Log meal backend call failed:', err.message);
      }
    }

    showToast(`Đã cập nhật trạng thái ${mealName}`);
  };

  // 12. Generate New AI Meal Plan
  const generateAiMealPlan = async (options = {}) => {
    setLoadingApi(true);
    try {
      if (isBackendConnected && getAuthToken()) {
        const res = await mealPlanService.generatePlan({
          days: options.days || 7,
          note: options.note || 'Thích món Việt, giàu đạm và B12',
          healthGoal: profile.goal || 'maintain',
          scanId: options.scanId || undefined
        });

        if (res && res.plan && res.plan.days) {
          setActivePlanMeta(res.plan);
          const mappedWeekly = res.plan.days.map((d, index) => {
            const breakfastItem = d.meals?.find(m => m.mealType === 'breakfast');
            const lunchItem = d.meals?.find(m => m.mealType === 'lunch');
            const dinnerItem = d.meals?.find(m => m.mealType === 'dinner');

            return {
              day: `Ngày ${index + 1}`,
              date: d.date,
              breakfast: breakfastItem?.recipeId ? `r${breakfastItem.recipeId}` : 'r4',
              breakfastItemId: breakfastItem?.id || null,
              completedBreakfast: false,
              lunch: lunchItem?.recipeId ? `r${lunchItem.recipeId}` : 'r1',
              lunchItemId: lunchItem?.id || null,
              completedLunch: false,
              dinner: dinnerItem?.recipeId ? `r${dinnerItem.recipeId}` : 'r6',
              dinnerItemId: dinnerItem?.id || null,
              completedDinner: false
            };
          });

          setWeeklyPlan(mappedWeekly);
          try {
            localStorage.setItem('veggie_weekly_plan', JSON.stringify(mappedWeekly));
          } catch (e) {}

          const warnings = res.validationWarnings || [];
          if (warnings.length > 0) {
            showToast(`Thực đơn AI mới đã sẵn sàng! ⚠️ Lưu ý: ${warnings[0]}`);
          } else {
            showToast('AI đã hoàn tất thiết lập thực đơn 7 ngày chuẩn dinh dưỡng!');
          }
          return res;
        }
      }

      // Offline simulation fallback
      showToast('Đã tạo mới thực đơn tuần theo chỉ số dinh dưỡng thể trạng!');
      return null;
    } catch (err) {
      console.warn('Generate meal plan failed:', err.message);
      showToast(`Không thể tạo thực đơn AI: ${err.message}`);
      throw err;
    } finally {
      setLoadingApi(false);
    }
  };

  // 13. Memoized WHO Biometric Metrics
  const metrics = useMemo(() => {
    return calculateBiometrics(profile);
  }, [profile]);

  // 14. Memoized Actual Consumed Nutrition for Selected Day
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
    activePlanMeta,
    selectedDayIdx,
    setSelectedDayIdx,
    currentDayPlan,
    consumedToday,
    recipesDb: RECIPES_DB,
    toggleSaveRecipe,
    updateDayMeal,
    toggleMealCompleted,
    generateAiMealPlan,
    toastMessage,
    showToast,
    isBackendConnected,
    loadingApi,
    syncWithBackend
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
