import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, HeartPulse, Gift, Scale, Check, Eye, EyeOff, 
  Lock, Mail, Phone, User, Sparkles, ArrowRight, Shield, Star
} from 'lucide-react';

export default function RegisterPage({ onNavigate }) {
  // Luôn đảm bảo khi mở trang Đăng ký thì vị trí cuộn ở đỉnh trang (0, 0)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const [activeTab, setActiveTab] = useState('register'); // 'login' | 'register'
  const [dietGoal, setDietGoal] = useState('flexitarian'); // 'vegan' | 'flexitarian' | 'weight_loss'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const getPasswordStrength = () => {
    if (!password) return { label: 'Chưa nhập', level: 0 };
    if (password.length < 6) return { label: 'Yếu', level: 1 };
    if (password.length < 8) return { label: 'Trung bình', level: 2 };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: 'Rất mạnh', level: 4 };
    return { label: 'Mạnh', level: 3 };
  };

  const strength = getPasswordStrength();

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    alert(`Chào mừng ${fullName || 'bạn'} gia nhập VeggieAI! Đang chuyển hướng đến khảo sát dinh dưỡng...`);
    if (onNavigate) onNavigate('planner');
  };

  return (
    <div className="register-page-container">
      {/* 2-COLUMN MAIN REGISTRATION SECTION */}
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
                <Scale size={20} />
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
                <HeartPulse size={20} />
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
                <Gift size={20} />
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
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
            marginBottom: '1.5rem'
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

          {/* TRUST BADGES */}
          <div className="trust-footer-badges">
            <div className="trust-item">
              <Shield size={16} />
              <span>Bảo mật 256-bit SSL</span>
            </div>
            <div className="trust-item">
              <ShieldCheck size={16} />
              <span>Chuẩn khuyến nghị RNI 2024</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTRATION FORM */}
        <div className="register-right-col">
          <div className="register-card">
            
            {/* TOP TAB SWITCHER */}
            <div className="auth-tabs-segmented">
              <button 
                type="button"
                className="auth-tab-btn"
                onClick={() => onNavigate ? onNavigate('login') : setActiveTab('login')}
              >
                Đăng nhập
              </button>
              <button 
                type="button"
                className="auth-tab-btn active"
                onClick={() => setActiveTab('register')}
              >
                Đăng ký tài khoản mới
              </button>
            </div>

            <div className="already-have-account" style={{ marginBottom: '1.25rem', textAlign: 'right' }}>
              Đã có tài khoản? <a href="#login" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('login'); else setActiveTab('login'); }}>Đăng nhập</a>
            </div>

            {/* SOCIAL SIGNUP */}
            <div className="social-section">
              <div className="social-label">ĐĂNG KÝ TỨC THÌ TRONG 3 GIÂY</div>
              <div className="social-buttons-row">
                <button type="button" className="social-btn google-btn">
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Đăng ký với Google</span>
                </button>

                <button type="button" className="social-btn apple-btn">
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.96 2.76 1.01.08 2.05-.51 2.69-1.26z"/>
                  </svg>
                  <span>Đăng ký với Apple</span>
                </button>
              </div>
            </div>

            <div className="divider-row">
              <span className="divider-line"></span>
              <span className="divider-text">HOẶC ĐĂNG KÝ VỚI EMAIL</span>
              <span className="divider-line"></span>
            </div>

            {/* FORM FIELDS */}
            <form onSubmit={handleRegisterSubmit} className="register-form">
              {/* Field 1: Họ và tên */}
              <div className="form-group">
                <label className="form-label">
                  Họ và tên <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input 
                    type="text" 
                    required 
                    placeholder="Ví dụ: Nguyễn Minh Anh" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Row: Email & SĐT */}
              <div className="form-two-cols">
                <div className="form-group">
                  <label className="form-label">
                    Địa chỉ Email <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Mail size={18} className="field-icon" />
                    <input 
                      type="email" 
                      required 
                      placeholder="minhanh@gmail.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-with-optional">
                    <label className="form-label">Số điện thoại</label>
                    <span className="optional-text">Tùy chọn</span>
                  </div>
                  <div className="input-with-icon">
                    <Phone size={18} className="field-icon" />
                    <input 
                      type="tel" 
                      placeholder="0912 345 678" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Row: Mật khẩu & Xác nhận */}
              <div className="form-two-cols">
                <div className="form-group">
                  <label className="form-label">
                    Mật khẩu <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Lock size={18} className="field-icon" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      placeholder="Ít nhất 8 ký tự" 
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

                <div className="form-group">
                  <label className="form-label">
                    Xác nhận mật khẩu <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <ShieldCheck size={18} className="field-icon" />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required 
                      placeholder="Nhập lại mật khẩu" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="eye-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="password-strength-box">
                <div className="strength-header">
                  <span>Độ an toàn mật khẩu:</span>
                  <span className={`strength-label strength-${strength.level}`}>{strength.label}</span>
                </div>
                <div className="strength-meter-bars">
                  <span className={`meter-bar ${strength.level >= 1 ? 'bar-filled' : ''}`}></span>
                  <span className={`meter-bar ${strength.level >= 2 ? 'bar-filled' : ''}`}></span>
                  <span className={`meter-bar ${strength.level >= 3 ? 'bar-filled' : ''}`}></span>
                  <span className={`meter-bar ${strength.level >= 4 ? 'bar-filled' : ''}`}></span>
                </div>
                <div className="strength-hint">
                  Nên bao gồm chữ hoa, chữ số và ít nhất 8 ký tự.
                </div>
              </div>

              {/* DIET GOAL SELECTOR */}
              <div className="diet-goal-section">
                <div className="diet-goal-header">
                  <span className="goal-title">🎯 Mục tiêu ẩm thực chay chính của bạn là gì?</span>
                  <a href="#ai-personalize" className="ai-personalize-link">Cá nhân hóa AI</a>
                </div>

                <div className="goal-cards-grid">
                  {/* Card 1 */}
                  <div 
                    className={`goal-card ${dietGoal === 'vegan' ? 'active' : ''}`}
                    onClick={() => setDietGoal('vegan')}
                  >
                    <div className="goal-card-top">
                      <span className="goal-icon">🌱</span>
                      {dietGoal === 'vegan' && <span className="goal-check-circle"><Check size={12} /></span>}
                    </div>
                    <h4 className="goal-card-title">Thuần chay (Vegan)</h4>
                    <p className="goal-card-desc">100% nguồn gốc thực vật, kiêng tuyệt đối bơ sữa trứng.</p>
                  </div>

                  {/* Card 2 (Active by default) */}
                  <div 
                    className={`goal-card ${dietGoal === 'flexitarian' ? 'active' : ''}`}
                    onClick={() => setDietGoal('flexitarian')}
                  >
                    <div className="goal-card-top">
                      <span className="goal-icon">🍴</span>
                      {dietGoal === 'flexitarian' && <span className="goal-check-circle"><Check size={12} /></span>}
                    </div>
                    <h4 className="goal-card-title">Ăn chay bán phần</h4>
                    <p className="goal-card-desc">Chay linh hoạt 3–4 ngày/tuần, duy trì năng lượng làm việc.</p>
                  </div>

                  {/* Card 3 */}
                  <div 
                    className={`goal-card ${dietGoal === 'weight_loss' ? 'active' : ''}`}
                    onClick={() => setDietGoal('weight_loss')}
                  >
                    <div className="goal-card-top">
                      <span className="goal-icon">⤢</span>
                      {dietGoal === 'weight_loss' && <span className="goal-check-circle"><Check size={12} /></span>}
                    </div>
                    <h4 className="goal-card-title">Sức khỏe & Giảm cân</h4>
                    <p className="goal-card-desc">Thanh lọc cơ thể, giảm mỡ máu, cải thiện tiêu hóa tự nhiên.</p>
                  </div>
                </div>
              </div>

              {/* TERMS CHECKBOX */}
              <div className="terms-checkbox-row">
                <input 
                  type="checkbox" 
                  id="terms-check"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="terms-check" className="terms-label">
                  Tôi đồng ý với <a href="#terms">Điều khoản dịch vụ</a> & <a href="#privacy">Chính sách bảo mật</a> của VeggieAI. Cho phép AI hỗ trợ tự động gợi ý thực đơn thích hợp nhất.
                </label>
              </div>

              {/* SUBMIT BUTTON */}
              <button type="submit" className="btn-submit-register">
                <Sparkles size={18} className="btn-icon" />
                <span>Tạo tài khoản & Bắt đầu khảo sát dinh dưỡng</span>
                <ArrowRight size={18} className="btn-arrow" />
              </button>

              <div className="register-trust-subtext">
                <ShieldCheck size={15} color="#059669" />
                <span>Hoàn toàn miễn phí đăng ký • Hủy hoặc thay đổi thông tin bất kỳ lúc nào</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 4-COLUMN STATS SECTION */}
      <div className="register-stats-container">
        <div className="stats-inner-grid">
          {/* Stat 1 */}
          <div className="stat-col">
            <div className="stat-value">12.000+</div>
            <div className="stat-main-label">Công thức thuần chay</div>
            <div className="stat-sub-label">Chuẩn vị 3 miền Bắc - Trung - Nam</div>
          </div>

          {/* Stat 2 */}
          <div className="stat-col">
            <div className="stat-value">98.4%</div>
            <div className="stat-main-label">Đáp ứng đủ Protein</div>
            <div className="stat-sub-label">Không cần dùng thực phẩm chức năng</div>
          </div>

          {/* Stat 3 */}
          <div className="stat-col">
            <div className="stat-value">&lt; 15p</div>
            <div className="stat-main-label">Chế biến nhanh gọn</div>
            <div className="stat-sub-label">Tối ưu cho người đi làm bận rộn</div>
          </div>

          {/* Stat 4 */}
          <div className="stat-col">
            <div className="stat-value">4.9 / 5</div>
            <div className="stat-main-label">Đánh giá người dùng</div>
            <div className="stat-sub-label">Hài lòng với hương vị & độ ngon miệng</div>
          </div>
        </div>
      </div>
    </div>
  );
}
