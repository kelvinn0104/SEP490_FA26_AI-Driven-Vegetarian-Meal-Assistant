import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Sparkles, User, ShieldCheck, ShieldAlert, LogOut, 
  Bell, ChevronDown, HeartPulse, Activity, FileText, Settings,
  CheckCheck, Clock, ExternalLink, Bookmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(3);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Đóng dropdown và notifications khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // DANH SÁCH THÔNG BÁO CHO AUTHORIZED USER
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Bài viết đã được duyệt ✅',
      desc: 'Bài viết "Top 5 Nguồn Protein Thuần Chay" của bạn đã được Moderator duyệt và xuất bản.',
      time: '15 phút trước',
      read: false,
      tab: 'blog'
    },
    {
      id: 2,
      title: 'Thực đơn tuần mới đã sẵn sàng 📅',
      desc: 'AI Meal Planner đã hoàn tất tạo thực đơn 7 ngày được cá nhân hóa theo chỉ số BMI của bạn.',
      time: '2 giờ trước',
      read: false,
      tab: 'planner'
    },
    {
      id: 3,
      title: 'Bình luận mới 💬',
      desc: 'Người dùng Bếp Chay Tuệ Tâm vừa để lại bình luận trên bài đăng chia sẻ của bạn.',
      time: '1 ngày trước',
      read: false,
      tab: 'blog'
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // PHÂN QUYỀN HEADER THEO BẢNG ĐỀ XUẤT ĐÃ THỐNG NHẤT:
  // - Guest: Trang chủ, Blog, Công thức & Video, Hỏi AI
  // - Authorized User: Trang chủ, Thực đơn tuần, Công thức & Video, Dashboard Dinh dưỡng, Hỏi AI, Quản lý bài đăng
  const guestNavLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'blog', label: 'Blog' },
    { id: 'videos', label: 'Công thức & Video' },
    { id: 'chatbot', label: 'Hỏi AI' }
  ];

  const authorizedUserNavLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'planner', label: 'Thực đơn tuần' },
    { id: 'videos', label: 'Công thức & Video' },
    { id: 'user-nutrition', label: 'Dashboard Dinh dưỡng' },
    { id: 'chatbot', label: 'Hỏi AI' },
    { id: 'user-posts', label: 'Quản lý bài đăng' }
  ];

  const currentNavLinks = (() => {
    if (!user) return guestNavLinks;
    if (user.role === 'Moderator') {
      return [
        { id: 'moderation', label: '🛡️ Mod Dashboard' },
        { id: 'home', label: 'Trang chủ' },
        { id: 'videos', label: 'Công thức & Video' },
        { id: 'chatbot', label: 'Hỏi AI' }
      ];
    }
    if (user.role === 'Admin') {
      return [
        { id: 'admin', label: '👑 Admin Dashboard' },
        { id: 'home', label: 'Trang chủ' },
        { id: 'planner', label: 'Thực đơn tuần' },
        { id: 'videos', label: 'Công thức & Video' },
        { id: 'chatbot', label: 'Hỏi AI' }
      ];
    }
    return authorizedUserNavLinks;
  })();

  const handleNavClick = (tab) => {
    if (setActiveTab) setActiveTab(tab);
    setShowDropdown(false);
    setShowNotifications(false);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      handleNavClick('home');
      setTimeout(() => {
        const el = document.getElementById('search-anchor') || document.getElementById('public-recipes-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="main-header">
      <div className="header-inner">
        {/* LOGO - Admin về Admin Dashboard, Mod về Mod Dashboard, User về Home */}
        <div 
          className="brand-logo" 
          onClick={() => handleNavClick(user?.role === 'Admin' ? 'admin' : user?.role === 'Moderator' ? 'moderation' : 'home')}
          style={{ cursor: 'pointer' }}
        >
          <span className="brand-icon">🌱</span>
          <span className="brand-name">VeggieAI</span>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="header-nav">
          {currentNavLinks.map((link, idx) => (
            <button
              key={idx}
              className={`header-nav-item ${
                activeTab === link.id ||
                (link.id === 'planner' && ['planner', 'create-plan', 'meal-history'].includes(activeTab)) ||
                (link.id === 'blog' && ['blog', 'create-post', 'article-detail'].includes(activeTab)) ||
                (link.id === 'videos' && ['videos', 'create-video', 'video-detail'].includes(activeTab)) ||
                (link.id === 'user-nutrition' && activeTab === 'user-nutrition') ||
                (link.id === 'chatbot' && activeTab === 'chatbot') ||
                (link.id === 'user-posts' && ['user-posts', 'create-post', 'create-video'].includes(activeTab))
                  ? 'active'
                  : ''
              }`}
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

        {/* RIGHT ACTIONS: HỎI AI | [🔔] | [AVATAR ▾] (HOẶC ĐĂNG NHẬP/BẮT ĐẦU THỬ CHO GUEST) */}
        <div className="header-right-actions" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
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
            /* KHI CHƯA ĐĂNG NHẬP (GUEST): HIỂN THỊ ĐĂNG NHẬP & BẮT ĐẦU THỬ */
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
            /* KHI ĐÃ ĐĂNG NHẬP (AUTHORIZED USER / ADMIN / MOD): HIỂN THỊ WIDGET THỂ TRẠNG, CHUÔNG THÔNG BÁO VÀ AVATAR ▾ */
            <>
              {/* WIDGET THỂ TRẠNG / STREAK (NHƯ MOCKUP) */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#334155'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ea580c' }}>
                  🔥 5 ngày
                </span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ color: '#047857' }}>
                  1,840 kcal
                </span>
              </div>

              {/* 1. ICON CHUÔNG THÔNG BÁO 🔔 */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="header-bell-btn"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowDropdown(false);
                  }}
                  title="Thông báo hệ thống"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: showNotifications ? '#ecfdf5' : '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    color: showNotifications ? '#059669' : '#475569',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        boxShadow: '0 0 0 2px #ffffff'
                      }}
                    />
                  )}
                </button>

                {/* NOTIFICATIONS DROPDOWN POPOVER */}
                {showNotifications && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: '330px',
                      background: '#ffffff',
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
                      border: '1px solid #e2e8f0',
                      zIndex: 1100,
                      overflow: 'hidden',
                      animation: 'fadeIn 0.2s ease'
                    }}
                  >
                    <div style={{
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#fafafa'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        <span>🔔 Thông báo</span>
                        {unreadCount > 0 && (
                          <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#059669', padding: '1px 7px', borderRadius: '10px', fontWeight: 700 }}>
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#059669',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          <CheckCheck size={14} /> Đã đọc
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            handleNavClick(item.tab);
                          }}
                          style={{
                            padding: '0.85rem 1rem',
                            borderBottom: '1px solid #f8fafc',
                            cursor: 'pointer',
                            background: item.read ? '#ffffff' : '#f0fdf4',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.background = item.read ? '#ffffff' : '#f0fdf4'}
                        >
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, marginBottom: '0.35rem' }}>
                            {item.desc}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> {item.time}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '0.65rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                      <span 
                        style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => handleNavClick('planner')}
                      >
                        Xem tất cả cập nhật thực đơn & bài viết →
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* NÚT LỐI TẮT BỘ SƯU TẬP CỦA TÔI (NHƯ ẢNH GIAO DIỆN) */}
              <button
                type="button"
                className="user-nav-action-btn"
                onClick={() => handleNavClick('user-collection')}
                title="Bộ sưu tập của tôi"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: activeTab === 'user-collection' ? '#ecfdf5' : '#f8fafc',
                  border: activeTab === 'user-collection' ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: activeTab === 'user-collection' ? '#047857' : '#475569',
                  transition: 'all 0.2s ease'
                }}
              >
                <Bookmark size={17} fill={activeTab === 'user-collection' ? '#047857' : 'none'} />
              </button>

              {/* 2. AVATAR + DROPDOWN [AVATAR ▾] (HIỂN THỊ TÊN VÀ CHAY TRƯỜNG, TUYỆT ĐỐI BỎ BADGE VIP) */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  className="user-avatar-pill-btn"
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    setShowNotifications(false);
                  }}
                  title={`${user.name || 'Minh Tuấn'} (${user.role || 'Thành viên'})`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '24px',
                    padding: '3px 10px 3px 6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.25 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                      {user.name || 'Minh Tuấn'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600 }}>
                      Chay trường
                    </span>
                  </div>

                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: user.role === 'Admin' ? '#dc2626' : user.role === 'Moderator' ? '#d97706' : '#059669',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.78rem'
                    }}
                  >
                    {user.role === 'Admin' ? 'AD' : user.role === 'Moderator' ? 'MD' : (user.name ? user.name.charAt(0).toUpperCase() : 'MT')}
                  </div>
                  <ChevronDown size={14} color="#64748b" />
                </button>

                {/* DROPDOWN MENU CHÍNH XÁC THEO ĐỀ XUẤT 5 MỤC CHO AUTHORIZED USER */}
                {showDropdown && (
                  <div className="user-dropdown-menu" style={{ width: '250px', right: 0, top: 'calc(100% + 8px)' }}>
                    {/* THÔNG TIN TÀI KHOẢN ĐƠN GIẢN, KHÔNG PHÂN TẦNG, KHÔNG BADGE VIP */}
                    <div className="dropdown-user-info" style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{user.name}</strong>
                      <span 
                        className="dropdown-user-role"
                        style={{
                          background: user.role === 'Admin' ? '#fee2e2' : user.role === 'Moderator' ? '#fef3c7' : '#ecfdf5',
                          color: user.role === 'Admin' ? '#b91c1c' : user.role === 'Moderator' ? '#b45309' : '#047857',
                          marginTop: '0.25rem',
                          display: 'inline-block'
                        }}
                      >
                        {user.role === 'Admin' ? 'Admin' : user.role === 'Moderator' ? 'Moderator' : 'Thành viên'}
                      </span>
                      <small style={{ color: '#64748b', display: 'block', marginTop: '0.2rem', fontSize: '0.78rem' }}>{user.email}</small>
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* MỤC 1: Hồ sơ sức khỏe của tôi (Trang hồ sơ: BMI, mục tiêu, dị ứng) */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavClick('user-profile')}
                    >
                      <HeartPulse size={16} color="#059669" /> Hồ sơ sức khỏe của tôi
                    </button>

                    {/* MỤC 2: Dashboard dinh dưỡng (Trang theo dõi xu hướng dinh dưỡng) */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavClick('user-nutrition')}
                    >
                      <Activity size={16} color="#2563eb" /> Dashboard dinh dưỡng
                    </button>

                    {/* MỤC 3: Bộ sưu tập của tôi (Kho lưu trữ món ăn, video & bài viết) */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavClick('user-collection')}
                    >
                      <Bookmark size={16} color="#047857" /> Bộ sưu tập của tôi
                    </button>

                    {/* MỤC 4: Bài viết/Video của tôi (Trang quản lý bài đăng cá nhân) */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavClick('user-posts')}
                    >
                      <FileText size={16} color="#d97706" /> Bài viết/Video của tôi
                    </button>

                    {/* MỤC 5: Cài đặt tài khoản (Đổi mật khẩu, thông tin cá nhân) */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavClick('user-settings')}
                    >
                      <Settings size={16} color="#64748b" /> Cài đặt tài khoản
                    </button>

                    {/* ĐỐI VỚI ADMIN / MOD: BỔ SUNG LỐI TẮT BẢNG ĐIỀU KHIỂN TƯƠNG ỨNG */}
                    {user.role === 'Admin' && (
                      <button 
                        className="dropdown-item"
                        onClick={() => handleNavClick('admin')}
                      >
                        <ShieldCheck size={16} color="#dc2626" /> Bảng điều khiển Admin
                      </button>
                    )}

                    {(user.role === 'Admin' || user.role === 'Moderator') && (
                      <button 
                        className="dropdown-item"
                        onClick={() => handleNavClick('moderation')}
                      >
                        <ShieldAlert size={16} color="#d97706" /> Bảng điều khiển Mod
                      </button>
                    )}

                    <div className="dropdown-divider"></div>

                    {/* MỤC 5: Đăng xuất */}
                    <button 
                      className="dropdown-item dropdown-logout"
                      onClick={() => { logout(); setShowDropdown(false); handleNavClick('home'); }}
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
