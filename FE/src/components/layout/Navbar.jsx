import React, { useState } from 'react';
import { Search, Sparkles, User, ShieldCheck, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // PHÂN QUYỀN HEADER THEO BẢNG QUY ĐỊNH (CHỈ HIỂN THỊ CHỨC NĂNG ĐƯỢC PHÉP CHO GUEST):
  // 1. Tìm kiếm blog, video, công thức công khai (WF06)
  // 2. Xem chi tiết bài viết blog (WF06)
  // 3. Xem chi tiết video hướng dẫn nấu ăn (WF06)
  // 4. Hỏi đáp với AI Nutrition Chatbot — giới hạn số lượt hỏi (WF05)
  // 5. Bắt đầu quy trình đăng ký / thiết lập hồ sơ dinh dưỡng (WF01)
  
  const guestNavLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'blog', label: 'Blog' },
    { id: 'videos', label: 'Video nấu ăn' }
  ];

  const memberNavLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'planner', label: 'Thực đơn AI' },
    { id: 'vision', label: 'Quét tủ lạnh' },
    { id: 'blog', label: 'Blog' },
    { id: 'videos', label: 'Video nấu ăn' }
  ];

  const currentNavLinks = user ? memberNavLinks : guestNavLinks;

  const handleNavClick = (tab) => {
    if (setActiveTab) setActiveTab(tab);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      handleNavClick('home');
      setTimeout(() => {
        const el = document.getElementById('search-anchor');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="main-header">
      <div className="header-inner">
        {/* LOGO */}
        <div className="brand-logo" onClick={() => handleNavClick('home')}>
          <span className="brand-icon">🌱</span>
          <span className="brand-name">VeggieAI</span>
        </div>

        {/* NAVIGATION LINKS - CHỈ HIỂN THỊ CÁC MỤC GUEST ĐƯỢC PHÉP TRUY CẬP */}
        <nav className="header-nav">
          {currentNavLinks.map((link, idx) => (
            <button
              key={idx}
              className={`header-nav-item ${activeTab === link.id ? 'active' : ''}`}
              onClick={() => handleNavClick(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* SEARCH BAR */}
        <div className="header-search-box">
          <Search size={15} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm công thức, bài viết, video nấu chay..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          <span className="ctrl-k-badge">Enter</span>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="header-right-actions" style={{ position: 'relative' }}>
          {/* HỎI AI BUTTON */}
          <button 
            className="btn-hoi-ai" 
            onClick={() => handleNavClick('chatbot')}
            title="Trò chuyện với AI Dinh dưỡng"
          >
            <Sparkles size={16} className="sparkle-icon" />
            <span>Hỏi AI</span>
          </button>

          {!user ? (
            /* KHI CHƯA ĐĂNG NHẬP (GUEST): HIỂN THỊ ĐĂNG NHẬP & BẮT ĐẦU THỬ, LOẠI BỎ AVATAR TRÒN */
            <>
              <button 
                className="btn-header-login"
                onClick={() => handleNavClick('login')}
              >
                Đăng nhập
              </button>
              <button 
                className="btn-bat-dau-thu" 
                onClick={() => handleNavClick('register')}
                title="Bắt đầu thiết lập hồ sơ dinh dưỡng cá nhân"
              >
                Bắt đầu thử
              </button>
            </>
          ) : (
            /* KHI ĐÃ ĐĂNG NHẬP (USER/ADMIN): HIỂN THỊ AVATAR VÀ DROPDOWN QUẢN LÝ */
            <>
              <button 
                className="user-avatar-circle"
                onClick={() => setShowDropdown(!showDropdown)}
                title={`${user.name} (${user.role})`}
              >
                <User size={18} color="white" />
              </button>

              {showDropdown && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-info">
                    <strong>{user.name}</strong>
                    <span className="dropdown-user-role">{user.role}</span>
                    <small style={{ color: '#64748b' }}>{user.email}</small>
                  </div>

                  <div className="dropdown-divider"></div>

                  {user.role === 'Admin' && (
                    <button 
                      className="dropdown-item"
                      onClick={() => { handleNavClick('admin'); setShowDropdown(false); }}
                    >
                      <ShieldCheck size={16} /> Bảng điều khiển Admin
                    </button>
                  )}

                  <button 
                    className="dropdown-item dropdown-logout"
                    onClick={() => { logout(); setShowDropdown(false); handleNavClick('home'); }}
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
