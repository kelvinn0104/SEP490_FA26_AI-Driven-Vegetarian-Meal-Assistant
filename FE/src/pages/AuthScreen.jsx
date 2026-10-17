import React, { useState } from 'react';
import { authApi } from '../api';

export const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register specific fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('mod');
  const [inviteCode, setInviteCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        if (!email || !password) {
          setError('Vui lòng nhập đầy đủ email và mật khẩu');
          setIsLoading(false);
          return;
        }

        const data = await authApi.login(email, password);
        const user = data.user;
        const normalizedRole = user.role === 'admin' ? 'admin' : 'mod';
        onLogin(normalizedRole, { name: user.name || user.displayName, email: user.email, ...user });
      } else {
        if (!name || !email || !password) {
          setError('Vui lòng điền đầy đủ thông tin');
          setIsLoading(false);
          return;
        }

        if (role === 'admin' && inviteCode !== 'VEGGIE2026' && inviteCode !== 'VEGGIE_ADMIN_2026') {
          setError('Mã mời Admin không hợp lệ (Gợi ý: VEGGIE2026)');
          setIsLoading(false);
          return;
        }

        const data = await authApi.register({
          name,
          email,
          password,
          role: role === 'admin' ? 'admin' : 'moderator',
          inviteCode,
        });
        const user = data.user;
        const normalizedRole = user.role === 'admin' ? 'admin' : 'mod';
        onLogin(normalizedRole, { name: user.name || user.displayName, email: user.email, ...user });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Xác thực không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);
    setError('');
    try {
      const data = await authApi.login(demoEmail, demoPassword);
      const user = data.user;
      const normalizedRole = user.role === 'admin' ? 'admin' : 'mod';
      onLogin(normalizedRole, { name: user.name || user.displayName, email: user.email, ...user });
    } catch (err) {
      console.warn('Quick login API error, using direct login:', err);
      onLogin(demoEmail.includes('admin') ? 'admin' : 'mod', {
        name: demoEmail.includes('admin') ? 'Linh Nguyen' : 'Mod Thanh',
        email: demoEmail
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-surface-container-lowest antialiased">
      {/* Left Panel - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop" 
          alt="Healthy vegan food bowl"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-12 lg:p-16 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg">
              <span className="material-symbols-outlined text-[24px]">eco</span>
            </div>
            <span className="font-bold text-2xl tracking-tight">VeggieAI Portal</span>
          </div>
          
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-6 border border-white/30 uppercase tracking-widest">
              Hệ thống Quản trị v2.4
            </span>
            <h1 className="text-5xl font-bold leading-[1.1] mb-6 drop-shadow-lg">
              Quản lý nền tảng thực dưỡng thông minh
            </h1>
            <p className="text-lg text-white/90 font-medium leading-relaxed drop-shadow-md">
              Công cụ mạnh mẽ dành riêng cho Admin và Kiểm duyệt viên (Mod). 
              Sử dụng AI để tối ưu hóa quy trình kiểm duyệt nội dung, quản lý danh mục và bảo vệ cộng đồng.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 xl:p-20 relative">
        {/* Mobile branding */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[20px]">eco</span>
          </div>
          <span className="font-bold text-lg text-on-surface tracking-tight">VeggieAI</span>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-on-surface tracking-tight">
              {isLogin ? 'Đăng nhập hệ thống' : 'Tạo tài khoản mới'}
            </h2>
            <p className="text-sm text-on-surface-variant mt-2 font-medium">
              {isLogin 
                ? 'Nhập thông tin xác thực để truy cập bảng điều khiển VeggieAI.' 
                : 'Đăng ký tài khoản Admin hoặc Kiểm duyệt viên (Mod) mới.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-error-container/50 border border-error/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
                <p className="text-[13px] font-medium text-error leading-relaxed">{error}</p>
              </div>
            )}

            {/* Register specific fields */}
            {!isLogin && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-on-surface">Họ và tên</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">person</span>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-[46px] pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="VD: Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-on-surface">Vai trò đăng ký</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('mod')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        role === 'mod' 
                          ? 'border-primary bg-primary-container/20 text-primary' 
                          : 'border-surface-container-high/60 bg-surface-container-lowest text-on-surface-variant hover:border-outline/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px] mb-1">local_hospital</span>
                      <span className="text-[13px] font-bold text-center">Chuyên gia Dinh dưỡng</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        role === 'admin' 
                          ? 'border-primary bg-primary-container/20 text-primary' 
                          : 'border-surface-container-high/60 bg-surface-container-lowest text-on-surface-variant hover:border-outline/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px] mb-1">admin_panel_settings</span>
                      <span className="text-[13px] font-bold">Quản trị (Admin)</span>
                    </button>
                  </div>
                </div>

                {role === 'admin' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-bold text-on-surface">Mã mời Admin (Invite Code)</label>
                      <span className="text-[11px] font-bold text-error">BẮT BUỘC</span>
                    </div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">key</span>
                      <input 
                        type="text" 
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="w-full h-[46px] pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-sm text-on-surface font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Nhập mã bí mật"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Common fields */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-on-surface">Email công việc</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">mail</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[46px] pl-11 pr-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="admin@veggie.vn"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-on-surface">Mật khẩu</label>
                {isLogin && (
                  <a href="#" className="text-[12px] font-semibold text-primary hover:underline">
                    Quên mật khẩu?
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[20px]">lock</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[46px] pl-11 pr-11 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                />
                <button type="button" className="absolute right-3.5 top-3 text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="pt-2 pb-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative w-5 h-5 rounded-[6px] border border-outline group-hover:border-primary bg-surface-container-lowest flex items-center justify-center transition-colors">
                    <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" defaultChecked />
                    <span className="material-symbols-outlined text-[14px] text-primary opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                  </div>
                  <span className="text-[13px] font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Duy trì đăng nhập trong 30 ngày</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-[46px] mt-4 rounded-xl bg-primary text-on-primary font-bold text-[14px] shadow-sm hover:shadow hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all overflow-hidden"
            >
              <div className={`flex items-center justify-center gap-2 transition-transform duration-300 ${isLoading ? '-translate-y-12' : 'translate-y-0'}`}>
                {isLogin ? 'Đăng nhập vào hệ thống' : 'Hoàn tất đăng ký'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </div>
              <div className={`absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-300 ${isLoading ? 'translate-y-0' : 'translate-y-12'}`}>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Đang xử lý...</span>
              </div>
            </button>
            
            {/* Quick Demo Accounts */}
            {isLogin && (
              <div className="pt-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-surface-container-high/60"></div>
                  <span className="flex-shrink-0 mx-4 text-outline text-[11px] font-semibold uppercase tracking-widest">HOẶC DÙNG TÀI KHOẢN MẪU</span>
                  <div className="flex-grow border-t border-surface-container-high/60"></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@veggie.vn', 'Password123!')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">admin_panel_settings</span>
                    <div className="text-left leading-tight">
                      <div className="text-[12px] font-bold text-on-surface">Super Admin</div>
                      <div className="text-[10px] text-outline font-mono">admin@veggie.vn</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('mod.thanh@veggie.vn', 'Password123!')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">local_hospital</span>
                    <div className="text-left leading-tight">
                      <div className="text-[12px] font-bold text-on-surface">Chuyên gia Dinh dưỡng</div>
                      <div className="text-[10px] text-outline font-mono">mod.thanh@veggie...</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 pt-6 border-t border-surface-container-high/40 text-center">
            <p className="text-[13px] text-on-surface-variant font-medium">
              {isLogin ? 'Chưa có tài khoản quản trị viên?' : 'Đã có tài khoản?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-1.5 font-bold text-primary hover:underline focus:outline-none"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
