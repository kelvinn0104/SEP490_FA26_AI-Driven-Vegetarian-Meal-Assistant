import React from 'react';
import { Search, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  const navLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'planner', label: 'Thực đơn AI' },
    { id: 'vision', label: 'Quét nguyên liệu' },
    { id: 'community', label: 'Video & Tóm tắt' },
    { id: 'chatbot', label: 'Dinh dưỡng AI' },
    { id: 'community', label: 'Cộng đồng' },
    { id: 'admin', label: 'Admin' },
    { id: 'moderation', label: 'Mod Duyệt bài' }
  ];

  return (
    <header className="top-navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <div className="navbar-logo" onClick={() => setActiveTab('home')}>
          <span className="logo-icon">🌱</span>
          <span className="logo-text">Veggie<span className="logo-highlight">AI</span></span>
        </div>

        {/* NAV LINKS */}
        <nav className="navbar-links">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              className={`nav-link-btn ${activeTab === link.id ? 'active' : ''}`}
              onClick={() => setActiveTab(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* SEARCH BAR */}
        <div className="navbar-search">
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Tìm kiếm món ăn, bài viết, nhà hàng..." />
          <span className="search-shortcut">Ctrl K</span>
        </div>

        {/* USER PROFILE & CTA */}
        <div className="navbar-actions">
          <div className="user-profile-badge">
            <User size={16} />
            <span>{user?.name || 'Phan Văn A'}</span>
          </div>

          <button className="btn-cta-green" onClick={() => setActiveTab('planner')}>
            Bắt đầu ngay ➜
          </button>
        </div>
      </div>
    </header>
  );
}
