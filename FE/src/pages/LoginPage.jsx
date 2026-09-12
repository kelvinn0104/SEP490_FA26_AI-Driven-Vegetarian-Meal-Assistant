import React, { useState } from 'react';
import { 
  Eye, EyeOff, Lock, Mail, User, ArrowRight, ShieldCheck, 
  Camera, Utensils, Video, Star, Compass, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginStatus, setLoginStatus] = useState(null);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginStatus('success');

    login({
      name: identifier.includes('@') ? identifier.split('@')[0] : (identifier || 'Thành viên VeggieAI'),
      email: identifier.includes('@') ? identifier : `${identifier || 'user'}@veggieai.vn`,
      role: 'AuthorizedUser'
    });

    setTimeout(() => {
      if (onNavigate) onNavigate('home');
    }, 600);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Hệ thống VeggieAI đã gửi liên kết khôi phục mật khẩu vào Email hoặc Số điện thoại của bạn!');
  };

  return (
    <div className="register-page-container">
      {/* 2-COLUMN MAIN LOGIN SECTION */}
      <div className="register-main-grid">
        
        {/* LEFT COLUMN: VALUE PROPOSITIONS & DOCTOR ENDORSEMENT */}
        <div className="register-left-col">
          <div className="trust-top-pill">
            <span style={{ color: '#047857', fontSize: '1rem' }}>🌿</span>
            <span>Hệ sinh thái ẩm thực chay 4.0 • Hơn 85.000+ bữa ăn được cá nhân hóa</span>
          </div>

          <h1 className="register-heading">
            Bắt đầu hành trình <span style={{ color: '#047857' }}>ăn chay khoa học</span> & tràn đầy năng lượng cùng VeggieAI
          </h1>

          <p className="register-subheading">
            Khám phá thực đơn thực dưỡng chuẩn xác, thấu hiểu cơ thể bằng thuật toán AI và tận hưởng hương vị nguyên bản từ nông trại xanh.
          </p>

          {/* 3 VALUE CARDS */}
          <div className="register-features-list">
            {/* Card 1 */}
            <div className="reg-feature-item">
              <div className="reg-feature-icon-box green-icon-box">
                <Utensils size={20} />
              </div>
              <div className="reg-feature-content">
                <div className="reg-feature-header">
                  <h3 className="reg-feature-title">AI Meal Planner</h3>
                  <span className="auth-pill-blue">Cá nhân hoá 100%</span>
                </div>
                <p className="reg-feature-desc">
                  Tự động tính toán theo chỉ số BMI, phân bổ tối ưu hàm lượng Protein thực vật, Sắt hữu cơ và bổ sung Vitamin B12 thiết yếu.
                </p>
                <div className="auth-metric-row">
                  <span>• 24g Protein/bữa</span>
                  <span>• Bù 100% B12</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="reg-feature-item">
              <div className="reg-feature-icon-box pink-icon-box">
                <Camera size={20} />
              </div>
              <div className="reg-feature-content">
                <div className="reg-feature-header">
                  <h3 className="reg-feature-title">AI Fridge Vision</h3>
                  <span className="auth-pill-peach">Tốc độ ~ 3 giây</span>
                </div>
                <p className="reg-feature-desc">
                  Quét ảnh nguyên liệu còn thừa trong ngăn lạnh, nhận diện tức thì và đề xuất món chay thơm lành, triệt tiêu lãng phí thực phẩm.
                </p>
                <div className="auth-metric-row">
                  <span>Độ chuẩn xác 98.4%</span>
                  <span>• Giảm 35% rác hữu cơ gia đình</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="reg-feature-item">
              <div className="reg-feature-icon-box green-icon-box">
                <Video size={20} />
              </div>
              <div className="reg-feature-content">
                <div className="reg-feature-header">
                  <h3 className="reg-feature-title">Video Recipe AI</h3>
                  <span className="auth-pill-blue">Speech-to-Text</span>
                </div>
                <p className="reg-feature-desc">
                  Bóc tách công thức nấu ăn trực quan từ YouTube & TikTok: phân đoạn thời gian, định lượng gia vị và danh mục chuẩn bị.
                </p>
              </div>
            </div>
          </div>

          {/* DOCTOR ENDORSEMENT CARD */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            padding: '1.25rem 1.4rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', color: '#f59e0b', fontSize: '0.9rem' }}>
                <Star size={15} fill="#f59e0b" />
                <Star size={15} fill="#f59e0b" />
                <Star size={15} fill="#f59e0b" />
                <Star size={15} fill="#f59e0b" />
                <Star size={15} fill="#f59e0b" />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginLeft: '0.25rem' }}>
                5.0 / 5.0
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.55, margin: '0 0 0.85rem 0' }}>
              “VeggieAI đã giải quyết được nút thắt lớn nhất của người bắt đầu ăn chay: nỗi lo thiếu vi chất và cảm giác đơn điệu trong bữa ăn hằng ngày.”
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  BS.CKI Nguyễn Lan Anh
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Chuyên gia Dinh dưỡng Lâm sàng Viện Dinh Dưỡng Tự Nhiên
                </div>
              </div>
              <div style={{ color: '#047857' }} title="Đã xác thực chuyên gia dinh dưỡng">
                <ShieldCheck size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN CARD */}
        <div className="register-right-col">
          <div className="register-card">
            
            {/* TOP BRAND & WEB VERSION */}
            <div className="login-top-brand-row">
              <div className="login-brand-logo">
                <span style={{ fontSize: '1.4rem' }}>🌱</span>
                <span>VeggieAI</span>
              </div>
              <span className="login-web-version-badge">Phiên bản Web 2.4</span>
            </div>

            {/* TAB SWITCHER: ĐĂNG NHẬP VS ĐĂNG KÝ */}
            <div className="auth-tabs-segmented">
              <button 
                type="button" 
                className="auth-tab-btn active"
                onClick={() => {}}
              >
                Đăng nhập
              </button>
              <button 
                type="button" 
                className="auth-tab-btn"
                onClick={() => onNavigate && onNavigate('register')}
              >
                Đăng ký tài khoản mới
              </button>
            </div>

            {/* SOCIAL LOGIN */}
            <div className="auth-social-row">
              <button type="button" className="auth-social-pill-btn">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              <button type="button" className="auth-social-pill-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.96 2.76 1.01.08 2.05-.51 2.69-1.26z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* DIVIDER */}
            <div className="divider-row">
              <span className="divider-line"></span>
              <span className="divider-text">HOẶC QUA THÔNG TIN</span>
              <span className="divider-line"></span>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleLoginSubmit}>
              {/* Field 1: Email hoặc Số điện thoại */}
              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label">
                  Email hoặc Số điện thoại
                </label>
                <div className="input-with-icon">
                  <span style={{ color: '#94a3b8', fontSize: '1.05rem', fontWeight: 600 }}>@</span>
                  <input 
                    type="text" 
                    required 
                    placeholder="name@example.com hoặc 090..." 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              {/* Field 2: Mật khẩu & Quên mật khẩu */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <div className="auth-field-label-row">
                  <label className="form-label">Mật khẩu</label>
                  <a href="#forgot" className="auth-forgot-link" onClick={handleForgotPassword}>
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="eye-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Checkbox: Ghi nhớ đăng nhập 30 ngày */}
              <label className="auth-remember-row">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập 30 ngày</span>
              </label>

              {/* Submit Button */}
              <button type="submit" className="auth-submit-btn">
                <span>Đăng nhập vào VeggieAI</span>
                <ArrowRight size={18} />
              </button>

              {loginStatus === 'success' && (
                <div style={{
                  padding: '0.65rem 1rem',
                  background: '#ecfdf5',
                  color: '#047857',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  Đăng nhập thành công! Đang chuyển hướng...
                </div>
              )}
            </form>

            {/* BOTTOM CALLOUT BOX */}
            <div className="auth-trial-callout">
              <div className="auth-trial-icon-box">
                <Compass size={18} />
              </div>
              <div className="auth-trial-text">
                Bạn muốn dùng thử trước? <strong>Trải nghiệm bản dùng thử giới hạn với Trợ lý AI</strong>
              </div>
              <button 
                type="button"
                className="auth-trial-btn"
                onClick={() => onNavigate && onNavigate('home')}
              >
                Khám phá ngay
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
