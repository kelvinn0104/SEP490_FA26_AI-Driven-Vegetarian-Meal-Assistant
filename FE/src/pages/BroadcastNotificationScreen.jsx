import React, { useState, useMemo } from 'react';

const INITIAL_BROADCASTS = [
  {
    id: 'bc-1',
    title: 'Mẹo Dinh Dưỡng: Bổ sung Vitamin B12 khoa học cho người ăn thuần chay',
    message: 'Vitamin B12 không tự tổng hợp được từ rau củ tự nhiên. Chuyên gia khuyến nghị bổ sung men dinh dưỡng tăng cường B12 hoặc viên ngậm methylcobalamin định kỳ.',
    type: 'tip',
    targetAudience: 'all',
    targetAudienceLabel: 'Toàn bộ hội viên (3,840 người)',
    status: 'sent',
    createdAt: '08:00 Hôm nay',
    openRate: 54.2,
    clickCount: 680,
    actionUrl: '/ingredient-management',
  },
  {
    id: 'bc-2',
    title: 'Khởi động Thử thách 21 Ngày Khởi Đầu Chay - Nhận Huy Hiệu Mầm Xanh',
    message: 'Chiến dịch thói quen thuần chay mới đã mở! Đăng ký ngay để nhận cẩm nang thực đơn 3 tuần và tích lũy điểm Mầm Xanh đổi quà.',
    type: 'challenge',
    targetAudience: 'beginners',
    targetAudienceLabel: 'Hội viên mới bắt đầu ăn chay',
    status: 'scheduled',
    scheduledAt: '09:00 Ngày mai',
    createdAt: 'Hôm qua',
    openRate: 0,
    clickCount: 0,
    actionUrl: '/challenge-management',
  },
  {
    id: 'bc-3',
    title: 'Cảnh báo dị ứng: Đậu nành trong sản phẩm Tempeh & Tofu chế biến sẵn',
    message: 'Hệ thống vừa cập nhật danh mục cảnh báo dị ứng. Hội viên có tiền sử dị ứng đậu nành vui lòng kiểm tra lại nhãn sản phẩm trước khi chế biến.',
    type: 'urgent',
    targetAudience: 'all',
    targetAudienceLabel: 'Toàn bộ hội viên (3,840 người)',
    status: 'sent',
    createdAt: '05/11/2026',
    openRate: 68.9,
    clickCount: 1420,
    actionUrl: '/ingredient-management',
  },
  {
    id: 'bc-4',
    title: 'Công thức mới: Cơm gạo lứt đậu gà sốt nấm đông cô giàu đạm',
    message: 'Món ăn mới cung cấp 19g Protein và đầy đủ vi chất sắt, kẽm cho bữa trưa văn phòng tràn đầy năng lượng.',
    type: 'recipe',
    targetAudience: 'all',
    targetAudienceLabel: 'Toàn bộ hội viên (3,840 người)',
    status: 'draft',
    createdAt: '03/11/2026',
    openRate: 0,
    clickCount: 0,
    actionUrl: '/recipe-management',
  },
];

