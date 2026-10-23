import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bookmark, BookmarkCheck, Heart, Search, Plus, Filter, 
  Clock, Flame, Leaf, Calendar, ArrowRight, Play, Sparkles, 
  BookOpen, User, Check, X, ChevronDown, Utensils, Video, 
  FolderPlus, Share2, ExternalLink, HelpCircle, CheckCircle2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import RecipeDetailModal from '../../components/recipes/RecipeDetailModal';
import { recipeService } from '../../api';

export default function MyCollectionPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Lấy công thức yêu thích thực tế từ Backend nếu có
    recipeService.getFavorites(1, 20)
      .then(res => {
        const items = res?.items || (Array.isArray(res) ? res : null);
        if (items && items.length > 0) {
          const mapped = items.map(r => ({
            id: r.id,
            title: r.title,
            time: `${r.prepTime || 25} phút`,
            isFavorite: true,
            tags: ['#GiauProtein', '#Thuanchay'],
            protein: `${r.proteinG || 20}g Protein`,
            calories: `${r.kcalPerServing || 450} kcal`,
            image: r.imageUrl ? (r.imageUrl.startsWith('http') ? r.imageUrl : `/uploads/${r.imageUrl}`) : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
            instructions: r.instructions || ''
          }));
          setRecipes(prev => [...mapped, ...prev]);
        }
      })
      .catch(() => {});
  }, []);

  // TABS: 'all' | 'recipes' | 'videos' | 'articles'
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [mealFilter, setMealFilter] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');

  // MODALS & TOAST
  const [toastMessage, setToastMessage] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#059669');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [activeModalItem, setActiveModalItem] = useState(null); // 'recipe_detail' | 'ai_summary' | 'video_player'
  const [selectedItemData, setSelectedItemData] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  // Lock body scroll and listen to Escape key when modal is open
  useEffect(() => {
    if (showCreateFolderModal || activeModalItem) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setShowCreateFolderModal(false);
          setActiveModalItem(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = orig;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showCreateFolderModal, activeModalItem]);

  // DỮ LIỆU MÓN ĂN YÊU THÍCH (16 món - hiển thị top 4 nổi bật)
  const [recipes, setRecipes] = useState([
    {
      id: 'rec_1',
      title: 'Poke Quinoa Tempeh Sốt Mè Rang',
      time: '35 phút',
      isFavorite: true,
      tags: ['#GiauProtein', '#Thuanchay'],
      protein: '26g Protein',
      calories: '520 kcal',
      meal: 'lunch',
      diet: 'vegan',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      ingredients: ['Tempeh nướng tiêu (150g)', 'Hạt quinoa nấu chín (1 chén)', 'Bơ sáp Đà Lạt (1/2 quả)', 'Bắp ngọt & Đậu Hà Lan'],
      steps: [
        'Ướp tempeh với nước tương tamari, tiêu đen và dầu mè trong 15 phút.',
        'Nấu hạt quinoa chín mềm và xới đều cho tơi xốp.',
        'Nướng tempeh áp chảo hoặc nồi chiên không dầu 180°C trong 10 phút.',
        'Xếp hạt quinoa, tempeh nướng, bơ thái lát và rưới sốt mè rang béo ngậy.'
      ]
    },
    {
      id: 'rec_2',
      title: 'Canh Nấm Thược Dược Hạt Sen Tươi',
      time: '35 phút',
      isFavorite: true,
      tags: ['#ThanhNhiet', '#Ngo&Set'],
      protein: '18g Protein',
      calories: '340 kcal',
      meal: 'dinner',
      diet: 'clean',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
      ingredients: ['Nấm đông cô & nấm bào ngư (200g)', 'Hạt sen tươi Huế (100g)', 'Cà rốt & Bắp ngọt', 'Táo đỏ & Kỷ tử'],
      steps: [
        'Hầm hạt sen tươi và bắp ngọt với 1.2 lít nước dùng rau củ trong 20 phút.',
        'Cho nấm đông cô, nấm bào ngư tươi và cà rốt vào đun sôi thêm 8 phút.',
        'Nêm muối hồng Himalaya và hạt nêm ngưu bàng thanh ngọt.',
        'Rắc ngò rí tươi và tiêu đen xay trước khi thưởng thức ấm nóng.'
      ]
    },
    {
      id: 'rec_3',
      title: 'Cà Ri Bí Đỏ Hạt Sen Nước Cốt Dừa',
      time: '30 phút',
      isFavorite: true,
      tags: ['#ComNha', '#DeNau'],
      protein: '22g Protein',
      calories: '460 kcal',
      meal: 'lunch',
      diet: 'vegan',
      image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80',
      ingredients: ['Bí đỏ dẻo (200g)', 'Hạt sen tươi (80g)', 'Đậu hũ chiên vàng (1 bìa)', 'Nước cốt dừa nguyên chất (150ml)', 'Bột cà ri Ấn Độ'],
      steps: [
        'Xào thơm sả băm, hành boa-rô và 1 thìa bột cà ri với chút dầu dừa.',
        'Cho bí đỏ cắt quân cờ và hạt sen vào đảo đều trong 3 phút cho ngấm gia vị.',
        'Thêm nước dùng và đun nhỏ lửa 15 phút đến khi bí chín mềm bùi.',
        'Đổ nước cốt dừa và đậu hũ vào khuấy nhẹ tay, nấu thêm 2 phút là hoàn tất.'
      ]
    },
    {
      id: 'rec_4',
      title: 'Đậu Hũ Non Sốt Tứ Xuyên Chay Cay Nồng',
      time: '20 phút',
      isFavorite: true,
      tags: ['#CayDamDa', '#TruongTang'],
      protein: '24g Protein',
      calories: '380 kcal',
      meal: 'dinner',
      diet: 'vegan',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      ingredients: ['Đậu hũ non mềm (1 hộp 300g)', 'Nấm hương khô băm nhuyễn (50g)', 'Sốt cay Tứ Xuyên không tỏi (2 thìa)', 'Hạt tiêu Tứ Xuyên và hoa hồi'],
      steps: [
        'Trần sơ đậu hũ non cắt khối vuông trong nước muối loãng ấm để đậu không bị vỡ.',
        'Phi thơm boa-rô, xào chín nấm hương băm nhuyễn cùng sốt ớt cay Tứ Xuyên.',
        'Hòa bột năng với chút nước cho vào tạo độ sánh mịn bóng bẩy.',
        'Cho đậu hũ non vào đảo lắc chảo nhẹ nhàng trong 3 phút để thấm đẫm sốt.'
      ]
    }
  ]);

  // DỮ LIỆU VIDEO NẤU ĂN ĐÃ LƯU (20 video - hiển thị 3 nổi bật)
  const [videos, setVideos] = useState([
    {
      id: 'vid_1',
      title: 'Bí quyết nấu Nước Dùng Chay ngọt thanh đậm đà từ củ quả tự nhiên',
      channel: 'Bếp Chay An Lạc',
      channelAvatar: 'A',
      channelColor: '#059669',
      duration: '12:45',
      summaryBadge: 'Tóm tắt 4 bước nấu',
      isFavorite: true,
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80',
      aiSummary: [
        'Bước 1: Nướng sơ mía lau, bắp Mỹ và hành boa-rô để tạo caramel tự nhiên.',
        'Bước 2: Hầm củ cải trắng, su hào, cà rốt và lê ngọt lửa liu riu 45 phút.',
        'Bước 3: Lọc lấy nước cốt trong vắt, thêm rễ ngò gai và chút muối biển hạt to.',
        'Bước 4: Bảo quản ngăn mát dùng dần 5 ngày hoặc trữ đông làm cốt lẩu nấm.'
      ]
    },
    {
      id: 'vid_2',
      title: 'Ram nấm nướng giòn rụm không dầu mỡ cho tiệc cuối tuần',
      channel: 'Thanh Nhã Kitchen',
      channelAvatar: 'T',
      channelColor: '#ea580c',
      duration: '08:30',
      summaryBadge: 'Tóm tắt 3 bước • 165 kcal/cuốn',
      isFavorite: true,
      thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
      aiSummary: [
        'Bước 1: Trộn nhân gồm mộc nhĩ, nấm đùi gà xé sợi, khoai môn bào và miến dong.',
        'Bước 2: Cuốn chặt tay bằng bánh tráng mè đen hoặc bánh tráng đậu xanh mỏng.',
        'Bước 3: Quét một lớp dầu mè mỏng, nướng nồi chiên không dầu 180°C trong 15 phút vàng ruộm.'
      ]
    },
    {
      id: 'vid_3',
      title: 'Cà ri xanh đậu hũ rau củ chuẩn vị Thái không dùng mắm',
      channel: 'Chơi Sạch Liền',
      channelAvatar: 'L',
      channelColor: '#0284c7',
      duration: '15:20',
      summaryBadge: 'Tóm tắt 5 bước',
      isFavorite: true,
      thumbnail: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=700&q=80',
      aiSummary: [
        'Bước 1: Giã nhuyễn bột cà ri xanh từ ớt xanh, sả, riềng và lá chanh Kaffir.',
        'Bước 2: Xào bột cà ri cùng nước cốt dừa đầu cho tách lớp dầu thơm ngát.',
        'Bước 3: Cho cà pháo giòn, măng tươi và đậu hũ non chiên giòn vào nấu ngập sốt.',
        'Bước 4: Nêm đường thốt nốt và nước tương đậu nành thanh đạm thay mắm cá.',
        'Bước 5: Thả lá quế Thái tươi vào trước khi tắt bếp để dậy mùi thơm nồng nàn.'
      ]
    }
  ]);

  // DỮ LIỆU BÀI VIẾT & CẨM NANG DINH DƯỠNG (12 bài - hiển thị 3 nổi bật)
  const [articles, setArticles] = useState([
    {
      id: 'art_1',
      title: 'Cẩm nang kết hợp Protein thực vật: Làm sao để đủ 9 axit amin thiết yếu mỗi ngày',
      readTime: 'Đọc 6 phút',
      tags: ['#DinhDuongHoanHao', '#ProteinThucVat'],
      snippet: 'Hướng dẫn khoa học cách kết hợp ngũ cốc nguyên cám và các loại đậu để đạt chỉ số protein hoàn chỉnh không thua kém nguồn đạm động vật...',
      author: 'Chuyên gia Minh Hà',
      savesCount: '1.2k lưu',
      isFavorite: true,
      image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'art_2',
      title: '7 Sai lầm phổ biến khi mới bắt đầu ăn chay khiến cơ thể dễ thiếu máu và mệt mỏi',
      readTime: 'Đọc 8 phút',
      tags: ['#KienThucSucKhoe', '#ThieuHuyet'],
      snippet: 'Phân tích cơ chế hấp thu Sắt không Heme và các chất ức chế như Phytate hoặc Tanin trong trà/cà phê cần phải tránh sau bữa ăn chính...',
      author: 'Ds. Thùy Trang',
      savesCount: '2.5k lưu',
      isFavorite: true,
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'art_3',
      title: 'Cách lên thực đơn tuần thuần chay cho người tập gym giữ cơ tăng cơ hiệu quả',
      readTime: 'Đọc 5 phút',
      tags: ['#Fitness', '#MealPrep'],
      snippet: 'Lộ trình chuẩn bị đồ ăn (Meal Prep) 3 ngày/lần giúp người tập thể thao nạp trên 100g protein thực vật sạch và không gây đầy bụng...',
      author: 'VeggieAI Science',
      savesCount: '980 lưu',
      isFavorite: true,
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80'
    }
  ]);

  // TOGGLE FAVORITE
  const toggleRecipeFavorite = (id, e) => {
    e.stopPropagation();
    setRecipes(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.isFavorite;
        showToast(nextState ? `❤️ Đã thêm "${item.title}" vào danh sách yêu thích` : `Đã bỏ lưu "${item.title}"`);
        return { ...item, isFavorite: nextState };
      }
      return item;
    }));
  };

  const toggleVideoFavorite = (id, e) => {
    e.stopPropagation();
    setVideos(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.isFavorite;
        showToast(nextState ? `❤️ Đã lưu video "${item.title}"` : `Đã bỏ lưu video "${item.title}"`);
        return { ...item, isFavorite: nextState };
      }
      return item;
    }));
  };

  const toggleArticleFavorite = (id, e) => {
    e.stopPropagation();
    setArticles(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.isFavorite;
        showToast(nextState ? `❤️ Đã lưu bài viết "${item.title}"` : `Đã bỏ lưu bài viết "${item.title}"`);
        return { ...item, isFavorite: nextState };
      }
      return item;
    }));
  };

  // THÊM VÀO THỰC ĐƠN TUẦN
  const handleAddToMealPlan = (recipeTitle, e) => {
    e.stopPropagation();
    showToast(`📅 Đã thêm món "${recipeTitle}" vào gợi ý Thực đơn tuần của bạn!`);
  };

  // MỞ MODAL TẠO BỘ SƯU TẬP
  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      showToast('⚠️ Vui lòng nhập tên bộ sưu tập mới!');
      return;
    }
    showToast(`🎉 Đã tạo bộ sưu tập cá nhân "${newFolderName.trim()}" thành công!`);
    setShowCreateFolderModal(false);
    setNewFolderName('');
    setNewFolderDesc('');
  };

  // LỌC THEO SEARCH QUERY
  const filterBySearch = (item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || 
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q))) ||
      (item.channel && item.channel.toLowerCase().includes(q)) ||
      (item.author && item.author.toLowerCase().includes(q));
  };

  const filteredRecipes = recipes.filter(filterBySearch);
  const filteredVideos = videos.filter(filterBySearch);
  const filteredArticles = articles.filter(filterBySearch);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem', color: '#0f172a' }}>
      
      {/* TOAST NOTIFICATION */}
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
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Bộ sưu tập của tôi</span>
        </div>

        {/* 2. HERO HEADER KHU VỰC LƯU TRỮ CÁ NHÂN HÓA */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '1.85rem 2.2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -4px rgba(0,0,0,0.03)',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            
            {/* CỘT TRÁI: TIÊU ĐỀ & THỐNG KÊ */}
            <div style={{ maxWidth: '680px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ecfdf5',
                color: '#047857',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                marginBottom: '0.75rem'
              }}>
                <BookmarkCheck size={14} />
                <span>Kho lưu trữ cá nhân hoá</span>
              </div>

              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.55rem 0', letterSpacing: '-0.02em' }}>
                Nội dung & Món ăn yêu thích
              </h1>

              <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 1.25rem 0', lineHeight: 1.55 }}>
                Kho lưu trữ công thức nấu ăn, video hướng dẫn và thực đơn món chay bạn đã đánh dấu để trải nghiệm và nấu lại.
              </p>

              {/* PILLS THỐNG KÊ 4 MỤC NHƯ ẢNH GỐC */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }}></span>
                  <span>48 Mục đã lưu</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid #d1fae5',
                  background: '#f0fdf4',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#047857'
                }}>
                  <span>🥗</span>
                  <span>16 Món ăn tâm đắc</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid #fee2e2',
                  background: '#fef2f2',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#b91c1c'
                }}>
                  <span>🎬</span>
                  <span>20 Video hướng dẫn</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid #e0e7ff',
                  background: '#eef2ff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#4338ca'
                }}>
                  <span>📖</span>
                  <span>12 Bài viết & Mẹo hay</span>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: TÌM KIẾM & NÚT TẠO BỘ SƯU TẬP MỚI */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm nội dung đã lưu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.35rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
              </div>

              <button
                onClick={() => setShowCreateFolderModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#046a47',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.68rem 1.25rem',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(4, 106, 71, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#035438'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#046a47'}
              >
                <Plus size={16} />
                <span>Tạo bộ sưu tập mới</span>
              </button>
            </div>

          </div>
        </div>

        {/* 3. THANH LỌC TABS VÀ DROPDOWNS */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* TABS TRÁI */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#ffffff',
            padding: '4px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => setActiveFilterTab('all')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                border: 'none',
                background: activeFilterTab === 'all' ? '#046a47' : 'transparent',
                color: activeFilterTab === 'all' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Tất cả (48)
            </button>

            <button
              onClick={() => setActiveFilterTab('recipes')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                border: 'none',
                background: activeFilterTab === 'recipes' ? '#046a47' : 'transparent',
                color: activeFilterTab === 'recipes' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>🥗</span>
              <span>Món ăn yêu thích (16)</span>
            </button>

            <button
              onClick={() => setActiveFilterTab('videos')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                border: 'none',
                background: activeFilterTab === 'videos' ? '#046a47' : 'transparent',
                color: activeFilterTab === 'videos' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>🎬</span>
              <span>Video nấu ăn (20)</span>
            </button>

            <button
              onClick={() => setActiveFilterTab('articles')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                border: 'none',
                background: activeFilterTab === 'articles' ? '#046a47' : 'transparent',
                color: activeFilterTab === 'articles' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>📖</span>
              <span>Bài viết & Mẹo sống khỏe (12)</span>
            </button>
          </div>

          {/* DROPDOWNS PHẢI */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.55rem 0.95rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Mới lưu gần nhất ▾</option>
              <option value="popular">Được lưu nhiều nhất</option>
              <option value="alphabetical">Tên A-Z</option>
            </select>

            <select
              value={mealFilter}
              onChange={(e) => setMealFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.95rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <option value="all">Tất cả bữa ăn ▾</option>
              <option value="breakfast">Bữa sáng</option>
              <option value="lunch">Bữa trưa</option>
              <option value="dinner">Bữa tối</option>
              <option value="snack">Bữa xế / Ăn vặt</option>
            </select>

            <select
              value={dietFilter}
              onChange={(e) => setDietFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.95rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <option value="all">Chế độ ăn: Tất cả ▾</option>
              <option value="vegan">Thuần chay (Vegan)</option>
              <option value="clean">Eat Clean thanh đạm</option>
              <option value="gym">Tập gym giàu đạm</option>
            </select>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* KHỐI 1: MÓN ĂN & CÔNG THỨC YÊU THÍCH (4 CARDS GRID) */}
        {/* ===================================================================== */}
        {(activeFilterTab === 'all' || activeFilterTab === 'recipes') && (
          <div style={{ marginBottom: '3rem' }}>
            
            {/* HEADER MỤC 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#ecfdf5',
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Utensils size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Món ăn & Công thức yêu thích
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Các món chay dinh dưỡng đã lưu để nấu trong tuần
                  </p>
                </div>
              </div>

              <span 
                onClick={() => setActiveFilterTab('recipes')}
                style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                Xem tất cả (16) →
              </span>
            </div>

            {/* 4 CARDS GRID MÓN ĂN */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))',
              gap: '1.25rem'
            }}>
              {filteredRecipes.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)';
                  }}
                >
                  {/* HÌNH ẢNH MÓN ĂN */}
                  <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden' }}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    
                    {/* BADGE THỜI GIAN NẤU */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <Clock size={12} />
                      <span>{item.time}</span>
                    </div>

                    {/* NÚT TRÁI TIM YÊU THÍCH */}
                    <button
                      onClick={(e) => toggleRecipeFavorite(item.id, e)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.92)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: item.isFavorite ? '#ef4444' : '#94a3b8',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        transition: 'transform 0.15s ease'
                      }}
                      title={item.isFavorite ? 'Bỏ lưu yêu thích' : 'Lưu món ăn'}
                    >
                      <Heart size={16} fill={item.isFavorite ? '#ef4444' : 'none'} />
                    </button>
                  </div>

                  {/* THÔNG TIN NỘI DUNG MÓN ĂN */}
                  <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* TAGS */}
                    <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      {item.tags.map((tag, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '1px 6px', borderRadius: '6px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* TIÊU ĐỀ */}
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.65rem 0', lineHeight: 1.4 }}>
                      {item.title}
                    </h4>

                    {/* DINH DƯỠNG PROTEIN & CALO */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#059669' }}>
                        <Leaf size={12} /> {item.protein}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#e11d48' }}>
                        <Flame size={12} /> {item.calories}
                      </span>
                    </div>

                    {/* NÚT THÊM VÀO THỰC ĐƠN TUẦN */}
                    <button
                      onClick={(e) => handleAddToMealPlan(item.title, e)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '10px',
                        border: '1px solid #d1fae5',
                        background: '#f0fdf4',
                        color: '#047857',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        marginBottom: '0.65rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdf4'}
                    >
                      <Calendar size={13} />
                      <span>Thêm vào thực đơn tuần</span>
                    </button>

                    {/* LINK XEM CÔNG THỨC */}
                    <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                      <span 
                        onClick={() => {
                          setSelectedItemData(item);
                          setActiveModalItem('recipe_detail');
                        }}
                        style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#047857'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                      >
                        Xem công thức →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* KHỐI 2: VIDEO NẤU ĂN ĐÃ LƯU (3 CARDS RỘNG) */}
        {/* ===================================================================== */}
        {(activeFilterTab === 'all' || activeFilterTab === 'videos') && (
          <div style={{ marginBottom: '3rem' }}>
            
            {/* HEADER MỤC 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Video size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Video nấu ăn đã lưu
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Xem hướng dẫn chi tiết từng bước từ các đầu bếp thực dưỡng
                  </p>
                </div>
              </div>

              <span 
                onClick={() => setActiveFilterTab('videos')}
                style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                Xem tất cả (20) →
              </span>
            </div>

            {/* 3 CARDS GRID VIDEO */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.4rem'
            }}>
              {filteredVideos.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)';
                  }}
                >
                  {/* THUMBNAIL VIDEO KÈM PLAY BUTTON */}
                  <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden' }}>
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    
                    {/* OVERLAY TỐI & NÚT PLAY TRÒN Ở TÂM */}
                    <div 
                      onClick={() => {
                        setSelectedItemData(item);
                        setActiveModalItem('video_player');
                      }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.92)',
                        color: '#047857',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        paddingLeft: '3px'
                      }}>
                        <Play size={20} fill="#047857" />
                      </div>
                    </div>

                    {/* BADGE THỜI LƯỢNG GÓC PHẢI DƯỚI */}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '6px'
                    }}>
                      {item.duration}
                    </div>

                    {/* NÚT TIM YÊU THÍCH GÓC PHẢI TRÊN */}
                    <button
                      onClick={(e) => toggleVideoFavorite(item.id, e)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.92)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: item.isFavorite ? '#ef4444' : '#94a3b8',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                      }}
                    >
                      <Heart size={16} fill={item.isFavorite ? '#ef4444' : 'none'} />
                    </button>
                  </div>

                  {/* THÔNG TIN VIDEO */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* TÊN KÊNH VÀ AVATAR */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.55rem' }}>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: item.channelColor,
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.channelAvatar}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                        {item.channel}
                      </span>
                      <span style={{ color: '#0284c7', fontSize: '0.8rem' }}>✓</span>
                    </div>

                    {/* TIÊU ĐỀ VIDEO */}
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0', lineHeight: 1.45, minHeight: '44px' }}>
                      {item.title}
                    </h4>

                    {/* BADGE TÓM TẮT BƯỚC NẤU */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#ecfdf5',
                      color: '#047857',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      alignSelf: 'flex-start'
                    }}>
                      <Sparkles size={12} />
                      <span>{item.summaryBadge}</span>
                    </div>

                    {/* 2 NÚT HÀNH ĐỘNG: MỞ VIDEO & TÓM TẮT AI */}
                    <div style={{ display: 'flex', gap: '0.65rem', marginTop: 'auto' }}>
                      <button
                        onClick={() => {
                          setSelectedItemData(item);
                          setActiveModalItem('video_player');
                        }}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#046a47',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Play size={13} fill="#ffffff" />
                        <span>Mở video</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedItemData(item);
                          setActiveModalItem('ai_summary');
                        }}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Sparkles size={13} color="#059669" />
                        <span>Tóm tắt AI</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* KHỐI 3: BÀI VIẾT & CẨM NANG DINH DƯỠNG (3 CARDS RỘNG) */}
        {/* ===================================================================== */}
        {(activeFilterTab === 'all' || activeFilterTab === 'articles') && (
          <div style={{ marginBottom: '3rem' }}>
            
            {/* HEADER MỤC 3 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Bài viết & Cẩm nang dinh dưỡng
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Kiến thức chuyên sâu từ các chuyên gia dinh dưỡng thực vật
                  </p>
                </div>
              </div>

              <span 
                onClick={() => setActiveFilterTab('articles')}
                style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                Xem tất cả (12) →
              </span>
            </div>

            {/* 3 CARDS GRID BÀI VIẾT */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.4rem'
            }}>
              {filteredArticles.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)';
                  }}
                >
                  {/* HÌNH ẢNH BÀI VIẾT */}
                  <div style={{ position: 'relative', height: '175px', width: '100%', overflow: 'hidden' }}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />

                    {/* BADGE THỜI GIAN ĐỌC */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <BookOpen size={12} />
                      <span>{item.readTime}</span>
                    </div>

                    {/* NÚT TRÁI TIM YÊU THÍCH */}
                    <button
                      onClick={(e) => toggleArticleFavorite(item.id, e)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.92)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: item.isFavorite ? '#ef4444' : '#94a3b8',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                      }}
                    >
                      <Heart size={16} fill={item.isFavorite ? '#ef4444' : 'none'} />
                    </button>
                  </div>

                  {/* THÔNG TIN BÀI VIẾT */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* TAGS */}
                    <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      {item.tags.map((tag, idx) => (
                        <span key={idx} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '1px 6px', borderRadius: '6px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* TIÊU ĐỀ */}
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.65rem 0', lineHeight: 1.45 }}>
                      {item.title}
                    </h4>

                    {/* ĐOẠN TRÍCH NGẮN */}
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.15rem 0', lineHeight: 1.5, flex: 1 }}>
                      {item.snippet}
                    </p>

                    {/* FOOTER TÁC GIẢ VÀ SỐ LƯỢT LƯU */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontSize: '0.76rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: '#334155' }}>
                        <User size={13} color="#059669" />
                        <span>{item.author}</span>
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#94a3b8' }}>
                        <Bookmark size={12} />
                        <span>{item.savesCount}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* KHỐI 4: GỢI Ý THÔNG MINH TỪ AI (BANNER PHÂN BỔ THỰC ĐƠN TUẦN) */}
        {/* ===================================================================== */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #a7f3d0',
          borderRadius: '20px',
          padding: '1.5rem 1.85rem',
          boxShadow: '0 4px 20px rgba(4, 120, 87, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            
            {/* TRÁI: NỘI DUNG AI RECOMMENDATION */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', maxWidth: '680px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#046a47',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Sparkles size={22} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', letterSpacing: '0.04em' }}>
                    GỢI Ý THÔNG MINH TỪ AI
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px' }}>
                    Dinh dưỡng cá nhân hoá
                  </span>
                </div>

                <strong style={{ display: 'block', fontSize: '1rem', color: '#0f172a', marginBottom: '0.35rem' }}>
                  Bạn đã lưu nhiều món ăn giàu Đạm & Sắt trong tuần qua!
                </strong>

                <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                  Bạn có muốn AI phân bổ và lên sẵn một thực đơn 7 ngày khoa học, cân đối dinh dưỡng dựa trên 4 món ăn yêu thích này không?
                </p>
              </div>
            </div>

            {/* PHẢI: 2 NÚT HÀNH ĐỘNG TẠO THỰC ĐƠN & HỎI AI */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={() => {
                  showToast('🚀 Đang khởi tạo Thực đơn tuần từ 4 món tâm đắc...');
                  setTimeout(() => {
                    if (onNavigate) onNavigate('planner');
                  }, 800);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#046a47',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(4, 106, 71, 0.25)',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#035438'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#046a47'}
              >
                <span>📅</span>
                <span>Tạo thực đơn tuần từ 4 món yêu thích ngay</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigate) onNavigate('chatbot');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#ffffff',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '0.75rem 1.1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={15} />
                <span>Hỏi AI</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: TẠO BỘ SƯU TẬP MỚI */}
      {/* ===================================================================== */}
      {showCreateFolderModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setShowCreateFolderModal(false)}
          className="fixed inset-0 z-[9999] bg-forest/70 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-floating border border-hairline animate-fade-up my-auto space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emeraldBotanic/10 text-emeraldBotanic flex items-center justify-center">
                  <FolderPlus size={18} />
                </div>
                <h3 className="font-editorial text-lg font-bold text-forest">
                  Tạo bộ sưu tập mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateFolderModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-forest mb-1.5">
                  Tên bộ sưu tập *
                </label>
                <input
                  type="text"
                  placeholder="VD: Món ăn sáng 15 phút, Tiệc chay cuối tuần..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-hairline text-xs text-forest outline-none focus:border-emeraldBotanic transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest mb-1.5">
                  Màu sắc đại diện
                </label>
                <div className="flex gap-2">
                  {['#059669', '#0284c7', '#d97706', '#dc2626', '#7c3aed', '#ec4899'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewFolderColor(c)}
                      className="w-7 h-7 rounded-full cursor-pointer transition"
                      style={{
                        background: c,
                        boxShadow: newFolderColor === c ? '0 0 0 2px #ffffff, 0 0 0 4px #0f172a' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-forest mb-1.5">
                  Mô tả ngắn (không bắt buộc)
                </label>
                <textarea
                  placeholder="Ghi chú về nhóm món ăn hoặc mục tiêu dinh dưỡng..."
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-hairline text-xs text-forest outline-none focus:border-emeraldBotanic transition resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-4 py-2 rounded-xl border border-hairline text-xs font-semibold text-olive hover:text-forest transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  Tạo thư mục
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: TÓM TẮT AI CỦA VIDEO */}
      {/* ===================================================================== */}
      {activeModalItem === 'ai_summary' && selectedItemData && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setActiveModalItem(null)}
          className="fixed inset-0 z-[9999] bg-forest/70 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-floating border border-hairline animate-fade-up my-auto space-y-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start pb-2 border-b border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emeraldBotanic/10 text-emeraldBotanic flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-forest">
                    Tóm tắt công thức AI trích xuất
                  </h3>
                  <span className="text-xs text-olive">Kênh: {selectedItemData.channel}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-alabaster p-3.5 rounded-2xl border border-hairline space-y-1">
              <h4 className="font-editorial text-sm font-bold text-forest">
                {selectedItemData.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-olive font-metric">
                <span>⏱ {selectedItemData.duration}</span>
                <span>•</span>
                <span className="text-emeraldBotanic font-bold">Speech-to-Recipe</span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-forest">
                Checklist các bước nấu nhanh:
              </h5>
              <div className="space-y-2">
                {selectedItemData.aiSummary && selectedItemData.aiSummary.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-alabaster border border-hairline text-xs text-forest">
                    <span className="w-5 h-5 rounded-full bg-emeraldBotanic text-white font-metric text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 rounded-xl border border-hairline text-xs font-semibold text-olive hover:text-forest transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`📅 Đã lưu công thức từ video "${selectedItemData.title}" vào Thực đơn tuần!`);
                  setActiveModalItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Thêm vào thực đơn
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: XEM CHI TIẾT CÔNG THỨC MÓN ĂN */}
      {/* ===================================================================== */}
      {activeModalItem === 'recipe_detail' && selectedItemData && (
        <RecipeDetailModal
          recipe={selectedItemData}
          onClose={() => setActiveModalItem(null)}
          onApplyMeal={() => {
            showToast(`📅 Đã thêm "${selectedItemData.title}" vào Thực đơn tuần!`);
            if (onNavigate) onNavigate('planner');
          }}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: TRÌNH PHÁT VIDEO NẤU ĂN */}
      {/* ===================================================================== */}
      {activeModalItem === 'video_player' && selectedItemData && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setActiveModalItem(null)}
          className="fixed inset-0 z-[9999] bg-forestDark/80 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-hairline animate-fade-up my-auto"
          >
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img 
                src={selectedItemData.thumbnail} 
                alt={selectedItemData.title}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute w-16 h-16 rounded-full bg-emeraldBotanic/90 text-white flex items-center justify-center shadow-lg pl-1 cursor-pointer hover:scale-105 transition">
                <Play size={28} fill="currentColor" />
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition cursor-pointer"
                title="Đóng video"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-editorial text-base sm:text-lg font-bold text-forest">
                  {selectedItemData.title}
                </h3>
                <p className="text-xs text-olive mt-0.5">
                  Kênh: <strong className="text-forest">{selectedItemData.channel}</strong> • {selectedItemData.duration}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalItem('ai_summary')}
                className="px-4 py-2 rounded-xl bg-forest/5 hover:bg-forest/10 text-emeraldBotanic text-xs font-semibold border border-emeraldBotanic/30 flex items-center gap-1.5 shrink-0 transition cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Xem tóm tắt AI</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
