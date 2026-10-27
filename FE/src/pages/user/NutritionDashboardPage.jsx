import React, { useState } from 'react';
import { 
  Flame, TrendingUp, ShieldCheck, Zap, Activity, ChevronRight,
  Plus, Calendar, Clock, CheckCircle2, Sparkles, ArrowRight,
  Info, AlertCircle, X, Download, Droplets, Scale, Check, Utensils
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';

export default function NutritionDashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const {
    profile,
    metrics,
    weeklyPlan,
    currentDayPlan,
    consumedToday,
    recipesDb,
    showToast
  } = useVeggieNutrition();

  const [waterCups, setWaterCups] = useState(6); // 250ml per cup = 1.5L
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [quickDishName, setQuickDishName] = useState('');
  const [quickCalo, setQuickCalo] = useState('');
  const [quickProtein, setQuickProtein] = useState('');
  const [extraLoggedMeals, setExtraLoggedMeals] = useState([]);

  // Calculate Calorie and Macro Percentages
  const targetKcal = metrics?.tdee || 2000;
  const targetProtein = metrics?.targetProtein || 70;
  const targetCarbs = metrics?.targetCarbs || 240;
  const targetFat = metrics?.targetFat || 55;

  const totalExtraKcal = extraLoggedMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  const totalExtraProtein = extraLoggedMeals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);

  const currentKcal = (consumedToday?.calories || 0) + totalExtraKcal;
  const currentProtein = (consumedToday?.protein || 0) + totalExtraProtein;
  const currentCarbs = consumedToday?.carbs || 0;
  const currentFat = consumedToday?.fat || 0;

  const caloPct = Math.min(100, Math.round((currentKcal / targetKcal) * 100));
  const proteinPct = Math.min(100, Math.round((currentProtein / targetProtein) * 100));
  const carbsPct = Math.min(100, Math.round((currentCarbs / targetCarbs) * 100));
  const fatPct = Math.min(100, Math.round((currentFat / targetFat) * 100));

  // Compute 7-day chart data dynamically from weeklyPlan
  const chartDays = (weeklyPlan && weeklyPlan.length > 0)
    ? weeklyPlan.map((d, idx) => {
        const cal = (d.completedBreakfast ? 400 : 0) + (d.completedLunch ? 550 : 0) + (d.completedDinner ? 450 : 0);
        return {
          day: d.day || `Ngày ${idx + 1}`,
          date: d.date ? d.date.slice(5) : `D${idx + 1}`,
          total: cal > 0 ? cal : (idx === 0 ? currentKcal : Math.round(targetKcal * (0.85 + (idx % 3) * 0.05))),
          isToday: idx === 0
        };
      })
    : [
        { day: 'Th 2', date: 'D1', total: currentKcal || 1850, isToday: true },
        { day: 'Th 3', date: 'D2', total: 1920 },
        { day: 'Th 4', date: 'D3', total: 2010 },
        { day: 'Th 5', date: 'D4', total: 1980 },
        { day: 'Th 6', date: 'D5', total: 2050 },
        { day: 'Th 7', date: 'D6', total: 2100 },
        { day: 'CN',   date: 'D7', total: 1950 }
      ];

  const handleAddQuickLog = (e) => {
    e.preventDefault();
    if (!quickDishName.trim()) return;

    const newMeal = {
      id: `extra-${Date.now()}`,
      title: quickDishName.trim(),
      calories: Number(quickCalo) || 200,
      protein: Number(quickProtein) || 8,
      time: 'Vừa xong'
    };

    setExtraLoggedMeals(prev => [newMeal, ...prev]);
    setQuickDishName('');
    setQuickCalo('');
    setQuickProtein('');
    setShowQuickLogModal(false);
    if (showToast) showToast(`✓ Đã nạp thêm ${newMeal.calories} kcal vào nhật ký dinh dưỡng!`);
  };

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-2 border border-blue-100">
            <Activity className="w-3.5 h-3.5" />
            <span>PHÂN TÍCH CHỈ SỐ DINH DƯỠNG THUẦN CHAY</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-forest">
            Bảng Theo Dõi Dinh Dưỡng Cá Nhân
          </h1>
          <p className="text-xs text-olive mt-1">
            Đo lường năng lượng tiêu thụ, tỷ lệ hấp thụ đạm thực vật và kiểm soát mục tiêu theo thể trạng của bạn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowQuickLogModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>Ghi nhanh bữa ăn</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('planner')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-hairline bg-white hover:bg-slate-50 text-forest text-xs font-semibold transition cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Thực đơn tuần</span>
          </button>
        </div>
      </div>

      {/* 4 TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white rounded-3xl border border-hairline p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-olive">Năng Lượng Hôm Nay</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-editorial text-3xl font-bold text-forest">{currentKcal}</span>
            <span className="text-xs text-olive font-metric">/ {targetKcal} kcal</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${caloPct}%` }}></div>
          </div>
          <div className="flex justify-between text-[11px] text-olive font-metric">
            <span>Tiến độ: {caloPct}%</span>
            <span>Còn lại: {Math.max(0, targetKcal - currentKcal)} kcal</span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-white rounded-3xl border border-hairline p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-olive">Đạm Thực Vật</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-editorial text-3xl font-bold text-forest">{currentProtein}g</span>
            <span className="text-xs text-olive font-metric">/ {targetProtein}g</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${proteinPct}%` }}></div>
          </div>
          <div className="flex justify-between text-[11px] text-olive font-metric">
            <span>Mục tiêu cơ bắp</span>
            <span className="font-bold text-blue-700">{proteinPct}%</span>
          </div>
        </div>

        {/* BMI & Biometrics Card */}
        <div className="bg-white rounded-3xl border border-hairline p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-olive">Chỉ Số BMI</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-editorial text-3xl font-bold text-forest">{metrics?.bmi || 21.5}</span>
            <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50">
              {metrics?.category || 'Lý tưởng'}
            </span>
          </div>
          <p className="text-[11px] text-olive leading-tight">
            Thể trạng: {profile?.height || 165}cm • {profile?.weight || 55}kg • TDEE: {metrics?.tdee || 2000} kcal
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('user-profile')}
              className="text-xs font-bold text-emerald-700 hover:text-forest flex items-center gap-1 cursor-pointer"
            >
              <span>Chỉnh sửa hồ sơ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Water Intake Card */}
        <div className="bg-white rounded-3xl border border-hairline p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-olive">Nước Uống</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-editorial text-3xl font-bold text-forest">{(waterCups * 0.25).toFixed(1)}L</span>
            <span className="text-xs text-olive font-metric">/ 2.0L (8 ly)</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setWaterCups(c)}
                className={`w-6 h-6 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center justify-center ${
                  c <= waterCups ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                }`}
                title={`Uống ${c * 250}ml`}
              >
                💧
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 7-DAY NUTRITION TREND CHART */}
      <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-editorial text-xl font-bold text-forest">Xu Hướng Năng Lượng Tuần</h2>
            <p className="text-xs text-olive">Biểu đồ tổng lượng calo nạp vào so với mức TDEE mục tiêu ({targetKcal} kcal)</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-metric">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span className="text-slate-600">Đã nạp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 border-t-2 border-dashed border-amber-500"></span>
              <span className="text-slate-600">Mục tiêu TDEE</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-hairline pb-4">
          {chartDays.map((d, i) => {
            const heightPct = Math.min(100, Math.round((d.total / (targetKcal * 1.25)) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-metric font-bold text-forest opacity-0 group-hover:opacity-100 transition">
                  {d.total}k
                </span>
                <div className="w-full max-w-[48px] bg-slate-100 rounded-xl h-full flex items-end p-1 relative">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      d.isToday ? 'bg-emerald-600' : 'bg-forest/80 group-hover:bg-emerald-500'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-slate-700">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TODAY'S LOGGED MEALS */}
      <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-hairline">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" />
            <h2 className="font-editorial text-xl font-bold text-forest">Nhật Ký Bữa Ăn Hôm Nay</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowQuickLogModal(true)}
            className="text-xs font-bold text-emerald-700 hover:text-forest flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm món đã ăn</span>
          </button>
        </div>

        <div className="space-y-3">
          {/* Main 3 meals from active plan */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-hairline flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Bữa Sáng</span>
              <p className="text-sm font-bold text-forest">Cháo Yến Mạch Hạt Chia & Táo Quế</p>
              <span className="text-xs text-olive font-metric">350 kcal • 15g Đạm</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              ✓ Đã hoàn thành
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-hairline flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Bữa Trưa</span>
              <p className="text-sm font-bold text-forest">Poke Quinoa Tempeh Nướng Sốt Mè Rang</p>
              <span className="text-xs text-olive font-metric">520 kcal • 26g Đạm</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              ✓ Đã hoàn thành
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-hairline flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Bữa Tối</span>
              <p className="text-sm font-bold text-forest">Canh Nấm Thược Dược Hạt Sen Tươi & Đậu Hũ Non</p>
              <span className="text-xs text-olive font-metric">420 kcal • 20g Đạm</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
              Kế hoạch
            </span>
          </div>

          {/* Extra logged snacks/meals */}
          {extraLoggedMeals.map((meal) => (
            <div key={meal.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between animate-fade-up">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Bữa phụ / Nạp thêm</span>
                <p className="text-sm font-bold text-forest">{meal.title}</p>
                <span className="text-xs text-olive font-metric">{meal.calories} kcal • {meal.protein}g Đạm • {meal.time}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 text-xs font-bold">
                ✓ Ghi nhận
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK LOG MODAL */}
      {showQuickLogModal && (
        <div
          onClick={() => setShowQuickLogModal(false)}
          className="fixed inset-0 z-[9999] bg-forest/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-floating border border-hairline animate-fade-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="font-editorial text-lg font-bold text-forest">Ghi Nhanh Bữa Ăn</h3>
              <button
                type="button"
                onClick={() => setShowQuickLogModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuickLog} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-forest block mb-1">Tên món ăn / Đồ uống</label>
                <input
                  type="text"
                  required
                  value={quickDishName}
                  onChange={(e) => setQuickDishName(e.target.value)}
                  placeholder="VD: Sinh tố bơ chuối, Sữa đậu nành..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-50 outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-forest block mb-1">Năng lượng (kcal)</label>
                  <input
                    type="number"
                    value={quickCalo}
                    onChange={(e) => setQuickCalo(e.target.value)}
                    placeholder="VD: 250"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-50 outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-forest block mb-1">Chất đạm (g)</label>
                  <input
                    type="number"
                    value={quickProtein}
                    onChange={(e) => setQuickProtein(e.target.value)}
                    placeholder="VD: 10"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-50 outline-none focus:border-forest"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-bold transition cursor-pointer"
              >
                Lưu vào nhật ký hôm nay
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
