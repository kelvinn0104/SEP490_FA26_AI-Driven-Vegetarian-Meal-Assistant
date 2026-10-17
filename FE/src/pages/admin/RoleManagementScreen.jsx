import React, { useState, useEffect } from 'react';
import { rolesApi } from '../../api';

const ALL_PERMISSIONS = [
  { id: 'usr_read', label: 'Xem danh sách user', group: 'Người dùng' },
  { id: 'usr_write', label: 'Chỉnh sửa / Khóa', group: 'Người dùng' },
  { id: 'usr_role', label: 'Thay đổi quyền', group: 'Người dùng' },
  { id: 'nutri_read', label: 'Xem danh mục', group: 'Nguồn Dinh dưỡng' },
  { id: 'nutri_write', label: 'Thêm/Sửa danh mục', group: 'Nguồn Dinh dưỡng' },
  { id: 'content_approve', label: 'Duyệt bài / Công thức', group: 'Nội dung' },
  { id: 'content_delete', label: 'Gỡ bài vi phạm', group: 'Nội dung' },
  { id: 'sys_log', label: 'Xem Log hoạt động', group: 'Hệ thống' },
  { id: 'sys_ai', label: 'Cấu hình AI', group: 'Hệ thống' },
];

const INITIAL_ROLES = [
  {
    id: 'role-1',
    name: 'Super Admin',
    description: 'Quyền quản trị cao nhất, toàn quyền truy cập và thay đổi hệ thống.',
    userCount: 2,
    permissions: ALL_PERMISSIONS.map((p) => p.id),
    isSystem: true,
    theme: 'error',
    icon: 'admin_panel_settings',
  },
  {
    id: 'role-2',
    name: 'Chuyên gia Dinh dưỡng',
    description: 'Quản lý nguồn gốc thực phẩm và duyệt công thức theo tiêu chuẩn.',
    userCount: 5,
    permissions: ['usr_read', 'nutri_read', 'nutri_write', 'content_approve', 'content_delete'],
    isSystem: true,
    theme: 'primary',
    icon: 'local_hospital',
  },
  {
    id: 'role-3',
    name: 'Đại sứ / Creator',
    description: 'Tài khoản uy tín, đăng tải công thức được ưu tiên hiển thị.',
    userCount: 142,
    permissions: ['nutri_read'],
    isSystem: false,
    theme: 'secondary',
    icon: 'stars',
  },
  {
    id: 'role-4',
    name: 'Người dùng chuẩn',
    description: 'Xem công thức, sử dụng tính năng tra cứu AI và lưu bộ sưu tập.',
    userCount: 12580,
    permissions: [],
    isSystem: true,
    theme: 'surface',
    icon: 'person',
  },
];

