import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({
  currentScreen,
  onNavigate,
  pendingCount = 0,
  isOpenMobile = false,
  onCloseMobile,
  onOpenDocModal,
}) => {
  const { userRole, isSuperAdmin, hasPermission } = useAuth();

  const superAdminSystemItems = [
    { id: 'dashboard', label: 'Tổng quan hệ thống', icon: 'grid_view' },
    { id: 'user-management', label: 'Quản lý Tài khoản', icon: 'group' },
    { id: 'mod-management', label: 'Quản lý Mod', icon: 'badge' },
    { id: 'role-management', label: 'Quản lý Role / Quyền', icon: 'admin_panel_settings' },
    { id: 'system-settings', label: 'System Settings', icon: 'tune' },
    { id: 'system-logs', label: 'System Logs', icon: 'receipt_long' },
    { id: 'ai-model-monitoring', label: 'Giám sát AI', icon: 'neurology' },
  ];

  const operationalItems = [
    { id: 'category-management', label: 'Nguồn Dinh dưỡng', icon: 'category' },
    { id: 'ingredient-management', label: 'Thư viện Vi chất & Đạm', icon: 'science' },
    { id: 'recipe-management', label: 'Quản lý Công thức', icon: 'menu_book' },
    {
      id: 'content-moderation',
      label: 'Duyệt bài & Công thức',
      icon: 'fact_check',
      badge: pendingCount,
    },
    { id: 'feedback-management', label: 'Phản hồi & Báo cáo', icon: 'rate_review' },
    { id: 'nutrition-analytics', label: 'Phân tích Dịch tễ & Macro', icon: 'insights' },
    { id: 'challenge-management', label: 'Thử thách Lối sống Chay', icon: 'military_tech' },
    { id: 'product-scanner', label: 'Thẩm định Nhãn & Quét Chay', icon: 'document_scanner' },
    { id: 'broadcast-notification', label: 'Thông báo & Mẹo Dinh dưỡng', icon: 'campaign' },
    { id: 'reward-management', label: 'Đổi Thưởng Mầm Xanh', icon: 'redeem' },
  ];

  const modPrimaryItems = [
    { id: 'dashboard', label: 'Tổng quan vận hành', icon: 'grid_view' },
    ...(hasPermission('usr_read')
      ? [{ id: 'user-management', label: 'Quản lý Tài khoản', icon: 'group' }]
      : []),
    { id: 'ai-model-monitoring', label: 'Theo dõi vận hành AI', icon: 'neurology' },
  ];

  const sections = isSuperAdmin
    ? [
        { title: 'Quản trị Hệ thống', items: superAdminSystemItems },
        { title: 'Giám sát Vận hành (Chỉ xem)', items: operationalItems, readOnlyBadge: true },
      ]
    : [
        { title: 'Điều hành chung', items: modPrimaryItems },
        { title: 'Nghiệp vụ Nội dung & Dữ liệu', items: operationalItems },
      ];

  const handleItemClick = (screen) => {
    onNavigate(screen);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none transition-transform duration-300 ease-in-out border-r border-surface-container-high/40 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-space-md flex items-center justify-between border-b border-surface-container-low shrink-0">
          <div
            className="flex items-center gap-space-sm cursor-pointer"
            onClick={() => handleItemClick('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">eco</span>
            </div>
            <span className="font-bold text-lg text-on-surface tracking-tight">VeggieAI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px] font-bold">
              {isSuperAdmin ? 'ADMIN' : 'MOD'}
            </span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-space-sm py-space-sm space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2.5 py-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  {section.title}
                </span>
                {section.readOnlyBadge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-container text-outline font-mono font-bold">
                    READ
                  </span>
                )}
              </div>
              <nav className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      className={`flex items-center justify-between px-space-sm py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 text-left cursor-pointer ${
                        isActive
                          ? 'bg-primary-container text-on-primary-container shadow-xs font-bold'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-[19px] shrink-0">
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-[11px] font-bold shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Role & Help Footer */}
        <div className="p-space-sm flex flex-col gap-2 border-t border-surface-container-low shrink-0">
          <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-primary text-[18px]">
                {isSuperAdmin ? 'shield_person' : 'verified_user'}
              </span>
              <div className="truncate">
                <p className="font-bold text-on-surface leading-tight">
                  {userRole === 'SuperAdmin' ? 'SuperAdmin' : 'Mod Vận hành'}
                </p>
                <p className="text-[10px] text-outline truncate">
                  {isSuperAdmin ? 'Quản trị hệ thống & Giám sát' : 'Quản lý nội dung & dữ liệu'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenDocModal}
            className="flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg text-on-surface-variant text-xs font-medium hover:bg-surface-container hover:text-on-surface transition-colors text-left cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
            <span>Tài liệu API & Kiến trúc</span>
          </button>
        </div>
      </aside>
    </>
  );
};
