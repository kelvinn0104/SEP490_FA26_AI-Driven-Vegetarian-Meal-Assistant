import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit3, Video, FileText, CheckCircle2, Clock, 
  Eye, MoreVertical, Trash2, ExternalLink, Sparkles, Filter, 
  ChevronDown, BookOpen, AlertCircle, Play, Share2, Check, X, ArrowLeft
} from 'lucide-react';
import Button from '../components/ui/Button';

export default function ManagePostsPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // TABS: 'all' | 'posts' | 'videos' | 'drafts'
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // TOAST & MODAL PREVIEW
  const [toastMessage, setToastMessage] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  // DỮ LIỆU BÀI VIẾT & VIDEO (18 NỘI DUNG NHƯ ẢNH GỐC)
  const [items, setItems] = useState([
    {
      id: 'post_1',
      title: 'Ram nấm nướng giòn rụm không dầu mỡ cho tiệc cuối tuần',
      type: 'video_native',
      typeLabel: 'Video tự quay',
      timeLabel: 'Đăng 2 ngày trước',
      duration: '8:00',
      category: 'Món tiệc',
      nutritionAI: '185 kcal/cuốn',
      status: 'published',
      statusLabel: 'Đã xuất bản',
      views: '4.2k',
      saves: '320',
      thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      contentPreview: 'Công thức ram nấm nướng nồi chiên không dầu với mộc nhĩ, nấm đùi gà xé sợi, cuộn bánh tráng mè giòn rụm...'
    },
    {
      id: 'post_2',
      title: 'Cà ri bí đỏ hạt sen & đậu hũ non cốt dừa thơm béo',
      type: 'blog_recipe',
      typeLabel: 'Blog & Công thức',
      timeLabel: 'Đăng 4 ngày trước • Đọc 6 phút',
      category: 'Món kho/Cà ri',
      nutritionAI: '345 kcal • 18.5g Đạm',
      status: 'published',
      statusLabel: 'Đã xuất bản',
      views: '6.8k',
      saves: '512',
      thumbnail: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=400&q=80',
      contentPreview: 'Bí quyết nấu món cà ri chay béo ngậy từ nước cốt dừa tươi, bí đỏ bùi ngọt kết hợp hạt sen Huế thanh mát...'
    },
    {
      id: 'post_3',
      title: 'Bí quyết nấu Nước Dùng Chay ngọt thanh từ củ quả tự nhiên',
      type: 'video_link',
      typeLabel: 'Video dẫn link YouTube',
      timeLabel: 'Đăng hôm qua • Kênh: Bếp Chay An Lạc',
      duration: '12:45',
      category: 'Nước dùng chay',
      nutritionAI: 'AI đã tóm tắt 4 bước',
      status: 'pending',
      statusLabel: 'Đang chờ duyệt (WF07)',
      views: '0',
      saves: 'Chưa mở',
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      contentPreview: 'Nước dùng ngọt từ mía lau nướng, củ cải trắng và lê ngọt hầm nhỏ lửa trong 45 phút, trong vắt không bọt...'
    },
    {
      id: 'post_4',
      title: 'Canh Nấm Thược Dược Hạt Sen Củ Dền thanh nhiệt',
      type: 'blog_recipe',
      typeLabel: 'Blog & Công thức',
      timeLabel: 'Đăng 1 tuần trước • Đọc 5 phút',
      category: 'Món canh chay',
      nutritionAI: '340 kcal • 18g Đạm',
      status: 'published',
      statusLabel: 'Đã xuất bản',
      views: '5.1k',
      saves: '430',
      thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80',
      contentPreview: 'Món canh bồi bổ nguyên khí với vị ngọt dịu của củ dền tím, hạt sen tươi ninh nhừ và các loại nấm tươi sạch...'
    },
    {
      id: 'post_5',
      title: 'Đậu hũ non sốt Tứ Xuyên nấm đông cô cay nồng',
      type: 'video_native',
      typeLabel: 'Video tự quay',
      timeLabel: 'Đăng 2 tuần trước',
      duration: '10:15',
      category: 'Món xào cay',
      nutritionAI: '380 kcal • 24g Đạm',
      status: 'published',
      statusLabel: 'Đã xuất bản',
      views: '8.7k',
      saves: '640',
      thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      contentPreview: 'Phiên bản chay của món Ma Po Tofu cay nồng kích thích vị giác với đậu hũ non mềm mịn và sốt tiêu hoa hồi...'
    },
    {
      id: 'post_6',
      title: 'Smoothie Bowl Yến Mạch Hạt Chia giải nhiệt mùa hè',
      type: 'draft',
      typeLabel: 'Bản nháp',
      timeLabel: 'Tự động lưu 3 giờ trước',
      category: 'Chưa hoàn thiện macro',
      nutritionAI: '',
      status: 'draft',
      statusLabel: 'Bản nháp',
      views: '—',
      saves: '',
      thumbnail: null,
      contentPreview: 'Bữa sáng nhanh gọn giàu chất xơ và Omega-3 từ hạt chia, sữa yến mạch và các loại dâu tây tươi...'
    }
  ]);

  // XỬ LÝ XÓA BẢN NHÁP
  const handleDeleteItem = (id, title) => {
    setItems(prev => prev.filter(item => item.id !== id));
    showToast(`🗑️ Đã xóa nội dung "${title}" khỏi danh sách!`);
  };

  // LỌC THEO TABS VÀ TÌM KIẾM
  const filteredItems = items.filter(item => {
    // Tab filter
    if (activeTab === 'posts' && item.type !== 'blog_recipe') return false;
    if (activeTab === 'videos' && !['video_native', 'video_link'].includes(item.type)) return false;
    if (activeTab === 'drafts' && item.status !== 'draft') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchCat) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;

    return true;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem', color: '#0f172a' }}>
      
      {/* TOAST THÔNG BÁO */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#047857',
          color: '#ffffff',
          padding: '0.9rem 1.4rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'slideUp 0.25s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CONTAINER CHÍNH */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.75rem 1.25rem 0 1.25rem' }}>
        
        {/* 1. BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
          <span 
            onClick={() => onNavigate && onNavigate('home')} 
            style={{ cursor: 'pointer', color: '#059669', fontWeight: 600 }}
          >
            Trang chủ
          </span>
          <span>›</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Quản lý bài đăng của tôi</span>
        </div>

        {/* 2. HERO HEADER TIÊU ĐỀ & 2 NÚT HÀNH ĐỘNG */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
              Quản lý bài viết & Video của tôi
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0, maxWidth: '680px', lineHeight: 1.55 }}>
              Theo dõi trạng thái kiểm duyệt, số liệu tương tác và quản lý toàn bộ công thức, bài viết và video ẩm thực chay bạn đã đóng góp.
            </p>
          </div>

          {/* 2 NÚT ACTION CHÍNH */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate ? onNavigate('create-post') : null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#ffffff',
                color: '#047857',
                border: '1.5px solid #a7f3d0',
                borderRadius: '12px',
                padding: '0.7rem 1.25rem',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <Edit3 size={16} />
              <span>+ Viết blog & Công thức mới</span>
            </button>

            <button
              onClick={() => onNavigate ? onNavigate('create-video') : null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#046a47',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.7rem 1.25rem',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(4, 106, 71, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#035438'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#046a47'}
            >
              <Video size={16} />
              <span>+ Chia sẻ video nấu ăn</span>
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. BỐN THẺ METRIC THỐNG KÊ (ĐÃ SỬA THEO YÊU CẦU: BỎ ĐIỂM ĐÓNG GÓP, THAY BẰNG ĐÃ XUẤT BẢN) */}
        {/* ===================================================================== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          {/* CARD 1: TỔNG NỘI DUNG */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.4rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Tổng nội dung</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={16} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem', lineHeight: 1 }}>
              18
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>12 bài viết & công thức</span>
              <span>•</span>
              <span>6 video hướng dẫn</span>
            </div>
          </div>

          {/* CARD 2: ĐANG CHỜ DUYỆT */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.4rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Đang chờ duyệt</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#ffedd5', color: '#c2410c', padding: '1px 6px', borderRadius: '4px' }}>
                  Cần xử lý
                </span>
              </div>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ea580c', marginBottom: '0.45rem', lineHeight: 1 }}>
              2
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              1 video chờ Mod kiểm tra nguồn • 1 công thức
            </div>
          </div>

          {/* CARD 3: TƯƠNG TÁC ẨM THỰC */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.4rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Tương tác ẩm thực</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={16} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem', lineHeight: 1 }}>
              24.8k
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Lượt xem</span>
              <span>•</span>
              <strong style={{ color: '#059669' }}>1.4k</strong>
              <span>lượt lưu tuần</span>
            </div>
          </div>

          {/* CARD 4 (THAY THẾ ĐIỂM ĐÓNG GÓP/ĐẦU BẾP TÍCH CỰC): SỐ BÀI ĐÃ XUẤT BẢN KHÁCH QUAN */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '1.4rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Nội dung đã xuất bản</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#047857', marginBottom: '0.45rem', lineHeight: 1 }}>
              16
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>11 bài viết</span>
              <span>•</span>
              <span>5 video công khai</span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4. THANH FILTER TABS & SEARCH / DROPDOWNS */}
        {/* ===================================================================== */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          {/* HÀNG TABS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '1rem',
            marginBottom: '1.15rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '20px',
                border: 'none',
                background: activeTab === 'all' ? '#046a47' : '#f8fafc',
                color: activeTab === 'all' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Tất cả (18)
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '20px',
                border: 'none',
                background: activeTab === 'posts' ? '#046a47' : '#f8fafc',
                color: activeTab === 'posts' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Bài viết & Công thức (12)
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '20px',
                border: 'none',
                background: activeTab === 'videos' ? '#046a47' : '#f8fafc',
                color: activeTab === 'videos' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Video nấu ăn (6)
            </button>

            <button
              onClick={() => setActiveTab('drafts')}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '20px',
                border: 'none',
                background: activeTab === 'drafts' ? '#046a47' : '#f8fafc',
                color: activeTab === 'drafts' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Bản nháp (3)
            </button>
          </div>

          {/* HÀNG SEARCH & SELECTS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề bài viết, video, công thức..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.35rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.62rem 0.95rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tất cả trạng thái ▾</option>
                <option value="published">Đã xuất bản</option>
                <option value="pending">Đang chờ duyệt</option>
                <option value="draft">Bản nháp</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '0.62rem 0.95rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tất cả danh mục ▾</option>
                <option value="party">Món tiệc</option>
                <option value="curry">Món kho/Cà ri</option>
                <option value="broth">Nước dùng chay</option>
                <option value="soup">Món canh chay</option>
                <option value="stir">Món xào cay</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.62rem 0.95rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Mới nhất ▾</option>
                <option value="views">Xem nhiều nhất</option>
                <option value="saves">Lưu nhiều nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 5. BẢNG DANH SÁCH BÀI VIẾT & VIDEO (TABLE NHƯ ẢNH GỐC) */}
        {/* ===================================================================== */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: 800, width: '45%' }}>Nội dung & Phân loại</th>
                  <th style={{ padding: '0.9rem 1rem', fontWeight: 800, width: '20%' }}>Danh mục & Dinh dưỡng AI</th>
                  <th style={{ padding: '0.9rem 1rem', fontWeight: 800, width: '15%' }}>Trạng thái</th>
                  <th style={{ padding: '0.9rem 1rem', fontWeight: 800, width: '10%' }}>Tương tác</th>
                  <th style={{ padding: '0.9rem 1.25rem', fontWeight: 800, width: '10%', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* CỘT 1: NỘI DUNG & PHÂN LOẠI */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                        {/* THUMBNAIL HOẶC ICON DRAFT */}
                        {item.thumbnail ? (
                          <div style={{ position: 'relative', width: '90px', height: '60px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {item.duration && (
                              <span style={{
                                position: 'absolute',
                                bottom: '3px',
                                right: '4px',
                                background: 'rgba(0,0,0,0.8)',
                                color: '#ffffff',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '1px 4px',
                                borderRadius: '4px'
                              }}>
                                {item.duration}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{
                            width: '90px',
                            height: '60px',
                            borderRadius: '10px',
                            background: '#f1f5f9',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <FileText size={24} />
                          </div>
                        )}

                        <div>
                          {/* BADGE LOẠI NỘI DUNG & THỜI GIAN */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: item.type === 'video_native' ? '#ecfdf5' : item.type === 'video_link' ? '#fef2f2' : item.type === 'draft' ? '#f1f5f9' : '#eff6ff',
                              color: item.type === 'video_native' ? '#047857' : item.type === 'video_link' ? '#b91c1c' : item.type === 'draft' ? '#64748b' : '#1d4ed8'
                            }}>
                              {item.type.includes('video') ? <Video size={10} /> : item.type === 'draft' ? <FileText size={10} /> : <Edit3 size={10} />}
                              <span>{item.typeLabel}</span>
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {item.timeLabel}
                            </span>
                          </div>

                          {/* TIÊU ĐỀ */}
                          <strong 
                            onClick={() => setPreviewItem(item)}
                            style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', lineHeight: 1.4, cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#047857'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#0f172a'}
                          >
                            {item.title}
                          </strong>
                        </div>
                      </div>
                    </td>

                    {/* CỘT 2: DANH MỤC & DINH DƯỠNG AI */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                        {item.category}
                      </div>
                      {item.nutritionAI && (
                        <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                          <span>🌱</span>
                          <span>{item.nutritionAI}</span>
                        </div>
                      )}
                    </td>

                    {/* CỘT 3: TRẠNG THÁI */}
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: item.status === 'published' ? '#ecfdf5' : item.status === 'pending' ? '#ffedd5' : '#f1f5f9',
                        color: item.status === 'published' ? '#047857' : item.status === 'pending' ? '#c2410c' : '#64748b'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: item.status === 'published' ? '#047857' : item.status === 'pending' ? '#ea580c' : '#94a3b8'
                        }} />
                        <span>{item.statusLabel}</span>
                      </span>
                    </td>

                    {/* CỘT 4: TƯƠNG TÁC */}
                    <td style={{ padding: '1rem' }}>
                      {item.views !== '—' ? (
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a' }}>{item.views} xem</strong>
                          <small style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.saves} lưu</small>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>

                    {/* CỘT 5: THAO TÁC */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {item.status === 'draft' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                          <button
                            onClick={() => onNavigate && onNavigate('create-post')}
                            style={{
                              background: '#046a47',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Tiếp tục viết
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.title)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.85rem' }}>
                          <span 
                            onClick={() => showToast(`🛠️ Mở chế độ chỉnh sửa cho bài viết "${item.title}"`)}
                            style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Sửa
                          </span>

                          <span 
                            onClick={() => setPreviewItem(item)}
                            style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Xem trước
                          </span>

                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* DROPDOWN MENU 3 CHẤM */}
                            {activeMenuId === item.id && (
                              <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                background: '#ffffff',
                                borderRadius: '10px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                                border: '1px solid #e2e8f0',
                                zIndex: 100,
                                width: '140px',
                                overflow: 'hidden'
                              }}>
                                <button
                                  onClick={() => {
                                    showToast('🔗 Đã sao chép liên kết chia sẻ!');
                                    setActiveMenuId(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.55rem 0.85rem',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    color: '#334155',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                  }}
                                >
                                  <Share2 size={13} /> Chia sẻ
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteItem(item.id, item.title);
                                    setActiveMenuId(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.55rem 0.85rem',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem'
                                  }}
                                >
                                  <Trash2 size={13} /> Xóa bài
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PHÂN TRANG FOOTER */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            background: '#fafafa',
            borderTop: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.82rem',
            color: '#64748b'
          }}>
            <div>
              Hiển thị <strong>1 - 6</strong> trong tổng số <strong>18</strong> nội dung đã tạo
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                disabled
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#94a3b8',
                  fontSize: '0.78rem',
                  cursor: 'not-allowed'
                }}
              >
                ‹ Trang trước
              </button>

              <button
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#046a47',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                1
              </button>

              <button
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                2
              </button>

              <button
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                3
              </button>

              <button
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Trang sau ›
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* MODAL PREVIEW XEM TRƯỚC BÀI VIẾT / VIDEO */}
      {/* ===================================================================== */}
      {previewItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px' }}>
                {previewItem.typeLabel}
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {previewItem.thumbnail && (
              <img
                src={previewItem.thumbnail}
                alt={previewItem.title}
                style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }}
              />
            )}

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              {previewItem.title}
            </h3>

            <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
              <span>Danh mục: <strong>{previewItem.category}</strong></span>
              {previewItem.nutritionAI && (
                <>
                  <span>•</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>{previewItem.nutritionAI}</span>
                </>
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              {previewItem.contentPreview}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <Button variant="secondary" onClick={() => setPreviewItem(null)}>
                Đóng
              </Button>
              <Button onClick={() => {
                showToast(`🚀 Chuyển đến trang chi tiết bài viết!`);
                setPreviewItem(null);
              }}>
                Xem toàn bộ nội dung
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
