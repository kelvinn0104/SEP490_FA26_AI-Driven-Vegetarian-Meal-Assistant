import React, { useState, useEffect } from 'react';
import { 
  Flame, TrendingUp, ShieldCheck, Zap, Activity, ChevronRight,
  FileText, Smartphone, Plus, Calendar, Clock, CheckCircle2,
  Sparkles, ArrowRight, MessageSquare, Info, AlertCircle, X,
  Download, Eye, Droplets, Scale, Check, Leaf, Shield
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export default function NutritionDashboardPage({ onNavigate }) {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // STATE BỘ LỌC THỜI GIAN
  const [timeFilter, setTimeFilter] = useState('7d'); // 'today', '7d', '30d', 'quarter', 'custom'

  // MODAL STATES
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [showAppleHealthModal, setShowAppleHealthModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // DỮ LIỆU BIỂU ĐỒ CALO 7 NGÀY (STACKED BARS)
  const chartDays = [
    { day: 'Th 2', date: '18/11', breakfast: 510, lunch: 780, dinner: 570, snack: 200, total: 2060 },
    { day: 'Th 3', date: '19/11', breakfast: 490, lunch: 750, dinner: 580, snack: 190, total: 2010 },
    { day: 'Th 4', date: '20/11', breakfast: 530, lunch: 790, dinner: 600, snack: 200, total: 2120 },
    { day: 'Th 5', date: '21/11', breakfast: 500, lunch: 760, dinner: 580, snack: 200, total: 2040 },
    { day: 'Th 6', date: '22/11', breakfast: 510, lunch: 780, dinner: 590, snack: 210, total: 2090 },
    { day: 'Th 7', date: '23/11', breakfast: 520, lunch: 800, dinner: 610, snack: 220, total: 2150 },
    { day: 'CN',   date: '24/11', breakfast: 475, lunch: 680, dinner: 490, snack: 180, total: 1825 }
  ];

  const targetCalo = 2080;
  const maxChartHeight = 2400; // Calo scale max for 100% height

  // STATE FORM GHI NHANH BỮA ĂN
  const [quickLog, setQuickLog] = useState({
    mealSlot: 'Trưa',
    dishName: '',
    calories: '',
    protein: ''
  });

  const handleQuickLogSubmit = (e) => {
    e.preventDefault();
    if (!quickLog.dishName) return;
    showToast(`✓ Đã ghi nhận bữa ${quickLog.mealSlot}: "${quickLog.dishName}" (${quickLog.calories || 450} kcal)!`);
    setQuickLog({ mealSlot: 'Trưa', dishName: '', calories: '', protein: '' });
    setShowQuickLogModal(false);
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
          <span style={{ color: '#047857', fontWeight: 700 }}>VeggieAI Workspace</span>
        </div>

        {/* PILL TAGS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '14px', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={12} /> Phân tích cá nhân hóa bởi VeggieAI
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
            Cập nhật 15 phút trước
          </span>
        </div>

        {/* TITLE & TOP ACTIONS (SỬA LỖI 5 & 6 THEO YÊU CẦU: BỎ Y KHOA, SỬA APPLE HEALTH CHỈ TRÊN APP) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
              Dashboard Dinh Dưỡng & Xu Hướng Sức Khỏe Cá Nhân
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, maxWidth: '820px', lineHeight: 1.5 }}>
              Theo dõi định lượng Calo, Đạm thực vật, Vi chất thiết yếu và Tỷ lệ hoàn thành mục tiêu thể trạng dựa trên dữ liệu nhật ký bữa ăn lâm sàng.
            </p>
          </div>

          {/* TOP RIGHT ACTION BUTTONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* 1. XUẤT BÁO CÁO PDF (ĐÃ BỎ CHỮ Y KHOA THEO YÊU CẦU SỐ 5) */}
            <button
              type="button"
              onClick={() => setShowPdfExportModal(true)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '0.65rem 1.05rem',
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
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              <Download size={15} color="#059669" />
              <span>Xuất báo cáo PDF</span>
            </button>

            {/* 2. APPLE HEALTH (CHỈ TRÊN APP) - ĐÃ BỎ TRẠNG THÁI KẾT NỐI GIẢ THEO YÊU CẦU SỐ 6 */}
            <button
              type="button"
              onClick={() => setShowAppleHealthModal(true)}
              style={{
                background: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                color: '#475569',
                padding: '0.65rem 1.05rem',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              title="Tính năng đồng bộ Apple Health chỉ khả dụng trên ứng dụng di động"
            >
              <Smartphone size={15} />
              <span>Apple Health (Chỉ trên App)</span>
            </button>

            {/* 3. GHI NHANH BỮA ĂN */}
            <button
              type="button"
              onClick={() => setShowQuickLogModal(true)}
              style={{
                background: '#046a47',
                border: 'none',
                color: '#ffffff',
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(4, 106, 71, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={16} />
              <span>Ghi nhanh bữa ăn</span>
            </button>
          </div>
        </div>

        {/* TIME FILTER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.45rem', background: '#ffffff', padding: '4px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            {[
              { id: 'today', label: 'Hôm nay' },
              { id: '7d', label: '7 ngày qua' },
              { id: '30d', label: '30 ngày' },
              { id: 'quarter', label: 'Quý này' },
              { id: 'custom', label: '📅 Tùy chỉnh ngày' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeFilter(tab.id)}
                style={{
                  background: timeFilter === tab.id ? '#046a47' : 'transparent',
                  color: timeFilter === tab.id ? '#ffffff' : '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>● <strong>Chu kỳ:</strong> 18/11 – 24/11/2026</span>
            <span>•</span>
            <span style={{ color: '#047857', fontWeight: 700 }}>21/21 Bữa chính được ghi nhận</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 METRIC CARDS ROW (SỬA LỖI 7: ĐÃ BỎ KHỐI VEGGIESCORE VÀ TOP 5% CỘNG ĐỒNG) */}
        {/* ========================================================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
          
          {/* Card 1: NĂNG LƯỢNG TB / NGÀY */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.35rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                NĂNG LƯỢNG TB / NGÀY
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={16} />
              </div>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '0.4rem' }}>
              2,045 <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/ 2,080 kcal</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', marginBottom: '0.65rem' }}>
              <span style={{ color: '#047857', fontWeight: 700 }}>98.3% mục tiêu năng lượng</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>▲ +1.2%</span>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#047857', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
              ✓ Cân đối hoàn hảo, xu hướng Ổn định
            </div>
          </div>

          {/* Card 2: ĐẠM THỰC VẬT (PROTEIN) */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.35rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ĐẠM THỰC VẬT (PROTEIN)
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} />
              </div>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '0.4rem' }}>
              84.5 <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/ 85 g</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.65rem' }}>
              <span style={{ color: '#047857', fontWeight: 700 }}>99.4% chỉ tiêu RNI</span>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Giữ cơ nạc</span>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#475569', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px' }}>
              Đậu hũ tươi, Quinoa, Đậu gà, Hạt chia
            </div>
          </div>

          {/* Card 3: VI CHẤT VÀNG THUẦN CHAY */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.35rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                VI CHẤT VÀNG THUẦN CHAY
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={16} />
              </div>
            </div>

            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '0.4rem' }}>
              Tối Ưu <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>(B12, Sắt, Kẽm)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.65rem' }}>
              <span>Sắt: <strong style={{ color: '#047857' }}>104%</strong></span>
              <span>B12: <strong style={{ color: '#047857' }}>110%</strong></span>
              <span>Kẽm: <strong style={{ color: '#2563eb' }}>95%</strong></span>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#047857', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
              ✓ Không có nguy cơ thiếu máu hay mệt mỏi
            </div>
          </div>

          {/* Card 4: TUÂN THỦ MỤC TIÊU (THAY THẾ VEGGIESCORE ĐÃ BỎ) */}
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.35rem 1.4rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                TUÂN THỦ MỤC TIÊU THỰC ĐƠN
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} />
              </div>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#047857', lineHeight: 1.1, marginBottom: '0.4rem' }}>
              96.8% <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>(21/21 Bữa)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', marginBottom: '0.65rem' }}>
              <span style={{ color: '#047857', fontWeight: 700 }}>7/7 ngày đạt chuẩn Macro & Calo</span>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#047857', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
              ✓ Thể trạng năng động, kiểm soát tốt cân nặng
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MAIN 2 COLUMNS: LEFT 65%, RIGHT 35% */}
        {/* ========================================================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: XU HƯỚNG CALO, CÂN BẰNG ĐA LƯỢNG, BẢN ĐỒ VI CHẤT */}
          {/* --------------------------------------------------------------------- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            
            {/* KHỐI 1: XU HƯỚNG NẠP CALO & PHÂN BỔ BỮA ĂN (INTERACTIVE CHART) */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem 1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                    Xu Hướng Nạp Calo & Phân Bổ Bữa Ăn
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                    Dữ liệu nạp calo chi tiết từng ngày theo 3 bữa chính và bữa phụ
                  </p>
                </div>

                {/* LEGEND CHÚ THÍCH MÀU */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#334155' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#34d399' }}></span> Bữa Sáng
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#334155' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#059669' }}></span> Bữa Trưa
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#334155' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#047857' }}></span> Bữa Tối
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#334155' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f97316' }}></span> Snack / Ăn vặt
                  </span>
                </div>
              </div>

              {/* STACKED BAR CHART CONTAINER */}
              <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 1rem 1.5rem 1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                
                {/* TARGET CALO LINE (ĐƯỜNG MỤC TIÊU 2,080 KCAL) */}
                <div style={{
                  position: 'absolute',
                  top: `${100 - (targetCalo / maxChartHeight) * 100}%`,
                  left: '1rem',
                  right: '1rem',
                  borderTop: '1.5px dashed #ef4444',
                  zIndex: 2,
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    background: '#fef2f2',
                    color: '#b91c1c',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    transform: 'translateY(-50%)',
                    border: '1px solid #fecaca'
                  }}>
                    Mục tiêu: {targetCalo} kcal
                  </span>
                </div>

                {/* 7 STACKED BARS */}
                {chartDays.map((item, idx) => {
                  const bPct = (item.breakfast / maxChartHeight) * 100;
                  const lPct = (item.lunch / maxChartHeight) * 100;
                  const dPct = (item.dinner / maxChartHeight) * 100;
                  const sPct = (item.snack / maxChartHeight) * 100;

                  return (
                    <div 
                      key={idx} 
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '42px', zIndex: 3, cursor: 'pointer' }}
                      title={`${item.day} (${item.date}): Tổng ${item.total} kcal (Sáng: ${item.breakfast}, Trưa: ${item.lunch}, Tối: ${item.dinner}, Phụ: ${item.snack})`}
                    >
                      {/* Total number on top */}
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                        {item.total}
                      </span>

                      {/* Stacked bar segments */}
                      <div style={{ width: '28px', height: '160px', display: 'flex', flexDirection: 'column-reverse', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
                        <div style={{ height: `${bPct * 1.5}%`, background: '#34d399' }}></div>
                        <div style={{ height: `${lPct * 1.5}%`, background: '#059669' }}></div>
                        <div style={{ height: `${dPct * 1.5}%`, background: '#047857' }}></div>
                        <div style={{ height: `${sPct * 1.5}%`, background: '#f97316' }}></div>
                      </div>

                      {/* Day Label */}
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginTop: '6px' }}>
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 4 SUMMARY BOXES BÊN DƯỚI */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Bữa Sáng TB</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>505 kcal</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Bữa Trưa TB</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>760 kcal</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Bữa Tối TB</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>580 kcal</div>
                </div>
                <div style={{ background: '#fff7ed', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                  <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 600 }}>Snack TB</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>200 kcal</div>
                </div>
              </div>
            </div>

            {/* KHỐI 2: CÂN BẰNG ĐA LƯỢNG (MACRONUTRIENTS & XƠ) */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem 1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                    Cân Bằng Đa Lượng (Macronutrients & Xơ)
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                    Tỷ lệ năng lượng chuẩn vàng cho người vận động và duy trì khối cơ thuần chay
                  </p>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} />
                </div>
              </div>

              {/* 2 PHẦN: DONUT CHART BÊN TRÁI & 4 TIÊU CHÍ BÊN PHẢI */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.75rem', alignItems: 'center' }}>
                
                {/* DONUT CHART SIMULATION */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1.5rem 1rem', borderRadius: '18px', border: '1px solid #f1f5f9' }}>
                  <div style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: 'conic-gradient(#059669 0% 17%, #ea580c 17% 49%, #10b981 49% 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
                  }}>
                    {/* Inner hole */}
                    <div style={{
                      width: '95px',
                      height: '95px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TỔNG ĐA LƯỢNG</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>416g</span>
                      <span style={{ fontSize: '0.62rem', color: '#059669', fontWeight: 700 }}>100% Thuần Chay</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem', fontSize: '0.72rem', fontWeight: 700 }}>
                    <span style={{ color: '#047857' }}>● Carbs 51%</span>
                    <span style={{ color: '#ea580c' }}>● Fats 32%</span>
                    <span style={{ color: '#059669' }}>● Protein 17%</span>
                  </div>
                </div>

                {/* 4 DETAIL BREAKDOWN PROGRESS BARS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  
                  {/* Carbs */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                      <span style={{ color: '#047857' }}>● Tinh bột chuyển hóa chậm (Complex Carbs)</span>
                      <span style={{ color: '#0f172a' }}>260g (51% calo)</span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                      <div style={{ width: '75%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Nguồn: Yến mạch thô, khoai lang nướng, gạo lứt tím than, hạt quinoa đỏ.
                    </div>
                  </div>

                  {/* Protein */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                      <span style={{ color: '#059669' }}>● Đạm thực vật tinh khiết (Plant Protein)</span>
                      <span style={{ color: '#0f172a' }}>85g (17% calo)</span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                      <div style={{ width: '85%', height: '100%', background: '#059669', borderRadius: '4px' }}></div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Đạt chuẩn 9/9 axit amin thiết yếu (đủ Leucine, Isoleucine, Valine).
                    </div>
                  </div>

                  {/* Fats */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                      <span style={{ color: '#ea580c' }}>● Chất béo không bão hòa (Omega 3-6-9)</span>
                      <span style={{ color: '#0f172a' }}>71g (32% calo)</span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                      <div style={{ width: '65%', height: '100%', background: '#ea580c', borderRadius: '4px' }}></div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Nguồn: Bơ sáp Đắk Lắk, hạt lanh nghiền, dầu ô-liu extra virgin, hạt chia.
                    </div>
                  </div>

                  {/* Fiber */}
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.65rem 0.85rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#065f46' }}>Chất xơ tự nhiên (Dietary Fiber)</div>
                      <div style={{ fontSize: '0.72rem', color: '#047857' }}>✓ Vượt khuyến nghị 130% RNI • Bảo vệ vi sinh đường ruột</div>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>39.5g</span>
                  </div>

                </div>

              </div>
            </div>

            {/* KHỐI 3: BẢN ĐỒ VI CHẤT VÀNG (SỬA LỖI 4: ĐÃ BỎ "CHUẨN VIỆN DINH DƯỠNG QUỐC GIA") */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem 1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                    Bản Đồ Vi Chất Vàng (Micronutrient Health Matrix)
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                    Phân tích 6 vi chất thiết yếu thường gặp thách thức trong lối sống thuần chay
                  </p>
                </div>
                {/* LƯU Ý: ĐÃ BỎ NHÃN "CHUẨN: VIỆN DINH DƯỠNG QUỐC GIA" THEO YÊU CẦU */}
              </div>

              {/* GRID 6 MICRO-NUTRIENT CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                
                {/* 1. Sắt Non-Heme */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        Fe
                      </span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Sắt Non-Heme</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Kèm 95mg Vit C tăng hấp thu</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>18.8 mg</div>
                      <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>104% Mục tiêu</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#059669' }}></div>
                  </div>
                </div>

                {/* 2. Vitamin B12 */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        B12
                      </span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Vitamin B12</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Men dinh dưỡng & sữa hạt bổ sung</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>3.1 mcg</div>
                      <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>110% Mục tiêu</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#059669' }}></div>
                  </div>
                </div>

                {/* 3. Canxi (Calcium) */}
                <div style={{ background: '#fffbeb', borderRadius: '14px', padding: '1rem', border: '1px solid #fef3c7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        Ca
                      </span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Canxi (Calcium)</div>
                        <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600 }}>Cần bổ sung thêm cải xoăn / mè</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309' }}>880 mg</div>
                      <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 700 }}>88% (Cần 1,000mg)</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#fde68a', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '88%', height: '100%', background: '#d97706' }}></div>
                  </div>
                </div>

                {/* 4. Kẽm (Zinc) */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        Zn
                      </span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Kẽm (Zinc)</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Từ hạt bí ngô & đậu lăng</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d4ed8' }}>11.2 mg</div>
                      <span style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 700 }}>93% Mục tiêu</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '93%', height: '100%', background: '#2563eb' }}></div>
                  </div>
                </div>

                {/* 5. Omega-3 (ALA) */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        Ω3
                      </span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Omega-3 (ALA)</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Từ hạt chia & quả óc chó</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>2.4 g</div>
                      <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>160% Vượt chuẩn</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#059669' }}></div>
                  </div>
                </div>

                {/* 6. Vitamin D3 */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        D3
                      </span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Vitamin D3 Thuần Chay</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Nấm hương phơi nắng & bổ sung</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857' }}>600 IU</div>
                      <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>100% Hoàn hảo</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#059669' }}></div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: CHUYÊN GIA AI, CHỈ SỐ SINH HỌC, AN TOÀN & TOP MÓN ĂN */}
          {/* --------------------------------------------------------------------- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* CARD 1: CHUYÊN GIA AI VEGGIENUTRI (NHẬN ĐỊNH LÂM SÀNG TUẦN) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Chuyên Gia AI VeggieNutri
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Nhận định dinh dưỡng tuần</span>
                  </div>
                </div>

                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px' }}>
                  AI PRO
                </span>
              </div>

              <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.55, marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.65rem 0' }}>
                  <strong>Chào {user?.name || 'Minh Tuấn'}!</strong> Tuần qua bạn duy trì tỷ lệ đạm thực vật cực kỳ ổn định (<strong>84.5g/ngày</strong>) giúp bảo toàn khối cơ nạc sau 4 buổi tập kháng lực. Tuy nhiên chỉ số <strong>Canxi đạt 88%</strong>, hơi thấp hơn mục tiêu một chút.
                </p>

                <div style={{ background: '#fffbeb', borderLeft: '3px solid #d97706', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', color: '#92400e' }}>
                  💡 <strong>Đề xuất cải thiện:</strong> Thêm 2 thìa hạt mè rang vào món salad trưa và uống thêm 200ml sữa hạnh nhân tăng cường canxi vào bữa phụ chiều nhé!
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('chatbot')}
                  style={{
                    flex: 1,
                    background: '#046a47',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <MessageSquare size={14} />
                  <span>Hỏi AI thêm về Canxi</span>
                </button>
              </div>
            </div>

            {/* CARD 2: CHỈ SỐ SINH HỌC & THỂ TRẠNG (SỬA LỖI 8: ĐÃ BỎ KHỐI THỬ THÁCH 21 NGÀY VÀ CHỨNG CHỈ VEGGIEMASTER) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scale size={18} color="#059669" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Chỉ Số Sinh Học & Thể Trạng
                  </h4>
                </div>

                <span 
                  onClick={() => onNavigate && onNavigate('user-profile')}
                  style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cập nhật →
                </span>
              </div>

              {/* 3 METRICS: CÂN NẶNG, MỠ NỘI TẠNG, NƯỚC */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1.15rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Cân nặng</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>67.8 kg</div>
                  <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>-0.4 kg</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Mỡ nội tạng</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>16.2%</div>
                  <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>Khỏe mạnh</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Nước cơ thể</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>59.8%</div>
                  <div style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 700 }}>Đủ nước</div>
                </div>
              </div>

              {/* TRENDLINE 7 NGÀY GRAPH SIMULATION */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.35rem' }}>
                  <span>Xu hướng cân nặng 7 ngày</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>Giảm mỡ, giữ cơ</span>
                </div>
                <div style={{ height: '36px', background: '#f1f5f9', borderRadius: '8px', padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
                  <svg width="100%" height="28" viewBox="0 0 200 28" fill="none">
                    <path d="M5 10 L40 12 L75 9 L110 14 L145 13 L175 19 L195 22" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="195" cy="22" r="4" fill="#047857" />
                  </svg>
                </div>
              </div>

              {/* LƯU Ý: ĐÃ BỎ HOÀN TOÀN KHỐI THỬ THÁCH 21 NGÀY VÀ CHỨNG CHỈ VEGGIEMASTER THEO YÊU CẦU */}
            </div>

            {/* CARD 3: AN TOÀN & MÔI TRƯỜNG */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0' }}>
                An Toàn & Môi Trường
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.75rem 0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#065f46' }}>Allergen Guard: 0 sự cố</div>
                    <div style={{ fontSize: '0.74rem', color: '#047857', lineHeight: 1.4 }}>Lọc thành công 100% đậu phộng, gluten và ngũ vị tân theo hồ sơ cá nhân.</div>
                  </div>
                </div>

                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '0.75rem 0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <Leaf size={18} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9a3412' }}>Zero-Waste Impact: 92% nguyên liệu</div>
                    <div style={{ fontSize: '0.74rem', color: '#c2410c', lineHeight: 1.4 }}>Đã giảm ~3.8kg CO2e và tiết kiệm ~185.000đ từ thực phẩm có sẵn trong tủ lạnh.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: TOP MÓN ĂN TIÊU BIỂU TUẦN */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Top Món Ăn Tiêu Biểu Tuần
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Đủ vi chất nhất</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  {
                    title: 'Buddha Bowl Đậu Hũ & Quinoa',
                    macro: '32g Protein • 8.5mg Sắt',
                    time: 'Nạp trưa Thứ 4',
                    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'
                  },
                  {
                    title: 'Súp Bí Đỏ Hạt Sen Nấm Đùi Gà',
                    macro: '28g Protein • 12g Xơ',
                    time: 'Nạp tối Thứ 6',
                    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=200&q=80'
                  },
                  {
                    title: 'Smoothie Bowl Yến Mạch & Chia',
                    macro: '18g Protein • Omega-3',
                    time: 'Nạp sáng Thứ 2',
                    img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=200&q=80'
                  }
                ].map((dish, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      backgroundImage: `url('${dish.img}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0
                    }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dish.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>
                        {dish.macro}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        {dish.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', textAlign: 'center' }}>
                <span 
                  onClick={() => onNavigate && onNavigate('planner')}
                  style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, cursor: 'pointer' }}
                >
                  Xem lại toàn bộ thực đơn đã nạp →
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: GHI NHANH BỮA ĂN (QUICK LOG MEAL) */}
      {/* ========================================================================= */}
      {showQuickLogModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '520px', width: '100%',
            padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setShowQuickLogModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              NHẬT KÝ THUẦN CHAY
            </span>
            <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
              Ghi Nhanh Bữa Ăn Hôm Nay
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Nhập món ăn hoặc đồ uống thuần chay bạn vừa thưởng thức để hệ thống cập nhật vào biểu đồ nạp năng lượng.
            </p>

            <form onSubmit={handleQuickLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Bữa ăn
                </label>
                <select 
                  value={quickLog.mealSlot} 
                  onChange={(e) => setQuickLog({ ...quickLog, mealSlot: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="Sáng">Bữa Sáng</option>
                  <option value="Trưa">Bữa Trưa</option>
                  <option value="Tối">Bữa Tối</option>
                  <option value="Snack / Ăn vặt">Snack / Ăn vặt</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Tên món ăn hoặc thực phẩm
                </label>
                <input 
                  type="text" 
                  placeholder="VD: Cơm gạo lứt đậu hũ sốt nấm, chè hạt sen..."
                  value={quickLog.dishName}
                  onChange={(e) => setQuickLog({ ...quickLog, dishName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Ước tính Calo (kcal)
                  </label>
                  <input 
                    type="number" 
                    placeholder="VD: 550"
                    value={quickLog.calories}
                    onChange={(e) => setQuickLog({ ...quickLog, calories: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Đạm ước tính (g)
                  </label>
                  <input 
                    type="number" 
                    placeholder="VD: 24"
                    value={quickLog.protein}
                    onChange={(e) => setQuickLog({ ...quickLog, protein: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <Button variant="secondary" type="button" onClick={() => setShowQuickLogModal(false)}>Hủy</Button>
                <Button type="submit">
                  <CheckCircle2 size={16} /> Lưu vào nhật ký
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: XUẤT BÁO CÁO PDF (ĐÃ BỎ CHỮ Y KHOA THEO YÊU CẦU SỐ 5) */}
      {/* ========================================================================= */}
      {showPdfExportModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '560px', width: '100%',
            padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setShowPdfExportModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              BÁO CÁO DINH DƯỠNG
            </span>
            <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
              Xuất Báo Cáo Dinh Dưỡng Tuần (PDF)
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Tài liệu tổng hợp dữ liệu nạp Calo, tỷ lệ hấp thu Đạm thực vật, và bản đồ 6 vi chất thiết yếu trong tuần qua.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#334155' }}>
              <div>👤 <strong>Hội viên:</strong> {user?.name || 'Minh Tuấn'}</div>
              <div>📅 <strong>Chu kỳ:</strong> 18/11/2026 – 24/11/2026 (Tuần 42)</div>
              <div>⚖️ <strong>Thể trạng:</strong> BMI 21.4 kg/m² • Thuần chay (Vegan)</div>
              <div>🎯 <strong>Độ tuân thủ RNI:</strong> 96.8% (2,045 kcal/ngày)</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowPdfExportModal(false)}>Đóng</Button>
              <Button onClick={() => {
                setShowPdfExportModal(false);
                window.print();
              }}>
                <Download size={16} /> Tải tệp PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: APPLE HEALTH NOTICE (SỬA LỖI 6: THÔNG BÁO TÍNH NĂNG TRÊN APP) */}
      {/* ========================================================================= */}
      {showAppleHealthModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '500px', width: '100%',
            padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setShowAppleHealthModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Smartphone size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              Đồng Bộ Apple Health Chỉ Hỗ Trợ Trên App Di Động
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Để đọc dữ liệu nhịp tim, số bước chân và calo tiêu hao thụ động từ Apple Watch hoặc cảm biến di động, bạn hãy cài đặt ứng dụng di động VeggieAI trên điện thoại.
            </p>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#047857' }}>
              💡 <strong>Trên Website:</strong> Bạn có thể sử dụng nút <strong>"Ghi nhanh bữa ăn"</strong> hoặc theo dõi dữ liệu thực đơn tuần tự động mà không cần kết nối thiết bị đeo.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowAppleHealthModal(false)}>
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
