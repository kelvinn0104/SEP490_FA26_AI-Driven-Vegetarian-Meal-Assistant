import React, { useState } from 'react';
import { 
  Sparkles, Camera, Utensils, MessageSquare, Video, MapPin, 
  Search, ArrowRight, CheckCircle2, Star, Play, Heart, Share2, 
  Flame, Leaf, Award, ShieldCheck, ChevronRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function HomePage({ onNavigate }) {
  const [selectedDay, setSelectedDay] = useState('T2');
  const [searchPrompt, setSearchPrompt] = useState('');

  const mealPlannerDays = [
    { id: 'T2', label: 'T2 HÔM NAY', date: '17' },
    { id: 'T3', label: 'T3', date: '18' },
    { id: 'T4', label: 'T4', date: '19' },
    { id: 'T5', label: 'T5', date: '20' },
    { id: 'T6', label: 'T6', date: '21' },
    { id: 'T7', label: 'T7', date: '22' },
    { id: 'CN', label: 'CN', date: '23' },
  ];

  const dailyMeals = {
    T2: [
      { type: 'BUỔI SÁNG', tag: 'Sáng', title: 'Smoothie Đậu Yến Mạch & Hạt Chia', protein: '18g Protein', time: '15 phút', icon: '🥤', bg: '#ecfdf5', color: '#047857' },
      { type: 'BUỔI TRƯA', tag: 'Trưa', title: 'Poke Quinoa Tempeh Sốt Teriyaki', protein: '25g Protein', time: '25 phút', icon: '🥗', bg: '#eff6ff', color: '#1d4ed8' },
      { type: 'BUỔI TỐI', tag: 'Tối', title: 'Canh Nấm Thực Dưỡng Củ Sen', protein: '15g Protein', time: '30 phút', icon: '🍲', bg: '#fff7ed', color: '#c2410c' },
      { type: 'BỮA PHỤ', tag: 'Phụ', title: 'Crispy Tofu Roll Bơ & Chà Là', protein: '12g Protein', time: '10 phút', icon: '🥑', bg: '#fef2f2', color: '#b91c1c' },
    ]
  };

  const videoRecipes = [
    {
      title: 'Lẩu Nấm Chay Bách Hỷ Chuẩn Vị Thanh Ngọt Thảo Mộc',
      author: 'Chef Minh Tú • 120k lượt xem',
      time: '18:24',
      summary: '1. Hầm nước dùng củ sen & hạt sen 15 phút. 2. Cho nấm đùi gà, nấm kim châm & đậu hũ non. 3. Thêm táo đỏ & kỷ tử.',
      thumbnail: '🍲'
    },
    {
      title: 'Ram Chay Giòn Rụm Không Dầu Nướng Bằng Nồi Chiên',
      author: 'VeggieKitchen • 85k lượt xem',
      time: '12:05',
      summary: '1. Trộn miến, khoai môn, nấm mèo & đậu hũ. 2. Cuốn bánh tráng rắc mè. 3. Nướng nồi chiên 180°C trong 15 phút.',
      thumbnail: '🌯'
    },
    {
      title: 'Cà Rốt Xào Nấm Nước Cốt Dừa Béo Thanh Đậm Đà',
      author: 'GreenGourmet • 210k lượt xem',
      time: '10:45',
      summary: '1. Sơ chế cà rốt cắt lát & nấm hương tươi. 2. Phi thơm hành tăm & cho nước cốt dừa. 3. Đun nhỏ lửa 8 phút.',
      thumbnail: '🥘'
    }
  ];

  const restaurants = [
    {
      name: 'Quán Chay An Duyên - Vị Hoa',
      rating: '4.8 ★ (320+)',
      distance: '📍 1.2 km • Quận 5, TP.HCM',
      desc: 'Không gian ấm cúng, chuyên các món chay chuẩn vị Triều Châu và lẩu nấm dưỡng sinh.',
      tag: '🔥 Giảm 15% đặt bàn AI'
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

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div>
          <span className="badge badge-ai">
            <Sparkles size={14} /> Trí tuệ nhân tạo cá nhân hóa thực đơn ăn chay
          </span>
          
          <h1 className="hero-title">
            Ăn Chay Lành Mạnh, <span>Cân Bằng Dinh Dưỡng</span> Cùng Trí Tuệ Nhân Tạo
          </h1>

          <p className="hero-subtitle">
            VeggieAI giải quyết 3 rào cản lớn nhất của người ăn chay: thiếu hụt vi chất (Protein, Sắt, B12, Omega-3), nhàm chán món ăn và lãng phí thực phẩm.
          </p>

          <div className="prompt-box">
            <div className="prompt-input-row">
              <input
                type="text"
                className="prompt-input"
                placeholder="Cho ví dụ: Nhập nguyên liệu có sẵn trong tủ lạnh (vd: Đậu hũ, nấm, cà rốt)..."
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
              />
              <Button onClick={() => onNavigate && onNavigate('planner')}>
                <Sparkles size={18} /> Gợi ý thực đơn ngay
              </Button>
            </div>

            <div className="tag-pills">
              <span className="tag-pill" onClick={() => onNavigate && onNavigate('planner')}>⚡ Thực đơn nhanh 15 phút</span>
              <span className="tag-pill" onClick={() => onNavigate && onNavigate('planner')}>🥦 Tăng cường Protein Chay</span>
              <span className="tag-pill" onClick={() => onNavigate && onNavigate('planner')}>🥗 Món ngon chống ngấy</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', color: '#f59e0b' }}>
              <Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" /><Star size={16} fill="#f59e0b" />
            </div>
            <strong>4.9/5</strong> (Hơn 5,000+ người ăn chay tin dùng mỗi ngày)
          </div>
        </div>

        {/* HERO FEATURED RECIPE CARD */}
        <div className="featured-card">
          <div className="featured-img-wrapper">
            🍲
            <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
              AI Recommend
            </span>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>MÓN NGON NỔI BẬT HÔM NAY</span>
            <h3 style={{ color: '#0f172a', margin: '0.35rem 0' }}>Cà Rốt Nấu Nước Cốt Dừa & Nấm Hương</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Món ngon thuần chay béo thanh, giàu Vitamin A, sắt thực vật & chất xơ hòa tan.</p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="nutrition-pill" style={{ background: '#ecfdf5', color: '#047857' }}>21g Protein</span>
              <span className="nutrition-pill" style={{ background: '#eff6ff', color: '#1d4ed8' }}>9.2mg Sắt</span>
              <span className="nutrition-pill" style={{ background: '#fef3c7', color: '#b45309' }}>84% Cân bằng</span>
            </div>

            <Button variant="secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate && onNavigate('planner')}>
              Xem công thức & phân tích dinh dưỡng →
            </Button>
          </div>
        </div>
      </section>

      {/* 3 BREAKTHROUGH FEATURES SECTION */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="section-title-box">
          <span className="badge badge-ai" style={{ marginBottom: '0.5rem' }}>HỆ SINH THÁI TÍNH NĂNG</span>
          <h2>3 Tính Năng Đột Phá Của VeggieAI</h2>
          <p>Ứng dụng nền tảng Trí tuệ Nhân tạo giúp người ăn chay dễ dàng theo đuổi lối sống lành mạnh, khoa học và chống lãng phí.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Utensils size={26} />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>TÍNH NĂNG NỔI BẬT 1</span>
            <h3 style={{ margin: '0.5rem 0', color: '#0f172a' }}>Đa Dạng Món & Tránh Nhàm Chán</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Hệ thống Generative AI gợi ý công thức mới liên tục dựa trên khẩu vị, thói quen và nguyên liệu sẵn có, chấm dứt tình trạng quanh quẩn một số món quen thuộc.
            </p>
            <div style={{ marginTop: '1.25rem', color: '#059669', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => onNavigate && onNavigate('planner')}>
              Khám phá Generator Engine →
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Award size={26} />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>TÍNH NĂNG NỔI BẬT 2</span>
            <h3 style={{ margin: '0.5rem 0', color: '#0f172a' }}>Cân Bằng Dinh Dưỡng Khoa Học</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Tự động tính toán theo chỉ số BMI, vi chất quan trọng (Protein, Sắt, B12, Omega-3). Sử dụng thuật toán Quy hoạch tuyến tính (PuLP) để tối ưu khẩu phần.
            </p>
            <div style={{ marginTop: '1.25rem', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => onNavigate && onNavigate('planner')}>
              Phân tích BMI & Vi chất →
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Camera size={26} />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700 }}>TÍNH NĂNG NỔI BẬT 3</span>
            <h3 style={{ margin: '0.5rem 0', color: '#0f172a' }}>Quét & Nhận Diện Nguyên Liệu</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Cho phép chụp ảnh nguyên liệu trong tủ lạnh. Mô hình Computer Vision (YOLOv8) tự động nhận diện, đánh giá độ tươi và gợi ý ngay công thức chống lãng phí.
            </p>
            <div style={{ marginTop: '1.25rem', color: '#d97706', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => onNavigate && onNavigate('vision')}>
              Dùng thử Vision Scanner →
            </div>
          </div>
        </div>
      </section>

      {/* WEEKLY MEAL PLANNER PREVIEW */}
      <section style={{ marginBottom: '3.5rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-ai">THỰC ĐƠN MẪU TUẦN NÀY</span>
              <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginTop: '0.35rem' }}>Trải Nghiệm Thực Đơn Tuần AI Cá Nhân Hóa</h2>
            </div>
            <Button onClick={() => onNavigate && onNavigate('planner')}>
              <Sparkles size={16} /> Tạo thực đơn riêng của bạn
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {dailyMeals[selectedDay]?.map((meal, idx) => (
              <div key={idx} style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', borderTop: `4px solid ${meal.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: meal.color }}>{meal.type}</span>
                  <span style={{ fontSize: '1.5rem' }}>{meal.icon}</span>
                </div>

                <h4 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>{meal.title}</h4>

                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <span style={{ background: meal.bg, color: meal.color, padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>{meal.protein}</span>
                  <span style={{ padding: '0.2rem 0.5rem', background: '#e2e8f0', borderRadius: '6px' }}>⏱️ {meal.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* FRIDGE SCANNER SHOWCASE (COMPUTER VISION) */}
      <section className="vision-showcase">
        <div style={{ background: '#0f172a', borderRadius: '16px', padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            YOLOv8 Detection Engine
          </div>

          <h3 style={{ color: '#34d399', marginBottom: '1rem' }}>📸 Khung ảnh quét nguyên liệu</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>AI tự động gắn nhãn bounding box & phân tích độ tươi:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between' }}>
              <span>🥦 Đậu hũ non & Cà rốt tươi</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>Độ tươi: 95%</span>
            </div>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', borderLeft: '4px solid #f59e0b', display: 'flex', justifyContent: 'space-between' }}>
              <span>🍄 Nấm hương tươi</span>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>Nên dùng trong 2 ngày</span>
            </div>
          </div>
        </div>

        <div>
          <span className="badge badge-ai">COMPUTER VISION ENGINE</span>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0.5rem 0' }}>Quét Tủ Lạnh, Nấu Ngon Liền Tay</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Chụp ảnh tủ lạnh của bạn ngay lập tức. AI sẽ tự động phân tích độ tươi, nhận diện nguyên liệu hiện có và gợi ý ngay danh sách món ăn thích hợp để tránh lãng phí thực phẩm.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
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

          <Button onClick={() => onNavigate && onNavigate('vision')}>
            <Camera size={18} /> Tải ảnh tủ lạnh để quét nguyên liệu ngay
          </Button>
        </div>
      </section>

      {/* AI VIDEO SUMMARIZER SECTION */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="section-title-box">
          <span className="badge badge-ai">WHISPER STT + SUMMARIZATION</span>
          <h2>Video Nấu Ăn Tích Hợp AI Tóm Tắt Trong 30 Giây</h2>
          <p>Không cần xem hết 20 phút video nấu ăn. AI Speech-to-Text chuyển video thành các bước dạng văn bản ngắn gọn.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {videoRecipes.map((video, idx) => (
            <Card key={idx} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '180px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', position: 'relative', fontSize: '3.5rem' }}>
                {video.thumbnail}
                <div style={{ position: 'absolute', background: 'rgba(5, 150, 105, 0.9)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play fill="white" size={20} />
                </div>
                <span style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>{video.time}</span>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '0.35rem' }}>{video.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>{video.author}</p>

                <div style={{ padding: '0.75rem', background: '#ecfdf5', borderRadius: '10px', fontSize: '0.85rem', color: '#047857', borderLeft: '3px solid #10b981' }}>
                  <strong>🤖 AI Tóm tắt các bước:</strong>
                  <p style={{ marginTop: '0.25rem' }}>{video.summary}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* VEGAN RESTAURANTS MAP SHOWCASE */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-ai">BẢN ĐỒ ĐỊA ĐIỂM CHAY</span>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginTop: '0.35rem' }}>Quán Chay Được Đánh Giá Cao Gần Bạn</h2>
          </div>
          <span style={{ fontSize: '0.9rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={16} color="#059669" /> Đang hiển thị ở: <strong>Quận 1, TP. Hồ Chí Minh</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {restaurants.map((res, idx) => (
            <Card key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-success">{res.tag}</span>
                <span style={{ color: '#d97706', fontWeight: 800, fontSize: '0.9rem' }}>{res.rating}</span>
              </div>

              <h3 style={{ color: '#0f172a', margin: '0.75rem 0 0.35rem 0' }}>{res.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, marginBottom: '0.5rem' }}>{res.distance}</p>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.5' }}>{res.desc}</p>

              <Button variant="secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate && onNavigate('community')}>
                Xem menu & Đặt bàn ngay →
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <h2>Sẵn Sàng Cho Lối Sống Ăn Chay Khoa Học Và Tràn Đầy Sinh Khí?</h2>
        <p style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1.05rem' }}>
          Hãy để VeggieAI đồng hành cùng bạn tạo thực đơn AI cân bằng dinh dưỡng, quét tủ lạnh tiết kiệm chi phí và khám phá thế giới thuần chay phong phú.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button style={{ background: 'white', color: '#047857', fontSize: '1rem', padding: '0.85rem 1.75rem' }} onClick={() => onNavigate && onNavigate('planner')}>
            🚀 Đăng ký tài khoản miễn phí ngay
          </Button>
          <Button variant="secondary" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', fontSize: '1rem' }} onClick={() => onNavigate && onNavigate('community')}>
            📖 Khám phá công thức & Bản đồ
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginBottom: '0.75rem' }}>🥦 VeggieAI</div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.6' }}>
              Trợ lý ăn chay thông minh hàng đầu Việt Nam, giúp tối ưu hóa dinh dưỡng và tiết kiệm thời gian chế biến bằng Trí tuệ Nhân tạo.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>KHÁM PHÁ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
              <span>Thực đơn AI tuần</span>
              <span>Quét tủ lạnh YOLO</span>
              <span>Chatbot dinh dưỡng RAG</span>
              <span>Bản đồ quán chay</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>DÀNH CHO CỘNG ĐỒNG</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
              <span>Đăng bài viết & Video</span>
              <span>Kiểm duyệt viên (Mod)</span>
              <span>Hướng dẫn sử dụng</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>TẢI ỨNG DỤNG</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Trải nghiệm ứng dụng di động trên iOS & Android</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge badge-ai">📱 App Store</span>
              <span className="badge badge-ai">🤖 Google Play</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
          © 2026 VeggieAI. Đồ án Tốt nghiệp SEP490 - Trường Đại học FPT HCM.
        </div>
      </footer>
    </div>
  );
}
