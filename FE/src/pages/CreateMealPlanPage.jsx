import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, CheckCircle2, ChevronRight, X, Plus, 
  Calendar, RefreshCw, Smartphone, Camera, Box, AlertTriangle, 
  Leaf, Flame, Check, Utensils, Clock, DollarSign, ChefHat, 
  Sliders, ArrowRight, Bookmark, Heart, Info, Eye, Zap, HelpCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export default function CreateMealPlanPage({ onNavigate }) {
  const { user } = useAuth();

  // Luôn scroll về đầu trang khi truy cập
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // =========================================================================
  // STATE BƯỚC 1: KHUNG THỜI GIAN & CẤU HÌNH BỮA ĂN
  // =========================================================================
  const [planDays, setPlanDays] = useState(7); // 3, 7, 14
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true
  });
  const [servings, setServings] = useState('1'); // '1', '2', '4'

  // =========================================================================
  // STATE BƯỚC 2: KHO NGUYÊN LIỆU & TỦ LẠNH THÔNG MINH (PANTRY)
  // =========================================================================
  const [pantryIngredients, setPantryIngredients] = useState([
    'Đậu hũ mơ tươi',
    'Nấm đùi gà',
    'Bí đỏ hồ lô',
    'Rau cải thìa',
    'Đậu gà hữu cơ',
    'Hạt chia',
    'Yến mạch cán dẹt',
    'Nước cốt dừa',
    'Rong biển Hàn Quốc'
  ]);
  const [newIngredient, setNewIngredient] = useState('');
  const [zeroWasteEnabled, setZeroWasteEnabled] = useState(true);

  // =========================================================================
  // STATE BƯỚC 3: MỤC TIÊU DINH DƯỠNG & NGÂN SÁCH TUẦN
  // =========================================================================
  const [targetGoal, setTargetGoal] = useState('fatloss'); // 'fatloss', 'maintain', 'detox', 'b12'
  const [budgetTier, setBudgetTier] = useState('standard'); // 'student', 'standard', 'organic'
  const [cookingTime, setCookingTime] = useState('standard'); // 'fast', 'standard', 'slow'

  // =========================================================================
  // STATE BƯỚC 4: PHONG CÁCH ẨM THỰC & THIẾT BỊ NẤU CÓ SẴN
  // =========================================================================
  const [cuisineStyles, setCuisineStyles] = useState(['vn', 'mediterranean', 'bowl']);
  const [spiciness, setSpiciness] = useState('mild'); // 'none', 'mild', 'hot'
  const [appliances, setAppliances] = useState({
    airFryer: true,
    pressureCooker: true,
    blender: true,
    nonStickPan: true
  });

  // =========================================================================
  // UI & MODAL STATES
  // =========================================================================
  const [toastMessage, setToastMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [showMobileAppModal, setShowMobileAppModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPreviewRecipe, setSelectedPreviewRecipe] = useState(null);
  const [savedPreviewItems, setSavedPreviewItems] = useState(['p1', 'p2']);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  // Toggle meal slot
  const toggleMealSlot = (slot) => {
    setSelectedMeals(prev => ({ ...prev, [slot]: !prev[slot] }));
  };

  // Thêm nguyên liệu
  const handleAddIngredient = (e) => {
    e.preventDefault();
    const trimmed = newIngredient.trim();
    if (!trimmed) return;
    if (pantryIngredients.includes(trimmed)) {
      showToast('Nguyên liệu này đã có trong danh sách bếp!');
      return;
    }
    setPantryIngredients(prev => [...prev, trimmed]);
    setNewIngredient('');
    showToast(`✓ Đã thêm "${trimmed}" vào bếp!`);
  };

  // Xóa nguyên liệu
  const handleRemoveIngredient = (item) => {
    setPantryIngredients(prev => prev.filter(i => i !== item));
  };

  // Chọn lại tất cả nguyên liệu mặc định
  const handleResetIngredients = () => {
    setPantryIngredients([
      'Đậu hũ mơ tươi',
      'Nấm đùi gà',
      'Bí đỏ hồ lô',
      'Rau cải thìa',
      'Đậu gà hữu cơ',
      'Hạt chia',
      'Yến mạch cán dẹt',
      'Nước cốt dừa',
      'Rong biển Hàn Quốc'
    ]);
    showToast('Đã khôi phục danh sách nguyên liệu ban đầu!');
  };

  // Toggle style ẩm thực
  const toggleCuisineStyle = (id) => {
    setCuisineStyles(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Toggle thiết bị
  const toggleAppliance = (app) => {
    setAppliances(prev => ({ ...prev, [app]: !prev[app] }));
  };

  // Xử lý khởi tạo thực đơn AI với hiệu ứng step-by-step
  const handleStartGeneratePlan = () => {
    setIsGenerating(true);
    setGenerationStep(1);

    setTimeout(() => {
      setGenerationStep(2);
    }, 600);

    setTimeout(() => {
      setGenerationStep(3);
    }, 1200);

    setTimeout(() => {
      setGenerationStep(4);
    }, 1800);

    setTimeout(() => {
      setIsGenerating(false);
      if (onNavigate) {
        onNavigate('planner');
      }
    }, 2400);
  };

  // Món mẫu AI preview
  const previewRecipes = [
    {
      id: 'p1',
      title: 'Buddha Bowl Đậu Hũ & Quinoa',
      sub: 'Thứ 2 • Bữa trưa • 22g Protein',
      time: '15 phút',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      calories: '420 kcal',
      desc: 'Sử dụng đậu hũ mơ tươi áp chảo vàng óng kết hợp diêm mạch hữu cơ và sốt mè rang béo bùi chuẩn dinh dưỡng.'
    },
    {
      id: 'p2',
      title: 'Súp Bí Đỏ Cốt Dừa Hạt Bí',
      sub: 'Thứ 3 • Bữa tối • Tận dụng tủ lạnh',
      time: '25 phút',
      img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
      calories: '340 kcal',
      desc: 'Tận dụng bí đỏ hồ lô và nước cốt dừa có sẵn trong bếp, ninh sánh mịn cùng hạt sen bổ dưỡng ấm bụng.'
    },
    {
      id: 'p3',
      title: 'Nấm Đùi Gà Xào Cải Thìa Dầu Hào Chay',
      sub: 'Thứ 4 • Bữa trưa • 15 phút',
      time: '15 phút',
      img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
      calories: '310 kcal',
      desc: 'Giải cứu rau cải thìa tươi ngon trong 48h, xào nấm giòn ngọt thanh tao với sốt boa-rô nấm hương đậm đà.'
    },
    {
      id: 'p4',
      title: 'Smoothie Yến Mạch Hạt Chia & Chuối',
      sub: 'Thứ 5 • Bữa sáng • 10 phút',
      time: '10 phút',
      img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80',
      calories: '280 kcal',
      desc: 'Bữa sáng nhanh cung cấp trọn vẹn chất xơ hòa tan từ yến mạch và axit béo omega-3 thực vật từ hạt chia.'
    }
  ];

  // Tính toán dynamic macros theo cấu hình
  const calculateCalories = () => {
    let base = 2080;
    if (targetGoal === 'fatloss') base = 2050;
    if (targetGoal === 'maintain') base = 2150;
    if (targetGoal === 'detox') base = 1900;
    if (targetGoal === 'b12') base = 2100;
    if (!selectedMeals.snack) base -= 250;
    if (!selectedMeals.breakfast) base -= 400;
    return base;
  };

  const calculatedKcal = calculateCalories();

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem', color: '#0f172a' }}>
      
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

      {/* TOP CONTAINER */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.75rem 1.25rem 0 1.25rem' }}>
        
        {/* BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
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
            onClick={() => onNavigate && onNavigate('planner')} 
            style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#047857'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            Thực đơn của tôi
          </span>
          <ChevronRight size={13} />
          <span style={{ color: '#047857', fontWeight: 700 }}>
            Tạo thực đơn tuần cá nhân hóa với Trợ lý AI
          </span>
        </div>

        {/* HEADER & ACTION BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 800, 
                letterSpacing: '0.05em', 
                background: '#ecfdf5', 
                color: '#047857', 
                padding: '3px 10px', 
                borderRadius: '8px', 
                border: '1px solid #a7f3d0' 
              }}>
                THỰC ĐƠN THÔNG MINH • AI MEAL PLANNER V2.4
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
              Tạo thực đơn tuần cá nhân hóa với Trợ lý AI
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
              Tối ưu hóa dinh dưỡng theo thể trạng, nguyên liệu có sẵn trong tủ lạnh và sở thích ẩm thực chay của bạn chỉ trong 30 giây.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('meal-history') : setShowHistoryModal(true)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '0.65rem 1.15rem',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              <Clock size={16} color="#64748b" />
              <span>Lịch sử thực đơn</span>
            </button>

            <button
              type="button"
              onClick={() => showToast('✓ Đã đồng bộ thông số thể trạng mới nhất từ hồ sơ sức khỏe!')}
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 6px rgba(4, 120, 87, 0.08)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#d1fae5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ecfdf5'}
            >
              <RefreshCw size={15} />
              <span>Đồng bộ từ Hồ sơ sức khỏe</span>
            </button>
          </div>
        </div>

        {/* BANNER ĐỒNG BỘ HỒ SƠ CÁ NHÂN */}
        <div style={{
          background: 'linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%)',
          borderRadius: '16px',
          border: '1px solid #bbf7d0',
          padding: '1rem 1.35rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          boxShadow: '0 2px 10px rgba(5, 150, 105, 0.04)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#046a47',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  Đã đồng bộ hồ sơ cá nhân:
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px' }}>
                  Thuần chay (Vegan)
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '6px' }}>
                  Kiêng ngũ vị tân
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                <strong>Ràng buộc tự động:</strong> Loại trừ hoàn toàn đậu phộng, hành tỏi, kiêng đạm động vật.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('user-profile')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#047857',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.6rem',
              borderRadius: '8px',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e2fbe8'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>Chỉnh sửa hồ sơ gốc</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* MAIN WORKSPACE 2 COLUMNS: LEFT 63%, RIGHT 37% */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
          
          {/* ================================================================= */}
          {/* LEFT COLUMN: 4 STEPS FORM */}
          {/* ================================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* STEP 01: KHUNG THỜI GIAN & CẤU HÌNH BỮA ĂN */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem 1.75rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.88rem'
                  }}>
                    01
                  </div>
                  <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Khung thời gian & Cấu hình bữa ăn
                  </h3>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', background: '#f1f5f9', padding: '3px 9px', borderRadius: '8px', fontWeight: 700 }}>
                  Bước 1/4
                </span>
              </div>

              {/* 1.1 Số ngày lập thực đơn */}
              <div style={{ marginBottom: '1.35rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                  Số ngày lập thực đơn tuần
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '0.75rem' }}>
                  {[
                    { days: 3, label: '3 ngày trải nghiệm' },
                    { days: 7, label: '7 ngày (1 tuần)', badge: 'Khuyên dùng' },
                    { days: 14, label: '14 ngày trọn gói' }
                  ].map((option) => (
                    <button
                      key={option.days}
                      type="button"
                      onClick={() => setPlanDays(option.days)}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderRadius: '12px',
                        border: planDays === option.days ? '2px solid #046a47' : '1px solid #e2e8f0',
                        background: planDays === option.days ? '#046a47' : '#ffffff',
                        color: planDays === option.days ? '#ffffff' : '#334155',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.15s ease',
                        boxShadow: planDays === option.days ? '0 4px 12px rgba(4, 106, 71, 0.2)' : 'none'
                      }}
                    >
                      <span>{option.label}</span>
                      {option.badge && (
                        <span style={{
                          fontSize: '0.68rem',
                          background: planDays === option.days ? '#fef08a' : '#ecfdf5',
                          color: planDays === option.days ? '#854d0e' : '#059669',
                          padding: '1px 6px',
                          borderRadius: '6px',
                          fontWeight: 800
                        }}>
                          {option.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1.2 Các bữa ăn áp dụng tự động */}
              <div style={{ marginBottom: '1.35rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                  Các bữa ăn áp dụng tự động
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                  {[
                    { key: 'breakfast', title: 'Bữa sáng', time: '07:00 – 08:30' },
                    { key: 'lunch', title: 'Bữa trưa', time: '11:30 – 13:00' },
                    { key: 'dinner', title: 'Bữa tối', time: '18:30 – 20:00' },
                    { key: 'snack', title: 'Snack phụ', time: 'Trà chiều & hạt' }
                  ].map((meal) => {
                    const isChecked = selectedMeals[meal.key];
                    return (
                      <div
                        key={meal.key}
                        onClick={() => toggleMealSlot(meal.key)}
                        style={{
                          border: isChecked ? '1.5px solid #059669' : '1px solid #e2e8f0',
                          background: isChecked ? '#f0fdf4' : '#ffffff',
                          borderRadius: '12px',
                          padding: '0.65rem 0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Controlled by container onClick
                          style={{
                            marginTop: '2px',
                            width: '16px',
                            height: '16px',
                            accentColor: '#059669',
                            cursor: 'pointer'
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isChecked ? '#047857' : '#334155' }}>
                            {meal.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {meal.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 1.3 Khẩu phần phục vụ (Servings) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                  Khẩu phần phục vụ (Servings)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { val: '1', title: '1 người (Cá nhân)' },
                    { val: '2', title: '2 người (Cặp đôi)' },
                    { val: '4', title: '4 người (Gia đình)' }
                  ].map((item) => (
                    <label
                      key={item.val}
                      style={{
                        border: servings === item.val ? '1.5px solid #046a47' : '1px solid #e2e8f0',
                        background: servings === item.val ? '#f0fdf4' : '#ffffff',
                        borderRadius: '12px',
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name="servings"
                        value={item.val}
                        checked={servings === item.val}
                        onChange={() => setServings(item.val)}
                        style={{ accentColor: '#046a47', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: servings === item.val ? '#047857' : '#334155' }}>
                        {item.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 02: KHO NGUYÊN LIỆU & TỦ LẠNH THÔNG MINH (PANTRY) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem 1.75rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.88rem'
                  }}>
                    02
                  </div>
                  <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Kho nguyên liệu & Tủ lạnh thông minh (Pantry)
                  </h3>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', background: '#f1f5f9', padding: '3px 9px', borderRadius: '8px', fontWeight: 700 }}>
                  Bước 2/4
                </span>
              </div>

              {/* 2.1 SOURCE SELECTION: MOBILE SCAN (DISABLED WITH CLEAR WARNING) VS VEGGIEBOX */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                
                {/* OPTION 1: AI FRIDGE SCAN - STRICTLY MOBILE-ONLY WITH NOTICE PER REVIEW NOTE */}
                <div 
                  onClick={() => setShowMobileAppModal(true)}
                  style={{
                    border: '1.5px dashed #cbd5e1',
                    background: '#f8fafc',
                    borderRadius: '14px',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    opacity: 0.82,
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                  title="Tính năng quét camera chỉ có trên App Mobile"
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#e2e8f0',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Camera size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#334155' }}>
                        AI Fridge Scan
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: '#fee2e2',
                        color: '#b91c1c',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        Chỉ trên App
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0 0', lineHeight: 1.3 }}>
                      Tải App di động để chụp ảnh quét tủ lạnh nhanh bằng camera
                    </p>
                  </div>
                </div>

                {/* OPTION 2: TỦ LẠNH VEGGIEBOX - ACTIVE ON WEB */}
                <div 
                  style={{
                    border: '2px solid #059669',
                    background: '#f0fdf4',
                    borderRadius: '14px',
                    padding: '0.85rem 1rem',
                    cursor: 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)'
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#ea580c',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Box size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                        Tủ lạnh VeggieBox
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        Đang kết nối Web ✓
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: '#047857', margin: '2px 0 0 0', lineHeight: 1.3, fontWeight: 600 }}>
                      8 món đã lưu sẵn từ lần đi chợ gần nhất
                    </p>
                  </div>
                </div>

              </div>

              {/* 2.2 INPUT NHẬP NHANH NGUYÊN LIỆU VÀO BẾP */}
              <form onSubmit={handleAddIngredient} style={{ marginBottom: '1.15rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      placeholder="+ Nhập tên rau củ quả, các loại đậu, hạt dinh dưỡng..."
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        transition: 'border-color 0.15s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#059669'}
                      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      background: '#046a47',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.75rem 1.25rem',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Plus size={16} />
                    <span>Thêm vào bếp</span>
                  </button>
                </div>
              </form>

              {/* 2.3 NGUYÊN LIỆU ĐÃ CHỌN & ĐANG CÓ TRONG BẾP */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    NGUYÊN LIỆU ĐÃ CHỌN & ĐANG CÓ TRONG BẾP ({pantryIngredients.length}):
                  </span>
                  <button
                    type="button"
                    onClick={handleResetIngredients}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#059669',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Chọn lại tất cả
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {pantryIngredients.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f1f5f9',
                        color: '#1e293b',
                        border: '1px solid #e2e8f0',
                        borderRadius: '20px',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2.4 THUẬT TOÁN GIẢI CỨU THỰC PHẨM (ZERO WASTE) */}
              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '14px',
                padding: '0.85rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: '#ffedd5',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Leaf size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#9a3412' }}>
                      Thuật toán Giải cứu Thực phẩm (Zero Waste)
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#c2410c', lineHeight: 1.3 }}>
                      Ưu tiên kết hợp các nguyên liệu nhạy cảm dễ hỏng trong 48h tới (Rau cải thìa, Đậu hũ).
                    </div>
                  </div>
                </div>

                {/* TOGGLE SWITCH */}
                <div 
                  onClick={() => setZeroWasteEnabled(!zeroWasteEnabled)}
                  style={{
                    width: '44px',
                    height: '24px',
                    background: zeroWasteEnabled ? '#059669' : '#cbd5e1',
                    borderRadius: '12px',
                    padding: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: zeroWasteEnabled ? 'flex-end' : 'flex-start',
                    transition: 'background 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}></div>
                </div>
              </div>

            </div>

            {/* STEP 03: MỤC TIÊU DINH DƯỠNG & NGÂN SÁCH TUẦN */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem 1.75rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.88rem'
                  }}>
                    03
                  </div>
                  <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Mục tiêu Dinh dưỡng & Ngân sách tuần
                  </h3>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', background: '#f1f5f9', padding: '3px 9px', borderRadius: '8px', fontWeight: 700 }}>
                  Bước 3/4
                </span>
              </div>

              {/* 3.1 Mục tiêu trọng tâm 7 ngày tới */}
              <div style={{ marginBottom: '1.35rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                  Mục tiêu trọng tâm 7 ngày tới
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                  {[
                    { id: 'fatloss', title: 'Giảm mỡ giữ cơ', sub: '~2.050 kcal • High Protein' },
                    { id: 'maintain', title: 'Duy trì thể trạng', sub: '~2.150 kcal • Balanced' },
                    { id: 'detox', title: 'Detox Thanh lọc', sub: '~1.900 kcal • Giàu Enzym' },
                    { id: 'b12', title: 'Tăng B12 & Sắt', sub: 'Bổ sung vi khoáng' }
                  ].map((goal) => {
                    const isActive = targetGoal === goal.id;
                    return (
                      <div
                        key={goal.id}
                        onClick={() => setTargetGoal(goal.id)}
                        style={{
                          border: isActive ? '2px solid #046a47' : '1px solid #e2e8f0',
                          background: isActive ? '#046a47' : '#ffffff',
                          color: isActive ? '#ffffff' : '#334155',
                          borderRadius: '12px',
                          padding: '0.75rem 0.65rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          boxShadow: isActive ? '0 4px 12px rgba(4, 106, 71, 0.2)' : 'none'
                        }}
                      >
                        <div style={{ fontSize: '0.84rem', fontWeight: 800 }}>
                          {goal.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', opacity: isActive ? 0.9 : 0.7, marginTop: '2px' }}>
                          {goal.sub}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3.2 HẠN MỨC NGÂN SÁCH & THỜI GIAN VÀO BẾP (2 CỘT) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                
                {/* Cột Trái: Ngân sách */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                    Hạn mức ngân sách đi chợ / Tuần
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { id: 'student', title: 'Tiết kiệm sinh viên', sub: '~350.000đ / tuần' },
                      { id: 'standard', title: 'Cân bằng tiêu chuẩn', sub: '~650.000đ / tuần (Đề xuất)' },
                      { id: 'organic', title: 'Organic Thượng hạng', sub: '~1.200.000đ / tuần' }
                    ].map((tier) => (
                      <label
                        key={tier.id}
                        style={{
                          border: budgetTier === tier.id ? '1.5px solid #059669' : '1px solid #e2e8f0',
                          background: budgetTier === tier.id ? '#f0fdf4' : '#ffffff',
                          borderRadius: '10px',
                          padding: '0.6rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: budgetTier === tier.id ? '#047857' : '#0f172a' }}>
                            {tier.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {tier.sub}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="budget"
                          checked={budgetTier === tier.id}
                          onChange={() => setBudgetTier(tier.id)}
                          style={{ accentColor: '#059669', cursor: 'pointer' }}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cột Phải: Thời gian vào bếp */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                    Thời gian vào bếp trung bình mỗi bữa
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { id: 'fast', title: 'Nhanh tiện lợi', sub: '< 20 phút (Món một nồi, salad nhanh)' },
                      { id: 'standard', title: 'Tiêu chuẩn bếp nhà', sub: '20 – 35 phút (Đầy đủ món xào, canh)' },
                      { id: 'slow', title: 'Thong thả dưỡng sinh', sub: '> 45 phút (Hầm tiềm, canh dưỡng nhan)' }
                    ].map((time) => (
                      <label
                        key={time.id}
                        style={{
                          border: cookingTime === time.id ? '1.5px solid #059669' : '1px solid #e2e8f0',
                          background: cookingTime === time.id ? '#f0fdf4' : '#ffffff',
                          borderRadius: '10px',
                          padding: '0.6rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: cookingTime === time.id ? '#047857' : '#0f172a' }}>
                            {time.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {time.sub}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="cookingTime"
                          checked={cookingTime === time.id}
                          onChange={() => setCookingTime(time.id)}
                          style={{ accentColor: '#059669', cursor: 'pointer' }}
                        />
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* STEP 04: PHONG CÁCH ẨM THỰC & THIẾT BỊ NẤU CÓ SẴN */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem 1.75rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.88rem'
                  }}>
                    04
                  </div>
                  <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Phong cách ẩm thực & Thiết bị nấu có sẵn
                  </h3>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', background: '#f1f5f9', padding: '3px 9px', borderRadius: '8px', fontWeight: 700 }}>
                  Bước 4/4
                </span>
              </div>

              {/* 4.1 Phong cách món chay mong muốn trong tuần */}
              <div style={{ marginBottom: '1.35rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                  Phong cách món chay mong muốn trong tuần (Chọn 1 hoặc nhiều)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                  {[
                    { id: 'vn', title: '🍜 Chay truyền thống VN' },
                    { id: 'thai', title: '🍲 Chay Thái & Nam Á' },
                    { id: 'mediterranean', title: '🥗 Địa Trung Hải (Olive & Hạt)' },
                    { id: 'bowl', title: '🥗 Salad & Healthy Bowl' },
                    { id: 'soup', title: '🥣 Súp & Canh Thực dưỡng' },
                    { id: 'pasta', title: '🍝 Bánh chay & Pasta' }
                  ].map((style) => {
                    const isSelected = cuisineStyles.includes(style.id);
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => toggleCuisineStyle(style.id)}
                        style={{
                          padding: '0.65rem 0.75rem',
                          borderRadius: '12px',
                          border: isSelected ? '1.5px solid #059669' : '1px solid #e2e8f0',
                          background: isSelected ? '#ecfdf5' : '#ffffff',
                          color: isSelected ? '#047857' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {style.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4.2 KHẨU VỊ CAY & THIẾT BỊ BẾP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.25rem' }}>
                
                {/* Khẩu vị cay */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                    Khẩu vị độ cay
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                    {[
                      { id: 'none', label: 'Không cay' },
                      { id: 'mild', label: 'Cay nhẹ vừa' },
                      { id: 'hot', label: 'Đậm đà' }
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setSpiciness(sp.id)}
                        style={{
                          padding: '0.55rem 0.4rem',
                          borderRadius: '10px',
                          border: spiciness === sp.id ? '1.5px solid #046a47' : '1px solid #e2e8f0',
                          background: spiciness === sp.id ? '#f0fdf4' : '#ffffff',
                          color: spiciness === sp.id ? '#047857' : '#64748b',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thiết bị có sẵn */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                    Thiết bị nấu có sẵn trong bếp
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                    {[
                      { key: 'airFryer', label: 'Nồi chiên không dầu' },
                      { key: 'pressureCooker', label: 'Nồi áp suất điện' },
                      { key: 'blender', label: 'Máy xay sinh tố' },
                      { key: 'nonStickPan', label: 'Chảo chống dính' }
                    ].map((app) => (
                      <label
                        key={app.key}
                        style={{
                          border: appliances[app.key] ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          background: appliances[app.key] ? '#f0fdf4' : '#ffffff',
                          borderRadius: '8px',
                          padding: '0.45rem 0.6rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={appliances[app.key]}
                          onChange={() => toggleAppliance(app.key)}
                          style={{ accentColor: '#059669', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: appliances[app.key] ? '#047857' : '#475569' }}>
                          {app.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: VEGGIENUTRI AI STICKY PANEL */}
          {/* ================================================================= */}
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* MAIN AI SUMMARY CARD */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              padding: '1.75rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Gradient border top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)' }}></div>

              {/* Header VeggieNutri AI */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={16} />
                  </div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    VeggieNutri AI
                  </h3>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: '#ecfdf5',
                  color: '#059669',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: '1px solid #a7f3d0'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                  Sẵn sàng
                </span>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.45, margin: '0 0 1.25rem 0' }}>
                Dựa trên {pantryIngredients.length} nguyên liệu có sẵn và mục tiêu thể trạng, VeggieAI đã tính toán được giải pháp thực đơn {planDays} ngày hoàn hảo.
              </p>

              {/* DỰ BÁO MACRO BOX */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                padding: '1.15rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Dự báo cân đối Macro / Ngày
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#059669' }}>
                    100% Thuần chay
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {calculatedKcal.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>kcal / ngày</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                    Đạt chuẩn 98.6%
                  </span>
                </div>

                {/* 3 PROGRESS BARS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  
                  {/* Protein */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      <span style={{ color: '#0f172a' }}>Đạm thực vật (Protein)</span>
                      <span style={{ color: '#059669' }}>84g (16%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '84%', height: '100%', background: '#059669', borderRadius: '3px' }}></div>
                    </div>
                  </div>

                  {/* Carbs */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      <span style={{ color: '#0f172a' }}>Carb phức (Yến mạch, bí đỏ)</span>
                      <span style={{ color: '#d97706' }}>260g (54%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '75%', height: '100%', background: '#f59e0b', borderRadius: '3px' }}></div>
                    </div>
                  </div>

                  {/* Fat & Fiber */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      <span style={{ color: '#0f172a' }}>Chất béo tốt & Chất xơ</span>
                      <span style={{ color: '#2563eb' }}>38g Xơ • 62g Fat</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '68%', height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3 BULLET POINTS HIGHLIGHTS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                  'Tận dụng 85% rau củ trong tủ lạnh (Giảm lãng phí)',
                  'Đáp ứng đầy đủ Vitamin B12 & Sắt tự nhiên',
                  'Không vi phạm điều cấm (Kiêng đậu phộng & hành tỏi)'
                ].map((text, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#334155' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* PRIMARY ACTION BUTTON: KHỞI TẠO THỰC ĐƠN */}
              <button
                type="button"
                onClick={handleStartGeneratePlan}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #046a47 0%, #065f46 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '0.95rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  boxShadow: '0 6px 20px rgba(4, 106, 71, 0.3)',
                  transition: 'all 0.15s ease',
                  marginBottom: '0.75rem'
                }}
                onMouseEnter={(e) => { if (!isGenerating) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { if (!isGenerating) e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Zap size={18} />
                <span>{isGenerating ? 'Đang giải bài toán dinh dưỡng...' : `Khởi tạo thực đơn ${planDays} ngày với AI`}</span>
              </button>

              {/* SECONDARY ACTION BUTTON */}
              <button
                type="button"
                onClick={() => showToast('✨ Đã áp dụng mẫu thực đơn yêu thích của bạn!')}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
              >
                <span>🔀 Tạo nhanh dựa trên thực đơn đã thích</span>
              </button>

            </div>

            {/* PREVIEW CARDS: MÓN MẪU AI SẼ ĐƯA VÀO TUẦN NÀY */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                  Món mẫu AI sẽ đưa vào tuần này:
                </span>
                <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: '6px', fontWeight: 700 }}>
                  4 món gợi ý
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {previewRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => setSelectedPreviewRecipe(recipe)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      backgroundImage: `url('${recipe.img}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0
                    }}></div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {recipe.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {recipe.sub}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSavedPreviewItems(prev => 
                          prev.includes(recipe.id) 
                            ? prev.filter(x => x !== recipe.id) 
                            : [...prev, recipe.id]
                        );
                        showToast(savedPreviewItems.includes(recipe.id) ? 'Đã bỏ lưu món' : 'Đã lưu món vào danh sách ưu tiên!');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: savedPreviewItems.includes(recipe.id) ? '#059669' : '#cbd5e1',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Bookmark size={16} fill={savedPreviewItems.includes(recipe.id) ? '#059669' : 'none'} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AI GENERATION IN PROGRESS ANIMATION */}
      {/* ========================================================================= */}
      {isGenerating && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#046a47',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <Sparkles size={36} className="animate-spin" />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Trợ lý VeggieNutri AI Đang Tính Toán
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.75rem 0' }}>
              Giải bài toán quy hoạch tuyến tính (PuLP) để tối ưu hóa dinh dưỡng và chống lãng phí thực phẩm.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
              {[
                { step: 1, text: 'Kiểm tra ràng buộc: Thuần chay, không hành tỏi, kiêng đậu phộng' },
                { step: 2, text: 'Kích hoạt Zero Waste: Tận dụng rau cải thìa & đậu hũ trong 48h tới' },
                { step: 3, text: 'Cân đối phân bổ Calo (2.080 kcal) và Đạm thực vật (84g Protein/ngày)' },
                { step: 4, text: 'Hoàn tất lập thực đơn 7 ngày và danh sách mua sắm thông minh!' }
              ].map((item) => (
                <div 
                  key={item.step} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    fontSize: '0.84rem',
                    color: generationStep >= item.step ? '#047857' : '#94a3b8',
                    fontWeight: generationStep >= item.step ? 700 : 500,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: generationStep >= item.step ? '#046a47' : '#e2e8f0',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    {generationStep > item.step ? '✓' : item.step}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MOBILE APP NOTICE FOR AI FRIDGE SCAN (STRICT CORRECTION) */}
      {/* ========================================================================= */}
      {showMobileAppModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setShowMobileAppModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: '#fee2e2',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Smartphone size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              AI Fridge Scan Chỉ Khả Dụng Trên Di Động
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Tính năng nhận diện nông sản và độ tươi bằng mô hình Computer Vision (YOLO) yêu cầu truy cập trực tiếp vào Camera vật lý của điện thoại thông minh.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                💡 Hướng dẫn thao tác trên Website:
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                Trên máy tính, bạn hãy sử dụng tính năng <strong>Tủ lạnh VeggieBox</strong> kết hợp ô <strong>"Nhập tên rau củ quả... Thêm vào bếp"</strong> để lập thực đơn chuẩn xác và nhanh chóng nhất.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowMobileAppModal(false)}>
                Đã hiểu, tiếp tục trên Web
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LỊCH SỬ THỰC ĐƠN TUẦN TRƯỚC */}
      {/* ========================================================================= */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '560px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setShowHistoryModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
              NHẬT KÝ DINH DƯỠNG
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0 0.35rem 0' }}>
              Lịch Sử Thực Đơn Tuần Của Bạn
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Xem lại hoặc tải lại các cấu hình thực đơn AI đã tạo trong các tuần trước.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { title: 'Thực đơn Tuần 42 (14/10 – 20/10/2026)', desc: 'Thuần chay • 2.080 kcal • 84g Protein • Zero Waste', date: 'Đã hoàn thành 100%' },
                { title: 'Thực đơn Tuần 41 (07/10 – 13/10/2026)', desc: 'Thuần chay • Detox Thanh lọc • 1.950 kcal', date: 'Đã hoàn thành 92%' },
                { title: 'Thực đơn Tuần 40 (30/09 – 06/10/2026)', desc: 'Thuần chay • Địa Trung Hải • 2.100 kcal', date: 'Đã hoàn thành 96%' }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{item.desc}</div>
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>{item.date}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowHistoryModal(false);
                      showToast(`Đã nạp lại cấu hình từ "${item.title}"!`);
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#059669',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
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

      {/* ========================================================================= */}
      {/* MODAL 4: RECIPE DETAIL PREVIEW */}
      {/* ========================================================================= */}
      {selectedPreviewRecipe && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '550px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setSelectedPreviewRecipe(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <div style={{
              height: '200px',
              backgroundImage: `url('${selectedPreviewRecipe.img}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '16px',
              marginBottom: '1.25rem'
            }}></div>

            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              GỢI Ý TỪ THỰC THỂ TỦ LẠNH
            </span>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0 0.25rem 0' }}>
              {selectedPreviewRecipe.title}
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>🔥 {selectedPreviewRecipe.calories}</span>
              <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>⏱ {selectedPreviewRecipe.time}</span>
              <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>{selectedPreviewRecipe.sub}</span>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {selectedPreviewRecipe.desc}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setSelectedPreviewRecipe(null)}>Đóng</Button>
              <Button onClick={() => {
                showToast(`Đã ưu tiên món "${selectedPreviewRecipe.title}" trong thực đơn tuần!`);
                setSelectedPreviewRecipe(null);
              }}>
                <Bookmark size={15} /> Ưu tiên đưa vào thực đơn
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
