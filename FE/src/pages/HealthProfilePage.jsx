import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, Scale, Flame, Activity, ShieldAlert, Sparkles, 
  RotateCcw, Save, Smartphone, ChevronDown, Check, X, Plus, 
  Info, Leaf, Award, ArrowRight, Utensils, CheckCircle2,
  AlertTriangle, Heart, Pill, TrendingDown
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function HealthProfilePage({ onNavigate }) {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // =========================================================================
  // STATE CÁC CHỈ SỐ THỂ TRẠNG & ĐÁNH GIÁ BMI
  // =========================================================================
  const [gender, setGender] = useState('Nam');
  const [age, setAge] = useState(28);
  const [height, setHeight] = useState(175); // cm
  const [currentWeight, setCurrentWeight] = useState(68); // kg
  const [targetWeight, setTargetWeight] = useState(65); // kg
  const [bodyFat, setBodyFat] = useState(16.5); // %

  // TÍNH TOÁN BMI, BMR, TDEE THEO CÔNG THỨC CHUẨN WHO
  const heightM = height / 100;
  const bmi = (currentWeight / (heightM * heightM)).toFixed(1);

  // BMR (Mifflin-St Jeor)
  const bmr = Math.round(
    gender === 'Nam' 
      ? 10 * currentWeight + 6.25 * height - 5 * age + 5
      : 10 * currentWeight + 6.25 * height - 5 * age - 161
  );

  // TDEE (Vận động vừa phải = BMR * 1.375)
  const tdee = Math.round(bmr * 1.375);

  // =========================================================================
  // TRƯỜNG PHÁI ĂN CHAY & TRIẾT LÝ
  // =========================================================================
  const [dietType, setDietType] = useState('vegan'); // vegan, ovo-lacto, lacto, flexitarian
  const [strictPhilosophy, setStrictPhilosophy] = useState({
    noNguViTan: true, // Kiêng ngũ vị tân
    noProcessedMeat: true, // Hạn chế thực phẩm chế biến sẵn & giả thịt
    organicLocavore: true // Ưu tiên nông sản Organic & Địa phương
  });

  // =========================================================================
  // MỤC TIÊU SỨC KHỎE (TỐI ĐA 3)
  // =========================================================================
  const healthGoalOptions = [
    { id: 'muscle', label: 'Tăng cơ nạc (Muscle Gain)', icon: '💪' },
    { id: 'iron-b12', label: 'Bổ sung Sắt & B12', icon: '🩸' },
    { id: 'gut', label: 'Cải thiện hệ vi sinh ruột', icon: '🦠' },
    { id: 'bp-sugar', label: 'Cân bằng huyết áp / đường huyết', icon: '🩺' },
    { id: 'detox', label: 'Thanh lọc & Tăng năng lượng', icon: '⚡' },
    { id: 'sleep', label: 'Cải thiện giấc ngủ sâu', icon: '🌙' },
  ];

  const [selectedGoals, setSelectedGoals] = useState(['muscle', 'iron-b12', 'gut']);
  const [activityLevel, setActivityLevel] = useState('moderate'); // moderate (3-5 buổi/tuần)

  const handleToggleGoal = (id) => {
    if (selectedGoals.includes(id)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter(g => g !== id));
      }
    } else {
      if (selectedGoals.length < 3) {
        setSelectedGoals([...selectedGoals, id]);
      }
    }
  };

  // =========================================================================
  // CẢNH BÁO DỊ ỨNG & THỰC PHẨM LOẠI TRỪ
  // =========================================================================
  const [allergens, setAllergens] = useState([
    'Đậu phộng / Lạc',
    'Gluten / Lúa mì',
    'Sữa bò & Lactose',
    'Nấm tuyết (nhạy cảm nhẹ)'
  ]);
  const [newAllergenInput, setNewAllergenInput] = useState('');

  const handleAddAllergen = (item) => {
    const clean = (item || newAllergenInput).trim();
    if (clean && !allergens.includes(clean)) {
      setAllergens([...allergens, clean]);
      setNewAllergenInput('');
    }
  };

  const handleRemoveAllergen = (item) => {
    setAllergens(allergens.filter(a => a !== item));
  };

  // =========================================================================
  // TRẠNG THÁI LƯU / KHÔI PHỤC
  // =========================================================================
  const [saveToast, setSaveToast] = useState('');

  const handleSave = () => {
    setSaveToast('✅ Đã lưu thay đổi hồ sơ sức khỏe! Thuật toán AI đã tự động cập nhật lại thực đơn tuần.');
    setTimeout(() => setSaveToast(''), 3500);
  };

  const handleReset = () => {
    setGender('Nam');
    setAge(28);
    setHeight(175);
    setCurrentWeight(68);
    setTargetWeight(65);
    setDietType('vegan');
    setStrictPhilosophy({
      noNguViTan: true,
      noProcessedMeat: true,
      organicLocavore: true
    });
    setSelectedGoals(['muscle', 'iron-b12', 'gut']);
    setAllergens([
      'Đậu phộng / Lạc',
      'Gluten / Lúa mì',
      'Sữa bò & Lactose',
      'Nấm tuyết (nhạy cảm nhẹ)'
    ]);
    setSaveToast('🔄 Đã khôi phục dữ liệu hồ sơ gốc.');
    setTimeout(() => setSaveToast(''), 3000);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '1.75rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        
        {/* TOAST THÔNG BÁO LƯU */}
        {saveToast && (
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
            <span>{saveToast}</span>
          </div>
        )}

        {/* 1. TOP BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
          <span 
            style={{ cursor: 'pointer', color: '#059669', fontWeight: 600 }}
            onClick={() => onNavigate && onNavigate('home')}
          >
            Trang chủ
          </span>
          <span>/</span>
          <span style={{ color: '#475569', fontWeight: 600 }}>VeggieAI Workspace</span>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>Hồ sơ sức khỏe</span>
        </div>

        {/* 2. MAIN TITLE ROW & ACTION BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0', letterSpacing: '-0.5px' }}>
              Hồ sơ sức khỏe & Mục tiêu dinh dưỡng
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '780px', margin: 0, lineHeight: 1.6 }}>
              Thông tin thể trạng giúp AI Meal Planner & Chatbot cá nhân hóa thực đơn, tự động cân đối amino acid, vi chất non-heme và calo cho cơ thể bạn mỗi ngày.
            </p>
          </div>

          {/* 3 NÚT HÀNH ĐỘNG GÓC TRÊN PHẢI (CHUẨN HÓA THEO PHÂN TÍCH) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            
            {/* ĐỒNG BỘ APPLE HEALTH: DẠNG CHỈ HIỂN THỊ + NHÃN (CHỈ TRÊN APP) */}
            <div 
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                padding: '0.55rem 1rem',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'default',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
              title="Tính năng đồng bộ Apple Health / Garmin chỉ khả dụng trên ứng dụng di động VeggieAI"
            >
              <Smartphone size={16} color="#059669" />
              <span>Đồng bộ Apple Health</span>
              <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '8px', fontWeight: 700 }}>
                Chỉ trên App
              </span>
            </div>

            {/* NÚT KHÔI PHỤC GỐC */}
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '0.55rem 1rem',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={15} />
              <span>Khôi phục gốc</span>
            </button>

            {/* NÚT LƯU THAY ĐỔI */}
            <button
              type="button"
              onClick={handleSave}
              style={{
                background: '#059669',
                border: 'none',
                color: '#ffffff',
                padding: '0.58rem 1.25rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Save size={16} />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>

        {/* 3. MAIN 2-COLUMN GRID LAYOUT (62% LEFT / 38% RIGHT) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.62fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
          
          {/* ================================================================= */}
          {/* CỘT TRÁI: 4 CARDS NỘI DUNG CHÍNH (WF01 / WF02) */}
          {/* ================================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            
            {/* ------------------------------------------------------------- */}
            {/* CARD 1: CHỈ SỐ THỂ TRẠNG & ĐÁNH GIÁ BMI */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Chỉ số thể trạng & Đánh giá BMI
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.15rem 0 0 0' }}>
                      Số liệu nhân trắc học dùng để tính toán BMR và TDEE chuẩn WHO
                    </p>
                  </div>
                </div>

                <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '10px', fontWeight: 700 }}>
                  Tự động đồng bộ
                </span>
              </div>

              {/* 5 INPUT COLUMNS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {/* Giới tính sinh học */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Giới tính sinh học
                  </label>
                  <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
                    <button
                      type="button"
                      onClick={() => setGender('Nam')}
                      style={{
                        flex: 1,
                        background: gender === 'Nam' ? '#059669' : 'transparent',
                        color: gender === 'Nam' ? 'white' : '#64748b',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.45rem 0',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Nam
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('Nữ')}
                      style={{
                        flex: 1,
                        background: gender === 'Nữ' ? '#059669' : 'transparent',
                        color: gender === 'Nữ' ? 'white' : '#64748b',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.45rem 0',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Nữ
                    </button>
                  </div>
                </div>

                {/* Tuổi */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Tuổi
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.45rem 2rem 0.45rem 0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}
                    />
                    <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#94a3b8' }}>tuổi</span>
                  </div>
                </div>

                {/* Chiều cao */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Chiều cao
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.45rem 1.85rem 0.45rem 0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}
                    />
                    <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#94a3b8' }}>cm</span>
                  </div>
                </div>

                {/* Cân nặng hiện tại */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Cân nặng hiện tại
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.45rem 1.85rem 0.45rem 0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}
                    />
                    <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#94a3b8' }}>kg</span>
                  </div>
                </div>

                {/* Cân nặng mục tiêu */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Cân nặng mục tiêu
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.45rem 1.85rem 0.45rem 0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}
                    />
                    <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#94a3b8' }}>kg</span>
                  </div>
                </div>
              </div>

              {/* BMI GAUGE & SCALE BAR */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', border: '1px solid #eef2f6', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  
                  {/* BMI BADGE & TEXT */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#059669', color: 'white', borderRadius: '14px', padding: '0.65rem 1rem', textAlign: 'center', minWidth: '85px', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.85 }}>BMI</div>
                      <div style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: 1 }}>{bmi}</div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                          Thể trạng Lý Tưởng
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          • Phạm vi chuẩn: 18.5 – 24.9
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                        Cần giảm <strong>{(currentWeight - targetWeight).toFixed(1)} kg</strong> mỡ nội tạng để đạt mục tiêu vóc dáng săn chắc.
                      </p>
                    </div>
                  </div>

                  {/* BMI COLOR BAR */}
                  <div style={{ minWidth: '220px', flex: 1, maxWidth: '280px' }}>
                    <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.45rem' }}>
                      <div style={{ flex: 18.5, background: '#3b82f6' }} title="Thiếu cân (< 18.5)" />
                      <div style={{ flex: 6.4, background: '#10b981', position: 'relative' }} title="Chuẩn (18.5 - 24.9)" />
                      <div style={{ flex: 5, background: '#f59e0b' }} title="Tiền thừa cân (25 - 29.9)" />
                      <div style={{ flex: 10, background: '#ef4444' }} title="Thừa cân (> 30)" />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                      <span>18.5</span>
                      <span style={{ color: '#047857', fontWeight: 800 }}>● {bmi} (Bạn)</span>
                      <span>24.9</span>
                      <span>30.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* HÀNG THỐNG SÊ BMR, TDEE & MỠ */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tỷ lệ mỡ ước tính</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{bodyFat}%</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flame size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Chuyển hoá cơ bản (BMR)</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{bmr.toLocaleString()} kcal</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flame size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tiêu thụ hàng ngày (TDEE)</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{tdee.toLocaleString()} kcal</div>
                  </div>
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 2: TRƯỜNG PHÁI ĂN CHAY & TRIẾT LÝ DINH DƯỠNG */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Trường phái ăn chay & Triết lý dinh dưỡng
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.15rem 0 0 0' }}>
                    Lựa chọn chế độ ăn giúp AI lọc thành phần và đề xuất phương pháp nấu nướng
                  </p>
                </div>
              </div>

              {/* 4 CARDS GRID 2x2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.25rem 0' }}>
                
                {/* 1. Thuần chay (Vegan) */}
                <div 
                  onClick={() => setDietType('vegan')}
                  style={{
                    padding: '1.15rem',
                    borderRadius: '14px',
                    border: dietType === 'vegan' ? '2px solid #059669' : '1px solid #e2e8f0',
                    background: dietType === 'vegan' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #059669', background: dietType === 'vegan' ? '#059669' : 'transparent' }} />
                      <span>Thuần chay (Vegan)</span>
                    </div>
                    <Leaf size={16} color="#059669" />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                    100% nguồn gốc thực vật, không thịt cá, trứng sữa, mật ong hay phụ gia từ động vật.
                  </p>
                </div>

                {/* 2. Chay có trứng & sữa */}
                <div 
                  onClick={() => setDietType('ovo-lacto')}
                  style={{
                    padding: '1.15rem',
                    borderRadius: '14px',
                    border: dietType === 'ovo-lacto' ? '2px solid #059669' : '1px solid #e2e8f0',
                    background: dietType === 'ovo-lacto' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #94a3b8', background: dietType === 'ovo-lacto' ? '#059669' : 'transparent' }} />
                      <span>Chay có trứng & sữa</span>
                    </div>
                    <Award size={16} color="#94a3b8" />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                    Lacto-Ovo Vegetarian: Bổ sung nguồn đạm từ trứng gà hữu cơ và sữa tiệt trùng sạch.
                  </p>
                </div>

                {/* 3. Ăn chay có sữa (Lacto) */}
                <div 
                  onClick={() => setDietType('lacto')}
                  style={{
                    padding: '1.15rem',
                    borderRadius: '14px',
                    border: dietType === 'lacto' ? '2px solid #059669' : '1px solid #e2e8f0',
                    background: dietType === 'lacto' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #94a3b8', background: dietType === 'lacto' ? '#059669' : 'transparent' }} />
                      <span>Ăn chay có sữa (Lacto)</span>
                    </div>
                    <Award size={16} color="#94a3b8" />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                    Sử dụng sữa, phô mai, sữa chua thực vật & bơ động vật; không sử dụng trứng.
                  </p>
                </div>

                {/* 4. Chay linh hoạt (Flexitarian) */}
                <div 
                  onClick={() => setDietType('flexitarian')}
                  style={{
                    padding: '1.15rem',
                    borderRadius: '14px',
                    border: dietType === 'flexitarian' ? '2px solid #059669' : '1px solid #e2e8f0',
                    background: dietType === 'flexitarian' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #94a3b8', background: dietType === 'flexitarian' ? '#059669' : 'transparent' }} />
                      <span>Chay linh hoạt (Flexitarian)</span>
                    </div>
                    <Award size={16} color="#94a3b8" />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                    Chủ yếu ăn thực vật, chuyển đổi dần từng ngày hoặc ăn chay 4–5 ngày/tuần.
                  </p>
                </div>
              </div>

              {/* 3 CHECKBOXES TRIẾT LÝ ĂN CHAY VIỆT NAM */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.15rem' }}>
                
                {/* 1. Ngũ vị tân */}
                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    background: strictPhilosophy.noNguViTan ? '#f0fdf4' : '#f8fafc',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>🌱</span>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                        Kiêng Ngũ vị tân (Hành, tỏi, hẹ, kiệu, củ nén)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Phù hợp ăn chay Phật giáo, thiền định, tránh kích thích thân tâm.
                      </div>
                    </div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={strictPhilosophy.noNguViTan}
                    onChange={(e) => setStrictPhilosophy({ ...strictPhilosophy, noNguViTan: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                </label>

                {/* 2. Thực phẩm chế biến sẵn */}
                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    background: strictPhilosophy.noProcessedMeat ? '#f0fdf4' : '#f8fafc',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>🥩</span>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                        Hạn chế thực phẩm chế biến sẵn & giả thịt công nghiệp
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Ưu tiên đậu phụ tươi, tempeh lên men, nấm nguyên bản, không dùng chất bảo quản.
                      </div>
                    </div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={strictPhilosophy.noProcessedMeat}
                    onChange={(e) => setStrictPhilosophy({ ...strictPhilosophy, noProcessedMeat: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                </label>

                {/* 3. Nông sản địa phương Locavore */}
                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    background: strictPhilosophy.organicLocavore ? '#f0fdf4' : '#f8fafc',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>🚜</span>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                        Ưu tiên nông sản Organic & Địa phương theo mùa (Locavore)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Hạn chế dấu chân carbon, tối đa lượng enzym sống từ rau củ tươi Đà Lạt.
                      </div>
                    </div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={strictPhilosophy.organicLocavore}
                    onChange={(e) => setStrictPhilosophy({ ...strictPhilosophy, organicLocavore: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                </label>

              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 3: MỤC TIÊU SỨC KHỎE & CƯỜNG ĐỘ VẬN ĐỘNG */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Mục tiêu sức khỏe & Cường độ vận động
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.15rem 0 0 0' }}>
                    AI sẽ điều chỉnh tỷ lệ macro Đạm – Tinh bột – Chất béo khớp với chu kỳ vận động
                  </p>
                </div>
              </div>

              {/* CHỌN MỤC TIÊU HÀNG ĐẦU (TỐI ĐA 3) */}
              <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  CHỌN MỤC TIÊU HÀNG ĐẦU (TỐI ĐA 3)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                  {healthGoalOptions.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleToggleGoal(goal.id)}
                        style={{
                          padding: '0.75rem 0.65rem',
                          borderRadius: '12px',
                          border: isSelected ? '1px solid #059669' : '1px solid #e2e8f0',
                          background: isSelected ? '#046a47' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334155',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{goal.icon}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MỨC ĐỘ HOẠT ĐỘNG THỂ CHẤT */}
              <div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                  MỨC ĐỘ HOẠT ĐỘNG THỂ CHẤT (ACTIVITY LEVEL)
                </div>
                <div style={{ position: 'relative' }}>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      background: '#f8fafc',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="sedentary">Ít vận động (Công việc văn phòng, ít đi lại)</option>
                    <option value="moderate">Vận động vừa phải (3–5 buổi/tuần – Gym, chạy bộ 5km, HIIT)</option>
                    <option value="very_active">Cường độ cao (6–7 buổi/tuần – Tập tạ nặng, vận động viên)</option>
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 4: CẢNH BÁO DỊ ỨNG & THỰC PHẨM LOẠI TRỪ */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Cảnh báo Dị ứng & Thực phẩm loại trừ
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.15rem 0 0 0' }}>
                    Lớp bảo vệ tuyệt đối: AI sẽ loại bỏ triệt để các món hoặc gia vị chứa thành phần này
                  </p>
                </div>
              </div>

              {/* ALLERGEN GUARD BANNER */}
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                margin: '1.15rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}>
                <ShieldAlert size={20} color="#e11d48" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#9f1239', lineHeight: 1.45 }}>
                  <strong>Bảo vệ an toàn sức khỏe:</strong> Mọi công thức đề xuất sẽ chạy qua bộ lọc <em>Allergen Guard</em> trước khi xuất hiện trên thực đơn tuần.
                </span>
              </div>

              {/* LIST OF CURRENT ALLERGENS */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Các thành phần hiện tại đang bị loại trừ:
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {allergens.map((item, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fecdd3',
                        color: '#9f1239',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e11d48' }} />
                      <span>{item}</span>
                      <X 
                        size={14} 
                        style={{ cursor: 'pointer', opacity: 0.7 }}
                        onClick={() => handleRemoveAllergen(item)}
                      />
                    </span>
                  ))}

                  {/* INPUT THÊM DỊ ỨNG */}
                  <input
                    type="text"
                    placeholder="+ Gõ thêm chất dị ứng và Enter..."
                    value={newAllergenInput}
                    onChange={(e) => setNewAllergenInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAllergen()}
                    style={{
                      border: '1px dashed #cbd5e1',
                      borderRadius: '20px',
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      outline: 'none',
                      background: 'transparent',
                      minWidth: '220px'
                    }}
                  />
                </div>
              </div>

              {/* GỢI Ý PHỔ BIẾN NHANH */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Gợi ý phổ biến nhanh:</span>
                {['+ Đậu nành', '+ Hạt điều', '+ Mè / Vừng', '+ Quả Kiwi', '+ Rau cần tây'].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddAllergen(s.replace('+ ', ''))}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '0.74rem',
                      color: '#475569',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* TÌNH TRẠNG TIÊU HOÁ & BỆNH LÝ */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                  Tình trạng tiêu hoá & bệnh lý kèm theo:
                </span>
                <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                  Dạ dày nhạy cảm
                </span>
                <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                  Thiếu máu nhẹ
                </span>
              </div>

            </div>

          </div>

          {/* ================================================================= */}
          {/* CỘT PHẢI: KHUYẾN NGHỊ TỪ AI, ĐỘ KHỚP THUẬT TOÁN, BIẾN ĐỘNG 4 TUẦN */}
          {/* ================================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* ------------------------------------------------------------- */}
            {/* CARD 1: KHUYẾN NGHỊ TỪ AI (RNI 2024) */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                  <Sparkles size={18} color="#059669" />
                  <span>Khuyến nghị từ AI</span>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  RNI 2024
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 1rem 0' }}>
                Chỉ số dinh dưỡng đa lượng tối ưu cho mục tiêu <strong>Tăng cơ nạc</strong> với cường độ <strong>Vận động vừa phải</strong>:
              </p>

              {/* NĂNG LƯỢNG MỤC TIÊU BOX */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
                    NĂNG LƯỢNG MỤC TIÊU
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                    2,150 <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>kcal / ngày</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Thâm hụt nhẹ</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>-100 kcal</div>
                </div>
              </div>

              {/* 3 MACRO BARS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {/* Đạm thực vật */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>● Đạm thực vật (Protein)</span>
                    <span style={{ fontWeight: 800, color: '#059669' }}>85g (20%)</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#64748b', marginBottom: '0.35rem' }}>
                    1.25g / kg thể trọng • Đậu lăng, Tempeh, Hạt bí
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px' }}>
                    <div style={{ width: '20%', height: '100%', background: '#10b981', borderRadius: '3px' }} />
                  </div>
                </div>

                {/* Carb phức hợp */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>● Carb phức hợp (Chậm hấp thu)</span>
                    <span style={{ fontWeight: 800, color: '#f59e0b' }}>270g (50%)</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#64748b', marginBottom: '0.35rem' }}>
                    Gạo lứt huyết rồng, yến mạch cán dẹt, khoai lang
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px' }}>
                    <div style={{ width: '50%', height: '100%', background: '#f59e0b', borderRadius: '3px' }} />
                  </div>
                </div>

                {/* Chất béo tốt */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>● Chất béo tốt (Omega-3 & 9)</span>
                    <span style={{ fontWeight: 800, color: '#ea580c' }}>72g (30%)</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#64748b', marginBottom: '0.35rem' }}>
                    Dầu oliu nguyên chất, hạt lanh xay, quả bơ sáp
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px' }}>
                    <div style={{ width: '30%', height: '100%', background: '#ea580c', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>

              {/* 3 MICRO NUTRIENTS BOXES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Chất xơ tự nhiên</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>38g / ngày</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Sắt Non-heme</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>18 mg / ngày</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Vitamin B12 cần bổ sung</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span>2.8 mcg</span>
                    <Pill size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 2: ĐỘ KHỚP THUẬT TOÁN AI */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Độ khớp thuật toán AI</span>
                <ShieldAlert size={16} color="#059669" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                {/* Score Circle */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '4px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: '#047857',
                  flexShrink: 0
                }}>
                  94
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Hồ sơ chi tiết xuất sắc!</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                    Thuật toán có đủ 9 chỉ số mấu chốt để tránh hoàn toàn dị ứng đậu phộng/gluten và bảo đảm đủ đạm.
                  </div>
                </div>
              </div>

              {/* GỢI Ý TỪ CHEF AI */}
              <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '0.85rem', borderLeft: '3px solid #059669', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={13} /> Gợi ý từ Chef AI:
                </div>
                <p style={{ fontSize: '0.78rem', color: '#065f46', margin: 0, lineHeight: 1.5 }}>
                  “Vì bạn kiêng ngũ vị tân nhưng cần nạp 85g đạm, AI sẽ thay thế hành tỏi bằng <strong>ngò gai, lá boa-rô và thì là</strong> kết hợp sốt men dinh dưỡng mặn thơm.”
                </p>
              </div>

              {/* NÚT TẠO THỰC ĐƠN TUẦN TỪ HỒ SƠ NÀY */}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('planner')}
                style={{
                  width: '100%',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Tạo thực đơn tuần từ hồ sơ này</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 3: BIẾN ĐỘNG 4 TUẦN (BIỂU ĐỒ BMI) */}
            {/* ------------------------------------------------------------- */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Biến động 4 tuần</span>
                <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  -1.8 kg
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                BMI giảm từ 22.8 xuống 22.2 đạt chỉ số chuẩn.
              </p>

              {/* BIỂU ĐỒ SVG LINE CHART MƯỢT MÀ */}
              <div style={{ height: '60px', width: '100%', marginBottom: '0.65rem' }}>
                <svg viewBox="0 0 300 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <path
                    d="M 10,20 Q 80,35 150,28 T 290,45"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Data Points */}
                  <circle cx="10" cy="20" r="4" fill="#059669" />
                  <circle cx="100" cy="30" r="4" fill="#059669" />
                  <circle cx="200" cy="30" r="4" fill="#059669" />
                  <circle cx="290" cy="45" r="5" fill="#047857" stroke="white" strokeWidth="2" />
                </svg>
              </div>

              {/* 4 MỐC TUẦN */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                <span>Tuần 1 (69.8kg)</span>
                <span>Tuần 2</span>
                <span>Tuần 3</span>
                <span style={{ color: '#059669', fontWeight: 800 }}>Hiện tại (68kg)</span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 4: ĐỀ XUẤT TUẦN NÀY (KẾT NỐI VỚI MEAL PLANNER) */}
            {/* ------------------------------------------------------------- */}
            <div 
              onClick={() => onNavigate && onNavigate('planner')}
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                height: '190px',
                backgroundImage: `url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.2) 60%)' }} />
              
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', color: 'white' }}>
                <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, display: 'inline-block', marginBottom: '0.35rem' }}>
                  ĐỀ XUẤT TUẦN NÀY
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: 'white' }}>
                  Tempeh nướng ngò gai & bí đỏ hạt chia
                </h3>
                <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: 0 }}>
                  Chuẩn thuần chay • Giàu đạm thực vật
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* 4. FOOTER QUY ĐỊNH */}
        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '3.5rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', color: '#64748b' }}>
          <div>© 2026 VeggieAI. Nền tảng dinh dưỡng thuần chay thông minh.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Chính sách bảo mật</span>
            <span style={{ cursor: 'pointer' }}>Điều khoản sử dụng</span>
            <span style={{ cursor: 'pointer' }}>Hỗ trợ chuyên gia</span>
          </div>
        </div>

      </div>
    </div>
  );
}
