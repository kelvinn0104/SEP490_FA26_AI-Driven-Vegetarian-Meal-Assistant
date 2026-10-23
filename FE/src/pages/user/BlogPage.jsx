import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, ArrowRight, X, ChevronLeft, ChevronRight, Mail, 
  Sparkles, Sprout, Plus, Bookmark, Check, CheckCircle2, Clock, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BlogPage({ onNavigate }) {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('Mới nhất');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [savedArticleIds, setSavedArticleIds] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  // Lock body scroll and listen for Escape key when article modal is open
  useEffect(() => {
    if (selectedArticle) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedArticle(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = orig;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedArticle]);

  const handleToggleSaveArticle = (article, e) => {
    if (e) e.stopPropagation();
    if (!article) return;
    if (!user) {
      if (onNavigate) onNavigate('login');
      return;
    }
    const isSaved = savedArticleIds.includes(article.id);
    if (isSaved) {
      setSavedArticleIds(prev => prev.filter(id => id !== article.id));
      showToast(`Đã bỏ lưu bài viết "${article.title}"`);
    } else {
      setSavedArticleIds(prev => [...prev, article.id]);
      showToast('❤️ Đã lưu vào Bài viết yêu thích!');
    }
  };

  // Categories list
  const categories = [
    'Tất cả',
    'Dinh dưỡng & Vi chất',
    'Bí quyết nấu ăn',
    'Ăn chay theo mùa',
    'Khoa học thể hình',
    'Sống tỉnh thức'
  ];

  // Featured hero article
  const featuredArticle = {
    id: 'featured-1',
    category: 'Dinh dưỡng & Vi chất',
    date: '12 Tháng 10, 2026',
    readTime: '9 phút đọc',
    title: 'Giải Mã Vi Chất B12, Kẽm & Sắt Trong Chế Độ Thuần Chay: Phác Đồ Bổ Sung Chuẩn Khoa Học',
    desc: 'Đập tan nỗi lo thiếu máu và suy nhược khi kiêng đạm động vật. Khảo cứu lâm sàng mới nhất chỉ ra phương pháp hấp thụ Non-Heme Iron hiệu quả nhờ vitamin C bản địa cùng chiến lược tối ưu nồng độ kẽm từ các loại hạt mầm hữu cơ.',
    author: 'Bác sĩ Minh Đức',
    authorRole: 'Chuyên gia Dinh dưỡng Chay',
    authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
    fullContent: `
      Nhiều người bắt đầu ăn thuần chay thường lo lắng về tình trạng thiếu hụt vi chất dinh dưỡng, đặc biệt là Vitamin B12, Kẽm và Sắt Non-Heme. 
      Tuy nhiên, các nghiên cứu y khoa hiện đại đã chứng minh: với một phác đồ phối hợp thực phẩm chuẩn khoa học, bạn hoàn toàn có thể duy trì chỉ số máu tối ưu mà không cần đến nguồn gốc động vật.

      ### 1. Giải mã hấp thu Sắt Non-Heme
      Sắt từ thực vật (Non-Heme Iron) có tỷ lệ hấp thu dao động từ 5% đến 12%. Để tăng hiệu suất hấp thu lên gấp 3-4 lần:
      - Luôn kết hợp thực phẩm giàu sắt (rau bina, đậu lăng, mè đen) cùng nguồn Vitamin C dồi dào (ớt chuông, chanh, kiwi).
      - Tránh uống trà đặc, cà phê trong vòng 2 giờ sau bữa ăn chính vì polyphenol và tannin sẽ tạo phức ngăn cản hấp thu sắt.

      ### 2. Chiến lược bổ sung Kẽm từ hạt mầm
      Axit Phytic trong ngũ cốc và các loại hạt là rào cản lớn nhất của kẽm. Bằng cách:
      - Ngâm hạt từ 6 - 8 tiếng trước khi chế biến hoặc cho nảy mầm (Sprouting), hàm lượng phytate giảm tới 70%.
      - Bổ sung hạt bí ngô, hạt gai dầu (hemp seeds) và đậu nành lên men (Tempeh) mỗi ngày.

      ### 3. Vitamin B12: Nguyên tắc bất di bất dịch
      Vitamin B12 được tổng hợp bởi vi sinh vật trong đất. Trong chế độ ăn hiện đại đã được làm sạch tiệt trùng, người ăn thuần chay bắt buộc nên bổ sung B12 dạng ngậm (Methylcobalamin) hoặc men dinh dưỡng (Nutritional Yeast) đều đặn hàng tuần.
    `
  };

  const baseArticles = [
    {
      id: 'art-1',
      category: 'Bí quyết nấu ăn',
      date: '14 Tháng 10, 2026',
      readTime: '6 phút đọc',
      title: 'Hướng dẫn tự ủ Tempeh đậu nành truyền thống tại nhà chuẩn vị Indonesia',
      desc: 'Bí quyết kiểm soát nhiệt độ 31°C và độ ẩm hoàn hảo giúp mầm nấm Rhizopus phát triển mịn màng, giàu đạm và thơm ngậy.',
      author: 'Chef Tuệ Tâm',
      authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      fullContent: `Tempeh là món ăn lên men truyền thống từ đậu nành của người Indonesia. Khác với đậu hũ thông thường, tempeh giữ nguyên toàn bộ hạt đậu nành nên giữ trọn vẹn chất xơ, vitamin và khoáng chất.`
    },
    {
      id: 'art-2',
      category: 'Khoa học thể hình',
      date: '13 Tháng 10, 2026',
      readTime: '8 phút đọc',
      title: 'Thực đơn thuần chay 7 ngày cho dân tập gym & yoga đạt phong độ đỉnh cao',
      desc: 'Bảng phân bổ Macro cân bằng đạt 120g protein thuần chay mỗi ngày, tối ưu khả năng phục hồi cơ bắp và dẻo dai khớp xương.',
      author: 'HLV Hoàng Nam',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
      fullContent: `Xây dựng cơ bắp không mỡ với chế độ thuần thực vật hoàn toàn khả thi nếu bạn làm chủ công thức phối hợp axit amin thiết yếu.`
    },
    {
      id: 'art-3',
      category: 'Dinh dưỡng & Vi chất',
      date: '11 Tháng 10, 2026',
      readTime: '4 phút đọc',
      title: 'Vì sao hạt mè nguyên cám là vua canxi của giới thực vật?',
      desc: 'Khám phá hàm lượng canxi dồi dào trong hạt mè đen nguyên vỏ và cách chế biến bơ Tahini để cơ thể hấp thu tối đa mà không gây nóng.',
      author: 'DS. An Nhiên',
      authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80',
      fullContent: `Trong 100g hạt mè đen nguyên vỏ chứa tới 975mg canxi, cao gấp gần 8 lần so với sữa bò thông thường.`
    },
    {
      id: 'art-4',
      category: 'Ăn chay theo mùa',
      date: '09 Tháng 10, 2026',
      readTime: '5 phút đọc',
      title: 'Canh dưỡng sinh Lập Đông: Cân bằng âm dương, dưỡng ấm tỳ vị trong gió lạnh',
      desc: 'Sự phối hợp hoàn hảo của ngưu bàng, củ sen, nấm đông cô ninh chậm là chìa khóa ngừa cảm cúm tự nhiên cho cả gia đình.',
      author: 'Lương y Thu Thảo',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
      fullContent: `Thời khắc giao mùa Lập Đông nhiệt độ giảm mạnh, hàn khí dễ xâm nhập tỳ vị gây suy giảm miễn dịch và mệt mỏi.`
    },
    {
      id: 'art-5',
      category: 'Sống tỉnh thức',
      date: '06 Tháng 10, 2026',
      readTime: '8 phút đọc',
      title: 'Cách phân biệt và thay thế ngũ vị tân trong ẩm thực chay dưỡng tâm',
      desc: 'Nghệ thuật sử dụng boaro, kiệu và hạt mùi để món ăn giữ trọn tầng vị thanh dịu mà vẫn giữ cho tâm trí thư thái nhẹ nhàng.',
      author: 'Thầy Quảng Tuệ',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
      fullContent: `Ngũ vị tân theo quan niệm dưỡng sinh cổ truyền chứa nhiều hoạt chất kích thích hệ thần kinh giao cảm.`
    },
    {
      id: 'art-6',
      category: 'Sống tỉnh thức',
      date: '03 Tháng 10, 2026',
      readTime: '7 phút đọc',
      title: 'Kinh nghiệm 5 năm ăn chay trường: Tràn đầy sinh lực và tâm trí an yên',
      desc: 'Hành trình điều chỉnh nhịp sinh học và cảm nhận sự chuyển biến tích cực của cơ thể, tinh thần thư thái và tràn đầy năng lượng tích cực.',
      author: 'Mai Lan',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
      fullContent: `Bước sang năm thứ 5 ăn thuần thực vật, điều lớn nhất tôi nhận được không chỉ là các chỉ số xét nghiệm máu hoàn hảo, mà là một tâm thế nhẹ nhàng.`
    }
  ];

  const [latestArticles, setLatestArticles] = useState(baseArticles);

  useEffect(() => {
    try {
      const userPublished = JSON.parse(localStorage.getItem('veggieai_user_published_posts') || '[]');
      if (Array.isArray(userPublished) && userPublished.length > 0) {
        setLatestArticles([...userPublished, ...baseArticles]);
      }
    } catch {}
  }, []);

  const filteredArticles = useMemo(() => {
    return latestArticles.filter(art => {
      const matchesCategory = activeCategory === 'Tất cả' || art.category === activeCategory;
      const matchesSearch = !searchQuery || 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [latestArticles, activeCategory, searchQuery]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 space-y-10 max-w-7xl mx-auto animate-fade-up">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest text-white px-5 py-3 rounded-2xl shadow-floating flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-fade-up">
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
            <span>KIẾN THỨC SỐNG XANH & DINH DƯỠNG KHOA HỌC</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
            Blog Ẩm Thực Chay & Sống Tỉnh Thức
          </h1>

          <p className="text-xs sm:text-sm text-alabaster/80 leading-relaxed max-w-2xl mx-auto">
            Khám phá phác đồ dinh dưỡng thực vật chuẩn WHO, bí quyết nấu ăn tinh tế và nguồn cảm hứng sống bền vững từ các chuyên gia y tế hàng đầu.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto flex items-center bg-white rounded-full p-1.5 shadow-card border border-white/20">
            <Search className="w-4 h-4 text-slate-400 ml-3 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết, vi chất dinh dưỡng, mẹo nấu..."
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

          {/* User Create Post Button */}
          {user && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('create-post')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition cursor-pointer backdrop-blur-xs"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-300" />
                <span>Tạo bài viết mới ✍️</span>
              </button>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
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
          2. FEATURED ARTICLE BANNER (TIÊU ĐIỂM TUẦN)
      ==================================================================== */}
      {activeCategory === 'Tất cả' && !searchQuery && (
        <section
          onClick={() => setSelectedArticle(featuredArticle)}
          className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-xs hover:shadow-card transition duration-200 cursor-pointer group grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[380px] overflow-hidden">
            <img
              src={featuredArticle.img}
              alt={featuredArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/90 text-emerald-300 backdrop-blur-md text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>TIÊU ĐIỂM TUẦN</span>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-olive font-metric">
                <span className="font-bold text-emeraldBotanic uppercase tracking-wider">{featuredArticle.category}</span>
                <span>•</span>
                <span>{featuredArticle.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {featuredArticle.readTime}
                </span>
              </div>

              <h2 className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold text-forest group-hover:text-emeraldBotanic transition leading-snug">
                {featuredArticle.title}
              </h2>

              <p className="text-xs sm:text-sm text-olive leading-relaxed line-clamp-3">
                {featuredArticle.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-hairline flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={featuredArticle.authorAvatar}
                  alt={featuredArticle.author}
                  className="w-10 h-10 rounded-full object-cover border border-hairline"
                />
                <div>
                  <div className="text-xs font-bold text-forest">{featuredArticle.author}</div>
                  <div className="text-[11px] text-olive">{featuredArticle.authorRole}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleSaveArticle(featuredArticle, e)}
                  className="p-2 rounded-xl border border-hairline text-olive hover:text-forest hover:bg-alabaster transition"
                  title="Lưu bài viết"
                >
                  <Bookmark className={`w-4 h-4 ${savedArticleIds.includes(featuredArticle.id) ? 'fill-emeraldBotanic text-emeraldBotanic' : ''}`} />
                </button>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition">
                  <span>Đọc tiếp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          3. LATEST ARTICLES GRID
      ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-forest">Bài Viết Mới Nhất</h2>
            <p className="text-xs text-olive">Cập nhật những nghiên cứu dinh dưỡng và công thức ẩm thực mới nhất</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-olive font-metric">
            <span>Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-white border border-hairline rounded-xl px-3 py-1.5 text-xs text-forest font-semibold outline-none focus:border-emeraldBotanic transition"
            >
              <option value="Mới nhất">Mới nhất</option>
              <option value="Đọc nhiều nhất">Đọc nhiều nhất</option>
              <option value="Đánh giá cao">Đánh giá cao</option>
            </select>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => {
            const isSaved = savedArticleIds.includes(art.id);
            return (
              <article
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-xs hover:shadow-card transition duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={art.img}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-forest/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold">
                      {art.category}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleToggleSaveArticle(art, e)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-emeraldBotanic shadow-xs transition"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emeraldBotanic text-emeraldBotanic' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="text-[11px] text-olive font-metric flex items-center gap-1.5">
                      <span>{art.date}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                    </div>

                    <h3 className="font-editorial text-base font-bold text-forest group-hover:text-emeraldBotanic transition leading-snug line-clamp-2">
                      {art.title}
                    </h3>

                    <p className="text-xs text-olive line-clamp-2 leading-relaxed">
                      {art.desc}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-hairline flex items-center justify-between text-xs text-olive font-metric">
                  <div className="flex items-center gap-2">
                    <img
                      src={art.authorAvatar}
                      alt={art.author}
                      className="w-6 h-6 rounded-full object-cover border border-hairline"
                    />
                    <span className="font-semibold text-forest text-[11px]">{art.author}</span>
                  </div>

                  <span className="flex items-center gap-1 text-emeraldBotanic font-bold group-hover:translate-x-0.5 transition text-[11px]">
                    <span>Đọc bài</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-hairline p-8 space-y-3">
            <p className="text-sm text-olive">Không tìm thấy bài viết nào phù hợp với từ khóa của bạn.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveCategory('Tất cả'); }}
              className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forestDark transition"
            >
              Xem tất cả bài viết
            </button>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-2 rounded-xl border border-hairline bg-white hover:bg-alabaster disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-olive" />
          </button>

          {[1, 2, 3].map((page) => (
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
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-2 rounded-xl border border-hairline bg-white hover:bg-alabaster transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-olive" />
          </button>
        </div>
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
          5. ARTICLE READER MODAL
      ==================================================================== */}
      {selectedArticle && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setSelectedArticle(null)}
          className="fixed inset-0 z-[9999] bg-forest/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-hidden shadow-floating border border-hairline flex flex-col relative my-auto animate-fade-up"
          >
            {/* Modal Header (shrink-0) */}
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
                  {selectedArticle.category}
                </span>

                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-forest leading-tight">
                  {selectedArticle.title}
                </h2>

                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={selectedArticle.authorAvatar}
                    alt={selectedArticle.author}
                    className="w-8 h-8 rounded-full object-cover border border-hairline"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-forest">{selectedArticle.author}</span>
                    <span className="text-olive ml-2 font-metric">{selectedArticle.date} • {selectedArticle.readTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Body (flex-1 overflow-y-auto) */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="aspect-video rounded-2xl overflow-hidden bg-forest">
                <img
                  src={selectedArticle.img}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line font-editorial">
                {selectedArticle.fullContent}
              </div>
            </div>

            {/* Pinned Action Footer (shrink-0) */}
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
                  <span>{savedArticleIds.includes(selectedArticle.id) ? 'Đã lưu' : 'Lưu bài viết'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const art = selectedArticle;
                    setSelectedArticle(null);
                    if (onNavigate) onNavigate('article-detail', art);
                  }}
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Xem chi tiết bài viết</span>
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
