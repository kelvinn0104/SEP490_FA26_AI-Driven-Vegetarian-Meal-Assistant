import React from 'react';
import { X, Clock, Sparkles, Bookmark, Check, MapPin, ChefHat, Flame, Utensils } from 'lucide-react';

export default function RecipeDetailModal({
  recipe,
  onClose,
  isSaved,
  onToggleSave,
  onApplyMeal
}) {
  if (!recipe) return null;

  const nutrients = recipe.nutrients || recipe.nutritionPerServing || {
    calories: recipe.kcalPerServing || 450,
    protein: recipe.proteinG || 20,
    carb: recipe.carbG || 55,
    fat: recipe.fatG || 12,
    b12: recipe.b12Mcg || 1.2,
    iron: recipe.ironMg || 4.5,
    omega3: 0.8
  };

  const calories = nutrients.calories ?? nutrients.kcal ?? 450;
  const protein = nutrients.protein ?? nutrients.proteinG ?? 20;
  const b12 = nutrients.b12 ?? nutrients.b12Mcg ?? 1.2;
  const prepTime = recipe.prepTime || 20;
  const image = recipe.image || (recipe.imageUrl ? (recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `/uploads/${recipe.imageUrl}`) : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-forestDark/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-hairline rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Banner Image with Close Button */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-forest shrink-0">
          <img
            src={image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forestDark/90 via-forestDark/30 to-transparent"></div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-forestDark/70 hover:bg-forestDark text-white backdrop-blur-xs transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
            <span className="text-[11px] font-metric font-semibold text-emerald-300 uppercase tracking-wider">
              {recipe.season || 'Món chay khoa học'}
            </span>
            <h2 className="font-editorial text-xl sm:text-3xl font-bold leading-tight">
              {recipe.title}
            </h2>
            <p className="text-xs sm:text-sm text-alabaster/80 italic">
              {recipe.englishSub || recipe.category || 'Món chính thực vật'}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-alabaster border border-hairline text-center">
              <span className="text-[10px] font-bold uppercase text-olive block">Thời Gian</span>
              <p className="font-metric text-lg font-bold text-forest mt-0.5">{prepTime} phút</p>
            </div>
            <div className="p-3 rounded-2xl bg-alabaster border border-hairline text-center">
              <span className="text-[10px] font-bold uppercase text-olive block">Năng Lượng</span>
              <p className="font-metric text-lg font-bold text-forest mt-0.5">{calories} kcal</p>
            </div>
            <div className="p-3 rounded-2xl bg-alabaster border border-hairline text-center">
              <span className="text-[10px] font-bold uppercase text-olive block">Đạm Thực Vật</span>
              <p className="font-metric text-lg font-bold text-emeraldBotanic mt-0.5">{protein}g</p>
            </div>
            <div className="p-3 rounded-2xl bg-alabaster border border-hairline text-center">
              <span className="text-[10px] font-bold uppercase text-olive block">Vitamin B12</span>
              <p className="font-metric text-lg font-bold text-forest mt-0.5">{b12} µg</p>
            </div>
          </div>

          {/* Subtitle Description */}
          <p className="text-sm text-forest/90 leading-relaxed bg-alabaster/60 p-4 rounded-2xl border border-hairline">
            {recipe.subtitle}
          </p>

          {/* Ingredients & Cooking Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Ingredients (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <h3 className="font-editorial text-base sm:text-lg font-bold text-forest flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emeraldBotanic" />
                <span>Nguyên Liệu Chuẩn Bị</span>
              </h3>
              <div className="space-y-2">
                {(recipe.ingredients || []).map((ing, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-alabaster border border-hairline flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-forest">{ing.name}</span>
                    <span className="font-metric font-bold text-emeraldBotanic">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Steps (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              <h3 className="font-editorial text-base sm:text-lg font-bold text-forest flex items-center gap-2">
                <Flame className="w-4 h-4 text-terracotta" />
                <span>Các Bước Thực Hiện</span>
              </h3>
              <div className="space-y-2.5">
                {(recipe.steps || []).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-alabaster border border-hairline">
                    <span className="w-6 h-6 rounded-full bg-forest text-white font-metric text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-forest leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chef Tips */}
          {recipe.chefTips && recipe.chefTips.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emeraldBotanic/10 border border-emeraldBotanic/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emeraldBotanic flex items-center gap-1.5">
                <ChefHat className="w-4 h-4" />
                <span>Bí Quyết Ẩm Thực & Hấp Thu Vi Chất Từ Chuyên Gia:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-forest list-disc list-inside">
                {recipe.chefTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Local Spots (Nhà hàng chay gợi ý) */}
          {recipe.localSpots && recipe.localSpots.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-hairline">
              <h4 className="text-xs font-bold uppercase tracking-wider text-olive flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-terracotta" />
                <span>Thưởng Thức Món Tương Tự Tại Nhà Hàng Chay Gần Bạn:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recipe.localSpots.map((spot, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-alabaster border border-hairline space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-forest">{spot.name}</p>
                      <span className="text-[10px] font-metric font-bold text-emeraldBotanic">★ {spot.rating}</span>
                    </div>
                    <p className="text-[11px] text-olive truncate">{spot.address}</p>
                    <p className="text-[10px] text-olive font-metric">{spot.dist} • {spot.priceRange}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={() => onToggleSave && onToggleSave(recipe.id)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                isSaved
                  ? 'bg-terracotta text-white border-terracotta'
                  : 'bg-alabaster text-forest border-hairline hover:bg-sage'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Đã Lưu Công Thức' : 'Lưu Vào Món Yêu Thích'}</span>
            </button>

            {onApplyMeal && (
              <button
                type="button"
                onClick={() => {
                  onApplyMeal(recipe.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest hover:bg-forestDark text-alabaster text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Áp Dụng Vào Thực Đơn Tuần</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
