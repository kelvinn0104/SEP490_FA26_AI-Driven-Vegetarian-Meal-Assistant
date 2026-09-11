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
    { id: 'community', label: 'Video & Công thức (WF06)' }
  ];

  const memberNavLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'planner', label: 'Thực đơn AI' },
    { id: 'vision', label: 'Quét tủ lạnh' },
    { id: 'community', label: 'Video & Công thức' }
  ];

  const currentNavLinks = user ? memberNavLinks : guestNavLinks;

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setActiveTab('home');
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
        <div className="brand-logo" onClick={() => setActiveTab('home')}>
          <span className="brand-icon">🌱</span>
          <span className="brand-name">VeggieAI</span>
        </div>

        {/* NAVIGATION LINKS - CHỈ HIỂN THỊ CÁC MỤC GUEST ĐƯỢC PHÉP TRUY CẬP */}
        <nav className="header-nav">
          {currentNavLinks.map((link, idx) => (
            <button
              key={idx}
              className={`header-nav-item ${activeTab === link.id ? 'active' : ''}`}
              onClick={() => setActiveTab(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* SEARCH BAR (WF06: Tìm kiếm blog, video, công thức công khai) */}
        <div className="header-search-box">
          <Search size={15} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm công thức, blog, video (WF06)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          <span className="ctrl-k-badge">Enter</span>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="header-right-actions" style={{ position: 'relative' }}>
          {/* HỎI AI BUTTON (WF05: Hỏi đáp AI Nutrition Chatbot) */}
          <button 
            className="btn-hoi-ai" 
            onClick={() => setActiveTab('chatbot')}
            title="Hỏi AI Dinh dưỡng (Giới hạn 3 câu hỏi đối với Guest)"
          >
            <Sparkles size={16} className="sparkle-icon" />
            <span>Hỏi AI</span>
          </button>

          {!user ? (
            /* KHI CHƯA ĐĂNG NHẬP (GUEST): HIỂN THỊ ĐĂNG NHẬP & BẮT ĐẦU THỬ (WF01), LOẠI BỎ AVATAR TRÒN */
            <>
              <button 
                className="btn-header-login"
                onClick={() => setActiveTab('register')}
              >
                Đăng nhập
              </button>
              <button 
                className="btn-bat-dau-thu" 
                onClick={() => setActiveTab('register')}
                title="Bắt đầu quy trình đăng ký / thiết lập hồ sơ dinh dưỡng (WF01)"
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
                      onClick={() => { setActiveTab('admin'); setShowDropdown(false); }}
                    >
                      <ShieldCheck size={16} /> Bảng điều khiển Admin
                    </button>
                  )}

                  <button 
                    className="dropdown-item dropdown-logout"
                    onClick={() => { logout(); setShowDropdown(false); setActiveTab('home'); }}
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
