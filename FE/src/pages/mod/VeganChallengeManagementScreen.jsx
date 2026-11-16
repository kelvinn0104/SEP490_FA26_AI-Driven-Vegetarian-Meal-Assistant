import React, { useState, useEffect } from 'react';
import { challengesApi } from '../../api';

export const VeganChallengeManagementScreen = () => {
  // Main state
  const [challenges, setChallenges] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [stats, setStats] = useState({
    totalChallenges: 3,
    activeChallenges: 2,
    totalParticipants: 442,
    pendingCheckins: 5,
    avgCompletionRate: 78.5,
  });
  const [loading, setLoading] = useState(true);

  // Tabs & filters
  const [mainTab, setMainTab] = useState('challenges'); // 'challenges' | 'checkins'
  const [challengeStatusFilter, setChallengeStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [checkinStatusFilter, setCheckinStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Challenge form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDurationDays, setFormDurationDays] = useState(21);
  const [formCategory, setFormCategory] = useState('beginner');
  const [formDifficulty, setFormDifficulty] = useState('easy');
  const [formBadgeName, setFormBadgeName] = useState('Mầm Xanh Kiên Trì');
  const [formBadgeIcon, setFormBadgeIcon] = useState('emoji_events');
  const [formBannerUrl, setFormBannerUrl] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [formTasks, setFormTasks] = useState([
    'Ăn 100% bữa ăn thuần thực vật trong ngày',
    'Bổ sung tối thiểu 30g chất xơ tự nhiên',
    'Uống đủ 2 - 2.5 lít nước ấm',
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [formNutritionistNote, setFormNutritionistNote] = useState('');

  // Review check-in modal
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [challengeList, statData, checkinList] = await Promise.all([
        challengesApi.getChallenges({
          status: challengeStatusFilter !== 'all' ? challengeStatusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
          search: searchQuery || undefined,
        }),
        challengesApi.getStats(),
        challengesApi.getCheckinsQueue({
          status: checkinStatusFilter !== 'all' ? checkinStatusFilter : undefined,
          search: searchQuery || undefined,
        }),
      ]);

      setChallenges(challengeList || []);
      if (statData) setStats(statData);
      setCheckins(checkinList || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu thử thách lối sống chay:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mainTab, challengeStatusFilter, categoryFilter, difficultyFilter, checkinStatusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setFormTitle('');
    setFormDescription('');
    setFormDurationDays(21);
    setFormCategory('beginner');
    setFormDifficulty('easy');
    setFormBadgeName('Mầm Xanh Kiên Trì');
    setFormBadgeIcon('emoji_events');
    setFormBannerUrl('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80');
    setFormStatus('active');
    setFormTasks([
      'Ăn 100% bữa ăn thuần thực vật',
      'Đảm bảo 1 nguồn đạm thực vật chính (Đậu phụ, Tempeh, Hạt diêm mạch)',
      'Chụp ảnh mâm cơm chay đăng lên nhật ký check-in',
    ]);
    setFormNutritionistNote('Lời khuyên Mod: Nên ngâm kỹ các loại đậu trước khi nấu để giảm phytate và giúp hấp thu sắt tối đa.');
    setIsChallengeModalOpen(true);
  };

  const handleOpenEdit = (challenge) => {
    setEditingChallenge(challenge);
    setFormTitle(challenge.title);
    setFormDescription(challenge.description);
    setFormDurationDays(challenge.durationDays);
    setFormCategory(challenge.category);
    setFormDifficulty(challenge.difficulty);
    setFormBadgeName(challenge.badgeName || 'Mầm Xanh');
    setFormBadgeIcon(challenge.badgeIcon || 'military_tech');
    setFormBannerUrl(challenge.bannerUrl || '');
    setFormStatus(challenge.status);
    setFormTasks(challenge.dailyTasks && challenge.dailyTasks.length > 0 ? [...challenge.dailyTasks] : []);
    setFormNutritionistNote(challenge.nutritionistNote || '');
    setIsChallengeModalOpen(true);
  };

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    setFormTasks([...formTasks, newTaskInput.trim()]);
    setNewTaskInput('');
  };

  const handleRemoveTask = (index) => {
    setFormTasks(formTasks.filter((_, i) => i !== index));
  };

  const handleSaveChallenge = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tên thử thách');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        durationDays: parseInt(formDurationDays, 10) || 7,
        category: formCategory,
        difficulty: formDifficulty,
        badgeName: formBadgeName.trim(),
        badgeIcon: formBadgeIcon.trim(),
        bannerUrl: formBannerUrl.trim(),
        status: formStatus,
        dailyTasks: formTasks,
        nutritionistNote: formNutritionistNote.trim(),
      };

      if (editingChallenge) {
        await challengesApi.updateChallenge(editingChallenge.id, payload);
        alert('Cập nhật thử thách thành công!');
      } else {
        await challengesApi.createChallenge(payload);
        alert('Tạo thử thách mới thành công!');
      }

      setIsChallengeModalOpen(false);
      await fetchData();
    } catch (err) {
      alert(`Lỗi khi lưu thử thách: ${err.message || 'Lỗi server'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChallenge = async (challenge) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xoá chiến dịch thử thách "${challenge.title}"?`)) {
      return;
    }

    try {
      await challengesApi.deleteChallenge(challenge.id);
      alert('Đã xoá thử thách thành công');
      await fetchData();
    } catch (err) {
      alert(`Lỗi khi xoá: ${err.message || 'Lỗi server'}`);
    }
  };

  const handleOpenReview = (checkin) => {
    setSelectedCheckin(checkin);
    setReviewDecision('approved');
    setReviewComment('Mâm cơm thuần chay màu sắc đẹp, đa dạng đạm thực vật và chất xơ. Điểm danh hợp lệ!');
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!selectedCheckin) return;

    try {
      setIsSubmitting(true);
      await challengesApi.reviewCheckin(selectedCheckin.id, {
        decision: reviewDecision,
        nutritionistComment: reviewComment.trim(),
      });

      alert(`Đã ${reviewDecision === 'approved' ? 'duyệt' : 'từ chối'} lượt check-in của ${selectedCheckin.userName}!`);
      setSelectedCheckin(null);
      await fetchData();
    } catch (err) {
      alert(`Lỗi khi duyệt check-in: ${err.message || 'Lỗi server'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang diễn ra
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Sắp mở
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <span className="material-symbols-outlined text-[14px]">done_all</span>
            Đã kết thúc
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant">
            Bản nháp
          </span>
        );
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'beginner':
        return <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">Khởi đầu Chay</span>;
      case 'fitness':
        return <span className="text-xs px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-medium">Đạm Cao & Thể Thao</span>;
      case 'detox':
        return <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-medium">Thanh lọc Xanh</span>;
      case 'sugar_free':
        return <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">Giảm Đường Tinh Luyện</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">Thói Quen Sống Khỏe</span>;
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'easy':
        return <span className="text-xs text-emerald-600 font-medium">Dễ tiếp cận</span>;
      case 'medium':
        return <span className="text-xs text-amber-600 font-medium">Trung bình</span>;
      case 'hard':
        return <span className="text-xs text-rose-600 font-medium">Nâng cao</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Mod Role Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-emerald-900/10 via-emerald-800/5 to-transparent p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm mb-1">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            Bảng Điều Phối Thử Thách & Trại Thói Quen (Chuyên gia Dinh dưỡng VeggieAI)
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Quản Lý Thử Thách Lối Sống Thuần Chay (Vegan Challenge)
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Tổ chức các chiến dịch 7 - 21 ngày xây dựng thói quen ăn chay khoa học, thiết lập định lượng dinh dưỡng chuẩn vi chất và thẩm định hình ảnh check-in mâm cơm hàng ngày của hội viên.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-all shadow-xs shrink-0 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Thiết Lập Thử Thách Mới
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Chiến dịch hoạt động
            </div>
            <div className="text-2xl font-bold text-on-surface mt-1">
              {stats.activeChallenges} <span className="text-xs font-normal text-on-surface-variant">/ {stats.totalChallenges} tổng</span>
            </div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              Cộng đồng hưởng ứng cao
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[26px]">military_tech</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Người tham gia thử thách
            </div>
            <div className="text-2xl font-bold text-on-surface mt-1">
              {stats.totalParticipants.toLocaleString('vi-VN')}
            </div>
            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">group</span>
              Hội viên ăn thuần chay
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[26px]">groups</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Check-in cần Mod thẩm định
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {stats.pendingCheckins} <span className="text-xs font-normal text-on-surface-variant">lượt</span>
            </div>
            <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
              Chờ đánh giá dinh dưỡng
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[26px]">fact_check</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Tỷ lệ hoàn thành thử thách
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.avgCompletionRate}%
            </div>
            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
              Nhận huy hiệu thành công
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined text-[26px]">auto_graph</span>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation (Challenges vs Checkins Queue) */}
      <div className="flex border-b border-surface-container-high">
        <button
          onClick={() => setMainTab('challenges')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors cursor-pointer ${
            mainTab === 'challenges'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">sports_score</span>
          Danh Sách Thử Thách & Trại Lối Sống ({challenges.length})
        </button>

        <button
          onClick={() => setMainTab('checkins')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors cursor-pointer relative ${
            mainTab === 'checkins'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">fact_check</span>
          Hàng Đợi Thẩm Định Mâm Cơm Check-in
          {stats.pendingCheckins > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
              {stats.pendingCheckins}
            </span>
          )}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder={
              mainTab === 'challenges'
                ? 'Tìm kiếm thử thách theo tiêu đề hoặc mô tả dinh dưỡng...'
                : 'Tìm kiếm check-in theo tên thành viên hoặc món ăn...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface rounded-lg border border-surface-container-high focus:outline-none focus:border-primary transition-all text-on-surface"
          />
        </form>

        {/* Dynamic Filters depending on Tab */}
        {mainTab === 'challenges' ? (
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={challengeStatusFilter}
              onChange={(e) => setChallengeStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang diễn ra</option>
              <option value="upcoming">Sắp mở</option>
              <option value="completed">Đã kết thúc</option>
              <option value="draft">Bản nháp</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="beginner">Khởi đầu Chay</option>
              <option value="fitness">Đạm Cao & Thể Thao</option>
              <option value="detox">Thanh lọc Xanh</option>
              <option value="sugar_free">Giảm Đường Tinh Luyện</option>
              <option value="habit">Thói Quen Sống Khỏe</option>
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none"
            >
              <option value="all">Mọi độ khó</option>
              <option value="easy">Dễ tiếp cận</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Nâng cao</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <select
              value={checkinStatusFilter}
              onChange={(e) => setCheckinStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none"
            >
              <option value="all">Tất cả trạng thái duyệt</option>
              <option value="pending">Chờ thẩm định (Pending)</option>
              <option value="approved">Đã phê duyệt (Approved)</option>
              <option value="rejected">Yêu cầu chụp lại (Rejected)</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Đang tải dữ liệu thử thách từ cơ sở dữ liệu...</span>
        </div>
      ) : mainTab === 'challenges' ? (
        /* TAB 1: CHALLENGES GRID */
        challenges.length === 0 ? (
          <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">
              military_tech
            </span>
            <h3 className="text-base font-semibold text-on-surface">Không tìm thấy thử thách nào</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              Không có chiến dịch nào phù hợp với bộ lọc hiện tại. Thử thay đổi điều kiện lọc hoặc tạo thử thách mới cho cộng đồng!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Banner / Header */}
                <div className="h-36 relative overflow-hidden bg-surface-container">
                  {challenge.bannerUrl ? (
                    <img
                      src={challenge.bannerUrl}
                      alt={challenge.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-r from-emerald-700 to-teal-800 flex items-center justify-center text-white/30">
                      <span className="material-symbols-outlined text-[64px]">spa</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-black/60 text-white backdrop-blur-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      {challenge.durationDays} Ngày
                    </span>
                    {getStatusBadge(challenge.status)}
                  </div>

                  {/* Title & Badge name */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium mb-0.5">
                      <span className="material-symbols-outlined text-[16px]">{challenge.badgeIcon || 'military_tech'}</span>
                      Huy hiệu: {challenge.badgeName}
                    </div>
                    <h3 className="text-base font-bold leading-tight line-clamp-1">{challenge.title}</h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Tags row */}
                    <div className="flex items-center gap-2 mb-2.5">
                      {getCategoryBadge(challenge.category)}
                      <span className="text-xs text-outline">•</span>
                      {getDifficultyBadge(challenge.difficulty)}
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
                      {challenge.description}
                    </p>

                    {/* Daily Tasks Preview */}
                    {challenge.dailyTasks && challenge.dailyTasks.length > 0 && (
                      <div className="bg-surface p-3 rounded-xl border border-surface-container-high/40 space-y-1.5 mb-3">
                        <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-primary">task_alt</span>
                          Nhiệm vụ dinh dưỡng hàng ngày ({challenge.dailyTasks.length}):
                        </div>
                        <ul className="text-xs text-on-surface space-y-1 pl-1">
                          {challenge.dailyTasks.slice(0, 2).map((t, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 truncate">
                              <span className="text-primary font-bold">•</span>
                              <span className="truncate">{t}</span>
                            </li>
                          ))}
                          {challenge.dailyTasks.length > 2 && (
                            <li className="text-[11px] text-on-surface-variant italic">
                              + {challenge.dailyTasks.length - 2} nhiệm vụ khác
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Nutritionist Note */}
                    {challenge.nutritionistNote && (
                      <div className="text-xs bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 p-2.5 rounded-lg border border-emerald-500/10 flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">
                          psychology
                        </span>
                        <p className="line-clamp-2 leading-tight">
                          <span className="font-semibold">Lời khuyên Mod:</span> {challenge.nutritionistNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer stats & actions */}
                  <div className="pt-3 border-t border-surface-container-high/60 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1 font-medium text-on-surface">
                        <span className="material-symbols-outlined text-[15px] text-primary">groups</span>
                        {challenge.participantsCount} tham gia
                      </span>
                      {challenge.pendingCheckinsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[11px]">
                          {challenge.pendingCheckinsCount} check-in chờ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(challenge)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                        title="Chỉnh sửa thử thách"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteChallenge(challenge)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Xoá thử thách"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* TAB 2: CHECKINS REVIEW QUEUE */
        checkins.length === 0 ? (
          <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8">
            <span className="material-symbols-outlined text-[48px] text-emerald-500 mb-2">
              task_alt
            </span>
            <h3 className="text-base font-semibold text-on-surface">Hàng đợi check-in trống!</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              Tất cả các mâm cơm điểm danh của hội viên tham gia thử thách đã được thẩm định xong.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {checkins.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-primary/40 transition-all"
              >
                {/* Left: User & Meal Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Meal Photo / Media Thumbnail */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-surface-container-high relative group">
                    {item.mediaUrl ? (
                      <img
                        src={item.mediaUrl}
                        alt={item.mealTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[28px]">lunch_dining</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                      Ngày {item.dayNumber}
                    </span>
                  </div>

                  {/* Info Column */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                        {item.challengeTitle}
                      </span>
                      <span className="text-xs text-on-surface-variant">• {item.createdAt}</span>
                    </div>

                    <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
                      {item.mealTitle}
                    </h4>

                    {item.notes && (
                      <p className="text-xs text-on-surface-variant italic">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Member Profile */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-on-surface">
                      <img
                        src={item.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                        alt={item.userName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold">{item.userName}</span>
                      <span className="text-on-surface-variant">({item.userEmail})</span>
                    </div>

                    {/* Moderator comment if reviewed */}
                    {item.nutritionistComment && (
                      <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg mt-2 flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">chat</span>
                        <span><strong className="font-semibold">Nhận xét Mod:</strong> {item.nutritionistComment}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Review Actions */}
                <div className="flex flex-col md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-surface-container-high">
                  <div>
                    {item.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                        <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                        Chờ Chuyên gia duyệt
                      </span>
                    ) : item.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Đã Đạt Chuẩn Dinh Dưỡng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                        Yêu cầu chụp lại
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenReview(item)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors cursor-pointer border border-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px]">rate_review</span>
                    {item.status === 'pending' ? 'Thẩm định ngay' : 'Xem lại đánh giá'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* MODAL 1: ADD / EDIT CHALLENGE */}
      {isChallengeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">military_tech</span>
                <h3 className="text-lg font-bold text-on-surface">
                  {editingChallenge ? 'Chỉnh Sửa Chiến Dịch Thử Thách' : 'Thiết Lập Chiến Dịch Thử Thách Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChallengeModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveChallenge} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Tên Thử Thách Lối Sống Chay *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 21 Ngày Khởi Đầu Chay Khoa Học"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Mục Tiêu & Thông Điệp Chiến Dịch
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả ý nghĩa thử thách, lợi ích sức khỏe và môi trường..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Grid 3 inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Thời Lượng (Ngày)
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={90}
                    value={formDurationDays}
                    onChange={(e) => setFormDurationDays(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Thể Loại
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="beginner">Khởi đầu Chay</option>
                    <option value="fitness">Đạm Cao & Thể Thao</option>
                    <option value="detox">Thanh lọc Xanh</option>
                    <option value="sugar_free">Giảm Đường Tinh Luyện</option>
                    <option value="habit">Thói Quen Sống Khỏe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Độ Khó
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="easy">Dễ tiếp cận</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Nâng cao</option>
                  </select>
                </div>
              </div>

              {/* Badges & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Tên Huy Hiệu Trao Tặng
                  </label>
                  <input
                    type="text"
                    value={formBadgeName}
                    onChange={(e) => setFormBadgeName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Material Icon Huy Hiệu
                  </label>
                  <input
                    type="text"
                    placeholder="military_tech, emoji_events, spa..."
                    value={formBadgeIcon}
                    onChange={(e) => setFormBadgeIcon(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Trạng Thái
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="active">Đang diễn ra (Active)</option>
                    <option value="upcoming">Sắp mở (Upcoming)</option>
                    <option value="completed">Đã kết thúc (Completed)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Banner URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  URL Ảnh Banner Đại Diện
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formBannerUrl}
                  onChange={(e) => setFormBannerUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              {/* Daily Tasks List */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Nhiệm Vụ Dinh Dưỡng Hàng Ngày Của Hội Viên
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Thêm nhiệm vụ mới (ví dụ: Ăn ít nhất 2 loại rau họ cải, uống 2L nước)..."
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTask();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-3 py-2 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest text-xs font-semibold cursor-pointer shrink-0"
                  >
                    + Thêm
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {formTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface border border-surface-container-high/60 text-xs"
                    >
                      <span className="text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                        {task}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(idx)}
                        className="text-on-surface-variant hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutritionist Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Chỉ Dẫn Vi Chất Từ Chuyên Gia (Nutritionist Note)
                </label>
                <textarea
                  rows={2}
                  placeholder="Khuyến nghị Mod về cách hấp thu B12, sắt non-heme, kẽm trong suốt thử thách..."
                  value={formNutritionistNote}
                  onChange={(e) => setFormNutritionistNote(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-surface-container-high flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChallengeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant text-sm font-medium hover:bg-surface-container cursor-pointer"
                >
                  Huỷ Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Đang lưu...' : editingChallenge ? 'Cập Nhật Chiến Dịch' : 'Kích Hoạt Thử Thách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVIEW CHECK-IN */}
      {selectedCheckin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">rate_review</span>
                <h3 className="text-base font-bold text-on-surface">
                  Thẩm Định Mâm Cơm Ngày {selectedCheckin.dayNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCheckin(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleConfirmReview} className="p-6 space-y-4">
              {/* Image preview */}
              {selectedCheckin.mediaUrl && (
                <div className="rounded-xl overflow-hidden h-48 bg-surface-container border border-surface-container-high">
                  <img
                    src={selectedCheckin.mediaUrl}
                    alt={selectedCheckin.mealTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-1">
                <div className="text-sm font-bold text-on-surface">{selectedCheckin.mealTitle}</div>
                <div className="text-xs text-on-surface-variant">
                  Thành viên: <span className="text-on-surface font-semibold">{selectedCheckin.userName}</span> • {selectedCheckin.challengeTitle}
                </div>
                {selectedCheckin.notes && (
                  <div className="text-xs text-on-surface-variant italic mt-1 bg-surface p-2.5 rounded-lg border border-surface-container-high/60">
                    "{selectedCheckin.notes}"
                  </div>
                )}
              </div>

              {/* Review Decision */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Quyết Định Của Chuyên Gia Dinh Dưỡng
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewDecision('approved');
                      setReviewComment('Mâm cơm thuần chay màu sắc đẹp, đa dạng đạm thực vật và chất xơ. Điểm danh hợp lệ!');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      reviewDecision === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-surface-container-high text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Phê Duyệt Đạt Chuẩn
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReviewDecision('rejected');
                      setReviewComment('Hình ảnh chưa rõ các thành phần thực vật hoặc thiếu nhóm chất chính. Vui lòng chụp lại bữa ăn kế tiếp nhé!');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      reviewDecision === 'rejected'
                        ? 'bg-rose-50 text-rose-800 border-rose-500 shadow-xs dark:bg-rose-950/40 dark:text-rose-300'
                        : 'border-surface-container-high text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    Yêu Cầu Chụp Lại
                  </button>
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Nhận Xét & Lời Khuyên Dinh Dưỡng Gửi Hội Viên
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCheckin(null)}
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant text-xs font-medium hover:bg-surface-container cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Xác Nhận & Gửi Phản Hồi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

