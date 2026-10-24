import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, EyeOff, Lock, Mail, User, ArrowRight, ArrowLeft, 
  CheckCircle2, Scale, Activity, Flame, ShieldAlert, Sparkles, HeartPulse
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import { authService, healthProfileService } from '../../api';

export default function RegisterPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { login } = useAuth();
  const veggieCtx = useVeggieNutrition();

  // Step state: 1 = Account Credentials, 2 = BMI & Body Metrics, 3 = Diet & Allergies
  const [step, setStep] = useState(1);

  // STEP 1: ACCOUNT
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // STEP 2: BMI & PHYSICAL METRICS
  const [gender, setGender] = useState('female');
  const [heightCm, setHeightCm] = useState(162);
  const [weightKg, setWeightKg] = useState(52);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [healthGoal, setHealthGoal] = useState('maintain');

  // STEP 3: DIET & ALLERGIES
  const [dietType, setDietType] = useState('vegan');
  const [selectedAllergies, setSelectedAllergies] = useState([]);

  // STATUS & ALERTS
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

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

  const [customAllergyInput, setCustomAllergyInput] = useState('');

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

  // STEP NAVIGATION HANDLERS
  const handleNextToStep2 = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
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

    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleNextToStep3 = (e) => {
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

    setStep(3);
    window.scrollTo(0, 0);
  };

  // FINAL SUBMISSION: REGISTER ACCOUNT + SAVE FULL BMI & ALLERGY PROFILE
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // 1. Tạo tài khoản người dùng trên Backend C#
      const res = await authService.register({
        email: email.trim().toLowerCase(),
        password,
        displayName: fullName.trim() || email.split('@')[0],
      });

      const token = res?.accessToken || res?.token;
      const user = res?.user || {
        name: fullName.trim() || email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: 'user',
        roleLabel: 'Thành viên',
        dietType,
        hasHealthProfile: true
      };

      // 2. Chuẩn bị hồ sơ sức khỏe & thể trạng hoàn chỉnh
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

      // 3. Cập nhật hồ sơ vào Context và CSDL
      try {
        localStorage.setItem('veggie_user_profile', JSON.stringify(finalProfile));
      } catch {}

      if (veggieCtx?.updateProfile) {
        await veggieCtx.updateProfile(finalProfile);
      }

      // Gửi lên backend nếu có token
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
        console.warn('Đã lưu hồ sơ cục bộ:', err.message);
      }

      setRegisterSuccess(true);

      setTimeout(() => {
        login(user, token);
        if (onNavigate) onNavigate('planner');
      }, 700);

    } catch (err) {
      setErrorMessage(err.message || 'Đăng ký tài khoản không thành công. Vui lòng kiểm tra lại thông tin.');
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
            Hồ sơ thể trạng và dị ứng là thông tin bắt buộc để AI cá nhân hóa thực đơn chính xác và an toàn cho bạn.
          </p>

          {/* 3-STEP PROGRESS STEPPER */}
          <div className="pt-2 flex items-center justify-center gap-2 sm:gap-4">
            <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${step >= 1 ? 'text-forest' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-forest text-white shadow-xs' : step > 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span>Tài khoản</span>
            </div>

            <div className={`w-8 sm:w-12 h-0.5 rounded-full transition-colors ${step >= 2 ? 'bg-forest' : 'bg-slate-200'}`} />

            <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${step >= 2 ? 'text-forest' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-forest text-white shadow-xs' : step > 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span>Thể trạng BMI</span>
            </div>

            <div className={`w-8 sm:w-12 h-0.5 rounded-full transition-colors ${step >= 3 ? 'bg-forest' : 'bg-slate-200'}`} />

            <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${step >= 3 ? 'text-forest' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? 'bg-forest text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
                3
              </span>
              <span>Chế độ & Dị ứng</span>
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

        {/* Success Alert */}
        {registerSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">Tạo tài khoản và kích hoạt hồ sơ thành công!</div>
              <div className="text-emerald-700 font-normal mt-0.5">Hệ thống đang chuyển hướng bạn tới Thực đơn tuần cá nhân hóa...</div>
            </div>
          </div>
        )}

        {/* ================= STEP 1: ACCOUNT CREDENTIALS ================= */}
        {step === 1 && (
          <form onSubmit={handleNextToStep2} className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest">
                Họ và tên của bạn <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Mai Anh"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-hairline text-xs sm:text-sm text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic transition bg-alabaster/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest">
                Địa chỉ Email <span className="text-rose-500">*</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-forest">
                  Mật khẩu (tối thiểu 6 ký tự) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-hairline text-xs sm:text-sm text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic transition bg-alabaster/30"
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
                  Xác nhận mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-hairline text-xs sm:text-sm text-forest placeholder-slate-400 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic transition bg-alabaster/30"
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
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-forest hover:bg-forestDark text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <span>Tiếp tục: Điền chỉ số thể trạng BMI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ================= STEP 2: BMI & PHYSICAL METRICS ================= */}
        {step === 2 && (
          <form onSubmit={handleNextToStep3} className="space-y-5 animate-in fade-in duration-200">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-forest block mb-1">Giới tính sinh học</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      gender === 'female' ? 'bg-forest text-white border-forest' : 'bg-slate-50 border-hairline text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Nữ giới</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      gender === 'male' ? 'bg-forest text-white border-forest' : 'bg-slate-50 border-hairline text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Nam giới</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-forest block mb-1">Mục tiêu thể trạng</label>
                <select
                  value={healthGoal}
                  onChange={(e) => setHealthGoal(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-hairline text-xs font-semibold text-forest bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emeraldBotanic"
                >
                  <option value="loss">Giảm mỡ & Giảm cân</option>
                  <option value="maintain">Duy trì cân nặng & Cân bằng</option>
                  <option value="gain">Tăng cân & Tăng cơ nạc</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest flex items-center justify-between">
                  <span>Chiều cao (cm)</span>
                  <span className="font-mono text-emerald-700 font-bold">{heightCm} cm</span>
                </label>
                <input
                  type="number"
                  min="100"
                  max="230"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-hairline text-xs sm:text-sm text-forest font-semibold bg-alabaster/30 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest flex items-center justify-between">
                  <span>Cân nặng (kg)</span>
                  <span className="font-mono text-emerald-700 font-bold">{weightKg} kg</span>
                </label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-hairline text-xs sm:text-sm text-forest font-semibold bg-alabaster/30 outline-none focus:border-emeraldBotanic focus:ring-1 focus:ring-emeraldBotanic"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-forest block mb-1.5">Tần suất vận động thể chất</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activityOptions.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityLevel(act.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      activityLevel === act.id
                        ? 'bg-emerald-50 border-emeraldBotanic text-forest font-bold ring-1 ring-emeraldBotanic'
                        : 'bg-white border-hairline text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">{act.label}</span>
                    <span className="text-[10px] text-olive font-normal mt-0.5">{act.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 rounded-2xl border border-hairline text-slate-600 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 rounded-2xl bg-forest hover:bg-forestDark text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Tiếp tục: Dị ứng & Chế độ ăn</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: DIET & ALLERGIES ================= */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-5 animate-in fade-in duration-200">
            {/* Chế độ ăn chay */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-forest flex items-center justify-between">
                <span>Chế độ ăn thực dưỡng bạn hướng tới</span>
                <span className="text-[11px] text-emerald-700 font-bold">Chọn 1 chế độ</span>
              </label>
              <div className="space-y-2">
                {dietOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setDietType(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                      dietType === opt.id
                        ? 'bg-emerald-50/80 border-emeraldBotanic ring-1 ring-emeraldBotanic text-forest'
                        : 'bg-white border-hairline text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                      dietType === opt.id ? 'border-emeraldBotanic bg-emeraldBotanic text-white' : 'border-slate-300'
                    }`}>
                      {dietType === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-forest">{opt.label}</div>
                      <div className="text-[11px] text-olive mt-0.5 leading-snug">{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dị ứng thực phẩm */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-forest">
                  Dị ứng thực phẩm cần loại trừ
                </label>
                <span className="text-[11px] text-olive font-mono">
                  Đã chọn: {selectedAllergies.length}
                </span>
              </div>
              <p className="text-[11px] text-olive leading-relaxed">
                AI sẽ tự động loại trừ các nguyên liệu này trong tất cả gợi ý thực đơn và công thức món ăn của bạn.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {allergyOptions.map((alg) => {
                  const isChecked = selectedAllergies.includes(alg.id);
                  return (
                    <button
                      key={alg.id}
                      type="button"
                      onClick={() => toggleAllergy(alg.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                        isChecked
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-xs'
                          : 'bg-slate-50 border-hairline text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{alg.icon}</span>
                      <span className="text-xs truncate">{alg.label}</span>
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
                onClick={() => setStep(2)}
                disabled={loading || registerSuccess}
                className="w-1/3 py-3 rounded-2xl border border-hairline text-slate-600 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>
              <button
                type="submit"
                disabled={loading || registerSuccess}
                className="w-2/3 py-3 rounded-2xl bg-forest hover:bg-forestDark disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Đang kích hoạt tài khoản...' : 'Hoàn tất & Khởi tạo thực đơn'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Login CTA */}
        <div className="text-center text-xs text-olive pt-2 border-t border-hairline/60">
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
