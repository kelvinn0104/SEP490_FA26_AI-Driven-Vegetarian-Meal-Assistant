import React, { useState, useEffect } from 'react';
import { 
  Utensils, Sparkles, Clock, RotateCw, Calendar, 
  Share2, FileText, CheckCircle2, ChevronRight, Search, 
  Plus, Download, Check, X, Info, ExternalLink, ChefHat, 
  ShoppingCart, BookOpen, Heart, Eye, ArrowRight, MessageSquare
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export default function MealPlannerPage({ onNavigate }) {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // TAB CHỌN NGÀY TRONG TUẦN
  const [selectedDay, setSelectedDay] = useState('t3');

  // DANH SÁCH 7 NGÀY TRONG TUẦN
  const weekDays = [
    { id: 't2', label: 'Thứ 2', date: '21/10', calories: '2.010 kcal', status: 'completed', statusLabel: '✓ Đã hoàn thành' },
    { id: 't3', label: 'Thứ 3 (Hôm nay)', date: '22/10', calories: '2.080 kcal', status: 'current', statusLabel: 'Đang tiến hành' },
    { id: 't4', label: 'Thứ 4', date: '23/10', calories: '2.090 kcal', status: 'upcoming', statusLabel: 'Kế hoạch' },
    { id: 't5', label: 'Thứ 5', date: '24/10', calories: '2.110 kcal', status: 'upcoming', statusLabel: 'Kế hoạch' },
    { id: 't6', label: 'Thứ 6', date: '25/10', calories: '2.020 kcal', status: 'upcoming', statusLabel: 'Kế hoạch' },
    { id: 't7', label: 'Thứ 7', date: '26/10', calories: '1.990 kcal', status: 'upcoming', statusLabel: 'Kế hoạch' },
    { id: 'cn', label: 'Chủ Nhật', date: '27/10', calories: '2.150 kcal', status: 'weekend', statusLabel: 'Lẩu Chay Cuối tuần' }
  ];

  // THỰC ĐƠN 4 BỮA CHO NGÀY ĐANG CHỌN (MẶC ĐỊNH LÀ THỨ 3 HÔM NAY)
  const [dayMeals, setDayMeals] = useState({
    t3: [
      {
        id: 'm1',
        slot: 'Bữa sáng',
        timeRange: '07:00 – 08:30',
        prepTime: 'Chuẩn bị: 10 phút',
        badge: '✓ Đã hoàn thành',
        badgeType: 'completed',
        title: 'Buddha Bowl Đậu Hũ Áp Chảo & Quinoa rau củ',
        protein: '22g Protein',
        calories: '390 kcal',
        fiber: '12g Xơ',
        noteType: 'note',
        note: 'Ghi chú AI: Cân bằng vitamin B-complex cho ngày làm việc năng động và tập trung cao độ.',
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        ingredients: [
          'Đậu hũ non hữu cơ: 150g (áp chảo vàng giòn không dầu)',
          'Hạt Quinoa (Diêm mạch) nấu chín: 1 chén',
          'Bơ sáp 034 thái lát: 1/2 quả',
          'Bắp cải tím, cà rốt bào sợi, edamame luộc: 100g',
          'Sốt mè rang thuần chay: 2 thìa canh'
        ],
        steps: [
          'Áp chảo đậu hũ cắt khối vuông với 1 muỗng dầu ô liu và xíu muối hồng.',
          'Xếp cơm Quinoa ấm dưới đáy bát sâu lòng.',
          'Bày đậu hũ, bơ sáp, bắp cải tím và cà rốt bào xung quanh.',
          'Rưới sốt mè rang và rắc hạt chia lên trên để thưởng thức.'
        ]
      },
      {
        id: 'm2',
        slot: 'Bữa trưa',
        timeRange: '11:30 – 13:00',
        prepTime: 'Chuẩn bị: 25 phút',
        badge: '● Tiếp theo',
        badgeType: 'current',
        title: 'Cà ri bí đỏ cốt dừa hạt sen đậu gà kèm cơm gạo lứt',
        protein: '28g Protein',
        calories: '620 kcal',
        fiber: '15g Xơ',
        noteType: 'tip',
        note: 'Gợi ý AI: Nguồn đạm hoàn chỉnh kết hợp giữa đậu gà và hạt sen giúp no lâu, tránh tụt đường huyết đầu giờ chiều.',
        img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
        ingredients: [
          'Đậu gà ngâm nở ninh mềm: 150g',
          'Bí đỏ hạt đậu Nhật cắt khúc: 150g',
          'Hạt sen tươi Huế: 60g',
          'Nước cốt dừa nguyên chất: 120ml',
          'Bột cà ri chay, lá boa-rô, sả đập dập',
          'Cơm gạo lứt huyết rồng ăn kèm: 1 chén'
        ],
        steps: [
          'Phi thơm sả và lá boa-rô với chút dầu dừa, cho bột cà ri vào xào dậy mùi.',
          'Cho bí đỏ, hạt sen và nước dùng rau củ vào hầm trong 15 phút đến khi bí mềm.',
          'Thêm đậu gà đã ninh và rót nước cốt dừa vào khuấy đều nhẹ tay.',
          'Nêm muối biển và hạt nêm nấm hữu cơ, đun sôi liu riu thêm 3 phút rồi tắt bếp.'
        ]
      },
      {
        id: 'm3',
        slot: 'Bữa phụ / Snack',
        timeRange: '15:30 – 16:00',
        prepTime: 'Chuẩn bị: 5 phút',
        badge: 'Sắp tới',
        badgeType: 'upcoming',
        title: 'Smoothie Bowl cải xoăn kale, chuối và hạt chia',
        protein: '10g Protein',
        calories: '210 kcal',
        fiber: '7g Xơ',
        noteType: 'tip',
        note: 'Gợi ý AI: Cung cấp kali, chất diệp lục và omega-3 lành mạnh tái tạo năng lượng tức thì mà không gây đầy bụng.',
        img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
        ingredients: [
          'Lá cải xoăn Kale tươi: 50g',
          'Chuối Laba Đà Lạt đông lạnh: 1 quả',
          'Sữa hạnh nhân không đường: 100ml',
          'Hạt chia hữu cơ: 1 thìa canh',
          'Quả kiwi thái lát và hạt bí xanh rắc mặt'
        ],
        steps: [
          'Cho cải xoăn, chuối đông lạnh và sữa hạnh nhân vào máy xay sinh tố xay mịn.',
          'Rót sinh tố sánh mịn ra bát sâu lòng.',
          'Xếp kiwi cắt lát, rắc hạt chia và hạt bí xanh lên mặt rồi thưởng thức ngay.'
        ]
      },
      {
        id: 'm4',
        slot: 'Bữa tối',
        timeRange: '18:30 – 20:00',
        prepTime: 'Chuẩn bị: 20 phút',
        badge: 'Sắp tới',
        badgeType: 'upcoming',
        title: 'Canh nấm rong biển hạt sen & Đậu hũ sốt nấm đông cô',
        protein: '24g Protein',
        calories: '460 kcal',
        fiber: '9g Xơ',
        noteType: 'tip',
        note: 'Gợi ý AI: Bữa tối thanh nhiệt, giàu khoáng chất (Magie và I-ốt từ rong biển) giúp an thần và hỗ trợ giấc ngủ sâu.',
        img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
        ingredients: [
          'Rong biển wakame khô ngâm nở: 20g',
          'Nấm đông cô tươi và nấm kim châm: 120g',
          'Đậu hũ non mềm: 1 hộp',
          'Hạt sen tươi: 50g',
          'Dầu mè nguyên chất, gừng thái chỉ, ngò rí'
        ],
        steps: [
          'Nấu sôi nước dùng từ củ cải trắng và hạt sen trong 10 phút.',
          'Thả rong biển và nấm kim châm vào, nêm muối hầm và chút gừng tươi ấm bụng.',
          'Đậu hũ non hấp nóng, rưới sốt nấm đông cô dầu hào chay ăn kèm canh thanh mát.'
        ]
      }
    ]
  });

  // STATE MODALS
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [swapModalMeal, setSwapModalMeal] = useState(null);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // STATE TIẾN ĐỘ TUÂN THỦ (CHECKBOX ĐÃ ĂN HÔM NAY)
  const [eatenBreakfast, setEatenBreakfast] = useState(true);

  // DANH SÁCH MÓN ĐI CHỢ ĐÃ ĐƯỢC TÍCH CHỌN
  const [checkedItems, setCheckedItems] = useState({
    'cai-xoan': false,
    'bi-do': false,
    'nam-dong-co': true,
    'dau-ga': true,
    'hat-sen': false,
    'quinoa': false
  });

  const toggleCheckItem = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // DANH SÁCH GỢI Ý ĐỔI MÓN VỚI AI
  const swapOptions = [
    {
      title: 'Tô cơm Quinoa Tempeh nướng sốt mè rang',
      protein: '26g Protein',
      calories: '590 kcal',
      reason: 'Tương đương 100% về Protein và bổ sung thêm men vi sinh từ Tempeh.'
    },
    {
      title: 'Salad Diêm Mạch Đậu Gà Sốt Bơ Hạnh Nhân',
      protein: '27g Protein',
      calories: '610 kcal',
      reason: 'Giàu axit béo Omega-3 và chất chống oxy hóa, chuẩn bị nhanh trong 15 phút.'
    },
    {
      title: 'Cơm Gạo Lứt Cà Tím Hầm Nấm Hầu Thủ',
      protein: '25g Protein',
      calories: '580 kcal',
      reason: 'Thanh đạm, bổ tỳ vị, bảo đảm không chứa ngũ vị tân.'
    }
  ];

  const handleApplySwap = (newDish) => {
    if (swapModalMeal) {
      setDayMeals(prev => ({
        ...prev,
        t3: prev.t3.map(m => m.id === swapModalMeal.id ? {
          ...m,
          title: newDish.title,
          protein: newDish.protein,
          calories: newDish.calories,
          note: `Gợi ý AI: Đã đổi món sang ${newDish.title} theo yêu cầu. Dinh dưỡng vẫn đạt chuẩn RNI 2024.`
        } : m)
      }));
      setSwapModalMeal(null);
      setToastMessage(`✅ Đã đổi sang món "${newDish.title}" thành công!`);
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '1.75rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        
        {/* TOAST THÔNG BÁO */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            background: '#047857',
            color: 'white',
            padding: '0.85rem 1.4rem',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            zIndex: 2000,
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. TOP HEADER ROW: TIÊU ĐỀ & NÚT HÀNH ĐỘNG */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '2.15rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                Thực đơn của tôi
              </h1>
              <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#059669' }} />
                Tuần hiện tại
              </span>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              Thực đơn tuần 21/10 – 27/10/2026 • 🌿 <strong>Đã đồng bộ hồ sơ:</strong> Thuần chay, Kiêng ngũ vị tân
            </p>
          </div>

          {/* TOP RIGHT ACTION BUTTONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '0.6rem 1.15rem',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <Calendar size={16} color="#64748b" />
              <span>Lịch sử thực đơn</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNewPlanModal(true)}
              style={{
                background: '#046a47',
                border: 'none',
                color: '#ffffff',
                padding: '0.62rem 1.35rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 14px rgba(4, 106, 71, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={16} />
              <span>Tạo thực đơn mới</span>
            </button>
          </div>
        </div>

        {/* 2. CARD: BẢNG PHÂN TÍCH DINH DƯỠNG TUẦN VEGGIENUTRI AI */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Utensils size={18} />
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Bảng phân tích dinh dưỡng tuần VeggieNutri AI
              </h2>
            </div>

            <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: '8px', fontWeight: 800 }}>
              Khuyến nghị RNI 2024
            </span>
          </div>

          {/* 4 MACRO BOXES + 1 GAUGE CIRCLE GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 1.2fr', gap: '1.25rem', alignItems: 'center' }}>
            
            {/* Box 1: Tổng năng lượng */}
            <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                TỔNG NĂNG LƯỢNG TB/NGÀY
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                2.080 <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>kcal/ngày</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>🎯 92% mục tiêu TDEE (2.250 kcal)</span>
              </div>
            </div>

            {/* Box 2: Đạm thực vật */}
            <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                ĐẠM THỰC VẬT
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                84 <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>g/ngày</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.5rem' }}>
                Chiếm 16% tổng năng lượng
              </div>
            </div>

            {/* Box 3: Carb phức hợp */}
            <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                CARB PHỨC HỢP
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                260 <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>g/ngày</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.5rem' }}>
                50% từ gạo lứt, diêm mạch, khoai lang
              </div>
            </div>

            {/* Box 4: Chất béo tốt & Chất xơ */}
            <div style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                CHẤT BÉO TỐT & CHẤT XƠ
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                38g <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>/ 62g Fat</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.5rem' }}>
                Dầu mè, hạt điều, dầu đậu phộng
              </div>
            </div>

            {/* Box 5: Vòng tròn tối ưu 98.6% */}
            <div style={{
              background: '#f0fdf4',
              borderRadius: '16px',
              border: '1px solid #bbf7d0',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '5px solid #059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.15rem',
                color: '#047857',
                background: 'white',
                flexShrink: 0
              }}>
                98.6%
              </div>

              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
                  Mức chuẩn dinh dưỡng
                </div>
                <div style={{ fontSize: '0.76rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                  <CheckCircle2 size={14} />
                  <span>Đạt chuẩn Viện Dinh Dưỡng & RNI 2024</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. LỊCH ĂN TUẦN NÀY & 7 NGÀY SELECTOR */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                Lịch ăn tuần này
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                Chọn ngày để xem và tùy chỉnh công thức 4 bữa ăn mỗi ngày
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.45rem 1rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>👥 Khẩu phần: 1 Người lớn</span>
            </div>
          </div>

          {/* 7 DAYS HORIZONTAL TABS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {weekDays.map((day) => {
              const isActive = selectedDay === day.id;
              return (
                <div
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  style={{
                    background: isActive ? '#046a47' : '#ffffff',
                    color: isActive ? '#ffffff' : '#0f172a',
                    borderRadius: '16px',
                    padding: '1rem 0.75rem',
                    textAlign: 'center',
                    border: isActive ? '2px solid #046a47' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 8px 20px rgba(4, 106, 71, 0.25)' : '0 2px 6px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', opacity: isActive ? 0.9 : 0.7, marginBottom: '0.35rem', fontWeight: 600 }}>
                    {day.label}
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    {day.date}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: isActive ? 0.9 : 0.85, color: isActive ? '#ecfdf5' : '#059669' }}>
                    {day.statusLabel}
                  </div>
                  <div style={{ fontSize: '0.68rem', opacity: isActive ? 0.8 : 0.5, marginTop: '0.2rem' }}>
                    {day.calories}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4 CARDS BỮA ĂN TRONG NGÀY (GRID 2x2) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {(dayMeals.t3 || []).map((meal) => (
              <div 
                key={meal.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: meal.badgeType === 'current' ? '2px solid #059669' : '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: meal.badgeType === 'current' ? '0 10px 25px rgba(5, 150, 105, 0.12)' : '0 4px 15px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* TOP IMAGE & BADGE ROW */}
                <div style={{ position: 'relative', height: '210px', backgroundImage: `url('${meal.img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ background: 'rgba(15, 23, 42, 0.85)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {meal.slot} • {meal.timeRange}
                    </span>
                    <span style={{ background: 'rgba(255, 255, 255, 0.92)', color: '#0f172a', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                      ⏱️ {meal.prepTime}
                    </span>
                  </div>

                  <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    <span style={{
                      background: meal.badgeType === 'completed' ? '#ecfdf5' : meal.badgeType === 'current' ? '#ffedd5' : '#f1f5f9',
                      color: meal.badgeType === 'completed' ? '#047857' : meal.badgeType === 'current' ? '#c2410c' : '#475569',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {meal.badge}
                    </span>
                  </div>
                </div>

                {/* CONTENT BODY */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.65rem 0', lineHeight: 1.4 }}>
                    {meal.title}
                  </h3>

                  {/* 3 PILLS DINH DƯỠNG */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {meal.protein}
                    </span>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {meal.calories}
                    </span>
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {meal.fiber}
                    </span>
                  </div>

                  {/* GHI CHÚ / GỢI Ý TỪ AI */}
                  <div style={{
                    background: '#f0fdf4',
                    borderLeft: '4px solid #059669',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.82rem',
                    color: '#065f46',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                    flex: 1
                  }}>
                    {meal.note}
                  </div>

                  {/* ACTION BUTTONS: XEM CÔNG THỨC & HỎI AI */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* Nút Xem công thức */}
                      <button
                        type="button"
                        onClick={() => setSelectedRecipeDetail(meal)}
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#047857',
                          borderRadius: '10px',
                          padding: '0.5rem 0.95rem',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Eye size={15} />
                        <span>Xem công thức</span>
                      </button>

                      {/* Icon đổi món AI */}
                      <button
                        type="button"
                        onClick={() => setSwapModalMeal(meal)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          borderRadius: '10px',
                          padding: '0.5rem 0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Đổi món ăn này bằng AI"
                      >
                        <RotateCw size={15} />
                      </button>
                    </div>

                    {/* Nút Hỏi AI */}
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('chatbot')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#059669',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Sparkles size={15} />
                      <span>Hỏi AI</span>
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. KHỐI 2 CỘT DƯỚI: SỔ TAY ĐI CHỢ & TIẾN ĐỘ TUÂN THỦ TUẦN */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', marginBottom: '2.5rem', alignItems: 'start' }}>
          
          {/* CỘT TRÁI: SỔ TAY ĐI CHỢ (TẠO TỪ THỰC ĐƠN) */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} color="#059669" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Sổ tay đi chợ (tạo từ thực đơn)
                </h3>
              </div>

              <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '10px', fontWeight: 800 }}>
                14 món cần mua
              </span>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              Đã tự động tính toán tổng khối lượng đậu hũ, rau củ hữu cơ, các loại hạt và gia vị thuần chay cần thiết cho 21 bữa ăn trong tuần.
            </p>

            {/* 4 BOXES CATEGORIES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {/* Box 1 */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  <span>🥬 Rau củ hữu cơ</span>
                  <span style={{ color: '#059669' }}>5 món</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                  Cải xoăn kale, bí đỏ hồ lô, nấm đông cô, củ sen...
                </div>
              </div>

              {/* Box 2 */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  <span>🥜 Các loại đậu & Hạt</span>
                  <span style={{ color: '#059669' }}>4 món</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                  Đậu gà hữu cơ, hạt sen Huế, quinoa, hạt chia...
                </div>
              </div>

              {/* Box 3 */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  <span>🧂 Gia vị & Đồ khô</span>
                  <span style={{ color: '#059669' }}>3 món</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                  Cốt dừa ép, rong biển nấu canh, dầu ô liu...
                </div>
              </div>

              {/* Box 4 */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  <span>🍎 Trái cây tươi</span>
                  <span style={{ color: '#059669' }}>2 món</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                  Chuối Laba Đà Lạt, quả bơ sáp 034...
                </div>
              </div>
            </div>

            {/* BUTTONS SỔ TAY ĐI CHỢ */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => alert('Đã chuẩn bị bản in PDF & liên kết chia sẻ Sổ tay đi chợ của bạn!')}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Download size={15} />
                <span>Xuất PDF / Chia sẻ</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMarketModal(true)}
                style={{
                  flex: 1.2,
                  background: '#046a47',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(4, 106, 71, 0.2)'
                }}
              >
                <ShoppingCart size={15} />
                <span>Xem danh sách chi tiết</span>
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: TIẾN ĐỘ TUÂN THỦ TUẦN (CHU KỲ 7 NGÀY) */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} color="#059669" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Tiến độ tuân thủ tuần
                </h3>
              </div>

              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Chu kỳ 7 ngày
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0.75rem 0' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
                12 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ 21 bữa</span>
              </div>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#059669' }}>
                57% Hoàn thành
              </span>
            </div>

            {/* TIẾN TRÌNH CÁC CHẤM TRÒN */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                <div key={i} style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#059669' }} />
              ))}
              {[13, 14, 15, 16, 17, 18, 19, 20, 21].map(i => (
                <div key={i} style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#e2e8f0' }} />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              <span>Thứ 2 (3/3)</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>Thứ 3 (Đang ăn)</span>
              <span>Cuối tuần</span>
            </div>

            {/* CHECKBOX: ĐÃ ĂN ĐỦ 2 BỮA SÁNG HÔM NAY */}
            <label 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: eatenBreakfast ? '#f0fdf4' : '#f8fafc',
                border: eatenBreakfast ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '1rem',
                transition: 'all 0.15s ease'
              }}
            >
              <input 
                type="checkbox"
                checked={eatenBreakfast}
                onChange={(e) => {
                  setEatenBreakfast(e.target.checked);
                  setToastMessage(e.target.checked ? '✅ Đã ghi nhận bữa ăn thành công!' : 'Đã hủy đánh dấu bữa ăn.');
                  setTimeout(() => setToastMessage(''), 2500);
                }}
                style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                Đánh dấu: Đã ăn đủ 2 bữa sáng hôm nay
              </span>
            </label>

            {/* NÚT GHI NHẬN MÓN TỰ NẤU KHÁC */}
            <button
              type="button"
              onClick={() => alert('Chức năng Ghi nhận món ăn tự nấu: Bạn có thể nhập nhanh món tự chế biến để AI tự động bù trừ Calo và vi chất.')}
              style={{
                width: '100%',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                padding: '0.65rem',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Utensils size={15} />
              <span>Ghi nhận món tự nấu khác</span>
            </button>
          </div>

        </section>

        {/* 5. KHỐI CUỐI TRANG: LỜI MỜI TẠO THỰC ĐƠN CHO TUẦN TIẾP THEO (ĐÃ SỬA THEO ĐÚNG NHẬN XÉT) */}
        <section style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
          borderRadius: '24px',
          border: '1px solid #a7f3d0',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(5, 150, 105, 0.06)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#ffffff',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
          }}>
            <Utensils size={26} />
          </div>

          <span style={{ fontSize: '0.8rem', background: '#d1fae5', color: '#047857', padding: '3px 12px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Trải nghiệm tính năng
          </span>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.65rem 0 0.4rem 0' }}>
            Bạn muốn lên kế hoạch thực đơn cho tuần sau?
          </h2>

          <p style={{ color: '#475569', fontSize: '0.92rem', maxWidth: '580px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
            Hãy để VeggieAI sáng tạo thực đơn cá nhân hóa cho tuần tới dựa trên hồ sơ thể trạng và sở thích của bạn chỉ trong 30 giây.
          </p>

          <button
            type="button"
            onClick={() => setShowNewPlanModal(true)}
            style={{
              background: '#046a47',
              border: 'none',
              color: '#ffffff',
              padding: '0.85rem 1.75rem',
              borderRadius: '14px',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 16px rgba(4, 106, 71, 0.3)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Sparkles size={18} />
            <span>Tạo thực đơn cho tuần sau với AI</span>
          </button>
        </section>

        {/* ========================================================================= */}
        {/* MODAL 1: XEM CHI TIẾT CÔNG THỨC */}
        {/* ========================================================================= */}
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

              <span className="badge badge-success">CÔNG THỨC MÓN ĂN</span>
              <h2 style={{ color: '#0f172a', margin: '0.75rem 0 0.35rem 0' }}>{selectedRecipeDetail.title}</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                {selectedRecipeDetail.slot} • {selectedRecipeDetail.prepTime} • {selectedRecipeDetail.protein} • {selectedRecipeDetail.calories}
              </p>

              <div style={{ height: '220px', backgroundImage: `url('${selectedRecipeDetail.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px', marginBottom: '1.5rem' }}></div>

              <h4 style={{ color: '#059669', marginBottom: '0.5rem' }}>🥕 Nguyên liệu định lượng:</h4>
              <ul style={{ paddingLeft: '1.25rem', color: '#334155', marginBottom: '1.25rem', lineHeight: '1.6', fontSize: '0.88rem' }}>
                {selectedRecipeDetail.ingredients?.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>

              <h4 style={{ color: '#059669', marginBottom: '0.5rem' }}>👨‍🍳 Các bước nấu ăn chi tiết:</h4>
              <ol style={{ paddingLeft: '1.25rem', color: '#334155', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.88rem' }}>
                {selectedRecipeDetail.steps?.map((st, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>{st}</li>
                ))}
              </ol>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <Button variant="secondary" onClick={() => setSelectedRecipeDetail(null)}>Đóng</Button>
                <Button onClick={() => {
                  setSelectedRecipeDetail(null);
                  setToastMessage('❤️ Đã lưu công thức vào cẩm nang yêu thích của bạn!');
                  setTimeout(() => setToastMessage(''), 2500);
                }}>
                  <Heart size={16} fill="white" /> Lưu vào cẩm nang
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: ĐỔI MÓN VỚI AI (SWAP MEAL) */}
        {/* ========================================================================= */}
        {swapModalMeal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
          }}>
            <div style={{
              background: 'white', borderRadius: '24px', maxWidth: '620px', width: '100%', maxHeight: '90vh',
              overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
              <button 
                onClick={() => setSwapModalMeal(null)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>

              <span className="badge badge-ai">ĐỔI MÓN THÔNG MINH BẰNG AI</span>
              <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.35rem 0' }}>Gợi Ý Món Ăn Thay Thế Tương Đương</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Đang thay thế cho món: <strong>{swapModalMeal.title}</strong> ({swapModalMeal.protein} • {swapModalMeal.calories})
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {swapOptions.map((opt, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleApplySwap(opt)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '1.15rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.background = '#f0fdf4'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <h4 style={{ color: '#0f172a', fontSize: '1rem', margin: 0 }}>{opt.title}</h4>
                      <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {opt.protein}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.45rem' }}>
                      🔥 {opt.calories}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                      💡 {opt.reason}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={() => setSwapModalMeal(null)}>Đóng</Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: SỔ TAY ĐI CHỢ CHI TIẾT */}
        {/* ========================================================================= */}
        {showMarketModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
          }}>
            <div style={{
              background: 'white', borderRadius: '24px', maxWidth: '640px', width: '100%', maxHeight: '90vh',
              overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
              <button 
                onClick={() => setShowMarketModal(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>

              <span className="badge badge-success">DANH SÁCH ĐI CHỢ</span>
              <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.35rem 0' }}>Sổ Tay Nguyên Liệu Tuần Này</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Tích chọn các món đã mua trong siêu thị hoặc chợ để dễ dàng theo dõi.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { id: 'cai-xoan', name: 'Cải xoăn Kale hữu cơ', amount: '500g', cat: 'Rau củ' },
                  { id: 'bi-do', name: 'Bí đỏ hạt đậu Nhật', amount: '1 quả (800g)', cat: 'Rau củ' },
                  { id: 'nam-dong-co', name: 'Nấm đông cô tươi', amount: '300g', cat: 'Rau củ' },
                  { id: 'dau-ga', name: 'Đậu gà hữu cơ ngâm nở', amount: '500g', cat: 'Đậu & Hạt' },
                  { id: 'hat-sen', name: 'Hạt sen tươi Huế', amount: '200g', cat: 'Đậu & Hạt' },
                  { id: 'quinoa', name: 'Hạt Quinoa (Diêm mạch) 3 màu', amount: '1 túi 500g', cat: 'Đậu & Hạt' }
                ].map(item => (
                  <label 
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      background: checkedItems[item.id] ? '#f1f5f9' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <input 
                        type="checkbox"
                        checked={checkedItems[item.id] || false}
                        onChange={() => toggleCheckItem(item.id)}
                        style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: checkedItems[item.id] ? '#94a3b8' : '#0f172a', textDecoration: checkedItems[item.id] ? 'line-through' : 'none', fontWeight: 600 }}>
                        {item.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.amount}</span>
                      <span style={{ fontSize: '0.72rem', background: '#f8fafc', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>{item.cat}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowMarketModal(false)}>Đóng</Button>
                <Button onClick={() => {
                  setShowMarketModal(false);
                  alert('Đã đồng bộ danh sách đi chợ vào ứng dụng di động!');
                }}>
                  Lưu danh sách
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: LỊCH SỬ THỰC ĐƠN CÁC TUẦN TRƯỚC */}
        {/* ========================================================================= */}
        {showHistoryModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
          }}>
            <div style={{
              background: 'white', borderRadius: '24px', maxWidth: '620px', width: '100%', maxHeight: '90vh',
              overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
              <button 
                onClick={() => setShowHistoryModal(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>

              <span className="badge badge-ai">LƯU TRỮ DINH DƯỠNG</span>
              <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.35rem 0' }}>Lịch Sử Thực Đơn Các Tuần Trước</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Xem lại hoặc áp dụng lại thực đơn của các tuần trước.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {[
                  { title: 'Tuần 14/10 – 20/10/2026', desc: 'Thực đơn Tăng Cơ Nạc • 82g Protein/ngày • Đạt 96%', mealsCount: '21/21 bữa hoàn thành' },
                  { title: 'Tuần 07/10 – 13/10/2026', desc: 'Thực đơn Thanh Lọc & Bổ Sung Sắt • 18mg Sắt Non-heme/ngày', mealsCount: '20/21 bữa hoàn thành' },
                  { title: 'Tuần 30/09 – 06/10/2026', desc: 'Thực đơn Thuần Chay Dễ Tiêu Hóa • Giảm mỡ nội tạng', mealsCount: '19/21 bữa hoàn thành' }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h4 style={{ color: '#0f172a', fontSize: '0.95rem', margin: '0 0 0.25rem 0' }}>{item.title}</h4>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 0.2rem 0' }}>{item.desc}</p>
                      <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>{item.mealsCount}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHistoryModal(false);
                        setToastMessage(`Đã áp dụng thực đơn "${item.title}"!`);
                        setTimeout(() => setToastMessage(''), 2500);
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#059669',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Áp dụng lại
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Đóng</Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 5: TẠO THỰC ĐƠN TUẦN MỚI */}
        {/* ========================================================================= */}
        {showNewPlanModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
          }}>
            <div style={{
              background: 'white', borderRadius: '24px', maxWidth: '640px', width: '100%', maxHeight: '90vh',
              overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
              <button 
                onClick={() => setShowNewPlanModal(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>

              <span className="badge badge-ai">TÍNH TOÁN TUẦN MỚI VỚI AI</span>
              <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.35rem 0' }}>Sáng Tạo Thực Đơn Tuần Tiếp Theo</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                AI sẽ tự động áp dụng hồ sơ thể trạng hiện tại (Thuần chay, Kiêng ngũ vị tân, mục tiêu 85g Protein/ngày).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginBottom: '1.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Tuần áp dụng
                  </label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                    <option>Tuần tới (28/10 – 03/11/2026)</option>
                    <option>Tuần hiện tại (Tạo lại từ đầu)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Nguyên liệu sẵn có muốn ưu tiên dùng
                  </label>
                  <input 
                    type="text" 
                    placeholder="VD: Đậu hũ, bí đỏ, cải thìa, hạt sen..."
                    defaultValue="Đậu hũ, nấm hương, bí đỏ, hạt quinoa"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Số bữa ăn mỗi ngày
                  </label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}>
                    <option>4 bữa (Sáng, Trưa, Phụ, Tối - Tiêu chuẩn)</option>
                    <option>3 bữa (Sáng, Trưa, Tối)</option>
                    <option>5 bữa (Dành cho vận động viên / Tăng cơ)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowNewPlanModal(false)}>Hủy</Button>
                <Button onClick={() => {
                  setShowNewPlanModal(false);
                  setToastMessage('✨ AI đã sáng tạo xong thực đơn tuần mới theo chuẩn RNI 2024!');
                  setTimeout(() => setToastMessage(''), 3500);
                }}>
                  <Sparkles size={16} /> Bắt đầu tính toán thực đơn
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
