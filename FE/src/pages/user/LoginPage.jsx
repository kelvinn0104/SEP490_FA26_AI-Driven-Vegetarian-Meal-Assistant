import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, Shield, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api';

export default function LoginPage({ onNavigate, onLogin }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Lock scroll and listen to Escape key when forgot modal is open
  useEffect(() => {
    if (showForgotModal) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setShowForgotModal(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = orig;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showForgotModal]);

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await authApi.login(identifier.trim(), password);
      const u = data?.user || data;
      if (!u) {
        throw new Error('Không nhận được thông tin xác thực từ máy chủ.');
      }
      const norm = (u.role || '').toLowerCase();
      const effectiveRole = norm === 'admin' ? 'admin' : (norm === 'moderator' || norm === 'mod' ? 'mod' : 'user');
      const userData = {
        name: u.displayName || u.name || u.email,
        email: u.email,
        role: effectiveRole === 'admin' ? 'Admin' : (effectiveRole === 'mod' ? 'Moderator' : 'AuthorizedUser'),
        roleLabel: effectiveRole === 'admin' ? 'Admin' : (effectiveRole === 'mod' ? 'Moderator' : 'Thành viên'),
        ...u
      };

      setLoginSuccess(true);
      login(userData);
      if (onLogin) onLogin(effectiveRole, userData);

      setTimeout(() => {
        if (effectiveRole === 'admin' || effectiveRole === 'mod') {
          if (onNavigate) onNavigate('dashboard');
        } else if (userData?.hasHealthProfile === false) {
          if (onNavigate) onNavigate('user-profile');
        } else {
          if (onNavigate) onNavigate('home');
        }
      }, 400);
    } catch (err) {
      if (err?.status === 403 || err?.data?.errors?.includes('EMAIL_NOT_VERIFIED') || (err.message && err.message.toLowerCase().includes('chưa xác thực'))) {
        setUnverifiedEmail(identifier.trim());
        setErrorMessage(err.message || 'Tài khoản chưa xác thực email. Vui lòng nhập mã OTP để kích hoạt tài khoản.');
      } else {
        setUnverifiedEmail('');
        setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 bg-alabaster/40 animate-fade-up">
      <div className="w-full max-w-md bg-white rounded-3xl border border-hairline p-7 sm:p-9 shadow-card space-y-6">
        
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-forest font-editorial text-2xl font-bold tracking-tight">
            <span>🌱</span>
            <span>VeggieAI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-editorial font-bold text-forest">
            Đăng nhập tài khoản
          </h1>
          <p className="text-xs text-olive">
            Theo dõi thực đơn và chỉ số dinh dưỡng thực vật của bạn
          </p>
        </div>

        {/* Error / Unverified Alert */}
        {unverifiedEmail ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <p className="font-semibold leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('pending_verify_email', unverifiedEmail);
                localStorage.setItem('pending_verify_step', '2');
                if (onNavigate) onNavigate('register');
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-forest hover:bg-forestDark text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>👉 Nhập mã xác thực OTP ngay</span>
            </button>
          </div>
        ) : errorMessage ? (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {/* Success Alert */}
        {loginSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đăng nhập thành công! Đang chuyển hướng...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-forest">
              Email hoặc tên đăng nhập
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-hairline text-xs sm:text-sm text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic transition bg-alabaster/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-forest">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => { setShowForgotModal(true); setForgotSent(false); }}
                className="text-[11px] font-semibold text-emeraldBotanic hover:text-forest transition cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-hairline text-xs sm:text-sm text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic transition bg-alabaster/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-olive pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-forest focus:ring-emeraldBotanic accent-emeraldBotanic cursor-pointer"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || loginSuccess}
            className="w-full py-3 rounded-2xl bg-forest hover:bg-forestDark disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{loading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register CTA */}
        <div className="text-center text-xs text-olive pt-1">
          <span>Chưa có tài khoản? </span>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('register')}
            className="font-bold text-forest hover:text-emeraldBotanic transition cursor-pointer"
          >
            Đăng ký tài khoản mới
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setShowForgotModal(false)}
          className="fixed inset-0 z-[9999] bg-forest/70 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-floating border border-hairline relative my-auto animate-fade-up"
          >
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-editorial text-lg font-bold text-forest">
                Khôi phục mật khẩu
              </h3>
              <p className="text-xs text-olive">
                Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <p className="text-xs text-emerald-800 font-semibold">
                  Đã gửi email khôi phục đến {forgotEmail}. Vui lòng kiểm tra hộp thư của bạn.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forestDark transition cursor-pointer"
                >
                  Hoàn tất
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-hairline text-xs text-forest outline-none focus:border-emeraldBotanic transition"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer"
                >
                  Gửi hướng dẫn
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
