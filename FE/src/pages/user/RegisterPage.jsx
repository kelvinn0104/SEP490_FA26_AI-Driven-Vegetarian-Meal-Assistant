import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api';

export default function RegisterPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dietType, setDietType] = useState('vegan');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const dietOptions = [
    { id: 'vegan', label: 'Thuần chay (Vegan)' },
    { id: 'vegetarian', label: 'Chay trứng sữa (Vegetarian)' },
    { id: 'flexitarian', label: 'Bán chay (Flexitarian)' }
  ];

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register({
        email: email.trim().toLowerCase(),
        password,
        displayName: fullName.trim() || email.split('@')[0],
      });

      const token = res?.accessToken || res?.token;
      const user = res?.user || {
        name: fullName.trim() || email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: 'AuthorizedUser',
        roleLabel: 'Thành viên',
        hasHealthProfile: false
      };

      setRegisterSuccess(true);

      setTimeout(() => {
        login(user, token);
        if (onNavigate) onNavigate('user-profile');
      }, 500);

    } catch (err) {
      setErrorMessage(err.message || 'Đăng ký tài khoản không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
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
            Tạo tài khoản mới
          </h1>
          <p className="text-xs text-olive">
            Bắt đầu hành trình dinh dưỡng thực vật lành mạnh và cân bằng
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {registerSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tạo tài khoản thành công! Đang chuyển hướng thiết lập hồ sơ...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-forest">
              Họ và tên
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-hairline text-xs sm:text-sm text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic transition bg-alabaster/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-forest">
              Email đăng ký
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-hairline text-xs sm:text-sm text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic transition bg-alabaster/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-forest">
              Chế độ ăn ưa thích
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {dietOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDietType(opt.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition cursor-pointer flex items-center justify-between ${
                    dietType === opt.id
                      ? 'bg-emeraldBotanic/10 border-emeraldBotanic text-forest font-bold'
                      : 'border-hairline text-olive hover:bg-alabaster'
                  }`}
                >
                  <span>{opt.label}</span>
                  {dietType === opt.id && <span className="text-emeraldBotanic text-xs font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-forest">
              Mật khẩu (tối thiểu 6 ký tự)
            </label>
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-forest">
              Xác nhận mật khẩu
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-hairline text-xs sm:text-sm text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic transition bg-alabaster/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 transition"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || registerSuccess}
            className="w-full py-3 rounded-2xl bg-forest hover:bg-forestDark disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Login CTA */}
        <div className="text-center text-xs text-olive pt-1">
          <span>Đã có tài khoản? </span>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('login')}
            className="font-bold text-forest hover:text-emeraldBotanic transition cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
}
