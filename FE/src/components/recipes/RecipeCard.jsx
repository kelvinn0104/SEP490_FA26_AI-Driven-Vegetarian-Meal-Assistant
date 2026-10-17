import React from 'react';
import { Clock, Bookmark, Sparkles, ChevronRight } from 'lucide-react';

export default function RecipeCard({
  recipe,
  isSaved = false,
  onToggleSave,
  onSelectDetail,
  actionButton = null
}) {
  return (
    <div
      onClick={() => onSelectDetail && onSelectDetail(recipe)}
      className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-xs hover:shadow-card transition duration-200 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-alabaster">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />

          {/* Top Left: Match Score Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest/90 backdrop-blur-xs text-emerald-300 text-[11px] font-metric font-bold shadow-xs">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>{recipe.matchScore}% Match</span>
          </div>

          {/* Top Right: Prep Time & Save Bookmark */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-forest text-[11px] font-metric font-bold flex items-center gap-1 shadow-xs">
              <Clock className="w-3 h-3 text-olive" />
              <span>{recipe.prepTime}p</span>
            </span>

            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(recipe.id);
                }}
                className={`p-2 rounded-full backdrop-blur-xs shadow-xs transition cursor-pointer ${
                  isSaved
                    ? 'bg-terracotta text-white'
                    : 'bg-white/90 text-forest hover:bg-white'
                }`}
                title={isSaved ? 'Bỏ lưu' : 'Lưu công thức'}
              >
                <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Season Tag */}
          <span className="text-[10px] font-metric font-semibold text-emeraldBotanic uppercase tracking-wider block">
            {recipe.season || 'Món chay khoa học'}
          </span>

          <h3 className="font-editorial text-base sm:text-lg font-bold text-forest leading-snug line-clamp-2 group-hover:text-emeraldBotanic transition">
            {recipe.title}
          </h3>

          <p className="text-xs text-olive line-clamp-2 leading-relaxed">
            {recipe.subtitle}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(recipe.tags || []).slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-alabaster border border-hairline text-olive font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info: Calories & Protein */}
      <div className="p-4 sm:p-5 pt-0 border-t border-hairline/60 mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-metric">
          <span className="text-forest font-bold">{recipe.nutrients.calories} <span className="font-normal text-olive text-[11px]">kcal</span></span>
          <span className="text-hairline">•</span>
          <span className="text-forest font-bold">{recipe.nutrients.protein}g <span className="font-normal text-olive text-[11px]">Đạm</span></span>
        </div>

        {actionButton || (
          <span className="text-xs font-semibold text-emeraldBotanic flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
            <span>Chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