export const BroadcastNotificationScreen = () => {
  const [broadcasts, setBroadcasts] = useState(INITIAL_BROADCASTS);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Compose / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formType, setFormType] = useState('tip');
  const [formAudience, setFormAudience] = useState('all');
  const [formSendMode, setFormSendMode] = useState('now'); // 'now', 'schedule', 'draft'
  const [formScheduleDate, setFormScheduleDate] = useState('');
  const [formActionUrl, setFormActionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    const totalSent = broadcasts.filter((b) => b.status === 'sent').length;
    const scheduledCount = broadcasts.filter((b) => b.status === 'scheduled').length;
    const totalClicks = broadcasts.reduce((sum, b) => sum + (b.clickCount || 0), 0);
    const sentList = broadcasts.filter((b) => b.status === 'sent');
    const avgOpenRate = sentList.length > 0
      ? (sentList.reduce((sum, b) => sum + (b.openRate || 0), 0) / sentList.length).toFixed(1)
      : '0.0';
    return {
      totalSent,
      scheduledCount,
      avgOpenRate,
      totalClicks,
    };
  }, [broadcasts]);

  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesMsg = item.message.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg) return false;
      }
      return true;
    });
  }, [broadcasts, statusFilter, typeFilter, searchQuery]);

  const handleOpenCompose = () => {
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
    setEditingItem(item);
    setFormTitle(item.title);
    setFormMessage(item.message);
    setFormType(item.type);
    setFormAudience(item.targetAudience);
    setFormSendMode(item.status === 'scheduled' ? 'schedule' : item.status === 'draft' ? 'draft' : 'now');
    setFormScheduleDate(item.scheduledAt || '');
    setFormActionUrl(item.actionUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveBroadcast = (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMessage.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung thông báo');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const statusValue = formSendMode === 'schedule' ? 'scheduled' : formSendMode === 'draft' ? 'draft' : 'sent';
      const audienceLabels = {
        all: 'Toàn bộ hội viên (3,840 người)',
        challenge_participants: 'Đang tham gia Thử thách (442 người)',
        beginners: 'Hội viên mới bắt đầu ăn chay',
        fitness: 'Nhóm Thể thao & Tăng cơ',
      };

      const payload = {
        title: formTitle.trim(),
        message: formMessage.trim(),
        type: formType,
        targetAudience: formAudience,
        targetAudienceLabel: audienceLabels[formAudience] || 'Hội viên',
        status: statusValue,
        scheduledAt: formSendMode === 'schedule' ? formScheduleDate || '09:00 Ngày mai' : null,
        actionUrl: formActionUrl.trim() || null,
        createdAt: 'Hôm nay',
        openRate: statusValue === 'sent' ? 45.0 : 0,
        clickCount: 0,
      };

      if (editingItem) {
        setBroadcasts((prev) =>
          prev.map((b) => (b.id === editingItem.id ? { ...b, ...payload } : b))
        );
      } else {
        setBroadcasts((prev) => [
          {
            id: `bc-${Date.now()}`,
            ...payload,
          },
          ...prev,
        ]);
      }

      setIsSubmitting(false);
      setIsModalOpen(false);
    }, 200);
  };

  const handleSendNow = (item) => {
    if (window.confirm(`Bạn có chắc muốn phát sóng thông báo "${item.title}" đến toàn bộ ${item.targetAudienceLabel} ngay bây giờ?`)) {
      setBroadcasts((prev) =>
        prev.map((b) =>
          b.id === item.id ? { ...b, status: 'sent', openRate: 48.5, createdAt: 'Vừa xong' } : b
        )
      );
    }
  };

  const handleDelete = (item) => {
    if (window.confirm(`Xác nhận xoá thông báo "${item.title}"?`)) {
      setBroadcasts((prev) => prev.filter((b) => b.id !== item.id));
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'tip':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
            <span className="material-symbols-outlined text-[13px]">lightbulb</span>
            Mẹo Dinh Dưỡng
          </span>
        );
      case 'challenge':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[13px]">military_tech</span>
            Thử Thách
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
            <span className="material-symbols-outlined text-[13px]">warning</span>
            Cảnh Báo
          </span>
        );
      case 'recipe':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
            <span className="material-symbols-outlined text-[13px]">restaurant_menu</span>
            Công Thức Mới
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant">
            Thông Báo
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã Phát Sóng
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-sky-50 text-sky-700">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            Hẹn Giờ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-surface-container-high text-on-surface-variant">
            Bản Nháp
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-sky-950/20 via-sky-900/10 to-transparent p-6 rounded-2xl border border-sky-500/20">
        <div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-sm mb-1">
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            Trung Tâm Thông Báo Đẩy &amp; Bản Tin Dinh Dưỡng (Broadcast Hub)
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Quản Lý Phát Sóng &amp; Mẹo Dinh Dưỡng Khoa Học
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Soạn và gửi thông báo tức thời hoặc hẹn giờ đến hàng nghìn người dùng mobile/web, phổ biến mẹo hấp thu vi chất, nhắc nhở điểm danh thử thách và công thức thuần chay mới.
          </p>
        </div>

        <button
          onClick={handleOpenCompose}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-all shadow-xs shrink-0 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add_alert</span>
          Soạn Thông Báo Mới
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Đã Phát Sóng Thành Công
            </div>
            <div className="text-2xl font-bold text-on-surface mt-1">
              {stats.totalSent} <span className="text-xs font-normal text-on-surface-variant">chiến dịch</span>
            </div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              Tiếp cận 100% mục tiêu
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[26px]">send</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Hẹn Giờ Tự Động
            </div>
            <div className="text-2xl font-bold text-sky-600 mt-1">
              {stats.scheduledCount} <span className="text-xs font-normal text-on-surface-variant">bản tin</span>
            </div>
            <div className="text-xs text-sky-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              Chuẩn bị phát sóng
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
            <span className="material-symbols-outlined text-[26px]">schedule_send</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Tỷ Lệ Mở Trung Bình (Open Rate)
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.avgOpenRate}%
            </div>
            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">mark_email_read</span>
              Cao gấp 2 lần mức chuẩn ngành
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[26px]">visibility</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Lượt Nhấp &amp; Đọc Chi Tiết
            </div>
            <div className="text-2xl font-bold text-on-surface mt-1">
              {stats.totalClicks.toLocaleString('vi-VN')}
            </div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">touch_app</span>
              Tương tác mạnh mẽ
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined text-[26px]">ads_click</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[260px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm thông báo theo tiêu đề hoặc nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface rounded-lg border border-surface-container-high focus:outline-none focus:border-primary transition-all text-on-surface"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="sent">Đã phát sóng (Sent)</option>
            <option value="scheduled">Hẹn giờ (Scheduled)</option>
            <option value="draft">Bản nháp (Draft)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả phân loại</option>
            <option value="tip">Mẹo Dinh Dưỡng Khoa Học</option>
            <option value="challenge">Nhắc Nhở Thử Thách</option>
            <option value="urgent">Cảnh Báo &amp; Dị Ứng</option>
            <option value="recipe">Công Thức Mới</option>
          </select>
        </div>
      </div>

      {/* Broadcast List */}
      {filteredBroadcasts.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">
            notifications_off
          </span>
          <h3 className="text-base font-semibold text-on-surface">Không có thông báo nào</h3>
          <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
            Không tìm thấy thông báo phù hợp với bộ lọc. Hãy tạo bản tin dinh dưỡng đầu tiên để gửi tới người dùng!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBroadcasts.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs p-5 hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Info */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {getTypeBadge(item.type)}
                  {getStatusBadge(item.status)}
                  <span className="text-xs text-on-surface-variant">• {item.createdAt}</span>
                </div>

                <h3 className="text-base font-bold text-on-surface">{item.title}</h3>

                <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl">
                  {item.message}
                </p>

                {/* Footer details */}
                <div className="flex items-center gap-4 text-xs text-on-surface pt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-primary">groups</span>
                    Đối tượng: <strong className="text-on-surface">{item.targetAudienceLabel}</strong>
                  </span>

                  {item.status === 'scheduled' && item.scheduledAt && (
                    <span className="flex items-center gap-1 font-semibold text-sky-600">
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      Hẹn phát sóng: {item.scheduledAt}
                    </span>
                  )}

                  {item.actionUrl && (
                    <span className="text-xs text-primary font-mono truncate max-w-xs">
                      🔗 {item.actionUrl}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Performance & Actions */}
              <div className="flex flex-col md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-surface-container-high">
                {/* Stats Pill */}
                {item.status === 'sent' && (
                  <div className="flex items-center gap-3 bg-surface p-2.5 rounded-xl border border-surface-container-high/60 text-xs">
                    <div className="text-center">
                      <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Mở xem</span>
                      <span className="font-bold text-emerald-600">{item.openRate}%</span>
                    </div>
                    <div className="w-px h-6 bg-surface-container-high" />
                    <div className="text-center">
                      <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Nhấp link</span>
                      <span className="font-bold text-primary">{item.clickCount}</span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {item.status !== 'sent' && (
                    <button
                      onClick={() => handleSendNow(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="Gửi ngay thông báo này đến người dùng"
                    >
                      <span className="material-symbols-outlined text-[15px]">send</span>
                      Phát Sóng Ngay
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Xoá thông báo"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">campaign</span>
                <h3 className="text-base font-bold text-on-surface">
                  {editingItem ? 'Chỉnh Sửa Bản Tin Thông Báo' : 'Soạn Thông Báo Phát Sóng Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveBroadcast} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Tiêu Đề Thông Báo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Mẹo Dinh Dưỡng Hôm Nay: Bổ sung B12 đúng cách..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Nội Dung Thông Điệp ({formMessage.length}/300 ký tự) *
                </label>
                <textarea
                  rows={4}
                  required
                  maxLength={300}
                  placeholder="Viết nội dung ngắn gọn, súc tích và hữu ích cho người ăn chay..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Phân Loại
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    <option value="tip">Mẹo Dinh Dưỡng Khoa Học</option>
                    <option value="challenge">Nhắc Nhở Thử Thách</option>
                    <option value="urgent">Cảnh Báo &amp; Dị Ứng</option>
                    <option value="recipe">Công Thức Thuần Chay Mới</option>
                    <option value="event">Sự Kiện &amp; Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Đối Tượng Nhận
                  </label>
                  <select
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    <option value="all">Toàn bộ hội viên (3,840 người)</option>
                    <option value="challenge_participants">Đang tham gia Thử thách (442 người)</option>
                    <option value="beginners">Hội viên mới bắt đầu ăn chay</option>
                    <option value="fitness">Nhóm Thể thao &amp; Tăng cơ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Đường Dẫn Đích Khi Nhấp (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: /challenge-management hoặc /ingredient-management"
                  value={formActionUrl}
                  onChange={(e) => setFormActionUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              {/* Send Mode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Phương Thức Phát Sóng
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormSendMode('now')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      formSendMode === 'now'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    Gửi Ngay
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormSendMode('schedule')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      formSendMode === 'schedule'
                        ? 'bg-sky-50 text-sky-800 border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                        : 'border-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    Hẹn Giờ
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormSendMode('draft')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      formSendMode === 'draft'
                        ? 'bg-surface-container-high text-on-surface border-primary'
                        : 'border-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">edit_note</span>
                    Lưu Nháp
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant text-xs font-medium hover:bg-surface-container cursor-pointer"
                >
                  Huỷ Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Đang xử lý...' : formSendMode === 'now' ? 'Phát Sóng Tức Thì' : 'Lưu Thông Báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

