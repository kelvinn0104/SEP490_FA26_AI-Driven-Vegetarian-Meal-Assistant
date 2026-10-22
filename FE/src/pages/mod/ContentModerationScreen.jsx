import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { moderationApi } from '../../api';

export const ContentModerationScreen = ({ onUpdatePendingCount }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchPendingQueue = async () => {
    try {
      setLoading(true);
      const data = await moderationApi.getPending();
      setItems(data || []);
      if (onUpdatePendingCount) {
        onUpdatePendingCount(data ? data.length : 0);
      }
    } catch (err) {
      console.error('Failed to load moderation queue from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItem]);

  const pendingItems = items.filter((i) => i.status === 'pending');

  const filteredItems = pendingItems.filter((i) => {
    if (activeTab === 'all') return true;
    return i.type === activeTab;
  });

  const handleAction = async (id, newStatus) => {
    try {
      if (newStatus === 'approved') {
        await moderationApi.approve(id, 'Nội dung đạt chuẩn thuần chay và dinh dưỡng.');
        alert('Đã PHÊ DUYỆT và xuất bản nội dung thành công!');
      } else if (newStatus === 'rejected') {
        const reason = window.prompt('Nhập lý do từ chối:', 'Nội dung vi phạm tiêu chuẩn cộng đồng.');
        if (reason === null) return; // User cancelled prompt
        await moderationApi.reject(id, reason || 'Nội dung vi phạm tiêu chuẩn.');
        alert('Đã TỪ CHỐI nội dung vi phạm.');
      } else if (newStatus === 'revision') {
        const reason = window.prompt('Nhập yêu cầu cần tác giả chỉnh sửa:', 'Vui lòng bổ sung đầy đủ thông tin định lượng.');
        if (reason === null) return;
        await moderationApi.requestRevision(id, reason || 'Yêu cầu bổ sung thông tin.');
        alert('Đã gửi YÊU CẦU CHỈNH SỬA cho tác giả.');
      }

      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      await fetchPendingQueue();
    } catch (err) {
      alert(`Lỗi khi xử lý kiểm duyệt: ${err.message || 'Thao tác không thành công'}`);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
            <span>Hàng đợi kiểm duyệt tự động & chuyên gia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
            Đánh giá Dinh dưỡng & Phê duyệt Công thức
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Dữ liệu hàng đợi kiểm duyệt trực tiếp từ cơ sở dữ liệu PostgreSQL • Phân tích AI Veggie-Guard
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-error-container text-on-error-container text-xs font-bold font-mono">
            {pendingItems.length} mục đang chờ xử lý
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high/60 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-surface-container-lowest text-primary shadow-xs border border-surface-container-high'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Tất cả ({pendingItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recipe')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'recipe'
              ? 'bg-surface-container-lowest text-primary shadow-xs border border-surface-container-high'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Công thức món ({pendingItems.filter((i) => i.type === 'recipe').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'video'
              ? 'bg-surface-container-lowest text-primary shadow-xs border border-surface-container-high'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Video Thực dưỡng ({pendingItems.filter((i) => i.type === 'video').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'report'
              ? 'bg-surface-container-lowest text-error shadow-xs border border-surface-container-high'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Báo cáo vi phạm ({pendingItems.filter((i) => i.type === 'report').length})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <span className="text-xs text-on-surface-variant">Đang tải danh sách chờ duyệt từ cơ sở dữ liệu...</span>
        </div>
      )}

      {/* Items List */}
      {!loading && (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-surface-container-lowest p-5 sm:p-6 border border-surface-container-high/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {item.authorAvatar ? (
                    <img
                      src={item.authorAvatar}
                      alt={item.author}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-surface-container-high shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                          item.type === 'recipe'
                            ? 'bg-primary-fixed text-on-primary-fixed-variant'
                            : item.type === 'video'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {item.type === 'recipe'
                          ? 'Công thức mới'
                          : item.type === 'video'
                          ? 'Video tải lên'
                          : 'Báo cáo vi phạm'}
                      </span>
                      {item.plantBasedScore === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                          Khẩn cấp / Cần xử lý
                        </span>
                      )}
                      <span className="text-xs text-outline font-mono">{item.submittedAt}</span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-on-surface mt-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-outline font-medium">
                      Tác giả: <span className="text-on-surface font-semibold">{item.author}</span> • Chuyên mục: <span className="text-primary font-medium">{item.category}</span>
                    </p>
                  </div>
                </div>

                {/* AI Scores Summary Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto p-2 rounded-xl bg-surface-container-low border border-surface-container-high/40">
                  <div className="text-[11px] font-mono leading-tight">
                    <p className="text-on-surface font-bold">
                      Độ thuần thực vật: {item.plantBasedScore}%
                    </p>
                    <p className="text-outline">Độ tin cậy AI: {item.aiScore}%</p>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed bg-surface-container-low/40 p-3.5 rounded-xl border border-surface-container-high/30">
                {item.content || 'Nội dung chia sẻ công thức ẩm thực thực dưỡng đã được kiểm tra bởi thuật toán VeggieAI.'}
              </p>

              {/* Macros Breakdown if Available */}
              {item.calories > 0 && (
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono bg-surface-container-low/30 p-2.5 rounded-lg border border-surface-container-high/20">
                  <span className="text-on-surface font-bold">Dinh dưỡng / Khẩu phần:</span>
                  <span className="text-primary font-semibold">{item.calories} kcal</span>
                  <span className="text-outline">Protein: <b className="text-on-surface">{item.protein}</b></span>
                  <span className="text-outline">Carb: <b className="text-on-surface">{item.carbs}</b></span>
                  <span className="text-outline">Fat: <b className="text-on-surface">{item.fat}</b></span>
                </div>
              )}

              {/* AI Flag Reason if available */}
              {item.flagReason && (
                <div className="flex items-center gap-2 text-xs bg-surface-container-low p-2 rounded-lg text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-[16px]">info</span>
                  <span><b>Đánh giá AI:</b> {item.flagReason}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-container-high/40">
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="text-xs font-bold text-primary hover:text-primary-container flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem chi tiết nội dung đầy đủ</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(item.id, 'revision')}
                    className="px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs hover:bg-surface-container cursor-pointer transition-colors"
                  >
                    Yêu cầu sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(item.id, 'rejected')}
                    className="px-3.5 py-2 rounded-xl bg-error-container text-on-error-container font-semibold text-xs hover:bg-error-container/80 cursor-pointer transition-colors"
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(item.id, 'approved')}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-xs cursor-pointer transition-colors"
                  >
                    Phê duyệt ngay
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-16 text-center rounded-2xl bg-surface-container-lowest border border-dashed border-surface-container-high p-8">
              <span className="material-symbols-outlined text-secondary text-[48px]">
                task_alt
              </span>
              <h3 className="font-bold text-base text-on-surface mt-2">
                Hàng đợi kiểm duyệt trống!
              </h3>
              <p className="text-xs text-outline mt-1">
                Tất cả nội dung công thức và báo cáo vi phạm trong cơ sở dữ liệu đã được xử lý an toàn.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && createPortal(
        <div 
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[640px] bg-[#F8F9FE] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[90vh]"
          >
            <div className="p-6 pb-4 shrink-0 bg-[#F8F9FE]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FCE8E6] text-[#B3261E]">
                      {selectedItem.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E8DEF8] text-[#4A4458]">
                      {selectedItem.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-[20px] sm:text-[22px] text-[#1C1B1F]">
                    {selectedItem.title}
                  </h3>
                  <p className="text-[13px] text-[#49454F] mt-1">
                    Tác giả: <span className="font-bold">{selectedItem.author}</span> • Gửi lúc: <span className="font-mono">{selectedItem.submittedAt}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="text-[#49454F] hover:bg-[#EADDFF] p-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 overflow-y-auto bg-white flex-1 rounded-t-[24px]">
              <div className="pt-6 space-y-6">
                {/* AI Evaluation Banner */}
                <div className={`flex gap-4 p-4 rounded-2xl border ${selectedItem.plantBasedScore === 0 ? 'bg-[#FFF9F9] border-[#FCE8E6]' : 'bg-[#F0FDF8] border-[#A7F3D0]'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${selectedItem.plantBasedScore === 0 ? 'bg-[#B3261E]' : 'bg-[#006948]'}`}>
                    <span className="material-symbols-outlined text-[24px]">
                      {selectedItem.plantBasedScore === 0 ? 'warning' : 'verified'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-bold text-[15px] ${selectedItem.plantBasedScore === 0 ? 'text-[#B3261E]' : 'text-[#006948]'}`}>
                        {selectedItem.plantBasedScore === 0 ? 'Cảnh báo vi phạm nội dung' : 'Đánh giá AI: Đạt tiêu chuẩn thực vật'}
                      </h4>
                      <span className={`px-2 py-0.5 text-white text-[10px] font-bold rounded-full ${selectedItem.plantBasedScore === 0 ? 'bg-[#B3261E]' : 'bg-[#006948]'}`}>
                        Độ tin cậy AI: {selectedItem.aiScore}%
                      </span>
                    </div>
                    <p className="text-[13px] text-[#49454F] mt-1.5 leading-relaxed">
                      {selectedItem.flagReason || 'Công thức tuân thủ tuyệt đối quy định thuần thực vật, cân đối dinh dưỡng và an toàn với cộng đồng VeggieAI.'}
                    </p>
                  </div>
                </div>

                {/* Content Details */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#79747E] tracking-wider uppercase">Nội dung gửi kiểm duyệt</span>
                    <span className="text-[11px] font-mono text-[#79747E]">{selectedItem.submittedAt}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F8F9FE] text-[14px] text-[#1C1B1F] leading-relaxed border border-[#EADDFF]">
                    {selectedItem.content || 'Không có mô tả chi tiết'}
                  </div>
                </div>

                {/* Nutritional Data if Recipe */}
                {selectedItem.calories > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-surface-container-low text-center">
                      <span className="text-[11px] text-outline block">Calo</span>
                      <span className="text-base font-bold text-primary font-mono">{selectedItem.calories} kcal</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low text-center">
                      <span className="text-[11px] text-outline block">Chất đạm</span>
                      <span className="text-base font-bold text-on-surface font-mono">{selectedItem.protein}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low text-center">
                      <span className="text-[11px] text-outline block">Carbohydrate</span>
                      <span className="text-base font-bold text-on-surface font-mono">{selectedItem.carbs}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low text-center">
                      <span className="text-[11px] text-outline block">Chất béo</span>
                      <span className="text-base font-bold text-on-surface font-mono">{selectedItem.fat}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-[#EADDFF] flex flex-wrap items-center justify-end shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-[14px] text-[#49454F] font-semibold hover:bg-[#F4F4F4] rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleAction(selectedItem.id, 'revision')}
                className="px-4 py-2 text-[14px] rounded-xl bg-surface-container-low text-on-surface font-bold hover:bg-surface-container transition-colors cursor-pointer"
              >
                Yêu cầu sửa
              </button>
              <button
                type="button"
                onClick={() => handleAction(selectedItem.id, 'rejected')}
                className="px-4 py-2 rounded-xl bg-[#B3261E] text-white font-bold text-[14px] hover:bg-[#8C1D18] transition-colors shadow-sm cursor-pointer"
              >
                Từ chối
              </button>
              <button
                type="button"
                onClick={() => handleAction(selectedItem.id, 'approved')}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-[14px] hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
              >
                Phê duyệt ngay
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
