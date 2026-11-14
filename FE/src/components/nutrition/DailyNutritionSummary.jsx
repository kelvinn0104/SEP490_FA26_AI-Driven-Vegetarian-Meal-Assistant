import React from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';

export default function DailyNutritionSummary({
  consumed = {},
  metrics = {},
  selectedDay = 'Hôm nay',
  onNavigateToPlanner
}) {
  const safeConsumed = consumed || {};
  const safeMetrics = metrics || {};

  const caloPct = Math.min(100, Math.round(((safeConsumed.calories || 0) / (safeMetrics.tdee || 2000)) * 100));
  const proteinPct = Math.min(100, Math.round(((safeConsumed.protein || 0) / (safeMetrics.targetProtein || 70)) * 100));
  const b12Pct = Math.min(100, Math.round(((safeConsumed.b12 || 0) / 2.4) * 100));
  const ironPct = Math.min(100, Math.round(((safeConsumed.iron || 0) / 18.0) * 100));
  const zincPct = Math.min(100, Math.round(((safeConsumed.zinc || 0) / 11.0) * 100));
  const calciumPct = Math.min(100, Math.round(((safeConsumed.calcium || 0) / 1000) * 100));

  const isCompletedAll = caloPct >= 95 && proteinPct >= 95;

  return (
    <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-7 shadow-xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
        <div>
          <span className="font-metric text-xs font-bold uppercase tracking-wider text-emeraldBotanic">
            TIẾN ĐỘ THỰC TẾ
          </span>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-forest mt-0.5">
            Tổng Hợp Dinh Dưỡng Trong Ngày ({selectedDay})
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
              isCompletedAll
                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                : 'bg-forest/5 text-forest border border-hairline'
            }`}
          >
            {isCompletedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đạt Mục Tiêu Ngày</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emeraldBotanic animate-pulse"></span>
                <span>Đang Nạp Năng Lượng ({safeConsumed.mealsCount || 0}/3 Bữa)</span>
              </>
            )}
          </span>

          {onNavigateToPlanner && (
            <button
              type="button"
              onClick={onNavigateToPlanner}
              className="text-xs font-semibold text-emeraldBotanic hover:text-forest flex items-center gap-0.5 cursor-pointer"
            >
              <span>Xem Lịch Tuần</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2 Main Macro Progress Bars: Calo & Protein */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Calorie Card */}
        <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase tracking-wider text-olive">Năng Lượng Đã Nạp</span>
            <div className="flex items-baseline gap-1">
              <span className="font-metric text-lg font-bold text-forest">{safeConsumed.calories || 0}</span>
              <span className="text-xs text-olive font-metric">/ {safeMetrics.tdee || 2000} kcal</span>
              <span className="font-metric text-xs font-semibold text-emeraldBotanic ml-1">({caloPct}%)</span>
            </div>
          </div>
          <div className="w-full bg-hairline rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emeraldBotanic h-full rounded-full transition-all duration-500"
              style={{ width: `${caloPct}%` }}
            ></div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase tracking-wider text-olive">Đạm Thực Vật</span>
            <div className="flex items-baseline gap-1">
              <span className="font-metric text-lg font-bold text-forest">{safeConsumed.protein || 0}</span>
              <span className="text-xs text-olive font-metric">/ {safeMetrics.targetProtein || 70}g</span>
              <span className="font-metric text-xs font-semibold text-emeraldBotanic ml-1">({proteinPct}%)</span>
            </div>
          </div>
          <div className="w-full bg-hairline rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-forest h-full rounded-full transition-all duration-500"
              style={{ width: `${proteinPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 4 Essential Micronutrients Glanceable Grid */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-olive block">
          4 Vi Chất Trọng Yếu Người Ăn Chay Cần Đạt (WHO / RDA):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Vitamin B12 */}
          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-forest">Vitamin B12</span>
              <span className="font-metric text-[11px] font-bold text-emeraldBotanic">{b12Pct}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-metric text-base font-bold text-forest">{safeConsumed.b12 || 0}</span>
              <span className="text-[11px] text-olive font-metric">/ 2.4 µg</span>
            </div>
            <div className="w-full bg-hairline rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emeraldBotanic h-full rounded-full"
                style={{ width: `${b12Pct}%` }}
              ></div>
            </div>
          </div>

          {/* Iron */}
          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-forest">Sắt (Iron)</span>
              <span className="font-metric text-[11px] font-bold text-emeraldBotanic">{ironPct}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-metric text-base font-bold text-forest">{safeConsumed.iron || 0}</span>
              <span className="text-[11px] text-olive font-metric">/ 18 mg</span>
            </div>
            <div className="w-full bg-hairline rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emeraldBotanic h-full rounded-full"
                style={{ width: `${ironPct}%` }}
              ></div>
            </div>
          </div>

          {/* Zinc */}
          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-forest">Kẽm (Zinc)</span>
              <span className="font-metric text-[11px] font-bold text-emeraldBotanic">{zincPct}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-metric text-base font-bold text-forest">{safeConsumed.zinc || 0}</span>
              <span className="text-[11px] text-olive font-metric">/ 11 mg</span>
            </div>
            <div className="w-full bg-hairline rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emeraldBotanic h-full rounded-full"
                style={{ width: `${zincPct}%` }}
              ></div>
            </div>
          </div>

          {/* Calcium */}
          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-forest">Canxi</span>
              <span className="font-metric text-[11px] font-bold text-emeraldBotanic">{calciumPct}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-metric text-base font-bold text-forest">{safeConsumed.calcium || 0}</span>
              <span className="text-[11px] text-olive font-metric">/ 1000 mg</span>
            </div>
            <div className="w-full bg-hairline rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emeraldBotanic h-full rounded-full"
                style={{ width: `${calciumPct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
