import React, { useState, useRef, useEffect } from 'react';
import { dashboardApi, getRoleDisplayLabel } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const Header = ({
  currentScreen = 'dashboard',
  onNavigate,
  onOpenSearch,
  onOpenAgentModal,
  onOpenMobileSidebar,
  onLogout,
}) => {
  const { currentUser, userRole, isSuperAdmin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

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

  const handleToggleNotifications = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      try {
        setLoadingNotifs(true);
        const data = await dashboardApi.getActivities();
        setActivities(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch {
        setActivities([]);
      } finally {
        setLoadingNotifs(false);
      }
    }
  };

  const screenNames = {
    dashboard: isSuperAdmin ? 'Tổng quan Hệ thống' : 'Tổng quan Vận hành',
    'user-management': 'Quản lý Tài khoản Người dùng',
    'mod-management': 'Quản lý Điều phối viên (Mod)',
    'role-management': 'Quản lý Role & Phân quyền',
    'system-settings': 'Cấu hình Hệ thống (System Settings)',
    'system-logs': 'Nhật ký Kiểm toán Hệ thống (System Logs)',
    'ai-model-monitoring': isSuperAdmin ? 'Giám sát Hệ thống AI' : 'Theo dõi Vận hành AI',
    'category-management': 'Danh mục & Nguồn Dinh dưỡng',
    'ingredient-management': 'Thư viện Nguyên liệu & Vi chất',
    'content-moderation': 'Kiểm duyệt Nội dung & Công thức',
    'recipe-management': 'Quản lý Công thức & Bài viết',
    'challenge-management': 'Thử thách Lối sống Thuần Chay',
    'product-scanner': 'Thẩm định Nhãn & Quét Thuần Chay',
    'feedback-management': 'Phản hồi & Báo cáo Vi phạm',
    'nutrition-analytics': 'Phân tích Dịch tễ & Dinh dưỡng',
    'broadcast-notification': 'Phát sóng Thông báo & Mẹo Dinh dưỡng',
    'reward-management': 'Kho Quà Đổi Thưởng Mầm Xanh',
  };

  const displayName = currentUser?.name || currentUser?.displayName || 'Tài khoản Quản trị';
  const displayEmail = currentUser?.email || '';
  const avatarSrc =
    currentUser?.avatar ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <header className="fixed top-0 left-0 lg:left-[260px] right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/40 z-30 flex items-center justify-between px-space-md lg:px-space-lg transition-all">
      {/* Left: Mobile hamburger & Breadcrumb & Search */}
      <div className="flex items-center gap-space-sm sm:gap-space-md min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
          aria-label="Mở menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-on-surface-variant text-xs md:text-sm min-w-0">
          <span
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="hover:text-on-surface cursor-pointer transition-colors font-medium shrink-0"
          >
            {isSuperAdmin ? 'Hệ thống' : 'Vận hành'}
          </span>
          <span className="material-symbols-outlined text-[16px] text-outline shrink-0">
            chevron_right
          </span>
          <span className="text-on-surface font-semibold truncate max-w-[160px] md:max-w-[280px]">
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
            className="w-40 sm:w-56 md:w-68 h-[38px] pl-9 pr-12 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-xs border border-surface-container-high/60 cursor-pointer"
            placeholder="Tìm kiếm nhanh..."
            type="text"
          />
          <kbd className="hidden sm:inline-block absolute right-2 px-1.5 py-0.5 rounded bg-surface-container-high font-mono text-[10px] text-on-surface-variant font-semibold shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Role badge (non-switching), AI status, notifications, profile */}
      <div className="flex items-center gap-2 sm:gap-space-md shrink-0">
        <span
          className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            isSuperAdmin
              ? 'bg-primary-container text-on-primary-container ring-1 ring-primary/25'
              : 'bg-secondary-container text-on-secondary-container ring-1 ring-secondary/25'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {isSuperAdmin ? 'admin_panel_settings' : 'verified_user'}
          </span>
          <span>{getRoleDisplayLabel(userRole)}</span>
        </span>

        <button
          type="button"
          onClick={onOpenAgentModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-semibold hover:opacity-90 transition-opacity shadow-2xs cursor-pointer"
          title="Kiểm tra trạng thái dịch vụ AI"
        >
          <span className="material-symbols-outlined text-[15px]">smart_toy</span>
          <span>AI Engine</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotifications}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            type="button"
            aria-label="Hoạt động gần đây"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface-container-lowest shadow-xl border border-surface-container-high z-50 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/40">
                <span className="font-bold text-sm text-on-surface">Hoạt động hệ thống mới nhất</span>
                <span className="font-mono text-[11px] text-primary font-semibold">Live DB</span>
              </div>
              {loadingNotifs ? (
                <div className="py-6 text-center text-xs text-outline">Đang tải hoạt động...</div>
              ) : activities.length === 0 ? (
                <div className="py-6 text-center text-xs text-outline">
                  Chưa có sự kiện mới trong hệ thống.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-surface-container-high/30 max-h-72 overflow-y-auto">
                  {activities.map((n) => (
                    <div
                      key={n.id}
                      className="py-2 flex flex-col gap-0.5 hover:bg-surface-container-low/40 p-2 rounded-lg transition-colors"
                    >
                      <span className="text-xs font-semibold text-on-surface">
                        {n.action} {n.target ? `• ${n.target}` : ''}
                      </span>
                      <span className="text-[11px] text-outline font-mono">
                        {n.user} • {n.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="w-full text-center py-1.5 text-xs font-semibold text-primary hover:bg-surface-container rounded-lg cursor-pointer"
              >
                Đóng
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
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-primary/20"
              src={avatarSrc}
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-on-surface leading-tight max-w-[130px] truncate">
                {displayName}
              </span>
              <span className="text-[11px] text-outline leading-tight font-medium">
                {getRoleDisplayLabel(userRole)}
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              expand_more
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-surface-container-lowest shadow-xl border border-surface-container-high z-50 p-2 flex flex-col gap-1">
              <div className="p-2.5 border-b border-surface-container-high/40">
                <p className="font-bold text-xs text-on-surface truncate">{displayName}</p>
                <p className="text-[11px] text-outline truncate">{displayEmail}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold">
                  Vai trò: {userRole}
                </span>
              </div>

              {isSuperAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onNavigate) onNavigate('system-settings');
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    <span>Cấu hình hệ thống</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onNavigate) onNavigate('system-logs');
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    <span>Nhật ký kiểm toán</span>
                  </button>
                </>
              )}

              <div className={isSuperAdmin ? 'border-t border-surface-container-high/40 pt-1' : ''}>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-2 text-xs font-medium text-error hover:bg-error-container/20 rounded-lg transition-colors text-left cursor-pointer"
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
