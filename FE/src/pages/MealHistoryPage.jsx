import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Search, CheckCircle2, ChevronRight, 
  RotateCw, Eye, ShoppingCart, MoreVertical, Sparkles, Filter, 
  Download, Printer, Trash2, Share2, X, Clock, ChevronLeft,
  Check, Leaf, AlertCircle, Utensils
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export default function MealHistoryPage({ onNavigate }) {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // STATE TÌM KIẾM & BỘ LỌC
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [goalFilter, setGoalFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  // MODAL STATES
  const [previewWeek, setPreviewWeek] = useState(null);
  const [marketWeek, setMarketWeek] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // DỮ LIỆU CÁC TUẦN THỰC ĐƠN ĐÃ LƯU TRỮ (THEO CHUẨN MOCKUP)
  const historyWeeks = [
    {
      id: 'w41',
      code: 'Tuần #W41 (07/10 – 13/10/2026)',
      year: 'Năm 2026',
      goal: 'Giảm mỡ giữ cơ • Thuần chay',
      goalType: 'fatloss',
      adherence: 96,
      calories: '2,050 kcal/ngày',
      protein: '86g Đạm',
      dishes: [
        {
          name: 'Poke Quinoa Tempeh',
          img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
          calories: '490 kcal',
          protein: '24g Đạm'
        },
        {
          name: 'Buddha Bowl',
          img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
          calories: '520 kcal',
          protein: '22g Đạm'
        },
        {
          name: 'Canh nấm hạt sen',
          img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
          calories: '340 kcal',
          protein: '16g Đạm'
        },
        {
          name: 'Đậu hũ Tứ Xuyên',
          img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
          calories: '420 kcal',
          protein: '24g Đạm'
        }
      ],
      marketList: [
        'Đậu hũ mơ tươi: 5 bìa (900g)',
        'Hạt Quinoa 3 màu: 500g',
        'Nấm đùi gà & Nấm hương: 600g',
        'Hạt sen tươi Huế: 200g',
        'Rau cải thìa Đà Lạt: 1kg',
        'Sốt tương Tứ Xuyên thuần chay: 1 chai'
      ]
    },
    {
      id: 'w40',
      code: 'Tuần #W40 (30/09 – 06/10/2026)',
      year: 'Năm 2026',
      goal: 'Bổ sung B12 & Sắt • Thuần chay',
      goalType: 'b12',
      adherence: 94,
      calories: '1,980 kcal/ngày',
      protein: '78g Đạm',
      dishes: [
        {
          name: 'Súp bí đỏ hạt sen',
          img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
          calories: '380 kcal',
          protein: '14g Đạm'
        },
        {
          name: 'Cà ri nấm dừa đậu gà',
          img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
          calories: '610 kcal',
          protein: '26g Đạm'
        },
        {
          name: 'Gỏi cuốn ngũ sắc',
          img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
          calories: '320 kcal',
          protein: '16g Đạm'
        },
        {
          name: 'Sinh tố Spirulina chuối',
          img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80',
          calories: '280 kcal',
          protein: '12g Đạm'
        }
      ],
      marketList: [
        'Bí đỏ hồ lô: 1.2kg',
        'Đậu gà hữu cơ ngâm nở: 500g',
        'Tảo Spirulina hữu cơ: 1 hộp',
        'Bánh tráng gạo lứt: 2 xấp',
        'Men dinh dưỡng B12 (Nutritional Yeast): 100g'
      ]
    },
    {
      id: 'w39',
      code: 'Tuần #W39 (23/09 – 29/09/2026)',
      year: 'Năm 2026',
      goal: 'Duy trì thể trạng & Tăng đề kháng • Thuần chay',
      goalType: 'maintain',
      adherence: 98,
      calories: '2,100 kcal/ngày',
      protein: '85g Đạm',
      dishes: [
        {
          name: 'Phở nấm thanh đạm',
          img: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=400&q=80',
          calories: '450 kcal',
          protein: '20g Đạm'
        },
        {
          name: 'Nem nấm nướng giòn',
          img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
          calories: '380 kcal',
          protein: '18g Đạm'
        },
        {
          name: 'Lẩu nấm Tứ Xuyên',
          img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
          calories: '650 kcal',
          protein: '32g Đạm'
        },
        {
          name: 'Canh chua Nam Bộ',
          img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
          calories: '310 kcal',
          protein: '15g Đạm'
        }
      ],
      marketList: [
        'Bánh phở tươi: 1kg',
        'Nấm mối đen & nấm đùi gà: 800g',
        'Đậu hũ ky tươi: 300g',
        'Dọc mùng, đậu bắp, cà chua, dứa: 1.5kg'
      ]
    },
    {
      id: 'w38',
      code: 'Tuần #W38 (16/09 – 22/09/2026)',
      year: 'Năm 2026',
      goal: 'Thanh lọc cơ thể & Tiết kiệm thời gian • Thuần chay',
      goalType: 'detox',
      adherence: 92,
      calories: '1,890 kcal/ngày',
      protein: '76g Đạm',
      dishes: [
        {
          name: 'Cơm lứt hạt dẻ',
          img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
          calories: '420 kcal',
          protein: '18g Đạm'
        },
        {
          name: 'Đậu phụ xào nấm',
          img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
          calories: '390 kcal',
          protein: '22g Đạm'
        },
        {
          name: 'Canh đậu non wakame',
          img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
          calories: '280 kcal',
          protein: '16g Đạm'
        },
        {
          name: 'Hạt dẻ nướng ấm no',
          img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
          calories: '240 kcal',
          protein: '8g Đạm'
        }
      ],
      marketList: [
        'Gạo lứt huyết rồng: 2kg',
        'Hạt dẻ Trùng Khánh: 500g',
        'Rong biển wakame khô: 100g',
        'Đậu hũ non Nhật Bản: 4 hộp'
      ]
    }
  ];

  // LỌC DANH SÁCH THEO SEARCH VÀ GOAL
  const filteredWeeks = historyWeeks.filter(week => {
    const matchesSearch = week.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      week.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      week.dishes.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGoal = goalFilter === 'all' || week.goalType === goalFilter;
    return matchesSearch && matchesGoal;
  });

  // ÁP DỤNG LẠI THỰC ĐƠN TUẦN ĐÓ
  const handleApplyWeek = (week) => {
    showToast(`✨ Đã áp dụng lại toàn bộ thực đơn "${week.code}" cho tuần này!`);
    setTimeout(() => {
      if (onNavigate) {
        onNavigate('planner');
      }
    }, 1200);
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

      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* ========================================================================= */}
        {/* LINK QUAY LẠI "THỰC ĐƠN CỦA TÔI" (KHỚP 100% GIAO DIỆN ẢNH) */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('planner')}
            style={{
              background: 'none',
              border: 'none',
              color: '#047857',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: 0
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại "Thực đơn của tôi"</span>
          </button>
        </div>

        {/* TITLE ROW & STORAGE BADGE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
              Lịch sử thực đơn của tôi
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              Xem lại và áp dụng lại các thực đơn tuần trước đây
            </p>
          </div>

          <div style={{
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
            padding: '0.45rem 1rem',
            borderRadius: '20px',
            fontSize: '0.84rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}>
            <Calendar size={15} />
            <span>24 thực đơn đã lưu trữ</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILTER BAR: TÌM KIẾM, SẮP XẾP, MỤC TIÊU */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          flexWrap: 'wrap'
        }}>
          {/* SEARCH INPUT */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo tuần, món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.25rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* SORT DROPDOWN */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest_adherence">Độ tuân thủ cao nhất</option>
            </select>
          </div>

          {/* GOAL FILTER DROPDOWN */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={goalFilter}
              onChange={(e) => setGoalFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <option value="all">Mục tiêu: Tất cả</option>
              <option value="fatloss">Giảm mỡ giữ cơ</option>
              <option value="b12">Bổ sung B12 & Sắt</option>
              <option value="maintain">Duy trì thể trạng</option>
              <option value="detox">Thanh lọc cơ thể</option>
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LIST OF STORED WEEK MEAL PLANS (4 CARDS THEO CHUẨN MOCKUP) */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {filteredWeeks.map((week) => (
            <div
              key={week.id}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
            >
              {/* TOP ROW: WEEK CODE, YEAR, ADHERENCE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    background: '#ecfdf5',
                    color: '#047857',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    border: '1px solid #a7f3d0'
                  }}>
                    {week.code}
                  </span>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '3px 8px',
                    borderRadius: '8px'
                  }}>
                    {week.year}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: '#ecfdf5',
                    color: '#047857',
                    padding: '3px 10px',
                    borderRadius: '10px',
                    border: '1px solid #bbf7d0'
                  }}>
                    ĐỘ TUÂN THỦ: {week.adherence}% đạt chuẩn
                  </span>
                </div>
              </div>

              {/* GOAL TITLE */}
              <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Mục tiêu: {week.goal}
              </h3>

              {/* METRICS ROW WITH PROGRESS BAR */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Chỉ số trung bình:
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  TB: {week.calories}
                </span>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px' }}>
                  {week.protein}
                </span>
                <span style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700 }}>
                  {week.adherence}% đạt chuẩn
                </span>

                <div style={{ flex: 1, minWidth: '140px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${week.adherence}%`, height: '100%', background: '#046a47', borderRadius: '3px' }}></div>
                </div>
              </div>

              {/* 4 DISHES THUMBNAILS GRID (KHỚP 100% ẢNH MOCKUP) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                {week.dishes.map((dish, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      height: '145px',
                      borderRadius: '14px',
                      backgroundImage: `url('${dish.img}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    {/* Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.85) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '0.75rem'
                    }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        {dish.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* BOTTOM ACTIONS BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  {/* [Xem lại] */}
                  <button
                    type="button"
                    onClick={() => setPreviewWeek(week)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      padding: '0.55rem 1rem',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Eye size={15} />
                    <span>[Xem lại]</span>
                  </button>

                  {/* [Áp dụng lại tuần này] */}
                  <button
                    type="button"
                    onClick={() => handleApplyWeek(week)}
                    style={{
                      background: '#046a47',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.55rem 1.15rem',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 8px rgba(4, 106, 71, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <RotateCw size={14} />
                    <span>[Áp dụng lại tuần này]</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Xem danh sách đi chợ (đã lưu) */}
                  <button
                    type="button"
                    onClick={() => setMarketWeek(week)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#475569',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#047857'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                  >
                    <ShoppingCart size={15} />
                    <span>Xem danh sách đi chợ (đã lưu)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast(`Thực đơn "${week.code}" đang được đồng bộ!`)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                  >
                    <MoreVertical size={17} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* PHÂN TRANG (PAGINATION) */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Hiển thị 1 – 4 trong tổng số 24 thực đơn đã tạo
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              type="button"
              disabled={currentPage === 1}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              &lt; Trang trước
            </button>

            {[1, 2, 3].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: currentPage === p ? 'none' : '1px solid #e2e8f0',
                  background: currentPage === p ? '#046a47' : '#ffffff',
                  color: currentPage === p ? '#ffffff' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                0{p}
              </button>
            ))}

            <button
              type="button"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#334155',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Trang sau &gt;
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM HELPER NOTE (THEO ẢNH MOCKUP) */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#ecfdf5',
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            <Calendar size={20} />
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Tự động lưu trữ hồ sơ thực đơn tuần
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
            Các thực đơn tuần sau sẽ được tự động lưu lại ở đây để bạn xem lại và áp dụng lại bất cứ lúc nào mà không cần khởi tạo lại từ đầu.
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: XEM CHI TIẾT THỰC ĐƠN TUẦN */}
      {/* ========================================================================= */}
      {previewWeek && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '680px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setPreviewWeek(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              CHI TIẾT THỰC ĐƠN LƯU TRỮ
            </span>
            <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.25rem 0', fontSize: '1.4rem', fontWeight: 800 }}>
              {previewWeek.code}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Mục tiêu: {previewWeek.goal} • {previewWeek.calories} • {previewWeek.protein}
            </p>

            <h4 style={{ color: '#047857', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 800 }}>
              🍽️ 4 Món ăn tiêu biểu trong tuần:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {previewWeek.dishes.map((dish, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#f8fafc', padding: '0.65rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <img src={dish.img} alt={dish.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{dish.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#047857' }}>{dish.protein} • {dish.calories}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="secondary" onClick={() => setPreviewWeek(null)}>Đóng</Button>
              <Button onClick={() => {
                setPreviewWeek(null);
                handleApplyWeek(previewWeek);
              }}>
                <RotateCw size={15} /> Áp dụng thực đơn này cho tuần này
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: XEM DANH SÁCH ĐI CHỢ ĐÃ LƯU */}
      {/* ========================================================================= */}
      {marketWeek && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '580px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setMarketWeek(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              SỔ TAY NGUYÊN LIỆU ĐÃ LƯU
            </span>
            <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
              Danh Sách Đi Chợ — {marketWeek.code}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Danh sách các món nguyên liệu đã dùng cho 21 bữa ăn trong tuần này.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.5rem' }}>
              {marketWeek.marketList.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', color: '#334155' }}>
                  <Check size={16} color="#059669" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setMarketWeek(null)}>Đóng</Button>
              <Button onClick={() => {
                setMarketWeek(null);
                showToast('✓ Đã tải danh sách đi chợ về máy!');
              }}>
                <Download size={15} /> Xuất danh sách
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
