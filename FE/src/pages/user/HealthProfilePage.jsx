import React, { useState } from 'react';
import {
  Activity, Sliders, Bookmark, Check, ArrowRight,
  ShieldCheck, Flame, Scale, User, Heart, Lock, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import RecipeCard from '../../components/recipes/RecipeCard';
import RecipeDetailModal from '../../components/recipes/RecipeDetailModal';

export default function HealthProfilePage({ onNavigate }) {
  const { user } = useAuth();
  const {
    profile,
    updateProfile,
    metrics,
    recipesDb,
    toggleSaveRecipe,
    showToast
  } = useVeggieNutrition();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'saved'
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);

  // Edit Form State
  const [editHeight, setEditHeight] = useState(profile?.height || 165);
  const [editWeight, setEditWeight] = useState(profile?.weight || 55);
  const [editDiet, setEditDiet] = useState(profile?.diet || 'Thuần chay (Vegan)');
  const [editAllergies, setEditAllergies] = useState(profile?.allergies || ['Đậu phộng']);

  // Guest Quick Calculator State
  const [guestHeight, setGuestHeight] = useState(165);
  const [guestWeight, setGuestWeight] = useState(55);

  const calculateQuickBmi = (h, w) => {
    const m = h / 100;
    const bmiVal = Number((w / (m * m)).toFixed(1));
    let cat = 'Bình thường';
    let color = 'text-emeraldBotanic bg-emerald-50 border-emerald-200';
    if (bmiVal < 18.5) {
      cat = 'Thiếu cân';
      color = 'text-blue-700 bg-blue-50 border-blue-200';
    } else if (bmiVal >= 23 && bmiVal < 25) {
      cat = 'Tiền thừa cân';
      color = 'text-amber-700 bg-amber-50 border-amber-200';
    } else if (bmiVal >= 25) {
      cat = 'Thừa cân / Béo phì';
      color = 'text-rose-700 bg-rose-50 border-rose-200';
    }
    return { bmi: bmiVal, category: cat, color };
  };

  const guestBmiResult = calculateQuickBmi(guestHeight, guestWeight);

  const savedRecipes = (recipesDb || []).filter(r => (profile?.savedRecipeIds || []).includes(r.id));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({
      ...profile,
      height: Number(editHeight),
      weight: Number(editWeight),
      diet: editDiet,
      allergies: editAllergies
    });
    setIsEditing(false);
    showToast('Đã cập nhật hồ sơ thể trạng thành công!');
  };

  const dietOptions = [
    'Thuần chay (Vegan)',
    'Chay trứng sữa (Vegetarian)',
    'Bán chay (Flexitarian)'
  ];

  const commonAllergies = ['Đậu phộng', 'Đậu nành', 'Gluten', 'Ngũ vị tân'];

  const toggleAllergy = (item) => {
    setEditAllergies(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-5xl mx-auto animate-fade-up">
      {/* ====================================================================
          1. GUEST PROMPT (NẾU CHƯA ĐĂNG NHẬP)
      ==================================================================== */}
      {!user && (
        <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emeraldBotanic/10 text-emeraldBotanic text-xs font-semibold mb-2">
                <Scale className="w-3.5 h-3.5" />
                <span>CÔNG CỤ TÍNH BMI CHUẨN WHO Á CHÂU</span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-forest">
                Kiểm Tra Thể Trạng & Chỉ Số Dinh Dưỡng
              </h1>
              <p className="text-xs sm:text-sm text-olive mt-1">
                Nhập chiều cao và cân nặng để đánh giá nhanh tình trạng dinh dưỡng và nhận lời khuyên ăn uống thực vật.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('login')}
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('register')}
                className="px-4 py-2 rounded-xl border border-hairline hover:bg-alabaster text-forest text-xs font-semibold transition cursor-pointer"
              >
                Đăng ký tài khoản
              </button>
            </div>
          </div>

          {/* Quick Calculator Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-forest flex justify-between">
                <span>Chiều cao</span>
                <strong className="text-emeraldBotanic">{guestHeight} cm</strong>
              </label>
              <input
                type="range"
                min="140"
                max="200"
                value={guestHeight}
                onChange={(e) => setGuestHeight(Number(e.target.value))}
                className="w-full accent-emeraldBotanic cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-forest flex justify-between">
                <span>Cân nặng</span>
                <strong className="text-emeraldBotanic">{guestWeight} kg</strong>
              </label>
              <input
                type="range"
                min="35"
                max="120"
                value={guestWeight}
                onChange={(e) => setGuestWeight(Number(e.target.value))}
                className="w-full accent-emeraldBotanic cursor-pointer"
              />
            </div>

            {/* Quick Result Badge */}
            <div className="p-4 rounded-2xl bg-alabaster border border-hairline text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-olive tracking-wider block">Kết Quả Đánh Giá</span>
              <div className="text-2xl font-editorial font-bold text-forest">
                BMI {guestBmiResult.bmi}
              </div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${guestBmiResult.color}`}>
                {guestBmiResult.category}
              </span>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-olive border-t border-hairline">
            💡 <strong>Đăng nhập tài khoản</strong> để lưu hồ sơ sức khỏe vĩnh viễn và nhận thực đơn 7 ngày cá nhân hóa tự động.
          </div>
        </div>
      )}

      {/* ====================================================================
          2. AUTHENTICATED USER PROFILE (NẾU ĐÃ ĐĂNG NHẬP)
      ==================================================================== */}
      {user && (
        <>
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-hairline">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emeraldBotanic/10 text-forest flex items-center justify-center font-editorial text-2xl font-bold border border-emeraldBotanic/20 shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'V'}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-editorial text-2xl font-bold text-forest">
                      {user.name || 'Người dùng VeggieAI'}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emeraldBotanic/10 text-emeraldBotanic text-xs font-semibold">
                      {profile?.diet || 'Thuần chay'}
                    </span>
                  </div>
                  <p className="text-xs text-olive font-metric">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isEditing ? 'Đóng Chỉnh Sửa' : 'Chỉnh Sửa Chỉ Số'}</span>
                </button>
              </div>
            </div>

            {/* 4 Clean Metric Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-olive block">Chỉ Số BMI (WHO)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-metric text-2xl font-bold text-forest">{metrics.bmi}</span>
                  <span className="text-[10px] font-semibold text-emeraldBotanic bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {metrics.category}
                  </span>
                </div>
                <span className="text-[10px] text-olive font-metric block">Chuẩn: 18.5 – 22.9</span>
              </div>

              <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-olive block">Chiều Cao & Cân Nặng</span>
                <div className="font-metric text-lg sm:text-xl font-bold text-forest">
                  {profile?.height || 165} cm • {profile?.weight || 55} kg
                </div>
                <span className="text-[10px] text-olive block">
                  {profile?.gender === 'male' ? 'Nam' : 'Nữ'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-olive block">Năng Lượng Khuyến Nghị</span>
                <div className="font-metric text-lg sm:text-xl font-bold text-forest">
                  {metrics.tdee} <span className="text-xs text-olive font-normal">kcal/ngày</span>
                </div>
                <span className="text-[10px] text-olive block">BMR: {metrics.bmr} kcal</span>
              </div>

              <div className="p-4 rounded-2xl bg-alabaster border border-hairline space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-olive block">Mục Tiêu Đạm Thực Vật</span>
                <div className="font-metric text-lg sm:text-xl font-bold text-emeraldBotanic">
                  {metrics.targetProtein} <span className="text-xs text-olive font-normal">g/ngày</span>
                </div>
                <span className="text-[10px] text-olive block">
                  ~{(metrics.targetProtein / (profile?.weight || 55)).toFixed(1)}g / kg thể trọng
                </span>
              </div>
            </div>

            {/* Dietary & Allergies Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-forest">Chế độ ăn:</span>
                <span className="px-3 py-1 rounded-full bg-emeraldBotanic/10 text-emeraldBotanic font-bold">
                  {profile?.diet || 'Thuần chay (Vegan)'}
                </span>

                <span className="font-semibold text-forest ml-3">Dị ứng:</span>
                {(profile?.allergies || []).length > 0 ? (
                  (profile?.allergies || []).map(a => (
                    <span key={a} className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-olive italic">Không có dị ứng</span>
                )}
              </div>

              {/* Navigation Pill for Saved Recipes */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'profile' ? 'bg-forest text-white' : 'text-olive hover:text-forest'
                  }`}
                >
                  Thể trạng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'saved' ? 'bg-forest text-white' : 'text-olive hover:text-forest'
                  }`}
                >
                  Món đã lưu ({savedRecipes.length})
                </button>
              </div>
            </div>
          </div>

          {/* ====================================================================
              3. EDIT SLIDE-DOWN FORM
          ==================================================================== */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-card space-y-5 animate-fade-up">
              <div className="border-b border-hairline pb-3 flex items-center justify-between">
                <h3 className="font-editorial text-lg font-bold text-forest">
                  Cập Nhật Chỉ Số Thể Trạng
                </h3>
                <span className="text-xs text-olive">Dữ liệu sẽ được tự động tính toán lại BMI & TDEE</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-forest flex justify-between">
                    <span>Chiều cao (cm)</span>
                    <strong className="text-emeraldBotanic">{editHeight} cm</strong>
                  </label>
                  <input
                    type="range"
                    min="140"
                    max="200"
                    value={editHeight}
                    onChange={(e) => setEditHeight(e.target.value)}
                    className="w-full accent-emeraldBotanic cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-forest flex justify-between">
                    <span>Cân nặng (kg)</span>
                    <strong className="text-emeraldBotanic">{editWeight} kg</strong>
                  </label>
                  <input
                    type="range"
                    min="35"
                    max="120"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-full accent-emeraldBotanic cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-forest block">Chế độ ăn</label>
                <div className="flex flex-wrap gap-2">
                  {dietOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEditDiet(opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        editDiet === opt
                          ? 'bg-forest text-white'
                          : 'bg-alabaster border border-hairline text-olive hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-forest block">Khai báo chất gây dị ứng (Allergen Guard)</label>
                <div className="flex flex-wrap gap-2">
                  {commonAllergies.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAllergy(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        editAllergies.includes(item)
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold'
                          : 'bg-alabaster border border-hairline text-olive hover:bg-slate-200'
                      }`}
                    >
                      {editAllergies.includes(item) ? `✓ ${item}` : item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-hairline text-xs font-semibold text-olive hover:bg-alabaster transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          )}

          {/* ====================================================================
              4. SAVED RECIPES TAB
          ==================================================================== */}
          {activeTab === 'saved' && (
            <div className="space-y-4 animate-fade-up">
              <h2 className="font-editorial text-xl font-bold text-forest">
                Món Ăn Yêu Thích Đã Lưu ({savedRecipes.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onOpenDetail={setSelectedRecipeDetail}
                    isSaved={true}
                    onToggleSave={toggleSaveRecipe}
                  />
                ))}
              </div>

              {savedRecipes.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-hairline p-8 space-y-2">
                  <p className="text-xs text-olive">Bạn chưa lưu món ăn nào vào danh sách yêu thích.</p>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('home')}
                    className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forestDark transition"
                  >
                    Khám phá công thức món chay
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          isSaved={(profile?.savedRecipeIds || []).includes(selectedRecipeDetail.id)}
          onToggleSave={toggleSaveRecipe}
        />
      )}
    </div>
  );
}
