import React, { useState, useEffect } from 'react';
import { recipesApi, categoriesApi } from '../../api';

export const RecipeManagementScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'hidden', 'draft'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form for new recipe
  const [newRecipeTitle, setNewRecipeTitle] = useState('');
  const [newRecipeCategoryId, setNewRecipeCategoryId] = useState('');
  const [newRecipeServings, setNewRecipeServings] = useState(2);
  const [newRecipeImageUrl, setNewRecipeImageUrl] = useState('');
  const [newRecipeInstructions, setNewRecipeInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRecipesAndCategories = async () => {
    try {
      setLoading(true);
      const [recipeList, categoryList] = await Promise.all([
        recipesApi.getRecipes(),
        categoriesApi.getCategories(),
      ]);
      setRecipes(recipeList || []);
      setCategories(categoryList || []);
      if (categoryList?.length > 0 && !newRecipeCategoryId) {
        setNewRecipeCategoryId(categoryList[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu bài viết & công thức:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipesAndCategories();
  }, []);

  const handleToggleStatus = async (recipe) => {
    const nextStatus = recipe.status === 'published' ? 'hidden' : 'published';
    try {
      await recipesApi.updateStatus(recipe.id, nextStatus);
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipe.id ? { ...r, status: nextStatus } : r))
      );
      if (selectedRecipe?.id === recipe.id) {
        setSelectedRecipe((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
    } catch (err) {
      alert(`Không thể đổi trạng thái bài viết: ${err.message || 'Lỗi server'}`);
    }
  };

  const handleDeleteRecipe = async (id, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" khỏi hệ thống?`)) {
      return;
    }
    try {
      await recipesApi.deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(null);
      }
      alert('Đã xóa bài viết thành công!');
    } catch (err) {
      alert(`Lỗi khi xóa bài viết: ${err.message || 'Lỗi server'}`);
    }
  };

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    if (!newRecipeTitle.trim() || !newRecipeInstructions.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và hướng dẫn chế biến.');
      return;
    }

    try {
      setIsSubmitting(true);
      await recipesApi.createRecipe({
        title: newRecipeTitle.trim(),
        categoryId: parseInt(newRecipeCategoryId, 10) || categories[0]?.id || 1,
        servings: parseInt(newRecipeServings, 10) || 2,
        imageUrl: newRecipeImageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
        instructions: newRecipeInstructions.trim(),
      });

      alert('Đã tạo và xuất bản công thức mới thành công!');
      setIsAddModalOpen(false);
      setNewRecipeTitle('');
      setNewRecipeInstructions('');
      setNewRecipeImageUrl('');
      await fetchRecipesAndCategories();
    } catch (err) {
      alert(`Lỗi khi tạo công thức: ${err.message || 'Lỗi server'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : r.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : r.categoryId?.toString() === categoryFilter.toString() ||
          r.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/40 text-primary font-bold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Đang hiển thị
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
            Đang ẩn
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Bản nháp
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-outline font-bold text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-primary text-xs uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Kho dữ liệu nội dung thời gian thực</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Quản lý Bài viết & Công thức Chay
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Quản lý tất cả công thức, bài viết dinh dưỡng từ PostgreSQL. Kiểm duyệt, ẩn hoặc xuất bản công thức đạt chuẩn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Thêm công thức mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên món, tác giả, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[40px] pl-10 pr-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline"
          />
        </div>

        {/* Filter Badges / Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[40px] px-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đang hiển thị</option>
            <option value="hidden">Đang ẩn</option>
            <option value="draft">Bản nháp</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-[40px] px-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 max-w-[180px] truncate"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <span className="px-3 py-2 rounded-xl bg-surface-container-high text-outline text-xs font-mono font-bold whitespace-nowrap">
            {filteredRecipes.length} bài
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
          <span className="text-xs text-on-surface-variant font-medium">Đang tải kho công thức từ cơ sở dữ liệu...</span>
        </div>
      )}

      {/* Recipes Table */}
      {!loading && (
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-[24px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-surface-container-high/60 bg-surface-container-lowest/50">
                  <th className="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Tên công thức</th>
                  <th className="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Tác giả</th>
                  <th className="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Danh mục</th>
                  <th className="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Dinh dưỡng (Calo)</th>
                  <th className="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Trạng thái</th>
                  <th className="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider">Lượt xem</th>
                  <th className="py-4 px-6 text-xs font-bold text-outline uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/40">
                {filteredRecipes.map((recipe) => (
                  <tr
                    key={recipe.id}
                    className="hover:bg-surface-container-low/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {recipe.imageUrl ? (
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-11 h-11 rounded-xl object-cover ring-1 ring-surface-container-high shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-primary-fixed/40 text-primary-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                            {recipe.title}
                          </span>
                          <span className="text-[11px] text-outline font-mono">
                            Đăng: {recipe.publishedAt || 'Vừa xong'} • Khẩu phần: {recipe.servings || 2} người
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-[10px] shrink-0">
                          {(recipe.author || 'V').charAt(0)}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-on-surface truncate">
                          {recipe.author || 'Tác giả Veggie'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant text-xs font-medium border border-surface-container-high/50">
                        {recipe.category || 'Món chay'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-primary font-mono">
                          {recipe.kcalPerServing || 250} kcal
                        </span>
                        <span className="text-[10px] text-outline font-mono">
                          P: {recipe.proteinG || 12}g • C: {recipe.carbG || 35}g
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {getStatusBadge(recipe.status)}
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs sm:text-sm font-semibold text-on-surface font-mono">
                        {(recipe.views || 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRecipe(recipe)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                          title="Xem chi tiết công thức"
                        >
                          <span className="material-symbols-outlined text-[19px]">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(recipe)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                          title={recipe.status === 'published' ? 'Ẩn công thức này khỏi app' : 'Hiển thị công thức này'}
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            {recipe.status === 'published' ? 'visibility_off' : 'check_circle'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container/50 hover:text-error transition-colors cursor-pointer"
                          title="Xóa công thức"
                        >
                          <span className="material-symbols-outlined text-[19px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRecipes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-outline text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-outline/60">menu_book</span>
                        <span>Không tìm thấy bài viết hoặc công thức nào phù hợp.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full border border-surface-container-high shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-surface-container-high flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {selectedRecipe.imageUrl && (
                  <img
                    src={selectedRecipe.imageUrl}
                    alt={selectedRecipe.title}
                    className="w-16 h-16 rounded-2xl object-cover ring-1 ring-surface-container-high shrink-0"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-xs font-semibold text-on-surface-variant">
                      {selectedRecipe.category || 'Món chay'}
                    </span>
                    {getStatusBadge(selectedRecipe.status)}
                  </div>
                  <h3 className="text-xl font-bold text-on-surface tracking-tight">
                    {selectedRecipe.title}
                  </h3>
                  <p className="text-xs text-outline mt-0.5">
                    Tác giả: <span className="font-semibold text-on-surface">{selectedRecipe.author}</span> • Ngày đăng: <span className="font-mono">{selectedRecipe.publishedAt}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Nutrition Macros Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/60">
                <div className="text-center">
                  <span className="text-[11px] text-outline font-semibold block">Năng lượng</span>
                  <span className="text-lg font-bold text-primary font-mono">{selectedRecipe.kcalPerServing || 250} kcal</span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-outline font-semibold block">Chất đạm (Protein)</span>
                  <span className="text-lg font-bold text-on-surface font-mono">{selectedRecipe.proteinG || 12} g</span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-outline font-semibold block">Carbohydrate</span>
                  <span className="text-lg font-bold text-on-surface font-mono">{selectedRecipe.carbG || 35} g</span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-outline font-semibold block">Chất béo (Fat)</span>
                  <span className="text-lg font-bold text-on-surface font-mono">{selectedRecipe.fatG || 6} g</span>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-2">
                  Hướng dẫn chế biến chi tiết
                </h4>
                <div className="p-4 rounded-2xl bg-surface-container-low text-xs sm:text-sm text-on-surface leading-relaxed border border-surface-container-high/60 whitespace-pre-line">
                  {selectedRecipe.instructions || 'Chưa có thông tin hướng dẫn chi tiết.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-surface-container-high flex items-center justify-between gap-3 bg-surface-container-lowest">
              <button
                type="button"
                onClick={() => handleDeleteRecipe(selectedRecipe.id, selectedRecipe.title)}
                className="px-4 py-2 rounded-xl text-error font-bold text-xs hover:bg-error-container/30 transition-colors cursor-pointer"
              >
                Xóa bài viết
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedRecipe)}
                  className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs hover:bg-surface-container transition-colors cursor-pointer"
                >
                  {selectedRecipe.status === 'published' ? 'Chuyển sang Ẩn' : 'Xuất bản công thức'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecipe(null)}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full border border-surface-container-high shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-surface-container-high flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-on-surface tracking-tight">Thêm công thức mới</h3>
                <p className="text-xs text-outline">Đăng tải công thức món chay mới trực tiếp lên cơ sở dữ liệu</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Tên công thức / món chay *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đậu Hũ Kho Tiêu Xanh Nồi Đất"
                  value={newRecipeTitle}
                  onChange={(e) => setNewRecipeTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Danh mục *</label>
                  <select
                    value={newRecipeCategoryId}
                    onChange={(e) => setNewRecipeCategoryId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Khẩu phần (người)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newRecipeServings}
                    onChange={(e) => setNewRecipeServings(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Link hình ảnh món (URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newRecipeImageUrl}
                  onChange={(e) => setNewRecipeImageUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Hướng dẫn nấu chi tiết *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Các bước sơ chế nguyên liệu, nêm gia vị và thời gian nấu..."
                  value={newRecipeInstructions}
                  onChange={(e) => setNewRecipeInstructions(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-outline hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Xuất bản công thức'}
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
