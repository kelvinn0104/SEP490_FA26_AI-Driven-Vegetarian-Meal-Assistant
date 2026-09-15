import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Camera, Utensils, Video, MapPin, 
  Search, ArrowRight, CheckCircle2, Star, Play, Heart, Share2, 
  Flame, Leaf, Award, ShieldCheck, ChevronRight, X, Clock, Eye, BookOpen,
  Smartphone, Plus, RotateCw, Activity, HeartPulse, FileText, Check, AlertCircle, ChefHat
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export default function HomePage({ onNavigate }) {
  const { user } = useAuth();

  // Luôn đảm bảo khi mở Trang chủ thì vị trí cuộn ở đỉnh trang (0, 0)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const [selectedDay, setSelectedDay] = useState('T3');
  const [searchQuery, setSearchQuery] = useState('');
  
  // MODAL STATES FOR WORKFLOW WF06 (Xem chi tiết blog/công thức & xem chi tiết video)
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [selectedVideoDetail, setSelectedVideoDetail] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState(['r1']);
  const [mealSwapToast, setMealSwapToast] = useState('');

  const mealPlannerDays = [
    { id: 'T2', label: 'T2', date: '17' },
    { id: 'T3', label: 'T3 HÔM NAY', date: '18' },
    { id: 'T4', label: 'T4', date: '19' },
    { id: 'T5', label: 'T5', date: '20' },
    { id: 'T6', label: 'T6', date: '21' },
    { id: 'T7', label: 'T7', date: '22' },
    { id: 'CN', label: 'CN', date: '23' },
  ];

  // DỮ LIỆU THỰC ĐƠN CỦA HỘI VIÊN (AUTHORIZED USER TODAY'S PLAN)
  const [todayMeals, setTodayMeals] = useState([
    {
      id: 'm1',
      slot: 'BUỔI SÁNG (07:00)',
      title: 'Smoothie Đậu Yến Mạch & Hạt Chia',
      desc: 'Bổ sung chất xơ hòa tan, protein thực vật và omega-3 từ hạt chia giúp tỉnh táo cả ngày.',
      protein: '18g Protein',
      calories: '380 kcal',
      iron: '4.2mg Sắt',
      status: 'completed', // completed, current, upcoming
      statusLabel: 'Đã nạp ✅',
      time: '15 phút',
      img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80',
      bg: '#ecfdf5',
      color: '#047857'
    },
    {
      id: 'm2',
      slot: 'BUỔI TRƯA (12:00)',
      title: 'Poke Quinoa Tempeh Sốt Teriyaki',
      desc: 'Cơm trộn hạt Diêm Mạch (Quinoa) kết hợp Tempeh đậu nành lên men áp chảo và bơ sáp tươi.',
      protein: '25g Protein',
      calories: '510 kcal',
      iron: '7.8mg Sắt',
      status: 'current',
      statusLabel: 'Bữa trưa hiện tại 🍽️',
      time: '25 phút',
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      bg: '#eff6ff',
      color: '#1d4ed8'
    },
    {
      id: 'm3',
      slot: 'BUỔI TỐI (19:00)',
      title: 'Canh Nấm Thực Dưỡng Củ Sen & Đậu Phụ Hấp',
      desc: 'Nước dùng thanh ngọt hầm từ củ sen, hạt sen, táo đỏ và nấm đùi gà non giàu kẽm tự nhiên.',
      protein: '16g Protein',
      calories: '420 kcal',
      iron: '5.6mg Sắt',
      status: 'upcoming',
      statusLabel: 'Kế hoạch tối 🕒',
      time: '30 phút',
      img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
      bg: '#fff7ed',
      color: '#c2410c'
    },
    {
      id: 'm4',
      slot: 'BỮA PHỤ (15:30)',
      title: 'Crispy Tofu Roll Bơ & Chà Là',
      desc: 'Đậu hũ nướng giòn cuốn bánh tráng kèm sốt bơ đậu nành thanh mát, bù năng lượng giữa giờ.',
      protein: '12g Protein',
      calories: '210 kcal',
      iron: '2.8mg Sắt',
      status: 'upcoming',
      statusLabel: 'Kế hoạch 🕒',
      time: '10 phút',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
      bg: '#fef2f2',
      color: '#b91c1c'
    }
  ]);

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
    },
    {
      id: 'r3',
      title: 'Top 5 Nguồn Protein Thuần Chay Giúp Tăng Cơ Khỏe Mạnh',
      desc: 'Khám phá các nguồn đạm thực vật hoàn chỉnh từ Tempeh, Đậu gà, Quinoa & Hạt gai dầu giúp xây dựng cơ bắp săn chắc.',
      protein: '28g Protein/ngày',
      calories: 'Chuyên gia dinh dưỡng',
      iron: 'Giàu vi chất',
      balance: '95% Khoa học',
      time: '6 phút đọc',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      ingredients: ['Tempeh đậu nành lên men', 'Đậu gà ngâm nở', 'Hạt Quinoa hữu cơ', 'Hạt gai dầu (Hemp Seeds)'],
      steps: [
        'Bước 1: Hiểu về amino acid thiết yếu và cách kết hợp họ đậu cùng ngũ cốc nguyên cám.',
        'Bước 2: Phân bổ 20-25g protein cho mỗi bữa ăn chính để cơ bắp phục hồi đều đặn.',
        'Bước 3: Bổ sung hạt béo và rau lá xanh đậm để tăng khả năng tổng hợp vi chất.'
      ]
    }
  ];

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

  // ĐỔI MÓN VỚI AI CHO AUTHORIZED USER
  const handleSwapMeal = (mealId) => {
    setMealSwapToast('AI đang tính toán món thay thế cân bằng dinh dưỡng tương đương...');
    setTimeout(() => {
      setTodayMeals(prev => prev.map(m => {
        if (m.id === mealId) {
          return {
            ...m,
            title: m.id === 'm2' ? 'Cơm Gạo Lứt Cà Rốt Áp Chảo Đậu Hũ & Nấm Mối' : 'Salad Diêm Mạch Đậu Gà Sốt Chanh Mè',
            desc: 'Món ăn thay thế tự động đảm bảo mức Protein 24g và dưới 520 kcal tương đương.',
            protein: '24g Protein'
          };
        }
        return m;
      }));
      setMealSwapToast('✅ AI đã đổi món thành công! Dinh dưỡng vẫn cân bằng 100%.');
      setTimeout(() => setMealSwapToast(''), 3500);
    }, 800);
  };

  const toggleSaveRecipe = (recipeId) => {
    if (savedRecipes.includes(recipeId)) {
      setSavedRecipes(savedRecipes.filter(id => id !== recipeId));
    } else {
      setSavedRecipes([...savedRecipes, recipeId]);
    }
  };

  // =========================================================================
  // GIAO DIỆN HOME DÀNH CHO AUTHORIZED USER (SAU KHI ĐĂNG NHẬP THÀNH CÔNG)
  // =========================================================================
  if (user) {
    return (
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '1.75rem 1.5rem 4rem 1.5rem' }}>
        
        {/* TOAST THÔNG BÁO ĐỔI MÓN AI */}
        {mealSwapToast && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            background: '#047857',
            color: 'white',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 1500,
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <Sparkles size={18} />
            <span>{mealSwapToast}</span>
          </div>
        )}

        {/* 1. HERO BANNER CHÀO MỪNG HỘI VIÊN & LỐI TẮT NHANH */}
        <section style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          borderRadius: '24px',
          padding: '2.25rem',
          color: 'white',
          marginBottom: '2rem',
          boxShadow: '0 12px 30px rgba(5, 150, 105, 0.18)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.22)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.3px' }}>
                  🌱 HỘI VIÊN VEGGIEAI
                </span>
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Thực đơn Tuần 38 đã tối ưu
                </span>
              </div>

              <h1 style={{ fontSize: '2.15rem', fontWeight: 800, margin: '0.35rem 0 0.5rem 0', letterSpacing: '-0.5px' }}>
                Chào mừng trở lại, {user.name || 'Thành Viên Thuần Chay'}! 🌿
              </h1>

              <p style={{ opacity: 0.92, fontSize: '0.96rem', lineHeight: 1.6, maxWidth: '620px', margin: 0 }}>
                Hôm nay là <strong>Thứ Ba, 18 Tháng 9</strong>. Kế hoạch dinh dưỡng của bạn đã hoàn tất với hàm lượng Protein và Sắt hữu cơ tối ưu theo thể trạng cá nhân.
              </p>
            </div>

            {/* QUICK ACTIONS BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: '220px' }}>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('planner')}
                style={{
                  background: '#ffffff',
                  color: '#047857',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '0.8rem 1.25rem',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Utensils size={18} />
                <span>Thực đơn của tôi (7 ngày)</span>
              </button>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('chatbot')}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.18)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Sparkles size={15} />
                  <span>Hỏi AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('user-posts')}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.18)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <FileText size={15} />
                  <span>Bài viết</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. KHỐI TỔNG QUAN HỒ SƠ SỨC KHỎE & THƯỚC ĐO DINH DƯỠNG HÔM NAY (4 CARDS) */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-ai" style={{ marginBottom: '0.25rem' }}>THEO DÕI THỂ TRẠNG</span>
              <h2 style={{ fontSize: '1.45rem', color: '#0f172a', margin: '0.2rem 0 0 0', fontWeight: 800 }}>
                Chỉ Số Sức Khỏe & Tiến Độ Dinh Dưỡng Hôm Nay
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => onNavigate && onNavigate('user-profile')}
                style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                Hồ sơ sức khỏe của tôi →
              </button>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <button 
                onClick={() => onNavigate && onNavigate('user-nutrition')}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                Dashboard dinh dưỡng đầy đủ →
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Card 1: BMI */}
            <Card style={{ padding: '1.35rem', borderLeft: '4px solid #059669', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('user-profile')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>CHỈ SỐ THỂ TRẠNG (BMI)</span>
                <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>
                  Chuẩn lý tưởng
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                21.4 <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>kg/m²</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                Chiều cao: 1m68 • Cân nặng: 60.5 kg. Mục tiêu: Duy trì thể trạng và tăng cơ nạc thực vật.
              </p>
            </Card>

            {/* Card 2: Calo */}
            <Card style={{ padding: '1.35rem', borderLeft: '4px solid #3b82f6', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('user-nutrition')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>NĂNG LƯỢNG (CALO)</span>
                <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>
                  Đạt 73%
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                1,350 <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>/ 1,850 kcal</span>
              </div>
              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', margin: '0.4rem 0' }}>
                <div style={{ width: '73%', height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                Còn lại <strong>500 kcal</strong> cho Bữa tối & Bữa phụ.
              </p>
            </Card>

            {/* Card 3: Protein */}
            <Card style={{ padding: '1.35rem', borderLeft: '4px solid #10b981', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('user-nutrition')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>ĐẠM THỰC VẬT (PROTEIN)</span>
                <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>
                  Đạt 80%
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                52g <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>/ 65g mục tiêu</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', margin: '0.4rem 0' }}>
                <div style={{ width: '80%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                Nguồn chính hôm nay: Đậu gà, Tempeh nướng sốt, Quinoa.
              </p>
            </Card>

            {/* Card 4: Sắt & B12 */}
            <Card style={{ padding: '1.35rem', borderLeft: '4px solid #d97706', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('user-nutrition')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>VI CHẤT (SẮT & B12)</span>
                <span style={{ background: '#fffbeb', color: '#d97706', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>
                  88% Khuyến nghị
                </span>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                12.8mg <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Sắt • 2.2 mcg B12</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#b45309', margin: '0.4rem 0 0 0', lineHeight: 1.45 }}>
                💡 Gợi ý AI: Bữa tối kèm nước chanh hoặc ớt chuông để hấp thu sắt tối đa.
              </p>
            </Card>
          </div>
        </section>

        {/* 3. KHỐI THỰC ĐƠN HÔM NAY CỦA BẠN (TODAY'S AI MEAL PLAN) */}
        <section style={{ marginBottom: '2.75rem' }}>
          <Card style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-ai">THỰC ĐƠN CÁ NHÂN HÓA</span>
                <h2 style={{ fontSize: '1.65rem', color: '#0f172a', margin: '0.35rem 0 0.2rem 0', fontWeight: 800 }}>
                  Thực Đơn Hôm Nay Của Bạn (Thứ Ba, 18 Tháng 9)
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                  Thực đơn 4 bữa được AI Meal Planner tối ưu tự động dựa trên chỉ số BMI và kiêng cữ của bạn.
                </p>
              </div>

              <Button onClick={() => onNavigate && onNavigate('planner')}>
                <Utensils size={16} /> Mở toàn bộ Thực đơn tuần 7 ngày →
              </Button>
            </div>

            {/* Days bar */}
            <div className="meal-days-bar" style={{ marginBottom: '1.5rem' }}>
              {mealPlannerDays.map(day => (
                <div 
                  key={day.id} 
                  className={`day-tab ${selectedDay === day.id ? 'active' : ''}`}
                  onClick={() => setSelectedDay(day.id)}
                >
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{day.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{day.date}</div>
                </div>
              ))}
            </div>

            {/* 4 MEAL CARDS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {todayMeals.map((meal) => (
                <div 
                  key={meal.id} 
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: meal.status === 'current' ? '2px solid #059669' : '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: meal.status === 'current' ? '0 8px 25px rgba(5, 150, 105, 0.12)' : '0 2px 10px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ height: '150px', backgroundImage: `url('${meal.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: meal.bg, color: meal.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {meal.slot}
                    </span>
                    <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(15,23,42,0.85)', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                      ⏱️ {meal.time}
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: meal.status === 'completed' ? '#ecfdf5' : meal.status === 'current' ? '#eff6ff' : '#f8fafc',
                        color: meal.status === 'completed' ? '#047857' : meal.status === 'current' ? '#1d4ed8' : '#64748b',
                        marginBottom: '0.4rem'
                      }}>
                        {meal.statusLabel}
                      </span>
                      <h4 style={{ color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.4, margin: '0.2rem 0' }}>
                        {meal.title}
                      </h4>
                    </div>

                    <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                      {meal.desc}
                    </p>

                    <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.78rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {meal.protein}
                      </span>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px' }}>
                        🔥 {meal.calories}
                      </span>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px' }}>
                        {meal.iron}
                      </span>
                    </div>

                    {/* ACTION BUTTONS: ĐỔI MÓN AI & XEM CÁCH NẤU */}
                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSwapMeal(meal.id)}
                        style={{
                          flex: 1,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.45rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#475569',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                        title="AI đổi món khác có dinh dưỡng tương đương"
                      >
                        <RotateCw size={13} /> Đổi món AI
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRecipeDetail(publicRecipes[0])}
                        style={{
                          flex: 1,
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          borderRadius: '8px',
                          padding: '0.45rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#047857',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Eye size={13} /> Công thức
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 4. KHỐI BÀI VIẾT & HOẠT ĐỘNG CỘNG ĐỒNG CỦA TÔI (MY POSTS & CONTRIBUTIONS) */}
        <section style={{ marginBottom: '2.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-ai">ĐÓNG GÓP CỦA TÔI</span>
              <h2 style={{ fontSize: '1.45rem', color: '#0f172a', margin: '0.2rem 0 0 0', fontWeight: 800 }}>
                Bài Viết & Công Thức Bạn Đang Chia Sẻ
              </h2>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => onNavigate && onNavigate('user-posts')}>
                Quản lý bài viết của tôi →
              </Button>
              <Button variant="primary" onClick={() => onNavigate && onNavigate('user-posts')}>
                <Plus size={16} /> Viết bài chia sẻ mới ✍️
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Post 1: Pending Mod approval */}
            <Card style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundImage: `url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80')`,
                backgroundSize: 'cover',
                borderRadius: '10px',
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> Đang chờ Mod duyệt
                </span>
                <h4 style={{ color: '#0f172a', fontSize: '0.95rem', margin: '0.35rem 0', lineHeight: 1.35 }}>
                  Bí quyết tự ủ Tempeh đậu nành truyền thống tại nhà chuẩn vị
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gửi lúc 13:45 hôm nay • Kiểm duyệt viên: Lê Tuệ Tâm</span>
              </div>
            </Card>

            {/* Post 2: Published */}
            <Card style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundImage: `url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80')`,
                backgroundSize: 'cover',
                borderRadius: '10px',
                flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={12} /> Đã xuất bản
                </span>
                <h4 style={{ color: '#0f172a', fontSize: '0.95rem', margin: '0.35rem 0', lineHeight: 1.35 }}>
                  Salad Cải Xoăn Nấm Hầu Thủ Sốt Mè Rang Giàu Đạm
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>420 lượt đọc • 38 yêu thích • 12 bình luận</span>
              </div>
            </Card>
          </div>
        </section>

        {/* 5. KHỐI GỢI Ý CÔNG THỨC & VIDEO DÀNH RIÊNG CHO BẠN (RECOMMENDED FOR YOU) */}
        <section style={{ marginBottom: '2.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-ai">ĐỀ XUẤT CHO BẠN</span>
              <h2 style={{ fontSize: '1.45rem', color: '#0f172a', margin: '0.2rem 0 0 0', fontWeight: 800 }}>
                Gợi Ý Món Chay & Video Nấu Ăn Phù Hợp Thể Trạng
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                Các món ăn bổ sung đạm và sắt được chọn lọc tự động phù hợp với hồ sơ thể trạng của bạn.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => onNavigate && onNavigate('blog')}>
                Xem Blog công thức →
              </Button>
              <Button variant="secondary" onClick={() => onNavigate && onNavigate('videos')}>
                Xem Video nấu ăn →
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {publicRecipes.map((recipe) => (
              <Card key={recipe.id} style={{ padding: 0, overflow: 'hidden' }}>
                <div 
                  style={{ height: '180px', backgroundImage: `url('${recipe.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', cursor: 'pointer' }}
                  onClick={() => setSelectedRecipeDetail(recipe)}
                >
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.92)', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {recipe.time}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleSaveRecipe(recipe.id); }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(255,255,255,0.92)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: savedRecipes.includes(recipe.id) ? '#ef4444' : '#64748b'
                    }}
                    title={savedRecipes.includes(recipe.id) ? 'Bỏ lưu' : 'Lưu công thức'}
                  >
                    <Heart size={16} fill={savedRecipes.includes(recipe.id) ? '#ef4444' : 'none'} />
                  </button>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <h4 style={{ color: '#0f172a', marginBottom: '0.35rem', fontSize: '1.05rem', lineHeight: 1.4, cursor: 'pointer' }} onClick={() => setSelectedRecipeDetail(recipe)}>
                    {recipe.title}
                  </h4>
                  <p style={{ fontSize: '0.83rem', color: '#64748b', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                    {recipe.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span className="nutrition-pill" style={{ background: '#ecfdf5', color: '#047857' }}>{recipe.protein}</span>
                    <span className="nutrition-pill" style={{ background: '#eff6ff', color: '#1d4ed8' }}>{recipe.iron}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <span 
                      style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      onClick={() => setSelectedRecipeDetail(recipe)}
                    >
                      <Eye size={15} /> Xem chi tiết cách nấu →
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 6. KHỐI QUÉT TỦ LẠNH NHẬN DIỆN NGUYÊN LIỆU (YOLOV8) TRÊN APP DI ĐỘNG */}
        <section className="vision-showcase" style={{ borderRadius: '24px', overflow: 'hidden' }}>
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
            <span className="badge badge-ai" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 700 }}>
              TIỆN ÍCH TRÊN ỨNG DỤNG DI ĐỘNG
            </span>
            <h2 style={{ fontSize: '1.85rem', color: '#0f172a', margin: '0.5rem 0' }}>Quét Tủ Lạnh, Nấu Ngon Liền Tay</h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.65', marginBottom: '1.25rem' }}>
              Chụp ảnh ngăn tủ lạnh qua camera điện thoại, mô hình YOLOv8 sẽ tự động nhận diện nguyên liệu sẵn có và đề xuất món ăn phù hợp ngay trong tích tắc.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <CheckCircle2 color="#059669" size={18} />
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>Tự động kiểm tra độ tươi và hạn sử dụng của rau củ</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <CheckCircle2 color="#059669" size={18} />
                <span style={{ fontSize: '0.9rem', color: '#334155' }}>Đề xuất món chay tận dụng triệt để nguyên liệu còn thừa</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="app-download-btn"
                onClick={() => alert('Ứng dụng VeggieAI trên App Store (iOS) đang chuẩn bị phát hành. Vui lòng đón chờ!')}
              >
                <Smartphone size={18} className="app-btn-icon" />
                <div className="app-btn-text">
                  <span className="app-btn-sub">Tải trên</span>
                  <span className="app-btn-main">App Store</span>
                </div>
              </button>

              <button 
                type="button" 
                className="app-download-btn"
                onClick={() => alert('Ứng dụng VeggieAI trên Google Play (Android) đang chuẩn bị phát hành. Vui lòng đón chờ!')}
              >
                <span className="google-play-icon">▶</span>
                <div className="app-btn-text">
                  <span className="app-btn-sub">Có sẵn trên</span>
                  <span className="app-btn-main">Google Play</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* MODAL CHI TIẾT CÔNG THỨC (CHO AUTHORIZED USER: CÓ NÚT LƯU VÀO THỰC ĐƠN, KHÔNG BỊ BẮT ĐĂNG KÝ) */}
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

              <span className="badge badge-success">CHI TIẾT CÔNG THỨC</span>
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
                <Button onClick={() => {
                  toggleSaveRecipe(selectedRecipeDetail.id);
                  alert('Đã lưu món ăn vào cẩm nang công thức yêu thích của bạn!');
                  setSelectedRecipeDetail(null);
                }}>
                  <Heart size={16} fill="white" /> {savedRecipes.includes(selectedRecipeDetail.id) ? 'Đã lưu yêu thích' : 'Lưu vào yêu thích'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // GIAO DIỆN HOME DÀNH CHO GUEST (CHƯA ĐĂNG NHẬP / KHÁCH VÃNG LAI)
  // =========================================================================
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
                placeholder="Tìm kiếm công thức, video nấu chay, mẹo dinh dưỡng..."
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

        {/* HERO FEATURED RECIPE CARD */}
        <div className="featured-card">
          <div 
            className="featured-img-wrapper"
            style={{ backgroundImage: `url('${publicRecipes[0].img}')` }}
          >
            <div className="featured-img-overlay">Công thức nổi bật</div>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>CÔNG THỨC NỔI BẬT</span>
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
              <Eye size={16} /> Xem chi tiết công thức & cách nấu →
            </Button>
          </div>
        </div>
      </section>

      {/* 3 TÍNH NĂNG ĐỘT PHÁ */}
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
            <h3 style={{ margin: '0.5rem 0', color: '#0f172a' }}>Blog & Video Nấu Ăn AI</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Khám phá các bài viết dinh dưỡng chuyên sâu và video nấu chay được AI tóm tắt ngắn gọn thành các bước dễ làm, hoàn toàn miễn phí.
            </p>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem' }}>
              <span 
                style={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }} 
                onClick={() => onNavigate && onNavigate('blog')}
              >
                Đọc Blog →
              </span>
              <span 
                style={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }} 
                onClick={() => onNavigate && onNavigate('videos')}
              >
                Xem Video →
              </span>
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
              Thiết lập hồ sơ dinh dưỡng →
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Camera size={26} />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700 }}>TÍNH NĂNG 3</span>
            <h3 style={{ margin: '0.5rem 0', color: '#0f172a' }}>Quét Tủ Lạnh Nhận Diện Nguyên Liệu (Trên App)</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Mô hình Computer Vision YOLOv8 nhận diện rau củ qua ảnh chụp tủ lạnh, đánh giá độ tươi và gợi ý món ăn chống lãng phí ngay trên ứng dụng di động.
            </p>
            <div 
              style={{ marginTop: '1.25rem', color: '#d97706', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} 
              onClick={() => {
                const el = document.getElementById('vision-showcase-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Tải App để trải nghiệm →
            </div>
          </div>
        </div>
      </section>

      {/* MỤC 1: BÀI VIẾT & BLOG CÔNG THỨC */}
      <section id="blog-section" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>BÀI VIẾT & BLOG</span>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '0.35rem 0 0 0' }}>Blog Dinh Dưỡng & Công Thức Nấu Ăn</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Đọc các bài viết khoa học và công thức món chay chi tiết hoàn toàn công khai.</p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate && onNavigate('blog')}>
            Xem tất cả bài viết Blog →
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {publicRecipes.map((recipe) => (
            <Card key={recipe.id} style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelectedRecipeDetail(recipe)}>
              <div style={{ height: '200px', backgroundImage: `url('${recipe.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.92)', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {recipe.time}
                </span>
              </div>
              <div style={{ padding: '1.35rem' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '0.4rem', fontSize: '1.1rem', lineHeight: '1.4' }}>{recipe.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.5' }}>{recipe.desc}</p>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span className="nutrition-pill" style={{ background: '#ecfdf5', color: '#047857' }}>{recipe.protein}</span>
                  <span className="nutrition-pill" style={{ background: '#eff6ff', color: '#1d4ed8' }}>{recipe.balance}</span>
                </div>
                <div style={{ color: '#059669', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Eye size={16} /> Đọc bài viết & xem cách nấu →
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* MỤC 2: VIDEO NẤU ĂN CÔNG KHAI & TÓM TẮT AI 30 GIÂY */}
      <section id="videos-section" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>VIDEO NẤU ĂN</span>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '0.35rem 0 0 0' }}>Video Hướng Dẫn Nấu Ăn Tích Hợp AI Tóm Tắt</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Xem video trực quan cùng các bước tóm tắt tự động bởi AI trong 30 giây.</p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate && onNavigate('videos')}>
            Xem tất cả video nấu ăn →
          </Button>
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
                  <Eye size={16} /> Bấm để xem chi tiết video →
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
              <Sparkles size={16} /> Đăng ký để tạo thực đơn riêng
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
            {todayMeals.map((meal, idx) => (
              <div key={idx} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ height: '140px', backgroundImage: `url('${meal.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: meal.bg, color: meal.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {meal.slot}
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

      {/* MÔ PHỎNG COMPUTER VISION (SHOWCASE - CHỈ CÓ TRÊN ỨNG DỤNG DI ĐỘNG) */}
      <section className="vision-showcase" id="vision-showcase-section">
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
          <span className="badge badge-ai" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 700 }}>
            CHỈ CÓ TRÊN ỨNG DỤNG DI ĐỘNG
          </span>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0.5rem 0' }}>Quét Tủ Lạnh, Nấu Ngon Liền Tay</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
            AI sẽ tự động nhận diện nguyên liệu trong tủ lạnh và đề xuất công thức nấu ăn thích hợp. Tính năng này được tích hợp độc quyền trên ứng dụng di động để bạn dễ dàng chụp ảnh và cập nhật tủ lạnh mọi lúc mọi nơi.
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

          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Smartphone size={18} color="#059669" />
              <span>Tải App ngay:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="app-download-btn"
                onClick={() => alert('Ứng dụng VeggieAI trên App Store (iOS) đang chuẩn bị phát hành. Vui lòng đón chờ!')}
              >
                <Smartphone size={20} className="app-btn-icon" />
                <div className="app-btn-text">
                  <span className="app-btn-sub">Tải trên</span>
                  <span className="app-btn-main">App Store</span>
                </div>
              </button>

              <button 
                type="button" 
                className="app-download-btn"
                onClick={() => alert('Ứng dụng VeggieAI trên Google Play (Android) đang chuẩn bị phát hành. Vui lòng đón chờ!')}
              >
                <span className="google-play-icon">▶</span>
                <div className="app-btn-text">
                  <span className="app-btn-sub">Có sẵn trên</span>
                  <span className="app-btn-main">Google Play</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER: BẮT ĐẦU QUY TRÌNH ĐĂNG KÝ / THIẾT LẬP HỒ SƠ DINH DƯỠNG */}
      <section className="cta-banner">
        <h2>Sẵn Sàng Cho Lối Sống Ăn Chay Khoa Học Và Tràn Đầy Sinh Khí?</h2>
        <p style={{ opacity: 0.9, maxWidth: '640px', margin: '0 auto 2rem auto', fontSize: '1.05rem', lineHeight: '1.65' }}>
          Gia nhập VeggieAI ngay hôm nay để thiết lập hồ sơ dinh dưỡng cá nhân, nhận thực đơn cân bằng và hỏi đáp không giới hạn cùng Hỏi AI.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button style={{ background: 'white', color: '#047857', fontSize: '1rem', padding: '0.85rem 1.75rem' }} onClick={() => onNavigate && onNavigate('register')}>
            🚀 Bắt đầu quy trình đăng ký & khảo sát dinh dưỡng
          </Button>
        </div>
      </section>

      {/* MODAL: XEM CHI TIẾT BÀI VIẾT / CÔNG THỨC CHO GUEST */}
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

            <span className="badge badge-success">CHI TIẾT CÔNG THỨC</span>
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
                Đăng ký để lưu công thức
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XEM CHI TIẾT VIDEO CHO GUEST */}
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

            <span className="badge badge-ai">CHI TIẾT VIDEO</span>
            <h2 style={{ color: '#0f172a', margin: '0.75rem 0 0.5rem 0' }}>{selectedVideoDetail.title}</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{selectedVideoDetail.author} • Thời lượng: {selectedVideoDetail.time}</p>

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
                Đăng ký để bình luận & lưu video
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
