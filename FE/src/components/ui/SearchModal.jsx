import React, { useState, useEffect } from 'react';
import { usersApi, categoriesApi, moderationApi } from '../../api';

export const SearchModal = ({ isOpen, onClose, onNavigate, userRole = 'admin' }) => {
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

  // Load real data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadRealData = async () => {
      try {
        const [usersRes, catsRes, modRes] = await Promise.allSettled([
          usersApi.getUsers(),
          categoriesApi.getCategories(),
          moderationApi.getPending(),
        ]);

        if (usersRes.status === 'fulfilled' && usersRes.value) {
          setUsers(usersRes.value);
        }
        if (catsRes.status === 'fulfilled' && catsRes.value) {
          setCategories(catsRes.value);
        }
        if (modRes.status === 'fulfilled' && modRes.value) {
          setModeration(modRes.value);
        }
      } catch (err) {
        console.error('Failed to load search data:', err);
      }
    };

    loadRealData();
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredUsers = q
    ? users.filter(
        (u) =>
          (u.name || u.displayName || '').toLowerCase().includes(q) ||
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
          (m.content || m.contentPreview || '').toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-surface-container-high/60 gap-3">
          <span className="material-symbols-outlined text-outline text-[22px]">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm danh mục, người dùng, bài chờ kiểm duyệt trong database..."
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

        {/* Quick Links / Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {!q && (
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">
                Điều hướng nhanh
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('dashboard');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    grid_view
                  </span>
                  <span className="text-xs font-semibold text-on-surface">Tổng quan hệ thống</span>
                </button>
                {userRole === 'mod' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('content-moderation');
                        onClose();
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-error text-[20px]">
                        verified_user
                      </span>
                      <span className="text-xs font-semibold text-on-surface">
                        Kiểm duyệt tồn đọng ({moderation.length})
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
                      <span className="material-symbols-outlined text-secondary text-[20px]">
                        category
                      </span>
                      <span className="text-xs font-semibold text-on-surface">
                        Danh mục dinh dưỡng ({categories.length})
                      </span>
                    </button>
                  </>
                )}

                {userRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('user-management');
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-container-low text-left transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-tertiary text-[20px]">
                      group
                    </span>
                    <span className="text-xs font-semibold text-on-surface">
                      Quản lý người dùng ({users.length})
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results: Categories (MOD only) */}
          {userRole === 'mod' && filteredCategories.length > 0 && (
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
                      {cat.recipeCount ?? cat.recipesCount ?? 0} món
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results: Users (Admin only) */}
          {userRole === 'admin' && filteredUsers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">
                Người dùng ({filteredUsers.length})
              </p>
              <div className="space-y-1">
                {filteredUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      onNavigate('user-management');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || user.displayName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-primary">
                          {(user.name || user.displayName || 'U')[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-on-surface">{user.name || user.displayName}</p>
                        <p className="text-[11px] text-outline">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container font-medium text-on-surface">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results: Moderation */}
          {filteredModeration.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">
                Mục kiểm duyệt ({filteredModeration.length})
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
                        <p className="text-[11px] text-outline line-clamp-1">{item.content || item.contentPreview}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold shrink-0">
                      Cần duyệt
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
