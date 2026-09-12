import React, { useState } from 'react';
import { Search, ArrowRight, X, ChevronLeft, ChevronRight, Mail, Sparkles, Sprout } from 'lucide-react';
import Button from '../components/ui/Button';

export default function BlogPage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('Mới nhất');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // CATEGORIES ACCORDING TO DESIGN
  const row1Categories = ['Tất cả', 'Dinh dưỡng & Vi chất', 'Bí quyết nấu ăn', 'Ăn chay theo mùa'];
  const row2Categories = ['Khoa học thể hình', 'Sống tỉnh thức'];

  // FEATURED HERO ARTICLE (TIÊU ĐIỂM TUẦN)
  const featuredArticle = {
    id: 'featured-1',
    category: 'Dinh dưỡng & Vi chất',
    date: '12 Tháng 10, 2026',
    readTime: '9 phút đọc',
    title: 'Giải Mã Vi Chất B12, Kẽm & Sắt Trong Chế Độ Thuần Chay : Phác Đồ Bổ Sung Chuẩn Khoa Học',
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

  // 6 LATEST ARTICLES EXACTLY MATCHING THE USER SCREENSHOT
  const latestArticles = [
    {
      id: 'art-1',
      category: 'Bí quyết nấu ăn',
      date: '14 Tháng 10, 2026',
      readTime: '6 phút đọc',
      title: 'Hướng dẫn tự ủ Tempeh đậu nành truyền thống tại nhà chuẩn vị Indonesia',
      desc: 'Bí quyết kiểm soát nhiệt độ 31°C và độ ẩm hoàn hảo giúp mầm nấm Rhizopus phát triển mịn màng và nhã...',
      author: 'Chef Tuệ Tâm',
      authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      fullContent: `
        Tempeh là món ăn lên men truyền thống từ đậu nành của người Indonesia. Khác với đậu hũ, tempeh giữ nguyên toàn bộ hạt đậu nành nên giữ trọn vẹn chất xơ, vitamin và khoáng chất.
        
        Quy trình ủ tại nhà:
        1. Ngâm tách vỏ đậu nành kỹ càng trong 12 tiếng.
        2. Luộc đậu chín tới cùng 1 thìa canh giấm táo để tạo môi trường axit nhẹ ưa thích cho nấm men.
        3. Làm ráo nước thật khô ráo, trộn đều men Rhizopus Oligosporus.
        4. Cho vào túi zip đục lỗ kim thoáng khí, ủ ở nhiệt độ ấm 30-32°C trong 36-48 giờ cho đến khi sợi nấm trắng bao phủ kín đặc hạt đậu.
      `
    },
    {
      id: 'art-2',
      category: 'Khoa học thể hình',
      date: '13 Tháng 10, 2026',
      readTime: '8 phút đọc',
      title: 'Thực đơn thuần chay 7 ngày cho dân tập gym & yoga đạt phong độ đỉnh cao',
      desc: 'Bảng phân bổ Macro cân bằng đạt 120g protein thuần chay mỗi ngày, tối ưu khả năng phục hồi mỏ c...',
      author: 'HLV Hoàng Nam',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
      fullContent: `
        Xây dựng cơ bắp không mỡ với chế độ thuần thực vật hoàn toàn khả thi nếu bạn làm chủ công thức phối hợp axit amin.
        
        Chiến lược phân bổ Macro:
        - Tỷ lệ: 50% Carb phức hợp (Khoai lang, Yến mạch, Gạo lứt), 25% Protein (Tempeh, Đậu gà, Seitan), 25% Chất béo tốt (Bơ, Dầu ô liu, Hạt chia).
        - Đảm bảo 1.6g - 2.0g Protein/kg trọng lượng cơ thể mỗi ngày.
        - Uống đủ 2.5 - 3 lít nước và bổ sung điện giải từ nước dừa tự nhiên sau các buổi tập cường độ cao.
      `
    },
    {
      id: 'art-3',
      category: 'Dinh dưỡng & Vi chất',
      date: '11 Tháng 10, 2026',
      readTime: '4 phút đọc',
      title: 'Vì sao hạt mè nguyên cám là vua canxi của giới thực vật?',
      desc: 'Khám phá hàm lượng canxi dồi dào trong hạt mè đen nguyên vỏ và cách chế biến bơ Tahini để cơ thể sấp...',
      author: 'DS. An Nhiên',
      authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80',
      fullContent: `
        Trong 100g hạt mè đen nguyên vỏ chứa tới 975mg canxi, cao gấp gần 8 lần so với sữa bò thông thường (khoảng 120mg/100g).
        
        Cách tối ưu khả năng hấp thu:
        - Hạt mè nếu để nguyên hạt nhai qua loa sẽ rất khó tiêu. Hãy rang thơm và xay nhuyễn thành bơ Tahini hoặc muối mè rang.
        - Kết hợp Tahini cùng nước cốt chanh để làm nước sốt salad thơm ngon vừa kích thích vị giác vừa tăng cường chuyển hóa canxi.
      `
    },
    {
      id: 'art-4',
      category: 'Ăn chay theo mùa',
      date: '09 Tháng 10, 2026',
      readTime: '5 phút đọc',
      title: 'Canh dưỡng sinh Lập Đông: Cân bằng âm dương, dưỡng ấm tỳ vị trong gió lạnh',
      desc: 'Sự phối hợp hoàn hảo của ngưu bàng, củ sen, nấm đông cô ninh chậm là chìa khóa ngừa cúm tự nhiê...',
      author: 'Lương y Thu Thảo',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
      fullContent: `
        Thời khắc giao mùa Lập Đông nhiệt độ giảm mạnh, hàn khí dễ xâm nhập tỳ vị gây suy giảm miễn dịch và mệt mỏi.
        
        Bài canh ngũ hành dưỡng sinh:
        - Củ cải trắng (Hành Kim), Cà rốt (Hành Hỏa), Nấm đông cô (Hành Thủy), Ngưu bàng (Hành Mộc), Củ sen (Hành Thổ).
        - Hầm nhỏ lửa trong nồi đất 45 phút, không nêm đường hay bột ngọt, chỉ dùng một chút muối biển hầm thô để giữ trọn vẹn khí vị thanh khiết của đất trời.
      `
    },
    {
      id: 'art-5',
      category: 'Sống tỉnh thức',
      date: '06 Tháng 10, 2026',
      readTime: '8 phút đọc',
      title: 'Cách phân biệt và thay thế ngũ vị tân trong ẩm thực chay dưỡng tâm',
      desc: 'Nghệ thuật sử dụng boaro, kiệu và hạt mùi để món ăn giữ trọn tầng vị thanh dịu mà vẫn giữ cho tâm trí thư...',
      author: 'Thầy Quảng Tuệ',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
      fullContent: `
        Ngũ vị tân (Hành, Tỏi, Kiệu, Hẹ, Nén) theo quan niệm dưỡng sinh cổ truyền chứa nhiều hoạt chất kích thích hệ thần kinh giao cảm.
        
        Nghệ thuật tạo hương thay thế:
        - Sử dụng gốc ngò rí, lá chúc, tiêu sọ đập dập để tạo hương cay nồng ấm áp.
        - Dùng dầu hạt điều màu và gốc sả băm nhuyễn phi thơm làm nền màu cho các món kho, xào thay vì tỏi ớt thông thường.
      `
    },
    {
      id: 'art-6',
      category: 'Sống tỉnh thức',
      date: '03 Tháng 10, 2026',
      readTime: '7 phút đọc',
      title: 'Kinh nghiệm 5 năm ăn chay trường: Tràn đầy sinh lực và tâm trí an yên',
      desc: 'Hành trình điều chỉnh nhịp sinh học và cảm nhận sự chuyển biến tích cực của cơ thể, lột xác và nguồn năn...',
      author: 'Mai Lan (Blogger)',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
      fullContent: `
        Bước sang năm thứ 5 ăn thuần thực vật, điều lớn nhất tôi nhận được không chỉ là các chỉ số xét nghiệm máu hoàn hảo, mà là một tâm thế nhẹ nhàng, thảnh thơi mỗi sáng thức dậy.
        
        3 đúc kết quan trọng:
        1. Ăn chay không phải là kiêng khem khổ hạnh, mà là một bữa tiệc sắc màu của nông sản tự nhiên.
        2. Lắng nghe cơ thể: Nếu cảm thấy thèm ngọt hay mệt, hãy bổ sung tinh bột chuyển hóa chậm và chất béo lành mạnh thay vì đồ chế biến sẵn.
        3. Kết hợp hơi thở và sự tĩnh lặng trong mỗi bữa ăn để nuôi dưỡng trọn vẹn cả thân lẫn tâm.
      `
    }
  ];

  // FILTERING LOGIC
  const filteredArticles = latestArticles.filter(art => {
    const matchesCategory = activeCategory === 'Tất cả' || art.category === activeCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="blog-container">
      {/* 1. HERO HEADER SECTION */}
      <section className="blog-hero">
        <div className="blog-kienthuc-badge">
          <Sprout size={14} /> KIẾN THỨC SỐNG XANH
        </div>

        <h1 className="blog-main-title">Blog Kiến Thức & Ẩm Thực Chay</h1>
        
        <p className="blog-subtitle">
          Khám phá dinh dưỡng khoa học, mẹo bếp tinh tế và cảm hứng sống thuần thực vật bền vững từ các chuyên gia dinh dưỡng hàng đầu.
        </p>

        {/* SEARCH BOX */}
        <div className="blog-search-box-wrapper">
          <Search size={18} color="#9ca3af" style={{ flexShrink: 0, marginRight: '0.65rem' }} />
          <input
            type="text"
            className="blog-search-input"
            placeholder="Tìm kiếm bài viết, món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(e.target.value)}
          />
          <button className="blog-search-btn" onClick={() => {}}>
            Tìm kiếm
          </button>
        </div>

        {/* FILTER PILLS */}
        <div className="blog-filter-pills-row">
          {row1Categories.map(cat => (
            <button
              key={cat}
              className={`blog-pill-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="blog-filter-pills-row">
          {row2Categories.map(cat => (
            <button
              key={cat}
              className={`blog-pill-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 2. FEATURED ARTICLE BANNER (TIÊU ĐIỂM TUẦN) */}
      {activeCategory === 'Tất cả' && !searchQuery && (
        <section 
          className="blog-featured-card"
          onClick={() => setSelectedArticle(featuredArticle)}
          style={{ cursor: 'pointer' }}
        >
          {/* Left image */}
          <div 
            className="blog-featured-img-container"
            style={{ backgroundImage: `url('${featuredArticle.img}')` }}
          >
            <div className="blog-featured-img-tag">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Ẩm Thực Chay - VeggieAI • TIÊU ĐIỂM TUẦN
            </div>
          </div>

          {/* Right Content */}
          <div className="blog-featured-content">
            <div>
              <div className="blog-featured-meta-row">
                <span className="blog-featured-cat-tag">{featuredArticle.category}</span>
                <span className="blog-featured-dot">•</span>
                <span>{featuredArticle.date}</span>
                <span className="blog-featured-dot">•</span>
                <span className="blog-featured-readtime">{featuredArticle.readTime}</span>
              </div>

              <h2 className="blog-featured-title">
                {featuredArticle.title}
              </h2>

              <p className="blog-featured-desc">
                {featuredArticle.desc}
              </p>
            </div>

            <div className="blog-featured-footer">
              <div className="blog-author-box">
                <img 
                  src={featuredArticle.authorAvatar} 
                  alt={featuredArticle.author} 
                  className="blog-author-avatar"
                />
                <div>
                  <div className="blog-author-name">{featuredArticle.author}</div>
                  <div className="blog-author-role">{featuredArticle.authorRole}</div>
                </div>
              </div>

              <button 
                className="blog-btn-readmore"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedArticle(featuredArticle);
                }}
              >
                Đọc tiếp <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. LATEST ARTICLES SECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="blog-latest-header">
          <div>
            <h2 className="blog-latest-title">Bài Viết Mới Nhất</h2>
            <p className="blog-latest-subtitle">Cập nhật những nghiên cứu dinh dưỡng và công thức sáng tạo</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', color: '#6b7280' }}>Sắp xếp:</span>
            <select 
              className="blog-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="Mới nhất">Mới nhất</option>
              <option value="Đọc nhiều nhất">Đọc nhiều nhất</option>
              <option value="Đánh giá cao">Đánh giá cao</option>
            </select>
          </div>
        </div>

        {/* ARTICLES 3-COLUMN GRID */}
        <div className="blog-cards-grid">
          {filteredArticles.map((art) => (
            <div 
              key={art.id} 
              className="blog-item-card"
              onClick={() => setSelectedArticle(art)}
            >
              <div 
                className="blog-item-img-box"
                style={{ backgroundImage: `url('${art.img}')` }}
              >
                <span className="blog-item-category-tag">
                  {art.category}
                </span>
              </div>

              <div className="blog-item-body">
                <div className="blog-item-meta">
                  {art.date} • {art.readTime}
                </div>

                <h3 className="blog-item-title">
                  {art.title}
                </h3>

                <p className="blog-item-desc">
                  {art.desc}
                </p>

                <div className="blog-item-footer">
                  <div className="blog-item-author">
                    <img 
                      src={art.authorAvatar} 
                      alt={art.author} 
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span>{art.author}</span>
                  </div>

                  <span className="blog-item-read-link">
                    Đọc bài <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
            <p style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.</p>
            <Button variant="secondary" onClick={() => { setSearchQuery(''); setActiveCategory('Tất cả'); }}>
              Xem tất cả bài viết
            </Button>
          </div>
        )}

        {/* 4. PAGINATION */}
        <div className="blog-pagination-wrapper">
          <button 
            className="blog-page-nav-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            <ChevronLeft size={16} />
          </button>

          <button 
            className={`blog-page-nav-btn ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>

          <button 
            className={`blog-page-nav-btn ${currentPage === 2 ? 'active' : ''}`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>

          <button 
            className={`blog-page-nav-btn ${currentPage === 3 ? 'active' : ''}`}
            onClick={() => setCurrentPage(3)}
          >
            3
          </button>

          <span style={{ color: '#9ca3af', padding: '0 0.35rem' }}>...</span>

          <button 
            className={`blog-page-nav-btn ${currentPage === 12 ? 'active' : ''}`}
            onClick={() => setCurrentPage(12)}
          >
            12
          </button>

          <button 
            className="blog-page-nav-btn"
            onClick={() => setCurrentPage(Math.min(12, currentPage + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* 5. NEWSLETTER CTA BOX (NUÔI DƯỠNG CƠ THỂ KHOA HỌC TỪNG NGÀY) */}
      <section className="blog-newsletter-card">
        <div className="blog-newsletter-icon">
          <Mail size={22} color="#047857" />
        </div>

        <h2 className="blog-newsletter-title">
          Nuôi Dưỡng Cơ Thể Khoa Học Từng Ngày
        </h2>

        <p className="blog-newsletter-sub">
          Nhận thực đơn chay mẫu, công thức chất lượng cao và bài viết chuyên sâu từ bác sĩ dinh dưỡng vào mỗi sáng thứ Hai.
        </p>

        <form className="blog-newsletter-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            className="blog-newsletter-input"
            placeholder="Nhập email của bạn..."
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            required
          />
          <button type="submit" className="blog-newsletter-btn">
            Đăng ký ngay
          </button>
        </form>

        {subscribed && (
          <p style={{ color: '#047857', fontWeight: 700, fontSize: '0.88rem', margin: '0.5rem 0' }}>
            🎉 Cảm ơn bạn đã đăng ký nhận bản tin dinh dưỡng!
          </p>
        )}

        <p className="blog-newsletter-note">
          Miễn phí 100%. Bạn có thể hủy nhận tin bất kỳ lúc nào.
        </p>
      </section>

      {/* ARTICLE FULL DETAIL MODAL */}
      {selectedArticle && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '740px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: '2.5rem', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setSelectedArticle(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span className="badge badge-success" style={{ marginBottom: '0.65rem' }}>
              {selectedArticle.category}
            </span>

            <h2 style={{ color: '#111827', margin: '0.5rem 0 0.85rem 0', fontSize: '1.85rem', lineHeight: '1.35', fontWeight: 800 }}>
              {selectedArticle.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <img 
                src={selectedArticle.authorAvatar} 
                alt={selectedArticle.author} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.92rem' }}>{selectedArticle.author}</div>
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{selectedArticle.date} • {selectedArticle.readTime}</div>
              </div>
            </div>

            <div style={{ height: '280px', backgroundImage: `url('${selectedArticle.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px', marginBottom: '1.75rem' }}></div>

            <div style={{ color: '#374151', lineHeight: '1.75', whiteSpace: 'pre-line', fontSize: '1rem', marginBottom: '2rem' }}>
              {selectedArticle.fullContent}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '1.25rem' }}>
              <Button variant="secondary" onClick={() => setSelectedArticle(null)}>
                Đóng
              </Button>
              <Button onClick={() => { setSelectedArticle(null); onNavigate && onNavigate('register'); }}>
                Đăng ký để lưu bài viết
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
