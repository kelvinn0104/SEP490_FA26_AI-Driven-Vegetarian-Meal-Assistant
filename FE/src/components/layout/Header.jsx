import React, { useState, useRef, useEffect } from 'react';

export const Header = ({
  currentScreen = 'dashboard',
  onOpenSearch,
  onOpenAgentModal,
  onOpenMobileSidebar,
  userRole = 'admin',
  currentUser = { name: 'Linh Nguyen', email: 'admin@veggie.vn' },
  onNavigate,
  onLogout,
  onToggleRole,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: 'Cần kiểm duyệt: 1 báo cáo vi phạm khẩn cấp',
      time: '12 phút trước',
      type: 'urgent',
    },
    {
      id: 2,
      title: 'Model VeggieAI Bot v3 hoàn tất phân tích vi chất USDA',
      time: '25 phút trước',
      type: 'ai',
    },
    {
      id: 3,
      title: 'Đầu bếp Chef Trần Vũ tải lên video công thức mới 4K',
      time: '1 giờ trước',
      type: 'video',
    },
  ];

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const screenNames = {
    dashboard: 'VeggieAI Core',
    'user-management': 'Quản lý Người dùng',
    'category-management': 'Quản lý Danh mục & Nguồn Dinh dưỡng',
    'content-moderation': 'Duyệt bài & Công thức Chay',
    'ai-model-monitoring': 'Giám sát Mô hình AI',
    'role-management': 'Phân quyền Hệ thống',
    'recipe-management': 'Quản lý Bài viết & Công thức',
  };

  return (
    <header className="fixed top-0 left-0 lg:left-[260px] right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/40 z-30 flex items-center justify-between px-space-md lg:px-space-lg transition-all">
      {/* Left: Mobile hamburger & Breadcrumb & Search */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
          aria-label="Mở menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-on-surface-variant text-xs md:text-sm">
          <span className="hover:text-on-surface cursor-pointer transition-colors font-medium">
            Quản trị
          </span>
          <span className="material-symbols-outlined text-[16px] text-outline">
            chevron_right
          </span>
          <span className="text-on-surface font-semibold truncate max-w-[140px] md:max-w-none">
            {screenNames[currentScreen] || 'Bảng điều khiển'}
          </span>
        </div>

        {/* Global Search Bar */}
        <div
          onClick={onOpenSearch}
          className="relative flex items-center cursor-pointer group"
        >
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] group-hover:text-primary transition-colors">
            search
          </span>
          <input
            readOnly
            className="w-44 sm:w-64 md:w-72 h-[38px] pl-9 pr-12 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-xs border border-surface-container-high/60 cursor-pointer"
            placeholder="Tìm kiếm công thức, món ăn, tag..."
            type="text"
          />
          <kbd className="hidden sm:inline-block absolute right-2 px-1.5 py-0.5 rounded bg-surface-container-high font-mono text-[10px] text-on-surface-variant font-semibold shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: AI agent pill, notifications, profile */}
      <div className="flex items-center gap-2 sm:gap-space-md">
        {/* Role Toggle Switcher */}
        {onToggleRole && (
          <button
            type="button"
            onClick={onToggleRole}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              userRole === 'mod'
                ? 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 ring-1 ring-secondary/30'
                : 'bg-primary-container text-on-primary-container hover:bg-primary-container/80 ring-1 ring-primary/30'
            }`}
            title="Nhấp để chuyển nhanh qua lại giữa quyền Super Admin và Chuyên gia duyệt bài (MOD)"
          >
            <span className="material-symbols-outlined text-[16px]">
              {userRole === 'mod' ? 'verified_user' : 'admin_panel_settings'}
            </span>
            <span>{userRole === 'mod' ? 'MOD: Chuyên gia' : 'SUPER ADMIN'}</span>
            <span className="text-[10px] opacity-75 underline ml-0.5">Đổi</span>
          </button>
        )}

        {/* Agent Status Pill */}
        <button
          type="button"
          onClick={onOpenAgentModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-semibold hover:opacity-90 transition-opacity shadow-2xs cursor-pointer"
          title="Nhấp để xem chi tiết AI Agent"
        >
          <span>Agent v3 Hoạt động</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setUnreadNotifications(0);
            }}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            type="button"
            aria-label="Thông báo"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface-container-lowest shadow-xl border border-surface-container-high z-50 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/40">
                <span className="font-bold text-sm text-on-surface">Thông báo hệ thống</span>
                <span className="font-mono text-xs text-primary font-semibold">VeggieAI Core</span>
              </div>
              <div className="flex flex-col divide-y divide-surface-container-high/30">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 flex flex-col gap-0.5 hover:bg-surface-container-low/40 p-2 rounded-lg transition-colors">
                    <span className="text-xs font-semibold text-on-surface">{n.title}</span>
                    <span className="text-[11px] text-outline font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="w-full text-center py-1.5 text-xs font-semibold text-primary hover:bg-surface-container rounded-lg"
              >
                Đóng thông báo
              </button>
            </div>
          )}
        </div>

        {/* Profile Pill & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1 py-1 rounded-xl hover:bg-surface-container/60 transition-colors cursor-pointer"
            type="button"
          >
            <img
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-primary/20"
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(currentUser.name)}`}
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-on-surface leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-outline leading-tight font-medium">
                {userRole === 'admin' ? 'Super Admin' : 'Chuyên gia Dinh dưỡng'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              expand_more
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container-lowest shadow-xl border border-surface-container-high z-50 p-2 flex flex-col gap-1">
              <div className="p-2 border-b border-surface-container-high/40">
                <p className="font-bold text-xs text-on-surface">{currentUser.name}</p>
                <p className="text-[11px] text-outline">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold">
                  {userRole === 'admin' ? 'Quyền Quản Trị Cao Cấp' : 'Chuyên gia Dinh dưỡng'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onNavigate) onNavigate('home');
                }}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[16px]">public</span>
                <span>Xem trang web người dùng</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  alert('Cài đặt tài khoản Super Admin đã sẵn sàng.');
                }}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
                <span>Cài đặt hệ thống</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  alert('Đã đồng bộ bảo mật 2 lớp qua Google Workspace.');
                }}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[16px]">security</span>
                <span>Khóa bảo mật AI</span>
              </button>
              <div className="border-t border-surface-container-high/40 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-2 text-xs font-medium text-error hover:bg-error-container/20 rounded-lg transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Đăng xuất phiên</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
