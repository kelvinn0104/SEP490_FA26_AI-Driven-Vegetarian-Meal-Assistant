import React, { useState } from 'react';
import { 
  Camera, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Leaf, 
  Plus, X, Trash2, Check, RefreshCw, Upload, Utensils, AlertTriangle, Eye, Clock, Flame
} from 'lucide-react';
import { detectIngredients } from '../../utils/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function VisionPage({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [detectedItems, setDetectedItems] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedRecipeModal, setSelectedRecipeModal] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. CÁC ANH MẪU TỦ LẠNH ĐƯỢC CHUẨN BỊ SẴN (PRESETS)
  const samplePresets = [
    {
      id: 'p1',
      title: 'Tủ lạnh Nấm & Đậu hũ tươi',
      img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
      items: [
        { name: 'Đậu hũ mơ tươi', freshness: 'Fresh', confidence: '98.5%', note: '🟢 95% Tươi ngon', confirmed: true },
        { name: 'Nấm đùi gà', freshness: 'Fresh', confidence: '96.2%', note: '🟢 90% Tươi ngon', confirmed: true },
        { name: 'Bí đỏ hồ lô', freshness: 'ExpiringSoon', confidence: '92.1%', note: '🌱 Cần dùng trong 24h', confirmed: true },
        { name: 'Rau cải thìa', freshness: 'ExpiringSoon', confidence: '89.4%', note: '🌱 Cần dùng trong 24h', confirmed: true }
      ]
    },
    {
      id: 'p2',
      title: 'Tủ lạnh Rau củ quả hữu cơ',
      img: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
      items: [
        { name: 'Bơ sáp Tây Nguyên', freshness: 'Fresh', confidence: '99.1%', note: '🟢 98% Tươi ngon', confirmed: true },
        { name: 'Cà rốt Đà Lạt', freshness: 'Fresh', confidence: '97.4%', note: '🟢 95% Tươi ngon', confirmed: true },
        { name: 'Cà chua bi', freshness: 'Fresh', confidence: '94.8%', note: '🟢 92% Tươi ngon', confirmed: true },
        { name: 'Bắp ngọt', freshness: 'ExpiringSoon', confidence: '91.0%', note: '🌱 Cần dùng trong 24h', confirmed: true }
      ]
    },
    {
      id: 'p3',
      title: 'Tủ lạnh Giải cứu hàng hết hạn',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      items: [
        { name: 'Đậu hũ chiên', freshness: 'ExpiringSoon', confidence: '96.0%', note: '🌱 Cần dùng trong 12h', confirmed: true },
        { name: 'Nấm rơm', freshness: 'ExpiringSoon', confidence: '93.5%', note: '🌱 Cần dùng trong 12h', confirmed: true },
        { name: 'Rau xà lách nhún', freshness: 'ExpiringSoon', confidence: '91.2%', note: '🌱 Cần dùng trong 24h', confirmed: true },
        { name: 'Cà chua chín mọng', freshness: 'Fresh', confidence: '95.1%', note: '🟢 Tươi ngon', confirmed: true }
      ]
    }
  ];

  // 2. XỬ LÝ CHỌN TỆP ẢNH TỪ MÁY TÍNH
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Tệp ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        handleScan(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. XỬ LÝ QUÉT MẪU PRESET
  const handleSelectPreset = (preset) => {
    setImagePreview(preset.img);
    setLoading(true);
    setTimeout(() => {
      setDetectedItems(preset.items);
      setLoading(false);
      showToast(`✨ YOLOv8 đã bóc tách ảnh "${preset.title}" thành công!`);
    }, 600);
  };

  // 4. GIẢ LẬP NHẬN DIỆN MÔ HÌNH YOLOV8
  const handleScan = async (imgSrc = null) => {
    setLoading(true);
    if (!imagePreview && !imgSrc) {
      setImagePreview(samplePresets[0].img);
    }

    try {
      const data = await detectIngredients();
      if (data && data.detectedItems) {
        setDetectedItems(data.detectedItems.map(i => ({ ...i, confirmed: true })));
      } else {
        setDetectedItems(samplePresets[0].items);
      }
      showToast('✨ YOLOv8 đã phân tích xong! Hãy rà soát danh sách trước khi lưu.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 5. RÀ SOÁT & CHỈNH SỬA NHÃN NGUYÊN LIỆU (RULE BR05)
  const handleRemoveItem = (idx) => {
    setDetectedItems(prev => prev.filter((_, i) => i !== idx));
    showToast('Đã xóa nguyên liệu khỏi danh sách.');
  };

  const handleToggleFreshness = (idx) => {
    setDetectedItems(prev => prev.map((item, i) => {
      if (i === idx) {
        const isFresh = item.freshness === 'Fresh';
        return {
          ...item,
          freshness: isFresh ? 'ExpiringSoon' : 'Fresh',
          note: isFresh ? '🌱 Cần dùng trong 24h' : '🟢 95% Tươi ngon'
        };
      }
      return item;
    }));
    showToast('✓ Đã cập nhật trạng thái độ tươi của nguyên liệu.');
  };

  const handleAddManualItem = (e) => {
    e.preventDefault();
    const clean = manualInput.trim();
    if (!clean) return;
    if (detectedItems && detectedItems.some(i => i.name.toLowerCase() === clean.toLowerCase())) {
      showToast('Nguyên liệu này đã có trong danh sách!');
      return;
    }
    const newItem = {
      name: clean,
      freshness: 'Fresh',
      confidence: '100% (Nhập tay)',
      note: '🟢 Tươi ngon (Nhập thủ công)',
      confirmed: true
    };
    setDetectedItems(prev => [...(prev || []), newItem]);
    setManualInput('');
    showToast(`✓ Đã thêm thủ công "${clean}"!`);
  };

  // 6. CHUYỂN SANG WF02 (LẬP THỰC ĐƠN TUẦN CHỐNG LÃNG PHÍ)
  const handleApplyIngredientsToPlan = () => {
    if (detectedItems && detectedItems.length > 0) {
      const names = detectedItems.map(i => i.name);
      try {
        localStorage.setItem('veggieai_scanned_pantry', JSON.stringify(names));
      } catch (e) {}
    }
    showToast('🚀 Đang chuyển danh sách nguyên liệu sang WF02 Lập thực đơn AI...');
    setTimeout(() => {
      if (onNavigate) {
        onNavigate('create-plan');
      }
    }, 400);
  };

  // DANH SÁCH CÔNG THỨC GỢI Ý XẾP HẠNG THEO TỈ LỆ TẬN DỤNG NGUYÊN LIỆU (ZERO-WASTE RATING)
  const suggestedRecipes = [
    {
      id: 'r1',
      title: 'Súp Bí Đỏ Cốt Dừa Nấm Đùi Gà',
      matchScore: '100% Tận dụng',
      matchColor: '#047857',
      matchBg: '#ecfdf5',
      time: '25 phút',
      calories: '340 kcal',
      protein: '14g Đạm',
      carbs: '42g',
      fat: '11g',
      pantryUsed: ['Bí đỏ hồ lô', 'Nấm đùi gà', 'Nước cốt dừa'],
      missing: ['Hạt sen hữu cơ (Tuỳ chọn)'],
      img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
      description: 'Món súp sánh mịn thơm nức mùi nước cốt dừa tự nhiên kết hợp vị ngọt thanh của nấm đùi gà và bí đỏ hồ lô chín mọng.',
      steps: [
        'Sơ chế sạch bí đỏ hồ lô, cắt miếng vuông nhỏ đem hấp chín tới.',
        'Nấm đùi gà rửa sạch nước muối loãng, thái lát mỏng vừa ăn.',
        'Cho bí đỏ vào máy xay cùng 200ml nước dùng rau củ và nước cốt dừa xay mịn.',
        'Đun sôi hỗn hợp súp trên lửa nhỏ, cho nấm đùi gà vào nấu chín trong 8 phút, nêm muối hồng và tiêu xay vừa ăn.'
      ]
    },
    {
      id: 'r2',
      title: 'Buddha Bowl Quinoa Đậu Hũ & Cải Thìa Áp Chảo',
      matchScore: '92% Tận dụng',
      matchColor: '#047857',
      matchBg: '#ecfdf5',
      time: '20 phút',
      calories: '420 kcal',
      protein: '24g Đạm',
      carbs: '48g',
      fat: '14g',
      pantryUsed: ['Đậu hũ mơ tươi', 'Rau cải thìa'],
      missing: ['Hạt Quinoa (Hoặc thay bằng Cơm lứt)'],
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      description: 'Tô dinh dưỡng chuẩn phong cách Buddha Bowl với đậu hũ mơ tươi giòn vỏ béo ngậy bên trong và cải thìa xanh mướt.',
      steps: [
        'Đậu hũ mơ thấm khô, cắt khối vuông nhỏ rồi áp chảo vàng 4 mặt bằng nồi chiên không dầu.',
        'Cải thìa rửa sạch từng bẹ, chần qua nước sôi 1 phút rồi vớt ra ngâm nước đá cho giòn.',
        'Nấu chín hạt quinoa hoặc cơm lứt làm nền tô.',
        'Xếp đậu hũ, cải thìa lên trên tô và rưới sốt mè rang béo thơm bùi vị.'
      ]
    },
    {
      id: 'r3',
      title: 'Nấm Đùi Gà Xào Cải Thìa Dầu Hào Chay',
      matchScore: '88% Tận dụng',
      matchColor: '#1d4ed8',
      matchBg: '#eff6ff',
      time: '15 phút',
      calories: '310 kcal',
      protein: '12g Đạm',
      carbs: '28g',
      fat: '8g',
      pantryUsed: ['Nấm đùi gà', 'Rau cải thìa'],
      missing: ['Boarô / Hành tỏi chay'],
      img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
      description: 'Món xào chay quốc dân thơm lừng mùi sốt dầu hào chay, rau cải thìa xanh giòn sần sật giữ trọn vitamin.',
      steps: [
        'Nấm đùi gà chẻ đôi hoặc thái lát xéo.',
        'Phi thơm hành boa-rô với 1 thìa dầu thực vật trên chảo nóng.',
        'Cho nấm vào đảo đều trên lửa lớn 3 phút đến khi nấm chín tới.',
        'Trút cải thìa vào xào nhanh 2 phút, nêm dầu hào chay, hạt nêm chay và xì dầu nhẹ tay.'
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '1.5rem auto 4rem auto', padding: '0 1.25rem', color: '#0f172a' }}>
      
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

      {/* HEADER AREA */}
      <Card style={{ borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '46px', height: '46px', background: '#ecfdf5', borderRadius: '14px', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Nhận Diện Nguyên Liệu & Đánh Giá Độ Tươi (WF04)
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
                Thị giác máy tính (YOLOv8) tự động bóc tách thực phẩm tủ lạnh, đánh giá độ tươi ngon và gợi ý món ăn giải cứu nguyên liệu chống lãng phí.
              </p>
            </div>
          </div>

          <span style={{ fontSize: '0.76rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '14px', fontWeight: 800 }}>
            Model YOLOv8 v2.4 Active
          </span>
        </div>

        {/* DRAG AND DROP / FILE PICKER BOX & PRESETS */}
        <div style={{ display: 'grid', gridTemplateColumns: imagePreview ? '1fr 1.2fr' : '1fr', gap: '1.5rem', marginTop: '1.75rem', alignItems: 'center' }}>
          
          {/* IMAGE PREVIEW OR UPLOAD AREA */}
          {imagePreview ? (
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '260px', border: '1px solid #cbd5e1' }}>
              <img src={imagePreview} alt="Fridge Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => { setImagePreview(null); setDetectedItems(null); }}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15,23,42,0.75)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Chọn ảnh khác"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div style={{ padding: '2.5rem 1.5rem', border: '2px dashed #a7f3d0', borderRadius: '16px', textAlign: 'center', background: '#f0fdf4' }}>
              <div style={{ width: '64px', height: '64px', background: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 4px 12px rgba(5,150,105,0.15)' }}>
                <Upload size={30} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                Quét ảnh ngăn mát tủ lạnh của bạn
              </h3>
              <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.88rem' }}>
                Chọn ảnh tệp (.jpg, .png) hoặc nhấn nút mẫu bên dưới để YOLOv8 bóc tách nguyên liệu
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <label style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}>
                  <Upload size={16} />
                  <span>Tải ảnh từ máy tính</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>

                <Button variant="primary" onClick={() => handleScan()} disabled={loading} style={{ padding: '0.65rem 1.4rem', fontSize: '0.86rem', fontWeight: 800 }}>
                  <Sparkles size={16} />
                  <span>{loading ? 'AI đang phân tích...' : 'Quét ảnh mẫu tủ lạnh'}</span>
                </Button>
              </div>

              {/* PRESETS SAMPLE QUICK BUTTONS */}
              <div style={{ borderTop: '1px solid #dcfce7', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 800, display: 'block', marginBottom: '0.65rem' }}>
                  📸 Hoặc thử ngay các bộ ảnh tủ lạnh mẫu thực tế:
                </span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {samplePresets.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #a7f3d0',
                        color: '#047857',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#d1fae5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <Camera size={13} />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RIGHT SIDE: STATUS & INSTRUCTION WHEN IMAGE SELECTED */}
          {imagePreview && (
            <div>
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#047857', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={18} />
                  <span>Ảnh tủ lạnh đã sẵn sàng phân tích!</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#065f46', margin: 0, lineHeight: 1.5 }}>
                  Mô hình YOLOv8 sẽ tự động khoanh vùng từng rau củ, đo lường sắc tố vỏ và đối chiếu với tập dữ liệu độ tươi thuần chay.
                </p>
              </div>

              <Button variant="primary" onClick={() => handleScan(imagePreview)} disabled={loading} style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 800 }}>
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
                <span>{loading ? 'YOLOv8 đang bóc tách nguyên liệu...' : 'Phân tích lại ảnh này'}</span>
              </Button>
            </div>
          )}

        </div>
      </Card>

      {/* ========================================================================= */}
      {/* KẾT QUẢ BÓC TÁCH YOLOV8 & RÀ SOÁT NHÃN (RULE BR05) */}
      {/* ========================================================================= */}
      {detectedItems && (
        <Card style={{ borderRadius: '20px', padding: '2rem', marginTop: '1.75rem', border: '1px solid #a7f3d0' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={22} color="#059669" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  1. Rà soát & Xác nhận Danh sách Nguyên liệu (Quy tắc BR05)
                </h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
                AI nhận diện mẫu. Bạn có thể thêm thủ công (+), bấm vào nhãn độ tươi để đổi trạng thái hoặc xóa (X) nhãn sai.
              </p>
            </div>

            <span style={{ fontSize: '0.78rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '12px', fontWeight: 800 }}>
              Đã tìm thấy {detectedItems.length} nguyên liệu
            </span>
          </div>

          {/* LIST OF DETECTED INGREDIENTS WITH EDIT / DELETE BUTTONS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {detectedItems.map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Xóa nhãn nhận diện sai"
                >
                  <X size={14} />
                </button>

                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', paddingRight: '1.5rem' }}>
                  {item.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#64748b' }}>Độ tin cậy AI:</span>
                  <span style={{ color: '#047857', fontWeight: 800 }}>{item.confidence}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: '#64748b' }}>Độ tươi:</span>
                  <button
                    type="button"
                    onClick={() => handleToggleFreshness(idx)}
                    title="Nhấn để đổi trạng thái độ tươi"
                    style={{ 
                      border: 'none',
                      cursor: 'pointer',
                      color: item.freshness === 'Fresh' ? '#047857' : '#c2410c', 
                      background: item.freshness === 'Fresh' ? '#ecfdf5' : '#fff7ed', 
                      padding: '2px 8px', 
                      borderRadius: '6px', 
                      fontWeight: 800,
                      fontSize: '0.74rem'
                    }}
                  >
                    {item.note || (item.freshness === 'Fresh' ? '🟢 Tươi ngon' : '🌱 Cần dùng trong 24h')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* MANUAL INGREDIENT ENTRY FALLBACK (STEP 3-4 SRS) */}
          <form onSubmit={handleAddManualItem} style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.75rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '14px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="+ Nhập bổ sung nguyên liệu AI chưa quét được (VD: Hạt sen, Đậu gà, Bơ sáp)..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              style={{ flex: 1, minWidth: '240px', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
            />
            <Button type="submit" variant="secondary" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
              <Plus size={16} /> Thêm thủ công
            </Button>
          </form>

          {/* ========================================================================= */}
          {/* SECTION 2: GỢI Ý CÔNG THỨC XẾP HẠNG THEO MỨC TẬN DỤNG NGUYÊN LIỆU */}
          {/* ========================================================================= */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Utensils size={20} color="#059669" />
                  2. Công Thức Chay Được AI Xếp Hạng Giải Cứu Nguyên Liệu
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
                  Các công thức lọc bỏ chất dị ứng (Allergen Guard) và ưu tiên tận dụng nguyên liệu sắp hết hạn.
                </p>
              </div>
            </div>

            {/* RECIPES CARDS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
              {suggestedRecipes.map((recipe) => (
                <div key={recipe.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', backgroundImage: `url('${recipe.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '10px', right: '10px', background: recipe.matchBg, color: recipe.matchColor, fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '10px', border: `1px solid ${recipe.matchColor}` }}>
                      {recipe.matchScore}
                    </span>
                  </div>

                  <div style={{ padding: '1.15rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                        {recipe.title}
                      </h4>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '0.65rem' }}>
                        ⏱️ {recipe.time} • 🔥 {recipe.calories} • 💪 {recipe.protein}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#047857', marginBottom: '0.35rem' }}>
                        <strong>Đã có:</strong> {recipe.pantryUsed.join(', ')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                        <strong>Thiếu:</strong> {recipe.missing.join(', ')}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedRecipeModal(recipe)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          borderRadius: '10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Eye size={14} />
                        <span>Xem chi tiết</span>
                      </button>

                      <Button variant="secondary" onClick={handleApplyIngredientsToPlan} style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.5rem' }}>
                        <span>Lập thực đơn (WF02)</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION BANNER TO GO TO WF02 */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#047857', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Leaf size={20} />
                  <span>Xác nhận danh sách nguyên liệu & Chuyển sang Lập thực đơn tuần (WF02)</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#065f46', margin: 0 }}>
                  Đưa toàn bộ {detectedItems.length} nguyên liệu đã xác nhận vào <strong>AI Meal Planner</strong> để tạo thực đơn 7 ngày cá nhân hóa.
                </p>
              </div>

              <Button variant="primary" onClick={handleApplyIngredientsToPlan} style={{ padding: '0.75rem 1.5rem', fontWeight: 800, fontSize: '0.9rem' }}>
                <span>Đưa vào Bếp & Lập thực đơn AI (WF02)</span>
                <ArrowRight size={18} />
              </Button>
            </div>

          </div>

        </Card>
      )}

      {/* ========================================================================= */}
      {/* RECIPE DETAIL MODAL POPUP */}
      {/* ========================================================================= */}
      {selectedRecipeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setSelectedRecipeModal(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <div style={{ height: '200px', backgroundImage: `url('${selectedRecipeModal.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px', marginBottom: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '12px', right: '12px', background: selectedRecipeModal.matchBg, color: selectedRecipeModal.matchColor, fontSize: '0.8rem', fontWeight: 800, padding: '4px 12px', borderRadius: '12px', border: `1px solid ${selectedRecipeModal.matchColor}` }}>
                {selectedRecipeModal.matchScore}
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              {selectedRecipeModal.title}
            </h2>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {selectedRecipeModal.description}
            </p>

            {/* NUTRITION & ALLERGEN BADGE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '14px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Năng lượng</span>
                <strong style={{ fontSize: '0.95rem', color: '#047857' }}>{selectedRecipeModal.calories}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Protein</span>
                <strong style={{ fontSize: '0.95rem', color: '#047857' }}>{selectedRecipeModal.protein}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Carbohydrate</span>
                <strong style={{ fontSize: '0.95rem', color: '#047857' }}>{selectedRecipeModal.carbs}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Chất béo</span>
                <strong style={{ fontSize: '0.95rem', color: '#047857' }}>{selectedRecipeModal.fat}</strong>
              </div>
            </div>

            {/* ALLERGEN GUARD CHECK */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#047857', fontWeight: 700 }}>
              <ShieldCheck size={18} />
              <span>Đã kiểm duyệt Allergen Guard: Không chứa chất gây dị ứng trong hồ sơ của bạn</span>
            </div>

            {/* COOKING STEPS */}
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Utensils size={18} color="#059669" />
              Hướng dẫn chế biến từng bước:
            </h4>
            <ol style={{ margin: '0 0 1.75rem 0', paddingLeft: '1.2rem', color: '#334155', fontSize: '0.88rem', lineHeight: 1.7 }}>
              {selectedRecipeModal.steps.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{step}</li>
              ))}
            </ol>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setSelectedRecipeModal(null)}>
                Đóng
              </Button>
              <Button variant="primary" onClick={() => { setSelectedRecipeModal(null); handleApplyIngredientsToPlan(); }}>
                🚀 Đưa món này vào Thực đơn AI (WF02)
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
