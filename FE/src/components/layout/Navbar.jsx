import React from 'react';
import { Search, Sparkles, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'planner', label: 'Thực đơn AI' },
    { id: 'vision', label: 'Quét tủ lạnh' },
    { id: 'community', label: 'Video & Công thức' },
    { id: 'restaurants', label: 'Quán chay gần bạn' },
    { id: 'community', label: 'Cộng đồng' }
  ];

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
        <div className="header-right-actions">
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
            onClick={() => setActiveTab('planner')}
          >
            Bắt đầu thử
          </button>

          {/* USER AVATAR CIRCLE */}
          <button 
            className="user-avatar-circle"
            onClick={() => setActiveTab(activeTab === 'admin' ? 'home' : 'admin')}
            title="Chuyển đến Quản trị (Admin/Mod)"
          >
            <User size={18} color="white" />
          </button>
        </div>
      </div>
    </header>
  );
}
