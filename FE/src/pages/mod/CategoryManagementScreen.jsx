import React, { useState, useEffect } from 'react';
import { categoriesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  SuperAdminReadOnlyBanner,
  ApiErrorBanner,
} from '../../components/ui/OperationalHelpers';

export const CategoryManagementScreen = ({ readOnly = false }) => {
  const { isSuperAdmin } = useAuth();
  const isReadOnly = readOnly || isSuperAdmin;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('recipe');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await categoriesApi.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh mục dinh dưỡng từ cơ sở dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (isReadOnly || !newName.trim()) return;

    try {
      setError('');
      await categoriesApi.createCategory({
        name: newName.trim(),
        type: newType,
      });
      setIsAddOpen(false);
      setNewName('');
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Không thể tạo danh mục mới.');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (isReadOnly) return;
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}" khỏi cơ sở dữ liệu?`)) {
      return;
    }

    try {
      setError('');
      await categoriesApi.deleteCategory(id);
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Không thể xóa danh mục.');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (isReadOnly || !editingCategory?.id || !editingCategory.name.trim()) return;

    try {
      setError('');
      await categoriesApi.updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        type: editingCategory.type || 'recipe',
      });
      setEditingCategory(null);
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Không thể cập nhật danh mục.');
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <SuperAdminReadOnlyBanner readOnly={isReadOnly} />
      <ApiErrorBanner error={error} onDismiss={() => setError('')} onRetry={fetchCategories} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Quản lý Danh mục & Nguồn Dinh dưỡng
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Dữ liệu phân loại thực đơn và nhóm thực phẩm truy xuất trực tiếp từ PostgreSQL.
          </p>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary/90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Thêm danh mục mới</span>
          </button>
        )}
      </div>

      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm danh mục món chay..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <span className="text-xs text-outline font-mono">
          Tổng cộng <b>{filteredCategories.length}</b> danh mục
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <span className="text-xs text-on-surface-variant">Đang tải danh mục từ cơ sở dữ liệu...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="relative rounded-2xl bg-surface-container-lowest p-5 border border-surface-container-high/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[26px]">
                      {cat.icon || 'restaurant'}
                    </span>
                  </div>
                  {!isReadOnly && (
                    <div className="flex items-center gap-1">
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
                  )}
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-on-surface">{cat.name}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-surface-container text-outline">
                      {cat.type}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container-high/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-outline">Năng lượng TB các món:</span>
                  <span className="font-mono font-bold text-on-surface">
                    {cat.avgCalories || '0 kcal'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-outline">Số lượng công thức liên kết:</span>
                  <span className="font-mono font-bold text-primary">
                    {cat.recipeCount ?? 0} món
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-16 text-center rounded-2xl bg-surface-container-lowest border border-dashed border-surface-container-high p-8">
              <span className="material-symbols-outlined text-outline text-[48px]">folder_off</span>
              <h3 className="font-bold text-base text-on-surface mt-2">Chưa có danh mục nào</h3>
              <p className="text-xs text-outline mt-1">
                Không tìm thấy danh mục phù hợp trong cơ sở dữ liệu.
              </p>
            </div>
          )}
        </div>
      )}

      {isAddOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-3">
              <h3 className="font-bold text-base text-on-surface">Thêm danh mục mới</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">Tên danh mục *</label>
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Món xào & Luộc thanh đạm"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Phân loại hệ thống</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface"
                >
                  <option value="recipe">Công thức nấu ăn (recipe)</option>
                  <option value="food_type">Nhóm thực phẩm (food_type)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
                >
                  Lưu vào PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCategory && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
              <h3 className="font-bold text-base text-on-surface">
                Chỉnh sửa danh mục #{editingCategory.id}
              </h3>
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
                <label className="block font-semibold text-on-surface mb-1">Tên danh mục</label>
                <input
                  required
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high/50 text-xs text-on-surface"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Phân loại</label>
                <select
                  value={editingCategory.type || 'recipe'}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, type: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-surface-container-high/50 text-xs text-on-surface"
                >
                  <option value="recipe">recipe</option>
                  <option value="food_type">food_type</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high/40">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
