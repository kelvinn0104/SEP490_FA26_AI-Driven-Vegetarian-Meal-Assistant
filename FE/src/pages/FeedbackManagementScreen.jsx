import React, { useState, useEffect } from 'react';
import { feedbacksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  SuperAdminReadOnlyBanner,
  ApiErrorBanner,
} from '../components/ui/OperationalHelpers';

export const FeedbackManagementScreen = ({ readOnly = false }) => {
  const { isSuperAdmin } = useAuth();
  const isReadOnly = readOnly || isSuperAdmin;

  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    openReports: 0,
    resolvedReports: 0,
    dismissedReports: 0,
    nutritionMisinformationCount: 0,
    spamPolicyCount: 0,
    avgAiSatisfaction: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [decision, setDecision] = useState('resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [hideTarget, setHideTarget] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeedbacksAndStats = async () => {
    try {
      setLoading(true);
      setError('');
      const categoryParam =
        activeTab === 'all' || activeTab === 'ai_feedback' ? undefined : activeTab;
      const typeParam = activeTab === 'ai_feedback' ? 'ai_feedback' : undefined;

      const [listRes, statsRes] = await Promise.all([
        feedbacksApi.getFeedbacks({
          type: typeParam,
          category: categoryParam,
          status: statusFilter,
          search: searchQuery,
        }),
        feedbacksApi.getStats(),
      ]);

      setFeedbacks(listRes || []);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách phản hồi & báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacksAndStats();
  }, [activeTab, statusFilter]);

  const handleOpenResolve = (item) => {
    setSelectedItem(item);
    setDecision(item.status === 'dismissed' ? 'dismissed' : 'resolved');
    setResolutionNote(
      item.resolutionNote ||
        'Đã thẩm định phản hồi và cập nhật trạng thái xử lý theo tiêu chuẩn VeggieAI.'
    );
    setHideTarget(false);
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (isReadOnly || !selectedItem) return;

    try {
      setIsSubmitting(true);
      setError('');
      await feedbacksApi.resolveFeedback(
        selectedItem.id,
        {
          decision,
          resolutionNote,
          hideTargetContent: hideTarget,
        },
        selectedItem.feedbackType
      );

      setSelectedItem(null);
      await fetchFeedbacksAndStats();
    } catch (err) {
      setError(err.message || 'Lỗi khi xử lý phản hồi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <SuperAdminReadOnlyBanner readOnly={isReadOnly} />
      <ApiErrorBanner
        error={error}
        onDismiss={() => setError('')}
        onRetry={fetchFeedbacksAndStats}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Quản lý Phản hồi & Báo cáo Vi phạm
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Tiếp nhận báo cáo bài viết, bình luận, khiếu nại dinh dưỡng và đánh giá gợi ý AI từ người dùng.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-error-container text-on-error-container text-xs font-bold font-mono self-start sm:self-auto">
          {stats.openReports} báo cáo chờ xử lý
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Tổng Phản hồi</span>
          <p className="text-2xl font-bold text-on-surface font-mono mt-1">{stats.totalReports}</p>
          <span className="text-[10px] text-on-surface-variant">Đã xử lý: {stats.resolvedReports}</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-error uppercase font-bold">Sai lệch Dinh dưỡng</span>
          <p className="text-2xl font-bold text-error font-mono mt-1">
            {stats.nutritionMisinformationCount}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Spam & Chính sách</span>
          <p className="text-2xl font-bold text-secondary font-mono mt-1">{stats.spamPolicyCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Đánh giá AI TB</span>
          <p className="text-2xl font-bold text-tertiary font-mono mt-1">
            {stats.avgAiSatisfaction || 0} / 5.0
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-surface-container-high/60 pb-1 overflow-x-auto">
        {[
          { id: 'all', label: `Tất cả (${stats.totalReports})` },
          { id: 'nutrition_misinformation', label: `Sai lệch Dinh dưỡng (${stats.nutritionMisinformationCount})` },
          { id: 'spam', label: `Spam & Vi phạm (${stats.spamPolicyCount})` },
          { id: 'ai_feedback', label: 'Đánh giá Gợi ý AI' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
              activeTab === t.id
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-surface-container-high'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchFeedbacksAndStats();
          }}
          className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo nội dung, người báo cáo..."
            className="flex-1 min-w-[200px] h-9 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container-high/50"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 cursor-pointer"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="open">Chờ xử lý</option>
            <option value="resolved">Đã giải quyết</option>
            <option value="dismissed">Đã bỏ qua</option>
          </select>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-surface-container text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
          >
            Lọc
          </button>
        </form>
        <span className="text-xs text-outline font-mono">{feedbacks.length} bản ghi</span>
      </div>

      <div className="rounded-xl bg-surface-container-lowest p-5 shadow-xs border border-surface-container-high/40 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-outline">Đang tải danh sách phản hồi...</div>
        ) : feedbacks.length === 0 ? (
          <div className="py-12 text-center text-xs text-outline">
            Chưa có phản hồi hoặc báo cáo vi phạm nào khớp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline uppercase font-semibold">
                  <th className="py-2.5 px-3">Người gửi</th>
                  <th className="py-2.5 px-3">Phân loại & Đối tượng</th>
                  <th className="py-2.5 px-3">Nội dung</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {feedbacks.map((item) => (
                  <tr key={`${item.feedbackType}-${item.id}`} className="hover:bg-surface-container-low/40">
                    <td className="py-3 px-3">
                      <p className="font-bold text-on-surface">{item.reporterName}</p>
                      <p className="text-[10px] text-outline font-mono">{item.reporterEmail}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-[10px] font-bold">
                        {item.categoryLabel}
                      </span>
                      <p className="font-semibold text-on-surface mt-1 truncate max-w-[180px]">
                        {item.targetTitle}
                      </p>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <p className="line-clamp-2 text-on-surface">{item.content}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'open'
                            ? 'bg-error-container text-on-error-container'
                            : item.status === 'resolved'
                            ? 'bg-primary-fixed text-on-primary-fixed-variant'
                            : 'bg-surface-container text-outline'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-outline">{item.createdAt}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenResolve(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          !isReadOnly && item.status === 'open'
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {!isReadOnly && item.status === 'open' ? 'Xử lý' : 'Chi tiết'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60">
              <h3 className="font-bold text-base text-on-surface">
                Chi tiết Phản hồi #{selectedItem.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-surface-container-high/60 space-y-1.5">
                <p>
                  <b>Người gửi:</b> {selectedItem.reporterName} ({selectedItem.createdAt})
                </p>
                <p>
                  <b>Đối tượng:</b> {selectedItem.targetTitle}
                </p>
                <p className="pt-1 text-on-surface bg-surface-container-lowest p-2.5 rounded-lg">
                  &quot;{selectedItem.content}&quot;
                </p>
              </div>

              {!isReadOnly && selectedItem.feedbackType !== 'ai_feedback' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDecision('resolved')}
                      className={`p-2.5 rounded-xl border font-bold cursor-pointer ${
                        decision === 'resolved'
                          ? 'bg-primary-fixed text-on-primary-fixed-variant border-primary'
                          : 'border-surface-container-high'
                      }`}
                    >
                      Tiếp nhận & Giải quyết
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision('dismissed')}
                      className={`p-2.5 rounded-xl border font-bold cursor-pointer ${
                        decision === 'dismissed'
                          ? 'bg-surface-container-high border-outline'
                          : 'border-surface-container-high'
                      }`}
                    >
                      Bỏ qua (Không vi phạm)
                    </button>
                  </div>

                  {decision === 'resolved' && (
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-error-container/20 border border-error/30 text-error font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hideTarget}
                        onChange={(e) => setHideTarget(e.target.checked)}
                      />
                      <span>Đồng thời ẩn nội dung bị báo cáo khỏi ứng dụng</span>
                    </label>
                  )}

                  <div>
                    <label className="font-bold text-on-surface block mb-1">Ghi chú xử lý:</label>
                    <textarea
                      rows={3}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full p-3 rounded-lg bg-surface-container-low border border-surface-container-high/60"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                {!isReadOnly && selectedItem.feedbackType !== 'ai_feedback' && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Đang lưu...' : 'Xác nhận xử lý'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
