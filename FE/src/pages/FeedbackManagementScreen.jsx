import React, { useState, useMemo } from 'react';

const INITIAL_FEEDBACKS = [
  {
    id: 'fb-1',
    feedbackType: 'report',
    reporterName: 'BS. Lê Minh Hoàng',
    reporterEmail: 'hoang.le@vinmec.com',
    reporterAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=120&q=80',
    category: 'nutrition_misinformation',
    categoryLabel: 'Sai lệch Dinh dưỡng',
    targetTitle: 'Nước ép cần tây trị dứt điểm thiếu máu không cần bổ sung sắt',
    content: 'Tác giả bài viết tuyên bố chỉ cần uống 500ml nước ép cần tây mỗi ngày là khỏi thiếu máu. Cần tây chứa rất ít sắt non-heme và không thể thay thế phác đồ điều trị thiếu máu thiếu sắt.',
    status: 'open',
    createdAt: '08:15 Hôm nay',
  },
  {
    id: 'fb-2',
    feedbackType: 'ai_feedback',
    reporterName: 'Phạm Thị Thùy Linh',
    reporterEmail: 'thuylinh.pham@gmail.com',
    reporterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    category: 'ai_accuracy',
    categoryLabel: 'Độ chính xác AI',
    targetTitle: 'AI Tư vấn thực đơn cho người dị ứng Đậu nành nghiêm trọng',
    content: 'Tôi đã thiết lập hồ sơ dị ứng đậu nành cấp độ cao nhưng chatbot AI vẫn gợi ý món Súp đậu phụ miso cho bữa tối.',
    rating: 2,
    isAccurate: false,
    status: 'open',
    createdAt: 'Hôm qua',
  },
  {
    id: 'fb-3',
    feedbackType: 'report',
    reporterName: 'Trần Văn Tuấn',
    reporterEmail: 'tuantran@gmail.com',
    reporterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    category: 'spam',
    categoryLabel: 'Spam & Quảng cáo',
    targetTitle: 'Bình luận spam link bán thực phẩm chức năng giảm cân siêu tốc',
    content: 'Tài khoản này liên tục spam đường dẫn mua trà giảm cân không rõ nguồn gốc trong các bài đăng công thức nấu ăn.',
    status: 'resolved',
    createdAt: '06/11/2026',
  },
  {
    id: 'fb-4',
    feedbackType: 'report',
    reporterName: 'Đặng Ngọc Mai',
    reporterEmail: 'mai.dang@gmail.com',
    reporterAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    category: 'nutrition_misinformation',
    categoryLabel: 'Sai lệch Dinh dưỡng',
    targetTitle: 'Ăn chay hoàn toàn không cần quan tâm đến Vitamin B12',
    content: 'Bài viết khẳng định cơ thể tự sinh được B12 từ vi khuẩn đường ruột nên không cần uống men dinh dưỡng hay viên uống. Điều này đi ngược lại khuyến cáo của WHO.',
    status: 'open',
    createdAt: '05/11/2026',
  },
  {
    id: 'fb-5',
    feedbackType: 'ai_feedback',
    reporterName: 'Nguyễn Quốc Bảo',
    reporterEmail: 'baonq@gmail.com',
    reporterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    category: 'ai_accuracy',
    categoryLabel: 'Độ chính xác AI',
    targetTitle: 'Gợi ý kế hoạch Macro tăng cơ 70g Protein',
    content: 'Công thức và bảng phân bổ bữa ăn đạm thực vật từ đậu gà, tempeh và quinoa của AI rất khoa học, dễ nấu và no lâu.',
    rating: 5,
    isAccurate: true,
    status: 'resolved',
    createdAt: '04/11/2026',
  },
];

