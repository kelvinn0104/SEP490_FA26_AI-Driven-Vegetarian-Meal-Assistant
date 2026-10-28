import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, Activity, FileText, Settings, User, 
  ArrowLeft, CheckCircle2, Clock, AlertCircle, Plus, 
  Edit3, Trash2, Eye, Sparkles, ShieldCheck, Scale, 
  Flame, Droplets, Target, Save, Lock, Mail, Phone,
  Camera, X, ChefHat, BookOpen, Send, Bookmark, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import { recipeService } from '../../api/services/recipeService';

export default function UserAccountPage({ defaultTab = 'profile', onNavigate }) {
  const { user } = useAuth();
  const { profile, updateProfile, metrics, showToast } = useVeggieNutrition();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // ==========================================
  // TAB 1: HỒ SƠ SỨC KHỎE & THỂ TRẠNG
  // ==========================================
  const [editHeight, setEditHeight] = useState(profile?.height || 165);
  const [editWeight, setEditWeight] = useState(profile?.weight || 55);
  const [editDiet, setEditDiet] = useState(profile?.diet || 'Thuần chay (Vegan)');
  const [editGoal, setEditGoal] = useState(profile?.goal || 'maintain');
  const [editAllergies, setEditAllergies] = useState(profile?.allergies || ['Đậu phộng']);
  const [customAllergy, setCustomAllergy] = useState('');

  useEffect(() => {
    if (profile) {
      setEditHeight(profile.height || 165);
      setEditWeight(profile.weight || 55);
      setEditDiet(profile.diet || 'Thuần chay (Vegan)');
      setEditGoal(profile.goal || 'maintain');
      setEditAllergies(profile.allergies || ['Đậu phộng']);
    }
  }, [profile]);

  const handleSaveHealthProfile = async (e) => {
    e.preventDefault();
    if (updateProfile) {
      await updateProfile({
        ...profile,
        height: Number(editHeight),
        weight: Number(editWeight),
        diet: editDiet,
        goal: editGoal,
        allergies: editAllergies
      });
    }
    triggerToast('✓ Đã cập nhật hồ sơ thể trạng và tính lại chỉ số TDEE/BMI!');
  };

  const toggleAllergy = (item) => {
    setEditAllergies(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleAddCustomAllergy = (e) => {
    e.preventDefault();
    const val = customAllergy.trim();
    if (!val) return;
    if (!editAllergies.includes(val)) {
      setEditAllergies(prev => [...prev, val]);
    }
    setCustomAllergy('');
  };

  // ==========================================
  // TAB 2: QUẢN LÝ BÀI ĐĂNG CỦA TÔI
  // ==========================================
  const [userPosts, setUserPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (activeTab === 'posts') {
      setIsLoadingPosts(true);
      recipeService.getRecipes()
        .then(res => {
          let localPosts = [];
          try {
            localPosts = JSON.parse(localStorage.getItem('veggieai_user_created_recipes') || '[]');
          } catch {}
          const live = Array.isArray(res) ? res : [];
          setUserPosts([...localPosts, ...live.slice(0, 4)]);
        })
        .catch(() => {})
        .finally(() => setIsLoadingPosts(false));
    }
  }, [activeTab]);

  // ==========================================
  // TAB 3: THÔNG TIN TÀI KHOẢN & BẢO MẬT
  // ==========================================
  const [accountName, setAccountName] = useState(user?.name || 'Hội viên VeggieAI');
  const [accountEmail, setAccountEmail] = useState(user?.email || 'user@veggie.ai');
  const [accountPhone, setAccountPhone] = useState('0912 345 678');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveAccount = (e) => {
    e.preventDefault();
    triggerToast('✓ Đã lưu cài đặt thông tin tài khoản!');
  };

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fade-up">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest text-white px-5 py-3 rounded-2xl shadow-floating flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-fade-up border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BREADCRUMB */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-olive hover:text-forest transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Trang chủ</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          🌱 {user?.roleLabel || user?.role || 'Hội viên chính thức'}
        </span>
      </div>

      {/* TABS SELECTOR */}
      <div className="bg-white rounded-3xl border border-hairline p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'profile' ? 'bg-forest text-white shadow-xs' : 'text-olive hover:text-forest hover:bg-slate-50'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Hồ sơ sức khỏe</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'posts' ? 'bg-forest text-white shadow-xs' : 'text-olive hover:text-forest hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bài viết của tôi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'settings' ? 'bg-forest text-white shadow-xs' : 'text-olive hover:text-forest hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cài đặt tài khoản</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: HỒ SƠ SỨC KHỎE & THỂ TRẠNG
      ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fade-up">
          {/* Quick Metrics Glance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border border-hairline p-4 shadow-xs text-center space-y-1">
              <span className="text-[11px] text-olive font-medium">Chỉ số BMI</span>
              <p className="font-editorial text-2xl font-bold text-forest">{metrics?.bmi || 21.5}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                {metrics?.category || 'Bình thường'}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-hairline p-4 shadow-xs text-center space-y-1">
              <span className="text-[11px] text-olive font-medium">TDEE Năng lượng</span>
              <p className="font-editorial text-2xl font-bold text-forest">{metrics?.tdee || 2000}</p>
              <span className="text-[10px] text-olive">kcal/ngày</span>
            </div>

            <div className="bg-white rounded-2xl border border-hairline p-4 shadow-xs text-center space-y-1">
              <span className="text-[11px] text-olive font-medium">Mục tiêu Đạm</span>
              <p className="font-editorial text-2xl font-bold text-forest">{metrics?.targetProtein || 70}g</p>
              <span className="text-[10px] text-olive">protein thực vật</span>
            </div>

            <div className="bg-white rounded-2xl border border-hairline p-4 shadow-xs text-center space-y-1">
              <span className="text-[11px] text-olive font-medium">Vitamin B12</span>
              <p className="font-editorial text-2xl font-bold text-forest">2.4</p>
              <span className="text-[10px] text-olive">µg/ngày (WHO)</span>
            </div>
          </div>

          {/* Form Edit */}
          <form onSubmit={handleSaveHealthProfile} className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <h2 className="font-editorial text-lg font-bold text-forest">Thông Số Thể Trạng Cá Nhân</h2>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5 text-emerald-300" />
                <span>Lưu hồ sơ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-forest block mb-1">Chiều cao (cm)</label>
                <input
                  type="number"
                  value={editHeight}
                  onChange={(e) => setEditHeight(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:border-forest outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-forest block mb-1">Cân nặng (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:border-forest outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-forest block mb-1">Chế độ dinh dưỡng</label>
                <select
                  value={editDiet}
                  onChange={(e) => setEditDiet(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:border-forest outline-none"
                >
                  <option value="Thuần chay (Vegan)">Thuần chay (Vegan)</option>
                  <option value="Chay trứng sữa (Vegetarian)">Chay trứng sữa (Vegetarian)</option>
                  <option value="Bán chay (Flexitarian)">Bán chay (Flexitarian)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-forest block mb-1">Mục tiêu sức khỏe</label>
                <select
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-50 focus:bg-white focus:border-forest outline-none"
                >
                  <option value="maintain">Duy trì vóc dáng & Cân bằng vi chất</option>
                  <option value="loss">Giảm mỡ giữ cơ</option>
                  <option value="gain">Tăng cơ & Cung cấp năng lượng</option>
                </select>
              </div>
            </div>

            {/* Allergies checklist */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-forest block">Dị ứng & Thành phần cần tránh</label>
              <div className="flex flex-wrap gap-2">
                {['Đậu phộng', 'Đậu nành', 'Gluten', 'Ngũ vị tân'].map((item) => {
                  const checked = editAllergies.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAllergy(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                        checked ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold' : 'bg-slate-50 border-hairline text-slate-600'
                      }`}
                    >
                      {checked ? '✕ ' : '+ '}{item}
                    </button>
                  );
                })}
              </div>

              {/* Custom allergy input */}
              <div className="flex gap-2 max-w-md pt-1">
                <input
                  type="text"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  placeholder="Thêm dị ứng khác (VD: Mè đen, Nấm tuyết)..."
                  className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-hairline bg-slate-50 outline-none focus:border-forest"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAllergy}
                  className="px-3.5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forestDark transition cursor-pointer"
                >
                  Thêm
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BÀI VIẾT CỦA TÔI
      ========================================================================= */}
      {activeTab === 'posts' && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-xl font-bold text-forest">Danh Sách Bài Viết Đã Đăng</h2>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('create-post')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-300" />
              <span>Đăng công thức mới</span>
            </button>
          </div>

          {isLoadingPosts ? (
            <div className="bg-white rounded-3xl border border-hairline p-12 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-hairline p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-emerald-600/40 mx-auto" />
              <p className="text-sm font-semibold text-forest">Chưa có bài viết nào được đăng</p>
              <p className="text-xs text-olive">Hãy chia sẻ công thức món chay tâm đắc của bạn với cộng đồng.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-hairline p-4 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                        {post.category || 'Món chay'}
                      </span>
                      <span className="text-[10px] text-olive font-metric">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                      </span>
                    </div>
                    <h3
                      onClick={() => onNavigate && onNavigate('article-detail', post)}
                      className="font-editorial text-base font-bold text-forest hover:text-emerald-700 cursor-pointer truncate"
                    >
                      {post.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('article-detail', post)}
                    className="p-2 rounded-xl border border-hairline hover:bg-slate-50 text-olive hover:text-forest transition cursor-pointer shrink-0"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: CÀI ĐẶT TÀI KHOẢN
      ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveAccount} className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-xs space-y-6 animate-fade-up">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <h2 className="font-editorial text-lg font-bold text-forest">Thông Tin Tài Khoản</h2>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-emerald-300" />
              <span>Lưu thay đổi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-forest block mb-1">Họ và tên</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-50 outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-forest block mb-1">Địa chỉ Email</label>
              <input
                type="email"
                value={accountEmail}
                disabled
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-100 text-slate-500 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-forest block mb-1">Số điện thoại</label>
              <input
                type="text"
                value={accountPhone}
                onChange={(e) => setAccountPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-50 outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-forest block mb-1">Mật khẩu mới (để trống nếu không đổi)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-hairline bg-slate-50 outline-none focus:border-forest"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