export const RoleManagementScreen = () => {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [permissionsList, setPermissionsList] = useState(ALL_PERMISSIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPerms, setFormPerms] = useState(new Set());

  const fetchRolesData = async () => {
    try {
      setLoading(true);
      const [fetchedRoles, fetchedPerms] = await Promise.allSettled([
        rolesApi.getRoles(),
        rolesApi.getPermissions(),
      ]);

      if (fetchedRoles.status === 'fulfilled' && fetchedRoles.value.length > 0) {
        setRoles(fetchedRoles.value);
      }
      if (fetchedPerms.status === 'fulfilled' && fetchedPerms.value.length > 0) {
        setPermissionsList(fetchedPerms.value);
      }
    } catch (err) {
      console.warn('Failed to load roles from API, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  const handleOpenModal = (role) => {
    if (role) {
      setEditingRole(role);
      setFormName(role.name);
      setFormDesc(role.description);
      setFormPerms(new Set(role.permissions || []));
    } else {
      setEditingRole(null);
      setFormName('');
      setFormDesc('');
      setFormPerms(new Set());
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId) => {
    setFormPerms((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!formName.trim()) return;

    const permsArray = Array.from(formPerms);

    try {
      const saved = await rolesApi.saveRole(
        {
          name: formName,
          description: formDesc,
          permissions: permsArray,
        },
        editingRole ? editingRole.id : null
      );

      if (saved) {
        if (editingRole) {
          setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? saved : r)));
        } else {
          setRoles((prev) => [...prev, saved]);
        }
      } else {
        fetchRolesData();
      }
    } catch (err) {
      console.warn('API saveRole failed, saving locally:', err);
      if (editingRole) {
        setRoles(
          roles.map((r) =>
            r.id === editingRole.id
              ? {
                  ...r,
                  name: formName,
                  description: formDesc,
                  permissions: permsArray,
                }
              : r
          )
        );
      } else {
        const newRole = {
          id: `role-${Date.now()}`,
          name: formName,
          description: formDesc,
          userCount: 0,
          permissions: permsArray,
          isSystem: false,
          theme: 'tertiary',
          icon: 'verified_user',
        };
        setRoles([...roles, newRole]);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhóm quyền này?')) {
      setRoles(roles.filter((r) => r.id !== id));
    }
  };

  const groups = ['Người dùng', 'Nội dung', 'Nguồn Dinh dưỡng', 'Hệ thống'];

  const getThemeClasses = (theme) => {
    switch (theme) {
      case 'error':
        return 'bg-error-container text-on-error-container';
      case 'primary':
        return 'bg-primary-container text-on-primary-container';
      case 'secondary':
        return 'bg-secondary-container text-on-secondary-container';
      case 'tertiary':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'surface':
        return 'bg-surface-container-highest text-on-surface-variant';
      default:
        return 'bg-surface-container-highest text-on-surface-variant';
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-primary text-xs uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Identity & Access Management (IAM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Phân quyền Hệ thống
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Thiết lập nhóm quyền, cấu hình giới hạn truy cập và quản lý phân quyền.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-sm hover:shadow hover:bg-primary/90 transition-all w-full sm:w-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo nhóm quyền
        </button>
      </div>

      {/* Sleek List View */}
      <div className="flex flex-col gap-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex flex-col lg:flex-row lg:items-center justify-between p-5 rounded-[20px] bg-surface-container-lowest border border-surface-container-high hover:border-primary/40 hover:shadow-sm transition-all group"
          >
            {/* Left: Info */}
            <div className="flex items-start gap-4 flex-1">
              <div
                className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${getThemeClasses(
                  role.theme
                )}`}
              >
                <span className="material-symbols-outlined text-[24px]">{role.icon}</span>
              </div>
              <div className="flex flex-col gap-1 justify-center min-h-[48px]">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-on-surface">{role.name}</h3>
                  {role.isSystem && (
                    <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-sm text-on-surface-variant line-clamp-1">{role.description}</p>
              </div>
            </div>

            {/* Middle & Right Container */}
            <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto mt-4 lg:mt-0 lg:pl-8 gap-4 sm:gap-8">
              {/* Stats */}
              <div className="flex items-center gap-6 sm:gap-10 flex-1 lg:flex-initial justify-end">
                <div className="flex flex-col items-end lg:items-start gap-1">
                  <span className="text-[10px] text-outline font-bold uppercase tracking-wider">
                    Người dùng
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                    {role.userCount.toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col items-end lg:items-start gap-1 w-[90px] sm:w-[110px]">
                  <span className="text-[10px] text-outline font-bold uppercase tracking-wider">
                    Quyền hạn
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      verified_user
                    </span>
                    {role.permissions.length === ALL_PERMISSIONS.length
                      ? 'Toàn quyền'
                      : `${role.permissions.length} quyền`}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 lg:border-l lg:border-surface-container-high lg:pl-6 ml-2">
                <button
                  onClick={() => handleOpenModal(role)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                  title="Cấu hình quyền"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                {!role.isSystem ? (
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-error/70 hover:bg-error-container/50 hover:text-error transition-colors cursor-pointer"
                    title="Xóa nhóm quyền"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                ) : (
                  <div className="w-10 h-10 opacity-0 pointer-events-none"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-[700px] bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-lowest">
              <h2 className="text-xl font-bold text-on-surface">
                {editingRole ? 'Cấu hình quyền hệ thống' : 'Tạo nhóm quyền mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-1.5">
                      Tên nhóm quyền
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      disabled={editingRole?.isSystem}
                      placeholder="VD: Quản trị viên chi nhánh..."
                      className="w-full h-[46px] px-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-1.5">
                      Mô tả vai trò
                    </label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Mô tả quyền hạn và trách nhiệm..."
                      className="w-full min-h-[80px] p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                    />
                  </div>
                </div>

                <div className="h-px w-full bg-surface-container-high/50"></div>

                {/* Permissions Grid */}
                <div>
                  <h3 className="text-lg font-bold text-on-surface mb-4">Ma trận quyền hạn</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    {Array.from(new Set(permissionsList.map((p) => p.group || 'Chung'))).map((group) => (
                      <div key={group}>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          {group}
                        </h4>
                        <div className="space-y-2">
                          {permissionsList.filter((p) => (p.group || 'Chung') === group).map((perm) => {
                            const isChecked = formPerms.has(perm.id);
                            return (
                              <label
                                key={perm.id}
                                onClick={() => handleTogglePermission(perm.id)}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group/label"
                              >
                                <div
                                  className={`relative w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all ${
                                    isChecked
                                      ? 'bg-primary border-primary'
                                      : 'border-outline group-hover/label:border-primary/50'
                                  }`}
                                >
                                  {isChecked && (
                                    <span className="material-symbols-outlined text-[14px] text-on-primary font-bold">
                                      check
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`text-sm select-none transition-colors ${
                                    isChecked
                                      ? 'font-bold text-on-surface'
                                      : 'font-medium text-on-surface-variant'
                                  }`}
                                >
                                  {perm.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-surface-container-highest flex justify-end gap-3 bg-surface-container-lowest">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-sm font-bold shadow-sm hover:shadow hover:bg-primary/90 transition-all cursor-pointer"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
