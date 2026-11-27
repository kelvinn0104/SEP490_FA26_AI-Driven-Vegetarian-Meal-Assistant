import React, { useState, useEffect } from 'react';
import { challengesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  SuperAdminReadOnlyBanner,
  ApiErrorBanner,
  ImageUploadField,
} from '../../components/ui/OperationalHelpers';

export const VeganChallengeManagementScreen = ({ readOnly = false }) => {
  const { isSuperAdmin } = useAuth();
  const isReadOnly = readOnly || isSuperAdmin;

  const [challenges, setChallenges] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    totalParticipants: 0,
    pendingCheckins: 0,
    avgCompletionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mainTab, setMainTab] = useState('challenges');
  const [challengeStatusFilter, setChallengeStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [checkinStatusFilter, setCheckinStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDurationDays, setFormDurationDays] = useState(21);
  const [formCategory, setFormCategory] = useState('beginner');
  const [formDifficulty, setFormDifficulty] = useState('easy');
  const [formBadgeName, setFormBadgeName] = useState('Mầm Xanh Kiên Trì');
  const [formBadgeIcon, setFormBadgeIcon] = useState('emoji_events');
  const [formBannerUrl, setFormBannerUrl] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [formTasks, setFormTasks] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [formNutritionistNote, setFormNutritionistNote] = useState('');

  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
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
      setError(err.message || 'Không thể tải dữ liệu thử thách lối sống chay.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mainTab, challengeStatusFilter, categoryFilter, difficultyFilter, checkinStatusFilter]);

  const handleOpenCreate = () => {
    if (isReadOnly) return;
    setEditingChallenge(null);
    setFormTitle('');
    setFormDescription('');
    setFormDurationDays(21);
    setFormCategory('beginner');
    setFormDifficulty('easy');
    setFormBadgeName('Mầm Xanh Kiên Trì');
    setFormBadgeIcon('emoji_events');
    setFormBannerUrl('');
    setFormStatus('active');
    setFormTasks(['Ăn 100% bữa ăn thuần thực vật', 'Đảm bảo nguồn đạm thực vật chính']);
    setFormNutritionistNote('');
    setIsChallengeModalOpen(true);
  };

  const handleOpenEdit = (challenge) => {
    if (isReadOnly) return;
    setEditingChallenge(challenge);
    setFormTitle(challenge.title);
    setFormDescription(challenge.description || '');
    setFormDurationDays(challenge.durationDays || 7);
    setFormCategory(challenge.category || 'beginner');
    setFormDifficulty(challenge.difficulty || 'easy');
    setFormBadgeName(challenge.badgeName || 'Mầm Xanh');
    setFormBadgeIcon(challenge.badgeIcon || 'military_tech');
    setFormBannerUrl(challenge.bannerUrl || '');
    setFormStatus(challenge.status || 'active');
    setFormTasks(challenge.dailyTasks ? [...challenge.dailyTasks] : []);
    setFormNutritionistNote(challenge.nutritionistNote || '');
    setIsChallengeModalOpen(true);
  };

  const handleSaveChallenge = async (e) => {
    e.preventDefault();
    if (isReadOnly || !formTitle.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        durationDays: parseInt(formDurationDays, 10) || 7,
        category: formCategory,
        difficulty: formDifficulty,
        badgeName: formBadgeName.trim(),
        badgeIcon: formBadgeIcon.trim(),
        bannerUrl: formBannerUrl.trim() || null,
        status: formStatus,
        dailyTasks: formTasks,
        nutritionistNote: formNutritionistNote.trim(),
      };

      if (editingChallenge) {
        await challengesApi.updateChallenge(editingChallenge.id, payload);
      } else {
        await challengesApi.createChallenge(payload);
      }

      setIsChallengeModalOpen(false);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu chiến dịch thử thách.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChallenge = async (challenge) => {
    if (isReadOnly) return;
    if (!window.confirm(`Xóa chiến dịch thử thách "${challenge.title}"?`)) return;
    try {
      setError('');
      await challengesApi.deleteChallenge(challenge.id);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Không thể xóa thử thách.');
    }
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (isReadOnly || !selectedCheckin) return;

    try {
      setIsSubmitting(true);
      setError('');
      await challengesApi.reviewCheckin(selectedCheckin.id, {
        decision: reviewDecision,
        nutritionistComment: reviewComment.trim(),
      });
      setSelectedCheckin(null);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi thẩm định check-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SuperAdminReadOnlyBanner readOnly={isReadOnly} />
      <ApiErrorBanner error={error} onDismiss={() => setError('')} onRetry={fetchData} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-emerald-900/10 via-emerald-800/5 to-transparent p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Quản Lý Thử Thách Lối Sống Thuần Chay (Vegan Challenge)
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Quản lý chiến dịch thử thách, tiến độ tham gia và duyệt check-in mâm cơm hàng ngày trên bảng VeganChallenge & ChallengeCheckin.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Thiết Lập Thử Thách Mới</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Đang hoạt động</div>
          <div className="text-2xl font-bold text-on-surface mt-1 font-mono">
            {stats.activeChallenges} / {stats.totalChallenges}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Lượt tham gia</div>
          <div className="text-2xl font-bold text-on-surface mt-1 font-mono">
            {(stats.totalParticipants || 0).toLocaleString('vi-VN')}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Check-in chờ duyệt</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">
            {stats.pendingCheckins || 0}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Tỷ lệ hoàn thành</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            {stats.avgCompletionRate || 0}%
          </div>
        </div>
      </div>

      <div className="flex border-b border-surface-container-high">
        <button
          onClick={() => setMainTab('challenges')}
          className={`px-5 py-3 border-b-2 text-sm font-semibold cursor-pointer ${
            mainTab === 'challenges'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant'
          }`}
        >
          Danh Sách Thử Thách ({challenges.length})
        </button>
        <button
          onClick={() => setMainTab('checkins')}
          className={`px-5 py-3 border-b-2 text-sm font-semibold cursor-pointer ${
            mainTab === 'checkins'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant'
          }`}
        >
          Hàng Đợi Check-in ({checkins.length})
        </button>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchData();
          }}
          className="flex-1 min-w-[240px]"
        >
          <input
            type="text"
            placeholder="Tìm kiếm thử thách hoặc thành viên check-in..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-xs bg-surface rounded-lg border border-surface-container-high"
          />
        </form>

        {mainTab === 'challenges' ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={challengeStatusFilter}
              onChange={(e) => setChallengeStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang diễn ra</option>
              <option value="upcoming">Sắp mở</option>
              <option value="completed">Đã kết thúc</option>
              <option value="draft">Bản nháp</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
            >
              <option value="all">Mọi danh mục</option>
              <option value="beginner">Khởi đầu Chay</option>
              <option value="fitness">Đạm Cao & Thể Thao</option>
              <option value="detox">Thanh lọc Xanh</option>
              <option value="sugar_free">Giảm Đường</option>
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
            >
              <option value="all">Mọi độ khó</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Nâng cao</option>
            </select>
          </div>
        ) : (
          <select
            value={checkinStatusFilter}
            onChange={(e) => setCheckinStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-outline">Đang tải dữ liệu thử thách...</div>
      ) : mainTab === 'challenges' ? (
        challenges.length === 0 ? (
          <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8 text-xs text-outline">
            Chưa có chiến dịch thử thách nào trong cơ sở dữ liệu.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs flex flex-col overflow-hidden"
              >
                <div className="h-36 relative bg-surface-container">
                  {challenge.bannerUrl ? (
                    <img
                      src={challenge.bannerUrl}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-r from-emerald-700 to-teal-800" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex justify-between text-xs font-bold text-white">
                    <span className="px-2 py-0.5 rounded bg-black/60">
                      {challenge.durationDays} ngày
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600">{challenge.status}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs text-emerald-300">{challenge.badgeName}</p>
                    <h3 className="text-base font-bold line-clamp-1">{challenge.title}</h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3 text-xs">
                  <div>
                    <p className="text-on-surface-variant line-clamp-2">{challenge.description}</p>
                    {challenge.dailyTasks?.length > 0 && (
                      <ul className="mt-2 space-y-1 text-on-surface">
                        {challenge.dailyTasks.slice(0, 3).map((t, i) => (
                          <li key={i} className="truncate">
                            • {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-3 border-t border-surface-container-high/60 flex items-center justify-between">
                    <span className="font-mono text-outline">
                      {challenge.participantsCount || 0} tham gia
                    </span>
                    {!isReadOnly && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(challenge)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(challenge)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-error cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : checkins.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8 text-xs text-outline">
          Không có lượt check-in nào trong danh sách này.
        </div>
      ) : (
        <div className="space-y-3">
          {checkins.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                {item.mediaUrl && (
                  <img
                    src={item.mediaUrl}
                    alt={item.mealTitle}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="text-xs space-y-1">
                  <span className="font-bold text-primary">
                    {item.challengeTitle} • Ngày {item.dayNumber}
                  </span>
                  <h4 className="font-bold text-sm text-on-surface">{item.mealTitle}</h4>
                  <p className="text-outline">
                    Hội viên: <b>{item.userName}</b> • {item.createdAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-surface-container text-xs font-bold">
                  {item.status}
                </span>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCheckin(item);
                      setReviewDecision('approved');
                      setReviewComment(item.nutritionistComment || 'Mâm cơm đạt chuẩn dinh dưỡng thuần chay!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
                  >
                    Thẩm định
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isChallengeModalOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">
                {editingChallenge ? 'Cập Nhật Thử Thách' : 'Tạo Chiến Dịch Thử Thách Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsChallengeModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveChallenge} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Tên thử thách *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Mô tả mục tiêu</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Số ngày</label>
                  <input
                    type="number"
                    min={3}
                    max={90}
                    value={formDurationDays}
                    onChange={(e) => setFormDurationDays(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Danh mục</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                  >
                    <option value="beginner">Khởi đầu Chay</option>
                    <option value="fitness">Đạm Cao</option>
                    <option value="detox">Thanh lọc</option>
                    <option value="sugar_free">Giảm Đường</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Trạng thái</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                  >
                    <option value="active">active</option>
                    <option value="upcoming">upcoming</option>
                    <option value="completed">completed</option>
                    <option value="draft">draft</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Ảnh Banner Chiến dịch (URL hoặc tải ảnh lên)"
                value={formBannerUrl}
                onChange={setFormBannerUrl}
              />

              <div className="space-y-2">
                <label className="font-bold block">Nhiệm vụ hàng ngày</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder="Nhập nhiệm vụ..."
                    className="flex-1 px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newTaskInput.trim()) return;
                      setFormTasks([...formTasks, newTaskInput.trim()]);
                      setNewTaskInput('');
                    }}
                    className="px-3 py-2 rounded-xl bg-surface-container-high font-bold cursor-pointer"
                  >
                    + Thêm
                  </button>
                </div>
                <div className="space-y-1">
                  {formTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 rounded-lg bg-surface border border-surface-container-high/50"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => setFormTasks(formTasks.filter((_, i) => i !== idx))}
                        className="text-error cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChallengeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu chiến dịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCheckin && !isReadOnly && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReview}
            className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-surface-container-high shadow-2xl p-6 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-on-surface">
              Duyệt Check-in Ngày {selectedCheckin.dayNumber} - {selectedCheckin.userName}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReviewDecision('approved')}
                className={`p-2.5 rounded-xl border font-bold cursor-pointer ${
                  reviewDecision === 'approved'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'border-surface-container-high'
                }`}
              >
                Phê duyệt
              </button>
              <button
                type="button"
                onClick={() => setReviewDecision('rejected')}
                className={`p-2.5 rounded-xl border font-bold cursor-pointer ${
                  reviewDecision === 'rejected'
                    ? 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'border-surface-container-high'
                }`}
              >
                Yêu cầu chụp lại
              </button>
            </div>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Nhận xét gửi người dùng..."
              className="w-full p-3 rounded-xl bg-surface border border-surface-container-high"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCheckin(null)}
                className="px-4 py-2 rounded-xl bg-surface-container cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
