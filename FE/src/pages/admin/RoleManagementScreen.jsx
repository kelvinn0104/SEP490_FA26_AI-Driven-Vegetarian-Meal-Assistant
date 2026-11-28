import React, { useState, useEffect } from 'react';
import { rolesApi } from '../../api';

export const RoleManagementScreen = () => {
  const [roles, setRoles] = useState([]);
  const [permissionsList, setPermissionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPerms, setFormPerms] = useState(new Set());

  const fetchRolesData = async () => {
    try {
      setLoading(true);
      setError('');
      const [fetchedRoles, fetchedPerms] = await Promise.all([
        rolesApi.getRoles(),
        rolesApi.getPermissions(),
      ]);
      setRoles(Array.isArray(fetchedRoles) ? fetchedRoles : []);
      setPermissionsList(Array.isArray(fetchedPerms) ? fetchedPerms : []);
    } catch (err) {
      setError(err.message || 'Không thể tải cấu hình vai trò & phân quyền từ Backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  const handleOpenModal = (role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDesc(role.description || '');
    setFormPerms(new Set(role.permissions || []));
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId) => {
    if (!editingRole || editingRole.id === 'SuperAdmin' || editingRole.id === 'User') return;
    if (permId === 'usr_role' || permId === 'sys_log') return; // Mod cannot hold SuperAdmin-exclusive permissions
    setFormPerms((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!editingRole || !formName.trim()) return;
    try {
      setSaving(true);
      setError('');
      const saved = await rolesApi.saveRole(
        {
          name: formName.trim(),
          description: formDesc.trim(),
          permissions: Array.from(formPerms),
        },
        editingRole.id
      );
      if (saved) {
        setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? saved : r)));
      } else {
        await fetchRolesData();
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || 'Lưu phân quyền thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const getThemeClasses = (theme) => {
    switch (theme) {
      case 'error':
        return 'bg-error-container text-on-error-container';
      case 'primary':
        return 'bg-primary-container text-on-primary-container';
      default:
        return 'bg-surface-container-highest text-on-surface-variant';
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-primary text-xs uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Identity & Access Management (IAM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Quản lý Role & Ma trận Phân quyền
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Hệ thống chuẩn hóa 2 vai trò quản trị (<b>SuperAdmin</b>, <b>Mod</b>) và tài khoản ứng dụng (<b>User</b>).
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRolesData}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface cursor-pointer"
        >
          <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span>Đồng bộ từ DB</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-outline rounded-2xl bg-surface-container-lowest border border-surface-container-high/40">
          Đang tải ma trận phân quyền từ PostgreSQL...
        </div>
      ) : roles.length === 0 ? (
        <div className="py-16 text-center text-xs text-outline rounded-2xl bg-surface-container-lowest border border-surface-container-high/40">
          Chưa có vai trò nào được khởi tạo trong bảng Roles.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between p-5 rounded-[20px] bg-surface-container-lowest border border-surface-container-high hover:border-primary/40 transition-all"
            >
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${getThemeClasses(
                    role.theme
                  )}`}
                >
                  <span className="material-symbols-outlined text-[24px]">{role.icon || 'shield'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-on-surface">{role.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[11px] font-bold text-primary">
                      Mã DB: {role.id}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{role.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto mt-4 lg:mt-0 lg:pl-8 gap-6">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end lg:items-start gap-1">
                    <span className="text-[10px] text-outline font-bold uppercase tracking-wider">
                      Số tài khoản thực tế
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-on-surface font-mono">
                      <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                      {(role.userCount || 0).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <div className="flex flex-col items-end lg:items-start gap-1 min-w-[100px]">
                    <span className="text-[10px] text-outline font-bold uppercase tracking-wider">
                      Quyền cấp phép
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-on-surface">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        verified_user
                      </span>
                      {role.id === 'SuperAdmin'
                        ? 'Toàn quyền HT'
                        : `${(role.permissions || []).length} quyền`}
                    </div>
                  </div>
                </div>

                <div className="lg:border-l lg:border-surface-container-high lg:pl-5">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(role)}
                    className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-xs font-bold text-on-surface transition-colors cursor-pointer"
                  >
                    {role.id === 'Mod' ? 'Cấu hình quyền Mod' : 'Xem chi tiết'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-[680px] bg-surface-container-lowest rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-on-surface">
                  Cấu hình vai trò: {editingRole.id}
                </h2>
                <p className="text-xs text-outline">
                  Tên hiển thị có thể chỉnh sửa; mã vai trò trong Database ({editingRole.id}) được cố định để đồng bộ toàn hệ thống.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Tên hiển thị giao diện
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Mã lưu Database (Chuẩn hóa)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingRole.id}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container border border-surface-container-high/60 text-xs font-mono font-bold text-outline"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Mô tả vai trò</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-on-surface">Ma trận quyền chi tiết</h3>
                  {editingRole.id !== 'Mod' && (
                    <span className="text-[11px] text-outline font-medium">
                      {editingRole.id === 'SuperAdmin'
                        ? 'SuperAdmin mặc định giữ toàn bộ quyền hệ thống'
                        : 'Tài khoản User chuẩn không có quyền quản trị Web'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from(new Set(permissionsList.map((p) => p.group || 'Chung'))).map(
                    (group) => (
                      <div
                        key={group}
                        className="p-3.5 rounded-xl bg-surface-container-low/60 border border-surface-container-high/40"
                      >
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                          {group}
                        </h4>
                        <div className="space-y-2">
                          {permissionsList
                            .filter((p) => (p.group || 'Chung') === group)
                            .map((perm) => {
                              const isChecked = formPerms.has(perm.id);
                              const isLockedForMod =
                                editingRole.id !== 'Mod' ||
                                perm.id === 'usr_role' ||
                                perm.id === 'sys_log';
                              return (
                                <button
                                  key={perm.id}
                                  type="button"
                                  disabled={isLockedForMod}
                                  onClick={() => handleTogglePermission(perm.id)}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                                    isLockedForMod
                                      ? 'opacity-60 cursor-not-allowed'
                                      : 'hover:bg-surface-container cursor-pointer'
                                  }`}
                                >
                                  <span className="font-medium text-on-surface">{perm.label}</span>
                                  <span
                                    className={`w-5 h-5 rounded flex items-center justify-center border ${
                                      isChecked
                                        ? 'bg-primary border-primary text-on-primary'
                                        : 'border-outline'
                                    }`}
                                  >
                                    {isChecked && (
                                      <span className="material-symbols-outlined text-[14px]">
                                        check
                                      </span>
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-surface-container-high flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-xs font-bold text-on-surface cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Đang lưu...' : 'Lưu vào PostgreSQL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
