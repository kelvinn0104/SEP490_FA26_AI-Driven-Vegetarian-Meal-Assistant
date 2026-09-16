import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Video, Link2, Upload, Clock, CheckCircle2, 
  ShieldCheck, Sparkles, Send, Save, X, Plus, AlertCircle,
  HelpCircle, Eye, Film, Check, ExternalLink
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function CreateVideoPage({ onNavigate }) {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // LUỒNG ĐĂNG TẢI: 'upload' (Luồng A: Tải video lên) hoặc 'link' (Luồng B: Dẫn link video)
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' | 'link'

  // FORM STATES
  const [videoFile, setVideoFile] = useState(null);
  const [videoFileName, setVideoFileName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [channelSource, setChannelSource] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Món canh chay');
  const [cookTime, setCookTime] = useState('20 phút');
  
  // NGUYÊN LIỆU CHÍNH
  const [ingredients, setIngredients] = useState([
    'Nấm bào ngư (200g)',
    'Cà chua chín (2 quả)',
    'Đậu hũ non (1 bìa)'
  ]);
  const [newIngredientInput, setNewIngredientInput] = useState('');

  // CAM KẾT BẢN QUYỀN
  const [copyrightAccepted, setCopyrightAccepted] = useState(true);

  // THÔNG BÁO TOAST & STATUS
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState('Đã lưu nháp tự động 1 phút trước');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // THÊM NGUYÊN LIỆU
  const handleAddIngredient = () => {
    if (newIngredientInput.trim()) {
      setIngredients([...ingredients, newIngredientInput.trim()]);
      setNewIngredientInput('');
    }
  };

  const handleRemoveIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, idx) => idx !== indexToRemove));
  };

  // CHỌN FILE VIDEO HOẶC FILE DEMO
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoFileName(file.name);
      showToast(`✓ Đã chọn video: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    }
  };

  const handleSelectDemoVideo = () => {
    setVideoFileName('canh_chua_nam_chay_hd_1080p.mp4');
    setVideoFile({ name: 'canh_chua_nam_chay_hd_1080p.mp4', size: 45 * 1024 * 1024 });
    showToast('✓ Đã tải tệp video mẫu thành công!');
  };

  // LƯU NHÁP
  const handleSaveDraft = () => {
    setLastSavedTime('Đã lưu nháp tự động vừa xong');
    showToast('💾 Đã lưu bài chia sẻ video vào bản nháp!');
  };

  // ĐĂNG VIDEO
  const handleSubmitVideo = () => {
    if (!title.trim()) {
      showToast('⚠️ Vui lòng nhập tiêu đề hoặc tên món ăn cho video!');
      return;
    }

    if (uploadMode === 'upload' && !videoFileName) {
      showToast('⚠️ Vui lòng tải lên tệp video từ thiết bị của bạn!');
      return;
    }

    if (uploadMode === 'link' && !videoUrl.trim()) {
      showToast('⚠️ Vui lòng nhập đường link video từ YouTube hoặc TikTok!');
      return;
    }

    if (uploadMode === 'upload' && !copyrightAccepted) {
      showToast('⚠️ Vui lòng xác nhận cam kết bản quyền video chính chủ!');
      return;
    }

    setIsSubmitting(true);
    showToast('🚀 Đang gửi video & chuyển tới thuật toán Speech-to-Recipe AI...');

    setTimeout(() => {
      setIsSubmitting(false);
      showToast('✅ Đăng video thành công! Video đã được gửi đến Moderator kiểm duyệt.');
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('videos');
        }
      }, 1200);
    }, 1500);
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

      {/* TOP HEADER */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          <div>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('videos') : null}
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
              <span>Quay lại Video nấu ăn</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Chia sẻ Video Nấu Ăn Mới
              </h1>
              <span style={{ fontSize: '0.74rem', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                {lastSavedTime}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
              Chia sẻ công thức và cách làm món chay ngon thông qua video. Hệ thống hỗ trợ tách tóm tắt bước nấu ăn bằng AI.
            </p>
          </div>

          {/* ACTION BUTTONS: LƯU NHÁP | ĐĂNG VIDEO */}
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
              onClick={handleSubmitVideo}
              disabled={isSubmitting}
              style={{
                background: '#046a47',
                border: 'none',
                color: '#ffffff',
                padding: '0.6rem 1.4rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 14px rgba(4, 106, 71, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#065f46'; }}
              onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#046a47'; }}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Đang gửi...' : 'Đăng video'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* BODY CONTENT CONTAINER */}
      <div style={{ maxWidth: '1040px', margin: '1.75rem auto 0 auto', padding: '0 1.25rem' }}>
        
        {/* ========================================================================= */}
        {/* BƯỚC 1: HÌNH THỨC ĐĂNG TẢI (CHỌN 1 TRONG 2 LUỒNG) */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                BƯỚC 1: HÌNH THỨC ĐĂNG TẢI
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
                Bạn muốn chia sẻ video theo cách nào?
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#ffffff', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
              Chọn 1 trong 2 luồng
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* LUỒNG A: TẢI VIDEO LÊN (CHÍNH CHỦ) */}
            <div
              onClick={() => setUploadMode('upload')}
              style={{
                background: '#ffffff',
                border: uploadMode === 'upload' ? '2px solid #046a47' : '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '1.25rem 1.4rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: uploadMode === 'upload' ? '0 4px 16px rgba(4, 106, 71, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: uploadMode === 'upload' ? '#ecfdf5' : '#f8fafc',
                    color: uploadMode === 'upload' ? '#047857' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Video size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>Tải video lên</strong>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px' }}>
                        Chính chủ
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Video tự quay của bạn (Video gốc chính chủ)</span>
                  </div>
                </div>

                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: uploadMode === 'upload' ? '6px solid #046a47' : '2px solid #cbd5e1',
                  background: '#ffffff'
                }} />
              </div>

              <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={13} />
                <span>Hỗ trợ gắn quyền Tác Giả & xuất hiện trực tiếp trên trang chủ</span>
              </div>
            </div>

            {/* LUỒNG B: DẪN LINK VIDEO (YOUTUBE / TIKTOK) */}
            <div
              onClick={() => setUploadMode('link')}
              style={{
                background: '#ffffff',
                border: uploadMode === 'link' ? '2px solid #046a47' : '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '1.25rem 1.4rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: uploadMode === 'link' ? '0 4px 16px rgba(4, 106, 71, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: uploadMode === 'link' ? '#ecfdf5' : '#f8fafc',
                    color: uploadMode === 'link' ? '#047857' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Link2 size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>Dẫn link video</strong>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px' }}>
                        Liên kết
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Từ YouTube / TikTok (đã được sự cho phép hoặc công khai)</span>
                  </div>
                </div>

                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: uploadMode === 'link' ? '6px solid #046a47' : '2px solid #cbd5e1',
                  background: '#ffffff'
                }} />
              </div>

              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ExternalLink size={13} />
                <span>Nhúng nhanh qua URL, yêu cầu ghi nguồn gốc kênh minh bạch</span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* KHỐI FORM NHẬP THÔNG TIN VIDEO */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '2rem 2.25rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          marginBottom: '1.75rem'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {uploadMode === 'upload' ? 'PHƯƠNG THỨC A' : 'PHƯƠNG THỨC B'}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                {uploadMode === 'upload' ? 'Thông tin video tải lên' : 'Thông tin liên kết video'}
              </h2>
            </div>

            <span style={{ fontSize: '0.76rem', fontWeight: 700, background: '#ecfdf5', color: '#047857', padding: '3px 10px', borderRadius: '8px' }}>
              {uploadMode === 'upload' ? '📁 File gốc' : '🔗 Liên kết nhúng'}
            </span>
          </div>

          {/* 1. TẬP TIN VIDEO HOẶC NHẬP LINK */}
          {uploadMode === 'upload' ? (
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
                Tập tin Video <span style={{ color: '#ef4444' }}>*</span>
              </label>

              {videoFileName ? (
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Film size={22} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>{videoFileName}</strong>
                      <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 600 }}>✓ Đã tải sẵn sàng để xử lý Speech-to-Recipe</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <label style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                      Đổi video khác
                      <input type="file" accept="video/mp4,video/mov,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    <button
                      type="button"
                      onClick={() => { setVideoFile(null); setVideoFileName(''); }}
                      style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Xóa
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
                    borderRadius: '18px',
                    padding: '2.5rem 1.5rem',
                    background: '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#046a47'; e.currentTarget.style.background = '#f0fdf4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#fafafa'; }}
                  >
                    <input type="file" accept="video/mp4,video/mov,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.65rem' }}>
                      <Video size={24} />
                    </div>
                    <strong style={{ fontSize: '0.98rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                      Kéo thả file video vào đây hoặc chọn từ máy tính
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
                      Định dạng MP4, MOV • Tối đa 500MB • Thời lượng dưới 20 phút để AI tách bước chính xác nhất
                    </span>

                    <span style={{
                      background: '#046a47',
                      color: '#ffffff',
                      padding: '0.55rem 1.25rem',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <Upload size={15} /> Tải video lên từ thiết bị
                    </span>
                  </label>

                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Chưa có file video sẵn?</span>
                    <button
                      type="button"
                      onClick={handleSelectDemoVideo}
                      style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#047857', fontSize: '0.76rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Chọn file video mẫu demo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
                    Đường dẫn link video (YouTube / TikTok) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="VD: https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.7rem 1rem',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
                    Tên kênh tác giả gốc <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Bếp Chay Tuệ Tâm"
                    value={channelSource}
                    onChange={(e) => setChannelSource(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.7rem 1rem',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. TIÊU ĐỀ VIDEO */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
              Tiêu đề video <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tên món ăn hoặc tiêu đề video... VD: Cách nấu canh chua nấm thanh đạm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none'
              }}
            />
          </div>

          {/* 3. MÔ TẢ NGẮN & CẢM HỨNG MÓN ĂN */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
              Mô tả ngắn & Cảm hứng món ăn
            </label>
            <textarea
              rows={3}
              placeholder="Giới thiệu ngắn về món ăn, cảm hứng nấu và hương vị thanh tịnh..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* 4. DANH MỤC MÓN & THỜI LƯỢNG NẤU */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
                Danh mục món ăn <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Món canh chay">Món canh chay</option>
                <option value="Món kho & Rim">Món kho & Rim</option>
                <option value="Món xào & Chiên giòn">Món xào & Chiên giòn</option>
                <option value="Món bún & Phở chay">Món bún & Phở chay</option>
                <option value="Món lẩu dưỡng sinh">Món lẩu dưỡng sinh</option>
                <option value="Bánh & Tráng miệng">Bánh & Tráng miệng</option>
                <option value="Đồ uống & Smoothie">Đồ uống & Smoothie</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
                Thời lượng nấu ước tính
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Clock size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  placeholder="20 phút"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '0.7rem 1rem 0.7rem 2.4rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* 5. NGUYÊN LIỆU CHÍNH (KHÔNG BẮT BUỘC) */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Nguyên liệu chính (không bắt buộc)
              </label>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                AI sẽ tự nhận diện thêm từ âm thanh video
              </span>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '14px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              {ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {ing}
                  <X
                    size={13}
                    style={{ cursor: 'pointer', color: '#94a3b8' }}
                    onClick={() => handleRemoveIngredient(idx)}
                  />
                </span>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  placeholder="Thêm nguyên liệu... (vd: Rau muống, ngô ngọt)"
                  value={newIngredientInput}
                  onChange={(e) => setNewIngredientInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIngredient(); } }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.82rem',
                    outline: 'none',
                    flex: 1,
                    color: '#0f172a'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  style={{
                    background: '#e2e8f0',
                    border: 'none',
                    color: '#334155',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  + Thêm
                </button>
              </div>
            </div>
          </div>

          {/* 6. CAM KẾT BẢN QUYỀN VIDEO CHÍNH CHỦ (CHỈ ÁP DỤNG CHO LUỒNG TẢI VIDEO LÊN) */}
          {uploadMode === 'upload' && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '16px',
              padding: '1.25rem 1.4rem',
              marginBottom: '1.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                </div>
                <strong style={{ fontSize: '0.92rem', color: '#92400e' }}>
                  Cam kết bản quyền video chính chủ
                </strong>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#78350f', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
                Để bảo vệ cộng đồng sáng tạo ẩm thực chay lành mạnh, VeggieAI nghiêm cấm tải lên nội dung sao chép không phép từ các kênh truyền hình hoặc nhà sáng tạo khác.
              </p>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: '#92400e' }}>
                <input
                  type="checkbox"
                  checked={copyrightAccepted}
                  onChange={(e) => setCopyrightAccepted(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#047857', cursor: 'pointer' }}
                />
                <span>Tôi xác nhận đây là video do tôi tự quay hoặc sở hữu bản quyền hợp pháp, và chịu trách nhiệm nếu vi phạm.</span>
              </label>
            </div>
          )}

          {/* FOOTER ACTION SUMMARY */}
          <div style={{ display: 'flex', justifyContent: uploadMode === 'upload' ? 'space-between' : 'flex-end', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            {uploadMode === 'upload' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: copyrightAccepted ? '#047857' : '#94a3b8', fontWeight: 700 }}>
                <CheckCircle2 size={14} />
                <span>{copyrightAccepted ? 'Đã xác nhận cam kết bản quyền hợp lệ' : 'Chưa xác nhận cam kết bản quyền'}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <Button variant="secondary" onClick={handleSaveDraft}>
                Lưu nháp
              </Button>
              <Button onClick={handleSubmitVideo}>
                <Send size={15} /> Đăng video
              </Button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
