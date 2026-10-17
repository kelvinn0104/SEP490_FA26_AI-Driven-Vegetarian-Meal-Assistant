import React from 'react';

export const Sidebar = ({
  currentScreen,
  onNavigate,
  pendingCount = 0,
  isOpenMobile = false,
  onCloseMobile,
  onOpenDocModal,
  userRole = 'admin',
  onToggleRole,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: 'grid_view',
    },
    {
      id: 'user-management',
      label: 'Quản lý Người dùng',
      icon: 'group',
      adminOnly: true,
    },
    {
      id: 'category-management',
      label: 'Nguồn Dinh dưỡng',
      icon: 'category',
      modOnly: true,
    },
    {
      id: 'content-moderation',
      label: 'Duyệt bài & Công thức',
      icon: 'local_hospital',
      badge: pendingCount,
      modOnly: true,
    },
    {
      id: 'recipe-management',
      label: 'Quản lý Bài viết',
      icon: 'menu_book',
      modOnly: true,
    },
    {
      id: 'ai-model-monitoring',
      label: 'Log Hệ thống',
      icon: 'neurology',
      statusPill: 'Healthy',
      adminOnly: true,
    },
    {
      id: 'role-management',
      label: 'Phân quyền Hệ thống',
      icon: 'admin_panel_settings',
      adminOnly: true,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (userRole === 'admin' && item.modOnly) return false;
    if (userRole === 'mod' && item.adminOnly) return false;
    return true;
  });

  const handleItemClick = (screen) => {
    onNavigate(screen);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
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
        <div className="flex flex-col">
          {/* Brand header */}
          <div className="h-16 px-space-md flex items-center justify-between border-b border-surface-container-low">
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
              <span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-mono text-xs font-semibold tracking-wide">
                v2.4 Prod
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded-md text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 px-space-sm mt-space-sm">
            {filteredNavItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center justify-between px-space-sm py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container shadow-sm font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[20px] shrink-0">
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-xs font-bold shrink-0">
                      {item.badge}
                    </span>
                  )}

                  {item.statusPill && (
                    <span className="flex items-center gap-1 text-secondary font-mono text-xs font-semibold shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      {item.statusPill}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom system status & links */}
        <div className="p-space-sm flex flex-col gap-space-sm border-t border-surface-container-low">
          <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between text-on-surface-variant text-xs">
              <span className="font-medium">Máy chủ AI & Bộ nhớ</span>
              <span className="font-mono text-on-surface font-semibold">68%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: '68%' }}
              ></div>
            </div>
            <div className="flex items-center justify-between pt-space-2xs font-mono text-xs text-on-surface-variant">
              <span>340GB / 500GB</span>
              <span className="text-primary font-medium">Cụm HCM-01</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              className="flex items-center justify-between w-full px-space-sm py-1.5 rounded-lg text-on-surface-variant text-xs font-medium hover:bg-surface-container hover:text-on-surface transition-colors"
              type="button"
              onClick={() => alert('Môi trường: Sản xuất (Production cluster VN-SOUTH-01) hoạt động ổn định.')}
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">dns</span>
                <span>Môi trường:</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono text-xs font-bold">
                PROD
              </span>
            </button>

            <button
              onClick={onOpenDocModal}
              className="flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg text-on-surface-variant text-xs font-medium hover:bg-surface-container hover:text-on-surface transition-colors text-left"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
              <span>Hỗ trợ & Tài liệu Dev</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
