import React, { useState } from 'react';
import { 
  Sparkles, Camera, Utensils, Video, MapPin, 
  Search, ArrowRight, CheckCircle2, Star, Play, Heart, Share2, 
  Flame, Leaf, Award, ShieldCheck, ChevronRight, X, Clock, Eye, BookOpen
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function HomePage({ onNavigate }) {
  const [selectedDay, setSelectedDay] = useState('T2');
  const [searchQuery, setSearchQuery] = useState('');
  
  // MODAL STATES FOR WORKFLOW WF06 (Xem chi tiết blog/công thức & xem chi tiết video)
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [selectedVideoDetail, setSelectedVideoDetail] = useState(null);

  const mealPlannerDays = [
    { id: 'T2', label: 'T2 HÔM NAY', date: '17' },
    { id: 'T3', label: 'T3', date: '18' },
    { id: 'T4', label: 'T4', date: '19' },
    { id: 'T5', label: 'T5', date: '20' },
    { id: 'T6', label: 'T6', date: '21' },
    { id: 'T7', label: 'T7', date: '22' },
    { id: 'CN', label: 'CN', date: '23' },
  ];

  const publicRecipes = [
    {
      id: 'r1',
      title: 'Cà Rốt Nấu Nước Cốt Dừa & Nấm Hương',
      desc: 'Món ngon thuần chay béo thanh, giàu Vitamin A, sắt thực vật & chất xơ hòa tan hỗ trợ tiêu hóa.',
      protein: '21g Protein',
      calories: '420 kcal',
      iron: '9.2mg Sắt',
      balance: '84% Cân bằng',
      time: '25 phút',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      ingredients: ['2 củ cà rốt hữu cơ', '150g nấm hương tươi', '100ml nước cốt dừa nguyên chất', 'Hành baro, tiêu đen, muối biển'],
      steps: [
        'Cà rốt gọt vỏ, thái khoanh tròn vừa ăn. Nấm hương ngâm nước muối loãng, cắt chân.',
        'Phi thơm hành baro với 1 muỗng dầu mè, cho nấm hương vào xào chín tới trong 3 phút.',
        'Thêm cà rốt và 200ml nước dùng rau củ, đun nhỏ lửa trong 12 phút cho cà rốt mềm.',
        'Rót nước cốt dừa vào khuấy đều, nêm chút muối biển và tiêu. Đun sôi nhẹ thêm 2 phút rồi tắt bếp.'
      ]
    },
    {
      id: 'r2',
      title: 'Poke Quinoa Tempeh Sốt Teriyaki',
      desc: 'Tô cơm trộn giàu đạm thực vật từ hạt Diêm Mạch (Quinoa) và đậu gà lên men (Tempeh) nướng giòn.',
      protein: '25g Protein',
      calories: '510 kcal',
      iron: '7.8mg Sắt',
      balance: '92% Cân bằng',
      time: '20 phút',
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      ingredients: ['1 chén Quinoa nấu chín', '100g Tempeh thái hạt lựu', 'Bơ sáp, bắp cải tím, dưa leo', 'Sốt Teriyaki thuần chay'],
      steps: [
        'Áp chảo Tempeh với sốt Teriyaki trên lửa vừa cho đến khi xém cạnh thơm nức.',
        'Xếp cơm Quinoa dưới đáy tô, xếp lần lượt Tempeh, bơ lát, bắp cải tím thái mỏng xung quanh.',
        'Rưới nước sốt Teriyaki lên trên và thưởng thức ngay khi còn ấm.'
      ]
    }
  ];

  const dailyMeals = {
    T2: [
      { type: 'BUỔI SÁNG', title: 'Smoothie Đậu Yến Mạch & Hạt Chia', protein: '18g Protein', time: '15 phút', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80', bg: '#ecfdf5', color: '#047857' },
      { type: 'BUỔI TRƯA', title: 'Poke Quinoa Tempeh Sốt Teriyaki', protein: '25g Protein', time: '25 phút', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80', bg: '#eff6ff', color: '#1d4ed8' },
      { type: 'BUỔI TỐI', title: 'Canh Nấm Thực Dưỡng Củ Sen', protein: '15g Protein', time: '30 phút', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80', bg: '#fff7ed', color: '#c2410c' },
      { type: 'BỮA PHỤ', title: 'Crispy Tofu Roll Bơ & Chà Là', protein: '12g Protein', time: '10 phút', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80', bg: '#fef2f2', color: '#b91c1c' },
    ]
  };

  const videoRecipes = [
    {
      id: 'v1',
      title: 'Lẩu Nấm Chay Bách Hỷ Chuẩn Vị Thanh Ngọt Thảo Mộc',
      author: 'Chef Minh Tú • 120k lượt xem',
      time: '18:24',
      summary: '1. Hầm nước dùng củ sen & hạt sen 15 phút. 2. Cho nấm đùi gà, nấm kim châm & đậu hũ non. 3. Thêm táo đỏ & kỷ tử.',
      img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
      details: [
        'Bước 1: Rửa sạch các loại nấm (nấm đùi gà, nấm hương tươi, nấm bào ngư, nấm kim châm).',
        'Bước 2: Nấu nước hầm từ 1 củ sen, 1 củ cải trắng và 50g hạt sen trong 20 phút để lấy vị ngọt thanh tự nhiên.',
        'Bước 3: Nêm 1 thìa đường phèn, hạt nêm nấm hữu cơ và vài lát kỷ tử.',
        'Bước 4: Dọn lên nồi lẩu cùng đĩa nấm tươi và bún tươi ăn kèm.'
      ]
    },
    {
      id: 'v2',
      title: 'Ram Chay Giòn Rụm Không Dầu Nướng Bằng Nồi Chiên',
      author: 'VeggieKitchen • 85k lượt xem',
      time: '12:05',
      summary: '1. Trộn miến, khoai môn, nấm mèo & đậu hũ. 2. Cuốn bánh tráng rắc mè. 3. Nướng nồi chiên 180°C trong 15 phút.',
      img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
      details: [
        'Bước 1: Bào sợi khoai môn, cà rốt. Ngâm nở miến dong và nấm mèo thái nhuyễn.',
        'Bước 2: Dằm nát đậu hũ trắng, trộn đều cùng hạt nêm nấm và tiêu thơm.',
        'Bước 3: Nhúng bánh tráng vào nước pha chút giấm để khi nướng vỏ ram giòn lâu.',
        'Bước 4: Xếp vào nồi chiên không dầu nướng ở 180°C trong 15 phút, lật mặt nướng thêm 5 phút.'
      ]
    },
    {
      id: 'v3',
      title: 'Cà Rốt Xào Nấm Nước Cốt Dừa Béo Thanh Đậm Đà',
      author: 'GreenGourmet • 210k lượt xem',
      time: '10:45',
      summary: '1. Sơ chế cà rốt cắt lát & nấm hương tươi. 2. Phi thơm hành tăm & cho nước cốt dừa. 3. Đun nhỏ lửa 8 phút.',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      details: [
        'Bước 1: Cà rốt tỉa hoa thái lát mỏng, nấm hương ngâm nở.',
        'Bước 2: Đun nóng chảo dầu, phi thơm hành baro.',
        'Bước 3: Cho cà rốt và nấm vào xào nhanh tay, rót nước cốt dừa vào rim nhỏ lửa đến khi sánh lại.',
        'Bước 4: Rắc hành ngò lên đĩa và dùng nóng với cơm gạo lứt.'
      ]
    }
  ];

  const restaurants = [
    {
      name: 'Quán Chay An Duyên - Vị Hoa',
      rating: '4.8 ★ (320+)',
      distance: '📍 1.2 km • Quận 5, TP.HCM',
      desc: 'Không gian ấm cúng, chuyên các món chay chuẩn vị Triều Châu và lẩu nấm dưỡng sinh.',
      tag: '🔥 Địa điểm nổi bật'
    },
    {
      name: 'Lẩu Nấm Chay Bách Hỷ',
      rating: '4.9 ★ (450+)',
      distance: '📍 2.5 km • Quận 3, TP.HCM',
      desc: 'Nổi tiếng với 12 loại nấm quý tươi nguyên cây và nước dùng thảo mộc thuần chay.',
      tag: '🌱 100% Thuần Chay'
    },
    {
      name: 'Mộc Nhiên Vegan Hub & Cafe',
      rating: '4.7 ★ (210+)',
      distance: '📍 3.1 km • Quận 1, TP.HCM',
      desc: 'Mô hình Cafe & Nhà hàng chay hiện đại, bánh ngọt thuần chay & smoothie giàu protein.',
      tag: '☕ Cafe & Bakery'
    }
  ];

  // WF06: TÌM KIẾM CÔNG KHAI (Lọc video và công thức)
  const filteredVideos = videoRecipes.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div>
          <span className="badge badge-ai">
            <Sparkles size={14} /> Chế độ Khách (Guest) • Khám phá Công khai
          </span>
          
          <h1 className="hero-title">
            Ăn Chay Lành Mạnh, <span>Cân Bằng Dinh Dưỡng</span> Cùng Trí Tuệ Nhân Tạo
          </h1>

          <p className="hero-subtitle">
            VeggieAI giải quyết 3 rào cản lớn nhất của người ăn chay: thiếu hụt vi chất (Protein, Sắt, B12), nhàm chán món ăn và lãng phí thực phẩm.
          </p>

          {/* WORKFLOW WF06: TÌM KIẾM BLOG, VIDEO, CÔNG THỨC CÔNG KHAI */}
          <div className="prompt-box">
            <div className="prompt-input-row">
              <input
                type="text"
                className="prompt-input"
                placeholder="Tìm kiếm công thức, video nấu chay, mẹo dinh dưỡng (WF06)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => {
                const el = document.getElementById('public-recipes-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                <Search size={16} /> Tìm công thức
              </Button>
            </div>

            <div className="tag-pills">
              <span className="tag-pill" onClick={() => setSearchQuery('Nấm')}>🍄 Món nấm thanh đạm</span>
              <span className="tag-pill" onClick={() => setSearchQuery('Protein')}>🥦 Món giàu Protein</span>
              <span className="tag-pill" onClick={() => setSearchQuery('Nồi chiên')}>⚡ Nồi chiên không dầu</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', color: '#f59e0b' }}>
              <Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" />
            </div>
            <strong>4.9/5</strong> (Hơn 50.000+ người ăn chay tin dùng)
          </div>
        </div>

        {/* HERO FEATURED RECIPE CARD (WF06: XEM CHI TIẾT CÔNG THỨC) */}
        <div className="featured-card">
          <div 
            className="featured-img-wrapper"
            style={{ backgroundImage: `url('${publicRecipes[0].img}')` }}
          >
            <div className="featured-img-overlay">Công thức nổi bật</div>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>CÔNG THỨC CÔNG KHAI (WF06)</span>
            <h3 style={{ color: '#0f172a', margin: '0.35rem 0' }}>{publicRecipes[0].title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>{publicRecipes[0].desc}</p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="nutrition-pill" style={{ background: '#ecfdf5', color: '#047857' }}>{publicRecipes[0].protein}</span>
              <span className="nutrition-pill" style={{ background: '#eff6ff', color: '#1d4ed8' }}>{publicRecipes[0].iron}</span>
              <span className="nutrition-pill" style={{ background: '#fef3c7', color: '#b45309' }}>{publicRecipes[0].balance}</span>
            </div>

            <Button 
              variant="secondary" 
              style={{ width: '100%', justifyContent: 'center' }} 
              onClick={() => setSelectedRecipeDetail(publicRecipes[0])}
            >
              <Eye size={16} /> Xem chi tiết công thức & cách nấu (WF06) →
            </Button>
          </div>
        </div>
      </section>

      {/* 3 TÍNH NĂNG ĐỘT PHÁ (Định hướng Khách sang WF01 Đăng ký hồ sơ dinh dưỡng) */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="section-title-box">
          <span className="badge badge-ai" style={{ marginBottom: '0.5rem' }}>HỆ SINH THÁI THÔNG MINH</span>
          <h2>3 Tính Năng Đột Phá Của VeggieAI</h2>
          <p>Trải nghiệm công nghệ AI giúp người ăn chay giải quyết vấn đề dinh dưỡng và lãng phí thực phẩm.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <BookOpen size={26} />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>TÍNH NĂNG 1</span>
            <h3 style={{ margin: '0.5rem 0', color: '#0f172a' }}>Kho Công Thức & Video Nấu Ăn</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Duyệt hàng trăm công thức và video nấu chay được AI tóm tắt ngắn gọn thành các bước dễ làm, hoàn toàn miễn phí cho Khách (WF06).
            </p>
            <div 
              style={{ marginTop: '1.25rem', color: '#059669', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} 
              onClick={() => {
                const el = document.getElementById('public-recipes-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Xem video nấu ăn ngay →
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Award size={26} />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>TÍNH NĂNG 2</span>
            <h3 style={{ margin: '0.5rem 0', color: '#0f172a' }}>Cân Bằng Dinh Dưỡng Theo Chỉ Số</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Tính toán BMI, vi chất (Protein, Sắt, B12) tự động bằng thuật toán Quy hoạch tuyến tính. Đăng ký tài khoản để tạo thực đơn riêng cho bạn.
            </p>
            <div 
              style={{ marginTop: '1.25rem', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} 
              onClick={() => onNavigate && onNavigate('register')}
            >
              Thiết lập hồ sơ dinh dưỡng (WF01) →
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Camera size={26} />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700 }}>TÍNH NĂNG 3</span>
            <h3 style={{ margin: '0.5rem 0', color: '#0f172a' }}>Quét Tủ Lạnh Nhận Diện Nguyên Liệu</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Mô hình Computer Vision YOLOv8 nhận diện rau củ qua ảnh chụp tủ lạnh, đánh giá độ tươi và gợi ý món ăn chống lãng phí.
            </p>
            <div 
              style={{ marginTop: '1.25rem', color: '#d97706', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} 
              onClick={() => onNavigate && onNavigate('register')}
            >
              Đăng ký để quét tủ lạnh (WF01) →
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW WF06: VIDEO NẤU ĂN CÔNG KHAI & TÓM TẮT AI 30 GIÂY */}
      <section id="public-recipes-section" style={{ marginBottom: '3.5rem' }}>
        <div className="section-title-box">
          <span className="badge badge-ai">DÀNH CHO KHÁCH (WF06)</span>
          <h2>Video Nấu Ăn Tích Hợp AI Tóm Tắt Trong 30 Giây</h2>
          <p>Xem video hướng dẫn nấu ăn chi tiết công khai kèm các bước dạng văn bản đã được AI tóm tắt ngắn gọn.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {filteredVideos.map((video) => (
            <Card key={video.id} style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelectedVideoDetail(video)}>
              <div style={{ height: '200px', backgroundImage: `url('${video.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.35)' }}></div>
                <div style={{ position: 'relative', background: 'rgba(5, 150, 105, 0.95)', width: '54px', height: '54px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                  <Play fill="white" size={22} color="white" />
                </div>
                <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.75)', color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{video.time}</span>
              </div>

              <div style={{ padding: '1.35rem' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '0.35rem', lineHeight: '1.4' }}>{video.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.85rem' }}>{video.author}</p>

                <div style={{ padding: '0.85rem', background: '#ecfdf5', borderRadius: '10px', fontSize: '0.85rem', color: '#047857', borderLeft: '4px solid #10b981' }}>
                  <strong>🤖 AI Tóm tắt các bước:</strong>
                  <p style={{ marginTop: '0.35rem', lineHeight: '1.5' }}>{video.summary}</p>
                </div>

                <div style={{ marginTop: '1rem', color: '#059669', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Eye size={16} /> Bấm để xem chi tiết video (WF06) →
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* MÔ PHỎNG THỰC ĐƠN TUẦN AI (PREVIEW - YÊU CẦU ĐĂNG KÝ ĐỂ TẠO THỰC ĐƠN RIÊNG) */}
      <section style={{ marginBottom: '3.5rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-ai">BẢN XEM TRƯỚC MẪU (PREVIEW)</span>
              <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginTop: '0.35rem' }}>Trải Nghiệm Mẫu Thực Đơn Tuần AI</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Khách vãng lai có thể xem trước mẫu thực đơn cân bằng dinh dưỡng bên dưới.</p>
            </div>
            <Button onClick={() => onNavigate && onNavigate('register')}>
              <Sparkles size={16} /> Đăng ký để tạo thực đơn riêng (WF01)
            </Button>
          </div>

          {/* Days bar */}
          <div className="meal-days-bar">
            {mealPlannerDays.map(day => (
              <div 
                key={day.id} 
                className={`day-tab ${selectedDay === day.id ? 'active' : ''}`}
                onClick={() => setSelectedDay(day.id)}
              >
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{day.label}</div>
                <div style={{ fontSize: '1.1rem' }}>{day.date}</div>
              </div>
            ))}
          </div>

          {/* Meals Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
            {dailyMeals[selectedDay]?.map((meal, idx) => (
              <div key={idx} style={{ background: '#white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ height: '140px', backgroundImage: `url('${meal.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: meal.bg, color: meal.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {meal.type}
                  </span>
                </div>

                <div style={{ padding: '1rem' }}>
                  <h4 style={{ color: '#0f172a', marginBottom: '0.75rem', fontSize: '0.95rem' }}>{meal.title}</h4>

                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ background: meal.bg, color: meal.color, padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>{meal.protein}</span>
                    <span style={{ padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '6px' }}>⏱️ {meal.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* MÔ PHỎNG COMPUTER VISION (SHOWCASE - ĐỊNH HƯỚNG WF01 ĐĂNG KÝ) */}
      <section className="vision-showcase">
        <div>
          <div 
            className="fridge-camera-box"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80')` }}
          >
            <div className="bounding-tag" style={{ top: '20px', left: '20px' }}>
              🥦 Đậu hũ non & Cà rốt tươi (Độ tươi: 95%)
            </div>
            <div className="bounding-tag" style={{ bottom: '30px', right: '20px', borderLeftColor: '#f59e0b' }}>
              🍄 Nấm hương tươi (Nên dùng trong 2 ngày)
            </div>
          </div>
        </div>

        <div>
          <span className="badge badge-ai">MÔ PHỎNG TÍNH NĂNG AI</span>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0.5rem 0' }}>Quét Tủ Lạnh, Nấu Ngon Liền Tay</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
            AI sẽ tự động nhận diện nguyên liệu trong tủ lạnh và đề xuất công thức nấu ăn thích hợp. Tính năng này yêu cầu người dùng thiết lập tài khoản để lưu trữ thực phẩm.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <CheckCircle2 color="#059669" size={20} />
              <span style={{ fontSize: '0.95rem', color: '#334155' }}><strong>1. Cơm Ớt Chuông Xào Đậu Hũ Cà Rốt</strong> (15 phút)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <CheckCircle2 color="#059669" size={20} />
              <span style={{ fontSize: '0.95rem', color: '#334155' }}><strong>2. Sup Nấm Củ Cải Hạt Sen Thanh Đạm</strong> (20 phút)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <CheckCircle2 color="#059669" size={20} />
              <span style={{ fontSize: '0.95rem', color: '#334155' }}><strong>3. Canh Bầu Nấu Đậu Hũ Non Ngọt Thanh</strong> (15 phút)</span>
            </div>
          </div>

          <Button onClick={() => onNavigate && onNavigate('register')}>
            <Camera size={18} /> Đăng ký để mở khóa tính năng Quét tủ lạnh (WF01)
          </Button>
        </div>
      </section>

      {/* QUÁN CHAY GẦN BẠN (CÔNG KHAI CHO GUEST) */}
      <section id="restaurants-section" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-ai">BẢN ĐỒ ĐỊA ĐIỂM CHAY CÔNG KHAI</span>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginTop: '0.35rem' }}>Quán Chay Được Đánh Giá Cao Gần Bạn</h2>
          </div>
          <span style={{ fontSize: '0.9rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={16} color="#059669" /> Đang hiển thị ở: <strong>Quận 1, TP. Hồ Chí Minh</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {restaurants.map((res, idx) => (
            <Card key={idx} style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-success">{res.tag}</span>
                <span style={{ color: '#d97706', fontWeight: 800, fontSize: '0.85rem' }}>{res.rating}</span>
              </div>

              <h3 style={{ color: '#0f172a', margin: '0.75rem 0 0.35rem 0', fontSize: '1.1rem' }}>{res.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, marginBottom: '0.5rem' }}>{res.distance}</p>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.15rem', lineHeight: '1.5' }}>{res.desc}</p>

              <Button variant="secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => alert(`Xem thông tin quán: ${res.name} - ${res.distance}`)}>
                Xem thông tin quán & chỉ đường →
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA BANNER: BẮT ĐẦU QUY TRÌNH ĐĂNG KÝ / THIẾT LẬP HỒ SƠ DINH DƯỠNG (WF01) */}
      <section className="cta-banner">
        <h2>Sẵn Sàng Cho Lối Sống Ăn Chay Khoa Học Và Tràn Đầy Sinh Khí?</h2>
        <p style={{ opacity: 0.9, maxWidth: '640px', margin: '0 auto 2rem auto', fontSize: '1.05rem', lineHeight: '1.65' }}>
          Gia nhập VeggieAI ngay hôm nay để thiết lập hồ sơ dinh dưỡng cá nhân, nhận thực đơn cân bằng và trò chuyện không giới hạn với AI Chef.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button style={{ background: 'white', color: '#047857', fontSize: '1rem', padding: '0.85rem 1.75rem' }} onClick={() => onNavigate && onNavigate('register')}>
            🚀 Bắt đầu quy trình đăng ký & khảo sát dinh dưỡng (WF01)
          </Button>
        </div>
      </section>

      {/* ======================================================= */}
      {/* MODAL WF06: XEM CHI TIẾT BÀI VIẾT / CÔNG THỨC NẤU ĂN */}
      {/* ======================================================= */}
      {selectedRecipeDetail && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '650px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setSelectedRecipeDetail(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span className="badge badge-success">CHI TIẾT CÔNG THỨC (WF06)</span>
            <h2 style={{ color: '#0f172a', margin: '0.75rem 0 0.5rem 0' }}>{selectedRecipeDetail.title}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{selectedRecipeDetail.desc}</p>

            <div style={{ height: '220px', backgroundImage: `url('${selectedRecipeDetail.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px', marginBottom: '1.5rem' }}></div>

            <h4 style={{ color: '#059669', marginBottom: '0.5rem' }}>🥕 Nguyên liệu cần chuẩn bị:</h4>
            <ul style={{ paddingLeft: '1.25rem', color: '#334155', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              {selectedRecipeDetail.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>

            <h4 style={{ color: '#059669', marginBottom: '0.5rem' }}>👨‍🍳 Các bước thực hiện:</h4>
            <ol style={{ paddingLeft: '1.25rem', color: '#334155', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {selectedRecipeDetail.steps.map((st, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{st}</li>
              ))}
            </ol>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="secondary" onClick={() => setSelectedRecipeDetail(null)}>Đóng</Button>
              <Button onClick={() => { setSelectedRecipeDetail(null); onNavigate && onNavigate('register'); }}>
                Đăng ký để lưu công thức (WF01)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL WF06: XEM CHI TIẾT VIDEO HƯỚNG DẪN NẤU ĂN */}
      {/* ======================================================= */}
      {selectedVideoDetail && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '650px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setSelectedVideoDetail(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span className="badge badge-ai">CHI TIẾT VIDEO (WF06)</span>
            <h2 style={{ color: '#0f172a', margin: '0.75rem 0 0.5rem 0' }}>{selectedVideoDetail.title}</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{selectedVideoDetail.author} • Thời lượng: {selectedVideoDetail.time}</p>

            {/* Video Player Box Mockup */}
            <div style={{ height: '240px', background: '#0f172a', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1.5rem', position: 'relative' }}>
              <div style={{ width: '60px', height: '60px', background: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(5,150,105,0.4)' }}>
                <Play fill="white" size={24} color="white" />
              </div>
              <span style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>Đang phát chế độ công khai (Khách vãng lai)</span>
            </div>

            <h4 style={{ color: '#059669', marginBottom: '0.5rem' }}>🤖 AI Tóm tắt chi tiết các bước nấu:</h4>
            <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '12px', borderLeft: '4px solid #10b981', marginBottom: '1.5rem' }}>
              <ul style={{ paddingLeft: '1rem', color: '#065f46', lineHeight: '1.6' }}>
                {selectedVideoDetail.details?.map((dt, idx) => (
                  <li key={idx} style={{ marginBottom: '0.4rem' }}>{dt}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="secondary" onClick={() => setSelectedVideoDetail(null)}>Đóng</Button>
              <Button onClick={() => { setSelectedVideoDetail(null); onNavigate && onNavigate('register'); }}>
                Đăng ký để bình luận & lưu video (WF01)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
