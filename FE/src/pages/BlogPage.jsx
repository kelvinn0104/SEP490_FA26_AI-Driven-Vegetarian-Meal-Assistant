import React, { useState } from 'react';
import { BookOpen, Search, Clock, Eye, Sparkles, X, Heart, Share2, Tag } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function BlogPage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = ['Tất cả', 'Kiến thức Dinh dưỡng', 'Công thức món chính', 'Mẹo nhà bếp'];

  const articles = [
    {
      id: 'b1',
      category: 'Công thức món chính',
      title: 'Cà Rốt Nấu Nước Cốt Dừa & Nấm Hương Thơm Lừng',
      desc: 'Món ngon thuần chay béo thanh, giàu Vitamin A, sắt thực vật & chất xơ hòa tan hỗ trợ tiêu hóa vượt trội.',
      author: 'Chuyên gia Dinh dưỡng An Nhiên',
      date: '10 Tháng 9, 2026',
      readTime: '5 phút đọc',
      likes: 342,
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      content: `
        Cà rốt và nấm hương là sự kết hợp hoàn hảo giữa vị ngọt tự nhiên và hương thơm thảo mộc sâu lắng. Nước cốt dừa nguyên chất cung cấp chất béo lành mạnh dạng MCT, giúp cơ thể hấp thu tối đa Beta-carotene từ cà rốt.

        🥕 **Giá trị dinh dưỡng trên 1 khẩu phần:**
        - Calo: 420 kcal
        - Protein thực vật: 21g
        - Sắt: 9.2mg (đáp ứng 60% nhu cầu ngày)
        - Độ cân bằng vi chất: 84%
      `,
      ingredients: ['2 củ cà rốt hữu cơ', '150g nấm hương tươi', '100ml nước cốt dừa nguyên chất', 'Hành baro, tiêu đen, muối biển'],
      steps: [
        'Cà rốt gọt vỏ, tỉa hoa hoặc thái khoanh vừa ăn. Nấm hương ngâm nước muối loãng 5 phút, cắt bớt chân già.',
        'Phi thơm hành baro với 1 muỗng dầu mè, cho nấm hương vào xào săn trên lửa vừa trong 3 phút.',
        'Thêm cà rốt và 200ml nước dùng củ quả, đậy nắp rim nhỏ lửa 12 phút cho cà rốt chín mềm dịu ngọt.',
        'Rót nước cốt dừa vào khuấy đều tay, nêm muối biển và tiêu. Đun sôi liu riu thêm 2 phút là hoàn thành.'
      ]
    },
    {
      id: 'b2',
      category: 'Công thức món chính',
      title: 'Poke Quinoa Tempeh Sốt Teriyaki Dưỡng Sinh',
      desc: 'Tô cơm trộn giàu đạm thực vật từ hạt Diêm Mạch (Quinoa) và đậu nành lên men (Tempeh) giòn bùi.',
      author: 'Chef Minh Tú',
      date: '08 Tháng 9, 2026',
      readTime: '6 phút đọc',
      likes: 512,
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      content: `
        Tempeh là nguyên liệu vàng cho người ăn thuần chay nhờ quá trình lên men đậu nành tự nhiên giúp phân giải phytate, tăng tỉ lệ hấp thu protein lên đến 90%. Kết hợp cùng Quinoa đầy đủ 9 axit amin thiết yếu.

        🥗 **Giá trị dinh dưỡng trên 1 khẩu phần:**
        - Calo: 510 kcal
        - Protein thực vật: 25g
        - Sắt: 7.8mg
        - Độ cân bằng vi chất: 92%
      `,
      ingredients: ['1 chén Quinoa nấu chín', '100g Tempeh thái hạt lựu', '1/2 quả bơ sáp, bắp cải tím, dưa leo', 'Sốt Teriyaki thuần chay ít đường'],
      steps: [
        'Ướp Tempeh với sốt Teriyaki trong 10 phút, sau đó áp chảo vàng giòn các mặt trên chảo chống dính.',
        'Cho Quinoa vào tô làm nền, xếp các loại rau củ tươi thái mỏng và Tempeh xung quanh một cách đẹp mắt.',
        'Rưới một lớp sốt Teriyaki mè rang lên trên và dùng ngay để cảm nhận độ giòn tươi.'
      ]
    },
    {
      id: 'b3',
      category: 'Kiến thức Dinh dưỡng',
      title: 'Top 5 Nguồn Protein Thuần Chay Giúp Tăng Cơ Khỏe Mạnh',
      desc: 'Giải mã nỗi lo thiếu đạm khi ăn chay: Khám phá các nguồn Protein hoàn chỉnh từ Tempeh, Đậu nành non, Đậu gà và Hạt diêm mạch.',
      author: 'BS. Lê Thị Mai (Chuyên khoa Dinh dưỡng)',
      date: '05 Tháng 9, 2026',
      readTime: '7 phút đọc',
      likes: 890,
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      content: `
        Nhiều người e ngại ăn chay sẽ dẫn đến suy nhược cơ bắp. Thực tế, nếu biết cách phối hợp ngũ cốc và họ đậu (ví dụ: Gạo lứt + Đậu gà, Quinoa + Tempeh), bạn hoàn toàn đạt được lượng Leucine và đạm tương đương với ức gà hoặc thịt bò.

        1. **Tempeh (20g đạm/100g):** Đậu nành lên men giàu probiotic, cực kỳ dễ tiêu hóa.
        2. **Đậu gà & Đậu lăng (18g đạm/100g chín):** Giàu chất xơ và kali, hỗ trợ kiểm soát đường huyết.
        3. **Hạt Diêm mạch (Quinoa - 8g đạm/100g chín):** Một trong số ít thực vật chứa trọn vẹn 9 amino acid thiết yếu.
        4. **Hạt gai dầu (Hemp Seeds):** Tỉ lệ vàng Omega-3 và Omega-6.
        5. **Tảo xoắn Spirulina:** Bổ sung vi chất và chất chống oxy hóa mạnh mẽ.
      `,
      ingredients: ['Khuyến nghị bổ sung phối hợp đa dạng 3 nguồn protein khác nhau trong ngày'],
      steps: [
        'Bữa sáng: Bổ sung sinh tố yến mạch cùng hạt gai dầu hoặc bơ đậu phộng.',
        'Bữa trưa: Dùng cơm gạo lứt cùng đậu hũ sốt nấm hoặc tempeh xào rau củ.',
        'Bữa tối: Salad đậu gà sốt mè kết hợp súp bí đỏ hạt sen.'
      ]
    },
    {
      id: 'b4',
      category: 'Mẹo nhà bếp',
      title: 'Bí Quyết Bảo Quản Nấm & Rau Củ Tươi Giữ Trọn Dinh Dưỡng',
      desc: 'Hướng dẫn chuẩn khoa học giúp nấm không bị đen ủng, rau lá xanh tươi giòn suốt 7 ngày mà không dùng chất bảo quản.',
      author: 'VeggieAI Kitchen Team',
      date: '02 Tháng 9, 2026',
      readTime: '4 phút đọc',
      likes: 275,
      img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
      content: `
        Nấm hương và nấm đùi gà rất nhạy cảm với độ ẩm. Nếu bọc túi nilon kín, nấm sẽ nhanh chóng thối rữa và sinh mùi chua. 

        💡 **Quy tắc vàng khi bảo quản:**
        - Nấm tươi: Không rửa trước khi cất. Bọc trong túi giấy xi-măng hoặc hộp lót khăn giấy khô.
        - Rau thơm & rau lá: Cắt tỉa gốc úa, dùng khăn giấy thấm bớt sương rồi cất ngăn mát tủ lạnh (4-6°C).
        - Củ quả (Cà rốt, khoai lang): Để nơi thoáng khí hoặc ngâm ngập nước sạch thay nước 2 ngày/lần.
      `,
      ingredients: ['Khăn giấy sạch thực phẩm', 'Túi giấy kraft thoáng khí', 'Hộp thủy tinh đậy kín'],
      steps: [
        'Bước 1: Phân loại ngay nguyên liệu khi mua về từ chợ hoặc siêu thị.',
        'Bước 2: Dùng khăn giấy lau khô bề mặt nấm nếu bị đọng nước sương.',
        'Bước 3: Đặt vào túi giấy và bảo quản ở ngăn rau củ tủ lạnh.'
      ]
    }
  ];

  const filteredArticles = articles.filter(a => {
    const matchesCategory = activeCategory === 'Tất cả' || a.category === activeCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem 3.5rem 1.5rem' }}>
      {/* HEADER HERO */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
        <span className="badge badge-ai" style={{ marginBottom: '0.75rem' }}>
          <BookOpen size={15} /> BÀI VIẾT & BLOG CÔNG THỨC
        </span>
        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: 800, margin: '0.5rem 0' }}>
          Góc Sống Chay & Cẩm Nang Dinh Dưỡng
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto 1.75rem auto', lineHeight: '1.6' }}>
          Tổng hợp các bài viết chuyên sâu về cân bằng vi chất thực dưỡng, công thức nấu ăn chuẩn hóa và mẹo bếp khoa học từ chuyên gia VeggieAI.
        </p>

        {/* SEARCH BAR */}
        <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '30px', padding: '0.5rem 1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
            <Search size={18} color="#64748b" style={{ marginRight: '0.75rem' }} />
            <input 
              type="text" 
              placeholder="Tìm bài viết, công thức hoặc kiến thức dinh dưỡng..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', color: '#1e293b' }}
            />
          </div>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '20px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeCategory === cat ? 'none' : '1px solid #e2e8f0',
                background: activeCategory === cat ? '#046a47' : '#ffffff',
                color: activeCategory === cat ? '#ffffff' : '#475569',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ARTICLES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {filteredArticles.map((article) => (
          <Card 
            key={article.id} 
            style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onClick={() => setSelectedArticle(article)}
          >
            <div style={{ height: '210px', backgroundImage: `url('${article.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.92)', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                {article.category}
              </span>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
                <span>{article.date}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} /> {article.readTime}
                </span>
              </div>

              <h3 style={{ color: '#0f172a', fontSize: '1.2rem', lineHeight: '1.4', marginBottom: '0.65rem' }}>
                {article.title}
              </h3>

              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem', flex: 1 }}>
                {article.desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  {article.author}
                </span>
                <span style={{ color: '#059669', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Eye size={15} /> Đọc tiếp →
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <p>Không tìm thấy bài viết nào phù hợp với từ khóa "{searchQuery}".</p>
          <Button variant="secondary" onClick={() => { setSearchQuery(''); setActiveCategory('Tất cả'); }}>
            Xem tất cả bài viết
          </Button>
        </div>
      )}

      {/* ARTICLE DETAIL MODAL */}
      {selectedArticle && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '720px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: '2.25rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setSelectedArticle(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span className="badge badge-success">{selectedArticle.category}</span>
            <h2 style={{ color: '#0f172a', margin: '0.75rem 0 0.5rem 0', fontSize: '1.75rem', lineHeight: '1.35' }}>
              {selectedArticle.title}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Tác giả: <strong>{selectedArticle.author}</strong> • {selectedArticle.date} • {selectedArticle.readTime}
            </p>

            <div style={{ height: '260px', backgroundImage: `url('${selectedArticle.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px', marginBottom: '1.5rem' }}></div>

            <div style={{ color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {selectedArticle.content}
            </div>

            {selectedArticle.ingredients && (
              <>
                <h4 style={{ color: '#059669', marginBottom: '0.5rem' }}>🥕 Nguyên liệu chuẩn bị:</h4>
                <ul style={{ paddingLeft: '1.25rem', color: '#334155', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                  {selectedArticle.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </>
            )}

            {selectedArticle.steps && (
              <>
                <h4 style={{ color: '#059669', marginBottom: '0.5rem' }}>👨‍🍳 Các bước thực hiện:</h4>
                <ol style={{ paddingLeft: '1.25rem', color: '#334155', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {selectedArticle.steps.map((st, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>{st}</li>
                  ))}
                </ol>
              </>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <Button variant="secondary" onClick={() => setSelectedArticle(null)}>Đóng</Button>
              <Button onClick={() => { setSelectedArticle(null); onNavigate && onNavigate('register'); }}>
                Đăng ký để lưu bài viết & công thức
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
