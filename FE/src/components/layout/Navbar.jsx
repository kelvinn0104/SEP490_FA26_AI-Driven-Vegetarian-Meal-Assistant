import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Sparkles, User, ShieldCheck, ShieldAlert, LogOut, 
  Bell, ChevronDown, HeartPulse, Activity, FileText, Settings,
  CheckCheck, Clock, ExternalLink, Bookmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import { notificationService } from '../../api';

export default function Navbar({ activeTab, setActiveTab, onNavigate }) {
  const { user, logout } = useAuth();
  const veggieCtx = useVeggieNutrition();
  const profile = veggieCtx?.profile;
  const metrics = veggieCtx?.metrics;
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

  // Đồng bộ thông báo từ Backend nếu đăng nhập
  // Bỏ qua với Admin/Moderator vì /api/notifications chưa được cấp quyền cho role này
  useEffect(() => {
    if (!user) return;
    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || role === 'moderator' || role === 'mod') return;

    notificationService.getUnreadCount()
      .then(cnt => {
        if (typeof cnt === 'number') setUnreadCount(cnt);
      })
      .catch(() => {});

    notificationService.getNotifications(false, 1, 10)
      .then(res => {
        const list = res?.items || (Array.isArray(res) ? res : null);
        if (list && list.length > 0) {
          const mapped = list.map(n => ({
            id: n.id,
            title: n.type === 'nutrition_alert' ? 'Cảnh báo dinh dưỡng 🥗' : n.type === 'profile_reminder' ? 'Nhắc nhở cập nhật hồ sơ ⚖️' : 'Thông báo VeggieAI',
            desc: n.content,
            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
            read: !!n.isRead,
            tab: n.type === 'nutrition_alert' ? 'planner' : 'home'
          }));
          setNotifications(mapped);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllAsRead();
    } catch {}
  };

  // PHÂN QUYỀN HEADER TINH GỌN (5 TABS CHÍNH):
  // - Guest & User: Trang chủ, Thực đơn tuần, Hỏi AI, Blog, Video nấu ăn
  // - Hồ sơ BMI & Quản lý bài đăng được tích hợp gọn gàng trong Dropdown Avatar của User
  const guestNavLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'planner', label: 'Thực đơn tuần' },
    { id: 'chatbot', label: 'Hỏi AI' },
    { id: 'blog', label: 'Blog' },
    { id: 'videos', label: 'Video nấu ăn' },
  ];

  const authorizedUserNavLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'planner', label: 'Thực đơn tuần' },
    { id: 'chatbot', label: 'Hỏi AI' },
    { id: 'blog', label: 'Blog' },
    { id: 'videos', label: 'Video nấu ăn' },
  ];

  const currentNavLinks = (() => {
    if (!user) return guestNavLinks;
    const role = String(user.role || '').toLowerCase();
    if (role === 'moderator' || role === 'mod') {
      return [
        { id: 'content-moderation', label: '🛡️ Kiểm duyệt Mod' },
        { id: 'home', label: 'Trang chủ' },
        { id: 'planner', label: 'Thực đơn tuần' },
        { id: 'chatbot', label: 'Hỏi AI' },
        { id: 'blog', label: 'Blog' },
        { id: 'videos', label: 'Video nấu ăn' },
      ];
    }
    if (role === 'admin') {
      return [
        { id: 'dashboard', label: '👑 Quản trị Admin' },
        { id: 'home', label: 'Trang chủ' },
        { id: 'planner', label: 'Thực đơn tuần' },
        { id: 'chatbot', label: 'Hỏi AI' },
        { id: 'blog', label: 'Blog' },
        { id: 'videos', label: 'Video nấu ăn' },
      ];
    }
    return authorizedUserNavLinks;
  })();

  const handleNavClick = (tab) => {
    if (setActiveTab) setActiveTab(tab);
    if (onNavigate) onNavigate(tab);
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
          onClick={() => {
            const r = String(user?.role || '').toLowerCase();
            handleNavClick(r === 'admin' ? 'dashboard' : (r === 'moderator' || r === 'mod') ? 'content-moderation' : 'home');
          }}
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

        {/* RIGHT ACTIONS: [GUEST: ĐĂNG NHẬP/ĐĂNG KÝ] | [USER: 🔔 + AVATAR ▾] */}
        <div className="header-right-actions" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                Đăng ký
              </button>
            </>
          ) : (
            /* KHI ĐÃ ĐĂNG NHẬP: TINH GỌN VỚI CHUÔNG THÔNG BÁO VÀ AVATAR PROFILE PILL */
            <>
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
                    width: '36px',
                    height: '36px',
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
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '3px',
                        right: '3px',
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

              {/* 2. AVATAR + DROPDOWN [AVATAR ▾] (TINH GỌN, SANG TRỌNG, 1 DÒNG DUY NHẤT) */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  className="user-avatar-pill-btn"
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    setShowNotifications(false);
                  }}
                  title={`${user.name || 'Thành viên'} (${user.role || 'Thành viên'})`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '24px',
                    padding: '3px 10px 3px 4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    flexShrink: 0
                  }}
                >
                  {/* AVATAR TRÒN GỌN GÀNG */}
                  <div 
                    style={{
                      width: '30px',
                      height: '30px',
                      minWidth: '30px',
                      minHeight: '30px',
                      flexShrink: 0,
                      borderRadius: '50%',
                      background: user.role === 'Admin' ? '#dc2626' : user.role === 'Moderator' ? '#d97706' : '#059669',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user.role === 'Admin' ? 'AD' : user.role === 'Moderator' ? 'MD' : (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                  </div>

                  {/* TÊN HIỂN THỊ 1 DÒNG DUY NHẤT GỌN GÀNG */}
                  <span style={{ 
                    fontSize: '0.84rem', 
                    fontWeight: 600, 
                    color: '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '110px'
                  }}>
                    {user.name || 'Thành viên'}
                  </span>

                  <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0, marginLeft: '1px' }} />
                </button>

                {/* DROPDOWN MENU CHUYÊN NGHIỆP */}
                {showDropdown && (
                  <div className="user-dropdown-menu" style={{ width: '270px', right: 0, top: 'calc(100% + 8px)' }}>
                    {/* THÔNG TIN TÀI KHOẢN & MINI BMI STATUS */}
                    <div className="dropdown-user-info" style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</strong>
                        <span 
                          className="dropdown-user-role"
                          style={{
                            background: user.role === 'Admin' ? '#fee2e2' : user.role === 'Moderator' ? '#fef3c7' : '#ecfdf5',
                            color: user.role === 'Admin' ? '#b91c1c' : user.role === 'Moderator' ? '#b45309' : '#047857',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            flexShrink: 0
                          }}
                        >
                          {user.role === 'Admin' ? 'Admin' : user.role === 'Moderator' ? 'Moderator' : (profile?.diet || 'Thành viên')}
                        </span>
                      </div>
                      <small style={{ color: '#64748b', display: 'block', marginTop: '0.15rem', fontSize: '0.78rem' }}>{user.email}</small>

                      {/* MINI BMI & CALO CARD TRONG DROPDOWN (GỌN GÀNG, KHÔNG LÀM RỐI NAV CHÍNH) */}
                      {metrics && metrics.bmi && metrics.bmi !== '--' && (
                        <div 
                          onClick={() => handleNavClick('user-profile')}
                          style={{
                            marginTop: '0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '10px',
                            padding: '6px 10px',
                            fontSize: '0.75rem',
                            color: '#15803d',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Bấm để xem chi tiết Hồ sơ thể trạng BMI"
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                            BMI: <strong>{metrics.bmi}</strong>
                          </span>
                          <span style={{ color: '#166534' }}>{metrics.tdee} kcal/ngày</span>
                        </div>
                      )}
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* MỤC 1: Hồ sơ sức khỏe của tôi (BMI, mục tiêu, dị ứng) */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavClick('user-profile')}
                    >
                      <HeartPulse size={16} color="#059669" /> Hồ sơ sức khỏe & BMI
                    </button>

                    {/* MỤC 2: Dashboard dinh dưỡng */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavClick('user-nutrition')}
                    >
                      <Activity size={16} color="#2563eb" /> Dashboard dinh dưỡng
                    </button>

                    {/* MỤC 3: Bộ sưu tập của tôi */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavClick('user-collection')}
                    >
                      <Bookmark size={16} color="#047857" /> Bộ sưu tập của tôi
                    </button>

                    {/* MỤC 4: Quản lý bài đăng của tôi */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavClick('user-posts')}
                    >
                      <FileText size={16} color="#d97706" /> Quản lý bài đăng của tôi
                    </button>

                    {/* MỤC 5: Cài đặt tài khoản */}
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavClick('user-settings')}
                    >
                      <Settings size={16} color="#64748b" /> Cài đặt tài khoản
                    </button>

                    {/* NÚT BẢNG ĐIỀU KHIỂN CHỈ DÀNH CHO ADMIN / MOD */}
                    {String(user.role || '').toLowerCase() === 'admin' && (
                      <button 
                        className="dropdown-item"
                        onClick={() => handleNavClick('dashboard')}
                      >
                        <ShieldCheck size={16} color="#dc2626" /> Bảng điều khiển Admin
                      </button>
                    )}

                    {(String(user.role || '').toLowerCase() === 'admin' || String(user.role || '').toLowerCase() === 'moderator' || String(user.role || '').toLowerCase() === 'mod') && (
                      <button 
                        className="dropdown-item"
                        onClick={() => handleNavClick('content-moderation')}
                      >
                        <ShieldAlert size={16} color="#d97706" /> Bảng điều khiển Mod
                      </button>
                    )}

                    <div className="dropdown-divider"></div>

                    {/* ĐĂNG XUẤT */}
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
