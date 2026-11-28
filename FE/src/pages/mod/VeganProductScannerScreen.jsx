import React, { useState, useEffect } from 'react';
import { productScansApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  SuperAdminReadOnlyBanner,
  ApiErrorBanner,
  ImageUploadField,
} from '../../components/ui/OperationalHelpers';

export const VeganProductScannerScreen = ({ readOnly = false }) => {
  const { isSuperAdmin } = useAuth();
  const isReadOnly = readOnly || isSuperAdmin;

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    verifiedVeganCount: 0,
    verifiedVegetarianCount: 0,
    flaggedNonVeganCount: 0,
    pendingReviewCount: 0,
    totalScansRecorded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('catalog');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState('beverage');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLabelImageUrl, setFormLabelImageUrl] = useState('');
  const [formIngredientRaw, setFormIngredientRaw] = useState('');
  const [formVeganStatus, setFormVeganStatus] = useState('vegan');
  const [formNutritionistNotes, setFormNutritionistNotes] = useState('');

  const [reviewVerdict, setReviewVerdict] = useState('vegan');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewFlaggedInput, setReviewFlaggedInput] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const effectiveStatus =
        activeTab === 'queue'
          ? 'pending_review'
          : statusFilter !== 'all'
          ? statusFilter
          : undefined;
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
      setError(err.message || 'Không thể tải dữ liệu thẩm định nhãn sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, categoryFilter]);

  const handleOpenAdd = () => {
    if (isReadOnly) return;
    setEditingItem(null);
    setFormName('');
    setFormBarcode('');
    setFormBrand('');
    setFormCategory('beverage');
    setFormImageUrl('');
    setFormLabelImageUrl('');
    setFormIngredientRaw('');
    setFormVeganStatus('vegan');
    setFormNutritionistNotes('');
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item) => {
    if (isReadOnly) return;
    setEditingItem(item);
    setFormName(item.productName);
    setFormBarcode(item.barcode || '');
    setFormBrand(item.brand || '');
    setFormCategory(item.category || 'beverage');
    setFormImageUrl(item.imageUrl || '');
    setFormLabelImageUrl(item.labelImageUrl || '');
    setFormIngredientRaw(item.ingredientListRaw || '');
    setFormVeganStatus(item.veganStatus || 'vegan');
    setFormNutritionistNotes(item.nutritionistNotes || '');
    setIsAddEditOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (isReadOnly || !formName.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
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
      } else {
        await productScansApi.createProduct(payload);
      }

      setIsAddEditOpen(false);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu sản phẩm đóng gói.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (isReadOnly) return;
    if (!window.confirm(`Xóa sản phẩm "${item.productName}" khỏi kho dữ liệu?`)) return;
    try {
      setError('');
      await productScansApi.deleteProduct(item.id);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Không thể xóa sản phẩm.');
    }
  };

  const handleOpenReview = (item) => {
    setSelectedReviewItem(item);
    setReviewVerdict(item.veganStatus === 'pending_review' ? 'vegan' : item.veganStatus);
    setReviewNotes(item.nutritionistNotes || '');
    setReviewFlaggedInput(
      item.flaggedNonVeganIngredients ? item.flaggedNonVeganIngredients.join(', ') : ''
    );
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (isReadOnly || !selectedReviewItem) return;

    try {
      setIsSubmitting(true);
      setError('');
      const flaggedList = reviewFlaggedInput
        ? reviewFlaggedInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await productScansApi.reviewProduct(selectedReviewItem.id, {
        verdict: reviewVerdict,
        nutritionistNotes: reviewNotes.trim(),
        flaggedIngredients: flaggedList,
      });

      setSelectedReviewItem(null);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi thẩm định nhãn sản phẩm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SuperAdminReadOnlyBanner readOnly={isReadOnly} />
      <ApiErrorBanner error={error} onDismiss={() => setError('')} onRetry={fetchData} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-teal-950/20 via-emerald-900/10 to-transparent p-6 rounded-2xl border border-teal-500/20">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Thẩm Định Nhãn Thực Phẩm & Quét Thuần Chay
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Tải ảnh bao bì / nhãn thành phần, đối chiếu phụ gia động vật ẩn và lưu chứng nhận vào bảng VeganProductScan.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Tổng sản phẩm</div>
          <div className="text-2xl font-bold text-on-surface mt-1 font-mono">{stats.totalProducts}</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">100% Thuần chay</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            {stats.verifiedVeganCount}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Có chất động vật</div>
          <div className="text-2xl font-bold text-rose-600 mt-1 font-mono">
            {stats.flaggedNonVeganCount}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Chờ thẩm định</div>
          <div className="text-2xl font-bold text-sky-600 mt-1 font-mono">
            {stats.pendingReviewCount}
          </div>
        </div>
      </div>

      <div className="flex border-b border-surface-container-high">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-5 py-3 border-b-2 text-sm font-semibold cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant'
          }`}
        >
          Kho Sản Phẩm ({stats.totalProducts})
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-5 py-3 border-b-2 text-sm font-semibold cursor-pointer ${
            activeTab === 'queue'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant'
          }`}
        >
          Hàng Đợi Thẩm Định ({stats.pendingReviewCount})
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
            placeholder="Tìm theo tên sản phẩm, thương hiệu, mã vạch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-xs bg-surface rounded-lg border border-surface-container-high"
          />
        </form>

        <div className="flex items-center gap-2">
          {activeTab === 'catalog' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
            >
              <option value="all">Mọi chứng nhận</option>
              <option value="vegan">100% Thuần chay</option>
              <option value="vegetarian">Chay Sữa/Trứng</option>
              <option value="non_vegan">Có chất động vật</option>
            </select>
          )}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-surface rounded-lg border border-surface-container-high cursor-pointer"
          >
            <option value="all">Mọi ngành hàng</option>
            <option value="beverage">Đồ uống & Sữa hạt</option>
            <option value="snack">Bánh kẹo & Ăn vặt</option>
            <option value="condiment">Gia vị & Nước sốt</option>
            <option value="noodle">Mì & Đồ khô</option>
            <option value="canned">Đồ hộp</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-outline">Đang tải cơ sở dữ liệu nhãn thực phẩm...</div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 p-8 text-xs text-outline">
          Chưa có sản phẩm nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-xs flex flex-col overflow-hidden"
            >
              <div className="h-40 relative bg-surface-container">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-[40px]">inventory_2</span>
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between">
                  <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[11px] font-bold">
                    {item.barcode || 'No Barcode'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      item.veganStatus === 'vegan'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.veganStatus === 'non_vegan'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.veganStatus}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-primary uppercase">
                    {item.brand || 'Chưa rõ hãng'}
                  </span>
                  <h3 className="text-sm font-bold text-on-surface line-clamp-1">
                    {item.productName}
                  </h3>
                  <p className="mt-2 text-on-surface-variant line-clamp-2 bg-surface p-2 rounded-lg border border-surface-container-high/40">
                    <b>Thành phần:</b> {item.ingredientListRaw}
                  </p>
                  {item.flaggedNonVeganIngredients?.length > 0 && (
                    <p className="mt-2 text-rose-600 font-semibold">
                      Phụ gia cảnh báo: {item.flaggedNonVeganIngredients.join(', ')}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-surface-container-high/60 flex items-center justify-between">
                  <span className="text-outline font-mono">{item.scanCount || 0} lượt quét</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenReview(item)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high font-semibold cursor-pointer"
                    >
                      {isReadOnly ? 'Xem nhãn' : 'Thẩm định'}
                    </button>
                    {!isReadOnly && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-error cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddEditOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl border border-surface-container-high shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface">
                {editingItem ? 'Cập Nhật Sản Phẩm Đóng Gói' : 'Thêm Sản Phẩm Vào Kho Thẩm Định'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="font-bold block mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Mã vạch</label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Thương hiệu</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Ngành hàng</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                  >
                    <option value="beverage">Đồ uống & Sữa hạt</option>
                    <option value="snack">Bánh kẹo</option>
                    <option value="condiment">Gia vị</option>
                    <option value="noodle">Mì & Đồ khô</option>
                    <option value="canned">Đồ hộp</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Ảnh mặt trước bao bì (URL hoặc tải ảnh lên)"
                value={formImageUrl}
                onChange={setFormImageUrl}
              />

              <ImageUploadField
                label="Ảnh chụp bảng nhãn thành phần OCR (URL hoặc tải ảnh lên)"
                value={formLabelImageUrl}
                onChange={setFormLabelImageUrl}
              />

              <div>
                <label className="font-bold block mb-1">Bảng thành phần trên bao bì *</label>
                <textarea
                  rows={3}
                  required
                  value={formIngredientRaw}
                  onChange={(e) => setFormIngredientRaw(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Chứng nhận thuần chay</label>
                <select
                  value={formVeganStatus}
                  onChange={(e) => setFormVeganStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high font-bold"
                >
                  <option value="vegan">100% Thuần Chay (vegan)</option>
                  <option value="vegetarian">Chay Sữa / Trứng (vegetarian)</option>
                  <option value="non_vegan">Không Thuần Chay (non_vegan)</option>
                  <option value="pending_review">Chờ thẩm định (pending_review)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Ghi chú chuyên môn</label>
                <textarea
                  rows={2}
                  value={formNutritionistNotes}
                  onChange={(e) => setFormNutritionistNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review / View Modal */}
      {selectedReviewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReview}
            className="bg-surface-container-lowest w-full max-w-xl rounded-2xl border border-surface-container-high shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs"
          >
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <h3 className="text-base font-bold text-on-surface">
                {selectedReviewItem.productName}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReviewItem(null)}
                className="p-1 rounded-lg text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-surface-container-high font-mono">
              {selectedReviewItem.ingredientListRaw}
            </div>

            {!isReadOnly ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'vegan', label: '100% Thuần Chay' },
                    { id: 'vegetarian', label: 'Chay Sữa/Trứng' },
                    { id: 'non_vegan', label: 'Có Động Vật' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setReviewVerdict(v.id)}
                      className={`p-2.5 rounded-xl border font-bold cursor-pointer ${
                        reviewVerdict === v.id
                          ? 'bg-primary-fixed text-on-primary-fixed-variant border-primary'
                          : 'border-surface-container-high'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="font-bold block mb-1">
                    Phụ gia động vật phát hiện (cách nhau bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={reviewFlaggedInput}
                    onChange={(e) => setReviewFlaggedInput(e.target.value)}
                    placeholder="VD: Gelatin, E120, Whey..."
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Nhận xét thẩm định</label>
                  <textarea
                    rows={3}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-surface rounded-xl border border-surface-container-high"
                  />
                </div>
              </>
            ) : (
              <div className="p-3 rounded-xl bg-surface-container-low">
                <b>Nhận xét Mod:</b> {selectedReviewItem.nutritionistNotes || 'Chưa có nhận xét.'}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReviewItem(null)}
                className="px-4 py-2 rounded-xl bg-surface-container cursor-pointer"
              >
                Đóng
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Xác nhận chứng nhận'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
