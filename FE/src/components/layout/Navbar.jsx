import React, { useState } from 'react';
import { Search, Sparkles, User, ShieldCheck, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, loginAsAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'planner', label: 'Thực đơn AI' },
    { id: 'vision', label: 'Quét tủ lạnh' },
    { id: 'community', label: 'Video & Công thức' },
    { id: 'restaurants', label: 'Quán chay gần bạn' },
    { id: 'community', label: 'Cộng đồng' }
  ];

  const handleAvatarClick = () => {
    if (!user) {
      // Khi chưa đăng nhập -> bấm vào Avatar sẽ dẫn ngay đến trang Đăng ký / Đăng nhập!
      setActiveTab('register');
    } else {
      setShowDropdown(!showDropdown);
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

        {/* NAVIGATION LINKS */}
        <nav className="header-nav">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              className={`header-nav-item ${activeTab === link.id ? 'active' : ''}`}
              onClick={() => {
                if (link.id === 'restaurants') {
                  setActiveTab('home');
                  setTimeout(() => {
                    const el = document.getElementById('restaurants-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  setActiveTab(link.id);
                }
              }}
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
            placeholder="Tìm kiếm món chay, hỏi AI..." 
          />
          <span className="ctrl-k-badge">Ctrl+K</span>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="header-right-actions" style={{ position: 'relative' }}>
          {/* HỎI AI BUTTON */}
          <button 
            className="btn-hoi-ai" 
            onClick={() => setActiveTab('chatbot')}
            title="Hỏi AI Dinh dưỡng"
          >
            <Sparkles size={16} className="sparkle-icon" />
            <span>Hỏi AI</span>
          </button>

          {/* BẮT ĐẦU THỬ BUTTON */}
          <button 
            className="btn-bat-dau-thu" 
            onClick={() => setActiveTab('register')}
          >
            Bắt đầu thử
          </button>

          {/* USER AVATAR CIRCLE */}
          <button 
            className="user-avatar-circle"
            onClick={handleAvatarClick}
            title={user ? `${user.name} (${user.role})` : "Đăng ký / Đăng nhập tài khoản"}
          >
            <User size={18} color="white" />
          </button>

          {/* AUTH DROPDOWN (Chỉ xuất hiện khi ĐÃ ĐĂNG NHẬP) */}
          {user && showDropdown && (
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
        </div>
      </div>
    </header>
  );
}
