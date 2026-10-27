import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Eye, EyeOff, Lock, Mail, User, ArrowRight, ArrowLeft, 
  CheckCircle2, Scale, Activity, Flame, ShieldAlert, Sparkles, HeartPulse,
  RefreshCw, KeyRound, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import { authService, healthProfileService } from '../../api';

export default function RegisterPage({ onNavigate }) {
  const { login } = useAuth();
  const veggieCtx = useVeggieNutrition();

  // Step state: 
  // 1 = Account Credentials
  // 2 = OTP Email Verification
  // 3 = BMI & Body Metrics
  // 4 = Diet & Allergies
  const [step, setStep] = useState(() => {
    try {
      const pendingEmail = localStorage.getItem('pending_verify_email');
      const pendingStep = localStorage.getItem('pending_verify_step');
      if (pendingEmail && pendingStep === '2') return 2;
    } catch {}
    return 1;
  });

  // STEP 1: ACCOUNT CREDENTIALS
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('pending_verify_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // STEP 2: OTP EMAIL VERIFICATION
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [resendSuccessMsg, setResendSuccessMsg] = useState('');
  const [verifiedToken, setVerifiedToken] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);
  const otpInputRef = useRef(null);

  // STEP 3: BMI & PHYSICAL METRICS
  const [gender, setGender] = useState('female');
  const [heightCm, setHeightCm] = useState(162);
  const [weightKg, setWeightKg] = useState(52);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [healthGoal, setHealthGoal] = useState('maintain');

  // STEP 4: DIET & ALLERGIES
  const [dietType, setDietType] = useState('vegan');
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  // STATUS & ALERTS
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Scroll to top on mount and step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Focus OTP input when entering step 2
  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [step]);

  // Countdown timer for OTP Resend (60s cooldown)
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  // OPTIONS CONSTANTS
  const dietOptions = [
    { id: 'vegan', label: 'Thuần chay (Vegan)', desc: '100% nguồn gốc thực vật, không trứng, sữa hay mật ong' },
    { id: 'vegetarian', label: 'Chay trứng sữa (Vegetarian)', desc: 'Sử dụng thêm sữa hạt, phô mai và trứng gà công nghiệp' },
    { id: 'flexitarian', label: 'Bán chay (Flexitarian)', desc: 'Ưu tiên món chay 5-6 ngày/tuần để thanh lọc cơ thể' }
  ];

  const allergyOptions = [
    { id: 'Đậu phộng', label: 'Đậu phộng (Lạc)', icon: '🥜' },
    { id: 'Đậu nành', label: 'Đậu nành & Tàu hũ', icon: '🫘' },
    { id: 'Gluten', label: 'Gluten (Lúa mì, Bánh mì)', icon: '🌾' },
    { id: 'Nấm', label: 'Các loại Nấm', icon: '🍄' },
    { id: 'Hạt cây', label: 'Hạt cây (Óc chó, Hạnh nhân)', icon: '🌰' },
    { id: 'Mè', label: 'Mè / Vừng', icon: '🌱' }
  ];

  const goalOptions = [
    { id: 'loss', label: 'Giảm mỡ & Nhẹ người', desc: 'Thâm hụt calo lành mạnh, bảo toàn cơ bắp' },
    { id: 'maintain', label: 'Duy trì & Cân bằng', desc: 'Cung cấp năng lượng chuẩn xác, tăng sức bền' },
    { id: 'gain', label: 'Tăng cân & Tăng cơ', desc: 'Tăng cường protein thực vật và calo dồi dào' }
  ];

  const activityOptions = [
    { id: 'sedentary', label: 'Ít vận động', factor: 1.2, desc: 'Làm việc văn phòng, ngồi nhiều' },
    { id: 'light', label: 'Vận động nhẹ', factor: 1.375, desc: 'Đi bộ, tập nhẹ 1-2 buổi/tuần' },
    { id: 'moderate', label: 'Vừa phải', factor: 1.55, desc: 'Tập thể dục 3-5 buổi/tuần' },
    { id: 'active', label: 'Vận động cao', factor: 1.725, desc: 'Vận động viên, tập nặng 6-7 buổi' }
  ];

  // LIVE CALCULATIONS: BMI & TDEE (WHO Western Pacific standards for Asians)
  const calculatedBmi = useMemo(() => {
    const h = Number(heightCm) / 100;
    const w = Number(weightKg);
    if (!h || !w || h <= 0) return 21.0;
    return Number((w / (h * h)).toFixed(1));
  }, [heightCm, weightKg]);

  const bmiCategory = useMemo(() => {
    if (calculatedBmi < 18.5) return { label: 'Nhẹ cân', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (calculatedBmi <= 22.9) return { label: 'Bình thường', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (calculatedBmi <= 24.9) return { label: 'Thừa cân nhẹ', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { label: 'Thừa cân', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  }, [calculatedBmi]);

  const handleAddCustomAllergy = (e) => {
    if (e) e.preventDefault();
    const val = customAllergyInput.trim();
    if (!val) return;
    if (!selectedAllergies.includes(val)) {
      setSelectedAllergies(prev => [...prev, val]);
    }
    setCustomAllergyInput('');
  };

  const estimatedTdee = useMemo(() => {
    const w = Number(weightKg);
    const h = Number(heightCm);
    // BMR Mifflin-St Jeor formula (age ~ 25)
    let bmr = gender === 'male' 
      ? 10 * w + 6.25 * h - 5 * 25 + 5
      : 10 * w + 6.25 * h - 5 * 25 - 161;
    
    const act = activityOptions.find(a => a.id === activityLevel)?.factor || 1.55;
    const tdee = Math.round(bmr * act);
    if (healthGoal === 'loss') return Math.max(1300, tdee - 400);
    if (healthGoal === 'gain') return tdee + 350;
    return tdee;
  }, [gender, heightCm, weightKg, activityLevel, healthGoal]);

  const toggleAllergy = (name) => {
    setSelectedAllergies(prev => 
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  // =========================================================================
  // STEP 1 HANDLER: REGISTER ACCOUNT -> SEND OTP EMAIL
  // =========================================================================
  const handleRegisterStep1 = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResendSuccessMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        email: trimmedEmail,
        password,
        displayName: fullName.trim() || trimmedEmail.split('@')[0],
        role: 'user',
      });

      const resendCooldown = res?.resendAfterSeconds || 60;
      setCountdown(resendCooldown);
      localStorage.setItem('pending_verify_email', trimmedEmail);
      localStorage.setItem('pending_verify_step', '2');
      setStep(2);
      if (res?.devOtp) {
        setOtpCode(res.devOtp);
        setResendSuccessMsg(`(Mã xác thực thử nghiệm: ${res.devOtp})`);
      } else {
        setOtpCode('');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // STEP 2 HANDLERS: VERIFY OTP CODE & RESEND OTP
  // =========================================================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResendSuccessMsg('');

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác thực OTP.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.verifyCode({
        email: email.trim().toLowerCase(),
        otpCode: cleanOtp,
      });

      const token = data?.accessToken || data?.token;
      const u = data?.user || {
        name: fullName.trim() || email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: 'user',
        roleLabel: 'Thành viên',
        status: 'active',
        dietType,
      };

      setVerifiedToken(token);
      setVerifiedUser(u);

      // Đăng nhập chính thức vào AuthContext
      login(u, token);

      // Xóa cờ pending
      localStorage.removeItem('pending_verify_email');
      localStorage.removeItem('pending_verify_step');

      // Chuyển sang Bước 3: Hồ sơ thể trạng BMI
      setStep(3);
    } catch (err) {
      setErrorMessage(err.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setErrorMessage('');
    setResendSuccessMsg('');
    setLoading(true);

    try {
      const res = await authService.resendCode({
        email: email.trim().toLowerCase(),
      });
      const nextCooldown = res?.resendAfterSeconds || 60;
      setCountdown(nextCooldown);
      if (res?.devOtp) {
        setOtpCode(res.devOtp);
        setResendSuccessMsg(`✓ Đã gửi mã xác thực mới (Mã: ${res.devOtp}).`);
      } else {
        setResendSuccessMsg(`✓ Đã gửi mã xác thực mới tới email ${email.trim().toLowerCase()}.`);
        setOtpCode('');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Không thể gửi lại mã xác thực. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // STEP 3 HANDLER: BMI METRICS -> STEP 4
  // =========================================================================
  const handleNextToStep4 = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const h = Number(heightCm);
    const w = Number(weightKg);
    if (isNaN(h) || h < 100 || h > 230) {
      setErrorMessage('Vui lòng nhập chiều cao hợp lệ (từ 100cm đến 230cm).');
      return;
    }
    if (isNaN(w) || w < 30 || w > 200) {
      setErrorMessage('Vui lòng nhập cân nặng hợp lệ (từ 30kg đến 200kg).');
      return;
    }

    setStep(4);
  };

  // =========================================================================
  // STEP 4 HANDLER: FINAL PROFILE SAVE & NAVIGATE TO PLANNER
  // =========================================================================
  const handleFinalProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // 1. Chuẩn bị hồ sơ sức khỏe & thể trạng hoàn chỉnh
      const finalProfile = {
        name: fullName.trim() || email.split('@')[0],
        gender,
        dateOfBirth: '2000-01-01',
        height: Number(heightCm),
        weight: Number(weightKg),
        activityLevel,
        goal: healthGoal,
        diet: dietType === 'vegan' ? 'Thuần chay (Vegan)' : dietType === 'vegetarian' ? 'Chay trứng sữa (Vegetarian)' : 'Bán chay (Flexitarian)',
        allergies: selectedAllergies,
        bmi: calculatedBmi,
        tdee: estimatedTdee,
        dailyCalories: estimatedTdee,
        proteinTarget: Math.round((estimatedTdee * 0.18) / 4),
        carbsTarget: Math.round((estimatedTdee * 0.55) / 4),
        fatTarget: Math.round((estimatedTdee * 0.27) / 9)
      };

      // 2. Cập nhật hồ sơ vào Context và LocalStorage
      try {
        localStorage.setItem('veggie_user_profile', JSON.stringify(finalProfile));
      } catch {}

      if (veggieCtx?.updateProfile) {
        await veggieCtx.updateProfile(finalProfile);
      }

      // 3. Gửi hồ sơ lên máy chủ nếu có endpoint
      try {
        await healthProfileService.updateHealthProfile({
          gender,
          dateOfBirth: '2000-01-01',
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          activityLevel,
          healthGoal,
          allergyIds: []
        });
      } catch (err) {
        console.warn('Lưu hồ sơ backend (nếu có):', err.message);
      }

      setRegisterSuccess(true);

      setTimeout(() => {
        if (onNavigate) onNavigate('planner');
      }, 700);

    } catch (err) {
      setErrorMessage(err.message || 'Lưu hồ sơ thể trạng không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8 bg-alabaster/40 animate-fade-up">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-hairline p-6 sm:p-9 shadow-card space-y-6">
        
        {/* Brand & Stepper Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-forest font-editorial text-2xl font-bold tracking-tight">
            <span>🌱</span>
            <span>VeggieAI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-editorial font-bold text-forest">
            Đăng ký & Thiết lập hồ sơ dinh dưỡng
          </h1>
          <p className="text-xs text-olive max-w-md mx-auto">
            Quy trình 4 bước hoàn tất xác thực email và cá nhân hóa thực đơn theo chỉ số thể trạng riêng của bạn.
          </p>

          {/* 4-STEP PROGRESS STEPPER */}
          <div className="pt-2 flex items-center justify-center gap-1 sm:gap-2">
            {/* Step 1 */}
            <div className={`flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-colors ${step >= 1 ? 'text-forest' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-forest text-white shadow-xs' : step > 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span className="hidden sm:inline">Tài khoản</span>
            </div>

            <div className={`w-5 sm:w-8 h-0.5 rounded-full transition-colors ${step >= 2 ? 'bg-forest' : 'bg-slate-200'}`} />

            {/* Step 2 */}
            <div className={`flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-colors ${step >= 2 ? 'text-forest' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-forest text-white shadow-xs' : step > 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span className="hidden sm:inline">Xác thực OTP</span>
            </div>

            <div className={`w-5 sm:w-8 h-0.5 rounded-full transition-colors ${step >= 3 ? 'bg-forest' : 'bg-slate-200'}`} />

            {/* Step 3 */}
            <div className={`flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-colors ${step >= 3 ? 'text-forest' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? 'bg-forest text-white shadow-xs' : step > 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                {step > 3 ? '✓' : '3'}
              </span>
              <span className="hidden sm:inline">Thể trạng BMI</span>
            </div>

            <div className={`w-5 sm:w-8 h-0.5 rounded-full transition-colors ${step >= 4 ? 'bg-forest' : 'bg-slate-200'}`} />

            {/* Step 4 */}
            <div className={`flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-colors ${step >= 4 ? 'text-forest' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 4 ? 'bg-forest text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
                4
              </span>
              <span className="hidden sm:inline">Chế độ & Dị ứng</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resend Success Note */}
        {resendSuccessMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{resendSuccessMsg}</span>
          </div>
        )}

        {/* Final Registration Success Alert */}
        {registerSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Hồ sơ đã hoàn tất thành công!</p>
              <p className="text-emerald-700 font-normal mt-0.5">
                AI đang khởi tạo thực đơn tuần chuẩn dinh dưỡng theo chỉ số BMI của bạn...
              </p>
            </div>
          </div>
        )}

        {/* ====================================================================
            BƯỚC 1: THÔNG TIN TÀI KHOẢN (GỬI OTP EMAIL)
        ==================================================================== */}
        {step === 1 && (
          <form onSubmit={handleRegisterStep1} className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-hairline pb-2 mb-3">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Bước 1 / 4
              </span>
              <h2 className="text-base font-bold text-forest">Thông tin đăng nhập ban đầu</h2>
            </div>

            {/* Họ và tên */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-olive" />
                <span>Họ và tên</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Hoàng Nam"
                className="w-full px-4 py-2.5 rounded-2xl border border-hairline text-xs text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic bg-slate-50 transition"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-olive" />
                <span>Địa chỉ Email <strong className="text-rose-500">*</strong></span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-2xl border border-hairline text-xs text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic bg-slate-50 transition"
              />
              <span className="text-[11px] text-olive block">
                * Mã OTP 6 chữ số sẽ được gửi về hộp thư này để kích hoạt tài khoản.
              </span>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-olive" />
                <span>Mật khẩu <strong className="text-rose-500">*</strong></span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-4 py-2.5 rounded-2xl border border-hairline text-xs text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic bg-slate-50 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-olive hover:text-forest transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Xác nhận Mật khẩu */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-olive" />
                <span>Xác nhận mật khẩu <strong className="text-rose-500">*</strong></span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu phía trên"
                  className="w-full px-4 py-2.5 rounded-2xl border border-hairline text-xs text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic bg-slate-50 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-olive hover:text-forest transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-2xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-4 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span>{loading ? 'Đang gửi mã OTP...' : 'Tiếp tục: Nhận mã xác thực qua Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-olive">Đã có tài khoản? </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('login')}
                className="text-xs font-bold text-forest hover:underline cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          </form>
        )}

        {/* ====================================================================
            BƯỚC 2: XÁC THỰC EMAIL QUA MÃ OTP 6 SỐ
        ==================================================================== */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-hairline pb-2 mb-2">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Bước 2 / 4
              </span>
              <h2 className="text-base font-bold text-forest">Xác thực tài khoản qua Email</h2>
            </div>

            {/* Email destination reminder */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-forest flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-forest leading-relaxed">
                  Mã xác thực 6 số đã được gửi tới:
                </p>
                <p className="text-sm font-bold text-forest font-mono">
                  {email || 'email của bạn'}
                </p>
                <p className="text-[11px] text-olive leading-relaxed pt-0.5">
                  Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam/Rác) và nhập 6 chữ số vào bên dưới.
                </p>
              </div>
            </div>

            {/* OTP Input Box */}
            <div className="space-y-2 text-center py-2">
              <label className="text-xs font-semibold text-forest block">
                Nhập mã OTP 6 số:
              </label>
              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(val);
                }}
                placeholder="••••••"
                className="w-full max-w-[280px] mx-auto py-3 px-4 rounded-2xl border-2 border-hairline text-2xl sm:text-3xl font-mono font-black text-center tracking-[0.45em] text-forest placeholder-slate-300 outline-none focus:border-emeraldBotanic focus:ring-2 focus:ring-emerald-200 bg-slate-50 transition"
              />
              <span className="text-[11px] text-olive block">
                Mã có hiệu lực trong 5 phút
              </span>
            </div>

            {/* Cooldown Timer & Resend Button */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-hairline flex items-center justify-between gap-3 text-xs">
              <span className="text-olive">Chưa nhận được mã?</span>
              {countdown > 0 ? (
                <span className="text-olive font-semibold font-mono">
                  Gửi lại sau <strong className="text-forest">{countdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs font-bold text-forest hover:text-emerald-700 underline transition cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Gửi lại mã OTP</span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMessage('');
                }}
                className="py-3 px-4 rounded-2xl border border-hairline text-xs font-semibold text-olive hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sửa email</span>
              </button>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className={`flex-1 py-3 px-4 rounded-2xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2 ${
                  loading || otpCode.length !== 6 ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <span>{loading ? 'Đang xác thực...' : 'Xác thực & Tiếp tục'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ====================================================================
            BƯỚC 3: CHỈ SỐ THỂ TRẠNG BMI & MỤC TIÊU CALO
        ==================================================================== */}
        {step === 3 && (
          <form onSubmit={handleNextToStep4} className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-hairline pb-2 mb-2">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Bước 3 / 4
              </span>
              <h2 className="text-base font-bold text-forest">Thông số thể trạng & Nhu cầu năng lượng</h2>
            </div>

            {/* LIVE BMI PREVIEW CARD */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Chỉ số thể trạng
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-forest font-mono leading-none">BMI {calculatedBmi}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${bmiCategory.color}`}>
                    {bmiCategory.label}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-olive font-semibold block uppercase tracking-wider">Mục tiêu</span>
                <span className="text-sm sm:text-base font-bold text-forest font-mono">{estimatedTdee} kcal/ngày</span>
              </div>
            </div>

            {/* Giới tính */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest block">Giới tính sinh học</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-2 ${
                    gender === 'female' 
                      ? 'bg-forest text-white border-forest shadow-xs' 
                      : 'bg-slate-50 border-hairline text-olive hover:bg-slate-100'
                  }`}
                >
                  <span>Nữ giới</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-2 ${
                    gender === 'male' 
                      ? 'bg-forest text-white border-forest shadow-xs' 
                      : 'bg-slate-50 border-hairline text-olive hover:bg-slate-100'
                  }`}
                >
                  <span>Nam giới</span>
                </button>
              </div>
            </div>

            {/* Chiều cao & Cân nặng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-forest">Chiều cao</label>
                  <span className="font-mono text-xs font-bold text-forest">{heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="210"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full accent-emeraldBotanic cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-olive font-mono">
                  <span>130cm</span>
                  <span>170cm</span>
                  <span>210cm</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-forest">Cân nặng</label>
                  <span className="font-mono text-xs font-bold text-forest">{weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="130"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full accent-emeraldBotanic cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-olive font-mono">
                  <span>35kg</span>
                  <span>80kg</span>
                  <span>130kg</span>
                </div>
              </div>
            </div>

            {/* Mức độ vận động */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest block">Mức độ vận động hàng tuần</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActivityLevel(opt.id)}
                    className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      activityLevel === opt.id
                        ? 'border-emeraldBotanic bg-emerald-50/50 text-forest shadow-xs'
                        : 'border-hairline bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[10px] text-olive block mt-0.5 leading-tight">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mục tiêu sức khỏe */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest block">Mục tiêu dinh dưỡng</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {goalOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setHealthGoal(opt.id)}
                    className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                      healthGoal === opt.id
                        ? 'border-emeraldBotanic bg-emerald-50/50 text-forest shadow-xs'
                        : 'border-hairline bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[10px] text-olive block mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-2xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Tiếp tục: Chế độ ăn & Dị ứng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ====================================================================
            BƯỚC 4: CHẾ ĐỘ ĂN & KHAI BÁO DỊ ỨNG (HOÀN TẤT)
        ==================================================================== */}
        {step === 4 && (
          <form onSubmit={handleFinalProfileSubmit} className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-hairline pb-2 mb-2">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Bước 4 / 4
              </span>
              <h2 className="text-base font-bold text-forest">Chế độ ăn & Khai báo dị ứng</h2>
            </div>

            {/* Loại chế độ ăn chay */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-forest block">
                Chọn hình thức ăn thuần thực vật phù hợp với bạn:
              </label>
              <div className="space-y-2">
                {dietOptions.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDietType(d.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      dietType === d.id
                        ? 'border-emeraldBotanic bg-emerald-50/60 shadow-xs'
                        : 'border-hairline bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-forest block">{d.label}</span>
                      <span className="text-[11px] text-olive block mt-0.5">{d.desc}</span>
                    </div>
                    {dietType === d.id && (
                      <span className="w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center text-xs shrink-0 ml-2">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dị ứng thực phẩm (Allergen Guard) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-forest">
                  Khai báo chất gây dị ứng (Allergen Guard)
                </label>
                <span className="text-[10px] text-rose-600 font-bold">AI sẽ loại trừ 100%</span>
              </div>
              <p className="text-[11px] text-olive">
                Chọn các nguyên liệu khiến bạn bị dị ứng hoặc đầy bụng để hệ thống không bao giờ gợi ý trong thực đơn:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {allergyOptions.map((item) => {
                  const isChecked = selectedAllergies.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAllergy(item.id)}
                      className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                        isChecked
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-xs'
                          : 'bg-slate-50 border-hairline text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{item.icon}</span>
                        <span className="text-xs truncate">{item.label}</span>
                      </div>
                      {isChecked && <span className="text-rose-600 text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Thêm dị ứng khác ngoài danh sách */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-forest block mb-1">
                  Dị ứng khác ngoài danh sách trên (nếu có):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customAllergyInput}
                    onChange={(e) => setCustomAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAllergy();
                      }
                    }}
                    placeholder="Ví dụ: Cần tây, Dâu tây, Mù tạt, Ngô..."
                    className="flex-1 px-3 py-2 rounded-xl border border-hairline text-xs text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllergy}
                    className="px-3.5 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    + Thêm
                  </button>
                </div>

                {/* Danh sách các dị ứng khác đã thêm */}
                {selectedAllergies.filter(a => !allergyOptions.some(opt => opt.id === a)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedAllergies
                      .filter(a => !allergyOptions.some(opt => opt.id === a))
                      .map((customName) => (
                        <span
                          key={customName}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                        >
                          <span>⚠️ {customName}</span>
                          <button
                            type="button"
                            onClick={() => toggleAllergy(customName)}
                            className="text-rose-500 hover:text-rose-800 font-bold ml-0.5 cursor-pointer text-sm"
                            title="Xóa dị ứng này"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-4 rounded-2xl border border-hairline text-xs font-semibold text-olive hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>

              <button
                type="submit"
                disabled={loading || registerSuccess}
                className={`flex-1 py-3 px-4 rounded-2xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2 ${
                  loading || registerSuccess ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <span>{loading ? 'Đang lưu hồ sơ...' : 'Hoàn tất hồ sơ & Lập thực đơn'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
