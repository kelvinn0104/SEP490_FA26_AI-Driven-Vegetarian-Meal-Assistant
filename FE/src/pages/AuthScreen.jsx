import React, { useState } from 'react';
import { authApi, normalizeRole } from '../api';

export const AuthScreen = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields (Invite-protected on Backend)
  const [name, setName] = useState('');
  const [role, setRole] = useState('Mod');
  const [inviteCode, setInviteCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email.trim() || !password) {
        setError('Vui lòng nhập đầy đủ email và mật khẩu.');
        return;
      }
    } else {
      if (!name.trim() || !email.trim() || !password || !inviteCode.trim()) {
        setError('Vui lòng điền đầy đủ họ tên, email, mật khẩu và mã mời xác thực.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const data = isLogin
        ? await authApi.login(email.trim(), password, true)
        : await authApi.register({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            inviteCode: inviteCode.trim(),
          });

      const user = data?.user;
      const normalized = normalizeRole(user?.role);
      if (normalized !== 'SuperAdmin' && normalized !== 'Mod') {
        setError('Chỉ tài khoản SuperAdmin và Mod mới được phép truy cập Cổng Quản trị.');
        return;
      }

      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Xác thực không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-surface-container-lowest antialiased">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-black/35 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop"
          alt="Healthy vegan bowl"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 flex flex-col justify-between h-full p-12 lg:p-16 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg">
              <span className="material-symbols-outlined text-[24px]">eco</span>
            </div>
            <span className="font-bold text-2xl tracking-tight">VeggieAI Management</span>
          </div>

          <div className="max-w-xl">
            <span className="inline-block px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-6 border border-white/30 uppercase tracking-widest">
              Cổng Quản Trị & Vận Hành
            </span>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6 drop-shadow-lg">
              Nền tảng Quản trị Thực dưỡng Thuần Chay
            </h1>
            <p className="text-base xl:text-lg text-white/90 font-medium leading-relaxed drop-shadow-md">
              Phân tách rõ ràng giữa <b>SuperAdmin</b> (quản trị hệ thống, tài khoản, phân quyền, cấu hình) và <b>Mod</b> (vận hành nội dung, vi chất, kiểm duyệt và dữ liệu dinh dưỡng).
            </p>
          </div>
        </div>
      </div>

      {/* Right Auth Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 xl:p-16 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">eco</span>
            </div>
            <span className="font-bold text-lg text-on-surface tracking-tight">VeggieAI</span>
          </div>

          <div className="mb-7">
            <span className="inline-block px-2.5 py-1 rounded-md bg-primary-container text-on-primary-container text-[11px] font-bold uppercase tracking-wider mb-2">
              Web Admin Portal • Nội bộ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              {isLogin ? 'Đăng nhập Cổng Quản trị' : 'Kích hoạt tài khoản quản trị'}
            </h2>
            <p className="text-sm text-on-surface-variant mt-2 font-medium">
              {isLogin
                ? 'Cổng Web này dành riêng cho SuperAdmin và Mod. Tài khoản hội viên (User) sử dụng trên Ứng dụng VeggieAI dành cho người dùng.'
                : 'Yêu cầu mã mời nội bộ được xác thực trực tiếp từ máy chủ.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-error-container/50 border border-error/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
                <p className="text-[13px] font-medium text-error leading-relaxed">{error}</p>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-on-surface">Họ và tên hiển thị</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">person</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-[46px] pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-on-surface">Vai trò quản trị</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('Mod')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        role === 'Mod'
                          ? 'border-primary bg-primary-container/20 text-primary'
                          : 'border-surface-container-high/60 bg-surface-container-lowest text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px] mb-1">local_hospital</span>
                      <span className="text-[13px] font-bold">Mod (Vận hành)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('SuperAdmin')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        role === 'SuperAdmin'
                          ? 'border-primary bg-primary-container/20 text-primary'
                          : 'border-surface-container-high/60 bg-surface-container-lowest text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px] mb-1">admin_panel_settings</span>
                      <span className="text-[13px] font-bold">SuperAdmin</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-bold text-on-surface">Mã mời xác thực (Invite Code)</label>
                    <span className="text-[11px] font-bold text-error">BẮT BUỘC</span>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">key</span>
                    <input
                      type="password"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="w-full h-[46px] pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-sm text-on-surface font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Nhập mã mời được cấp"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-on-surface">Email công việc</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[46px] pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="name@veggie.vn"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-on-surface">Mật khẩu</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[46px] pl-11 pr-11 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-outline hover:text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[46px] mt-2 rounded-xl bg-primary text-on-primary font-bold text-[14px] shadow-sm hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Đăng nhập' : 'Kích hoạt tài khoản'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-on-surface-variant">
            {isLogin ? 'Có mã mời nội bộ?' : 'Đã có tài khoản quản trị?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-bold text-primary hover:underline cursor-pointer"
            >
              {isLogin ? 'Đăng ký bằng mã mời' : 'Quay lại đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
