import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar, Check, RefreshCw, ShoppingBag, Sparkles,
  ChevronRight, Clock, Plus, X, Utensils, CheckSquare, Square,
  ShieldCheck, Scale, ArrowRight, Lock, Eye, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import RecipeDetailModal from '../../components/recipes/RecipeDetailModal';

export default function MealPlannerPage({ onNavigate }) {
  const { user } = useAuth();
  const [showDemoPreview, setShowDemoPreview] = useState(false);

  const {
    profile,
    metrics,
    weeklyPlan,
    selectedDayIdx,
    setSelectedDayIdx,
    currentDayPlan,
    recipesDb,
    updateDayMeal,
    toggleMealCompleted,
    toggleSaveRecipe,
    generateAiMealPlan,
    loadingApi,
    isBackendConnected,
    showToast
  } = useVeggieNutrition();

  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swappingMealType, setSwappingMealType] = useState('dinner'); // 'breakfast' | 'lunch' | 'dinner'
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState([]);

  // Map Recipe by ID
  const recipeMap = useMemo(() => {
    return new Map(recipesDb.map(r => [r.id, r]));
  }, [recipesDb]);

  const breakfastRecipe = recipeMap.get(currentDayPlan?.breakfast) || recipesDb[3];
  const lunchRecipe = recipeMap.get(currentDayPlan?.lunch) || recipesDb[0];
  const dinnerRecipe = recipeMap.get(currentDayPlan?.dinner) || recipesDb[5];

  const getNutrients = (rec, defaultCal = 400, defaultPro = 20) => {
    return {
      calories: rec?.nutrients?.calories ?? rec?.kcalPerServing ?? defaultCal,
      protein: rec?.nutrients?.protein ?? rec?.proteinG ?? defaultPro,
      b12: Number(rec?.nutrients?.b12 ?? rec?.b12Mcg ?? 1.0),
      iron: Number(rec?.nutrients?.iron ?? rec?.ironMg ?? 3.0),
      omega3: Number(rec?.nutrients?.omega3 ?? 0.6)
    };
  };

  const bNutr = useMemo(() => getNutrients(breakfastRecipe, 350, 15), [breakfastRecipe]);
  const lNutr = useMemo(() => getNutrients(lunchRecipe, 500, 25), [lunchRecipe]);
  const dNutr = useMemo(() => getNutrients(dinnerRecipe, 450, 20), [dinnerRecipe]);

  // Daily Planned Totals
  const plannedTotals = useMemo(() => {
    return {
      calories: bNutr.calories + lNutr.calories + dNutr.calories,
      protein: bNutr.protein + lNutr.protein + dNutr.protein,
      b12: Number((bNutr.b12 + lNutr.b12 + dNutr.b12).toFixed(1)),
      iron: Number((bNutr.iron + lNutr.iron + dNutr.iron).toFixed(1)),
      omega3: Number((bNutr.omega3 + lNutr.omega3 + dNutr.omega3).toFixed(1))
    };
  }, [bNutr, lNutr, dNutr]);

  // Daily Consumed Totals (only marked meals)
  const consumedTotals = useMemo(() => {
    let cal = 0, pro = 0, b12 = 0, iron = 0, count = 0;
    if (currentDayPlan?.completedBreakfast) {
      cal += bNutr.calories;
      pro += bNutr.protein;
      b12 += bNutr.b12;
      iron += bNutr.iron;
      count++;
    }
    if (currentDayPlan?.completedLunch) {
      cal += lNutr.calories;
      pro += lNutr.protein;
      b12 += lNutr.b12;
      iron += lNutr.iron;
      count++;
    }
    if (currentDayPlan?.completedDinner) {
      cal += dNutr.calories;
      pro += dNutr.protein;
      b12 += dNutr.b12;
      iron += dNutr.iron;
      count++;
    }
    return {
      calories: cal,
      protein: pro,
      b12: Number(b12.toFixed(1)),
      iron: Number(iron.toFixed(1)),
      count
    };
  }, [currentDayPlan, bNutr, lNutr, dNutr]);

  // Aggregate Smart Grocery List from today's meals
  const groceryCategories = useMemo(() => {
    const todayRecipes = [breakfastRecipe, lunchRecipe, dinnerRecipe];
    const catMap = {
      'Rau củ tươi': [],
      'Đậu hạt & Đạm thực vật': [],
      'Ngũ cốc & Mì': [],
      'Gia vị & Vi chất B12': []
    };

    todayRecipes.forEach(r => {
      (r.ingredients || []).forEach(ing => {
        const cat = ing.category || '';
        if (cat.includes('Rau')) {
          catMap['Rau củ tươi'].push(ing);
        } else if (cat.includes('Đậu') || cat.includes('Đạm')) {
          catMap['Đậu hạt & Đạm thực vật'].push(ing);
        } else if (cat.includes('Ngũ cốc')) {
          catMap['Ngũ cốc & Mì'].push(ing);
        } else {
          catMap['Gia vị & Vi chất B12'].push(ing);
        }
      });
    });

    return catMap;
  }, [breakfastRecipe, lunchRecipe, dinnerRecipe]);

  const toggleGroceryCheck = (itemName) => {
    setCheckedGroceryItems(prev =>
      prev.includes(itemName) ? prev.filter(i => i !== itemName) : [...prev, itemName]
    );
  };

  const handleOpenSwap = (mealType) => {
    setSwappingMealType(mealType);
    setSwapModalOpen(true);
  };

  const handleSelectSwapRecipe = (recipeId) => {
    updateDayMeal(selectedDayIdx, swappingMealType, recipeId);
    setSwapModalOpen(false);
  };

  const currentSwappingRecipe =
    swappingMealType === 'breakfast'
      ? breakfastRecipe
      : swappingMealType === 'lunch'
      ? lunchRecipe
      : dinnerRecipe;

  // GUEST STATE: Chưa đăng nhập thì không thể tự tiện tính ra thực đơn cá nhân hóa
  if (!user && !showDemoPreview) {
    return (
      <div className="min-h-screen bg-alabaster/40 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fade-up">
        {/* Main Hero Card */}
        <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-10 shadow-card text-center space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-emeraldBotanic/10 border border-emeraldBotanic/20 flex items-center justify-center text-forest shadow-xs">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-emeraldBotanic" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emeraldBotanic/10 text-emeraldBotanic text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cá nhân hóa bởi Veggie AI</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-forest">
              Bạn Chưa Đăng Nhập Để Nhận Thực Đơn Cá Nhân Hóa
            </h1>
            <p className="text-xs sm:text-sm text-olive leading-relaxed">
              Veggie AI tính toán thực đơn dựa trên <strong>chỉ số thể trạng (BMI)</strong>, <strong>nhu cầu Calo (TDEE)</strong> và <strong>bộ lọc dị ứng thực phẩm riêng biệt</strong>. Hiện tại bạn đang xem ở chế độ Khách, hệ thống chưa có dữ liệu để tính toán thực đơn chính xác và an toàn cho riêng bạn.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
            <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs text-forest">
                <Scale className="w-4 h-4 text-emeraldBotanic" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-forest">Chuẩn hóa thể trạng BMI</h3>
              <p className="text-[11px] sm:text-xs text-olive leading-relaxed">
                Tính toán chính xác Calo BMR & TDEE, đạm thực vật, sắt và B12 theo đúng chiều cao, cân nặng của bạn.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs text-forest">
                <ShieldCheck className="w-4 h-4 text-emeraldBotanic" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-forest">An toàn dị ứng 100%</h3>
              <p className="text-[11px] sm:text-xs text-olive leading-relaxed">
                Tự động quét và loại bỏ toàn bộ món chứa đậu phộng, mè, đậu nành, gluten... bạn đã khai báo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs text-forest">
                <ShoppingBag className="w-4 h-4 text-emeraldBotanic" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-forest">Đi chợ & Đổi món</h3>
              <p className="text-[11px] sm:text-xs text-olive leading-relaxed">
                Tự động gom nguyên liệu đi chợ thông minh cả tuần, theo dõi bữa ăn và hoán đổi món ăn linh hoạt.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('register')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-forest hover:bg-forestDark text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <span>Đăng Ký & Tạo Hồ Sơ Thể Trạng (Miễn Phí)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate('login')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-hairline bg-white hover:bg-alabaster text-forest text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Đã có tài khoản? Đăng nhập
            </button>
          </div>

          {/* Option to preview demo plan */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowDemoPreview(true)}
              className="text-xs text-olive hover:text-forest underline font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước giao diện thực đơn mẫu minh họa (Demo)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto animate-fade-up">
      {/* GUEST PREVIEW BANNER */}
      {!user && showDemoPreview && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                Chế độ xem trước (Thực đơn mẫu minh họa 2.000 kcal)
              </span>
              <p className="text-xs text-amber-800 mt-0.5">
                Dữ liệu này là thực đơn mẫu minh họa. Để AI tính toán riêng theo chỉ số BMI và loại trừ dị ứng của bạn, vui lòng đăng nhập hoặc tạo hồ sơ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('register')}
              className="px-3.5 py-1.5 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold cursor-pointer shadow-xs transition"
            >
              Tạo hồ sơ cá nhân
            </button>
            <button
              type="button"
              onClick={() => setShowDemoPreview(false)}
              className="px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer transition"
            >
              Ẩn xem trước
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          1. HEADER & DAY SELECTOR
      ==================================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-metric text-xs font-bold uppercase tracking-wider text-emeraldBotanic">
              THỰC ĐƠN TUẦN CÁ NHÂN HÓA
            </span>
            <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-forest mt-0.5">
              Kế Hoạch Dinh Dưỡng 7 Ngày
            </h1>
            <p className="text-xs text-olive mt-0.5">
              Phân bổ cân bằng theo mục tiêu {metrics.tdee} kcal & {metrics.targetProtein}g Đạm/ngày.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loadingApi}
              onClick={() => generateAiMealPlan({ days: 7, note: 'Tối ưu đạm và B12' })}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                loadingApi ? 'bg-sage text-olive border-hairline cursor-not-allowed' : 'bg-white border-hairline text-forest hover:bg-sage'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emeraldBotanic ${loadingApi ? 'animate-spin' : ''}`} />
              <span>{loadingApi ? 'AI Đang Lập Thực Đơn (Gemini)...' : 'Tạo Lại Thực Đơn AI'}</span>
            </button>
          </div>
        </div>

        {/* 7 Days Button Strip */}
        {weeklyPlan && weeklyPlan.length > 0 && (
          <div className="grid grid-cols-7 gap-1.5 sm:gap-3 bg-white p-2 rounded-2xl border border-hairline shadow-xs">
            {weeklyPlan.map((d, idx) => {
              const isSelected = selectedDayIdx === idx;
              const completedCount =
                (d.completedBreakfast ? 1 : 0) +
                (d.completedLunch ? 1 : 0) +
                (d.completedDinner ? 1 : 0);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`py-3 px-1 sm:px-2 rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-between gap-1 ${
                    isSelected
                      ? 'bg-forest text-white shadow-xs'
                      : 'hover:bg-alabaster text-forest'
                  }`}
                >
                  <span className="text-[11px] font-bold block">{d.day}</span>
                  <span className={`text-[10px] font-metric block ${isSelected ? 'text-emerald-300' : 'text-olive'}`}>
                    {d.date}
                  </span>

                  {/* Status Dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      completedCount === 3
                        ? 'bg-emerald-400'
                        : completedCount > 0
                        ? 'bg-amber-400'
                        : isSelected
                        ? 'bg-white/40'
                        : 'bg-hairline'
                    }`}
                  ></span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {(!weeklyPlan || weeklyPlan.length === 0) ? (
        <div className="bg-white rounded-3xl border border-hairline p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6 shadow-xs animate-fade-up my-6">
          <div className="w-16 h-16 rounded-2xl bg-emeraldBotanic/10 text-emeraldBotanic flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="font-metric text-xs font-bold uppercase tracking-wider text-emeraldBotanic">
              CHƯA CÓ THỰC ĐƠN TUẦN CÁ NHÂN HÓA
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-forest">
              Khởi Tạo Kế Hoạch Dinh Dưỡng 7 Ngày
            </h2>
            <p className="text-xs sm:text-sm text-olive max-w-md mx-auto leading-relaxed">
              Trí tuệ nhân tạo Gemini trên máy chủ sẽ tự động tính toán nhu cầu dinh dưỡng ({metrics?.tdee || 2000} kcal/ngày), phân bổ vi chất và loại trừ các nguyên liệu dị ứng của bạn.
            </p>
          </div>
          <button
            type="button"
            disabled={loadingApi}
            onClick={() => generateAiMealPlan({ days: 7, note: 'Tối ưu dinh dưỡng và cân bằng vi chất' })}
            className="px-6 py-3.5 rounded-2xl bg-forest hover:bg-forestDark text-white text-xs sm:text-sm font-bold transition cursor-pointer shadow-xs inline-flex items-center gap-2 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loadingApi ? 'animate-spin' : ''}`} />
            <span>{loadingApi ? 'AI Đang Lập Thực Đơn (Gemini)...' : 'Khởi Tạo Thực Đơn AI 7 Ngày Ngay'}</span>
          </button>
        </div>
      ) : (
        <>

      {/* ====================================================================
          2. NUTRITION COMPARISON: PLANNED VS CONSUMED
      ==================================================================== */}
      <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-4">
          <div>
            <span className="font-metric text-xs font-bold uppercase text-emeraldBotanic">
              ĐỐI SOÁT THỰC ĐƠN ({currentDayPlan?.day || 'Ngày 1'} • {currentDayPlan?.date || ''})
            </span>
            <h3 className="font-editorial text-lg sm:text-xl font-bold text-forest">
              Năng Lượng Dự Kiến vs. Thực Tế Đã Dùng
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-alabaster border border-hairline text-olive">
            Đã hoàn thành {consumedTotals.count}/3 bữa ăn
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline">
            <span className="text-[10px] uppercase font-bold text-olive block">Calo Dự Kiến</span>
            <p className="font-metric text-lg font-bold text-forest mt-0.5">{plannedTotals.calories} kcal</p>
            <span className="text-[11px] text-emeraldBotanic font-metric block mt-0.5">
              Đã nạp: {consumedTotals.calories} kcal
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline">
            <span className="text-[10px] uppercase font-bold text-olive block">Đạm Thực Vật</span>
            <p className="font-metric text-lg font-bold text-forest mt-0.5">{plannedTotals.protein}g</p>
            <span className="text-[11px] text-emeraldBotanic font-metric block mt-0.5">
              Đã nạp: {consumedTotals.protein}g / {metrics.targetProtein}g
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline">
            <span className="text-[10px] uppercase font-bold text-olive block">Vitamin B12</span>
            <p className="font-metric text-lg font-bold text-forest mt-0.5">{plannedTotals.b12} µg</p>
            <span className="text-[11px] text-emeraldBotanic font-metric block mt-0.5">
              Đã nạp: {consumedTotals.b12} / 2.4 µg
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline">
            <span className="text-[10px] uppercase font-bold text-olive block">Sắt Non-Heme</span>
            <p className="font-metric text-lg font-bold text-forest mt-0.5">{plannedTotals.iron} mg</p>
            <span className="text-[11px] text-emeraldBotanic font-metric block mt-0.5">
              Đã nạp: {consumedTotals.iron} / 18 mg
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. THREE MEAL SLOTS (SÁNG • TRƯA • TỐI)
      ==================================================================== */}
      <div className="space-y-4">
        {[
          {
            key: 'breakfast',
            title: 'Bữa Sáng (Nạp Năng Lượng Đầu Ngày)',
            recipe: breakfastRecipe,
            isCompleted: !!currentDayPlan.completedBreakfast
          },
          {
            key: 'lunch',
            title: 'Bữa Trưa (Đầy Đủ Đạm & Hoạt Hóa Cơ Thể)',
            recipe: lunchRecipe,
            isCompleted: !!currentDayPlan.completedLunch
          },
          {
            key: 'dinner',
            title: 'Bữa Tối (Nhẹ Bụng & Hồi Phục)',
            recipe: dinnerRecipe,
            isCompleted: !!currentDayPlan.completedDinner
          }
        ].map(slot => {
          const sNutr = getNutrients(slot.recipe);
          const sImg = slot.recipe?.image || slot.recipe?.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80';
          return (
          <div
            key={slot.key}
            className={`bg-white rounded-3xl border p-4 sm:p-6 transition flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs ${
              slot.isCompleted ? 'border-emerald-500/30 bg-emerald-50/20' : 'border-hairline'
            }`}
          >
            {/* Left: Checkbox + Thumbnail + Details */}
            <div className="flex items-start sm:items-center gap-4 flex-1">
              {/* Checkbox Chốt Đã Dùng Bữa */}
              <button
                type="button"
                onClick={() => toggleMealCompleted(selectedDayIdx, slot.key)}
                className={`p-2 rounded-xl transition cursor-pointer shrink-0 mt-1 sm:mt-0 ${
                  slot.isCompleted
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-alabaster hover:bg-sage border border-hairline text-olive'
                }`}
                title={slot.isCompleted ? 'Bỏ đánh dấu' : 'Đánh dấu đã ăn bữa này'}
              >
                <Check className="w-5 h-5" />
              </button>

              {/* Recipe Thumbnail */}
              <div
                onClick={() => setSelectedRecipeDetail(slot.recipe)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-alabaster shrink-0 cursor-pointer group"
              >
                <img
                  src={sImg}
                  alt={slot.recipe?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Info */}
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-metric uppercase font-bold text-emeraldBotanic tracking-wider">
                  {slot.title}
                </span>
                <h4
                  onClick={() => setSelectedRecipeDetail(slot.recipe)}
                  className="font-editorial text-base sm:text-lg font-bold text-forest truncate hover:text-emeraldBotanic cursor-pointer transition"
                >
                  {slot.recipe?.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs font-metric text-olive">
                  <span>{sNutr.calories} kcal</span>
                  <span>•</span>
                  <span className="font-semibold text-emeraldBotanic">{sNutr.protein}g Đạm</span>
                  <span>•</span>
                  <span>{sNutr.b12}µg B12</span>
                  <span>•</span>
                  <span>{slot.recipe?.prepTime || 20} phút</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
              <button
                type="button"
                onClick={() => handleOpenSwap(slot.key)}
                className="px-3.5 py-2 rounded-xl bg-alabaster hover:bg-sage border border-hairline text-xs font-semibold text-forest transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emeraldBotanic" />
                <span>Đổi Món</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecipeDetail(slot.recipe)}
                className="px-3.5 py-2 rounded-xl bg-forest hover:bg-forestDark text-alabaster text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Xem Công Thức
              </button>
            </div>
          </div>
        );
        })}
      </div>

      {/* ====================================================================
          4. SMART GROCERY LIST (GOM THEO QUẦY KỆ SIÊU THỊ)
      ==================================================================== */}
      <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-4">
          <div>
            <span className="font-metric text-xs font-bold uppercase text-emeraldBotanic">
              DANH SÁCH ĐI CHỢ THÔNG MINH
            </span>
            <h3 className="font-editorial text-xl font-bold text-forest mt-0.5">
              Nguyên Liệu Cần Mua Hôm Nay ({currentDayPlan?.day || 'Ngày 1'})
            </h3>
          </div>
          <span className="text-xs text-olive">
            Gom nhóm theo 4 quầy kệ để bạn tiết kiệm thời gian khi đi chợ/siêu thị
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(groceryCategories).map(([catName, items]) => (
            <div key={catName} className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-forest block border-b border-hairline/80 pb-2">
                {catName} ({items.length})
              </span>

              <div className="space-y-1.5">
                {items.map((ing, idx) => {
                  const isChecked = checkedGroceryItems.includes(ing.name);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleGroceryCheck(ing.name)}
                      className="flex items-center gap-2 text-xs cursor-pointer group py-0.5"
                    >
                      <button type="button" className="text-emeraldBotanic shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-olive/60 group-hover:text-forest" />
                        )}
                      </button>
                      <span className={`flex-1 ${isChecked ? 'line-through text-olive/50' : 'text-forest font-medium'}`}>
                        {ing.name}
                      </span>
                      <span className="font-metric text-[11px] text-olive font-semibold">{ing.amount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {/* ====================================================================
          MODAL: SWAP MEAL QUICK SELECTOR
      ==================================================================== */}
      {swapModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setSwapModalOpen(false)}
          className="fixed inset-0 z-[9999] bg-forestDark/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white border border-hairline rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto animate-fade-up my-auto"
          >
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <h3 className="font-editorial text-xl font-bold text-forest">
                  Đổi Món Cho {swappingMealType === 'breakfast' ? 'Bữa Sáng' : swappingMealType === 'lunch' ? 'Bữa Trưa' : 'Bữa Tối'}
                </h3>
                <p className="text-xs text-olive mt-0.5">
                  Món hiện tại: <strong>{currentSwappingRecipe?.title}</strong> ({getNutrients(currentSwappingRecipe).calories} kcal)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSwapModalOpen(false)}
                className="p-2 rounded-xl hover:bg-sage text-olive hover:text-forest cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {recipesDb.map(recipe => {
                const rNutr = getNutrients(recipe);
                const curNutr = getNutrients(currentSwappingRecipe);
                const calDiff = rNutr.calories - curNutr.calories;
                const proDiff = rNutr.protein - curNutr.protein;
                const isCurrent = recipe.id === currentSwappingRecipe?.id;
                const rImg = recipe.image || recipe.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={recipe.id}
                    onClick={() => handleSelectSwapRecipe(recipe.id)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                      isCurrent
                        ? 'border-forest bg-forest/5 cursor-default'
                        : 'border-hairline hover:border-forest hover:bg-alabaster'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={rImg}
                        alt={recipe.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-forest truncate">{recipe.title}</p>
                        <p className="text-[11px] font-metric text-olive">
                          {rNutr.calories} kcal • {rNutr.protein}g đạm • {recipe.prepTime || 20}p
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right text-[11px] font-metric font-bold">
                        <span className={calDiff >= 0 ? 'text-emeraldBotanic' : 'text-amber-600'}>
                          {calDiff >= 0 ? `+${calDiff}` : calDiff} kcal
                        </span>
                        <span className="block text-olive">
                          {proDiff >= 0 ? `+${proDiff}` : proDiff}g đạm
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          isCurrent ? 'bg-hairline text-olive cursor-default' : 'bg-forest text-alabaster hover:bg-forestDark'
                        }`}
                      >
                        {isCurrent ? 'Đang chọn' : 'Chọn món'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Detail Modal */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          isSaved={(profile?.savedRecipeIds || []).includes(selectedRecipeDetail.id)}
          onToggleSave={toggleSaveRecipe}
        />
      )}

      {/* AI Meal Plan Generation Loading Modal */}
      {loadingApi && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-forest/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-floating border border-hairline text-center animate-fade-up">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-emeraldBotanic/20 animate-ping opacity-75"></div>
              <div className="relative w-20 h-20 rounded-3xl bg-forest flex items-center justify-center text-white shadow-card">
                <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-metric text-[11px] font-bold uppercase tracking-wider text-emeraldBotanic">
                TRỢ LÝ DINH DƯỠNG GOOGLE GEMINI
              </span>
              <h3 className="font-editorial text-2xl font-bold text-forest">
                Đang Khởi Tạo Thực Đơn 7 Ngày
              </h3>
              <p className="text-xs text-olive leading-relaxed">
                Hệ thống AI đang phân tích hồ sơ thể trạng, tối ưu 21 bữa ăn thuần chay và cân bằng mục tiêu năng lượng ({metrics?.tdee || 2000} kcal/ngày), Đạm, Sắt và B12.
              </p>
            </div>

            {/* Stepper info */}
            <div className="bg-alabaster p-4 rounded-2xl border border-hairline text-left space-y-2.5 text-xs text-forest">
              <div className="flex items-center gap-2.5 text-forest font-medium">
                <CheckCircle2 className="w-4 h-4 text-emeraldBotanic shrink-0" />
                <span>1. Đọc hồ sơ thể trạng & mục tiêu dinh dưỡng</span>
              </div>
              <div className="flex items-center gap-2.5 text-forest font-bold">
                <RefreshCw className="w-4 h-4 text-emeraldBotanic animate-spin shrink-0" />
                <span>2. AI Gemini chọn món & cân bằng vi chất 7 ngày...</span>
              </div>
              <div className="flex items-center gap-2.5 text-olive">
                <div className="w-4 h-4 rounded-full border border-hairline flex items-center justify-center text-[10px] shrink-0 font-metric">3</div>
                <span>3. Thẩm định calo (±12%) & lưu trữ vào hệ thống</span>
              </div>
            </div>

            <div className="text-[11px] text-olive bg-emerald-50/80 p-3 rounded-xl border border-emerald-100 flex items-center gap-2 text-left">
              <Clock className="w-4 h-4 text-emeraldBotanic shrink-0" />
              <span>Thời gian xử lý: <strong>khoảng 60 - 90 giây</strong> do Gemini giải bài toán 21 bữa ăn. Vui lòng không tắt hoặc tải lại trang!</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
