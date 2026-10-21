import React, { useState } from 'react';
import {
  Activity, Sliders, Bookmark, Check, ArrowLeft,
  ChevronRight, MapPin, Users, UserCheck, Flame
} from 'lucide-react';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import { DEMO_PROFILES } from '../../data/nutritionData';
import WhoAssessmentCard from '../../components/nutrition/WhoAssessmentCard';
import RecipeCard from '../../components/recipes/RecipeCard';
import RecipeDetailModal from '../../components/recipes/RecipeDetailModal';

export default function HealthProfilePage({ onNavigate }) {
  const {
    profile,
    updateProfile,
    switchDemoProfile,
    metrics,
    recipesDb,
    toggleSaveRecipe,
    showToast
  } = useVeggieNutrition();

  const [profileTab, setProfileTab] = useState('health'); // 'health' | 'edit' | 'saved'
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);

  // Filter Bookmarked Recipes
  const savedRecipes = recipesDb.filter(r => (profile.savedRecipeIds || []).includes(r.id));

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto animate-fade-up">
      {/* ====================================================================
          1. USER PROFILE HEADER CARD
      ==================================================================== */}
      <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-hairline">
          {/* Left: Avatar & Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-hairline shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-forest">{profile.name}</h1>
                <span className="font-metric text-xs text-olive font-medium">{profile.username}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emeraldBotanic/10 text-emeraldBotanic text-xs font-semibold">
                  {profile.diet}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-olive max-w-xl leading-relaxed">{profile.bio}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-olive pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-terracotta" />
                  <span>TP. Hồ Chí Minh</span>
                </span>
                <span>•</span>
                <span className="text-emeraldBotanic font-semibold">Chuỗi {profile.streakDays} ngày ăn xanh</span>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setProfileTab(profileTab === 'edit' ? 'health' : 'edit')}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-alabaster text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-300" />
              <span>{profileTab === 'edit' ? 'Xem Thông Tin' : 'Chỉnh Sửa Chỉ Số'}</span>
            </button>

            {/* Profile Switcher Menu */}
            <div className="flex items-center gap-1 bg-alabaster p-1 rounded-xl border border-hairline">
              <Users className="w-3.5 h-3.5 text-emeraldBotanic ml-1" />
              {DEMO_PROFILES.map(dp => (
                <button
                  key={dp.id}
                  type="button"
                  onClick={() => switchDemoProfile(dp.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    profile.name === dp.name ? 'bg-forest text-white' : 'text-olive hover:text-forest'
                  }`}
                >
                  {dp.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clinical Vitals Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-olive">Thể Trọng & Chiều Cao</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-metric text-lg sm:text-xl font-bold text-forest">{profile.weight}</span>
              <span className="text-xs text-olive font-medium">kg</span>
              <span className="text-xs text-hairline mx-1">•</span>
              <span className="font-metric text-sm font-semibold text-forest">{profile.height} cm</span>
            </div>
            <span className="text-[11px] text-olive font-medium block">
              {profile.gender === 'male' ? 'Nam' : 'Nữ'} • {profile.age} tuổi
            </span>
          </div>

          <div className="space-y-1 border-l-0 md:border-l border-hairline md:pl-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-olive">Chỉ Số BMI (WHO)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-metric text-lg sm:text-xl font-bold text-forest">{metrics.bmi}</span>
              <span className="text-[11px] font-semibold text-emeraldBotanic bg-emeraldBotanic/10 px-2 py-0.5 rounded-full">
                {metrics.category}
              </span>
            </div>
            <span className="text-[11px] text-olive font-medium block">Khung chuẩn: 18.5 – 22.9</span>
          </div>

          <div className="space-y-1 border-l-0 sm:border-l border-hairline sm:pl-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-olive">Năng Lượng TDEE</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-metric text-lg sm:text-xl font-bold text-forest">{metrics.tdee}</span>
              <span className="text-xs text-olive font-medium">kcal/ngày</span>
            </div>
            <span className="text-[11px] text-olive font-medium block">BMR: {metrics.bmr} kcal</span>
          </div>

          <div className="space-y-1 border-l-0 md:border-l border-hairline md:pl-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-olive">Nhu Cầu Đạm Thực Vật</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-metric text-lg sm:text-xl font-bold text-forest">{metrics.targetProtein}</span>
              <span className="text-xs text-olive font-medium">g / ngày</span>
            </div>
            <span className="text-[11px] text-olive font-medium block">
              ~{(metrics.targetProtein / profile.weight).toFixed(1)}g / kg thể trọng
            </span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex gap-2 border-t border-hairline pt-4 overflow-x-auto no-scrollbar">
          {[
            { key: 'health', label: 'Thông Tin Thể Trạng', icon: Activity },
            { key: 'edit', label: 'Chỉnh Sửa Chỉ Số', icon: Sliders },
            { key: 'saved', label: `Món Đã Lưu (${savedRecipes.length})`, icon: Bookmark }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = profileTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setProfileTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-forest text-alabaster shadow-xs'
                    : 'bg-alabaster text-olive hover:text-forest hover:bg-sage'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          TAB 1: READ-ONLY INFORMATION VIEW (THUẦN HIỂN THỊ THÔNG TIN)
      ==================================================================== */}
      {profileTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-up">
          {/* Left 7 cols: Information Cards */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Goal */}
            <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-metric text-xs font-bold uppercase tracking-wider text-emeraldBotanic">
                    MỤC TIÊU THỂ TRẠNG
                  </span>
                  <h3 className="font-editorial text-xl font-bold text-forest mt-0.5">
                    Mục Tiêu Cá Nhân Hóa
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileTab('edit')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-alabaster hover:bg-sage border border-hairline text-xs font-semibold text-forest transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-emeraldBotanic" />
                  <span>Đổi Mục Tiêu</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-forest text-alabaster shadow-xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-metric font-bold px-2.5 py-1 rounded-md bg-emerald-400/20 text-emerald-300">
                    {profile.goal === 'lose' ? '-350 kcal/ngày' : profile.goal === 'muscle' ? '+250 kcal/ngày' : 'Cân bằng TDEE'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>Đang áp dụng</span>
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {profile.goal === 'lose'
                      ? 'Giảm mỡ lành mạnh'
                      : profile.goal === 'muscle'
                      ? 'Tăng cơ thực vật'
                      : 'Duy trì vóc dáng & Sức khỏe bền vững'}
                  </h4>
                  <p className="text-xs text-alabaster/80 mt-1 leading-relaxed">
                    {profile.goal === 'lose'
                      ? 'Thâm hụt calo nhẹ nhàng, ưu tiên chất xơ và đạm để duy trì cơ bắp.'
                      : profile.goal === 'muscle'
                      ? 'Thặng dư năng lượng có kiểm soát, nâng định mức đạm lên 1.6g/kg thể trọng.'
                      : 'Giữ ổn định cân nặng, tối ưu hóa năng lượng và hệ vi sinh đường ruột.'}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-4 text-xs font-metric text-white/80">
                  <span>BMR: <strong className="text-white">{metrics.bmr}</strong> kcal</span>
                  <span>•</span>
                  <span>TDEE: <strong className="text-emerald-300">{metrics.tdee}</strong> kcal</span>
                  <span>•</span>
                  <span>Đạm mục tiêu: <strong className="text-emerald-300">{metrics.targetProtein}g</strong></span>
                </div>
              </div>
            </div>

            {/* Card 2: Biometrics & Lifestyle */}
            <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-metric text-xs font-bold uppercase tracking-wider text-emeraldBotanic">
                    CHỈ SỐ SINH TRẮC HỌC (WHO)
                  </span>
                  <h3 className="font-editorial text-xl font-bold text-forest mt-0.5">
                    Thể Trạng & Thói Quen Sống
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileTab('edit')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-alabaster hover:bg-sage border border-hairline text-xs font-semibold text-forest transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-emeraldBotanic" />
                  <span>Sửa Chỉ Số</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-olive">Thể Trọng & Chiều Cao</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-metric text-2xl font-bold text-forest">{profile.weight}</span>
                    <span className="text-xs text-olive font-semibold">kg</span>
                    <span className="text-hairline mx-1">•</span>
                    <span className="font-metric text-lg font-bold text-forest">{profile.height}</span>
                    <span className="text-xs text-olive font-semibold">cm</span>
                  </div>
                  <p className="text-[11px] text-olive pt-0.5">
                    BMI: <strong className="text-forest">{metrics.bmi}</strong> ({metrics.category})
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-olive">Độ Tuổi & Giới Tính</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-metric text-2xl font-bold text-forest">{profile.age}</span>
                    <span className="text-xs text-olive font-semibold">tuổi</span>
                    <span className="text-hairline mx-1">•</span>
                    <span className="text-sm font-bold text-forest">{profile.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                  </div>
                  <p className="text-[11px] text-olive pt-0.5">Chuẩn Mifflin-St Jeor</p>
                </div>

                <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-olive">Trường Phái Ăn Chay</span>
                  <p className="text-sm font-bold text-forest truncate">{profile.diet}</p>
                  <p className="text-[11px] text-olive pt-0.5">Cân đối vi chất thực vật tự động</p>
                </div>

                <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-olive">Mức Độ Vận Động (PAL)</span>
                  <p className="text-sm font-bold text-forest">
                    {profile.activity === 'sedentary'
                      ? 'Ít vận động (PAL 1.2)'
                      : profile.activity === 'active'
                      ? 'Vận động cao (PAL 1.65)'
                      : 'Vận động vừa (PAL 1.45)'}
                  </p>
                  <p className="text-[11px] text-olive pt-0.5">
                    {profile.activity === 'sedentary'
                      ? 'Làm việc bàn giấy, ít đi lại'
                      : profile.activity === 'active'
                      ? 'Gym, chạy bộ 5–7 ngày/tuần'
                      : 'Yoga, đi bộ 3–4 buổi/tuần'}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Allergies */}
            <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-metric text-xs font-bold uppercase tracking-wider text-emeraldBotanic">
                    BỘ LỌC AN TOÀN
                  </span>
                  <h3 className="font-editorial text-xl font-bold text-forest mt-0.5">
                    Dị Ứng & Nguyên Liệu Loại Trừ
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileTab('edit')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-alabaster hover:bg-sage border border-hairline text-xs font-semibold text-forest transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-emeraldBotanic" />
                  <span>Tùy Chỉnh</span>
                </button>
              </div>

              {(profile.allergies || []).length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map(allergy => (
                      <span
                        key={allergy}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-terracotta/10 text-terracotta border border-terracotta/20 inline-flex items-center gap-1.5"
                      >
                        <span>🚫 Tránh: {allergy}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-olive pt-1">
                    Thực đơn và gợi ý món sẽ tự động loại bỏ các nguyên liệu trên.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emeraldBotanic/10 border border-emeraldBotanic/20 flex items-center gap-3">
                  <Check className="w-5 h-5 text-emeraldBotanic shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-forest">Không có thành phần loại trừ</p>
                    <p className="text-olive">Bạn có thể thưởng thức toàn bộ công thức phong phú trong hệ thống.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 cols: WHO Assessment Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <WhoAssessmentCard
              metrics={metrics}
              onEditBiometrics={() => setProfileTab('edit')}
              onApplyToPlanner={() => {
                if (onNavigate) onNavigate('planner');
                showToast('Đã áp dụng định mức thể trạng vào thực đơn');
              }}
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: DEDICATED EDIT MODE (CHỈNH SỬA CHỈ SỐ)
      ==================================================================== */}
      {profileTab === 'edit' && (
        <div className="space-y-6 animate-fade-up">
          {/* Header Action Bar */}
          <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setProfileTab('health')}
                className="p-2 rounded-xl bg-alabaster hover:bg-sage border border-hairline text-forest transition cursor-pointer"
                title="Quay lại xem thông tin"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-forest">
                  Chỉnh Sửa Chỉ Số & Thể Trạng
                </h3>
                <p className="text-xs text-olive mt-0.5">
                  Thay đổi chiều cao, cân nặng, mục tiêu calo và nguyên liệu dị ứng.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setProfileTab('health')}
                className="px-3.5 py-2 rounded-xl border border-hairline text-xs font-semibold text-olive hover:text-forest hover:bg-alabaster transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileTab('health');
                  showToast('Đã lưu và cập nhật chỉ số thể trạng thành công!');
                }}
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-alabaster text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Hoàn Tất & Xem Hồ Sơ</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 cols: Interactive Edit Forms */}
            <div className="lg:col-span-7 space-y-6">
              {/* Form 1: Goal */}
              <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-7 shadow-xs space-y-4">
                <h4 className="font-editorial text-lg font-bold text-forest">Chọn Mục Tiêu Cá Nhân</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'lose', title: 'Giảm mỡ lành mạnh', badge: '-350 kcal/ngày', desc: 'Thâm hụt nhẹ, duy trì cơ bắp' },
                    { key: 'maintain', title: 'Duy trì vóc dáng', badge: 'Cân bằng TDEE', desc: 'Ổn định cân nặng và vi sinh' },
                    { key: 'muscle', title: 'Tăng cơ thực vật', badge: '+250 kcal/ngày', desc: 'Thặng dư năng lượng + đạm 1.6g/kg' }
                  ].map(g => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => updateProfile({ ...profile, goal: g.key })}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        profile.goal === g.key
                          ? 'border-forest bg-forest text-alabaster shadow-xs'
                          : 'border-hairline bg-alabaster text-forest hover:bg-sage/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className={`inline-block text-[10px] font-metric font-bold px-2 py-0.5 rounded-md ${
                          profile.goal === g.key ? 'bg-emerald-400/20 text-emerald-300' : 'bg-forest/10 text-forest'
                        }`}>
                          {g.badge}
                        </span>
                        <p className="text-xs font-bold pt-1">{g.title}</p>
                        <p className={`text-[11px] leading-relaxed ${profile.goal === g.key ? 'text-alabaster/80' : 'text-olive'}`}>
                          {g.desc}
                        </p>
                      </div>
                      {profile.goal === g.key && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 mt-3 pt-2 border-t border-white/10">
                          <Check className="w-3.5 h-3.5" />
                          <span>Đang áp dụng</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form 2: Biometrics */}
              <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-7 shadow-xs space-y-5">
                <h4 className="font-editorial text-lg font-bold text-forest">Chỉ Số Cơ Thể & Vận Động</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-2">Giới tính sinh học</label>
                    <div className="grid grid-cols-2 gap-2 bg-alabaster p-1 rounded-xl border border-hairline">
                      <button
                        type="button"
                        onClick={() => updateProfile({ ...profile, gender: 'female' })}
                        className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                          profile.gender === 'female' ? 'bg-forest text-white' : 'text-olive hover:text-forest'
                        }`}
                      >
                        Nữ (Female)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProfile({ ...profile, gender: 'male' })}
                        className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                          profile.gender === 'male' ? 'bg-forest text-white' : 'text-olive hover:text-forest'
                        }`}
                      >
                        Nam (Male)
                      </button>
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-2">Độ tuổi (năm)</label>
                    <div className="flex items-center gap-2 bg-alabaster border border-hairline rounded-xl px-3 py-1.5">
                      <button
                        type="button"
                        onClick={() => updateProfile({ ...profile, age: Math.max(16, profile.age - 1) })}
                        className="w-8 h-8 rounded-lg bg-white border border-hairline font-bold text-sm text-forest hover:bg-sage transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={profile.age}
                        onChange={e => updateProfile({ ...profile, age: Number(e.target.value) || 23 })}
                        className="w-full text-center font-metric font-bold text-forest text-base bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateProfile({ ...profile, age: Math.min(90, profile.age + 1) })}
                        className="w-8 h-8 rounded-lg bg-white border border-hairline font-bold text-sm text-forest hover:bg-sage transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase text-olive">Chiều cao</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={profile.height}
                          onChange={e => updateProfile({ ...profile, height: Number(e.target.value) || 165 })}
                          className="w-16 text-right font-metric text-sm font-bold text-forest bg-white border border-hairline rounded-lg px-2 py-1"
                        />
                        <span className="text-xs text-olive font-semibold">cm</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={140}
                      max={205}
                      value={profile.height}
                      onChange={e => updateProfile({ ...profile, height: Number(e.target.value) })}
                      className="w-full accent-forest cursor-pointer"
                    />
                  </div>

                  {/* Weight */}
                  <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase text-olive">Cân nặng</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={profile.weight}
                          onChange={e => updateProfile({ ...profile, weight: Number(e.target.value) || 56 })}
                          className="w-16 text-right font-metric text-sm font-bold text-forest bg-white border border-hairline rounded-lg px-2 py-1"
                        />
                        <span className="text-xs text-olive font-semibold">kg</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={38}
                      max={115}
                      value={profile.weight}
                      onChange={e => updateProfile({ ...profile, weight: Number(e.target.value) })}
                      className="w-full accent-forest cursor-pointer"
                    />
                  </div>

                  {/* Diet Type */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-olive mb-2">Trường phái ăn thực vật</label>
                    <select
                      value={profile.diet}
                      onChange={e => updateProfile({ ...profile, diet: e.target.value })}
                      className="w-full bg-alabaster border border-hairline rounded-xl px-4 py-3 text-sm font-semibold text-forest focus:outline-none focus:border-forest cursor-pointer"
                    >
                      <option value="Thuần chay (Vegan)">Thuần chay (Vegan - 100% Thực vật)</option>
                      <option value="Ăn chay có trứng sữa (Lacto-Ovo)">Chay có Sữa & Trứng (Lacto-Ovo)</option>
                      <option value="Ăn chay Linh hoạt (Flexitarian)">Ăn chay Linh hoạt (Flexitarian)</option>
                      <option value="Thực dưỡng (Macrobiotic)">Thực dưỡng Ohsawa (Macrobiotic)</option>
                    </select>
                  </div>

                  {/* Activity Level */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-olive">Mức độ vận động (PAL)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { key: 'sedentary', title: 'Ít vận động (PAL 1.2)', desc: 'Làm việc bàn giấy, ít đi lại' },
                        { key: 'moderate', title: 'Vận động vừa (PAL 1.45)', desc: 'Yoga, đi bộ 3–4 buổi/tuần' },
                        { key: 'active', title: 'Vận động cao (PAL 1.65)', desc: 'Gym, chạy bộ 5–7 ngày/tuần' }
                      ].map(act => (
                        <button
                          key={act.key}
                          type="button"
                          onClick={() => updateProfile({ ...profile, activity: act.key })}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            profile.activity === act.key
                              ? 'border-forest bg-forest text-white shadow-xs'
                              : 'border-hairline bg-alabaster text-forest hover:bg-sage/40'
                          }`}
                        >
                          <p className="text-xs font-bold">{act.title}</p>
                          <p className={`text-[11px] mt-1 ${profile.activity === act.key ? 'text-white/80' : 'text-olive'}`}>
                            {act.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form 3: Allergies */}
              <div className="bg-white rounded-3xl border border-hairline p-5 sm:p-7 shadow-xs space-y-4">
                <h4 className="font-editorial text-lg font-bold text-forest">Nguyên Liệu Cần Loại Trừ</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Đậu phộng', 'Gluten / Lúa mì', 'Đậu nành', 'Nấm hương',
                    'Ớt cay', 'Đường tinh luyện', 'Ngũ vị tân (Hành tỏi)', 'Sữa bơ động vật'
                  ].map(allergy => {
                    const active = (profile.allergies || []).includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => {
                          const updatedAllergies = active
                            ? profile.allergies.filter(a => a !== allergy)
                            : [...profile.allergies, allergy];
                          updateProfile({ ...profile, allergies: updatedAllergies });
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                          active
                            ? 'bg-terracotta text-white border-terracotta shadow-xs'
                            : 'bg-alabaster text-forest border-hairline hover:bg-sage/40'
                        }`}
                      >
                        <span>{active ? `✕ Tránh: ${allergy}` : allergy}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 5 cols: Live Preview WHO Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <WhoAssessmentCard
                metrics={metrics}
                onApplyToPlanner={() => {
                  setProfileTab('health');
                  showToast('Đã lưu và cập nhật chỉ số');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: SAVED RECIPES (MÓN ĐÃ LƯU)
      ==================================================================== */}
      {profileTab === 'saved' && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-forest">Món Ăn Đã Lưu Vào Bộ Sưu Tập</h3>
              <p className="text-xs text-olive">Các công thức bạn đã bookmark để tiện theo dõi và lên lịch ăn tuần.</p>
            </div>
            <span className="font-metric text-xs font-bold px-3 py-1 bg-white border border-hairline rounded-full text-emeraldBotanic">
              {savedRecipes.length} món đã lưu
            </span>
          </div>

          {savedRecipes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-hairline p-12 text-center space-y-3">
              <Bookmark className="w-8 h-8 text-olive/40 mx-auto" />
              <p className="text-sm font-bold text-forest">Chưa có món ăn nào trong danh sách lưu</p>
              <p className="text-xs text-olive">Khám phá các món ăn ngon ở Trang Chủ và bấm biểu tượng Bookmark để lưu lại.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {savedRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={true}
                  onToggleSave={toggleSaveRecipe}
                  onSelectDetail={setSelectedRecipeDetail}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          isSaved={(profile.savedRecipeIds || []).includes(selectedRecipeDetail.id)}
          onToggleSave={toggleSaveRecipe}
        />
      )}
    </div>
  );
}
