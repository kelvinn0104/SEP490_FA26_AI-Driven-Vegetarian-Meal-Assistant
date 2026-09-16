import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Image as ImageIcon, Clock, Flame, Users, ChefHat, 
  Plus, Trash2, X, Sparkles, Send, Save, CheckCircle2, AlertCircle, 
  HelpCircle, Utensils, BookOpen, Lightbulb, Heart, MapPin, Tag
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function CreatePostPage({ onNavigate }) {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // STATE LOẠI BÀI VIẾT (5 CHỦ ĐỀ THEO YÊU CẦU CỦA USER)
  const postCategories = [
    { id: 'recipe', label: 'Công thức món chay', icon: Utensils },
    { id: 'nutrition', label: 'Kiến thức dinh dưỡng', icon: BookOpen },
    { id: 'ingredients', label: 'Mẹo chọn nguyên liệu', icon: Lightbulb },
    { id: 'lifestyle', label: 'Chia sẻ & Lối sống xanh', icon: Heart },
    { id: 'locations', label: 'Gợi ý địa điểm ăn chay', icon: MapPin }
  ];

  const [selectedCategory, setSelectedCategory] = useState('recipe');
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState('Đã lưu nháp tự động 1 phút trước');
  const [toastMessage, setToastMessage] = useState('');

  // THÔNG SỐ NẤU ĂN
  const [prepTime, setPrepTime] = useState('15 phút');
  const [cookTime, setCookTime] = useState('30 phút');
  const [servings, setServings] = useState('4 người');
  const [difficulty, setDifficulty] = useState('Dễ');

  // THÔNG TIN BỔ SUNG CHO ĐỊA ĐIỂM HOẶC BÀI CHIA SẺ
  const [locationAddress, setLocationAddress] = useState('');
  const [priceRange, setPriceRange] = useState('30.000đ – 80.000đ');

  // NGUYÊN LIỆU
  const [ingredients, setIngredients] = useState([
    { name: 'Đậu hũ mơ tươi làng Mơ', amount: '2 bìa (300g)' },
    { name: 'Nấm đùi gà baby', amount: '150g' },
    { name: 'Rau cải thìa Đà Lạt', amount: '200g' }
  ]);

  // CÁC BƯỚC THỰC HIỆN
  const [steps, setSteps] = useState([
    'Sơ chế nguyên liệu: Đậu hũ cắt quân cờ ráo nước. Nấm đùi gà ngâm nước muối loãng 5 phút rồi rửa sạch, xắt lát vừa ăn. Rau cải thìa rửa sạch để ráo.',
    'Áp chảo đậu hũ với 1 thìa cà phê dầu mè trên chảo chống dính đến khi 4 mặt vàng giòn đều. Phi thơm boa-rô, cho nấm đùi gà vào xào săn cùng hạt nêm nấm chay.'
  ]);

  // NỘI DUNG CHIA SẺ VĂN BẢN (DÀNH CHO BÀI KIẾN THỨC / LỐI SỐNG / ĐỊA ĐIỂM)
  const [articleContent, setArticleContent] = useState('');

  // DANH MỤC & TAGS
  const [dishCategory, setDishCategory] = useState('Món chính');
  const [tags, setTags] = useState(['Thuần chay', 'Giàu Protein', 'Bữa tối thanh đạm']);
  const [currentTagInput, setCurrentTagInput] = useState('');

  // TRỢ LÝ DINH DƯỠNG AI
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // THÊM & XÓA NGUYÊN LIỆU
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const handleUpdateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length <= 1) {
      setIngredients([{ name: '', amount: '' }]);
      return;
    }
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // THÊM & XÓA BƯỚC
  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleUpdateStep = (index, value) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleRemoveStep = (index) => {
    if (steps.length <= 1) {
      setSteps(['']);
      return;
    }
    setSteps(steps.filter((_, i) => i !== index));
  };

  // THÊM & XÓA TAG
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && currentTagInput.trim()) {
      e.preventDefault();
      const newTag = currentTagInput.trim().replace(/^#/, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setCurrentTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // CHỌN ẢNH DEMO NHANH HOẶC TẢI TỪ MÁY
  const sampleCovers = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'
  ];

  const handleSelectSampleCover = (url) => {
    setCoverImage(url);
    showToast('✓ Đã chọn ảnh bìa minh họa!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImage(reader.result);
        showToast('✓ Tải ảnh bìa thành công!');
      };
      reader.readAsDataURL(file);
    }
  };

  // XỬ LÝ LƯU NHÁP
  const handleSaveDraft = () => {
    setLastSavedTime('Đã lưu nháp tự động vừa xong');
    showToast('💾 Đã lưu bài viết vào bản nháp cá nhân!');
  };

  // XỬ LÝ ĐĂNG BÀI
  const handleSubmitPost = () => {
    if (!title.trim()) {
      showToast('⚠️ Vui lòng nhập tiêu đề bài viết hoặc tên món ăn!');
      return;
    }

    showToast('🚀 Đang gửi bài viết đến đội ngũ Moderator kiểm duyệt...');
    setTimeout(() => {
      showToast('✅ Đăng bài thành công! Bài viết đã chuyển sang hàng đợi duyệt của Mod.');
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('blog');
        }
      }, 1200);
    }, 1000);
  };

  // CHẠY TRỢ LÝ DINH DƯỠNG AI
  const handleRunAiAnalysis = () => {
    setIsAnalyzingAI(true);
    setTimeout(() => {
      setIsAnalyzingAI(false);
      setAiAnalysisResult({
        calories: 385,
        protein: '24.5g',
        carbs: '42g',
        fat: '12g',
        fiber: '9.2g',
        iron: '4.8mg (60% RDI)',
        allergenCheck: 'An toàn: Không chứa Gluten, Không chứa sữa động vật, 100% Thực vật',
        aiComment: 'Món ăn đạt tỷ lệ Protein thực vật cao từ đậu hũ và nấm đùi gà, lượng calo ở mức lý tưởng cho bữa ăn chính giảm mỡ giữ cơ.'
      });
      showToast('✨ AI đã hoàn tất tính toán Calo & Vi chất dinh dưỡng!');
    }, 1200);
  };

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
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR / HEADER ĐĂNG BÀI */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          <div>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('blog') : null}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: 0,
                marginBottom: '0.2rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <ArrowLeft size={14} />
              <span>Quay lại Blog cộng đồng</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Đăng bài blog & Công thức mới
              </h1>
              <span style={{ fontSize: '0.74rem', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                {lastSavedTime}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS: LƯU NHÁP | ĐĂNG BÀI */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={handleSaveDraft}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '0.6rem 1.15rem',
                borderRadius: '12px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
            >
              <Save size={15} />
              <span>Lưu nháp</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitPost}
              style={{
                background: '#046a47',
                border: 'none',
                color: '#ffffff',
                padding: '0.6rem 1.4rem',
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
              onMouseEnter={(e) => e.currentTarget.style.background = '#065f46'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#046a47'}
            >
              <Send size={15} />
              <span>Đăng bài</span>
            </button>
          </div>

        </div>
      </div>

      {/* FORM CONTAINER CHÍNH */}
      <div style={{ maxWidth: '1000px', margin: '1.75rem auto 0 auto', padding: '0 1.25rem' }}>
        
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '2rem 2.25rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>

          {/* 1. LOẠI BÀI VIẾT (5 CHỦ ĐỀ) */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              LOẠI BÀI VIẾT
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
              {postCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '0.6rem 1.15rem',
                      borderRadius: '24px',
                      border: isSelected ? '1.5px solid #046a47' : '1px solid #e2e8f0',
                      background: isSelected ? '#046a47' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 3px 10px rgba(4, 106, 71, 0.2)' : 'none'
                    }}
                  >
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isSelected ? '#ffffff' : '#cbd5e1'
                    }} />
                    <IconComponent size={15} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. NHẬP TIÊU ĐỀ BÀI VIẾT */}
          <div style={{ marginBottom: '1.75rem' }}>
            <input
              type="text"
              placeholder={
                selectedCategory === 'recipe'
                  ? 'Nhập tiêu đề công thức hoặc tên món ăn của bạn...'
                  : selectedCategory === 'nutrition'
                  ? 'Nhập tiêu đề bài viết kiến thức dinh dưỡng (VD: Phác đồ bổ sung sắt...)'
                  : selectedCategory === 'ingredients'
                  ? 'Nhập tiêu đề mẹo chọn nguyên liệu (VD: Cách chọn nấm tươi ngon...)'
                  : selectedCategory === 'locations'
                  ? 'Nhập tên quán chay & gợi ý địa điểm ăn chay...'
                  : 'Nhập tiêu đề bài viết chia sẻ lối sống xanh...'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '2px solid #f1f5f9',
                padding: '0.5rem 0 0.85rem 0',
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#0f172a',
                outline: 'none',
                background: 'transparent',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#046a47'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#f1f5f9'}
            />
          </div>

          {/* 3. VÙNG THÊM ẢNH BÌA */}
          <div style={{ marginBottom: '2rem' }}>
            {coverImage ? (
              <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', height: '320px', border: '1px solid #e2e8f0' }}>
                <img src={coverImage} alt="Ảnh bìa bài viết" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <label style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                  }}>
                    Đổi ảnh khác
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    style={{
                      background: 'rgba(239, 68, 68, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '20px',
                  padding: '2.5rem 1.5rem',
                  background: '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#046a47'; e.currentTarget.style.background = '#f0fdf4'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#fafafa'; }}
                >
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.65rem' }}>
                    <ImageIcon size={24} />
                  </div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#047857', marginBottom: '0.25rem' }}>
                    [+ Thêm ảnh bìa món ăn / bài viết]
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Kéo thả file hoặc nhấp chuột để tải ảnh • Tỷ lệ 16:9 khuyến dùng
                  </div>
                </label>

                {/* GỢI Ý ẢNH CHAY MẪU CÓ SẴN */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Hoặc chọn nhanh ảnh mẫu:</span>
                  {sampleCovers.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Sample cover"
                      onClick={() => handleSelectSampleCover(url)}
                      style={{ width: '44px', height: '32px', borderRadius: '6px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #cbd5e1' }}
                      title="Bấm để chọn ảnh mẫu này"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. THÔNG SỐ NẤU ĂN (CHỈ ÁP DỤNG HOẶC ĐIỀU CHỈNH KHI CẦN) */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              {selectedCategory === 'locations' ? 'THÔNG TIN ĐỊA ĐIỂM QUÁN ĂN' : 'THÔNG SỐ NẤU ĂN & THỜI GIAN'}
            </label>

            {selectedCategory === 'locations' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.75rem 1rem' }}>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <MapPin size={13} color="#047857" /> Địa chỉ quán chay:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 123 Nguyễn Thị Minh Khai, Q.1, TP.HCM"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.9rem', outline: 'none', color: '#0f172a' }}
                  />
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.75rem 1rem' }}>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                    Mức giá trung bình:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 40.000đ – 100.000đ"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.9rem', outline: 'none', color: '#0f172a' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {/* Chuẩn bị */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.75rem 1rem' }}>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Clock size={13} color="#047857" /> Chuẩn bị
                  </label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="Ví dụ: 15 phút"
                    style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.88rem', outline: 'none', color: '#0f172a' }}
                  />
                </div>

                {/* Nấu */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.75rem 1rem' }}>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Flame size={13} color="#ea580c" /> Nấu
                  </label>
                  <input
                    type="text"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    placeholder="Ví dụ: 30 phút"
                    style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.88rem', outline: 'none', color: '#0f172a' }}
                  />
                </div>

                {/* Khẩu phần */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.75rem 1rem' }}>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Users size={13} color="#0284c7" /> Khẩu phần
                  </label>
                  <input
                    type="text"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="Ví dụ: 4 người"
                    style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.88rem', outline: 'none', color: '#0f172a' }}
                  />
                </div>

                {/* Mức độ */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.75rem 1rem' }}>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <ChefHat size={13} color="#7c3aed" /> Mức độ
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.88rem', outline: 'none', color: '#0f172a', cursor: 'pointer' }}
                  >
                    <option value="Dễ">Dễ (Ai cũng làm được)</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Nâng cao">Nâng cao (Cần kỹ thuật)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 5. NGUYÊN LIỆU (THEO GIAO DIỆN ẢNH 2) */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Nguyên liệu
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {ingredients.filter(i => i.name.trim()).length} nguyên liệu đã thêm
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr 180px 36px',
                    gap: '0.65rem',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.55rem 0.85rem'
                  }}
                >
                  <span style={{ color: '#94a3b8', fontSize: '1.2rem', textAlign: 'center', lineHeight: 1 }}>•</span>

                  <input
                    type="text"
                    placeholder="Tên nguyên liệu, VD: Đậu hũ mơ..."
                    value={ing.name}
                    onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      outline: 'none',
                      color: '#0f172a'
                    }}
                  />

                  <input
                    type="text"
                    placeholder="VD: 200g, 1 thìa..."
                    value={ing.amount}
                    onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      outline: 'none',
                      color: '#475569',
                      textAlign: 'right'
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddIngredient}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#047857',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginTop: '0.75rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#ecfdf5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Plus size={16} />
              <span>[+ Thêm nguyên liệu]</span>
            </button>
          </div>

          {/* 6. CÁC BƯỚC THỰC HIỆN (THEO GIAO DIỆN ẢNH 2) */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Các bước thực hiện
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {steps.filter(s => s.trim()).length} bước chi tiết
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr 36px',
                    gap: '0.85rem',
                    alignItems: 'flex-start',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '0.85rem 1rem'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#047857',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {idx + 1}
                  </div>

                  <textarea
                    rows={2}
                    placeholder={`Mô tả chi tiết bước ${idx + 1}: sơ chế, xào nấu, canh nhiệt độ...`}
                    value={step}
                    onChange={(e) => handleUpdateStep(idx, e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      color: '#0f172a',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddStep}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#047857',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginTop: '0.75rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#ecfdf5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Plus size={16} />
              <span>[+ Thêm bước tiếp theo]</span>
            </button>
          </div>

          {/* 7. DANH MỤC MÓN & THẺ GẮN (TAGS) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem', marginBottom: '2rem' }}>
            
            {/* Danh mục */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.45rem' }}>
                Danh mục món
              </label>
              <select
                value={dishCategory}
                onChange={(e) => setDishCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.65rem 0.95rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Món chính">Món chính</option>
                <option value="Món khai vị">Món khai vị & Salad</option>
                <option value="Món canh & súp">Món canh & súp</option>
                <option value="Món xào & Chiên">Món xào & Chiên không dầu</option>
                <option value="Món kho & Rim">Món kho & Rim đậm đà</option>
                <option value="Món nước">Món nước (Phở, Bún, Miến)</option>
                <option value="Bánh & Tráng miệng">Bánh & Tráng miệng</option>
                <option value="Đồ uống & Sinh tố">Đồ uống & Sinh tố</option>
              </select>
            </div>

            {/* Thẻ gắn Tags */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.45rem' }}>
                Thẻ gắn (Tags)
              </label>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '0.45rem 0.65rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                {tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    style={{
                      background: '#ecfdf5',
                      color: '#047857',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    #{tag}
                    <X
                      size={12}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Thêm thẻ (nhấn Enter để thêm tag)..."
                  value={currentTagInput}
                  onChange={(e) => setCurrentTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.82rem',
                    outline: 'none',
                    flex: 1,
                    minWidth: '160px',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>

          </div>

          {/* 8. TRỢ LÝ DINH DƯỠNG AI (AI NUTRITION ASSISTANT BOX - KHỚP 100% ẢNH 2) */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
            border: '1px solid #a7f3d0',
            borderRadius: '20px',
            padding: '1.4rem 1.6rem',
            boxShadow: '0 2px 12px rgba(4, 106, 71, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: '#dcfce7',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    Trợ lý dinh dưỡng AI
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Tự động tính Calo, Vi chất & Kiểm tra dị ứng
                  </span>
                </div>
              </div>

              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                background: aiAnalysisResult ? '#ecfdf5' : '#f1f5f9',
                color: aiAnalysisResult ? '#047857' : '#64748b',
                padding: '3px 9px',
                borderRadius: '8px'
              }}>
                {aiAnalysisResult ? 'Đã phân tích xong' : 'Chờ dữ liệu'}
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
              AI sẽ tự động tính calo, vi chất và kiểm tra dị ứng sau khi bạn nhập nguyên liệu và các bước thực hiện.
            </p>

            {/* KẾT QUẢ AI NẾU ĐÃ PHÂN TÍCH */}
            {aiAnalysisResult && (
              <div style={{
                background: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: '14px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem', marginBottom: '0.65rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Năng lượng</div>
                    <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>{aiAnalysisResult.calories} kcal</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Đạm thực vật</div>
                    <strong style={{ fontSize: '0.96rem', color: '#047857' }}>{aiAnalysisResult.protein}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Chất xơ</div>
                    <strong style={{ fontSize: '0.96rem', color: '#0284c7' }}>{aiAnalysisResult.fiber}</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Sắt Non-Heme</div>
                    <strong style={{ fontSize: '0.96rem', color: '#d97706' }}>{aiAnalysisResult.iron}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={14} />
                  <span>{aiAnalysisResult.allergenCheck}</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569', fontStyle: 'italic' }}>
                  💡 {aiAnalysisResult.aiComment}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzingAI}
              style={{
                background: '#ffffff',
                border: '1px solid #a7f3d0',
                color: '#047857',
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: isAnalyzingAI ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 1px 4px rgba(4, 106, 71, 0.08)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { if (!isAnalyzingAI) e.currentTarget.style.background = '#ecfdf5'; }}
              onMouseLeave={(e) => { if (!isAnalyzingAI) e.currentTarget.style.background = '#ffffff'; }}
            >
              <Sparkles size={15} />
              <span>{isAnalyzingAI ? 'Đang phân tích dinh dưỡng AI...' : 'Sẵn sàng tính toán'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
