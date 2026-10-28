import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Eye, Clock, CheckCircle2, 
  AlertCircle, RefreshCw, Layers, ArrowLeft, ExternalLink,
  Flame, Utensils, ChefHat, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recipeService } from '../../api/services/recipeService';

const FALLBACK_THUMBNAIL = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80';

export default function ManagePostsPage({ onNavigate }) {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'published' | 'pending'
  const [toastMessage, setToastMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch posts from backend & local storage
  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const liveList = await recipeService.getRecipes().catch(() => []);
      const validLive = Array.isArray(liveList) ? liveList : [];

      let userCreated = [];
      try {
        const stored = localStorage.getItem('veggieai_user_created_recipes');
        if (stored) {
          userCreated = JSON.parse(stored);
        }
      } catch {}

      // Combine userCreated at top, followed by live recipes
      const combined = [...userCreated, ...validLive];
      setPosts(combined);
    } catch (err) {
      console.error('Error loading posts:', err);
      showToast('⚠️ Không thể tải danh sách bài viết từ máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Tab filter
      if (activeTab === 'published' && post.status !== 'published') return false;
      if (activeTab === 'pending' && post.status === 'published') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = post.title && post.title.toLowerCase().includes(q);
        const matchesCategory = post.category && post.category.toLowerCase().includes(q);
        const matchesAuthor = post.author && post.author.toLowerCase().includes(q);
        return matchesTitle || matchesCategory || matchesAuthor;
      }
      return true;
    });
  }, [posts, activeTab, searchQuery]);

  // Handle Delete Post
  const handleDeletePost = async (id) => {
    try {
      // Optimistic update
      setPosts(prev => prev.filter(p => p.id !== id));

      // Remove from local storage if present
      try {
        const stored = JSON.parse(localStorage.getItem('veggieai_user_created_recipes') || '[]');
        const updated = stored.filter(p => p.id !== id);
        localStorage.setItem('veggieai_user_created_recipes', JSON.stringify(updated));
      } catch {}

      // Call backend DELETE if valid ID
      if (typeof id === 'string' && id.startsWith('r')) {
        await recipeService.deleteRecipe(id);
      }

      showToast('🗑️ Đã xóa bài viết thành công!');
    } catch (err) {
      console.error('Delete post error:', err);
      showToast('⚠️ Có lỗi xảy ra khi xóa bài viết.');
      loadPosts();
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (post) => {
    const nextStatus = post.status === 'published' ? 'hidden' : 'published';
    try {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: nextStatus } : p));

      // Update in local storage
      try {
        const stored = JSON.parse(localStorage.getItem('veggieai_user_created_recipes') || '[]');
        const updated = stored.map(p => p.id === post.id ? { ...p, status: nextStatus } : p);
        localStorage.setItem('veggieai_user_created_recipes', JSON.stringify(updated));
      } catch {}

      if (typeof post.id === 'string' && post.id.startsWith('r')) {
        await recipeService.updateRecipeStatus(post.id, nextStatus);
      }

      showToast(`✓ Đã đổi trạng thái bài viết thành: ${nextStatus === 'published' ? 'Đã xuất bản' : 'Ẩn'}`);
    } catch (err) {
      console.error('Update status error:', err);
      showToast('⚠️ Không thể cập nhật trạng thái trên máy chủ.');
      loadPosts();
    }
  };

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-fade-up">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest text-white px-5 py-3 rounded-2xl shadow-floating flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-fade-up border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('blog')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-olive hover:text-forest transition cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Blog ẩm thực chay</span>
          </button>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-forest">
            Quản Lý Bài Viết & Công Thức Của Tôi
          </h1>
          <p className="text-xs text-olive">
            Theo dõi, chỉnh sửa và quản lý các công thức món ăn bạn đã chia sẻ với cộng đồng.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('create-post')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          <span>Đăng công thức mới</span>
        </button>
      </div>

      {/* CONTROLS: TABS & SEARCH */}
      <div className="bg-white rounded-3xl border border-hairline p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-1 sm:flex-initial ${
              activeTab === 'all' ? 'bg-white text-forest shadow-xs' : 'text-olive hover:text-forest'
            }`}
          >
            Tất cả ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-1 sm:flex-initial ${
              activeTab === 'published' ? 'bg-white text-forest shadow-xs' : 'text-olive hover:text-forest'
            }`}
          >
            Đã xuất bản ({posts.filter(p => p.status === 'published').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-1 sm:flex-initial ${
              activeTab === 'pending' ? 'bg-white text-forest shadow-xs' : 'text-olive hover:text-forest'
            }`}
          >
            Chờ duyệt / Ẩn ({posts.filter(p => p.status !== 'published').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài viết..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-hairline bg-slate-50/50 focus:bg-white focus:border-forest outline-none transition"
          />
        </div>
      </div>

      {/* POSTS LIST */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-hairline p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-olive font-metric">Đang tải danh sách bài viết...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-hairline p-12 text-center space-y-4">
          <Layers className="w-10 h-10 text-emerald-600 mx-auto opacity-70" />
          <h3 className="font-editorial text-lg font-bold text-forest">Chưa có bài viết nào trong mục này</h3>
          <p className="text-xs text-olive max-w-sm mx-auto">
            Bạn có thể bắt đầu chia sẻ công thức món chay tâm đắc của mình ngay bây giờ.
          </p>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('create-post')}
            className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forestDark transition cursor-pointer"
          >
            Tạo bài viết đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isPub = post.status === 'published';
            const thumb = post.imageUrl || post.thumbnail || FALLBACK_THUMBNAIL;
            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-hairline p-4 sm:p-5 shadow-xs hover:shadow-card transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Thumbnail & Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-hairline">
                    <img
                      src={thumb}
                      alt={post.title}
                      onError={(e) => { e.target.src = FALLBACK_THUMBNAIL; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {post.category || 'Món chay'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPub 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isPub ? '● Đã xuất bản' : '● Đang chờ duyệt'}
                      </span>
                    </div>

                    <h3
                      onClick={() => onNavigate && onNavigate('article-detail', post)}
                      className="font-editorial text-base sm:text-lg font-bold text-forest hover:text-emeraldBotanic transition cursor-pointer truncate"
                      title={post.title}
                    >
                      {post.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-olive font-metric">
                      <span>{post.views || 0} lượt xem</span>
                      <span>•</span>
                      <span>{post.kcalPerServing || 250} kcal</span>
                      <span>•</span>
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('article-detail', post)}
                    className="p-2 rounded-xl border border-hairline bg-white hover:bg-slate-50 text-olive hover:text-forest transition cursor-pointer"
                    title="Xem trước bài viết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(post)}
                    className="px-3 py-1.5 rounded-xl border border-hairline bg-white hover:bg-slate-50 text-xs font-semibold text-forest transition cursor-pointer"
                    title="Đổi trạng thái"
                  >
                    {isPub ? 'Ẩn bài' : 'Xuất bản'}
                  </button>

                  {deleteConfirmId === post.id ? (
                    <div className="flex items-center gap-1.5 animate-fade-up">
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Xác nhận xóa
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1.5 rounded-xl border border-hairline text-slate-500 hover:bg-slate-100 text-xs"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(post.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Xóa bài viết"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
