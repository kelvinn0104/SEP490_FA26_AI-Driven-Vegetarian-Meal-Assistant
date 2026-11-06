import React, { useState, useMemo } from 'react';
import {
  Sparkles, Search, Clock, Check, ChevronRight, Flame,
  Leaf, Utensils, Heart, Bookmark, Filter, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import DailyNutritionSummary from '../../components/nutrition/DailyNutritionSummary';
import RecipeCard from '../../components/recipes/RecipeCard';
import RecipeDetailModal from '../../components/recipes/RecipeDetailModal';

export default function HomePage({ onNavigate }) {
  const { user } = useAuth();
  const {
    profile,
    metrics,
    weeklyPlan,
    selectedDayIdx,
    currentDayPlan,
    consumedToday,
    recipesDb,
    toggleSaveRecipe,
    showToast
  } = useVeggieNutrition();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);

  // Hero Recipe: Highest match score recipe
  const heroRecipe = recipesDb[0] || null;

  // Collection 1: Vietnamese Authentic Dishes
  const vietnameseRecipes = useMemo(() => {
    return recipesDb.filter(r => r.region === 'vietnam');
  }, [recipesDb]);

  // Collection 2: Quick Meals <= 22 mins
  const quickRecipes = useMemo(() => {
    return recipesDb.filter(r => r.prepTime <= 22);
  }, [recipesDb]);

  // Filtered Library Recipes
  const filteredRecipes = useMemo(() => {
    return recipesDb.filter(r => {
      const title = r.title || '';
      const sub = r.subtitle || r.instructions || '';
      const ingredients = r.ingredients || [];
      const matchSearch =
        !searchQuery ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ingredients.some(i => (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      const pro = r.nutrients?.protein ?? r.proteinG ?? 0;
      const b12 = r.nutrients?.b12 ?? r.b12Mcg ?? 0;
      const time = r.prepTime ?? 20;

      if (filterTag === 'high-protein') return pro >= 24;
      if (filterTag === 'b12') return b12 >= 1.0;
      if (filterTag === 'quick') return time <= 22;
      if (filterTag === 'vietnam') return r.region === 'vietnam';

      return true;
    });
  }, [recipesDb, searchQuery, filterTag]);

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 space-y-12 max-w-7xl mx-auto animate-fade-up">
      {/* ====================================================================
          1. HERO EDITORIAL SECTION
      ==================================================================== */}
      <section className="bg-forest text-alabaster rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xl border border-white/10">
        {/* Subtle architectural gradient background (no tacky AI blob) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(36,107,72,0.22),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Content (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-medium tracking-wide backdrop-blur-xs">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dinh Dưỡng Thực Vật • Chuẩn WHO Tây Thái Bình Dương</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.18]">
              Cân bằng thực dưỡng, <br className="hidden sm:inline" />
              <span className="text-emerald-300 font-serif italic font-normal">đủ đạm &amp; trọn vi chất.</span>
            </h1>

            {user && profile ? (
              <p className="text-xs sm:text-sm text-alabaster/85 leading-relaxed max-w-xl">
                Thực đơn được định lượng chuẩn theo thể trạng <strong>BMI {metrics.bmi} ({metrics.category})</strong> — đáp ứng mục tiêu{' '}
                <strong className="text-white">{metrics.targetProtein}g Đạm thực vật</strong>, <strong className="text-white">{metrics.tdee} kcal</strong> và vi chất B12 thiết yếu mỗi ngày.
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-alabaster/85 leading-relaxed max-w-xl">
                Hệ thống gợi ý thực đơn chay khoa học cân bằng dinh dưỡng, tối ưu hóa đạm thực vật và vi chất thiết yếu theo thể trạng cá nhân hóa.
              </p>
            )}

            {/* CTAs */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('planner')}
                className="px-5 py-3 rounded-2xl bg-terracotta hover:bg-terracottaDark text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm flex items-center gap-2 active:scale-95"
              >
                <span>Xem Thực Đơn Tuần</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('chatbot')}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold transition cursor-pointer border border-white/15 flex items-center gap-2 active:scale-95"
              >
                <Utensils className="w-4 h-4 text-emerald-300" />
                <span>Tư Vấn Dinh Dưỡng</span>
              </button>
            </div>

            {/* Tangible Quick Filter Chips */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-white/60 text-[11px] font-medium mr-1">Bộ lọc nhanh:</span>
              {[
                { id: 'high-protein', label: 'Giàu Đạm (24g+)' },
                { id: 'quick', label: 'Nấu Nhanh (<22p)' },
                { id: 'vietnam', label: 'Món Chay Việt' },
                { id: 'b12', label: 'Giàu B12' }
              ].map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => {
                    setFilterTag(filterTag === chip.id ? 'all' : chip.id);
                    const el = document.getElementById('recipe-library-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                    filterTag === chip.id
                      ? 'bg-emerald-400 text-forest font-semibold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Hero Card: Editorial Featured Recipe (5 cols) */}
          {heroRecipe && (
            <div className="lg:col-span-5">
              <div
                onClick={() => setSelectedRecipeDetail(heroRecipe)}
                className="bg-white/[0.08] backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-white/15 hover:border-emerald-300/50 transition duration-300 cursor-pointer group shadow-2xl"
              >
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={heroRecipe.image}
                    alt={heroRecipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-forest/85 backdrop-blur-sm text-emerald-300 text-xs font-semibold border border-emerald-500/20 shadow-xs flex items-center gap-1.5">
                    <Leaf className="w-3 h-3 text-emerald-400" />
                    <span>Món tiêu biểu hôm nay</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-forest font-metric text-xs font-semibold shadow-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-olive" />
                    <span>{heroRecipe.prepTime} phút</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-emerald-300 uppercase tracking-wider font-medium">
                    <span>Gợi ý cho thể trạng của bạn</span>
                    <span className="text-white/60 font-metric">Chuẩn WHO</span>
                  </div>
                  <h3 className="font-editorial text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                    {heroRecipe.title}
                  </h3>
                  <p className="text-xs text-alabaster/70 line-clamp-1">
                    {heroRecipe.subtitle || heroRecipe.instructions || 'Món chay cân bằng năng lượng và dưỡng chất'}
                  </p>

                  {/* Nutritional Breakdown Row */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                    <div className="bg-white/5 rounded-xl py-1.5 px-2">
                      <span className="block text-[10px] text-white/60 uppercase">Năng lượng</span>
                      <span className="font-metric text-xs font-bold text-white">
                        {heroRecipe.nutrients?.calories ?? heroRecipe.kcalPerServing ?? 400} kcal
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl py-1.5 px-2">
                      <span className="block text-[10px] text-white/60 uppercase">Chất đạm</span>
                      <span className="font-metric text-xs font-bold text-emerald-300">
                        {heroRecipe.nutrients?.protein ?? heroRecipe.proteinG ?? 18}g
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl py-1.5 px-2">
                      <span className="block text-[10px] text-white/60 uppercase">Vitamin B12</span>
                      <span className="font-metric text-xs font-bold text-white">
                        {heroRecipe.nutrients?.b12 ?? heroRecipe.b12Mcg ?? 1.2}µg
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          2. DAILY NUTRITION GLANCEABLE DASHBOARD / GUEST CALLOUT
      ==================================================================== */}
      {user && profile ? (
        <section>
          <DailyNutritionSummary
            consumed={consumedToday}
            metrics={metrics}
            selectedDay={currentDayPlan?.day || 'Hôm nay'}
            onNavigateToPlanner={() => onNavigate && onNavigate('planner')}
          />
        </section>
      ) : (
        <section className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="font-metric text-xs font-bold uppercase tracking-wider text-emeraldBotanic">
              CHẾ ĐỘ KHÁCH THĂM
            </span>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold text-forest">
              Khám phá thực đơn dinh dưỡng thực vật chuẩn WHO
            </h3>
            <p className="text-xs sm:text-sm text-olive max-w-xl">
              Đăng nhập để lưu hồ sơ sức khỏe cá nhân, nhận thực đơn 7 ngày tính toán riêng cho bạn và theo dõi lượng calo, đạm tiêu thụ mỗi ngày.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('login')}
              className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forestDark text-alabaster text-xs font-semibold cursor-pointer transition shadow-xs"
            >
              Đăng nhập ngay
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('user-profile')}
              className="px-5 py-2.5 rounded-xl border border-forest text-forest hover:bg-forest/5 text-xs font-semibold cursor-pointer transition"
            >
              Tính nhanh BMI
            </button>
          </div>
        </section>
      )}

      {/* ====================================================================
          3. COLLECTION 1: MÓN CHAY THUẦN VIỆT
      ==================================================================== */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-metric text-xs font-bold uppercase tracking-wider text-emeraldBotanic">
              ẨM THỰC TRUYỀN THỐNG
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-forest mt-0.5">
              Món Chay Thuần Việt
            </h2>
          </div>
          <span className="text-xs font-semibold text-olive hidden sm:inline">
            Đậm đà hương vị quê nhà • Đạt chuẩn vi chất
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {vietnameseRecipes.slice(0, 4).map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSaved={(profile?.savedRecipeIds || []).includes(recipe.id)}
              onToggleSave={toggleSaveRecipe}
              onSelectDetail={setSelectedRecipeDetail}
            />
          ))}
        </div>
      </section>

      {/* ====================================================================
          4. COLLECTION 2: BỮA ĂN NHANH DƯỚI 22 PHÚT
      ==================================================================== */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-metric text-xs font-bold uppercase tracking-wider text-emeraldBotanic">
              TIẾT KIỆM THỜI GIAN
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-forest mt-0.5">
              Nấu Nhanh Dưới 22 Phút
            </h2>
          </div>
          <span className="text-xs font-semibold text-olive hidden sm:inline">
            Chuẩn bị nhanh gọn • Phù hợp người bận rộn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickRecipes.slice(0, 4).map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSaved={(profile?.savedRecipeIds || []).includes(recipe.id)}
              onToggleSave={toggleSaveRecipe}
              onSelectDetail={setSelectedRecipeDetail}
            />
          ))}
        </div>
      </section>

      {/* ====================================================================
          5. COMPLETE RECIPE LIBRARY & FILTER BAR
      ==================================================================== */}
      <section id="recipe-library-section" className="space-y-6 pt-4 border-t border-hairline scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="font-metric text-xs font-bold uppercase tracking-wider text-emeraldBotanic">
              KHO CÔNG THỨC CHỌN LỌC
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-forest mt-0.5">
              Thư Viện Dinh Dưỡng Thực Vật
            </h2>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-olive absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo món ăn, nguyên liệu..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-hairline text-xs font-medium text-forest focus:outline-none focus:border-forest shadow-xs"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { key: 'all', label: `Tất cả (${recipesDb.length})` },
            { key: 'high-protein', label: 'Giàu Đạm (≥ 24g)' },
            { key: 'b12', label: 'Bổ Sung Vitamin B12' },
            { key: 'quick', label: 'Nấu Nhanh (≤ 22p)' },
            { key: 'vietnam', label: 'Món Việt Nam' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterTag(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                filterTag === tab.key
                  ? 'bg-forest text-alabaster shadow-xs'
                  : 'bg-white border border-hairline text-olive hover:text-forest hover:bg-sage/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSaved={(profile?.savedRecipeIds || []).includes(recipe.id)}
              onToggleSave={toggleSaveRecipe}
              onSelectDetail={setSelectedRecipeDetail}
            />
          ))}
        </div>
      </section>

      {/* Recipe Detail Modal */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          isSaved={(profile?.savedRecipeIds || []).includes(selectedRecipeDetail.id)}
          onToggleSave={toggleSaveRecipe}
          onApplyMeal={() => {
            if (onNavigate) onNavigate('planner');
            showToast(`Đã áp dụng ${selectedRecipeDetail.title} vào thực đơn`);
          }}
        />
      )}
    </div>
  );
}
