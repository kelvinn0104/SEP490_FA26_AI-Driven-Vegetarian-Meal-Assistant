import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, Activity, FileText, Settings, User, 
  ArrowLeft, CheckCircle2, Clock, AlertCircle, Plus, 
  Edit3, Trash2, Eye, Sparkles, ShieldCheck, Scale, 
  Flame, Droplets, Target, Save, Lock, Mail, Phone,
  Camera, X, ChefHat, BookOpen, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function UserAccountPage({ defaultTab = 'profile', onNavigate }) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveSubTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSubTab]);

  // ==========================================
  // STATE 1: HỒ SƠ SỨC KHỎE CỦA TÔI
  // ==========================================
  const [healthProfile, setHealthProfile] = useState({
    gender: 'Nam',
    age: 26,
    height: 168, // cm
    weight: 60.5, // kg
    activityLevel: 'Vừa phải (Tập luyện 3-4 buổi/tuần)',
    dietType: 'Thuần chay (Vegan)',
    healthGoal: 'Duy trì vóc dáng & Bổ sung Protein cơ bắp',
    targetCalories: 1850,
    targetProtein: 65, // grams
    allergies: ['Đậu phộng (Lạc)'],
    dislikes: ['Mướp đắng (Khổ qua)']
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // TÍNH TOÁN BMI TỰ ĐỘNG
  const heightInMeters = healthProfile.height / 100;
  const calculatedBMI = (healthProfile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Thiếu cân', color: '#3b82f6', bg: '#eff6ff' };
    if (bmi <= 24.9) return { label: 'Thể trạng lý tưởng', color: '#059669', bg: '#ecfdf5' };
    if (bmi <= 29.9) return { label: 'Tiền thừa cân', color: '#f59e0b', bg: '#fffbeb' };
    return { label: 'Thừa cân', color: '#ef4444', bg: '#fef2f2' };
  };
  const bmiStatus = getBMICategory(calculatedBMI);

  const handleSaveHealthProfile = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // ==========================================
  // STATE 2: DASHBOARD DINH DƯỠNG (7 NGÀY)
  // ==========================================
  const nutritionDays = [
    { day: 'Thứ 2 (16/9)', calories: 1820, target: 1850, protein: 62, targetProt: 65, iron: 14.5, b12: 2.4, status: 'Đạt chuẩn' },
    { day: 'Thứ 3 (17/9)', calories: 1790, target: 1850, protein: 64, targetProt: 65, iron: 15.1, b12: 2.6, status: 'Đạt chuẩn' },
    { day: 'Hôm nay (18/9)', calories: 1350, target: 1850, protein: 52, targetProt: 65, iron: 12.8, b12: 2.2, status: 'Đang tiến hành' },
    { day: 'Thứ 5 (19/9)', calories: '-', target: 1850, protein: '-', targetProt: 65, iron: '-', b12: '-', status: 'Kế hoạch' },
    { day: 'Thứ 6 (20/9)', calories: '-', target: 1850, protein: '-', targetProt: 65, iron: '-', b12: '-', status: 'Kế hoạch' },
    { day: 'Thứ 7 (21/9)', calories: '-', target: 1850, protein: '-', targetProt: 65, iron: '-', b12: '-', status: 'Kế hoạch' },
    { day: 'Chủ Nhật (22/9)', calories: '-', target: 1850, protein: '-', targetProt: 65, iron: '-', b12: '-', status: 'Kế hoạch' },
  ];

  // ==========================================
  // STATE 3: BÀI VIẾT CỦA TÔI
  // ==========================================
  const [myPosts, setMyPosts] = useState([
    {
      id: 'p1',
      title: 'Bí quyết tự ủ Tempeh đậu nành truyền thống tại nhà chuẩn vị',
      type: 'Blog ẩm thực',
      createdAt: '18/09/2026 - 13:45',
      status: 'pending', // pending, approved, draft
      statusLabel: 'Đang chờ Mod duyệt',
      views: 0,
      likes: 0,
      comments: 0,
      thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      feedback: 'Bài viết đang nằm trong hàng chờ duyệt của Kiểm duyệt viên Lê Tuệ Tâm.'
    },
    {
      id: 'p2',
      title: 'Salad Cải Xoăn Nấm Hầu Thủ Sốt Mè Rang Giàu Đạm Thực Vật',
      type: 'Công thức nấu ăn',
      createdAt: '14/09/2026 - 09:20',
      status: 'approved',
      statusLabel: 'Đã xuất bản',
      views: 420,
      likes: 38,
      comments: 12,
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
      feedback: 'Đã duyệt bởi Moderator. Bài viết đang hiển thị trên trang Blog cộng đồng.'
    },
    {
      id: 'p3',
      title: 'Thực đơn 3 ngày thanh lọc cơ thể với nước dùng thực dưỡng củ sen',
      type: 'Blog dinh dưỡng',
      createdAt: '08/09/2026 - 16:10',
      status: 'approved',
      statusLabel: 'Đã xuất bản',
      views: 980,
      likes: 74,
      comments: 29,
      thumbnail: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
      feedback: 'Đã xuất bản thành công.'
    }
  ]);

  // MODAL VIẾT BÀI MỚI
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostType, setNewPostType] = useState('Blog');
  const [newPostContent, setNewPostContent] = useState('');
  const [postSubmitted, setPostSubmitted] = useState(false);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;

    const newPost = {
      id: `p-${Date.now()}`,
      title: newPostTitle,
      type: newPostType === 'Blog' ? 'Blog ẩm thực' : 'Công thức nấu ăn',
      createdAt: 'Vừa xong',
      status: 'pending',
      statusLabel: 'Đang chờ Mod duyệt',
      views: 0,
      likes: 0,
      comments: 0,
      thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
      feedback: 'Bài viết đã được gửi vào hàng chờ duyệt của Kiểm duyệt viên.'
    };

    setMyPosts([newPost, ...myPosts]);
    setPostSubmitted(true);
    setTimeout(() => {
      setPostSubmitted(false);
      setShowCreateModal(false);
      setNewPostTitle('');
      setNewPostContent('');
    }, 1500);
  };

  // ==========================================
  // STATE 4: CÀI ĐẶT TÀI KHOẢN
  // ==========================================
  const [accountInfo, setAccountInfo] = useState({
    name: user?.name || 'Thành Viên Thuần Chay',
    email: user?.email || 'user@veggieai.vn',
    phone: '0912 345 678',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotification: true,
    weeklyMealReminder: true
  });
  const [accountSaved, setAccountSaved] = useState(false);

  const handleSaveAccount = (e) => {
    e.preventDefault();
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      {/* TOP BREADCRUMB & BACK BUTTON */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => onNavigate && onNavigate('home')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.5rem 0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <ArrowLeft size={16} /> Về Trang chủ
          </button>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>Không gian cá nhân hội viên</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', background: '#ecfdf5', color: '#047857', padding: '4px 12px', borderRadius: '16px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
            🌱 {user?.roleLabel || 'Thành viên chính thức'}
          </span>
        </div>
      </div>

      {/* 4 HORIZONTAL TABS MATCHING AVATAR DROPDOWN */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '0.45rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        overflowX: 'auto'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeSubTab === 'profile' ? '#059669' : 'transparent',
            color: activeSubTab === 'profile' ? '#ffffff' : '#64748b',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <HeartPulse size={18} />
          <span>1. Hồ sơ sức khỏe của tôi</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('user-nutrition') : setActiveSubTab('nutrition')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeSubTab === 'nutrition' ? '#059669' : 'transparent',
            color: activeSubTab === 'nutrition' ? '#ffffff' : '#64748b',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Activity size={18} />
          <span>2. Dashboard dinh dưỡng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('posts')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeSubTab === 'posts' ? '#059669' : 'transparent',
            color: activeSubTab === 'posts' ? '#ffffff' : '#64748b',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={18} />
          <span>3. Bài viết của tôi</span>
          {myPosts.filter(p => p.status === 'pending').length > 0 && (
            <span style={{ background: activeSubTab === 'posts' ? '#ffffff' : '#f59e0b', color: activeSubTab === 'posts' ? '#d97706' : '#ffffff', fontSize: '0.72rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
              {myPosts.filter(p => p.status === 'pending').length} chờ
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('settings')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeSubTab === 'settings' ? '#059669' : 'transparent',
            color: activeSubTab === 'settings' ? '#ffffff' : '#64748b',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Settings size={18} />
          <span>4. Cài đặt tài khoản</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HỒ SƠ SỨC KHỎE CỦA TÔI (BMI, MỤC TIÊU, DỊ ỨNG) */}
      {/* ========================================================================= */}
      {activeSubTab === 'profile' && (
        <div>
          {/* HEADER CARD: TỔNG QUAN THỂ TRẠNG BMI */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: '20px',
            padding: '2rem',
            color: 'white',
            marginBottom: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            boxShadow: '0 10px 25px rgba(5, 150, 105, 0.2)'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '14px', fontWeight: 700, letterSpacing: '0.5px' }}>
                HỒ SƠ THỂ TRẠNG & DINH DƯỠNG CÁ NHÂN
              </span>
              <h2 style={{ fontSize: '1.85rem', margin: '0.75rem 0 0.5rem 0', fontWeight: 800 }}>
                {user?.name || 'Thành Viên Thuần Chay'}
              </h2>
              <p style={{ opacity: 0.9, fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '520px' }}>
                Chỉ số sức khỏe của bạn được AI Meal Planner sử dụng trực tiếp để tối ưu hóa tỷ lệ vi chất (Sắt hữu cơ, Vitamin B12) và đạm thực vật mỗi ngày.
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.65rem 1.15rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Chiều cao</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{healthProfile.height} cm</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.65rem 1.15rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Cân nặng</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{healthProfile.weight} kg</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.65rem 1.15rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Mục tiêu Calo/ngày</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{healthProfile.targetCalories} kcal</div>
                </div>
              </div>
            </div>

            {/* BMI SCORE CARD */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              color: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>CHỈ SỐ KHỐI CƠ THỂ (BMI)</span>
                <span style={{ background: bmiStatus.bg, color: bmiStatus.color, fontSize: '0.8rem', padding: '3px 10px', borderRadius: '10px', fontWeight: 800 }}>
                  {bmiStatus.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#047857' }}>{calculatedBMI}</span>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>kg/m²</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Thể trạng của bạn đang ở mức lý tưởng. Thuật toán gợi ý duy trì <strong>{healthProfile.targetProtein}g Protein</strong> và bổ sung tối thiểu <strong>2.4 mcg B12</strong> mỗi ngày.
              </p>
            </div>
          </div>

          {/* FORM CẬP NHẬT HỒ SƠ SỨC KHỎE */}
          <Card style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: '#0f172a', fontSize: '1.25rem', margin: 0 }}>Cập nhật thông số thể trạng & Kiêng cữ</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem' }}>Thay đổi các chỉ số bên dưới sẽ tự động cập nhật lại thực đơn 7 ngày của bạn.</p>
              </div>

              {profileSaved && (
                <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> Đã lưu thông tin hồ sơ sức khỏe thành công!
                </div>
              )}
            </div>

            <form onSubmit={handleSaveHealthProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                {/* Giới tính */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Giới tính</label>
                  <select 
                    value={healthProfile.gender}
                    onChange={(e) => setHealthProfile({ ...healthProfile, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                {/* Tuổi */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Tuổi</label>
                  <input 
                    type="number" 
                    value={healthProfile.age}
                    onChange={(e) => setHealthProfile({ ...healthProfile, age: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Chiều cao */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Chiều cao (cm)</label>
                  <input 
                    type="number" 
                    value={healthProfile.height}
                    onChange={(e) => setHealthProfile({ ...healthProfile, height: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Cân nặng */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Cân nặng (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={healthProfile.weight}
                    onChange={(e) => setHealthProfile({ ...healthProfile, weight: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Mức độ vận động */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Mức độ vận động hàng tuần</label>
                  <select 
                    value={healthProfile.activityLevel}
                    onChange={(e) => setHealthProfile({ ...healthProfile, activityLevel: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="Ít vận động (Dân văn phòng)">Ít vận động (Dân văn phòng)</option>
                    <option value="Vừa phải (Tập luyện 3-4 buổi/tuần)">Vừa phải (Tập luyện 3-4 buổi/tuần)</option>
                    <option value="Năng động cao (Tập luyện 5-6 buổi/tuần)">Năng động cao (Tập luyện 5-6 buổi/tuần)</option>
                  </select>
                </div>

                {/* Loại hình ăn chay */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Trường phái ăn chay</label>
                  <select 
                    value={healthProfile.dietType}
                    onChange={(e) => setHealthProfile({ ...healthProfile, dietType: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="Thuần chay (Vegan)">Thuần chay hoàn toàn (Vegan)</option>
                    <option value="Chay có trứng & sữa (Ovo-Lacto)">Chay có trứng & sữa (Ovo-Lacto)</option>
                    <option value="Chay thực dưỡng Ohsawa (Macrobiotic)">Chay thực dưỡng Ohsawa (Macrobiotic)</option>
                  </select>
                </div>

                {/* Mục tiêu sức khỏe */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Mục tiêu dinh dưỡng chính</label>
                  <select 
                    value={healthProfile.healthGoal}
                    onChange={(e) => setHealthProfile({ ...healthProfile, healthGoal: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="Duy trì vóc dáng & Bổ sung Protein cơ bắp">Duy trì vóc dáng & Tăng đạm thực vật</option>
                    <option value="Giảm cân an toàn & Thanh lọc cơ thể">Giảm cân an toàn & Thanh lọc cơ thể</option>
                    <option value="Tăng cân lành mạnh thuần thực vật">Tăng cân lành mạnh thuần thực vật</option>
                    <option value="Hỗ trợ tim mạch & Huyết áp ổn định">Hỗ trợ tim mạch & Huyết áp ổn định</option>
                  </select>
                </div>

                {/* Nhu cầu Calo mục tiêu */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Calo mục tiêu (kcal/ngày)</label>
                  <input 
                    type="number" 
                    value={healthProfile.targetCalories}
                    onChange={(e) => setHealthProfile({ ...healthProfile, targetCalories: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* DỊ ỨNG & THỰC PHẨM KIÊNG CỮ */}
              <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <h4 style={{ color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={18} color="#ef4444" /> Dị ứng & Thực phẩm kiêng kỵ
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  AI Meal Planner sẽ tuyệt đối loại bỏ những nguyên liệu này khỏi thực đơn và các đề xuất món ăn của bạn.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    🚫 Đậu phộng (Lạc)
                  </span>
                  <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    🚫 Mướp đắng (Khổ qua)
                  </span>
                  <button 
                    type="button"
                    onClick={() => alert('Chức năng thêm nguyên liệu kiêng cữ mới: Bạn có thể nhập thêm Gluten, Đậu nành, Hành hẹ (Ngũ vị tân)...')}
                    style={{ background: '#ffffff', border: '1px dashed #94a3b8', color: '#475569', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Thêm kiêng cữ khác
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="secondary" type="button" onClick={() => onNavigate && onNavigate('planner')}>
                  Xem Thực đơn của tôi →
                </Button>
                <Button variant="primary" type="submit">
                  <Save size={16} /> Lưu & Cập nhật Hồ Sơ
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DASHBOARD DINH DƯỠNG (THEO DÕI XU HƯỚNG DINH DƯỠNG) */}
      {/* ========================================================================= */}
      {activeSubTab === 'nutrition' && (
        <div>
          {/* HEADER SUMMARY */}
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.82rem', background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '14px', fontWeight: 700 }}>
              DASHBOARD THEO DÕI DINH DƯỠNG & VI CHẤT
            </span>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '0.5rem 0 0.25rem 0', fontWeight: 800 }}>
              Xu hướng nạp năng lượng & Đạm thực vật tuần này
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              Biểu đồ trực quan giúp bạn kiểm soát nguy cơ thiếu hụt Protein, Sắt và Vitamin B12 trong chế độ thuần chay.
            </p>
          </div>

          {/* 3 METRIC CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <Card style={{ padding: '1.5rem', borderLeft: '5px solid #059669' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>ĐẠM THỰC VẬT TRUNG BÌNH</span>
                <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '8px', fontWeight: 800 }}>ĐẠT 95%</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>63.0g <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ 65g mục tiêu</span></div>
              <p style={{ fontSize: '0.82rem', color: '#047857', margin: 0 }}>
                ✅ Rất tốt! Nguồn đạm phong phú từ Tempeh, Quinoa, hạt gai dầu và đậu gà.
              </p>
            </Card>

            <Card style={{ padding: '1.5rem', borderLeft: '5px solid #2563eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>SẮT HỮU CƠ (NON-HEME)</span>
                <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '8px', fontWeight: 800 }}>ĐẠT 98%</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>14.8mg <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ 15mg</span></div>
              <p style={{ fontSize: '0.82rem', color: '#1d4ed8', margin: 0 }}>
                💡 Hấp thụ tối ưu nhờ phối hợp ớt chuông và nước chanh giàu Vitamin C.
              </p>
            </Card>

            <Card style={{ padding: '1.5rem', borderLeft: '5px solid #d97706' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>VITAMIN B12 THIẾT YẾU</span>
                <span style={{ background: '#fffbeb', color: '#d97706', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '8px', fontWeight: 800 }}>100% ĐẦY ĐỦ</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>2.5 mcg <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/ 2.4 mcg</span></div>
              <p style={{ fontSize: '0.82rem', color: '#b45309', margin: 0 }}>
                🌱 Hoàn toàn an tâm: bổ sung đều đặn từ Men dinh dưỡng (Nutritional Yeast).
              </p>
            </Card>
          </div>

          {/* TABLE LOG THEO NGÀY */}
          <Card style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '1.25rem' }}>Chi tiết nhật ký dinh dưỡng 7 ngày trong tuần</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Ngày</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Năng lượng (Calo)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Đạm (Protein)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Sắt hữu cơ</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Vitamin B12</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionDays.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>{row.day}</td>
                      <td style={{ padding: '1rem', color: '#334155' }}>
                        {row.calories !== '-' ? `${row.calories} / ${row.target} kcal` : '—'}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#059669' }}>
                        {row.protein !== '-' ? `${row.protein}g / ${row.targetProt}g` : '—'}
                      </td>
                      <td style={{ padding: '1rem', color: '#334155' }}>
                        {row.iron !== '-' ? `${row.iron} mg` : '—'}
                      </td>
                      <td style={{ padding: '1rem', color: '#334155' }}>
                        {row.b12 !== '-' ? `${row.b12} mcg` : '—'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: row.status === 'Đạt chuẩn' ? '#ecfdf5' : row.status === 'Đang tiến hành' ? '#eff6ff' : '#f8fafc',
                          color: row.status === 'Đạt chuẩn' ? '#047857' : row.status === 'Đang tiến hành' ? '#2563eb' : '#94a3b8'
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                💡 Bạn muốn điều chỉnh định lượng khẩu phần? Dùng tính năng Thực đơn của tôi để AI tính lại.
              </span>
              <Button onClick={() => onNavigate && onNavigate('planner')}>
                Mở Thực đơn của tôi (7 ngày) →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BÀI VIẾT CỦA TÔI (QUẢN LÝ BÀI ĐĂNG CÁ NHÂN & VIẾT BÀI MỚI) */}
      {/* ========================================================================= */}
      {activeSubTab === 'posts' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '14px', fontWeight: 700 }}>
                QUẢN LÝ NỘI DUNG CỘNG ĐỒNG CỦA TÔI
              </span>
              <h2 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '0.5rem 0 0.25rem 0', fontWeight: 800 }}>
                Bài viết & Công thức đã chia sẻ
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
                Theo dõi tiến độ kiểm duyệt từ Moderator và phản hồi từ cộng đồng ăn chay.
              </p>
            </div>

            {/* NÚT VIẾT BÀI MỚI NỔI BẬT THEO ĐÚNG PHÂN TÍCH */}
            <Button variant="primary" onClick={() => onNavigate ? onNavigate('create-post') : setShowCreateModal(true)}>
              <Plus size={16} /> Viết bài / Đăng công thức mới ✍️
            </Button>
          </div>

          {/* POSTS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {myPosts.map((post) => (
              <Card key={post.id} style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  width: '120px',
                  height: '90px',
                  backgroundImage: `url('${post.thumbnail}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '12px',
                  flexShrink: 0
                }} />

                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: post.status === 'approved' ? '#ecfdf5' : '#fef3c7',
                      color: post.status === 'approved' ? '#047857' : '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {post.status === 'approved' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                      {post.statusLabel}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>• {post.type}</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>• Gửi ngày {post.createdAt}</span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {post.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, fontStyle: 'italic' }}>
                    💬 {post.feedback}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}>
                  {post.status === 'approved' && (
                    <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <div>
                        <strong style={{ color: '#0f172a', display: 'block', fontSize: '1rem' }}>{post.views}</strong>
                        <span>Lượt đọc</span>
                      </div>
                      <div>
                        <strong style={{ color: '#059669', display: 'block', fontSize: '1rem' }}>{post.likes}</strong>
                        <span>Thích</span>
                      </div>
                      <div>
                        <strong style={{ color: '#2563eb', display: 'block', fontSize: '1rem' }}>{post.comments}</strong>
                        <span>Bình luận</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button 
                      variant="secondary" 
                      onClick={() => alert(`Xem trước nội dung: ${post.title}`)}
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                    >
                      <Eye size={14} /> Xem
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* MODAL VIẾT BÀI / ĐĂNG CÔNG THỨC */}
          {showCreateModal && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
            }}>
              <div style={{
                background: 'white', borderRadius: '24px', maxWidth: '640px', width: '100%', maxHeight: '90vh',
                overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={20} />
                </button>

                <span className="badge badge-ai">ĐÓNG GÓP CỘNG ĐỒNG</span>
                <h2 style={{ color: '#0f172a', margin: '0.5rem 0 0.25rem 0' }}>Soạn Thảo Bài Viết / Công Thức Mới</h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                  Bài viết của bạn sẽ được gửi tới Kiểm duyệt viên (Moderator) phê duyệt trước khi hiển thị công khai trên Blog & Video.
                </p>

                {postSubmitted ? (
                  <div style={{ padding: '2rem', background: '#ecfdf5', borderRadius: '16px', textAlign: 'center', color: '#047857' }}>
                    <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                    <h3 style={{ margin: 0 }}>Gửi bài viết thành công!</h3>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Bài viết đã được chuyển vào hàng chờ kiểm duyệt.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreatePost}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Phân loại nội dung
                      </label>
                      <select 
                        value={newPostType}
                        onChange={(e) => setNewPostType(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      >
                        <option value="Blog">Bài viết Blog chia sẻ kinh nghiệm / Dinh dưỡng</option>
                        <option value="Recipe">Công thức nấu món chay</option>
                        <option value="Video">Video hướng dẫn nấu ăn</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Tiêu đề bài viết
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="VD: Cách nấu canh chua nấm bạc hà thanh mát chuẩn vị Nam Bộ..."
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Nội dung chi tiết / Nguyên liệu & Các bước thực hiện
                      </label>
                      <textarea 
                        rows={6}
                        required
                        placeholder="Mô tả nguyên liệu, định lượng gia vị và các bước nấu ăn chi tiết..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
                        Hủy
                      </Button>
                      <Button variant="primary" type="submit">
                        <Send size={16} /> Gửi duyệt bài viết
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CÀI ĐẶT TÀI KHOẢN (ĐỔI MẬT KHẨU, THÔNG TIN CÁ NHÂN) */}
      {/* ========================================================================= */}
      {activeSubTab === 'settings' && (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.82rem', background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '14px', fontWeight: 700 }}>
              CÀI ĐẶT & BẢO MẬT TÀI KHOẢN
            </span>
            <h2 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '0.5rem 0 0.25rem 0', fontWeight: 800 }}>
              Thông tin cá nhân & Mật khẩu
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              Quản lý thông tin đăng nhập, bảo mật và các tùy chọn thông báo của tài khoản.
            </p>
          </div>

          <Card style={{ padding: '2rem', maxWidth: '780px' }}>
            {accountSaved && (
              <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.65rem 1rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700, border: '1px solid #a7f3d0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Đã lưu cài đặt tài khoản thành công!
              </div>
            )}

            <form onSubmit={handleSaveAccount}>
              <h4 style={{ color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                1. Thông tin cá nhân
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Họ và tên hiển thị
                  </label>
                  <input 
                    type="text" 
                    value={accountInfo.name}
                    onChange={(e) => setAccountInfo({ ...accountInfo, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Địa chỉ Email
                  </label>
                  <input 
                    type="email" 
                    value={accountInfo.email}
                    onChange={(e) => setAccountInfo({ ...accountInfo, email: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Số điện thoại liên kết
                  </label>
                  <input 
                    type="text" 
                    value={accountInfo.phone}
                    onChange={(e) => setAccountInfo({ ...accountInfo, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <h4 style={{ color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                2. Thay đổi mật khẩu
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Mật khẩu hiện tại
                  </label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={accountInfo.currentPassword}
                    onChange={(e) => setAccountInfo({ ...accountInfo, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Mật khẩu mới
                  </label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={accountInfo.newPassword}
                    onChange={(e) => setAccountInfo({ ...accountInfo, newPassword: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="primary" type="submit">
                  <Save size={16} /> Lưu thay đổi cài đặt
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
