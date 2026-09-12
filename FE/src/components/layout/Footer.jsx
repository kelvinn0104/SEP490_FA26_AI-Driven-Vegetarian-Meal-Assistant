import React from 'react';
import { Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* MAIN COLUMNS */}
        <div className="footer-grid">
          {/* CỘT 1: VeggieAI */}
          <div className="footer-col-brand">
            <div className="footer-brand-logo">
              <span className="brand-icon">🌱</span>
              <span className="brand-name">VeggieAI</span>
            </div>
            <p className="footer-desc">
              Trợ lý dinh dưỡng thực dưỡng thông minh dẫn lối phong cách sống thuần chay cân bằng, ngon miệng và tràn đầy sinh khí nhờ sức mạnh trí tuệ nhân tạo.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">AI Vision 2.0</span>
              <span className="footer-badge">Dinh Dưỡng Khoa Học</span>
            </div>
          </div>

          {/* CỘT 2: KHÁM PHÁ */}
          <div className="footer-col">
            <h4 className="footer-col-title">KHÁM PHÁ</h4>
            <ul className="footer-links">
              <li><a href="#planner">Kế hoạch thực đơn AI</a></li>
              <li><a href="#blog">Blog & Bài viết dinh dưỡng</a></li>
              <li><a href="#videos">Kho video nấu ăn</a></li>
              <li>
                <a href="#restaurants">
                  Tìm quán chay gần bạn <span className="footer-app-tag">(chỉ trên App)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 3: CÔNG CỤ & TRỢ LÝ */}
          <div className="footer-col">
            <h4 className="footer-col-title">CÔNG CỤ & TRỢ LÝ</h4>
            <ul className="footer-links">
              <li><a href="#chatbot">Trò chuyện cùng AI Chef</a></li>
              <li><a href="#planner">Tính toán Macro & Calo</a></li>
              <li>
                <a href="#vision">
                  Quét nguyên liệu <span className="footer-app-tag">(chỉ trên App)</span>
                </a>
              </li>
              <li>
                <a href="#market">
                  Sổ tay đi chợ (tạo từ thực đơn)
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 4: ỨNG DỤNG DI ĐỘNG */}
          <div className="footer-col">
            <h4 className="footer-col-title">ỨNG DỤNG DI ĐỘNG</h4>
            <p className="footer-mobile-text">
              Trải nghiệm đầy đủ trên di động
            </p>
            <div className="footer-app-buttons">
              <button className="app-download-btn">
                <Smartphone size={20} className="app-btn-icon" />
                <div className="app-btn-text">
                  <span className="app-btn-sub">Tải trên</span>
                  <span className="app-btn-main">App Store</span>
                </div>
              </button>

              <button className="app-download-btn">
                <span className="google-play-icon">▶</span>
                <div className="app-btn-text">
                  <span className="app-btn-sub">Có sẵn trên</span>
                  <span className="app-btn-main">Google Play</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="footer-bottom-bar">
          <div className="copyright-text">
            © 2026 VeggieAI. Trợ lý dinh dưỡng và ẩm thực thuần chay thông minh. Bảo lưu mọi quyền.
          </div>
          <div className="footer-legal-links">
            <a href="#terms">Điều khoản</a>
            <a href="#privacy">Bảo mật</a>
            <a href="#help">Liên hệ trợ giúp</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
