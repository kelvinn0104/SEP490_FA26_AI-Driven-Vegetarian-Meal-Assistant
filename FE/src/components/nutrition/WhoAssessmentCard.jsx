import React from 'react';
import { Sliders, ChevronRight } from 'lucide-react';

export default function WhoAssessmentCard({
  metrics,
  onEditBiometrics,
  onApplyToPlanner
}) {
  return (
    <div className="bg-forest text-alabaster rounded-3xl p-6 sm:p-8 space-y-6 shadow-md border border-white/10">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <span className="font-metric text-xs uppercase tracking-widest text-emerald-300 font-semibold">
          ĐÁNH GIÁ CHUẨN WHO TÂY THÁI BÌNH DƯƠNG
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-emerald-300">
          {metrics.category || 'Chuẩn WHO'}
        </span>
      </div>

      {/* Main Score Row: BMI & TDEE */}
      <div className="flex items-baseline gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-xs text-white/70 block">Chỉ số BMI</span>
          <span className="font-metric text-4xl sm:text-5xl font-bold text-white tracking-tight">{metrics.bmi}</span>
        </div>
        <div className="pl-4 border-l border-white/10">
          <span className="text-xs text-white/70 block">Năng lượng mục tiêu (TDEE)</span>
          <span className="font-metric text-2xl sm:text-3xl font-bold text-emerald-300">
            {metrics.tdee ? metrics.tdee.toLocaleString() : 1907}{' '}
            <span className="text-base font-normal text-emerald-200">kcal</span>
          </span>
          <span className="text-[11px] text-white/60 block mt-0.5">BMR nền: {metrics.bmr} kcal</span>
        </div>
      </div>

      {/* Medical WHO Asia Spectrum Gauge */}
      <div className="space-y-2 border-b border-white/10 pb-5">
        <div className="flex justify-between text-[10px] font-metric text-white/70">
          <span>Thiếu (&lt;18.5)</span>
          <span className="text-emerald-300 font-semibold">Chuẩn (18.5–22.9)</span>
          <span>Tiền béo (23–24.9)</span>
          <span>Béo phì (≥25)</span>
        </div>
        <div className="relative w-full h-2 rounded-full bg-white/20 overflow-hidden flex">
          <div className="w-[25%] h-full bg-sky-400" title="Thiếu cân (< 18.5)"></div>
          <div className="w-[30%] h-full bg-emerald-400" title="Chuẩn WHO Á Châu (18.5 - 22.9)"></div>
          <div className="w-[15%] h-full bg-amber-400" title="Tiền béo phì (23.0 - 24.9)"></div>
          <div className="flex-1 h-full bg-rose-400" title="Thừa cân / Béo phì (≥ 25)"></div>
        </div>
        <div className="relative w-full h-5">
          <div
            className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
            style={{ left: `${metrics.bmiSpectrumPct}%` }}
          >
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-white"></div>
            <span className="font-metric text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded shadow-xs mt-0.5 whitespace-nowrap">
              {metrics.bmi} • {metrics.category}
            </span>
          </div>
        </div>
      </div>

      {/* Macronutrient Balance Split */}
      <div className="space-y-2.5 border-b border-white/10 pb-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-white/80">Phân Bổ Đa Lượng Mục Tiêu</span>
          <span className="font-metric text-white/60 text-[11px]">{metrics.tdee} kcal</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 sm:p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-white/70 block">Đạm thực vật</span>
            <p className="font-metric text-base sm:text-lg font-bold text-white mt-0.5">{metrics.targetProtein}g</p>
            <span className="text-[10px] text-emerald-300 font-metric">~{metrics.targetProtein * 4} kcal</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-white/70 block">Carb phức hợp</span>
            <p className="font-metric text-base sm:text-lg font-bold text-white mt-0.5">{metrics.targetCarbs}g</p>
            <span className="text-[10px] text-white/60 font-metric">~{metrics.targetCarbs * 4} kcal</span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-white/70 block">Chất béo tốt</span>
            <p className="font-metric text-base sm:text-lg font-bold text-white mt-0.5">{metrics.targetFat}g</p>
            <span className="text-[10px] text-white/60 font-metric">~{metrics.targetFat * 9} kcal</span>
          </div>
        </div>
      </div>

      {/* 4 Essential Micronutrients */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
          Định Mức 4 Vi Chất Thiết Yếu Cho Người Ăn Chay (RDA):
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/75">Vitamin B12</span>
              <span className="font-metric text-xs font-bold text-emerald-300">100% RDA</span>
            </div>
            <p className="font-metric text-lg font-bold text-white mt-0.5">2.4 µg</p>
            <span className="text-[10px] text-white/60 block truncate">Men dinh dưỡng, Sữa hạt</span>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/75">Sắt Non-Heme</span>
              <span className="font-metric text-xs font-bold text-emerald-300">100% RDA</span>
            </div>
            <p className="font-metric text-lg font-bold text-white mt-0.5">18.0 mg</p>
            <span className="text-[10px] text-white/60 block truncate">Cải bó xôi, Đậu gà</span>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/75">Omega-3 ALA</span>
              <span className="font-metric text-xs font-bold text-emerald-300">100% RDA</span>
            </div>
            <p className="font-metric text-lg font-bold text-white mt-0.5">1.6 g</p>
            <span className="text-[10px] text-white/60 block truncate">Hạt chia, Hạt óc chó</span>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/75">Canxi thực vật</span>
              <span className="font-metric text-xs font-bold text-emerald-300">100% RDA</span>
            </div>
            <p className="font-metric text-lg font-bold text-white mt-0.5">1,000 mg</p>
            <span className="text-[10px] text-white/60 block truncate">Hạt mè đen, Bông cải</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        {onEditBiometrics && (
          <button
            type="button"
            onClick={onEditBiometrics}
            className="w-full py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 border border-white/20"
          >
            <Sliders className="w-4 h-4 text-emerald-300" />
            <span>Chỉnh Sửa Chỉ Số & Thể Trạng</span>
          </button>
        )}

        {onApplyToPlanner && (
          <button
            type="button"
            onClick={onApplyToPlanner}
            className="w-full py-3.5 rounded-xl bg-terracotta hover:bg-terracottaDark text-white font-semibold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Cập Nhật Vào Lịch Ăn Tuần</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
