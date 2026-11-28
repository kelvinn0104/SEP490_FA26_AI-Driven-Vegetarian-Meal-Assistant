import React, { useState, useEffect } from 'react';
import { rewardsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  SuperAdminReadOnlyBanner,
  ApiErrorBanner,
  ImageUploadField,
} from '../components/ui/OperationalHelpers';

export const RewardManagementScreen = ({ readOnly = false }) => {
  const { isSuperAdmin } = useAuth();
  const isReadOnly = readOnly || isSuperAdmin;

  const [rewards, setRewards] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({
    totalRewards: 0,
    availableRewards: 0,
    totalClaimsProcessed: 0,
    pendingClaimsCount: 0,
    totalKarmaPointsCirculated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('rewards');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [claimStatusFilter, setClaimStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPoints, setFormPoints] = useState(500);
  const [formStock, setFormStock] = useState(50);
  const [formCategory, setFormCategory] = useState('voucher');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimDecision, setClaimDecision] = useState('approved');
  const [claimNotes, setClaimNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [rewardList, statData, claimList] = await Promise.all([
        rewardsApi.getRewards({
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined,
        }),
        rewardsApi.getStats(),
        rewardsApi.getClaims({
          status: claimStatusFilter !== 'all' ? claimStatusFilter : undefined,
          search: searchQuery || undefined,
        }),
      ]);

      setRewards(rewardList || []);
      if (statData) setStats(statData);
      setClaims(claimList || []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu kho quà đổi thưởng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, categoryFilter, statusFilter, claimStatusFilter]);

  const handleOpenCreateReward = () => {
    if (isReadOnly) return;
    setEditingReward(null);
    setFormTitle('');
    setFormDescription('');
    setFormPoints(500);
    setFormStock(50);
    setFormCategory('voucher');
    setFormImageUrl('');
    setFormStatus('active');
    setIsRewardModalOpen(true);
  };

  const handleOpenEditReward = (item) => {
    if (isReadOnly) return;
    setEditingReward(item);
    setFormTitle(item.title);
    setFormDescription(item.description || '');
    setFormPoints(item.pointsRequired || 100);
    setFormStock(item.stockQuantity || 0);
    setFormCategory(item.category || 'voucher');
    setFormImageUrl(item.imageUrl || '');
    setFormStatus(item.status || 'active');
    setIsRewardModalOpen(true);
  };

  const handleSaveReward = async (e) => {
    e.preventDefault();
    if (isReadOnly || !formTitle.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        pointsRequired: parseInt(formPoints, 10) || 100,
        stockQuantity: parseInt(formStock, 10) || 0,
        category: formCategory,
        imageUrl: formImageUrl.trim() || null,
        status: formStatus,
      };

      if (editingReward) {
        await rewardsApi.updateReward(editingReward.id, payload);
      } else {
        await rewardsApi.createReward(payload);
      }

      setIsRewardModalOpen(false);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu phần thưởng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReward = async (item) => {
    if (isReadOnly) return;
    if (!window.confirm(`Xóa phần thưởng "${item.title}"?`)) return;
    try {
      setError('');
      await rewardsApi.deleteReward(item.id);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Không thể xóa phần thưởng.');
    }
  };

  const handleConfirmProcessClaim = async (e) => {
    e.preventDefault();
    if (isReadOnly || !selectedClaim) return;

    try {
      setIsSubmitting(true);
      setError('');
      await rewardsApi.processClaim(selectedClaim.id, {
        decision: claimDecision,
        notes: claimNotes.trim(),
      });
      setSelectedClaim(null);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi xử lý yêu cầu đổi quà.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SuperAdminReadOnlyBanner readOnly={isReadOnly} />
      <ApiErrorBanner error={error} onDismiss={() => setError('')} onRetry={fetchData} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-emerald-950/20 via-green-900/10 to-transparent p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Kho Quà Đổi Thưởng & Điểm Mầm Xanh
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Quản lý danh mục quà tặng trên bảng EcoReward và xử lý yêu cầu đổi thưởng thực tế trên bảng RewardClaim.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenCreateReward}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Thêm Phần Thưởng Mới</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Tổng quà tặng</div>
          <div className="text-2xl font-bold text-on-surface mt-1 font-mono">{stats.totalRewards}</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Yêu cầu chờ duyệt</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">
            {stats.pendingClaimsCount}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Đã trao quà</div>
          <div className="text-2xl font-bold text-on-surface mt-1 font-mono">
            {stats.totalClaimsProcessed}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Điểm đã quy đổi</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            {(stats.totalKarmaPointsCirculated || 0).toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      <div className="flex border-b border-surface-container-high">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-5 py-3 border-b-2 text-sm font-semibold cursor-pointer ${
            activeTab === 'rewards'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant'
          }`}
        >
          Danh Mục Phần Thưởng ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-5 py-3 border-b-2 text-sm font-semibold cursor-pointer ${
            activeTab === 'claims'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant'
          }`}
        >
          Yêu Cầu Đổi Thưởng ({claims.length})
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
            placeholder="Tìm kiếm quà tặng hoặc người đổi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-xs bg-surface rounded-lg border border-surface-container-high"
          />
        </form>

        {activeTab === 'rewards' ? (
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
            >
              <option value="all">Mọi loại quà</option>
              <option value="voucher">Voucher</option>
              <option value="ebook">Ebook</option>
              <option value="physical">Quà sinh thái</option>
              <option value="seed">Hạt giống</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang khả dụng</option>
              <option value="out_of_stock">Hết quà</option>
              <option value="paused">Tạm dừng</option>
            </select>
          </div>
        ) : (
          <select
            value={claimStatusFilter}
            onChange={(e) => setClaimStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="delivered">Đã giao</option>
            <option value="rejected">Từ chối</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-outline">Đang tải dữ liệu kho quà...</div>
      ) : activeTab === 'rewards' ? (
        rewards.length === 0 ? (
          <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8 text-xs text-outline">
            Chưa có phần thưởng nào trong kho.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {rewards.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs flex flex-col overflow-hidden"
              >
                <div className="h-36 relative bg-surface-container">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined text-[40px]">redeem</span>
                    </div>
                  )}
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/65 text-emerald-300 font-mono">
                    {item.pointsRequired} điểm
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface line-clamp-2">{item.title}</h4>
                    <p className="text-on-surface-variant line-clamp-2 mt-1">{item.description}</p>
                  </div>

                  <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between">
                    <span className="font-mono text-outline">
                      Tồn: <b>{item.stockQuantity}</b> • Đã đổi: <b>{item.claimedQuantity}</b>
                    </span>
                    {!isReadOnly && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditReward(item)}
                          className="p-1 rounded-lg text-on-surface-variant hover:text-primary cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteReward(item)}
                          className="p-1 rounded-lg text-on-surface-variant hover:text-error cursor-pointer"
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
      ) : claims.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8 text-xs text-outline">
          Không có yêu cầu đổi quà nào trong danh sách này.
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-emerald-700 font-mono">
                  {claim.pointsSpent} Điểm Mầm Xanh • {claim.claimDate}
                </span>
                <h4 className="text-sm font-bold text-on-surface">{claim.rewardTitle}</h4>
                <p className="text-outline">
                  Hội viên: <b>{claim.userName}</b> ({claim.userEmail})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-surface-container font-bold">
                  {claim.status}
                </span>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setClaimDecision('approved');
                      setClaimNotes(claim.notes || 'Đã xác nhận và gửi mã quà tặng.');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold cursor-pointer"
                  >
                    Xử lý
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isRewardModalOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveReward}
            className="bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-surface-container-high shadow-2xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <h3 className="text-base font-bold text-on-surface">
                {editingReward ? 'Cập Nhật Quà Tặng' : 'Thêm Phần Thưởng Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsRewardModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div>
              <label className="font-bold block mb-1">Tên phần thưởng *</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">Mô tả</label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Điểm cần đổi</label>
                <input
                  type="number"
                  min={10}
                  value={formPoints}
                  onChange={(e) => setFormPoints(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high font-mono"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Tồn kho</label>
                <input
                  type="number"
                  min={0}
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Phân loại</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                >
                  <option value="voucher">voucher</option>
                  <option value="ebook">ebook</option>
                  <option value="physical">physical</option>
                  <option value="seed">seed</option>
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
                  <option value="out_of_stock">out_of_stock</option>
                  <option value="paused">paused</option>
                </select>
              </div>
            </div>

            <ImageUploadField
              label="Hình ảnh phần thưởng (URL hoặc tải ảnh lên)"
              value={formImageUrl}
              onChange={setFormImageUrl}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRewardModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu quà tặng'}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedClaim && !isReadOnly && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmProcessClaim}
            className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-surface-container-high shadow-2xl p-6 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-on-surface">
              Xử Lý Đổi Quà #{selectedClaim.id} - {selectedClaim.userName}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'approved', label: 'Duyệt cấp quà' },
                { id: 'delivered', label: 'Đã giao' },
                { id: 'rejected', label: 'Từ chối' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setClaimDecision(d.id)}
                  className={`p-2 rounded-xl border font-bold cursor-pointer ${
                    claimDecision === d.id
                      ? 'bg-primary-fixed text-on-primary-fixed-variant border-primary'
                      : 'border-surface-container-high'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={claimNotes}
              onChange={(e) => setClaimNotes(e.target.value)}
              placeholder="Ghi chú hoặc mã voucher gửi người dùng..."
              className="w-full p-3 rounded-xl bg-surface border border-surface-container-high"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 rounded-xl bg-surface-container cursor-pointer"
              >
                Hủy
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
