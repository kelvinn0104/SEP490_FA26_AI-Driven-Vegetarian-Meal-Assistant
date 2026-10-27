import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  DEFAULT_PROFILE,
  DEMO_PROFILES
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
  getAuthToken,
  getStoredUser
} from '../api';

const VeggieNutritionContext = createContext(null);

export function VeggieNutritionProvider({ children }) {
  const { user } = useAuth();

  // 1. Connection & Loading Status
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);

  // 2. User Profile State (persisted in localStorage + synced with Backend)
  const [profile, setProfileState] = useState(() => {
    if (!getAuthToken() && !getStoredUser()) return null;
    try {
      const saved = localStorage.getItem('veggie_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load profile from storage', e);
    }
    return null;
  });

  // 3. Weekly Plan State (persisted in localStorage + synced with Backend)
  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('veggie_weekly_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load plan from storage', e);
    }
    return [];
  });

  // Active Plan Metadata from Backend (e.g. planId, status, dailyTargets)
  const [activePlanMeta, setActivePlanMeta] = useState(null);

  // 4. Recipes State (chỉ lấy trực tiếp từ Backend API, không dùng mock)
  const [recipesDb, setRecipesDb] = useState([]);

  // 5. Navigation & Day selection
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // 6. Toast notification state
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
      const isOnline = !!health && (
        String(health.status || '').toLowerCase() === 'healthy' ||
        health.success === true ||
        !!health.cluster ||
        !!health.service
      );
      setIsBackendConnected(isOnline);

      if (!isOnline) {
        console.info('[VeggieAI] Đang chờ kết nối tới Live Backend Render...');
        return;
      }

      // 6.1 Sync Real Public Recipes from Backend (No token required)
      try {
        const recipeRes = await recipeService.getRecipes({ pageSize: 50 });
        const items = recipeRes?.items || (Array.isArray(recipeRes) ? recipeRes : null);
        if (items && items.length > 0) {
          const mapped = items.map(r => {
            const rawId = String(r.id || '').trim();
            const normalizedId = rawId.startsWith('r') ? rawId : `r${rawId}`;
            return {
              id: normalizedId,
              dbId: r.id,
              title: r.title,
              subtitle: r.description || r.instructions || '',
              prepTime: r.prepTime || 20,
              servings: r.servings || 2,
              region: 'vietnam',
              nutrients: {
                calories: r.kcalPerServing || 400,
                protein: r.proteinG || 18,
                carbs: r.carbG || 45,
                fat: r.fatG || 10,
                b12: r.b12Mcg || 1.2,
                iron: r.ironMg || 3.5,
                zinc: r.zincMg || 2.5,
                calcium: r.calciumMg || 150
              },
              ingredients: Array.isArray(r.ingredients)
                ? r.ingredients.map(ing => ({
                    name: ing.name || ing.ingredientName || 'Nguyên liệu',
                    amount: ing.amount || `${ing.quantityG || ing.quantity || ''} ${ing.unit || 'g'}`.trim(),
                    category: ing.category || 'Nguyên liệu thực vật'
                  }))
                : [],
              instructions: r.instructions || '',
              matchScore: 95,
              matchReason: 'Công thức từ cơ sở dữ liệu VeggieAI',
              image: r.imageUrl ? (r.imageUrl.startsWith('http') ? r.imageUrl : `/uploads/${r.imageUrl}`) : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80'
            };
          });
          setRecipesDb(mapped);
        }
      } catch (err) {
        console.warn('Không thể đồng bộ công thức từ Backend:', err.message);
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

  // Đồng bộ khi trạng thái user thay đổi (đăng nhập / đăng xuất)
  useEffect(() => {
    if (user) {
      if (!profile) {
        const initial = {
          ...DEFAULT_PROFILE,
          name: user.name || 'Hội viên VeggieAI',
          diet: user.dietType === 'vegan' ? 'Thuần chay (Vegan)' : user.dietType || 'Thuần chay (Vegan)',
          allergies: user.allergies || []
        };
        setProfileState(initial);
        try {
          localStorage.setItem('veggie_user_profile', JSON.stringify(initial));
        } catch {}
      }
      syncWithBackend();
    } else {
      setProfileState(null);
    }
  }, [user]);

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
    if (!profile) {
      showToast('Vui lòng đăng nhập để lưu công thức yêu thích');
      return;
    }
    const currentSaved = profile?.savedRecipeIds || [];
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
        const swapRes = await mealPlanService.swapMeal(activePlanMeta.id, itemId, reason);
        if (swapRes && swapRes.plan && swapRes.plan.days) {
          setActivePlanMeta(swapRes.plan);
          const formatRId = (id, fallback) => {
            if (!id) return fallback;
            const s = String(id).trim();
            return s.startsWith('r') ? s : `r${s}`;
          };
          const mappedWeekly = swapRes.plan.days.map((d, index) => {
            const b = d.meals?.find(m => m.mealType === 'breakfast');
            const l = d.meals?.find(m => m.mealType === 'lunch');
            const din = d.meals?.find(m => m.mealType === 'dinner');
            return {
              day: `Ngày ${index + 1}`,
              date: d.date,
              breakfast: b?.recipeId ? formatRId(b.recipeId, 'r4') : (weeklyPlan[index]?.breakfast || 'r4'),
              breakfastItemId: b?.id || null,
              completedBreakfast: weeklyPlan[index]?.completedBreakfast || false,
              lunch: l?.recipeId ? formatRId(l.recipeId, 'r1') : (weeklyPlan[index]?.lunch || 'r1'),
              lunchItemId: l?.id || null,
              completedLunch: weeklyPlan[index]?.completedLunch || false,
              dinner: din?.recipeId ? formatRId(din.recipeId, 'r6') : (weeklyPlan[index]?.dinner || 'r6'),
              dinnerItemId: din?.id || null,
              completedDinner: weeklyPlan[index]?.completedDinner || false
            };
          });
          setWeeklyPlan(mappedWeekly);
          try {
            localStorage.setItem('veggie_weekly_plan', JSON.stringify(mappedWeekly));
          } catch (e) {}
        }
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
        const rawGoal = (options.healthGoal || profile?.goal || 'maintain').toLowerCase();
        const validGoal = rawGoal.includes('loss') || rawGoal.includes('fat') || rawGoal.includes('giảm')
          ? 'loss'
          : rawGoal.includes('gain') || rawGoal.includes('muscle') || rawGoal.includes('tăng')
          ? 'gain'
          : 'maintain';

        const res = await mealPlanService.generatePlan({
          days: options.days || 7,
          note: options.note || 'Thích món Việt, giàu đạm và B12',
          healthGoal: validGoal,
          scanId: options.scanId || undefined
        });

        if (res && res.plan && res.plan.days) {
          setActivePlanMeta(res.plan);
          const formatRId = (id, fallback) => {
            if (!id) return fallback;
            const s = String(id).trim();
            return s.startsWith('r') ? s : `r${s}`;
          };
          const mappedWeekly = res.plan.days.map((d, index) => {
            const breakfastItem = d.meals?.find(m => m.mealType === 'breakfast');
            const lunchItem = d.meals?.find(m => m.mealType === 'lunch');
            const dinnerItem = d.meals?.find(m => m.mealType === 'dinner');

            return {
              day: `Ngày ${index + 1}`,
              date: d.date,
              breakfast: breakfastItem?.recipeId ? formatRId(breakfastItem.recipeId, 'r4') : 'r4',
              breakfastItemId: breakfastItem?.id || null,
              completedBreakfast: false,
              lunch: lunchItem?.recipeId ? formatRId(lunchItem.recipeId, 'r1') : 'r1',
              lunchItemId: lunchItem?.id || null,
              completedLunch: false,
              dinner: dinnerItem?.recipeId ? formatRId(dinnerItem.recipeId, 'r6') : 'r6',
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

      if (!getAuthToken()) {
        showToast('Vui lòng đăng nhập để hệ thống AI tạo thực đơn cá nhân hóa.');
        return null;
      }
      showToast('Máy chủ AI không trả về dữ liệu thực đơn hợp lệ. Vui lòng thử lại.');
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
    if (!profile) {
      return {
        bmi: '--',
        category: 'Chưa thiết lập',
        bmr: 1500,
        tdee: 2000,
        targetProtein: 65,
        targetCarbs: 240,
        targetFat: 55,
        bmiSpectrumPct: 50,
        isGuest: true
      };
    }
    return calculateBiometrics(profile);
  }, [profile]);

  // 14. Memoized Actual Consumed Nutrition for Selected Day
  const currentDayPlan = (weeklyPlan && weeklyPlan.length > 0) ? (weeklyPlan[selectedDayIdx] || weeklyPlan[0]) : null;
  const consumedToday = useMemo(() => {
    if (!currentDayPlan) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0, b12: 0, iron: 0, zinc: 0, calcium: 0 };
    }
    return calculateConsumedNutrition(currentDayPlan, recipesDb);
  }, [currentDayPlan, recipesDb]);

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
    recipesDb,
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
