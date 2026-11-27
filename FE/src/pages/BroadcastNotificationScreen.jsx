import React, { useState, useEffect } from 'react';
import { broadcastsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  SuperAdminReadOnlyBanner,
  ApiErrorBanner,
} from '../components/ui/OperationalHelpers';

export const BroadcastNotificationScreen = ({ readOnly = false }) => {
  const { isSuperAdmin } = useAuth();
  const isReadOnly = readOnly || isSuperAdmin;

  const [broadcasts, setBroadcasts] = useState([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    scheduledCount: 0,
    avgOpenRate: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formType, setFormType] = useState('tip');
  const [formAudience, setFormAudience] = useState('all');
  const [formSendMode, setFormSendMode] = useState('now');
  const [formScheduleDate, setFormScheduleDate] = useState('');
  const [formActionUrl, setFormActionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      setError('');
      const [listRes, statsRes] = await Promise.all([
        broadcastsApi.getBroadcasts({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          search: searchQuery || undefined,
        }),
        broadcastsApi.getStats(),
      ]);

      setBroadcasts(listRes || []);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách thông báo phát sóng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, [statusFilter, typeFilter]);

  const handleOpenCompose = () => {
    if (isReadOnly) return;
    setEditingItem(null);
    setFormTitle('');
    setFormMessage('');
    setFormType('tip');
    setFormAudience('all');
    setFormSendMode('now');
    setFormScheduleDate('');
    setFormActionUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    if (isReadOnly) return;
    setEditingItem(item);
    setFormTitle(item.title);
    setFormMessage(item.message);
    setFormType(item.type || 'tip');
    setFormAudience(item.targetAudience || 'all');
    setFormSendMode(
      item.status === 'scheduled' ? 'schedule' : item.status === 'draft' ? 'draft' : 'now'
    );
    setFormScheduleDate('');
    setFormActionUrl(item.actionUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveBroadcast = async (e) => {
    e.preventDefault();
    if (isReadOnly || !formTitle.trim() || !formMessage.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const statusValue =
        formSendMode === 'schedule' ? 'scheduled' : formSendMode === 'draft' ? 'draft' : 'sent';
      const payload = {
        title: formTitle.trim(),
        message: formMessage.trim(),
        type: formType,
        targetAudience: formAudience,
        status: statusValue,
        scheduledAt:
          formSendMode === 'schedule'
            ? new Date(formScheduleDate || Date.now() + 86400000).toISOString()
            : null,
        actionUrl: formActionUrl.trim() || null,
      };

      if (editingItem) {
        await broadcastsApi.updateBroadcast(editingItem.id, payload);
      } else {
        await broadcastsApi.createBroadcast(payload);
      }

      setIsModalOpen(false);
      await fetchBroadcasts();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu hoặc phát sóng thông báo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNow = async (item) => {
    if (isReadOnly) return;
    if (!window.confirm(`Phát sóng thông báo "${item.title}" ngay bây giờ?`)) return;

    try {
      setError('');
      await broadcastsApi.sendNow(item.id);
      await fetchBroadcasts();
    } catch (err) {
      setError(err.message || 'Lỗi khi phát sóng thông báo.');
    }
  };

  const handleDelete = async (item) => {
    if (isReadOnly) return;
    if (!window.confirm(`Xóa thông báo "${item.title}"?`)) return;

    try {
      setError('');
      await broadcastsApi.deleteBroadcast(item.id);
      await fetchBroadcasts();
    } catch (err) {
      setError(err.message || 'Không thể xóa thông báo.');
    }
  };

  return (
    <div className="space-y-6">
      <SuperAdminReadOnlyBanner readOnly={isReadOnly} />
      <ApiErrorBanner error={error} onDismiss={() => setError('')} onRetry={fetchBroadcasts} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-sky-950/20 via-sky-900/10 to-transparent p-6 rounded-2xl border border-sky-500/20">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Quản Lý Phát Sóng & Mẹo Dinh Dưỡng Khoa Học
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Gửi thông báo đẩy tức thì hoặc hẹn giờ lưu vào bảng BroadcastNotification và phân phối trực tiếp vào hộp thư Notifications của người dùng.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenCompose}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add_alert</span>
            <span>Soạn Thông Báo Mới</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Đã phát sóng</div>
          <div className="text-2xl font-bold text-on-surface mt-1 font-mono">{stats.totalSent}</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Đang hẹn giờ</div>
          <div className="text-2xl font-bold text-sky-600 mt-1 font-mono">{stats.scheduledCount}</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Tỷ lệ đọc TB</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{stats.avgOpenRate}%</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Tổng lượt đọc/click</div>
          <div className="text-2xl font-bold text-on-surface mt-1 font-mono">
            {(stats.totalClicks || 0).toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBroadcasts();
          }}
          className="flex-1 min-w-[240px]"
        >
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-xs bg-surface rounded-lg border border-surface-container-high"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="sent">Đã phát sóng</option>
            <option value="scheduled">Hẹn giờ</option>
            <option value="draft">Bản nháp</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
          >
            <option value="all">Mọi loại</option>
            <option value="tip">Mẹo Dinh dưỡng</option>
            <option value="challenge">Thử thách</option>
            <option value="urgent">Cảnh báo</option>
            <option value="recipe">Công thức mới</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-outline">Đang tải danh sách thông báo...</div>
      ) : broadcasts.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8 text-xs text-outline">
          Chưa có bản tin thông báo nào trong cơ sở dữ liệu.
        </div>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    {item.type}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-bold">
                    {item.status}
                  </span>
                  <span className="text-outline font-mono">• {item.createdAt}</span>
                </div>
                <h3 className="text-base font-bold text-on-surface">{item.title}</h3>
                <p className="text-xs text-on-surface-variant">{item.message}</p>
                <div className="text-xs text-outline pt-1">
                  Nhóm nhận: <b className="text-on-surface">{item.targetAudienceLabel}</b>
                  {item.scheduledAt && ` • Lịch gửi: ${item.scheduledAt}`}
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== 'sent' && (
                    <button
                      onClick={() => handleSendNow(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                    >
                      Phát sóng ngay
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-error cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface">
                {editingItem ? 'Chỉnh Sửa Thông Báo' : 'Soạn Thông Báo Phát Sóng'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveBroadcast} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Nội dung ({formMessage.length}/300) *</label>
                <textarea
                  rows={3}
                  required
                  maxLength={300}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Phân loại</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                  >
                    <option value="tip">Mẹo Dinh dưỡng</option>
                    <option value="challenge">Thử thách</option>
                    <option value="urgent">Cảnh báo</option>
                    <option value="recipe">Công thức mới</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Đối tượng nhận thực tế</label>
                  <select
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                  >
                    <option value="all">Toàn bộ người dùng đang hoạt động</option>
                    <option value="challenge_participants">Hội viên đang tham gia Thử thách</option>
                    <option value="beginners">Người dùng mới đăng ký (30 ngày)</option>
                    <option value="fitness">Nhóm mục tiêu Thể thao / Tăng cơ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'now', label: 'Gửi Ngay' },
                  { id: 'schedule', label: 'Hẹn Giờ' },
                  { id: 'draft', label: 'Lưu Nháp' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormSendMode(m.id)}
                    className={`py-2 rounded-xl border font-bold cursor-pointer ${
                      formSendMode === m.id
                        ? 'bg-primary-fixed text-on-primary-fixed-variant border-primary'
                        : 'border-surface-container-high'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {formSendMode === 'schedule' && (
                <div>
                  <label className="font-bold block mb-1">Thời điểm hẹn gửi</label>
                  <input
                    type="datetime-local"
                    value={formScheduleDate}
                    onChange={(e) => setFormScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high font-mono"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang xử lý...' : formSendMode === 'now' ? 'Phát sóng ngay' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
