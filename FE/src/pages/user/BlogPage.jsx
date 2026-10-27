import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, ArrowRight, X, ChevronLeft, ChevronRight, Mail, 
  Sparkles, Sprout, Plus, Bookmark, CheckCircle2, Clock, 
  Flame, Utensils, ChefHat, RefreshCw, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recipeService } from '../../api/services/recipeService';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
];

export default function BlogPage({ onNavigate }) {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState(['Tất cả']);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'views' | 'kcal_low'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [savedArticleIds, setSavedArticleIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('veggieai_saved_article_ids') || '[]');
    } catch {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch live recipes and categories from backend
  const fetchLiveData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [recipeList, catList] = await Promise.all([
        recipeService.getRecipes({ status: 'published' }).catch(err => {
          console.warn('Failed to load recipes from BE, falling back to all:', err);
          return recipeService.getRecipes();
        }),
        recipeService.getCategories().catch(() => [])
      ]);

      const validRecipes = Array.isArray(recipeList) ? recipeList : [];

      // Check for user locally created posts to merge seamlessly
      let localUserPosts = [];
      try {
        const stored = localStorage.getItem('veggieai_user_created_recipes');
        if (stored) {
          localUserPosts = JSON.parse(stored);
        }
      } catch {}

      const combined = [...localUserPosts, ...validRecipes];
      setRecipes(combined);

      // Extract unique category names
      const categoryNames = new Set(['Tất cả']);
      if (Array.isArray(catList)) {
        catList.forEach(c => {
          if (c?.name) categoryNames.add(c.name);
        });
      }
      combined.forEach(r => {
        if (r?.category) categoryNames.add(r.category);
      });
      setCategories(Array.from(categoryNames));
    } catch (err) {
      console.error('Error fetching live blog data:', err);
      setLoadError('Không thể tải bài viết từ máy chủ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  // Save bookmark handler
  const handleToggleSaveArticle = async (article, e) => {
    if (e) e.stopPropagation();
    if (!article) return;
    if (!user) {
      if (onNavigate) onNavigate('login');
      return;
    }
    const isSaved = savedArticleIds.includes(article.id);
    const nextSaved = isSaved 
      ? savedArticleIds.filter(id => id !== article.id) 
      : [...savedArticleIds, article.id];
    
    setSavedArticleIds(nextSaved);
    try {
      localStorage.setItem('veggieai_saved_article_ids', JSON.stringify(nextSaved));
    } catch {}

    if (isSaved) {
      recipeService.removeFavorite(article.id).catch(() => {});
      showToast(`Đã bỏ lưu bài viết "${article.title}"`);
    } else {
      recipeService.addFavorite(article.id).catch(() => {});
      showToast('❤️ Đã lưu vào danh sách yêu thích!');
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedArticle) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedArticle(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = orig;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedArticle]);

  // Filter & Sort Recipes
  const filteredAndSorted = useMemo(() => {
    let list = [...recipes];

    // Category filter
    if (activeCategory !== 'Tất cả') {
      list = list.filter(r => r.category === activeCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.instructions && r.instructions.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q)) ||
        (r.author && r.author.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (sortOrder === 'views') {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortOrder === 'kcal_low') {
      list.sort((a, b) => (Number(a.kcalPerServing) || 0) - (Number(b.kcalPerServing) || 0));
    } else {
      // newest
      list.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return list;
  }, [recipes, activeCategory, searchQuery, sortOrder]);

  // Featured article (Top item from current list or most viewed)
  const featuredArticle = useMemo(() => {
    if (!recipes.length) return null;
    return [...recipes].sort((a, b) => (b.views || 0) - (a.views || 0))[0] || recipes[0];
  }, [recipes]);

  // Paginated articles
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  const handleNavigateDetail = (item) => {
    if (onNavigate) {
      onNavigate('article-detail', item);
    } else {
      setSelectedArticle(item);
    }
  };

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 space-y-10 max-w-7xl mx-auto animate-fade-up">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest text-white px-5 py-3 rounded-2xl shadow-floating flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-fade-up border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================
          1. HERO HEADER SECTION
      ==================================================================== */}
      <section className="bg-forest text-alabaster rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-card">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
            <Sprout className="w-3.5 h-3.5" />
            <span>KHÁM PHÁ CÔNG THỨC & ẨM THỰC THUẦN CHAY</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
            Bài Viết & Món Chay Tinh Hoa
          </h1>

          <p className="text-xs sm:text-sm text-alabaster/80 leading-relaxed max-w-2xl mx-auto">
            Hàng chục công thức nấu chay chuẩn dưỡng chất, được phân tích Macro tự động bằng trí tuệ nhân tạo Gemini và chia sẻ bởi cộng đồng sống xanh.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto flex items-center bg-white rounded-full p-1.5 shadow-card border border-white/20">
            <Search className="w-4 h-4 text-slate-400 ml-3 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm theo tên món, nguyên liệu, vi chất..."
              className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent py-1"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 mr-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-emeraldBotanic hover:bg-forest text-white text-xs font-semibold transition shrink-0"
            >
              Tìm kiếm
            </button>
          </div>

          {/* User Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('create-post')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng công thức / bài viết</span>
            </button>
            {user && (
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('user-posts')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition cursor-pointer backdrop-blur-xs"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                <span>Quản lý bài viết của tôi</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    active
                      ? 'bg-emeraldBotanic text-white shadow-xs font-bold'
                      : 'bg-white/10 text-alabaster/90 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. FEATURED RECIPE HERO BANNER
      ==================================================================== */}
      {activeCategory === 'Tất cả' && !searchQuery && featuredArticle && !isLoading && (
        <section
          onClick={() => handleNavigateDetail(featuredArticle)}
          className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-xs hover:shadow-card transition duration-200 cursor-pointer group grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[380px] overflow-hidden bg-slate-100">
            <img
              src={featuredArticle.imageUrl || FALLBACK_IMAGES[0]}
              alt={featuredArticle.title}
              onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/90 text-emerald-300 backdrop-blur-md text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>CÔNG THỨC NỔI BẬT</span>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-olive font-metric">
                <span className="font-bold text-emeraldBotanic uppercase tracking-wider">
                  {featuredArticle.category || 'Món chay'}
                </span>
                <span>•</span>
                <span>{featuredArticle.views || 120} lượt xem</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>25 phút</span>
                </span>
              </div>

              <h2 className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold text-forest group-hover:text-emeraldBotanic transition leading-snug">
                {featuredArticle.title}
              </h2>

              <p className="text-xs sm:text-sm text-olive leading-relaxed line-clamp-3">
                {featuredArticle.instructions || 'Món chay thanh nhẹ, giàu dưỡng chất với hương vị tự nhiên hòa quyện.'}
              </p>

              {/* Macro Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
                  <Flame className="w-3 h-3 text-emerald-600" />
                  <span>{featuredArticle.kcalPerServing || 280} kcal/khẩu phần</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">
                  <Utensils className="w-3 h-3 text-blue-600" />
                  <span>{featuredArticle.proteinG || 12}g Protein</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-100">
                  <ChefHat className="w-3 h-3 text-amber-600" />
                  <span>{featuredArticle.servings || 2} khẩu phần</span>
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-hairline flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200">
                  {featuredArticle.author ? featuredArticle.author.charAt(0).toUpperCase() : 'V'}
                </div>
                <div>
                  <div className="text-xs font-bold text-forest">{featuredArticle.author || 'Đầu bếp VeggieAI'}</div>
                  <div className="text-[11px] text-olive">Chuyên gia ẩm thực chay</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleSaveArticle(featuredArticle, e)}
                  className="p-2 rounded-xl border border-hairline text-olive hover:text-forest hover:bg-alabaster transition"
                  title="Lưu công thức"
                >
                  <Bookmark className={`w-4 h-4 ${savedArticleIds.includes(featuredArticle.id) ? 'fill-emeraldBotanic text-emeraldBotanic' : ''}`} />
                </button>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition">
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          3. ARTICLES GRID SECTION
      ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-forest">Danh Sách Công Thức & Bài Viết</h2>
            <p className="text-xs text-olive">
              {filteredAndSorted.length} bài viết dinh dưỡng thực vật sẵn sàng cho bạn thực hành
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-olive font-metric">
            <span>Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white border border-hairline rounded-xl px-3 py-1.5 text-xs text-forest font-semibold outline-none focus:border-emeraldBotanic transition"
            >
              <option value="newest">Mới nhất</option>
              <option value="views">Đọc nhiều nhất</option>
              <option value="kcal_low">Ít Calo nhất</option>
            </select>
            <button
              type="button"
              onClick={fetchLiveData}
              className="p-1.5 rounded-xl border border-hairline bg-white hover:bg-slate-50 text-slate-600 transition"
              title="Làm mới dữ liệu từ server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-hairline p-5 space-y-4 animate-pulse">
                <div className="aspect-video bg-slate-200 rounded-2xl w-full"></div>
                <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded-md w-full"></div>
                <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!isLoading && loadError && (
          <div className="text-center py-12 bg-white rounded-3xl border border-rose-200 p-8 space-y-3">
            <p className="text-sm text-rose-600 font-semibold">{loadError}</p>
            <button
              type="button"
              onClick={fetchLiveData}
              className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forestDark transition"
            >
              Thử lại ngay
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !loadError && paginatedArticles.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-hairline p-8 space-y-3">
            <Sprout className="w-10 h-10 text-emerald-600 mx-auto opacity-70" />
            <h3 className="font-editorial text-lg font-bold text-forest">Không tìm thấy công thức phù hợp</h3>
            <p className="text-xs text-olive max-w-md mx-auto">
              Không có bài viết nào khớp với từ khóa "{searchQuery}" trong danh mục "{activeCategory}".
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveCategory('Tất cả'); }}
              className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forestDark transition"
            >
              Xem tất cả bài viết
            </button>
          </div>
        )}

        {/* 3-Column Grid */}
        {!isLoading && !loadError && paginatedArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedArticles.map((art, idx) => {
              const isSaved = savedArticleIds.includes(art.id);
              const imgSrc = art.imageUrl || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
              return (
                <article
                  key={art.id || idx}
                  onClick={() => handleNavigateDetail(art)}
                  className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-xs hover:shadow-card transition duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={imgSrc}
                        alt={art.title}
                        onError={(e) => { e.target.src = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-forest/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold">
                        {art.category || 'Món chay'}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSaveArticle(art, e)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-emeraldBotanic shadow-xs transition"
                        title={isSaved ? 'Bỏ lưu' : 'Lưu bài viết'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emeraldBotanic text-emeraldBotanic' : ''}`} />
                      </button>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="text-[11px] text-olive font-metric flex items-center gap-2">
                        <span>{art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                        <span>•</span>
                        <span>{art.views || 0} lượt xem</span>
                      </div>

                      <h3 className="font-editorial text-base font-bold text-forest group-hover:text-emeraldBotanic transition leading-snug line-clamp-2">
                        {art.title}
                      </h3>

                      <p className="text-xs text-olive line-clamp-2 leading-relaxed">
                        {art.instructions || 'Công thức thanh đạm, lành mạnh cho sức khỏe gia đình.'}
                      </p>

                      {/* Nutrition Tags */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {art.kcalPerServing || 250} kcal
                        </span>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {art.proteinG || 10}g Protein
                        </span>
                        {art.servings && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                            {art.servings} phần
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 border-t border-hairline flex items-center justify-between text-xs text-olive font-metric bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                        {art.author ? art.author.charAt(0).toUpperCase() : 'V'}
                      </div>
                      <span className="font-semibold text-forest text-[11px] truncate max-w-[120px]">
                        {art.author || 'Tác giả Veggie'}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-emeraldBotanic font-bold group-hover:translate-x-0.5 transition text-[11px]">
                      <span>Đọc tiếp</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl border border-hairline bg-white hover:bg-alabaster disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-olive" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-xs font-metric font-bold transition cursor-pointer ${
                  currentPage === page
                    ? 'bg-forest text-white shadow-xs'
                    : 'bg-white border border-hairline text-olive hover:bg-alabaster'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-xl border border-hairline bg-white hover:bg-alabaster disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-olive" />
            </button>
          </div>
        )}
      </section>

      {/* ====================================================================
          4. NEWSLETTER SUBSCRIPTION SECTION
      ==================================================================== */}
      <section className="bg-forest text-alabaster rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-card text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-400/20 text-emerald-300 mx-auto">
          <Mail className="w-6 h-6" />
        </div>

        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
          Nuôi Dưỡng Cơ Thể Khoa Học Từng Ngày
        </h2>

        <p className="text-xs sm:text-sm text-alabaster/80 max-w-lg mx-auto">
          Nhận thực đơn chay mẫu, công thức chất lượng cao và phân tích vi chất dinh dưỡng từ bác sĩ vào mỗi sáng thứ Hai.
        </p>

        <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="Nhập email của bạn..."
            required
            className="flex-1 px-4 py-2.5 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-terracotta hover:bg-terracottaDark text-white text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 shadow-xs"
          >
            Đăng ký ngay
          </button>
        </form>

        {subscribed && (
          <p className="text-emerald-300 text-xs font-semibold">
            🎉 Cảm ơn bạn đã đăng ký nhận bản tin dinh dưỡng!
          </p>
        )}

        <p className="text-[11px] text-alabaster/60">
          Miễn phí 100%. Bạn có thể hủy nhận tin bất kỳ lúc nào.
        </p>
      </section>

      {/* ====================================================================
          5. QUICK ARTICLE READER MODAL (PORTAL)
      ==================================================================== */}
      {selectedArticle && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setSelectedArticle(null)}
          className="fixed inset-0 z-[9999] bg-forest/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-hidden shadow-floating border border-hairline flex flex-col relative my-auto animate-fade-up"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-hairline relative shrink-0">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                title="Đóng bài viết"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2 pr-8">
                <span className="inline-block px-3 py-0.5 rounded-full bg-emeraldBotanic/10 text-emeraldBotanic text-[11px] font-bold">
                  {selectedArticle.category || 'Công thức món chay'}
                </span>

                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-forest leading-tight">
                  {selectedArticle.title}
                </h2>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    {selectedArticle.author ? selectedArticle.author.charAt(0).toUpperCase() : 'V'}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-forest">{selectedArticle.author || 'Đầu bếp Veggie'}</span>
                    <span className="text-olive ml-2 font-metric">
                      {selectedArticle.views || 0} lượt xem • {selectedArticle.kcalPerServing || 250} kcal
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="aspect-video rounded-2xl overflow-hidden bg-forest">
                <img
                  src={selectedArticle.imageUrl || FALLBACK_IMAGES[0]}
                  alt={selectedArticle.title}
                  onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center">
                  <div className="text-[10px] text-emerald-700 font-medium">Năng lượng</div>
                  <div className="text-sm font-bold text-emerald-900">{selectedArticle.kcalPerServing || 250} kcal</div>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-center">
                  <div className="text-[10px] text-blue-700 font-medium">Chất đạm</div>
                  <div className="text-sm font-bold text-blue-900">{selectedArticle.proteinG || 12}g</div>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-center">
                  <div className="text-[10px] text-amber-700 font-medium">Khẩu phần</div>
                  <div className="text-sm font-bold text-amber-900">{selectedArticle.servings || 2} người</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-editorial text-base font-bold text-forest">Hướng dẫn thực hiện:</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                  {selectedArticle.instructions || 'Chưa có thông tin các bước chế biến.'}
                </p>
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="p-4 sm:px-6 border-t border-hairline bg-alabaster/60 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl border border-hairline text-olive hover:text-forest text-xs font-semibold transition cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleSaveArticle(selectedArticle, e)}
                  className="px-4 py-2 rounded-xl border border-hairline bg-white hover:bg-slate-100 text-forest text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedArticleIds.includes(selectedArticle.id) ? 'fill-emeraldBotanic text-emeraldBotanic' : ''}`} />
                  <span>{savedArticleIds.includes(selectedArticle.id) ? 'Đã lưu' : 'Lưu bài'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const art = selectedArticle;
                    setSelectedArticle(null);
                    handleNavigateDetail(art);
                  }}
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Xem trang chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
