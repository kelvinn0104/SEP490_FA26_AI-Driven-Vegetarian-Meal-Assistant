import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { categoriesApi } from '../../api';

export const CategoryManagementScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // New category form
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('recipe');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('restaurant');
  const [newCalories, setNewCalories] = useState('180 - 280 kcal');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Escape key & scroll lock for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsAddOpen(false);
        setEditingCategory(null);
      }
    };
    if (isAddOpen || editingCategory) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddOpen, editingCategory]);

  const filteredCategories = categories.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleFeatured = (id) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, featured: !c.featured } : c))
    );
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await categoriesApi.createCategory({
        name: newName.trim(),
        type: newType,
      });
      setIsAddOpen(false);
      setNewName('');
      setNewDesc('');
      await fetchCategories();
      alert(`Đã thêm danh mục mới vào cơ sở dữ liệu: ${newName}`);
    } catch (err) {
      alert(`Lỗi khi tạo danh mục: ${err.message || 'Không thể tạo'}`);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}" khỏi cơ sở dữ liệu?`)) {
      return;
    }

    try {
      await categoriesApi.deleteCategory(id);
      await fetchCategories();
      alert(`Đã xóa danh mục "${name}" thành công!`);
    } catch (err) {
      alert(`Lỗi khi xóa danh mục: ${err.message || 'Không thể xóa'}`);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory?.id || !editingCategory.name.trim()) return;

    try {
      await categoriesApi.updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        type: editingCategory.type || 'recipe',
      });
      setEditingCategory(null);
      await fetchCategories();
      alert('Đã cập nhật danh mục thành công!');
    } catch (err) {
      alert(`Lỗi khi cập nhật danh mục: ${err.message || 'Không thể cập nhật'}`);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Quản lý Nguồn Dinh dưỡng
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Dữ liệu danh mục thực đơn & nguyên liệu thời gian thực từ cơ sở dữ liệu PostgreSQL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Thêm danh mục mới</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm danh mục món chay, tag, từ khóa..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface placeholder:text-outline border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <span className="text-xs text-outline font-mono">
          Tổng cộng <b>{filteredCategories.length}</b> danh mục hoạt động
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <span className="text-xs text-on-surface-variant">Đang tải danh mục từ cơ sở dữ liệu...</span>
        </div>
      )}

      {/* Category Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="relative rounded-2xl bg-surface-container-lowest p-5 border border-surface-container-high/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-[26px]">{cat.icon || 'restaurant'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(cat.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        cat.featured
                          ? 'text-primary bg-primary-fixed/30'
                          : 'text-outline hover:text-on-surface'
                      }`}
                      title={cat.featured ? 'Đang ghim trang chủ' : 'Ghim trang chủ'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {cat.featured ? 'star' : 'star_border'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(cat)}
                      className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 cursor-pointer"
                      title="Xóa danh mục"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-surface-container text-outline">
                      {cat.type}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed line-clamp-2">
                    {cat.description || 'Chuyên mục món chay dinh dưỡng thuộc hệ thống VeggieAI.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container-high/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-outline">Định mức năng lượng:</span>
                  <span className="font-mono font-bold text-on-surface">{cat.avgCalories || '180 - 280 kcal'}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-outline">Số lượng công thức:</span>
                  <span className="font-mono font-bold text-primary">
                    {cat.recipeCount ?? cat.recipesCount ?? 0} món
                  </span>
                </div>

                {/* Diet Compatibility Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {(cat.dietCompatibility || ['Thuần chay']).map((comp) => (
                    <span
                      key={comp}
                      className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface text-[10px] font-medium"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-16 text-center rounded-2xl bg-surface-container-lowest border border-dashed border-surface-container-high p-8">
              <span className="material-symbols-outlined text-outline text-[48px]">folder_off</span>
              <h3 className="font-bold text-base text-on-surface mt-2">Không tìm thấy danh mục nào</h3>
              <p className="text-xs text-outline mt-1">Vui lòng thử tìm kiếm với từ khóa khác hoặc tạo danh mục mới.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {isAddOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-[500px] bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[95vh]">
            {/* Header */}
            <div className="p-6 pb-4 shrink-0 flex items-start justify-between border-b border-[#F0F4F8]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#D1F7E1] rounded-[14px] flex items-center justify-center text-[#006A60] shrink-0">
                  <span className="material-symbols-outlined text-[24px]">create_new_folder</span>
                </div>
                <div>
                  <h3 className="font-bold text-[20px] text-[#1C1B1F] leading-tight">Thêm danh mục mới</h3>
                  <p className="text-[13px] text-[#79747E] mt-0.5">Lưu trực tiếp vào cơ sở dữ liệu PostgreSQL</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-[#49454F] hover:bg-[#F0F4F8] p-1.5 rounded-full transition-colors shrink-0 -mt-1 -mr-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleCreateCategory} className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-bold text-[#1C1B1F]">Tên danh mục <span className="text-[#B3261E]">*</span></label>
                  <span className="text-[11px] font-mono text-[#79747E]">Tối đa 60 ký tự</span>
                </div>
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Món xào & Luộc thanh đạm"
                  className="w-full h-[42px] px-3.5 rounded-xl bg-[#F8F9FE] border border-surface-container-high/60 text-[14px] text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#1C1B1F] mb-1.5">Phân loại hệ thống</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full h-[42px] px-3.5 rounded-xl bg-[#F8F9FE] border border-surface-container-high/60 text-[14px] text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="recipe">Công thức nấu ăn (Recipe)</option>
                  <option value="food_type">Nhóm thực phẩm / Nguyên liệu (Food Type)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#1C1B1F] mb-1.5">Định mức calo ước tính</label>
                <input
                  type="text"
                  value={newCalories}
                  onChange={(e) => setNewCalories(e.target.value)}
                  placeholder="Ví dụ: 180 - 280 kcal"
                  className="w-full h-[42px] px-3.5 rounded-xl bg-[#F8F9FE] border border-surface-container-high/60 text-[14px] text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#1C1B1F] mb-1.5">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả đặc trưng dinh dưỡng và đối tượng thực đơn..."
                  className="w-full p-3.5 rounded-xl bg-[#F8F9FE] border border-surface-container-high/60 text-[14px] text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4F8]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#F0F4F8] text-[#49454F] font-semibold text-[13px] hover:bg-[#E0E6ED] transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-[13px] hover:bg-primary-container shadow-xs transition-colors cursor-pointer"
                >
                  Lưu vào Cơ sở dữ liệu
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Category Modal */}
      {editingCategory && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
              <h3 className="font-bold text-base text-on-surface">Chỉnh sửa danh mục #{editingCategory.id}</h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Tên hiển thị</label>
                <input
                  required
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Phân loại</label>
                <select
                  value={editingCategory.type || 'recipe'}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, type: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="recipe">recipe</option>
                  <option value="food_type">food_type</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Mô tả danh mục</label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high/40">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs hover:bg-surface-container cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container cursor-pointer"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
