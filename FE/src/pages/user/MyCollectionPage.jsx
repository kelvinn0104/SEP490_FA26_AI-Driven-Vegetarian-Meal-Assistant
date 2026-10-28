import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bookmark, BookmarkCheck, Heart, Search, Plus, Filter, 
  Clock, Flame, Leaf, Calendar, ArrowRight, Play, Sparkles, 
  BookOpen, User, Check, X, ChevronDown, Utensils, Video, 
  Share2, ExternalLink, RefreshCw, Trash2, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import { recipeService } from '../../api/services/recipeService';
import RecipeDetailModal from '../../components/recipes/RecipeDetailModal';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80';

export default function MyCollectionPage({ onNavigate }) {
  const { user } = useAuth();
  const { profile, updateProfile, recipesDb } = useVeggieNutrition();

  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' | 'videos'
  const [searchQuery, setSearchQuery] = useState('');
  const [allRecipes, setAllRecipes] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load saved IDs & recipes from backend
  const loadSavedData = async () => {
    setIsLoading(true);
    try {
      // 1. Get saved IDs from both localStorage sources
      let articleSaved = [];
      try {
        articleSaved = JSON.parse(localStorage.getItem('veggieai_saved_article_ids') || '[]');
      } catch {}

      const profileSaved = profile?.savedRecipeIds || [];
      const combinedSavedIds = Array.from(new Set([...articleSaved, ...profileSaved]));
      setSavedIds(combinedSavedIds);

      // 2. Fetch live recipes if not already in context
      let recipesList = recipesDb || [];
      if (!recipesList.length) {
        const fetched = await recipeService.getRecipes();
        if (Array.isArray(fetched)) {
          recipesList = fetched.map(r => ({
            id: r.id,
            title: r.title,
            category: r.category || 'Món chay',
            imageUrl: r.imageUrl,
            servings: r.servings || 2,
            kcalPerServing: r.kcalPerServing || 300,
            proteinG: r.proteinG || 14,
            instructions: r.instructions || '',
            publishedAt: r.publishedAt
          }));
        }
      }
      setAllRecipes(recipesList);
    } catch (err) {
      console.warn('Error loading saved recipes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedData();
  }, [profile?.savedRecipeIds, recipesDb]);

  // Filter saved recipes
  const savedRecipesList = useMemo(() => {
    if (!savedIds.length) return [];
    const idSet = new Set(savedIds.map(String));

    return allRecipes.filter(r => {
      const rawId = String(r.id || '').trim();
      const numId = rawId.replace(/\D/g, '');
      const matchId = idSet.has(rawId) || idSet.has(numId) || idSet.has(`r${rawId}`) || idSet.has(`rec_${rawId}`);
      if (!matchId) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (r.title && r.title.toLowerCase().includes(q)) ||
               (r.category && r.category.toLowerCase().includes(q));
      }
      return true;
    });
  }, [allRecipes, savedIds, searchQuery]);

  // Handle Remove from Saved
  const handleRemoveSaved = async (recipeId, e) => {
    if (e) e.stopPropagation();
    const strId = String(recipeId);
    const nextSavedIds = savedIds.filter(id => String(id) !== strId && String(id).replace(/\D/g, '') !== strId.replace(/\D/g, ''));
    setSavedIds(nextSavedIds);

    // Sync to localStorage
    try {
      localStorage.setItem('veggieai_saved_article_ids', JSON.stringify(nextSavedIds));
    } catch {}

    // Sync to profile if present
    if (profile && updateProfile) {
      updateProfile({
        ...profile,
        savedRecipeIds: nextSavedIds
      });
    }

    // Call backend API if applicable
    recipeService.removeFavorite(recipeId).catch(() => {});

    showToast('Đã xóa món ăn khỏi Bộ sưu tập');
  };

  // Sample Saved Videos
  const savedVideos = [
    {
      id: 'v1',
      title: 'Bí quyết nấu Nước Dùng Chay ngọt thanh đậm đà từ củ quả tự nhiên',
      channel: 'Bếp Chay An Lạc',
      duration: '12:45',
      summary: 'Hầm củ cải trắng, su hào, cà rốt và lê ngọt lửa liu riu 45 phút lấy nước cốt thanh ngọt.',
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'v2',
      title: 'Ram nấm nướng giòn rụm không dầu mỡ cho tiệc cuối tuần',
      channel: 'Thanh Nhã Kitchen',
      duration: '08:30',
      summary: 'Trộn mộc nhĩ, nấm đùi gà xé sợi, cuộn bánh tráng mè nướng nồi chiên không dầu 180°C.',
      thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-up">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest text-white px-5 py-3 rounded-2xl shadow-floating flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-fade-up border border-emerald-500/30">
          <BookmarkCheck className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Bookmark className="w-3.5 h-3.5 fill-emerald-800" />
            <span>KHO LƯU TRỮ CÁ NHÂN</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-forest">
            Bộ Sưu Tập Của Tôi
          </h1>
          <p className="text-xs text-olive mt-1">
            Tổng hợp các công thức món chay và video hướng dẫn bạn đã đánh dấu yêu thích để dễ dàng nấu lại.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('blog')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          <span>Khám phá thêm công thức</span>
        </button>
      </div>

      {/* CONTROLS: TABS & SEARCH */}
      <div className="bg-white rounded-3xl border border-hairline p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-1 sm:flex-initial flex items-center gap-1.5 ${
              activeTab === 'recipes' ? 'bg-white text-forest shadow-xs' : 'text-olive hover:text-forest'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Công thức món chay ({savedIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-1 sm:flex-initial flex items-center gap-1.5 ${
              activeTab === 'videos' ? 'bg-white text-forest shadow-xs' : 'text-olive hover:text-forest'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video nấu ăn ({savedVideos.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm trong mục đã lưu..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-hairline bg-slate-50/50 focus:bg-white focus:border-forest outline-none transition"
          />
        </div>
      </div>

      {/* RECIPES TAB */}
      {activeTab === 'recipes' && (
        <div>
          {isLoading ? (
            <div className="bg-white rounded-3xl border border-hairline p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-olive font-metric">Đang tải bộ sưu tập công thức yêu thích...</p>
            </div>
          ) : savedRecipesList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-hairline p-12 text-center space-y-4">
              <Bookmark className="w-12 h-12 text-emerald-600/40 mx-auto" />
              <h3 className="font-editorial text-lg font-bold text-forest">Bạn chưa lưu công thức món ăn nào</h3>
              <p className="text-xs text-olive max-w-sm mx-auto">
                Khi lướt trang Blog hoặc Thực đơn tuần, hãy bấm vào biểu tượng Bookmark để lưu lại những món chay tâm đắc.
              </p>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('blog')}
                className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forestDark transition cursor-pointer inline-flex items-center gap-2"
              >
                <span>Xem danh sách công thức</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipesList.map((recipe) => {
                const img = recipe.imageUrl || recipe.image || FALLBACK_IMAGE;
                return (
                  <div
                    key={recipe.id}
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('article-detail', recipe);
                      } else {
                        setSelectedRecipeDetail(recipe);
                      }
                    }}
                    className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-xs hover:shadow-card transition duration-200 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-video overflow-hidden bg-slate-100">
                        <img
                          src={img}
                          alt={recipe.title}
                          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-forest/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold">
                          {recipe.category || 'Món chay'}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSaved(recipe.id, e)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/95 backdrop-blur-md text-emerald-700 hover:text-rose-600 shadow-xs transition"
                          title="Bỏ lưu món này"
                        >
                          <Bookmark className="w-4 h-4 fill-emerald-600 text-emerald-600 hover:fill-rose-600 hover:text-rose-600" />
                        </button>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <h3 className="font-editorial text-base font-bold text-forest group-hover:text-emeraldBotanic transition leading-snug line-clamp-2">
                          {recipe.title}
                        </h3>

                        <p className="text-xs text-olive line-clamp-2 leading-relaxed">
                          {recipe.instructions || 'Công thức chay dinh dưỡng cân bằng và thơm ngon.'}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {recipe.kcalPerServing || 300} kcal
                          </span>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {recipe.proteinG || 14}g Protein
                          </span>
                          {recipe.servings && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                              {recipe.servings} phần
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 border-t border-hairline flex items-center justify-between text-xs text-olive font-metric bg-slate-50/50">
                      <span className="text-emerald-700 font-semibold text-[11px]">Đã lưu vào bộ sưu tập</span>
                      <span className="flex items-center gap-1 text-forest font-bold group-hover:translate-x-0.5 transition text-[11px]">
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIDEOS TAB */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onNavigate && onNavigate('videos')}
              className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-xs hover:shadow-card transition duration-200 cursor-pointer flex flex-col sm:flex-row items-start group"
            >
              <div className="w-full sm:w-48 aspect-video sm:aspect-square relative overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-forest flex items-center justify-center shadow-md">
                    <Play className="w-4 h-4 fill-forest ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-metric text-[10px] font-bold">
                  {video.duration}
                </span>
              </div>

              <div className="p-5 flex-1 space-y-2">
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                  {video.channel}
                </span>
                <h3 className="font-editorial text-base font-bold text-forest group-hover:text-emeraldBotanic transition leading-snug">
                  {video.title}
                </h3>
                <p className="text-xs text-olive line-clamp-2 leading-relaxed">
                  {video.summary}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <span>Mở kho video</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECIPE DETAIL MODAL FALLBACK */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          isSaved={true}
          onToggleSave={(id) => handleRemoveSaved(id)}
        />
      )}
    </div>
  );
}
