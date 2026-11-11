import React, { useState, useEffect } from 'react';
import { productScansApi } from '../../api';

export const VeganProductScannerScreen = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 7,
    verifiedVeganCount: 3,
    verifiedVegetarianCount: 1,
    flaggedNonVeganCount: 1,
    pendingReviewCount: 2,
    totalScansRecorded: 1726,
  });
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'queue'
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState('beverage');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLabelImageUrl, setFormLabelImageUrl] = useState('');
  const [formIngredientRaw, setFormIngredientRaw] = useState('');
  const [formVeganStatus, setFormVeganStatus] = useState('vegan');
  const [formNutritionistNotes, setFormNutritionistNotes] = useState('');

  // Review modal state
  const [reviewVerdict, setReviewVerdict] = useState('vegan');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewFlaggedInput, setReviewFlaggedInput] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const effectiveStatus = activeTab === 'queue' ? 'pending_review' : statusFilter !== 'all' ? statusFilter : undefined;
      const [listRes, statsRes] = await Promise.all([
        productScansApi.getProducts({
          status: effectiveStatus,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          search: searchQuery || undefined,
        }),
        productScansApi.getStats(),
      ]);

      setProducts(listRes || []);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      console.error('Lỗi khi tải danh sách thẩm định nhãn thực phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormBarcode('893');
    setFormBrand('');
    setFormCategory('beverage');
    setFormImageUrl('https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80');
    setFormLabelImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setFormIngredientRaw('');
    setFormVeganStatus('vegan');
    setFormNutritionistNotes('100% thuần thực vật đạt chuẩn y khoa. Không chứa phụ gia động vật ẩn, không sữa bò, không đường than xương.');
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormName(item.productName);
    setFormBarcode(item.barcode || '');
    setFormBrand(item.brand || '');
    setFormCategory(item.category);
    setFormImageUrl(item.imageUrl || '');
    setFormLabelImageUrl(item.labelImageUrl || '');
    setFormIngredientRaw(item.ingredientListRaw || '');
    setFormVeganStatus(item.veganStatus);
    setFormNutritionistNotes(item.nutritionistNotes || '');
    setIsAddEditOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Vui lòng nhập tên sản phẩm đóng gói');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        productName: formName.trim(),
        barcode: formBarcode.trim() || null,
        brand: formBrand.trim(),
        category: formCategory,
        imageUrl: formImageUrl.trim() || null,
        labelImageUrl: formLabelImageUrl.trim() || null,
        ingredientListRaw: formIngredientRaw.trim(),
        veganStatus: formVeganStatus,
        nutritionistNotes: formNutritionistNotes.trim() || null,
      };

      if (editingItem) {
        await productScansApi.updateProduct(editingItem.id, payload);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await productScansApi.createProduct(payload);
        alert('Thêm sản phẩm đóng gói mới thành công!');
      }

      setIsAddEditOpen(false);
      await fetchData();
    } catch (err) {
      alert(`Lỗi khi lưu sản phẩm: ${err.message || 'Lỗi server'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xoá sản phẩm "${item.productName}" khỏi cơ sở dữ liệu?`)) return;

    try {
      await productScansApi.deleteProduct(item.id);
      alert('Đã xoá sản phẩm thành công');
      await fetchData();
    } catch (err) {
      alert(`Lỗi khi xoá: ${err.message || 'Lỗi server'}`);
    }
  };

  const handleOpenReview = (item) => {
    setSelectedReviewItem(item);
    setReviewVerdict(item.veganStatus === 'pending_review' ? 'vegan' : item.veganStatus);
    setReviewNotes(item.nutritionistNotes || 'Chuyên gia dinh dưỡng VeggieAI đã đối chiếu nhãn thành phần và xác thực an toàn cho người ăn chay.');
    setReviewFlaggedInput(item.flaggedNonVeganIngredients ? item.flaggedNonVeganIngredients.join(', ') : '');
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!selectedReviewItem) return;

    try {
      setIsSubmitting(true);
      const flaggedList = reviewFlaggedInput
        ? reviewFlaggedInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await productScansApi.reviewProduct(selectedReviewItem.id, {
        verdict: reviewVerdict,
        nutritionistNotes: reviewNotes.trim(),
        flaggedIngredients: flaggedList,
      });

      alert(`Đã hoàn tất thẩm định sản phẩm: ${getVeganBadgeText(reviewVerdict)}!`);
      setSelectedReviewItem(null);
      await fetchData();
    } catch (err) {
      alert(`Lỗi khi duyệt sản phẩm: ${err.message || 'Lỗi server'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVeganBadgeText = (status) => {
    switch (status) {
      case 'vegan':
        return '100% Thuần Chay (Vegan)';
      case 'vegetarian':
        return 'Chay Có Sữa/Trứng (Vegetarian)';
      case 'non_vegan':
        return 'Không Thuần Chay (Non-Vegan)';
      default:
        return 'Chờ Chuyên Gia Duyệt';
    }
  };

  const getVeganStatusBadge = (status) => {
    switch (status) {
      case 'vegan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
            <span className="material-symbols-outlined text-[14px]">eco</span>
            100% Thuần Chay
          </span>
        );
      case 'vegetarian':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
            <span className="material-symbols-outlined text-[14px]">egg</span>
            Chay Có Sữa/Trứng
          </span>
        );
      case 'non_vegan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
            <span className="material-symbols-outlined text-[14px]">block</span>
            Có Chất Động Vật
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200">
            <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
            Chờ Thẩm Định
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-teal-950/20 via-emerald-900/10 to-transparent p-6 rounded-2xl border border-teal-500/20">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-sm mb-1">
            <span className="material-symbols-outlined text-[18px]">document_scanner</span>
            Trung Tâm Thẩm Định Nhãn Bao Bì & Quét Thuần Chay (Vegan Scanner Hub)
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Thẩm Định Nhãn Thực Phẩm & Phụ Gia Động Vật Ẩn
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Bóc tách bảng thành phần OCR, phát hiện phụ gia động vật tiềm ẩn (Carmine E120, Gelatin da heo, Whey sữa, L-cysteine lông vũ, Shellac) và cấp chứng nhận Thuần Chay chính thức cho thực phẩm đóng gói.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-all shadow-xs shrink-0 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Thêm Sản Phẩm Mới Vào Kho
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Sản Phẩm Trong Kho
            </div>
            <div className="text-2xl font-bold text-on-surface mt-1">
              {stats.totalProducts} <span className="text-xs font-normal text-on-surface-variant">mặt hàng</span>
            </div>
            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
              {stats.totalScansRecorded.toLocaleString('vi-VN')} lượt quét mã
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[26px]">inventory_2</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              100% Thuần Chay (Vegan)
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.verifiedVeganCount} <span className="text-xs font-normal text-on-surface-variant">sản phẩm</span>
            </div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Chứng nhận an toàn tuyệt đối
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-[26px]">eco</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Phát Hiện Động Vật Ẩn
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              {stats.flaggedNonVeganCount} <span className="text-xs font-normal text-on-surface-variant">cảnh báo</span>
            </div>
            <div className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Gelatin / E120 Carmine / Sữa
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
            <span className="material-symbols-outlined text-[26px]">gpp_bad</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Chờ Chuyên Gia Thẩm Định
            </div>
            <div className="text-2xl font-bold text-sky-600 mt-1">
              {stats.pendingReviewCount} <span className="text-xs font-normal text-on-surface-variant">nhãn mới</span>
            </div>
            <div className="text-xs text-sky-600 mt-1 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
              Hội viên quét gửi lên
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
            <span className="material-symbols-outlined text-[26px]">fact_check</span>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-surface-container-high">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          Kho Sản Phẩm Đã Thẩm Định ({stats.totalProducts})
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors cursor-pointer relative ${
            activeTab === 'queue'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">document_scanner</span>
          Hàng Đợi Thẩm Định Nhãn OCR
          {stats.pendingReviewCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-600 text-white">
              {stats.pendingReviewCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder={
              activeTab === 'catalog'
                ? 'Tìm kiếm theo tên sản phẩm, thương hiệu, mã vạch barcode (893...)...'
                : 'Tìm kiếm nhãn mới quét theo tên món hoặc thành phần nghi vấn...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface rounded-lg border border-surface-container-high focus:outline-none focus:border-primary transition-all text-on-surface"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'catalog' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none"
            >
              <option value="all">Tất cả chứng nhận</option>
              <option value="vegan">100% Thuần Chay (Vegan)</option>
              <option value="vegetarian">Chay Có Sữa/Trứng (Vegetarian)</option>
              <option value="non_vegan">Không Thuần Chay (Non-Vegan)</option>
            </select>
          )}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high text-on-surface font-medium focus:outline-none"
          >
            <option value="all">Tất cả ngành hàng</option>
            <option value="beverage">Đồ Uống & Sữa Hạt</option>
            <option value="snack">Bánh Kẹo & Ăn Vặt</option>
            <option value="condiment">Gia Vị & Nước Sốt</option>
            <option value="noodle">Mì & Thực Phẩm Khô</option>
            <option value="canned">Đồ Hộp Chế Biến Sẵn</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Đang tải cơ sở dữ liệu nhãn thực phẩm...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">
            qr_code_scanner
          </span>
          <h3 className="text-base font-semibold text-on-surface">Không có sản phẩm nào phù hợp</h3>
          <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
            Không tìm thấy sản phẩm đóng gói nào trong bộ lọc hiện tại. Hãy thử tìm từ khóa khác hoặc thêm sản phẩm mới vào kho!
          </p>
        </div>
      ) : activeTab === 'catalog' ? (
        /* TAB 1: CATALOG GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Product Image & Badges */}
              <div className="h-44 relative overflow-hidden bg-surface-container">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-[48px]">inventory</span>
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-xs">
                    {item.categoryLabel}
                  </span>
                  {getVeganStatusBadge(item.veganStatus)}
                </div>

                {item.barcode && (
                  <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded text-[11px] font-mono bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">barcode</span>
                    {item.barcode}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-xs text-primary font-bold uppercase tracking-wider mb-0.5">
                    {item.brand || 'Thương hiệu đối tác'}
                  </div>
                  <h3 className="text-base font-bold text-on-surface line-clamp-1">
                    {item.productName}
                  </h3>

                  {/* Flagged ingredients warning */}
                  {item.flaggedNonVeganIngredients && item.flaggedNonVeganIngredients.length > 0 && (
                    <div className="mt-2.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
                      <span className="font-bold flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[15px]">warning</span>
                        Chất động vật phát hiện ({item.flaggedNonVeganIngredients.length}):
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {item.flaggedNonVeganIngredients.map((flag, fIdx) => (
                          <li key={fIdx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Raw ingredient preview */}
                  <div className="mt-2.5 text-xs text-on-surface-variant line-clamp-2 leading-relaxed bg-surface p-2 rounded-lg border border-surface-container-high/40">
                    <span className="font-semibold text-on-surface">Thành phần:</span> {item.ingredientListRaw}
                  </div>

                  {/* Nutritionist Notes */}
                  {item.nutritionistNotes && (
                    <div className="mt-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/10 flex items-start gap-1.5 leading-snug">
                      <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5 text-emerald-600">
                        verified
                      </span>
                      <span><strong className="font-semibold">Đánh giá Mod:</strong> {item.nutritionistNotes}</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions & Stats */}
                <div className="pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-primary">qr_code_scanner</span>
                    <strong>{item.scanCount}</strong> lượt quét
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenReview(item)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                      title="Xem lại thẩm định"
                    >
                      <span className="material-symbols-outlined text-[18px]">rate_review</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                      title="Chỉnh sửa sản phẩm"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Xoá sản phẩm"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TAB 2: REVIEW QUEUE */
        <div className="space-y-4">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-primary/40 transition-all"
            >
              <div className="flex items-start gap-4 flex-1">
                {/* Images Preview: Packaging & Label OCR */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container border border-surface-container-high relative group">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[24px]">inventory</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded text-[9px] font-bold bg-black/70 text-white">
                      Bao bì
                    </span>
                  </div>

                  {item.labelImageUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container border border-surface-container-high relative group">
                      <img src={item.labelImageUrl} alt="Nhãn OCR" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded text-[9px] font-bold bg-black/70 text-white">
                        Nhãn OCR
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Column */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                      {item.brand || 'Thương hiệu'}
                    </span>
                    {getVeganStatusBadge(item.veganStatus)}
                    <span className="text-xs text-on-surface-variant">• {item.createdAt}</span>
                  </div>

                  <h4 className="text-base font-bold text-on-surface">
                    {item.productName} {item.barcode && <span className="text-xs font-mono text-outline font-normal">({item.barcode})</span>}
                  </h4>

                  <div className="text-xs text-on-surface-variant bg-surface p-2.5 rounded-xl border border-surface-container-high/60 leading-relaxed">
                    <strong className="text-on-surface">Bảng thành phần bóc tách (OCR):</strong> {item.ingredientListRaw}
                  </div>

                  {item.flaggedNonVeganIngredients && item.flaggedNonVeganIngredients.length > 0 && (
                    <div className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">warning</span>
                      Nghi vấn phụ gia: {item.flaggedNonVeganIngredients.join(', ')}
                    </div>
                  )}

                  <div className="text-[11px] text-on-surface-variant flex items-center gap-2 pt-0.5">
                    <span>Người gửi quét: <strong>{item.submittedByName}</strong></span>
                    <span>•</span>
                    <span>Độ tin cậy AI: <strong>{item.confidenceScore}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex md:flex-col items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-surface-container-high">
                <button
                  onClick={() => handleOpenReview(item)}
                  className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs transition-opacity hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">rate_review</span>
                  Thẩm Định Nhãn Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">qr_code_scanner</span>
                <h3 className="text-lg font-bold text-on-surface">
                  {editingItem ? 'Chỉnh Sửa Thông Tin Sản Phẩm' : 'Thêm Sản Phẩm Đóng Gói Vào Kho'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Tên Sản Phẩm Đóng Gói *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Sữa Hạt Hạnh Nhân Không Đường 137 Degrees..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Mã Vạch Barcode
                  </label>
                  <input
                    type="text"
                    placeholder="893... hoặc 885..."
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Hãng / Thương Hiệu
                  </label>
                  <input
                    type="text"
                    placeholder="137 Degrees, Knorr, Oreo..."
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Ngành Hàng
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="beverage">Đồ Uống & Sữa Hạt</option>
                    <option value="snack">Bánh Kẹo & Ăn Vặt</option>
                    <option value="condiment">Gia Vị & Nước Sốt</option>
                    <option value="noodle">Mì & Thực Phẩm Khô</option>
                    <option value="canned">Đồ Hộp Chế Biến Sẵn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    URL Ảnh Sản Phẩm Bao Bì
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    URL Ảnh Chụp Bảng Nhãn Thành Phần
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formLabelImageUrl}
                    onChange={(e) => setFormLabelImageUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Bảng Thành Phần Bóc Tách (OCR Text) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ghi rõ toàn bộ danh sách nguyên liệu trên bao bì (ví dụ: Nước ép táo, Gelatin, Carmine E120, đường...)"
                  value={formIngredientRaw}
                  onChange={(e) => setFormIngredientRaw(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Chứng Nhận Thuần Chay
                </label>
                <select
                  value={formVeganStatus}
                  onChange={(e) => setFormVeganStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary font-bold text-primary"
                >
                  <option value="vegan">100% Thuần Chay (Vegan - Không có nguồn gốc động vật)</option>
                  <option value="vegetarian">Chay Có Sữa / Trứng (Vegetarian - Ovo-Lacto)</option>
                  <option value="non_vegan">Không Thuần Chay (Non-Vegan - Chứa phụ gia động vật)</option>
                  <option value="pending_review">Chờ Chuyên Gia Duyệt (Pending Review)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Đánh Giá & Lời Khuyên Dinh Dưỡng Của Chuyên Gia (Nutritionist Notes)
                </label>
                <textarea
                  rows={2}
                  placeholder="Giải thích rõ vì sao sản phẩm đạt chuẩn hoặc vì sao không thuần chay để gửi người dùng..."
                  value={formNutritionistNotes}
                  onChange={(e) => setFormNutritionistNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant text-xs font-medium hover:bg-surface-container cursor-pointer"
                >
                  Huỷ Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Đang lưu...' : editingItem ? 'Cập Nhật Sản Phẩm' : 'Lưu Vào Kho Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVIEW PRODUCT SCAN (THẨM ĐỊNH CHUYÊN SÂU) */}
      {selectedReviewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">fact_check</span>
                <h3 className="text-base font-bold text-on-surface">
                  Thẩm Định Nhãn Sản Phẩm: {selectedReviewItem.productName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewItem(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmReview} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Product Preview Gallery */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl overflow-hidden h-36 bg-surface-container border border-surface-container-high relative">
                  {selectedReviewItem.imageUrl ? (
                    <img src={selectedReviewItem.imageUrl} alt="Bao bì" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">Ảnh bao bì trống</div>
                  )}
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white">
                    Ảnh bao bì mặt trước
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden h-36 bg-surface-container border border-surface-container-high relative">
                  {selectedReviewItem.labelImageUrl ? (
                    <img src={selectedReviewItem.labelImageUrl} alt="Nhãn OCR" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">Chưa có ảnh nhãn</div>
                  )}
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white">
                    Ảnh nhãn thành phần chụp cận
                  </span>
                </div>
              </div>

              {/* OCR Text Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Văn Bản Thành Phần Bóc Tách (OCR Text)
                </label>
                <div className="p-3 rounded-xl bg-surface border border-surface-container-high/60 text-xs text-on-surface leading-relaxed max-h-28 overflow-y-auto font-mono">
                  {selectedReviewItem.ingredientListRaw}
                </div>
              </div>

              {/* Verdict Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Phán Quyết Chứng Nhận Dinh Dưỡng
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewVerdict('vegan');
                      setReviewNotes('Sản phẩm 100% thuần thực vật đạt chuẩn y khoa. Hoàn toàn không chứa phụ gia động vật ẩn, không sữa bò, không mỡ hay gelatin.');
                      setReviewFlaggedInput('');
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      reviewVerdict === 'vegan'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">eco</span>
                    100% Thuần Chay
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReviewVerdict('vegetarian');
                      setReviewNotes('Sản phẩm có chứa sữa bò hoặc trứng. Thích hợp cho người ăn chay có trứng sữa (Vegetarian), không phù hợp cho người ăn thuần chay nghiêm ngặt.');
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      reviewVerdict === 'vegetarian'
                        ? 'bg-amber-50 text-amber-800 border-amber-500 shadow-xs dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">egg</span>
                    Chay Sữa/Trứng
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReviewVerdict('non_vegan');
                      setReviewNotes('CẢNH BÁO: Phát hiện phụ gia nguồn gốc động vật. Người ăn chay tuyệt đối không sử dụng sản phẩm này!');
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      reviewVerdict === 'non_vegan'
                        ? 'bg-rose-50 text-rose-800 border-rose-500 shadow-xs dark:bg-rose-950/40 dark:text-rose-300'
                        : 'border-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">block</span>
                    Có Chất Động Vật
                  </button>
                </div>
              </div>

              {/* Flagged ingredients input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Chất Động Vật Nghi Vấn Cần Cảnh Báo (Cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Gelatin da heo, Carmine E120, Whey protein từ sữa bò..."
                  value={reviewFlaggedInput}
                  onChange={(e) => setReviewFlaggedInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Nutritionist notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Lời Khuyên & Nhận Xét Dinh Dưỡng Của Chuyên Gia Gửi Người Dùng
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface rounded-xl border border-surface-container-high text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReviewItem(null)}
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant text-xs font-medium hover:bg-surface-container cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Xác Nhận & Cấp Chứng Nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

