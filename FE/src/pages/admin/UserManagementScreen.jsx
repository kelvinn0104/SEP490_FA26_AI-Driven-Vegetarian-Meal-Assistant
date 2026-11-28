import React, { useState, useEffect } from 'react';
import { usersApi, getRoleDisplayLabel } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/exportUtils';

export const UserManagementScreen = ({ mode = 'users' }) => {
  const { isSuperAdmin, hasPermission, currentUser } = useAuth();
  const isModManagement = mode === 'mods';
  const canWriteUsers = isSuperAdmin || hasPermission('usr_write');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState(isModManagement ? 'Mod' : 'all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedUser, setSelectedUser] = useState(null);
  const [userToLock, setUserToLock] = useState(null);
  const [lockReason, setLockReason] = useState('Vi phạm tiêu chuẩn cộng đồng VeggieAI');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDiet, setNewUserDiet] = useState('vegan');
  const [newUserRole, setNewUserRole] = useState(isModManagement ? 'Mod' : 'User');

  useEffect(() => {
    setRoleFilter(isModManagement ? 'Mod' : 'all');
    setNewUserRole(isModManagement ? 'Mod' : 'User');
  }, [isModManagement]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await usersApi.getUsers(isModManagement ? { role: 'Mod' } : {});
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isModManagement]);

  const filteredUsers = users.filter((u) => {
    if (isModManagement && u.role !== 'Mod') return false;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      String(u.id || '').toLowerCase().includes(q);
    const matchesDiet = dietFilter === 'all' || u.dietType === dietFilter;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesDiet && matchesRole && matchesStatus;
  });

  const handleToggleLock = async (user, reason = '') => {
    const isLocked = user.status === 'locked' || user.status === 'suspended';
    try {
      setError('');
      if (isLocked) {
        await usersApi.unlockUser(user.id);
      } else {
        await usersApi.lockUser(user.id, reason);
      }
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Không thể thay đổi trạng thái khóa tài khoản.');
    }
  };

  const handleRoleChange = async (user, nextRole) => {
    if (!isSuperAdmin || user.role === nextRole) return;
    if (!window.confirm(`Chuyển vai trò của ${user.email} sang "${nextRole}"?`)) return;
    try {
      setError('');
      await usersApi.updateUserRole(user.id, nextRole);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Không thể cập nhật vai trò tài khoản.');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!isSuperAdmin) return;
    if (!window.confirm(`Xóa vĩnh viễn tài khoản ${user.email}? Hành động này không thể hoàn tác.`)) return;
    try {
      setError('');
      await usersApi.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err.message || 'Không thể xóa tài khoản.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || newUserPassword.length < 6) {
      setError('Vui lòng nhập đầy đủ họ tên, email và mật khẩu tối thiểu 6 ký tự.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await usersApi.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        dietType: newUserDiet,
        role: isModManagement ? 'Mod' : newUserRole,
      });
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setIsAddUserOpen(false);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Không thể tạo tài khoản mới.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCount = filteredUsers.length;
  const activeCount = filteredUsers.filter((u) => u.status === 'active').length;
  const lockedCount = filteredUsers.filter((u) => u.status !== 'active').length;
  const veganCount = filteredUsers.filter((u) => u.dietType === 'vegan').length;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">
              {isModManagement ? 'badge' : 'group'}
            </span>
            <span>{isSuperAdmin ? 'Quản trị Tài khoản • SuperAdmin' : 'Tra cứu Người dùng • Mod'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
            {isModManagement ? 'Quản lý Điều phối viên (Mod)' : 'Quản lý Tài khoản Hệ thống'}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            {isModManagement
              ? 'Cấp tài khoản Mod mới, khóa phiên làm việc hoặc thu hồi quyền điều phối viên.'
              : isSuperAdmin
              ? 'Quản lý toàn bộ tài khoản User, Mod và SuperAdmin lưu trữ trên PostgreSQL.'
              : 'Xem và hỗ trợ tài khoản người dùng chuẩn (User) theo quyền được cấp.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              exportToCsv(
                isModManagement ? 'veggieai-mods' : 'veggieai-users',
                [
                  { key: 'id', label: 'Mã TK' },
                  { key: 'name', label: 'Họ tên' },
                  { key: 'email', label: 'Email' },
                  { key: 'role', label: 'Vai trò' },
                  { key: 'dietType', label: 'Chế độ ăn' },
                  { key: 'status', label: 'Trạng thái' },
                  { key: 'joinedDate', label: 'Ngày tham gia' },
                ],
                filteredUsers
              )
            }
            disabled={filteredUsers.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Xuất CSV</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold shadow-xs hover:bg-primary/90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>{isModManagement ? 'Thêm tài khoản Mod' : 'Thêm tài khoản'}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="underline cursor-pointer">
            Đóng
          </button>
        </div>
      )}

      {/* Real DB Metric Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Tổng hiển thị</span>
          <p className="text-xl font-bold text-on-surface font-mono mt-1">{totalCount}</p>
          <span className="text-[10px] text-on-surface-variant">Tài khoản từ PostgreSQL</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Đang hoạt động</span>
          <p className="text-xl font-bold text-primary font-mono mt-1">{activeCount}</p>
          <span className="text-[10px] text-on-surface-variant">Trạng thái active</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Đang bị khóa</span>
          <p className="text-xl font-bold text-error font-mono mt-1">{lockedCount}</p>
          <span className="text-[10px] text-on-surface-variant">Đã tạm ngưng truy cập</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Thuần chay (Vegan)</span>
          <p className="text-xl font-bold text-secondary font-mono mt-1">{veganCount}</p>
          <span className="text-[10px] text-on-surface-variant">Theo hồ sơ dinh dưỡng</span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo họ tên, email, mã tài khoản..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 cursor-pointer"
          >
            <option value="all">Mọi chế độ ăn</option>
            <option value="vegan">Thuần chay (Vegan)</option>
            <option value="ovo-lacto">Chay Trứng - Sữa</option>
            <option value="flexitarian">Bán phần</option>
          </select>

          {!isModManagement && isSuperAdmin && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 cursor-pointer"
            >
              <option value="all">Mọi vai trò</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Mod">Mod (Điều phối viên)</option>
              <option value="User">User (Người dùng)</option>
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 cursor-pointer"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Bị khóa</option>
          </select>
        </div>

        <span className="text-xs text-outline font-mono">
          Hiển thị <b>{filteredUsers.length}</b> tài khoản
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-surface-container-lowest p-5 shadow-xs border border-surface-container-high/40 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-outline">Đang tải danh sách tài khoản...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-outline">
            Không có tài khoản nào khớp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline text-xs uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3 rounded-l-lg">Tài khoản</th>
                  <th className="py-2.5 px-3">Vai trò</th>
                  <th className="py-2.5 px-3">Chế độ ăn</th>
                  <th className="py-2.5 px-3">Ngày tạo</th>
                  <th className="py-2.5 px-3">Món / Truy vấn AI</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {filteredUsers.map((user) => {
                  const isSelf =
                    currentUser?.email &&
                    user.email?.toLowerCase() === currentUser.email.toLowerCase();
                  const isTargetSuperAdmin = user.role === 'SuperAdmin';

                  return (
                    <tr key={user.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.avatar ||
                              `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
                                user.name || 'U'
                              )}`
                            }
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-surface-container-high"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-on-surface">
                              {user.name} {isSelf && <span className="text-primary">(Bạn)</span>}
                            </span>
                            <span className="text-[11px] text-outline font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {isSuperAdmin && !isSelf ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            className="h-8 px-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/60 text-xs font-bold text-on-surface cursor-pointer"
                          >
                            <option value="User">User</option>
                            <option value="Mod">Mod</option>
                            <option value="SuperAdmin">SuperAdmin</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                              user.role === 'SuperAdmin'
                                ? 'bg-error-container text-on-error-container'
                                : user.role === 'Mod'
                                ? 'bg-primary-container text-on-primary-container'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {user.role}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-xs font-semibold text-on-surface">
                        {user.dietType || 'vegan'}
                      </td>

                      <td className="py-3 px-3 text-xs text-on-surface-variant font-mono">
                        {user.joinedDate}
                      </td>

                      <td className="py-3 px-3 text-xs font-mono text-on-surface">
                        <span className="text-primary font-bold">{user.recipesCount || 0}</span> món /{' '}
                        <span className="text-tertiary font-bold">{user.aiQueriesCount || 0}</span> AI
                      </td>

                      <td className="py-3 px-3">
                        {user.status === 'active' ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold font-mono">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-bold font-mono">
                            Bị khóa
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 rounded-lg text-primary hover:bg-surface-container cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          {canWriteUsers && !isSelf && !isTargetSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                if (user.status === 'active') {
                                  setLockReason('Vi phạm tiêu chuẩn cộng đồng VeggieAI');
                                  setUserToLock(user);
                                } else {
                                  handleToggleLock(user);
                                }
                              }}
                              className={`p-1.5 rounded-lg cursor-pointer ${
                                user.status === 'active'
                                  ? 'text-error hover:bg-error-container/30'
                                  : 'text-secondary hover:bg-secondary-container/30'
                              }`}
                              title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {user.status === 'active' ? 'block' : 'lock_open'}
                              </span>
                            </button>
                          )}

                          {isSuperAdmin && !isSelf && !isTargetSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg text-error hover:bg-error-container/30 cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-surface-container-high/50 pb-4">
              <div>
                <h3 className="font-bold text-base text-on-surface">{selectedUser.name}</h3>
                <p className="text-xs text-outline font-mono">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/40">
              <div className="flex justify-between">
                <span className="text-outline">Mã định danh:</span>
                <span className="font-mono font-bold text-on-surface">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Vai trò:</span>
                <span className="font-bold text-primary">
                  {getRoleDisplayLabel(selectedUser.role)} ({selectedUser.role})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Chế độ dinh dưỡng:</span>
                <span className="font-semibold uppercase">{selectedUser.dietType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Dị ứng ghi nhận:</span>
                <span className="font-mono text-error">
                  {selectedUser.allergies?.length ? selectedUser.allergies.join(', ') : 'Không có'}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lock User Modal */}
      {userToLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4">
            <h3 className="text-lg font-bold text-error">Khóa tài khoản {userToLock.email}</h3>
            <p className="text-xs text-on-surface-variant">
              Tài khoản bị khóa sẽ không thể đăng nhập Web hoặc Mobile cho tới khi được mở khóa lại.
            </p>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Lý do khóa</label>
              <textarea
                rows={3}
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserToLock(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = userToLock;
                  setUserToLock(null);
                  await handleToggleLock(target, lockReason);
                }}
                className="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-bold cursor-pointer"
              >
                Xác nhận khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User / Mod Modal */}
      {isAddUserOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-3">
              <h3 className="font-bold text-base text-on-surface">
                {isModManagement ? 'Cấp tài khoản Điều phối viên (Mod)' : 'Tạo tài khoản mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Họ và tên</label>
                <input
                  required
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@veggie.vn"
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Mật khẩu khởi tạo (tối thiểu 6 ký tự)
                </label>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs"
                />
              </div>

              {!isModManagement && (
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Vai trò hệ thống</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs font-bold"
                  >
                    <option value="User">User (Người dùng ứng dụng)</option>
                    <option value="Mod">Mod (Điều phối viên vận hành)</option>
                    <option value="SuperAdmin">SuperAdmin (Quản trị hệ thống)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-on-surface mb-1">Chế độ ăn mặc định</label>
                <select
                  value={newUserDiet}
                  onChange={(e) => setNewUserDiet(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs"
                >
                  <option value="vegan">Thuần chay (Vegan)</option>
                  <option value="ovo-lacto">Chay Trứng - Sữa (Ovo-lacto)</option>
                  <option value="flexitarian">Bán phần (Flexitarian)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
