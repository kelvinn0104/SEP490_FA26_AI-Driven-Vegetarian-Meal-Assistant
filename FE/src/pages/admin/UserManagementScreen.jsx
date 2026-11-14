import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usersApi } from '../../api';

export const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToLock, setUserToLock] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDiet, setNewUserDiet] = useState('vegan');
  const [newUserRole, setNewUserRole] = useState('Người dùng chuẩn');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const isAnyOpen = selectedUser || userToLock || isAddUserOpen;
    if (!isAnyOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedUser(null);
        setUserToLock(null);
        setIsAddUserOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedUser, userToLock, isAddUserOpen]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(u.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiet = dietFilter === 'all' || u.dietType === dietFilter;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesDiet && matchesRole;
  });

  const handleToggleLock = async (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const isCurrentlyLocked = targetUser.status === 'locked' || targetUser.status === 'suspended';

    try {
      if (isCurrentlyLocked) {
        await usersApi.unlockUser(userId);
      } else {
        await usersApi.lockUser(userId);
      }
    } catch (err) {
      console.warn('Lock/Unlock API call failed, updating local state:', err);
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = isCurrentlyLocked ? 'active' : 'suspended';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    try {
      const created = await usersApi.createUser({
        name: newUserName,
        email: newUserEmail,
        dietType: newUserDiet,
        role: newUserRole,
      });
      if (created) {
        setUsers((prev) => [created, ...prev]);
      } else {
        fetchUsers();
      }
    } catch (err) {
      console.warn('API error creating user, using fallback:', err);
      const newUser = {
        id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
        name: newUserName,
        email: newUserEmail,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        dietType: newUserDiet,
        role: newUserRole,
        joinedDate: 'Hôm nay',
        recipesCount: 0,
        aiQueriesCount: 0,
        status: 'active',
        allergies: ['Không'],
        bio: 'Người dùng mới đăng ký qua cổng VeggieAI Admin.',
      };
      setUsers([newUser, ...users]);
    }

    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Quản lý Người dùng VeggieAI
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Quản lý 28,450 tài khoản, phân loại chế độ ăn thực dưỡng và quyền truy cập VIP AI Chef
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Thêm tài khoản</span>
          </button>
        </div>
      </div>

      {/* Mini metric overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Thuần chay (Vegan)</span>
          <p className="text-xl font-bold text-primary font-mono mt-1">12,802</p>
          <span className="text-[10px] text-on-surface-variant">45.0% tổng tài khoản</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Chay Trứng - Sữa</span>
          <p className="text-xl font-bold text-secondary font-mono mt-1">9,104</p>
          <span className="text-[10px] text-on-surface-variant">32.0% tổng tài khoản</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Bán phần (Flexitarian)</span>
          <p className="text-xl font-bold text-tertiary font-mono mt-1">6,544</p>
          <span className="text-[10px] text-on-surface-variant">23.0% tổng tài khoản</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Thành viên VIP Chef</span>
          <p className="text-xl font-bold text-on-surface font-mono mt-1">1,240</p>
          <span className="text-[10px] text-primary font-semibold">Agent AI hỗ trợ 24/7</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, ID..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface placeholder:text-outline border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Diet filter */}
          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Mọi chế độ ăn</option>
            <option value="vegan">Thuần chay (Vegan)</option>
            <option value="ovo-lacto">Chay Trứng - Sữa</option>
            <option value="flexitarian">Bán phần</option>
          </select>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Mọi vai trò</option>
            <option value="Thành viên VIP AI Chef">Thành viên VIP AI Chef</option>
            <option value="Người tạo nội dung">Người tạo nội dung</option>
            <option value="Người dùng chuẩn">Người dùng chuẩn</option>
          </select>
        </div>

        <span className="text-xs text-outline font-mono">
          Hiển thị <b>{filteredUsers.length}</b> tài khoản
        </span>
      </div>

      {/* Users Data Table */}
      <div className="rounded-xl bg-surface-container-lowest p-5 shadow-xs border border-surface-container-high/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/60 text-outline text-xs uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 rounded-l-lg">Người dùng</th>
                <th className="py-2.5 px-3">Chế độ ăn</th>
                <th className="py-2.5 px-3">Vai trò</th>
                <th className="py-2.5 px-3">Ngày tham gia</th>
                <th className="py-2.5 px-3">Món / AI Prompt</th>
                <th className="py-2.5 px-3">Trạng thái</th>
                <th className="py-2.5 px-3 rounded-r-lg text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/30">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-surface-container-low/40 transition-colors"
                >
                  {/* User info */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-surface-container-high"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-on-surface">{user.name}</span>
                        <span className="text-[11px] text-outline font-mono">{user.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Diet type */}
                  <td className="py-3 px-3">
                    {user.dietType === 'vegan' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold">
                        Thuần chay
                      </span>
                    )}
                    {user.dietType === 'ovo-lacto' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-bold">
                        Trứng - Sữa
                      </span>
                    )}
                    {user.dietType === 'flexitarian' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold">
                        Bán phần
                      </span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="py-3 px-3">
                    <span className="text-xs font-semibold text-on-surface">
                      {user.role}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3 px-3 text-xs text-on-surface-variant font-mono">
                    {user.joinedDate}
                  </td>

                  {/* Activity Stats */}
                  <td className="py-3 px-3 text-xs font-mono text-on-surface">
                    <span className="text-primary font-bold">{user.recipesCount}</span> món /{' '}
                    <span className="text-tertiary font-bold">{user.aiQueriesCount}</span> AI
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold font-mono">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-bold font-mono">
                        Bị khóa
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (user.status === 'active') {
                            setUserToLock(user);
                          } else {
                            handleToggleLock(user.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          user.status === 'active'
                            ? 'text-error hover:bg-error-container/30'
                            : 'text-secondary hover:bg-secondary-container/30'
                        }`}
                        title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {user.status === 'active' ? 'block' : 'lock_open'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer Modal */}
      {selectedUser && createPortal(
        <div 
          onClick={() => setSelectedUser(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-start justify-between border-b border-surface-container-high/50 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <h3 className="font-bold text-base text-on-surface">{selectedUser.name}</h3>
                  <p className="text-xs text-outline font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/40 space-y-2">
                <div className="flex justify-between">
                  <span className="text-outline">Mã định danh:</span>
                  <span className="font-mono font-bold text-on-surface">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Vai trò hệ thống:</span>
                  <span className="font-semibold text-primary">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Chế độ dinh dưỡng:</span>
                  <span className="font-semibold text-on-surface uppercase">
                    {selectedUser.dietType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Dị ứng thực phẩm ghi chú:</span>
                  <span className="font-medium text-error font-mono">
                    {selectedUser.allergies?.join(', ') || 'Không ghi nhận'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-on-surface">Giới thiệu bản thân:</span>
                <p className="text-on-surface-variant mt-1 leading-relaxed bg-surface-container-low/40 p-3 rounded-lg">
                  {selectedUser.bio || 'Chưa cập nhật tiểu sử.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs hover:bg-surface-container cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lock User Modal */}
      {userToLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-[520px] bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="h-1.5 w-full bg-[#B3261E]"></div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 bg-[#FCE8E6] rounded-2xl flex items-center justify-center text-[#B3261E]">
                    <span className="material-symbols-outlined text-[32px]">warning</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[16px] text-[#B3261E]">block</span>
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-[22px] font-bold text-[#1C1B1F] leading-tight">Khóa tài khoản người dùng</h3>
                    <button
                      type="button"
                      onClick={() => setUserToLock(null)}
                      className="w-8 h-8 rounded-full bg-[#F0F4F8] flex items-center justify-center text-[#49454F] hover:bg-[#E2E8F0] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <p className="text-[14px] text-[#49454F] mt-2 leading-relaxed">
                    Bạn có chắc chắn muốn khóa tài khoản <span className="font-mono text-[#B3261E] font-bold bg-[#FCE8E6] px-1.5 py-0.5 rounded text-[13px]">{userToLock.email}</span>? Người dùng này sẽ ngay lập tức bị ngắt phiên đăng nhập và không thể truy cập hệ thống VeggieAI.
                  </p>
                </div>
              </div>

              <div className="bg-[#F8F9FE] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#79747E] tracking-wider uppercase">LÝ DO KHÓA TÀI KHOẢN</span>
                  <span className="text-[10px] font-bold text-[#B3261E] tracking-wider uppercase">BẤT BUỘC</span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[#EADDFF] cursor-pointer">
                    <input type="radio" name="reason" className="w-4 h-4 text-[#B3261E] focus:ring-1 focus:ring-[#B3261E]" defaultChecked />
                    <span className="text-[13px] font-medium text-[#1C1B1F]">Spam tin nhắn</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-transparent cursor-pointer">
                    <input type="radio" name="reason" className="w-4 h-4 text-[#79747E] focus:ring-1 focus:ring-[#B3261E]" />
                    <span className="text-[13px] font-medium text-[#49454F]">Vi phạm chuẩn</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-transparent cursor-pointer">
                    <input type="radio" name="reason" className="w-4 h-4 text-[#79747E] focus:ring-1 focus:ring-[#B3261E]" />
                    <span className="text-[13px] font-medium text-[#49454F]">Gian lận AI</span>
                  </label>
                </div>

                <textarea
                  className="w-full h-20 p-3 rounded-xl bg-white border-none text-[13px] text-[#49454F] resize-none focus:outline-none focus:ring-1 focus:ring-[#B3261E]"
                  defaultValue="Tự động phát hiện 18 bình luận bán hàng độc hại trong công thức VeggieAI #4891."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToLock(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#E8DEF8] text-[#1D192B] font-semibold text-[14px] hover:bg-[#EADDFF] transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleLock(userToLock.id);
                    setUserToLock(null);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B3261E] text-white font-semibold text-[14px] hover:bg-[#8C1D18] transition-colors shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_person</span>
                  Đồng ý khóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-3">
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  person_add
                </span>
                Thêm tài khoản người dùng
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container"
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
                  placeholder="Ví dụ: Hoàng Mai Chi"
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Địa chỉ Email</label>
                <input
                  required
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="chi.hoang@veggie.vn"
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Chế độ ăn mặc định</label>
                <select
                  value={newUserDiet}
                  onChange={(e) => setNewUserDiet(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="vegan">Thuần chay (Vegan)</option>
                  <option value="ovo-lacto">Chay Trứng - Sữa (Ovo-lacto)</option>
                  <option value="flexitarian">Bán phần (Flexitarian)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Vai trò phân cấp</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Người dùng chuẩn">Người dùng chuẩn</option>
                  <option value="Người tạo nội dung">Người tạo nội dung (Content Creator)</option>
                  <option value="Thành viên VIP AI Chef">Thành viên VIP AI Chef</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs hover:bg-surface-container cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container cursor-pointer"
              >
                Tạo tài khoản
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
