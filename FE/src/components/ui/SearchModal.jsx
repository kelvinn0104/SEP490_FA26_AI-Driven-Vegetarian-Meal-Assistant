import React, { useState, useEffect } from 'react';
import { usersApi, categoriesApi, moderationApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const SearchModal = ({ isOpen, onClose, onNavigate }) => {
  const { isSuperAdmin, hasPermission } = useAuth();
  const canReadUsers = isSuperAdmin || hasPermission('usr_read');

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [moderation, setModeration] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const loadRealData = async () => {
      const [usersRes, catsRes, modRes] = await Promise.allSettled([
        canReadUsers ? usersApi.getUsers() : Promise.resolve([]),
        categoriesApi.getCategories(),
        moderationApi.getPending(),
      ]);

      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        setUsers(usersRes.value);
      }
      if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value)) {
        setCategories(catsRes.value);
      }
      if (modRes.status === 'fulfilled' && Array.isArray(modRes.value)) {
        setModeration(modRes.value);
      }
    };

    loadRealData();
  }, [isOpen, canReadUsers]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredUsers = q
    ? users.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q)
      )
    : [];

  const filteredCategories = q
    ? categories.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
      )
    : [];

  const filteredModeration = q
    ? moderation.filter(
        (m) =>
          (m.title || '').toLowerCase().includes(q) ||
          (m.content || '').toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3.5 border-b border-surface-container-high/60 gap-3">
          <span className="material-symbols-outlined text-outline text-[22px]">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm danh mục, tài khoản, bài chờ kiểm duyệt..."
            className="w-full bg-transparent text-sm sm:text-base text-on-surface placeholder:text-outline focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container text-xs font-mono cursor-pointer"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!q && (
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">
                Điều hướng nhanh
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('dashboard');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">grid_view</span>
                  <span className="text-xs font-semibold text-on-surface">Bảng điều khiển tổng quan</span>
                </button>

                {isSuperAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('mod-management');
                        onClose();
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                      <span className="text-xs font-semibold text-on-surface">Quản lý Điều phối viên (Mod)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('system-settings');
                        onClose();
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
                      <span className="text-xs font-semibold text-on-surface">System Settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('system-logs');
                        onClose();
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-tertiary text-[20px]">receipt_long</span>
                      <span className="text-xs font-semibold text-on-surface">System Audit Logs</span>
                    </button>
                  </>
                )}

                {canReadUsers && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('user-management');
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-tertiary text-[20px]">group</span>
                    <span className="text-xs font-semibold text-on-surface">
                      Quản lý tài khoản ({users.length})
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('content-moderation');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-error text-[20px]">fact_check</span>
                  <span className="text-xs font-semibold text-on-surface">
                    Kiểm duyệt nội dung ({moderation.length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('category-management');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">category</span>
                  <span className="text-xs font-semibold text-on-surface">
                    Danh mục dinh dưỡng ({categories.length})
                  </span>
                </button>
              </div>
            </div>
          )}

          {filteredCategories.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">
                Danh mục món chay ({filteredCategories.length})
              </p>
              <div className="space-y-1">
                {filteredCategories.slice(0, 5).map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      onNavigate('category-management');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        {cat.icon || 'restaurant'}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{cat.name}</p>
                        <p className="text-[11px] text-outline line-clamp-1">{cat.description}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-primary font-medium shrink-0">
                      {cat.recipeCount ?? 0} món
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canReadUsers && filteredUsers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">
                Tài khoản ({filteredUsers.length})
              </p>
              <div className="space-y-1">
                {filteredUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      onNavigate(user.role === 'Mod' && isSuperAdmin ? 'mod-management' : 'user-management');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-primary">
                        {(user.name || 'U')[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{user.name}</p>
                        <p className="text-[11px] text-outline">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container font-mono font-bold text-on-surface">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredModeration.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">
                Mục chờ kiểm duyệt ({filteredModeration.length})
              </p>
              <div className="space-y-1">
                {filteredModeration.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onNavigate('content-moderation');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-error text-[18px]">
                        pending_actions
                      </span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{item.title}</p>
                        <p className="text-[11px] text-outline line-clamp-1">{item.content}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold shrink-0">
                      Chờ duyệt
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {q &&
            filteredUsers.length === 0 &&
            filteredCategories.length === 0 &&
            filteredModeration.length === 0 && (
              <div className="py-8 text-center text-outline text-xs">
                Không tìm thấy kết quả phù hợp cho &quot;{query}&quot;
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
