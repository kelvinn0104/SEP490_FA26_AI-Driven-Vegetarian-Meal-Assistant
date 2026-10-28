import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bookmark, Share2, Heart, MessageSquare, 
  Calendar, Clock, Users, ChefHat, Sparkles, CheckCircle2, 
  Send, Plus, ChevronRight, X, ExternalLink, Flame, Utensils,
  Copy, Check, ShieldCheck, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recipeService } from '../../api/services/recipeService';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80';

export default function ArticleDetailPage({ articleData, onNavigate }) {
  const { user } = useAuth();

  const [article, setArticle] = useState(() => {
    if (articleData && typeof articleData === 'object' && articleData.title) {
      return articleData;
    }
    return {
      id: 'r31',
      title: 'Gỏi Ngó Sen Nấm Tuyết Sốt Tắc Chua Ngọt',
      category: 'Salad & Gỏi chay',
      author: 'Hoàng Nam',
      publishedAt: '2026-10-25 04:31',
      views: 4570,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
      servings: 2,
      kcalPerServing: 165,
      proteinG: 4.2,
      carbG: 28,
      fatG: 2,
      instructions: 'Ngó sen giòn sần sật phối cùng nấm tuyết ngâm nở, cà rốt bào sợi và sốt tắc pha đường thốt nốt. Trộn đều các nguyên liệu và dùng ngay.'
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(128);
  const [hasLiked, setHasLiked] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [toastMessage, setToastMessage] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Mai Linh',
      time: '2 ngày trước',
      content: 'Công thức rất ngon và chuẩn vị! Mình nấu thử cho cả nhà ai cũng khen nước dùng thanh ngọt tự nhiên.',
      likes: 6
    },
    {
      id: 'c2',
      author: 'Hoàng Nam',
      time: 'Hôm qua',
      content: 'Lượng đạm thực vật từ món này rất tốt cho người tập gym như mình. Cảm ơn tác giả đã chia sẻ!',
      likes: 3
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch or normalize article detail
  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        let rawId = null;
        if (typeof articleData === 'string') {
          rawId = articleData;
        } else if (articleData?.id) {
          rawId = articleData.id;
        }

        if (rawId && (typeof rawId === 'string' && rawId.startsWith('r'))) {
          // Live backend recipe ID
          try {
            const liveRecipe = await recipeService.getRecipeById(rawId);
            if (liveRecipe) {
              setArticle(liveRecipe);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Could not load recipe by ID from BE:', e);
          }
        }

        // Use passed articleData or fallback to a default recipe
        if (articleData && typeof articleData === 'object') {
          setArticle(articleData);
        } else {
          // Default recipe fallback
          setArticle({
            id: 'r31',
            title: 'Gỏi Ngó Sen Nấm Tuyết Sốt Tắc Chua Ngọt',
            category: 'Salad & Gỏi chay',
            author: 'Đầu bếp VeggieAI',
            publishedAt: new Date().toISOString(),
            views: 4570,
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
            servings: 2,
            kcalPerServing: 165,
            proteinG: 4.2,
            carbG: 28,
            fatG: 2,
            instructions: 'Ngó sen giòn sần sật phối cùng nấm tuyết ngâm nở, cà rốt bào sợi và sốt tắc pha đường thốt nốt. Trộn đều các nguyên liệu và dùng ngay.'
          });
        }
      } catch (err) {
        console.error('Error loading article detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [articleData]);

  // Check initial saved status
  useEffect(() => {
    if (article?.id) {
      try {
        const savedIds = JSON.parse(localStorage.getItem('veggieai_saved_article_ids') || '[]');
        setIsSaved(savedIds.includes(article.id));
      } catch {}
    }
  }, [article?.id]);

  const handleToggleSave = () => {
    if (!article) return;
    if (!user) {
      if (onNavigate) onNavigate('login');
      return;
    }
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      const savedIds = JSON.parse(localStorage.getItem('veggieai_saved_article_ids') || '[]');
      const updated = nextSaved
        ? [...savedIds, article.id]
        : savedIds.filter(id => id !== article.id);
      localStorage.setItem('veggieai_saved_article_ids', JSON.stringify(updated));
    } catch {}

    if (nextSaved) {
      recipeService.addFavorite(article.id).catch(() => {});
      showToast('❤️ Đã lưu vào danh sách bài viết yêu thích!');
    } else {
      recipeService.removeFavorite(article.id).catch(() => {});
      showToast('Đã bỏ lưu khỏi bài viết yêu thích');
    }
  };

  const handleToggleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      showToast('👍 Cảm ơn bạn đã thích công thức này!');
    } else {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Đã sao chép liên kết bài viết vào bộ nhớ tạm!');
    } else {
      showToast('🔗 Liên kết bài viết: ' + window.location.href);
    }
  };

  const handleToggleIngredientCheck = (idx) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newCmt = {
      id: `c_${Date.now()}`,
      author: user?.name || 'Bạn đọc',
      time: 'Vừa xong',
      content: commentText.trim(),
      likes: 0
    };
    setComments([newCmt, ...comments]);
    setCommentText('');
    showToast('💬 Đã gửi bình luận của bạn thành công!');
  };

  // Parse structured steps from instructions string
  const parsedSteps = React.useMemo(() => {
    if (!article?.instructions) return [];
    const text = article.instructions;
    // Check if instructions are formatted with "Bước 1:", "Bước 2:" or newline separated
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      return lines;
    }
    // Split by periods if single long paragraph
    const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
    if (sentences.length > 1) return sentences;
    return [text];
  }, [article?.instructions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-alabaster/40 py-12 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-olive font-metric">Đang tải nội dung bài viết từ hệ thống...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-alabaster/40 py-12 px-4 max-w-4xl mx-auto text-center space-y-4">
        <p className="text-sm text-olive">Không tìm thấy thông tin bài viết.</p>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('blog')}
          className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold"
        >
          Quay lại danh sách Blog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fade-up">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest text-white px-5 py-3 rounded-2xl shadow-floating flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-fade-up border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION & BREADCRUMB */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-hairline">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('blog')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-olive hover:text-forest transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách Blog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSave}
            className="p-2 rounded-xl border border-hairline bg-white hover:bg-slate-50 text-forest text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            title={isSaved ? 'Bỏ lưu' : 'Lưu bài viết'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emeraldBotanic text-emeraldBotanic' : ''}`} />
            <span className="hidden sm:inline">{isSaved ? 'Đã lưu' : 'Lưu công thức'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl border border-hairline bg-white hover:bg-slate-50 text-olive hover:text-forest text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            title="Chia sẻ bài viết"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <span>{article.category || 'Món chay tinh hoa'}</span>
        </div>

        <h1 className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-bold text-forest leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-y border-hairline py-3 text-xs text-olive font-metric">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold flex items-center justify-center border border-emerald-200">
              {article.author ? article.author.charAt(0).toUpperCase() : 'V'}
            </div>
            <div>
              <div className="font-bold text-forest text-sm">{article.author || 'Đầu bếp VeggieAI'}</div>
              <div className="text-[11px] text-olive">
                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'} • {article.views || 100} lượt xem
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                hasLiked 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold' 
                  : 'bg-white border-hairline text-olive hover:text-forest'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likes} Thích</span>
            </button>
          </div>
        </div>
      </div>

      {/* HERO COVER IMAGE */}
      <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-card border border-hairline bg-slate-100">
        <img
          src={article.imageUrl || article.img || FALLBACK_IMAGE}
          alt={article.title}
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* MACRO NUTRITION CARD */}
      <div className="bg-white rounded-3xl border border-hairline p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-editorial text-lg font-bold text-forest">Chỉ Số Dinh Dưỡng Mỗi Khẩu Phần</h3>
          </div>
          <span className="text-xs text-olive font-metric">Khẩu phần: {article.servings || 2} người</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-medium text-emerald-700 block">Năng lượng</span>
            <span className="text-xl font-bold text-emerald-900 mt-1 block">{article.kcalPerServing || 280} kcal</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
            <span className="text-[11px] font-medium text-blue-700 block">Chất đạm (Protein)</span>
            <span className="text-xl font-bold text-blue-900 mt-1 block">{article.proteinG || 12}g</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-[11px] font-medium text-amber-700 block">Tinh bột (Carbs)</span>
            <span className="text-xl font-bold text-amber-900 mt-1 block">{article.carbG || 35}g</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
            <span className="text-[11px] font-medium text-purple-700 block">Chất béo tốt (Fat)</span>
            <span className="text-xl font-bold text-purple-900 mt-1 block">{article.fatG || 6}g</span>
          </div>
        </div>
      </div>

      {/* INSTRUCTIONS & COOKING GUIDE */}
      <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-hairline">
          <ChefHat className="w-5 h-5 text-emerald-600" />
          <h2 className="font-editorial text-xl font-bold text-forest">Hướng Dẫn Nấu Chi Tiết</h2>
        </div>

        <div className="space-y-4">
          {parsedSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/60 border border-hairline">
              <div className="w-8 h-8 rounded-full bg-forest text-alabaster text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMMUNITY COMMENTS & FEEDBACK */}
      <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-hairline">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="font-editorial text-lg font-bold text-forest">Bình Luận Từ Bạn Đọc ({comments.length})</h3>
          </div>
        </div>

        {/* New Comment Box */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Chia sẻ cảm nhận hoặc bí quyết nấu của bạn..."
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-hairline bg-slate-50/50 focus:bg-white focus:border-forest outline-none transition"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5 text-emerald-300" />
            <span>Gửi</span>
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {comments.map((cmt) => (
            <div key={cmt.id} className="p-4 rounded-2xl bg-slate-50 border border-hairline space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest">{cmt.author}</span>
                <span className="text-[11px] text-olive font-metric">{cmt.time}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{cmt.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
