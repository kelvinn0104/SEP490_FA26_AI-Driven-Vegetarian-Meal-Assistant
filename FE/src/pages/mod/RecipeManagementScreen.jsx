import React, { useState, useEffect } from 'react';
import { recipesApi, categoriesApi, ingredientsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  SuperAdminReadOnlyBanner,
  ApiErrorBanner,
  ImageUploadField,
} from '../../components/ui/OperationalHelpers';

export const RecipeManagementScreen = ({ readOnly = false }) => {
  const { isSuperAdmin } = useAuth();
  const isReadOnly = readOnly || isSuperAdmin;

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recipe form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formServings, setFormServings] = useState(2);
  const [formStatus, setFormStatus] = useState('published');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formIngredients, setFormIngredients] = useState([]);
  const [pickIngredientId, setPickIngredientId] = useState('');
  const [pickQuantityG, setPickQuantityG] = useState(100);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [recipeList, categoryList, ingList] = await Promise.all([
        recipesApi.getRecipes(),
        categoriesApi.getCategories(),
        ingredientsApi.getIngredients(),
      ]);
      setRecipes(recipeList || []);
      setCategories(categoryList || []);
      setAllIngredients(ingList || []);
      if (categoryList?.length > 0 && !formCategoryId) {
        setFormCategoryId(String(categoryList[0].id));
      }
      if (ingList?.length > 0 && !pickIngredientId) {
        setPickIngredientId(String(ingList[0].id));
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách công thức từ cơ sở dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreateModal = () => {
    if (isReadOnly) return;
    setEditingRecipe(null);
    setFormTitle('');
    setFormCategoryId(categories[0]?.id ? String(categories[0].id) : '');
    setFormServings(2);
    setFormStatus('published');
    setFormImageUrl('');
    setFormInstructions('');
    setFormIngredients([]);
    setIsFormModalOpen(true);
  };

  const openEditModal = (recipe) => {
    if (isReadOnly) return;
    setEditingRecipe(recipe);
    setFormTitle(recipe.title || '');
    setFormCategoryId(String(recipe.categoryId || categories[0]?.id || ''));
    setFormServings(recipe.servings || 2);
    setFormStatus(recipe.status || 'published');
    setFormImageUrl(recipe.imageUrl || '');
    setFormInstructions(recipe.instructions || '');
    setFormIngredients(
      (recipe.ingredients || []).map((ri) => ({
        ingredientId: ri.ingredientId,
        ingredientName: ri.ingredientName,
        quantityG: ri.quantityG,
      }))
    );
    setSelectedRecipe(null);
    setIsFormModalOpen(true);
  };

  const handleAddIngredientRow = () => {
    const ingId = parseInt(pickIngredientId, 10);
    const qty = Number(pickQuantityG);
    if (!ingId || qty <= 0) return;
    const found = allIngredients.find((i) => i.id === ingId);
    if (!found) return;

    setFormIngredients((prev) => {
      const exists = prev.find((x) => x.ingredientId === ingId);
      if (exists) {
        return prev.map((x) =>
          x.ingredientId === ingId ? { ...x, quantityG: qty } : x
        );
      }
      return [...prev, { ingredientId: ingId, ingredientName: found.name, quantityG: qty }];
    });
  };

  const handleRemoveIngredientRow = (ingId) => {
    setFormIngredients((prev) => prev.filter((x) => x.ingredientId !== ingId));
  };

  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    if (isReadOnly || !formTitle.trim() || !formInstructions.trim()) return;

    const categoryIdInt = parseInt(formCategoryId, 10);
    if (!categoryIdInt) {
      setError('Vui lòng tạo ít nhất 1 danh mục trước khi thêm công thức.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const payload = {
        title: formTitle.trim(),
        categoryId: categoryIdInt,
        servings: Math.max(1, parseInt(formServings, 10) || 1),
        status: formStatus,
        imageUrl: formImageUrl.trim() || null,
        instructions: formInstructions.trim(),
        ingredients: formIngredients.map((i) => ({
          ingredientId: i.ingredientId,
          quantityG: Number(i.quantityG) || 100,
        })),
      };

      if (editingRecipe) {
        await recipesApi.updateRecipe(editingRecipe.id, payload);
      } else {
        await recipesApi.createRecipe(payload);
      }

      setIsFormModalOpen(false);
      await fetchAll();
    } catch (err) {
      setError(err.message || 'Không thể lưu công thức.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (recipe) => {
    if (isReadOnly) return;
    const nextStatus = recipe.status === 'published' ? 'hidden' : 'published';
    try {
      setError('');
      await recipesApi.updateStatus(recipe.id, nextStatus);
      await fetchAll();
      if (selectedRecipe?.id === recipe.id) {
        setSelectedRecipe((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err) {
      setError(err.message || 'Không thể đổi trạng thái công thức.');
    }
  };

  const handleDeleteRecipe = async (id, title) => {
    if (isReadOnly) return;
    if (!window.confirm(`Xóa công thức "${title}" khỏi hệ thống?`)) return;
    try {
      setError('');
      await recipesApi.deleteRecipe(id);
      if (selectedRecipe?.id === id) setSelectedRecipe(null);
      await fetchAll();
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa công thức.');
    }
  };

  const filteredRecipes = recipes.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (r.title || '').toLowerCase().includes(q) ||
      (r.author || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' ||
      String(r.categoryId) === String(categoryFilter) ||
      r.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/40 text-primary font-bold text-xs">
            Đang xuất bản
          </span>
        );
      case 'pending_verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
            Chờ duyệt
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs">
            Đang ẩn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <SuperAdminReadOnlyBanner readOnly={isReadOnly} />
      <ApiErrorBanner error={error} onDismiss={() => setError('')} onRetry={fetchAll} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Quản lý Công thức & Bài viết Chay
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Liên kết nguyên liệu thực tế để tự động tính Calo, Đạm và Vi chất trên từng khẩu phần.
          </p>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary/90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Thêm công thức mới</span>
          </button>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên món, tác giả, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[40px] pl-10 pr-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs sm:text-sm text-on-surface"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[40px] px-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs font-semibold text-on-surface cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đang xuất bản</option>
            <option value="pending_verification">Chờ duyệt</option>
            <option value="hidden">Đang ẩn</option>
            <option value="draft">Bản nháp</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-[40px] px-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs font-semibold text-on-surface max-w-[180px] truncate cursor-pointer"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <span className="px-3 py-2 rounded-xl bg-surface-container-high text-outline text-xs font-mono font-bold">
            {filteredRecipes.length} món
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
          <span className="text-xs text-on-surface-variant font-medium">
            Đang tải kho công thức từ cơ sở dữ liệu...
          </span>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-[24px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="border-b border-surface-container-high/60 bg-surface-container-lowest/50">
                  <th className="py-4 px-5 text-xs font-bold text-outline uppercase">Công thức</th>
                  <th className="py-4 px-5 text-xs font-bold text-outline uppercase">Tác giả</th>
                  <th className="py-4 px-5 text-xs font-bold text-outline uppercase">Danh mục</th>
                  <th className="py-4 px-5 text-xs font-bold text-outline uppercase">Dinh dưỡng / KP</th>
                  <th className="py-4 px-5 text-xs font-bold text-outline uppercase">Trạng thái</th>
                  <th className="py-4 px-5 text-xs font-bold text-outline uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/40">
                {filteredRecipes.map((recipe) => (
                  <tr
                    key={recipe.id}
                    className="hover:bg-surface-container-low/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {recipe.imageUrl ? (
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-11 h-11 rounded-xl object-cover ring-1 ring-surface-container-high shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-on-surface truncate">{recipe.title}</p>
                          <p className="text-[11px] text-outline font-mono">
                            {recipe.publishedAt} • {recipe.servings || 1} khẩu phần • {(recipe.ingredients || []).length} NL
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-xs font-semibold text-on-surface">
                      {recipe.author}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant text-xs font-medium">
                        {recipe.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono text-xs">
                      <span className="font-bold text-primary">{recipe.kcalPerServing ?? 0} kcal</span>
                      <span className="block text-[10px] text-outline">
                        P: {recipe.proteinG ?? 0}g • C: {recipe.carbG ?? 0}g • F: {recipe.fatG ?? 0}g
                      </span>
                    </td>

                    <td className="py-3.5 px-5">{getStatusBadge(recipe.status)}</td>

                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedRecipe(recipe)}
                          className="p-2 rounded-lg text-on-surface-variant hover:text-primary cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        {!isReadOnly && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(recipe)}
                              className="p-2 rounded-lg text-on-surface-variant hover:text-primary cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(recipe)}
                              className="p-2 rounded-lg text-on-surface-variant hover:text-primary cursor-pointer"
                              title={recipe.status === 'published' ? 'Ẩn' : 'Xuất bản'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {recipe.status === 'published' ? 'visibility_off' : 'check_circle'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                              className="p-2 rounded-lg text-on-surface-variant hover:text-error cursor-pointer"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRecipes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-outline text-xs">
                      Chưa có công thức nào khớp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full border border-surface-container-high shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-surface-container-high flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {selectedRecipe.imageUrl && (
                  <img
                    src={selectedRecipe.imageUrl}
                    alt={selectedRecipe.title}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-xs font-semibold">
                      {selectedRecipe.category}
                    </span>
                    {getStatusBadge(selectedRecipe.status)}
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">{selectedRecipe.title}</h3>
                  <p className="text-xs text-outline mt-0.5">
                    Tác giả: <b>{selectedRecipe.author}</b> • {selectedRecipe.publishedAt} • {selectedRecipe.servings} khẩu phần
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60 text-center">
                <div>
                  <span className="text-[11px] text-outline block">Calo / Khẩu phần</span>
                  <span className="text-base font-bold text-primary font-mono">
                    {selectedRecipe.kcalPerServing ?? 0} kcal
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-outline block">Protein</span>
                  <span className="text-base font-bold text-on-surface font-mono">
                    {selectedRecipe.proteinG ?? 0} g
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-outline block">Carbs</span>
                  <span className="text-base font-bold text-on-surface font-mono">
                    {selectedRecipe.carbG ?? 0} g
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-outline block">Fat</span>
                  <span className="text-base font-bold text-on-surface font-mono">
                    {selectedRecipe.fatG ?? 0} g
                  </span>
                </div>
              </div>

              {selectedRecipe.ingredients?.length > 0 && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-outline mb-2">
                    Nguyên liệu định lượng ({selectedRecipe.ingredients.length})
                  </h4>
                  <div className="divide-y divide-surface-container-high/40 rounded-xl border border-surface-container-high/60 bg-surface-container-low/40 px-3">
                    {selectedRecipe.ingredients.map((ri) => (
                      <div key={ri.ingredientId} className="py-2 flex items-center justify-between">
                        <span className="font-semibold text-on-surface">{ri.ingredientName}</span>
                        <span className="font-mono text-outline">
                          {ri.quantityG}g ({ri.kcal} kcal • {ri.proteinG}g P)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold uppercase tracking-wider text-outline mb-2">
                  Hướng dẫn chế biến
                </h4>
                <div className="p-4 rounded-2xl bg-surface-container-low text-on-surface leading-relaxed border border-surface-container-high/60 whitespace-pre-line">
                  {selectedRecipe.instructions || 'Chưa có hướng dẫn chi tiết.'}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-surface-container-high flex items-center justify-end gap-2">
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => openEditModal(selectedRecipe)}
                  className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs cursor-pointer"
                >
                  Chỉnh sửa công thức
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isFormModalOpen && !isReadOnly && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full border border-surface-container-high shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-surface-container-high flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">
                {editingRecipe ? 'Cập nhật công thức món chay' : 'Tạo công thức món chay mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Tên công thức *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="VD: Đậu hũ non sốt nấm hương"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Danh mục *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Khẩu phần</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formServings}
                    onChange={(e) => setFormServings(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Trạng thái</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high font-semibold"
                  >
                    <option value="published">Xuất bản ngay</option>
                    <option value="pending_verification">Chờ kiểm duyệt</option>
                    <option value="draft">Lưu nháp</option>
                    <option value="hidden">Tạm ẩn</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Ảnh đại diện món ăn (URL hoặc tải ảnh lên Server)"
                value={formImageUrl}
                onChange={setFormImageUrl}
              />

              {/* Ingredient Linking */}
              <div className="p-3.5 rounded-xl bg-surface-container-low/70 border border-surface-container-high space-y-2.5">
                <label className="font-bold text-primary block">
                  Liên kết Nguyên liệu để tính tự động Calo & Vi chất ({formIngredients.length})
                </label>
                {allIngredients.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={pickIngredientId}
                      onChange={(e) => setPickIngredientId(e.target.value)}
                      className="flex-1 min-w-[180px] h-9 px-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high"
                    >
                      {allIngredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.kcalPer100g} kcal/100g)
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={pickQuantityG}
                      onChange={(e) => setPickQuantityG(e.target.value)}
                      placeholder="Gram"
                      className="w-24 h-9 px-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredientRow}
                      className="h-9 px-3 rounded-lg bg-primary text-on-primary font-bold cursor-pointer"
                    >
                      + Thêm (g)
                    </button>
                  </div>
                )}

                {formIngredients.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {formIngredients.map((item) => (
                      <div
                        key={item.ingredientId}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/50"
                      >
                        <span className="font-semibold">{item.ingredientName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary font-bold">{item.quantityG}g</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredientRow(item.ingredientId)}
                            className="text-error hover:underline cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">
                  Hướng dẫn chế biến chi tiết *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="Các bước sơ chế, chế biến và bảo quản..."
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-outline hover:bg-surface-container cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : editingRecipe ? 'Lưu cập nhật' : 'Tạo công thức'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeManagementScreen;