export const FeedbackManagementScreen = ({ userRole = 'admin' }) => {
  const [feedbacks, setFeedbacks] = useState(INITIAL_FEEDBACKS);

  // Filters
  const [activeTab, setActiveTab] = useState(userRole === 'mod' ? 'nutrition_misinformation' : 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolution modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [decision, setDecision] = useState('resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [hideTarget, setHideTarget] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic stats
  const stats = useMemo(() => {
    const totalReports = feedbacks.length;
    const openReports = feedbacks.filter((f) => f.status === 'open').length;
    const resolvedReports = feedbacks.filter((f) => f.status === 'resolved').length;
    const dismissedReports = feedbacks.filter((f) => f.status === 'dismissed').length;
    const nutritionMisinformationCount = feedbacks.filter(
      (f) => f.category === 'nutrition_misinformation' && f.status === 'open'
    ).length;
    const spamPolicyCount = feedbacks.filter((f) => f.category === 'spam').length;
    return {
      totalReports,
      openReports,
      resolvedReports,
      dismissedReports,
      nutritionMisinformationCount,
      spamPolicyCount,
      avgAiSatisfaction: 4.6,
    };
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      // Tab filter
      if (activeTab === 'nutrition_misinformation' && item.category !== 'nutrition_misinformation') return false;
      if (activeTab === 'spam' && item.category !== 'spam') return false;
      if (activeTab === 'ai_feedback' && item.feedbackType !== 'ai_feedback') return false;

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesReporter = item.reporterName.toLowerCase().includes(q) || item.reporterEmail.toLowerCase().includes(q);
        const matchesTarget = item.targetTitle.toLowerCase().includes(q);
        const matchesContent = item.content.toLowerCase().includes(q);
        if (!matchesReporter && !matchesTarget && !matchesContent) return false;
      }

      return true;
    });
  }, [feedbacks, activeTab, statusFilter, searchQuery]);

  const handleOpenResolve = (item) => {
    setSelectedItem(item);
    setDecision('resolved');
    setResolutionNote(
      item.category === 'nutrition_misinformation'
        ? 'Chuyên gia dinh dưỡng đã thẩm định và yêu cầu tác giả cập nhật định lượng vi chất chuẩn xác.'
        : 'Đã xử lý nội dung vi phạm tiêu chuẩn cộng đồng VeggieAI.'
    );
    setHideTarget(item.category === 'nutrition_misinformation' || item.category === 'spam');
  };

  const handleConfirmResolve = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === selectedItem.id && f.feedbackType === selectedItem.feedbackType
            ? { ...f, status: decision }
            : f
        )
      );

      setIsSubmitting(false);
      setSelectedItem(null);
    }, 200);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">rate_review</span>
            <span>Tiếp nhận Phản ánh • Thẩm định Dinh dưỡng &amp; Chính sách</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
            Quản lý Phản hồi &amp; Báo cáo Vi phạm
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Xử lý khiếu nại sai lệch kiến thức dinh dưỡng (Mod), vi phạm chính sách cộng đồng (Admin) và đánh giá AI
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-error-container text-on-error-container text-xs font-bold font-mono">
            {stats.openReports} báo cáo chờ xử lý
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-outline uppercase font-semibold">Tổng Phản hồi &amp; Báo cáo</span>
          <p className="text-2xl font-bold text-on-surface font-mono mt-1">{stats.totalReports}</p>
          <span className="text-[10px] text-on-surface-variant mt-1">Đã giải quyết: {stats.resolvedReports} mục</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-error/20 shadow-xs flex flex-col justify-between ring-1 ring-error/20">
          <span className="text-[11px] text-error uppercase font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
            Sai Lệch Dinh Dưỡng
          </span>
          <p className="text-2xl font-bold text-error font-mono mt-1">{stats.nutritionMisinformationCount}</p>
          <span className="text-[10px] text-on-surface-variant mt-1">Dành riêng cho Chuyên gia Dinh dưỡng (Mod)</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-outline uppercase font-semibold">Spam &amp; Vi Phạm Chính Sách</span>
          <p className="text-2xl font-bold text-secondary font-mono mt-1">{stats.spamPolicyCount}</p>
          <span className="text-[10px] text-on-surface-variant mt-1">Quảng cáo rác, liên kết độc hại (Admin)</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-outline uppercase font-semibold">Đánh Giá AI Từ Chuyên Gia</span>
          <p className="text-2xl font-bold text-tertiary font-mono mt-1 flex items-baseline gap-1">
            <span>{stats.avgAiSatisfaction}</span>
            <span className="text-xs font-normal text-outline">/ 5.0 ⭐</span>
          </p>
          <span className="text-[10px] text-tertiary font-semibold mt-1">Độ chính xác vi chất &amp; thực đơn AI</span>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 border-b border-surface-container-high/60 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-surface-container-lowest text-primary shadow-xs border border-surface-container-high'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Tất cả phản hồi ({stats.totalReports})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nutrition_misinformation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'nutrition_misinformation'
              ? 'bg-error-container text-on-error-container shadow-xs font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>🥗 Sai lệch Dinh dưỡng</span>
          {stats.nutritionMisinformationCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-error text-white text-[10px] font-mono font-bold">
              {stats.nutritionMisinformationCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('spam')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'spam'
              ? 'bg-surface-container-lowest text-primary shadow-xs border border-surface-container-high'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          🚫 Spam &amp; Quảng cáo ({stats.spamPolicyCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai_feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ai_feedback'
              ? 'bg-surface-container-lowest text-tertiary shadow-xs border border-surface-container-high font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          🤖 Đánh giá Gợi ý AI
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo nội dung, người báo cáo, đối tượng..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface placeholder:text-outline border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="open">Chờ xử lý (Open)</option>
            <option value="resolved">Đã giải quyết (Resolved)</option>
            <option value="dismissed">Đã bỏ qua (Dismissed)</option>
          </select>
        </div>

        <span className="text-xs text-outline font-mono">
          Hiển thị <b>{filteredFeedbacks.length}</b> / {feedbacks.length} phản hồi
        </span>
      </div>

      {/* Data Table */}
      <div className="rounded-xl bg-surface-container-lowest p-5 shadow-xs border border-surface-container-high/40 overflow-hidden">
        {filteredFeedbacks.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-outline gap-2">
            <span className="material-symbols-outlined text-[40px] text-secondary">verified</span>
            <p className="text-sm font-semibold text-on-surface">Không có phản hồi nào cần xử lý</p>
            <p className="text-xs">Tất cả báo cáo vi phạm đã được giải quyết hoặc chưa có khiếu nại mới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3 rounded-l-lg">Người báo cáo</th>
                  <th className="py-2.5 px-3">Phân loại &amp; Đối tượng</th>
                  <th className="py-2.5 px-3">Nội dung phản ánh</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {filteredFeedbacks.map((item) => (
                  <tr key={`${item.feedbackType}-${item.id}`} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* Reporter */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.reporterAvatar}
                          alt={item.reporterName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container-high shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-surface">{item.reporterName}</span>
                          <span className="text-[10px] text-outline font-mono">{item.reporterEmail}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Target */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 max-w-[200px]">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                          item.category === 'nutrition_misinformation'
                            ? 'bg-error-container text-on-error-container'
                            : item.category === 'spam'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : item.category === 'ai_accuracy'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {item.categoryLabel}
                        </span>
                        <span className="text-xs font-semibold text-on-surface truncate" title={item.targetTitle}>
                          {item.targetTitle}
                        </span>
                      </div>
                    </td>

                    {/* Content / Reason */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 max-w-[340px]">
                        {item.rating && (
                          <div className="flex items-center gap-1 text-tertiary font-bold text-[11px]">
                            <span>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                            <span className="text-[10px] text-outline font-normal">
                              ({item.isAccurate ? 'Chính xác' : 'Cần chỉnh sửa vi chất'})
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-on-surface line-clamp-2 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {item.status === 'open' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                          Chờ xử lý
                        </span>
                      )}
                      {item.status === 'resolved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[11px] font-bold">
                          <span className="material-symbols-outlined text-[13px]">check</span>
                          Đã xử lý
                        </span>
                      )}
                      {item.status === 'dismissed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-outline text-[11px] font-semibold">
                          Đã bỏ qua
                        </span>
                      )}
                    </td>

                    {/* Time */}
                    <td className="py-3 px-3 font-mono text-[11px] text-outline">
                      {item.createdAt}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-right">
                      {item.status === 'open' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenResolve(item)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-colors cursor-pointer"
                        >
                          Xử lý
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenResolve(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-xs font-medium hover:bg-surface-container-high transition-colors cursor-pointer"
                        >
                          Xem lại
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60 bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-error text-[22px]">gavel</span>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    Thẩm định &amp; Xử lý Báo cáo
                  </h3>
                  <p className="text-xs text-outline">{selectedItem.categoryLabel} • #{selectedItem.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmResolve} className="p-6 space-y-4 text-xs">
              {/* Report Summary */}
              <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-surface-container-high/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">Người gửi: {selectedItem.reporterName}</span>
                  <span className="font-mono text-outline">{selectedItem.createdAt}</span>
                </div>
                <div>
                  <span className="text-outline text-[11px] block">Đối tượng bị phản ánh:</span>
                  <strong className="text-primary text-xs">{selectedItem.targetTitle}</strong>
                </div>
                <div className="pt-1 text-on-surface leading-relaxed bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high/40">
                  <span className="text-outline block mb-1 font-semibold">Nội dung khiếu nại:</span>
                  "{selectedItem.content}"
                </div>
              </div>

              {/* Action Decision */}
              <div className="space-y-1.5">
                <label className="font-bold text-on-surface block">Quyết định xử lý:</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    onClick={() => setDecision('resolved')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                      decision === 'resolved'
                        ? 'bg-primary-fixed text-on-primary-fixed-variant border-primary'
                        : 'bg-surface-container-lowest text-on-surface border-surface-container-high'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === 'resolved'}
                      onChange={() => setDecision('resolved')}
                      className="text-primary"
                    />
                    <span>Tiếp nhận &amp; Giải quyết</span>
                  </label>

                  <label
                    onClick={() => setDecision('dismissed')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                      decision === 'dismissed'
                        ? 'bg-surface-container-high text-on-surface border-outline'
                        : 'bg-surface-container-lowest text-on-surface border-surface-container-high'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === 'dismissed'}
                      onChange={() => setDecision('dismissed')}
                      className="text-outline"
                    />
                    <span>Bỏ qua (Không vi phạm)</span>
                  </label>
                </div>
              </div>

              {/* Checkbox: Hide content */}
              {decision === 'resolved' && (
                <label className="flex items-center gap-2 p-3 rounded-xl bg-error-container/20 border border-error/30 text-error font-semibold text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideTarget}
                    onChange={(e) => setHideTarget(e.target.checked)}
                    className="rounded text-error focus:ring-error"
                  />
                  <span>Đồng thời gỡ / ẩn nội dung này khỏi ứng dụng cộng đồng</span>
                </label>
              )}

              {/* Resolution Note */}
              <div className="space-y-1">
                <label className="font-bold text-on-surface block">
                  Nội dung phản hồi / Ghi chú xử lý:
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Nhập nội dung phản hồi gửi đến người dùng hoặc lý do xử lý..."
                  className="w-full p-3 rounded-lg bg-surface-container-low text-xs border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container-high/40">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận xử lý'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

