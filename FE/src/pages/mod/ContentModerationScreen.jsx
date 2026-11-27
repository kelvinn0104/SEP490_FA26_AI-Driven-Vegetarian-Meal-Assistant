import React, { useState, useEffect } from 'react';
import { moderationApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  SuperAdminReadOnlyBanner,
  ApiErrorBanner,
} from '../../components/ui/OperationalHelpers';

export const ContentModerationScreen = ({ readOnly = false, onUpdatePendingCount }) => {
  const { isSuperAdmin } = useAuth();
  const isReadOnly = readOnly || isSuperAdmin;

  const [viewMode, setViewMode] = useState('pending'); // 'pending' | 'history'
  const [items, setItems] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      setError('');
      const [pendingRes, historyRes] = await Promise.all([
        moderationApi.getPending(),
        moderationApi.getHistory(40),
      ]);
      const pendingArr = Array.isArray(pendingRes) ? pendingRes : [];
      setItems(pendingArr);
      setHistoryItems(Array.isArray(historyRes) ? historyRes : []);
      if (onUpdatePendingCount) {
        onUpdatePendingCount(pendingArr.length);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu kiểm duyệt từ cơ sở dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  const sourceList = viewMode === 'pending' ? items : historyItems;
  const filteredItems = sourceList.filter((i) => {
    if (activeTab === 'all') return true;
    return i.type === activeTab;
  });

  const handleAction = async (id, newStatus) => {
    if (isReadOnly) return;
    try {
      setError('');
      if (newStatus === 'approved') {
        await moderationApi.approve(id, 'Nội dung đạt chuẩn thuần chay và dinh dưỡng.');
      } else if (newStatus === 'rejected') {
        const reason = window.prompt('Nhập lý do từ chối:', 'Nội dung vi phạm tiêu chuẩn cộng đồng.');
        if (reason === null) return;
        await moderationApi.reject(id, reason || 'Nội dung vi phạm tiêu chuẩn.');
      } else if (newStatus === 'revision') {
        const reason = window.prompt(
          'Nhập yêu cầu cần tác giả chỉnh sửa:',
          'Vui lòng bổ sung đầy đủ thông tin định lượng.'
        );
        if (reason === null) return;
        await moderationApi.requestRevision(id, reason || 'Yêu cầu bổ sung thông tin.');
      }

      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      await fetchModerationData();
    } catch (err) {
      setError(err.message || 'Lỗi khi xử lý kiểm duyệt.');
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <SuperAdminReadOnlyBanner readOnly={isReadOnly} />
      <ApiErrorBanner error={error} onDismiss={() => setError('')} onRetry={fetchModerationData} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Kiểm duyệt Nội dung & Công thức Chay
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Duyệt công thức, bài viết và lưu vết lịch sử xử lý trực tiếp vào bảng ModerationLogs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-surface-container">
            <button
              type="button"
              onClick={() => setViewMode('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                viewMode === 'pending'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant'
              }`}
            >
              Chờ duyệt ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                viewMode === 'history'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant'
              }`}
            >
              Lịch sử đã xử lý ({historyItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high/60 pb-1 overflow-x-auto">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'recipe', label: 'Công thức món' },
          { id: 'blog', label: 'Bài viết cộng đồng' },
          { id: 'video', label: 'Video' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-surface-container-high'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <span className="text-xs text-on-surface-variant">Đang tải dữ liệu kiểm duyệt...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={`${item.id}-${item.reviewedAt || 'pending'}`}
              className="rounded-2xl bg-surface-container-lowest p-5 border border-surface-container-high/50 shadow-xs flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold uppercase">
                      {item.type}
                    </span>
                    <span className="text-xs text-outline font-mono">{item.submittedAt}</span>
                    {viewMode === 'history' && item.decision && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.decision === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.decision === 'rejected'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Quyết định: {item.decision} • Duyệt bởi {item.reviewedBy || 'Mod'} ({item.reviewedAt})
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-on-surface mt-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-outline font-medium">
                    Tác giả: <b className="text-on-surface">{item.author}</b> • Danh mục:{' '}
                    <span className="text-primary font-semibold">{item.category}</span>
                  </p>
                </div>

                {item.calories > 0 && (
                  <div className="text-xs font-mono bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container-high/40">
                    <b className="text-primary">{item.calories} kcal</b> • P: {item.protein} • C: {item.carbs}
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed bg-surface-container-low/40 p-3.5 rounded-xl border border-surface-container-high/30 line-clamp-3">
                {item.content || 'Không có mô tả chi tiết.'}
              </p>

              {item.flagReason && (
                <div className="text-xs bg-surface-container-low p-2.5 rounded-lg text-on-surface-variant">
                  <b>Ghi chú kiểm duyệt:</b> {item.flagReason}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container-high/40">
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem chi tiết nội dung</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>

                {!isReadOnly && viewMode === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction(item.id, 'revision')}
                      className="px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs hover:bg-surface-container cursor-pointer"
                    >
                      Yêu cầu sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(item.id, 'rejected')}
                      className="px-3.5 py-2 rounded-xl bg-error-container text-on-error-container font-semibold text-xs cursor-pointer"
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(item.id, 'approved')}
                      className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer"
                    >
                      Phê duyệt ngay
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-16 text-center rounded-2xl bg-surface-container-lowest border border-dashed border-surface-container-high p-8">
              <span className="material-symbols-outlined text-secondary text-[48px]">task_alt</span>
              <h3 className="font-bold text-base text-on-surface mt-2">
                {viewMode === 'pending'
                  ? 'Hàng đợi kiểm duyệt trống!'
                  : 'Chưa có lịch sử kiểm duyệt nào được ghi nhận.'}
              </h3>
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-surface-container-high/50 pb-3">
              <div>
                <span className="text-xs font-mono text-primary font-bold">{selectedItem.id}</span>
                <h3 className="font-bold text-lg text-on-surface">{selectedItem.title}</h3>
                <p className="text-xs text-outline">
                  Tác giả: {selectedItem.author} • {selectedItem.submittedAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm text-on-surface whitespace-pre-line leading-relaxed">
              {selectedItem.content || 'Không có nội dung chi tiết.'}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              {!isReadOnly && viewMode === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleAction(selectedItem.id, 'rejected')}
                    className="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-bold cursor-pointer"
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(selectedItem.id, 'approved')}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
                  >
                    Phê duyệt
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
