import React, { useState, useEffect } from 'react';
import { 
  Utensils, Sparkles, Clock, RotateCw, Calendar, 
  Share2, FileText, CheckCircle2, ChevronRight, Search, 
  Plus, Download, Check, X, Info, ExternalLink, ChefHat, 
  ShoppingCart, BookOpen, Heart, Eye, ArrowRight, MessageSquare,
  Printer, Leaf, ShieldCheck, Flame, Zap, Shield, Bookmark, Play,
  TrendingUp, CheckSquare, Square, RefreshCw, AlertCircle
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

  // TAB CHỌN NGÀY TRONG TUẦN (Mặc định: Thứ 2)
  const [selectedDay, setSelectedDay] = useState('t2');
  const [savedRecipes, setSavedRecipes] = useState(['m1', 'm2']);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // DANH SÁCH 7 NGÀY TRONG TUẦN (THEO CHUẨN MOCKUP TUẦN 42)
  const weekDays = [
    { id: 't2', label: 'THỨ 2', date: '14/10', calories: '2,060 kcal', status: 'today', statusLabel: 'Hôm nay', checked: true, protein: '86g Đạm' },
    { id: 't3', label: 'THỨ 3', date: '15/10', calories: '2,090 kcal', status: 'upcoming', statusLabel: '88g Đạm', checked: false, protein: '88g Đạm' },
    { id: 't4', label: 'THỨ 4', date: '16/10', calories: '2,040 kcal', status: 'upcoming', statusLabel: '84g Đạm', checked: false, protein: '84g Đạm' },
    { id: 't5', label: 'THỨ 5', date: '17/10', calories: '2,110 kcal', status: 'upcoming', statusLabel: '90g Đạm', checked: false, protein: '90g Đạm' },
    { id: 't6', label: 'THỨ 6', date: '18/10', calories: '2,075 kcal', status: 'upcoming', statusLabel: '85g Đạm', checked: false, protein: '85g Đạm' },
    { id: 't7', label: 'THỨ 7', date: '19/10', calories: '2,150 kcal', status: 'mealprep', statusLabel: 'Meal Prep', checked: false, protein: '82g Đạm' },
    { id: 'cn', label: 'CHỦ NHẬT', date: '20/10', calories: '2,030 kcal', status: 'detox', statusLabel: 'Detox nhẹ', checked: false, protein: '78g Đạm' }
  ];

  // TRẠNG THÁI NẤU XONG CÁC BỮA ĂN (TÍCH CHỌN TIẾN ĐỘ)
  const [cookedMeals, setCookedMeals] = useState({
    m1: true,  // Bữa sáng đã hoàn thành
    m2: false, // Bữa trưa
    m3: false, // Snack chiều
    m4: false  // Bữa tối
  });

  const toggleCookedMeal = (mealId) => {
    setCookedMeals(prev => {
      const nextState = !prev[mealId];
      showToast(nextState ? '✓ Đã ghi nhận bữa ăn hoàn thành!' : 'Đã bỏ đánh dấu hoàn thành.');
      return { ...prev, [mealId]: nextState };
    });
  };

  const completedCount = Object.values(cookedMeals).filter(Boolean).length;

  // DỮ LIỆU THỰC ĐƠN CHI TIẾT 4 BỮA
  const dayMeals = [
    {
      id: 'm1',
      slot: 'Bữa Sáng',
      timeRange: '07:00 – 08:30',
      prepTime: '10 phút',
      difficulty: 'Dễ',
      title: 'Smoothie Bowl Yến Mạch, Chuối & Hạt Chia Hạnh Nhân',
      calories: '480 kcal',
      protein: '18g Protein',
      fiber: '9g Xơ',
      iron: '4.2mg Sắt',
      badge: 'Bữa Sáng',
      img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
      mainIngredients: 'Yến mạch cán dẹt (trong tủ lạnh), sữa hạt dừa không đường, chuối chín đông lạnh, hạt chia organic, vụn dừa nướng giòn rụm.',
      ingredientsList: [
        'Yến mạch cán dẹt organic: 50g (ngâm mềm 5 phút)',
        'Chuối Laba chín đông lạnh: 1 quả',
        'Sữa dừa hạt hạnh nhân không đường: 120ml',
        'Hạt chia hữu cơ: 1 muỗng canh (15g)',
        'Hạnh nhân lát nướng giòn & vụn dừa khô: 10g'
      ],
      cookingSteps: [
        'Cho chuối đông lạnh, yến mạch và sữa dừa vào cối xay sinh tố công suất cao.',
        'Xay mịn ở tốc độ vừa trong 45 giây đến khi hỗn hợp sánh mịn như kem tuyết.',
        'Rót sinh tố ra bát sâu lòng, rắc hạt chia, hạnh nhân lát và dừa sấy lên bề mặt rồi thưởng thức.'
      ],
      note: 'Ghi chú AI: Nguồn năng lượng giải phóng chậm từ yến mạch và omega-3 từ hạt chia giúp não bộ tỉnh táo, không gây cảm giác mệt mỏi đầu giờ sáng.'
    },
    {
      id: 'm2',
      slot: 'Bữa Trưa',
      timeRange: '11:30 – 13:00',
      prepTime: '25 phút',
      difficulty: 'Trung bình',
      title: 'Buddha Bowl Quinoa Đậu Hũ Áp Chảo Sốt Mè Rang & Bơ Sáp',
      calories: '720 kcal',
      protein: '32g Protein',
      fiber: '12g Xơ + 8.5mg Sắt',
      iron: '8.5mg Sắt',
      badge: 'Bữa Trưa',
      isZeroWaste: true,
      zeroWasteNote: '🌱 Món Zero-Waste: Dùng hết cải thìa & đậu hũ trong 24h',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      mainIngredients: 'Đậu hũ mơ cắt quân cờ nướng giòn không dầu, hạt quinoa nấu mềm dẻo, rau cải thìa xào sơ và bơ sáp Đắk Lắk béo ngậy sốt mè nguyên chất...',
      ingredientsList: [
        'Đậu hũ mơ tươi: 180g (ép ráo, cắt khối vuông)',
        'Hạt Quinoa trắng nấu chín: 1 chén (150g)',
        'Rau cải thìa Đà Lạt: 120g (rửa sạch cắt khúc)',
        'Bơ sáp Đắk Lắk thái lát: 1/2 quả',
        'Sốt mè rang đậu nành thủ công (không ngũ vị tân): 2 muỗng canh',
        'Dầu mè ép lạnh: 1 thìa cà phê'
      ],
      cookingSteps: [
        'Áp chảo đậu hũ với vài giọt dầu mè trên chảo chống dính hoặc nồi chiên không dầu (180°C, 12 phút) đến khi vàng giòn 4 mặt.',
        'Trần nhanh cải thìa trong nước sôi có xíu muối biển trong 45 giây rồi vớt ra ngâm nước đá giữ màu xanh biếc.',
        'Xới quinoa ấm vào tô lớn, bày đậu hũ, cải thìa, bơ lát xung quanh.',
        'Rưới đều sốt mè rang thơm bùi lên trên và thưởng thức nóng.'
      ],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      note: 'Gợi ý AI: Bữa ăn giàu đạm hoàn chỉnh giúp phục hồi cơ bắp tối ưu sau buổi tập kháng lực buổi sáng, dồi dào chất chống oxy hóa.'
    },
    {
      id: 'm3',
      slot: 'Snack Chiều',
      timeRange: '15:30 – 16:30',
      prepTime: '5 phút',
      difficulty: 'Rất dễ',
      title: 'Energy Balls Hạt Bí, Chà Là & Trà Thảo Mộc Hoa Cúc',
      calories: '220 kcal',
      protein: '8g Protein',
      fiber: '5g Xơ',
      iron: '2.1mg Sắt',
      badge: 'Snack Chiều',
      isQuickSnack: true,
      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      mainIngredients: 'Ăn liền, không cần nấu nướng. Cung cấp magie và kẽm ổn định đường huyết trước giờ tập.',
      ingredientsList: [
        'Quả chà là Medjool dẻo ngọt: 3 quả (bỏ hạt)',
        'Hạt bí xanh Ấn Độ: 20g',
        'Bột yến mạch cán mịn: 15g',
        'Trà hoa cúc nguyên bông pha ấm: 1 tách 250ml'
      ],
      cookingSteps: [
        'Nghiền nhuyễn chà là cùng hạt bí và bột yến mạch thành khối dẻo quánh.',
        'Vo thành 2 viên tròn nhỏ vừa miệng ăn.',
        'Dùng kèm một tách trà hoa cúc nóng thanh nhiệt giải tỏa căng thẳng.'
      ],
      note: 'Gợi ý AI: Cung cấp magie và kẽm ổn định đường huyết, chuẩn bị năng lượng dồi dào cho các hoạt động cuối ngày.'
    },
    {
      id: 'm4',
      slot: 'Bữa Tối',
      timeRange: '18:30 – 20:00',
      prepTime: '25 phút',
      difficulty: 'Dễ',
      title: 'Súp Bí Đỏ Cốt Dừa Nấm Đùi Gà Hầm Hạt Sen Dưỡng Sinh',
      calories: '660 kcal',
      protein: '28g Protein',
      fiber: '14g Xơ',
      iron: '5.8mg Sắt',
      badge: 'Bữa Tối',
      healingBadge: '🌙 Dưỡng tâm, dễ ngủ',
      img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
      mainIngredients: 'Giàu tryptophan tự nhiên và khoáng chất hỗ trợ giấc ngủ sâu. Không dùng ngũ vị tân giúp thanh nhiệt cơ thể và nhẹ bụng suốt đêm.',
      ingredientsList: [
        'Bí đỏ hạt đậu Nhật: 200g (gọt vỏ cắt khúc)',
        'Nấm đùi gà tươi: 100g (thái hạt lựu áp chảo)',
        'Hạt sen tươi Huế: 50g (thông tâm sen)',
        'Nước cốt dừa nguyên chất ép tươi: 80ml',
        'Nước dùng rau củ quả ngọt: 300ml',
        'Gia vị: muối hồng Himalaya, hạt nêm nấm hữu cơ'
      ],
      cookingSteps: [
        'Hầm bí đỏ và hạt sen cùng nước dùng rau củ trong 15 phút đến khi mềm nhừ.',
        'Dùng máy xay cầm tay xay nhuyễn mịn trực tiếp trong nồi.',
        'Cho nấm đùi gà đã xào sơ vào, rót nước cốt dừa, nêm muối và hạt nêm vừa vị.',
        'Đun sôi lăn tăn thêm 2 phút rồi múc ra bát, rắc ngò rí và tiêu đen.'
      ],
      note: 'Tác dụng phục hồi: Giàu tryptophan tự nhiên và khoáng chất hỗ trợ giấc ngủ sâu. Không dùng ngũ vị tân giúp thanh nhiệt cơ thể và nhẹ bụng suốt đêm.'
    }
  ];

  // STATE MODALS
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);
  const [selectedVideoRecipe, setSelectedVideoRecipe] = useState(null);
  const [swapModalMeal, setSwapModalMeal] = useState(null);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);

  // DANH SÁCH MÓN ĐI CHỢ ĐÃ TÍCH CHỌN
  const [checkedItems, setCheckedItems] = useState({
    'cai-xoan': false,
    'bi-do': false,
    'nam-dui-ga': true,
    'quinoa': true,
    'bo-sap': false
  });

  const toggleCheckItem = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // GỢI Ý ĐỔI MÓN VỚI AI (AI SWAP OPTIONS)
  const swapOptions = [
    {
      title: 'Tô Mì Soba Kiều Mạch Nấm Đông Cô & Đậu Phụ Sốt Dầu Hào Chay',
      calories: '680 kcal',
      protein: '30g Protein',
      reason: 'Tương đương 98% đạm & calo, giàu rutin tốt cho tim mạch và hạ huyết áp.'
    },
    {
      title: 'Cơm Gạo Lứt Xào Hạt Sen, Bí Đỏ & Đậu Hũ Non Áp Chảo',
      calories: '710 kcal',
      protein: '31g Protein',
      reason: 'Tận dụng bí đỏ và hạt sen sẵn có trong bếp, không phát sinh đồ đi chợ mới.'
    },
    {
      title: 'Salad Đậu Gà Hữu Cơ Sốt Bơ Hạt Điều & Quinoa Đỏ',
      calories: '690 kcal',
      protein: '33g Protein',
      reason: 'Bổ sung dồi dào chất xơ hòa tan và khoáng chất vi lượng chống oxy hóa.'
    }
  ];

  const handleApplySwap = (option) => {
    setSwapModalMeal(null);
    showToast(`✨ Đã đổi sang món "${option.title}" thành công!`);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '1.75rem 1.25rem 4rem 1.25rem', color: '#0f172a' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          background: '#046a47',
          color: '#ffffff',
          padding: '0.85rem 1.4rem',
          borderRadius: '14px',
          boxShadow: '0 10px 30px rgba(4, 106, 71, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          zIndex: 9999,
          fontWeight: 700,
          fontSize: '0.9rem',
          animation: 'fadeIn 0.25s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* ========================================================================= */}
        {/* BREADCRUMB & HEADER AREA */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>
          <span 
            onClick={() => onNavigate && onNavigate('home')} 
            style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            Trang chủ
          </span>
          <ChevronRight size={13} />
          <span 
            onClick={() => onNavigate && onNavigate('create-plan')} 
            style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            AI Meal Planner
          </span>
          <ChevronRight size={13} />
          <span style={{ color: '#047857', fontWeight: 700 }}>
            Thực đơn tuần #W42 (14/10 – 20/10/2026)
          </span>
        </div>

        {/* TOP TAGS ROW (KHỚP MOCKUP ẢNH) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '3px 10px', borderRadius: '20px', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={12} /> Tối ưu bởi VeggieNutri AI v2.4
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={12} /> Độ khớp hồ sơ 99.2%
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fff7ed', color: '#c2410c', padding: '3px 10px', borderRadius: '20px', border: '1px solid #fed7aa', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Leaf size={12} /> Tiết kiệm 85% rác thải (Zero Waste)
          </span>
        </div>

        {/* TITLE & RIGHT ACTIONS ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
              Thực đơn thuần chay 7 ngày Cá nhân hóa — Tuần 42
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#475569' }}>
              <span>🎯 <strong>Mục tiêu:</strong> Giảm mỡ giữ cơ (Lean Mass Retention)</span>
              <span>•</span>
              <span>🌱 <strong>Thuần chay (Vegan)</strong></span>
              <span>•</span>
              <span style={{ color: '#c2410c', fontWeight: 700 }}>
                🛡️ Allergen Safe: 0% đậu phộng, gluten-free, không ngũ vị tân
              </span>
            </div>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Đổi món với AI */}
            <button
              type="button"
              onClick={() => setSwapModalMeal(dayMeals[1])}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              <RotateCw size={15} color="#059669" />
              <span>Đổi món với AI</span>
            </button>

            {/* Xuất giỏ đi chợ (24 món) */}
            <button
              type="button"
              onClick={() => setShowMarketModal(true)}
              style={{
                background: '#046a47',
                border: 'none',
                color: '#ffffff',
                padding: '0.65rem 1.15rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(4, 106, 71, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <ShoppingCart size={15} />
              <span>Xuất giỏ đi chợ (24 món)</span>
            </button>

            {/* Icon Calendar */}
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              title="Lịch sử thực đơn"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Calendar size={17} />
            </button>

            {/* Icon Print */}
            <button
              type="button"
              onClick={() => window.print()}
              title="In thực đơn"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Printer size={17} />
            </button>

            {/* Nút Tạo thực đơn mới (WF02) */}
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('create-plan') : setShowNewPlanModal(true)}
              style={{
                background: '#f0fdf4',
                border: '1px solid #a7f3d0',
                color: '#047857',
                padding: '0.65rem 1.1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Sparkles size={15} />
              <span>Tạo với AI mới</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 MACRO STATS CARDS (KHỚP 100% GIAO DIỆN ẢNH MỚI) */}
        {/* ========================================================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
          
          {/* Card 1: Năng lượng trung bình */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                NĂNG LƯỢNG TRUNG BÌNH
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '0.4rem' }}>
              2,080 <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>kcal / ngày</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.76rem' }}>
              <span style={{ color: '#047857', fontWeight: 700 }}>100% mục tiêu</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ color: '#64748b' }}>Định chuẩn TDEE cá nhân</span>
            </div>
          </div>

          {/* Card 2: Đạm thực vật (Protein) */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ĐẠM THỰC VẬT (PROTEIN)
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '0.4rem' }}>
              86g <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>/ ngày (~17%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.76rem' }}>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Đậu hũ mơ, quinoa, hạt chia</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ color: '#047857', fontWeight: 700 }}>Tối ưu cơ bắp</span>
            </div>
          </div>

          {/* Card 3: Carb phức & Chất xơ */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                CARB PHỨC & CHẤT XƠ
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={16} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '0.4rem' }}>
              265g <span style={{ fontSize: '0.88rem', color: '#ea580c', fontWeight: 700 }}>/ 38g Xơ</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
              <span style={{ color: '#64748b' }}>Chỉ số GI thấp & Vị giác thanh sạch</span>
              <span style={{ color: '#c2410c', fontWeight: 800 }}>142% RDA</span>
            </div>
          </div>

          {/* Card 4: Vi chất (Sắt / B12 / Canxi) */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.25rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                VI CHẤT (SẮT / B12 / CANXI)
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#475569' }}>Sắt (Fe) 19.5mg</span>
                <span style={{ color: '#047857', fontWeight: 800 }}>108%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#475569' }}>Vit B12 3.0mcg</span>
                <span style={{ color: '#047857', fontWeight: 800 }}>107%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#475569' }}>Canxi 850mg</span>
                <span style={{ color: '#2563eb', fontWeight: 800 }}>85%</span>
              </div>
            </div>
          </div>

        </div>

        {/* ALLERGEN GUARD ACTIVE BANNER */}
        <div style={{
          background: 'linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%)',
          borderRadius: '14px',
          border: '1px solid #bbf7d0',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.03)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Shield size={18} color="#059669" />
            <span style={{ fontSize: '0.84rem', color: '#1e293b' }}>
              <strong>Allergen Guard Active:</strong> Không đậu phộng • Không chứa Gluten • Không ngũ vị tân (hành, tỏi, kiệu, hẹ, nén).
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: '#047857', fontWeight: 800 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
            <span>Bộ lọc sinh học an toàn 100%</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LỊCH TRÌNH 7 NGÀY TRONG TUẦN (7 TABS) */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#059669" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Lịch trình 7 ngày trong tuần
              </h3>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Nhấp vào từng ngày để xem lịch ăn chi tiết
            </span>
          </div>

          {/* 7 DAYS HORIZONTAL SELECTOR ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.65rem' }}>
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
                    padding: '0.85rem 0.65rem',
                    textAlign: 'center',
                    border: isActive ? '2px solid #046a47' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 8px 20px rgba(4, 106, 71, 0.22)' : '0 1px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, opacity: isActive ? 0.9 : 0.6 }}>
                      {day.label}
                    </span>
                    {day.checked && (
                      <CheckCircle2 size={13} color={isActive ? '#a7f3d0' : '#059669'} />
                    )}
                  </div>

                  <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.2rem' }}>
                    {day.date}
                  </div>

                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isActive ? '#ecfdf5' : '#059669' }}>
                    {day.calories}
                  </div>

                  <div style={{ fontSize: '0.68rem', opacity: isActive ? 0.85 : 0.6, marginTop: '2px' }}>
                    {day.statusLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN 2-COLUMN SECTION: LEFT (DAILY MEALS) & RIGHT (SIDEBAR) */}
        {/* ========================================================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: LỊCH CHI TIẾT NGÀY & 4 MEALS */}
          {/* --------------------------------------------------------------------- */}
          <div>
            
            {/* DAILY HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  LỊCH CHI TIẾT NGÀY
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0 0 0' }}>
                  Thứ 2, ngày 14 tháng 10 năm 2026
                </h2>
              </div>

              <div style={{
                background: completedCount === 4 ? '#dcfce7' : '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <CheckCircle2 size={15} />
                <span>Đã hoàn thành: {completedCount}/4 bữa</span>
              </div>
            </div>

            {/* 4 MEAL CARDS (VERTICAL LIST AS PER MOCKUP) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {dayMeals.map((meal) => {
                const isCooked = cookedMeals[meal.id];
                const isSaved = savedRecipes.includes(meal.id);

                return (
                  <div
                    key={meal.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      border: meal.isZeroWaste ? '2px solid #bbf7d0' : isCooked ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                      padding: '1.25rem',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      display: 'flex',
                      gap: '1.25rem',
                      position: 'relative',
                      opacity: isCooked ? 0.92 : 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* THUMBNAIL WITH TIME TAG */}
                    <div style={{
                      width: '180px',
                      height: '135px',
                      borderRadius: '14px',
                      backgroundImage: `url('${meal.img}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(15, 23, 42, 0.82)',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backdropFilter: 'blur(2px)'
                      }}>
                        {meal.timeRange}
                      </span>

                      <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: '#046a47',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {meal.badge}
                      </span>
                    </div>

                    {/* CONTENT DETAILS */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      
                      {/* ZERO-WASTE TAG IF APPLICABLE */}
                      {meal.isZeroWaste && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#c2410c', fontSize: '0.74rem', fontWeight: 800, background: '#fff7ed', padding: '2px 8px', borderRadius: '6px', width: 'fit-content', marginBottom: '0.35rem' }}>
                          <span>{meal.zeroWasteNote}</span>
                        </div>
                      )}

                      {/* TITLE & BOOKMARK */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.35 }}>
                          {meal.title}
                        </h3>

                        <button
                          type="button"
                          onClick={() => {
                            setSavedRecipes(prev => 
                              prev.includes(meal.id) ? prev.filter(x => x !== meal.id) : [...prev, meal.id]
                            );
                            showToast(isSaved ? 'Đã bỏ lưu món.' : '❤️ Đã lưu vào cẩm nang món ăn yêu thích!');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isSaved ? '#059669' : '#94a3b8',
                            cursor: 'pointer',
                            padding: '2px',
                            flexShrink: 0
                          }}
                          title="Lưu vào cẩm nang"
                        >
                          <Bookmark size={18} fill={isSaved ? '#059669' : 'none'} />
                        </button>
                      </div>

                      {/* MACRO METRICS ROW */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: '#64748b', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                        <span style={{ background: '#f8fafc', padding: '2px 7px', borderRadius: '6px', fontWeight: 700, color: '#0f172a' }}>
                          🔥 {meal.calories}
                        </span>
                        <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 7px', borderRadius: '6px', fontWeight: 800 }}>
                          {meal.protein}
                        </span>
                        {meal.fiber && (
                          <span style={{ background: '#f1f5f9', padding: '2px 7px', borderRadius: '6px' }}>
                            {meal.fiber}
                          </span>
                        )}
                        <span style={{ background: '#f1f5f9', padding: '2px 7px', borderRadius: '6px' }}>
                          ⏱ {meal.prepTime}
                        </span>
                        {meal.healingBadge && (
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 7px', borderRadius: '6px', fontWeight: 700 }}>
                            {meal.healingBadge}
                          </span>
                        )}
                      </div>

                      {/* INGREDIENTS OR RECOVERY DESCRIPTION */}
                      <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45, margin: '0 0 0.75rem 0', flex: 1 }}>
                        <strong>Nguyên liệu chính:</strong> {meal.mainIngredients}
                      </p>

                      {/* ACTION BUTTONS & COOKED CHECKBOX */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {/* Nút Đổi món AI */}
                          <button
                            type="button"
                            onClick={() => setSwapModalMeal(meal)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#334155',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <RotateCw size={13} color="#059669" />
                            <span>Đổi món khác (AI Swap)</span>
                          </button>

                          {/* Nút Xem công thức & Hướng dẫn */}
                          <button
                            type="button"
                            onClick={() => setSelectedRecipeDetail(meal)}
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#047857',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <BookOpen size={13} />
                            <span>Xem công thức & Hướng dẫn</span>
                          </button>

                          {/* Nút Xem Video nấu ăn (nếu có) */}
                          {meal.videoUrl && (
                            <button
                              type="button"
                              onClick={() => setSelectedVideoRecipe(meal)}
                              style={{
                                background: '#046a47',
                                border: 'none',
                                color: '#ffffff',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <Play size={13} fill="white" />
                              <span>Xem Video & Nấu ngay</span>
                            </button>
                          )}
                        </div>

                        {/* CHECKBOX ĐÃ NẤU XONG */}
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: isCooked ? '#047857' : '#64748b',
                          background: isCooked ? '#ecfdf5' : 'transparent',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          <input
                            type="checkbox"
                            checked={isCooked}
                            onChange={() => toggleCookedMeal(meal.id)}
                            style={{ accentColor: '#046a47', cursor: 'pointer' }}
                          />
                          <span>{isCooked ? 'Đã nấu xong ✓' : 'Đã nấu xong'}</span>
                        </label>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: SMART GROCERY, SOUS-CHEF, MEAL PREP & NEXT WEEK CTA */}
          {/* --------------------------------------------------------------------- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* CARD 1: ĐI CHỢ THÔNG MINH (KHỚP DỮ LIỆU TỦ LẠNH) */}
            {/* NOTE: ĐÃ BỎ ƯỚC TÍNH CHI PHÍ VÀ BỎ NÚT ĐẶT GIAO GRABMART THEO YÊU CẦU CỦA USER */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingCart size={18} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Đi chợ thông minh
                  </h3>
                </div>

                <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                  65% sẵn có
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.85rem' }}>
                Khớp dữ liệu Tủ lạnh thông minh
              </div>

              {/* PROGRESS BAR 14 SẴN CÓ / CẦN MUA 8 MÓN */}
              <div style={{ marginBottom: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span style={{ color: '#047857' }}>14 nguyên liệu đã có sẵn</span>
                  <span style={{ color: '#c2410c' }}>Cần mua thêm 8 món</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#fed7aa', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: '65%', height: '100%', background: '#059669' }}></div>
                  <div style={{ width: '35%', height: '100%', background: '#f97316' }}></div>
                </div>
              </div>

              {/* LIST CẦN MUA BỔ SUNG CHO TUẦN 42 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  CẦN MUA BỔ SUNG CHO TUẦN 42:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {[
                    { id: 'quinoa', name: 'Quinoa trắng hữu cơ', amount: '500g' },
                    { id: 'nam-dui-ga', name: 'Nấm đùi gà tươi Đà Lạt', amount: '400g' },
                    { id: 'bo-sap', name: 'Bơ sáp loại 1 & Cải thìa', amount: '1.2 kg' },
                    { id: 'hat-chia', name: 'Hạt chia organic Nam Mỹ', amount: '200g' }
                  ].map((item) => (
                    <label
                      key={item.id}
                      style={{
                        background: checkedItems[item.id] ? '#f8fafc' : '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.55rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={checkedItems[item.id] || false}
                          onChange={() => toggleCheckItem(item.id)}
                          style={{ accentColor: '#059669', cursor: 'pointer' }}
                        />
                        <span style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: checkedItems[item.id] ? '#94a3b8' : '#0f172a',
                          textDecoration: checkedItems[item.id] ? 'line-through' : 'none'
                        }}>
                          {item.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                        {item.amount}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ACTION: MỞ DANH SÁCH ĐI CHỢ CHI TIẾT */}
              <button
                type="button"
                onClick={() => setShowMarketModal(true)}
                style={{
                  width: '100%',
                  background: '#046a47',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 12px rgba(4, 106, 71, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <BookOpen size={16} />
                <span>Mở danh sách đi chợ chi tiết</span>
              </button>

            </div>

            {/* CARD 2: SOUS-CHEF VEGGIEAI NHẮN NHỦ */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.4rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChefHat size={18} />
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Sous-Chef VeggieAI nhắn nhủ
                </h4>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                "Chào {user?.name || 'Minh Tuấn'}! Hôm nay cơ thể bạn cần nhiều đạm thực vật để phục hồi sau buổi tập kháng lực chiều. Hãy ưu tiên ăn trọn vẹn phần <strong>Buddha Bowl Đậu Hũ Áp Chảo</strong> vào bữa trưa và uống đủ <strong>2.2L nước ấm</strong> nhé!"
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                  Phân tích nhịp sinh học tự động
                </span>

                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('chatbot')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <span>Hỏi AI thêm</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* CARD 3: MẸO CHUẨN BỊ (MEAL PREP) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.4rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Mẹo chuẩn bị (Meal Prep)
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Nấu nhanh & Giữ trọn dinh dưỡng
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <div>
                    <strong>Ngâm đậu & Quinoa:</strong> Ngâm quinoa 20 phút trước khi nấu để loại bỏ saponin tự nhiên giúp vị không bị đắng nhẹ.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <div>
                    <strong>Bí đỏ nướng sơ:</strong> Bí đỏ cho món súp tối có thể hấp hoặc áp chảo trước 10 phút, giúp súp mịn dẻo tự nhiên không cần bột bắp.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <div>
                    <strong>Bảo quản cải thìa:</strong> Bọc giấy báo và để ngăn rau tủ mát để giữ trọn vẹn vitamin C và folate.
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: BANNER SÁNG TẠO THỰC ĐƠN TUẦN TIẾP THEO VỚI AI */}
            <div style={{
              background: 'linear-gradient(135deg, #046a47 0%, #065f46 100%)',
              borderRadius: '20px',
              padding: '1.5rem',
              color: '#ffffff',
              boxShadow: '0 8px 25px rgba(4, 106, 71, 0.25)',
              textAlign: 'center'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                <Sparkles size={22} />
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>
                Tạo thực đơn tuần tới với AI
              </h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.9, lineHeight: 1.45, margin: '0 0 1rem 0' }}>
                Tối ưu hóa tiếp tục theo nguyên liệu tủ lạnh mới và thể trạng tuần sau của bạn.
              </p>

              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('create-plan') : setShowNewPlanModal(true)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  color: '#047857',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <span>Bắt đầu thiết lập tuần sau</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: XEM CHI TIẾT CÔNG THỨC & HƯỚNG DẪN */}
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

            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              CÔNG THỨC MÓN ĂN THUẦN CHAY
            </span>
            <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.25rem 0', fontSize: '1.45rem', fontWeight: 800 }}>
              {selectedRecipeDetail.title}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {selectedRecipeDetail.slot} • {selectedRecipeDetail.timeRange} • {selectedRecipeDetail.protein} • {selectedRecipeDetail.calories}
            </p>

            <div style={{ height: '220px', backgroundImage: `url('${selectedRecipeDetail.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px', marginBottom: '1.5rem' }}></div>

            <h4 style={{ color: '#047857', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 800 }}>
              🥕 Nguyên liệu định lượng chính xác:
            </h4>
            <ul style={{ paddingLeft: '1.25rem', color: '#334155', marginBottom: '1.25rem', lineHeight: '1.6', fontSize: '0.86rem' }}>
              {selectedRecipeDetail.ingredientsList?.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>

            <h4 style={{ color: '#047857', marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 800 }}>
              👨‍🍳 Các bước nấu ăn chi tiết:
            </h4>
            <ol style={{ paddingLeft: '1.25rem', color: '#334155', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.86rem' }}>
              {selectedRecipeDetail.cookingSteps?.map((st, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{st}</li>
              ))}
            </ol>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="secondary" onClick={() => setSelectedRecipeDetail(null)}>Đóng</Button>
              <Button onClick={() => {
                setSelectedRecipeDetail(null);
                showToast('❤️ Đã lưu công thức vào cẩm nang yêu thích của bạn!');
              }}>
                <Heart size={16} fill="white" /> Lưu vào cẩm nang
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: XEM VIDEO NẤU ĂN TRỰC TIẾP */}
      {/* ========================================================================= */}
      {selectedVideoRecipe && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '720px', width: '100%', maxHeight: '92vh',
            overflowY: 'auto', padding: '1.75rem', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
          }}>
            <button 
              onClick={() => setSelectedVideoRecipe(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <X size={20} />
            </button>

            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              VIDEO HƯỚNG DẪN NẤU ĂN
            </span>
            <h3 style={{ color: '#0f172a', margin: '0.5rem 0 0.85rem 0', fontSize: '1.3rem', fontWeight: 800 }}>
              {selectedVideoRecipe.title}
            </h3>

            {/* VIDEO PLAYER CONTAINER */}
            <div style={{ position: 'relative', height: '360px', background: '#000', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <video 
                controls 
                autoPlay 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              >
                Trình duyệt của bạn không hỗ trợ phát video HTML5.
              </video>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {selectedVideoRecipe.mainIngredients}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setSelectedVideoRecipe(null)}>Đóng Video</Button>
              <Button onClick={() => {
                setSelectedVideoRecipe(null);
                setSelectedRecipeDetail(selectedVideoRecipe);
              }}>
                <BookOpen size={16} /> Xem nguyên liệu & Các bước
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ĐỔI MÓN VỚI AI (SWAP MEAL) */}
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

            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              ĐỔI MÓN THÔNG MINH BẰNG AI
            </span>
            <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.35rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
              Gợi Ý Món Ăn Thay Thế Tương Đương
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
              Đang tìm món thay thế cho: <strong>{swapModalMeal.title}</strong> ({swapModalMeal.protein} • {swapModalMeal.calories})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
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
                    <h4 style={{ color: '#0f172a', fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>{opt.title}</h4>
                    <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                      {opt.protein}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.35rem' }}>
                    🔥 {opt.calories}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 600 }}>
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
      {/* MODAL 4: SỔ TAY ĐI CHỢ CHI TIẾT (FULL GROCERY CHECKLIST) */}
      {/* ========================================================================= */}
      {showMarketModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '660px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setShowMarketModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              SỔ TAY NGUYÊN LIỆU TUẦN 42
            </span>
            <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.25rem 0', fontSize: '1.4rem', fontWeight: 800 }}>
              Danh Sách Đi Chợ Thuần Chay Chi Tiết
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
              Tổng hợp nguyên liệu theo từng nhóm thực phẩm để bạn dễ dàng mua sắm tại chợ hoặc siêu thị.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {[
                { id: 'cai-xoan', name: 'Cải xoăn Kale hữu cơ Đà Lạt', amount: '500g', cat: 'Rau củ' },
                { id: 'bi-do', name: 'Bí đỏ hạt đậu Nhật', amount: '1 quả (800g)', cat: 'Rau củ' },
                { id: 'nam-dui-ga', name: 'Nấm đùi gà tươi Đà Lạt', amount: '400g', cat: 'Rau củ' },
                { id: 'quinoa', name: 'Quinoa trắng hữu cơ', amount: '500g', cat: 'Đậu & Hạt' },
                { id: 'dau-ga', name: 'Đậu gà hữu cơ ngâm nở', amount: '500g', cat: 'Đậu & Hạt' },
                { id: 'hat-sen', name: 'Hạt sen tươi Huế', amount: '200g', cat: 'Đậu & Hạt' },
                { id: 'bo-sap', name: 'Quả bơ sáp Đắk Lắk loại 1', amount: '1.2 kg', cat: 'Trái cây' },
                { id: 'chuoi-laba', name: 'Chuối Laba chín Đà Lạt', amount: '1 nải', cat: 'Trái cây' }
              ].map(item => (
                <label 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '12px',
                    background: checkedItems[item.id] ? '#f8fafc' : '#ffffff',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <input 
                      type="checkbox"
                      checked={checkedItems[item.id] || false}
                      onChange={() => toggleCheckItem(item.id)}
                      style={{ width: '17px', height: '17px', accentColor: '#046a47', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.88rem', color: checkedItems[item.id] ? '#94a3b8' : '#0f172a', textDecoration: checkedItems[item.id] ? 'line-through' : 'none', fontWeight: 600 }}>
                      {item.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>{item.amount}</span>
                    <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>{item.cat}</span>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowMarketModal(false)}>Đóng</Button>
              <Button onClick={() => {
                setShowMarketModal(false);
                showToast('✓ Đã đồng bộ danh sách đi chợ vào ứng dụng di động!');
              }}>
                <Download size={15} /> Lưu & Xuất danh sách
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: LỊCH SỬ THỰC ĐƠN CÁC TUẦN TRƯỚC */}
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

            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              LƯU TRỮ DINH DƯỠNG
            </span>
            <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.35rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
              Lịch Sử Thực Đơn Các Tuần Trước
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
              Xem lại hoặc áp dụng lại thực đơn của các tuần trước.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {[
                { title: 'Thực đơn Tuần 41 (07/10 – 13/10/2026)', desc: 'Thực đơn Tăng Cơ Nạc • 86g Protein/ngày • Đạt chuẩn 98.6%', mealsCount: '21/21 bữa hoàn thành' },
                { title: 'Thực đơn Tuần 40 (30/09 – 06/10/2026)', desc: 'Thực đơn Thanh Lọc & Bổ Sung Sắt • 19.5mg Sắt/ngày', mealsCount: '20/21 bữa hoàn thành' },
                { title: 'Thực đơn Tuần 39 (23/09 – 29/09/2026)', desc: 'Thực đơn Thuần Chay Địa Trung Hải • Giàu Omega-3 & Xơ', mealsCount: '21/21 bữa hoàn thành' }
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
                    <h4 style={{ color: '#0f172a', fontSize: '0.92rem', margin: '0 0 0.25rem 0', fontWeight: 700 }}>{item.title}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 0.2rem 0' }}>{item.desc}</p>
                    <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>{item.mealsCount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowHistoryModal(false);
                      showToast(`Đã nạp lại cấu hình thực đơn "${item.title}"!`);
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#047857',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Dùng lại
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

    </div>
  );
}
