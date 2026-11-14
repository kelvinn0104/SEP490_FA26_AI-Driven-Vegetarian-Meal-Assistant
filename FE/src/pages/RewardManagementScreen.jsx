import React, { useState, useMemo } from 'react';

const INITIAL_REWARDS = [
  {
    id: 'rw-1',
    title: 'Voucher Giảm 50.000đ tại Nhà Hàng Chay Veggie Garden',
    description: 'Áp dụng cho hóa đơn từ 200.000đ tại tất cả chi nhánh thuộc chuỗi Veggie Garden.',
    pointsRequired: 500,
    stockQuantity: 45,
    claimedQuantity: 28,
    category: 'voucher',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
  {
    id: 'rw-2',
    title: 'Ebook Cẩm Nang 100 Công Thức Món Chay Chuẩn Đa Lượng & Vi Chất',
    description: 'Tài liệu độc quyền do chuyên gia dinh dưỡng VeggieAI biên soạn với bảng tính macro chi tiết.',
    pointsRequired: 350,
    stockQuantity: 999,
    claimedQuantity: 112,
    category: 'ebook',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
  {
    id: 'rw-3',
    title: 'Hộp Hạt Dinh Dưỡng Hữu Cơ Granola Tự Nhiên (500g)',
    description: 'Gồm yến mạch, hạt chia, hạnh nhân, hạt điều sấy giòn không đường tinh luyện.',
    pointsRequired: 1200,
    stockQuantity: 18,
    claimedQuantity: 14,
    category: 'physical',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
  {
    id: 'rw-4',
    title: 'Gói Hạt Giống Rau Cải Xoăn Kale & Cải Bó Xôi Trồng Tại Nhà',
    description: 'Hạt giống hữu cơ F1 tỷ lệ nảy mầm cao kèm hướng dẫn ủ đất tự nhiên.',
    pointsRequired: 250,
    stockQuantity: 60,
    claimedQuantity: 42,
    category: 'seed',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69104a49?auto=format&fit=crop&w=600&q=80',
    status: 'active',
  },
];

const INITIAL_CLAIMS = [
  {
    id: 'clm-1',
    rewardTitle: 'Voucher Giảm 50.000đ tại Nhà Hàng Chay Veggie Garden',
    userName: 'Lê Thị Thu Thảo',
    userEmail: 'thao.le@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    pointsSpent: 500,
    claimDate: '10:15 Hôm nay',
    status: 'pending',
    notes: 'Em muốn nhận mã điện tử qua email thao.le@gmail.com ạ!',
  },
  {
    id: 'clm-2',
    rewardTitle: 'Ebook Cẩm Nang 100 Công Thức Món Chay Chuẩn Đa Lượng',
    userName: 'Hoàng Minh Đức',
    userEmail: 'duc.hoang@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    pointsSpent: 350,
    claimDate: 'Hôm qua',
    status: 'pending',
    notes: 'Đã hoàn thành thử thách 21 ngày và đổi ebook.',
  },
  {
    id: 'clm-3',
    rewardTitle: 'Hộp Hạt Dinh Dưỡng Hữu Cơ Granola Tự Nhiên (500g)',
    userName: 'Nguyễn Bích Phương',
    userEmail: 'bichphuong@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    pointsSpent: 1200,
    claimDate: '05/11/2026',
    status: 'delivered',
    notes: 'Địa chỉ giao hàng: Tòa Landmark 81, Bình Thạnh, TP.HCM',
  },
];

export const RewardManagementScreen = () => {
  const [rewards, setRewards] = useState(INITIAL_REWARDS);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);

  // Tabs
  const [activeTab, setActiveTab] = useState('rewards'); // 'rewards' | 'claims'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [claimStatusFilter, setClaimStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
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

  // Claim Process Modal
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimDecision, setClaimDecision] = useState('approved');
  const [claimNotes, setClaimNotes] = useState('');

  // Dynamic stats
  const stats = useMemo(() => {
    const totalRewards = rewards.length;
    const availableRewards = rewards.filter((r) => r.status === 'active' && r.stockQuantity > 0).length;
    const pendingClaimsCount = claims.filter((c) => c.status === 'pending').length;
    const totalClaimsProcessed = claims.filter((c) => c.status === 'approved' || c.status === 'delivered').length;
    const totalKarmaPointsCirculated = claims.reduce((sum, c) => sum + (c.pointsSpent || 0), 0) + 145000;
    return {
      totalRewards,
      availableRewards,
      pendingClaimsCount,
      totalClaimsProcessed,
      totalKarmaPointsCirculated,
    };
  }, [rewards, claims]);

  const filteredRewards = useMemo(() => {
    return rewards.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [rewards, categoryFilter, statusFilter, searchQuery]);

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      if (claimStatusFilter !== 'all' && claim.status !== claimStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUser = claim.userName.toLowerCase().includes(q) || claim.userEmail.toLowerCase().includes(q);
        const matchesReward = claim.rewardTitle.toLowerCase().includes(q);
        if (!matchesUser && !matchesReward) return false;
      }
      return true;
    });
  }, [claims, claimStatusFilter, searchQuery]);

  const handleOpenCreateReward = () => {
    setEditingReward(null);
    setFormTitle('');
    setFormDescription('');
    setFormPoints(500);
    setFormStock(50);
    setFormCategory('voucher');
    setFormImageUrl('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80');
    setFormStatus('active');
    setIsRewardModalOpen(true);
  };

  const handleOpenEditReward = (item) => {
    setEditingReward(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormPoints(item.pointsRequired);
    setFormStock(item.stockQuantity);
    setFormCategory(item.category);
    setFormImageUrl(item.imageUrl || '');
    setFormStatus(item.status);
    setIsRewardModalOpen(true);
  };

  const handleSaveReward = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tên phần thưởng');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
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
        setRewards((prev) =>
          prev.map((r) => (r.id === editingReward.id ? { ...r, ...payload } : r))
        );
      } else {
        setRewards((prev) => [
          {
            id: `rw-${Date.now()}`,
            claimedQuantity: 0,
            ...payload,
          },
          ...prev,
        ]);
      }

      setIsSubmitting(false);
      setIsRewardModalOpen(false);
    }, 200);
  };

  const handleDeleteReward = (item) => {
    if (window.confirm(`Xác nhận xoá phần thưởng "${item.title}"?`)) {
      setRewards((prev) => prev.filter((r) => r.id !== item.id));
    }
  };

  const handleOpenProcessClaim = (claim) => {
    setSelectedClaim(claim);
    setClaimDecision('approved');
    setClaimNotes('Đã xác thực điểm Mầm Xanh hợp lệ từ thử thách. Mã quà tặng / xác nhận đã gửi đến email hội viên.');
  };

  const handleConfirmProcessClaim = (e) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setClaims((prev) =>
        prev.map((c) =>
          c.id === selectedClaim.id
            ? { ...c, status: claimDecision, notes: claimNotes.trim() }
            : c
        )
      );

      setIsSubmitting(false);
      setSelectedClaim(null);
    }, 200);
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'voucher':
        return <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">Voucher Đối Tác</span>;
      case 'ebook':
        return <span className="text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium">Ebook Dinh Dưỡng</span>;
      case 'physical':
        return <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">Quà Tặng Sinh Thái</span>;
      case 'seed':
        return <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">Hạt Giống Hữu Cơ</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">Quà Tặng</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-emerald-950/20 via-green-900/10 to-transparent p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-1">
            <span className="material-symbols-outlined text-[18px]">redeem</span>
            Hệ Thống Gamification &amp; Quà Tặng Đổi Điểm Mầm Xanh (Green Karma)
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Kho Quà Đổi Thưởng &amp; Điểm Mầm Xanh
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Tuyên dương và khích lệ hội viên kiên trì ăn chay qua hệ thống điểm thưởng Mầm Xanh. Quản lý kho quà voucher nhà hàng chay, ebook cẩm nang dinh dưỡng và duyệt yêu cầu nhận quà.
          </p>
        </div>

        <button
          onClick={handleOpenCreateReward}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-all shadow-xs shrink-0 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Thêm Phần Thưởng Mới
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Phần Thưởng Trong Kho
            </div>
            <div className="text-2xl font-bold text-on-surface mt-1">
              {stats.totalRewards} <span className="text-xs font-normal text-on-surface-variant">mục quà</span>
            </div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check</span>
              {stats.availableRewards} quà đang sẵn sàng
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[26px]">inventory_2</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Yêu Cầu Đổi Quà Chờ Duyệt
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {stats.pendingClaimsCount} <span className="text-xs font-normal text-on-surface-variant">yêu cầu</span>
            </div>
            <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
              Chờ xác nhận &amp; gửi mã
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-[26px]">pending_actions</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Yêu Cầu Đã Trao Quà
            </div>
            <div className="text-2xl font-bold text-on-surface mt-1">
              {stats.totalClaimsProcessed} <span className="text-xs font-normal text-on-surface-variant">lượt</span>
            </div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Hội viên nhận quà thành công
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[26px]">loyalty</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Điểm Mầm Xanh Đã Quy Đổi
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.totalKarmaPointsCirculated.toLocaleString('vi-VN')}
            </div>
            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">eco</span>
              Tích lũy từ nấu ăn &amp; thử thách
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined text-[26px]">workspace_premium</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-surface-container-high">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'rewards'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">card_giftcard</span>
          Danh Mục Phần Thưởng Trong Kho ({rewards.length})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors cursor-pointer relative ${
            activeTab === 'claims'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">approval_delegation</span>
          Hàng Đợi Duyệt Đổi Thưởng
          {stats.pendingClaimsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
              {stats.pendingClaimsCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[260px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder={
              activeTab === 'rewards'
                ? 'Tìm kiếm phần thưởng theo tên hoặc mô tả quà tặng...'
                : 'Tìm kiếm theo tên hội viên hoặc quà yêu cầu...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface rounded-lg border border-surface-container-high focus:outline-none focus:border-primary transition-all text-on-surface"
          />
        </div>

        {activeTab === 'rewards' ? (
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả phân loại quà</option>
              <option value="voucher">Voucher Nhà Hàng Chay</option>
              <option value="ebook">Ebook Dinh Dưỡng</option>
              <option value="physical">Đồ Dùng Sinh Thái Eco</option>
              <option value="seed">Hạt Giống Hữu Cơ</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang khả dụng</option>
              <option value="out_of_stock">Đã hết quà</option>
              <option value="paused">Tạm dừng</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <select
              value={claimStatusFilter}
              onChange={(e) => setClaimStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ phê duyệt (Pending)</option>
              <option value="approved">Đã duyệt (Approved)</option>
              <option value="delivered">Đã giao nhận quà (Delivered)</option>
              <option value="rejected">Bị từ chối (Rejected)</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content */}
      {activeTab === 'rewards' ? (
        filteredRewards.length === 0 ? (
          <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8">
            <span className="material-symbols-outlined text-[48px] text-outline mb-2">
              redeem
            </span>
            <h3 className="text-base font-semibold text-on-surface">Kho phần thưởng trống</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              Không tìm thấy phần thưởng nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredRewards.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Image */}
                <div className="h-40 relative overflow-hidden bg-surface-container">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined text-[48px]">redeem</span>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    {getCategoryBadge(item.category)}
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/60 text-emerald-300 backdrop-blur-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">eco</span>
                      {item.pointsRequired} điểm
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">
                      Tồn: <strong className="text-on-surface">{item.stockQuantity}</strong> • Đã đổi: <strong className="text-primary">{item.claimedQuantity}</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditReward(item)}
                        className="p-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer"
                        title="Sửa quà"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteReward(item)}
                        className="p-1 rounded-lg text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        title="Xoá quà"
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
        /* TAB 2: CLAIMS QUEUE */
        filteredClaims.length === 0 ? (
          <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8">
            <span className="material-symbols-outlined text-[48px] text-emerald-500 mb-2">
              check_circle
            </span>
            <h3 className="text-base font-semibold text-on-surface">Không có yêu cầu đổi quà nào chờ duyệt!</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              Tất cả các yêu cầu đổi quà bằng điểm Mầm Xanh đã được xử lý xong.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-primary/40 transition-all"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">eco</span>
                      {claim.pointsSpent} Điểm Mầm Xanh
                    </span>
                    <span className="text-xs text-on-surface-variant">• {claim.claimDate}</span>
                  </div>

                  <h4 className="text-base font-bold text-on-surface">
                    {claim.rewardTitle}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-on-surface">
                    <img
                      src={claim.userAvatar}
                      alt={claim.userName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-semibold">{claim.userName}</span>
                    <span className="text-on-surface-variant">({claim.userEmail})</span>
                  </div>

                  {claim.notes && (
                    <div className="text-xs text-on-surface-variant bg-surface p-2.5 rounded-lg border border-surface-container-high/60 mt-1 italic">
                      "{claim.notes}"
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-surface-container-high">
                  <div>
                    {claim.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                        Chờ Phê Duyệt
                      </span>
                    ) : claim.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Đã Duyệt Cấp Quà
                      </span>
                    ) : claim.status === 'delivered' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        Đã Giao Thành Công
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                        Từ Chối
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenProcessClaim(claim)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors cursor-pointer border border-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px]">approval</span>
                    {claim.status === 'pending' ? 'Duyệt yêu cầu ngay' : 'Xem lại xử lý'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal 1: Create / Edit Reward */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">redeem</span>
                <h3 className="text-base font-bold text-on-surface">
                  {editingReward ? 'Sửa Quà Tặng Đổi Điểm' : 'Thêm Phần Thưởng Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRewardModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveReward} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Tên Phần Thưởng *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Voucher Giảm 20% Cơm Chay An Lạc..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Mô Tả Quà Tặng
                </label>
                <textarea
                  rows={2}
                  placeholder="Điều kiện áp dụng, hướng dẫn sử dụng voucher/ebook..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Điểm Mầm Xanh Cần (Karma)
                  </label>
                  <input
                    type="number"
                    min={50}
                    value={formPoints}
                    onChange={(e) => setFormPoints(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Số Lượng Tồn Kho
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Phân Loại
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    <option value="voucher">Voucher Nhà Hàng Chay</option>
                    <option value="ebook">Ebook Dinh Dưỡng</option>
                    <option value="physical">Đồ Dùng Sinh Thái Eco</option>
                    <option value="seed">Hạt Giống Hữu Cơ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Trạng Thái
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium cursor-pointer"
                  >
                    <option value="active">Đang khả dụng (Active)</option>
                    <option value="out_of_stock">Hết hàng (Out of stock)</option>
                    <option value="paused">Tạm dừng (Paused)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  URL Hình Ảnh Quà Tặng
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRewardModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant text-xs font-medium hover:bg-surface-container cursor-pointer"
                >
                  Huỷ Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Đang lưu...' : editingReward ? 'Cập Nhật Quà' : 'Thêm Quà Vào Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Process Claim */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">approval</span>
                <h3 className="text-base font-bold text-on-surface">
                  Xử Lý Yêu Cầu Đổi Quà #{selectedClaim.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmProcessClaim} className="p-6 space-y-4">
              <div className="bg-surface p-3 rounded-xl border border-surface-container-high/60 text-xs space-y-1">
                <div>Phần thưởng: <strong className="text-on-surface">{selectedClaim.rewardTitle}</strong></div>
                <div>Hội viên: <strong className="text-on-surface">{selectedClaim.userName}</strong> ({selectedClaim.userEmail})</div>
                <div>Số điểm trừ: <strong className="text-emerald-600">{selectedClaim.pointsSpent} Điểm Mầm Xanh</strong></div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Quyết Định Duyệt
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setClaimDecision('approved')}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center cursor-pointer ${
                      claimDecision === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    Duyệt Cấp Quà
                  </button>

                  <button
                    type="button"
                    onClick={() => setClaimDecision('delivered')}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center cursor-pointer ${
                      claimDecision === 'delivered'
                        ? 'bg-sky-50 text-sky-800 border-sky-500 dark:bg-sky-950/40 dark:text-sky-300'
                        : 'border-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    Đã Giao
                  </button>

                  <button
                    type="button"
                    onClick={() => setClaimDecision('rejected')}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold text-center cursor-pointer ${
                      claimDecision === 'rejected'
                        ? 'bg-rose-50 text-rose-800 border-rose-500 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'border-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    Từ Chối
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Ghi Chú Hoặc Mã Voucher Gửi Hội Viên
                </label>
                <textarea
                  rows={3}
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant text-xs font-medium hover:bg-surface-container cursor-pointer"
                >
                  Huỷ Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Xác Nhận & Cập Nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

