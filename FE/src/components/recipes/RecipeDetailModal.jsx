import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Sparkles, Bookmark, Check, MapPin, ChefHat, Flame, Utensils } from 'lucide-react';

export default function RecipeDetailModal({
  recipe,
  onClose,
  isSaved = false,
  onToggleSave,
  onApplyMeal
}) {
  if (!recipe) return null;

  // Lock body scroll while modal is active & listen to Escape key
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Safe extraction of nutrients
  const rawNutr = recipe.nutrients || recipe.nutritionPerServing || {};
  const calories = rawNutr.calories ?? rawNutr.kcal ?? recipe.kcalPerServing ?? 450;
  const protein = rawNutr.protein ?? rawNutr.proteinG ?? recipe.proteinG ?? 20;
  const b12 = rawNutr.b12 ?? rawNutr.b12Mcg ?? recipe.b12Mcg ?? 1.2;
  const prepTime = recipe.prepTime || 20;
  const image = recipe.image || (recipe.imageUrl ? (recipe.imageUrl.startsWith('http') ? recipe.imageUrl : `/uploads/${recipe.imageUrl}`) : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80');

  // Safe extraction of ingredients list
  const ingredientsList = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map(ing => {
        if (typeof ing === 'string') return { name: ing, amount: '' };
        return {
          name: ing.name || ing.ingredientName || 'Nguyên liệu',
          amount: ing.amount || `${ing.quantity || ''} ${ing.unit || ''}`.trim()
        };
      })
    : [];

  // Safe extraction of cooking steps
  const stepsList = Array.isArray(recipe.steps) && recipe.steps.length > 0
    ? recipe.steps
    : (typeof recipe.instructions === 'string' && recipe.instructions.trim().length > 0
        ? recipe.instructions.split('\n').map(s => s.trim()).filter(s => s.length > 0)
        : ['Sơ chế nguyên liệu tươi sạch.', 'Chế biến nhiệt vừa theo hướng dẫn.', 'Bày ra đĩa và thưởng thức khi còn ấm nóng.']);

  const modalNode = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-forest/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-hairline rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-hidden shadow-floating flex flex-col relative my-auto animate-fade-up"
      >
        {/* Banner Image with Close Button */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-forest shrink-0">
          <img
            src={image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/30 to-transparent"></div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-forest/80 hover:bg-forest text-white backdrop-blur-xs transition cursor-pointer shadow-md"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3.5 left-4 right-4 text-white space-y-1">
            <span className="text-[10px] font-metric font-semibold text-emerald-300 uppercase tracking-wider">
              {recipe.season || recipe.category || 'Món chay khoa học'}
            </span>
            <h2 className="font-editorial text-lg sm:text-2xl font-bold leading-tight">
              {recipe.title}
            </h2>
            {(recipe.subtitle || recipe.englishSub) && (
              <p className="text-xs text-alabaster/85 italic line-clamp-1">
                {recipe.subtitle || recipe.englishSub}
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-metric">
            <div className="p-2.5 rounded-2xl bg-alabaster border border-hairline">
              <span className="text-[10px] font-bold uppercase text-olive block">Thời Gian</span>
              <p className="font-metric text-sm sm:text-base font-bold text-forest mt-0.5">{prepTime}p</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-alabaster border border-hairline">
              <span className="text-[10px] font-bold uppercase text-olive block">Năng Lượng</span>
              <p className="font-metric text-sm sm:text-base font-bold text-forest mt-0.5">{calories} kcal</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-alabaster border border-hairline">
              <span className="text-[10px] font-bold uppercase text-olive block">Đạm Thực Vật</span>
              <p className="font-metric text-sm sm:text-base font-bold text-emeraldBotanic mt-0.5">{protein}g</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-alabaster border border-hairline">
              <span className="text-[10px] font-bold uppercase text-olive block">Vitamin B12</span>
              <p className="font-metric text-sm sm:text-base font-bold text-forest mt-0.5">{b12}µg</p>
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <p className="text-xs text-slate-700 leading-relaxed bg-alabaster/60 p-3.5 rounded-2xl border border-hairline">
              {recipe.description}
            </p>
          )}

          {/* Ingredients & Steps */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Ingredients (5 cols) */}
            <div className="md:col-span-5 space-y-2.5">
              <h3 className="font-editorial text-sm font-bold text-forest flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emeraldBotanic" />
                <span>Nguyên Liệu Chuẩn Bị</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                {ingredientsList.map((ing, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-alabaster border border-hairline flex items-center justify-between"
                  >
                    <span className="font-medium text-forest truncate">{ing.name}</span>
                    {ing.amount && (
                      <span className="font-metric font-bold text-emeraldBotanic shrink-0 ml-1.5">{ing.amount}</span>
                    )}
                  </div>
                ))}
                {ingredientsList.length === 0 && (
                  <p className="text-xs text-olive italic">Nguyên liệu thực vật tự nhiên.</p>
                )}
              </div>
            </div>

            {/* Cooking Steps (7 cols) */}
            <div className="md:col-span-7 space-y-2.5">
              <h3 className="font-editorial text-sm font-bold text-forest flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-terracotta" />
                <span>Các Bước Thực Hiện</span>
              </h3>
              <div className="space-y-2 text-xs">
                {stepsList.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-alabaster border border-hairline">
                    <span className="w-5 h-5 rounded-full bg-forest text-white font-metric text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-forest leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Action Footer */}
        <div className="p-4 sm:px-6 bg-alabaster/60 border-t border-hairline flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onToggleSave && onToggleSave(recipe.id)}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isSaved
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-white text-forest border-hairline hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
            <span>{isSaved ? 'Đã Lưu' : 'Lưu món ăn'}</span>
          </button>

          <div className="flex items-center gap-2">
            {onApplyMeal && (
              <button
                type="button"
                onClick={() => {
                  onApplyMeal(recipe.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Đưa vào thực đơn</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}
