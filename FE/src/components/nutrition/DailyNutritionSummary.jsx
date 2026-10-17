import React from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';

export default function DailyNutritionSummary({
  consumed,
  metrics,
  selectedDay = 'Hôm nay',
  onNavigateToPlanner
}) {
  const caloPct = Math.min(100, Math.round(((consumed.calories || 0) / (metrics.tdee || 2000)) * 100));
  const proteinPct = Math.min(100, Math.round(((consumed.protein || 0) / (metrics.targetProtein || 70)) * 100));
  const b12Pct = Math.min(100, Math.round(((consumed.b12 || 0) / 2.4) * 100));
  const ironPct = Math.min(100, Math.round(((consumed.iron || 0) / 18.0) * 100));
  const omega3Pct = Math.min(100, Math.round(((consumed.omega3 || 0) / 1.6) * 100));

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
                <span>Đang Nạp Năng Lượng ({consumed.mealsCount || 0}/3 Bữa)</span>
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
              <span className="font-metric text-lg font-bold text-forest">{consumed.calories || 0}</span>
              <span className="text-xs text-olive font-metric">/ {metrics.tdee} kcal</span>
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
              <span className="font-metric text-lg font-bold text-forest">{consumed.protein || 0}</span>
              <span className="text-xs text-olive font-metric">/ {metrics.targetProtein}g</span>
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
              <span className="font-metric text-base font-bold text-forest">{consumed.b12 || 0}</span>
              <span className="text-[11px] text-olive font-metric">/ 2.4 µg</span>
            </div>
            <p className="text-[10px] text-olive truncate">Men dinh dưỡng, sữa hạt</p>
          </div>

          {/* Sắt Non-Heme */}
          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-forest">Sắt Non-Heme</span>
              <span className="font-metric text-[11px] font-bold text-emeraldBotanic">{ironPct}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-metric text-base font-bold text-forest">{consumed.iron || 0}</span>
              <span className="text-[11px] text-olive font-metric">/ 18.0 mg</span>
            </div>
            <p className="text-[10px] text-olive truncate">Đậu gà, cải bó xôi</p>
          </div>

          {/* Omega-3 ALA */}
          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-forest">Omega-3 ALA</span>
              <span className="font-metric text-[11px] font-bold text-emeraldBotanic">{omega3Pct}%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-metric text-base font-bold text-forest">{consumed.omega3 || 0}</span>
              <span className="text-[11px] text-olive font-metric">/ 1.6 g</span>
            </div>
            <p className="text-[10px] text-olive truncate">Hạt chia, óc chó</p>
          </div>

          {/* Canxi Thực Vật */}
          <div className="p-3.5 rounded-2xl bg-alabaster border border-hairline space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-forest">Canxi Thực Vật</span>
              <span className="font-metric text-[11px] font-bold text-emeraldBotanic">Đạt chuẩn</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-metric text-base font-bold text-forest">1,000</span>
              <span className="text-[11px] text-olive font-metric">mg / ngày</span>
            </div>
            <p className="text-[10px] text-olive truncate">Mè đen, bông cải</p>
          </div>
        </div>
      </div>

      {/* AI Biological Synergy Insight */}
      <div className="p-3.5 rounded-2xl bg-emeraldBotanic/10 border border-emeraldBotanic/20 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emeraldBotanic shrink-0 mt-0.5" />
        <p className="text-xs text-forest leading-relaxed">
          <strong className="font-semibold text-emeraldBotanic">Gợi ý sinh học AI:</strong> Sắt thực vật (Non-heme) hấp thụ tối ưu khi kết hợp cùng Vitamin C tự nhiên (chanh tươi, cam, ớt chuông). Hạn chế uống trà hoặc cà phê ngay sau bữa ăn để tránh giảm 50% khả năng hấp thu.
        </p>
      </div>
    </div>
  );
}
