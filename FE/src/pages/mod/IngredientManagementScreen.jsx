import React, { useState, useEffect } from 'react';
import { ingredientsApi } from '../../api';

export const IngredientManagementScreen = () => {
  const [ingredients, setIngredients] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAllergy, setSelectedAllergy] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isStandardsOpen, setIsStandardsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDataSource, setFormDataSource] = useState('USDA FoodData Central 2025');
  const [formKcal, setFormKcal] = useState(150);
  const [formProtein, setFormProtein] = useState(10);
  const [formCarb, setFormCarb] = useState(15);
  const [formFat, setFormFat] = useState(5);
  const [formIron, setFormIron] = useState(2.5);
  const [formB12, setFormB12] = useState(0);
  const [formCalcium, setFormCalcium] = useState(100);
  const [formZinc, setFormZinc] = useState(1.5);
  const [formAllergyIds, setFormAllergyIds] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ingList, allList, stdList] = await Promise.all([
        ingredientsApi.getIngredients({
          search: searchQuery,
          allergyId: selectedAllergy,
          sortBy: sortBy !== 'default' ? sortBy : undefined,
        }),
        ingredientsApi.getAllergies(),
        ingredientsApi.getNutrientStandards(),
      ]);

      setIngredients(ingList || []);
      setAllergies(allList || []);
      setStandards(stdList || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu nguyên liệu & dinh dưỡng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAllergy, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormDataSource('USDA FoodData Central 2025');
    setFormKcal(150);
    setFormProtein(12);
    setFormCarb(15);
    setFormFat(4);
    setFormIron(2.5);
    setFormB12(0);
    setFormCalcium(80);
    setFormZinc(1.5);
    setFormAllergyIds([]);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDataSource(item.dataSource || 'USDA FoodData Central 2025');
    setFormKcal(item.kcalPer100g);
    setFormProtein(item.proteinPer100g);
    setFormCarb(item.carbPer100g);
    setFormFat(item.fatPer100g);
    setFormIron(item.ironPer100g);
    setFormB12(item.b12Per100g);
    setFormCalcium(item.calciumPer100g);
    setFormZinc(item.zincPer100g);
    setFormAllergyIds(item.allergyIds || []);
    setIsAddEditOpen(true);
  };

  const handleSaveIngredient = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Vui lòng nhập tên nguyên liệu.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formName.trim(),
        dataSource: formDataSource.trim(),
        kcalPer100g: Number(formKcal) || 0,
        proteinPer100g: Number(formProtein) || 0,
        carbPer100g: Number(formCarb) || 0,
        fatPer100g: Number(formFat) || 0,
        ironPer100g: Number(formIron) || 0,
        b12Per100g: Number(formB12) || 0,
        calciumPer100g: Number(formCalcium) || 0,
        zincPer100g: Number(formZinc) || 0,
        allergyIds: formAllergyIds,
      };

      if (editingItem) {
        await ingredientsApi.updateIngredient(editingItem.id, payload);
        alert(`Đã cập nhật nguyên liệu "${payload.name}" thành công!`);
      } else {
        await ingredientsApi.createIngredient(payload);
        alert(`Đã thêm nguyên liệu "${payload.name}" vào cơ sở dữ liệu!`);
      }

      setIsAddEditOpen(false);
      await fetchData();
    } catch (err) {
      alert(`Lỗi khi lưu nguyên liệu: ${err.message || 'Lỗi server'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nguyên liệu "${item.name}" khỏi thư viện dinh dưỡng?`)) {
      return;
    }

    try {
      await ingredientsApi.deleteIngredient(item.id);
      alert(`Đã xóa nguyên liệu "${item.name}" thành công!`);
      await fetchData();
    } catch (err) {
      alert(`Lỗi khi xóa: ${err.message || 'Lỗi server'}`);
    }
  };

  const toggleAllergySelection = (allergyId) => {
    setFormAllergyIds((prev) =>
      prev.includes(allergyId) ? prev.filter((id) => id !== allergyId) : [...prev, allergyId]
    );
  };

  // Metric stats
  const totalCount = ingredients.length;
  const highProteinCount = ingredients.filter((i) => i.proteinPer100g >= 15).length;
  const highMicronutrientCount = ingredients.filter((i) => i.b12Per100g > 0.5 || i.ironPer100g >= 3).length;
  const allergenIngredientCount = ingredients.filter((i) => i.allergies && i.allergies.length > 0).length;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">science</span>
            <span>Chuyên môn Dinh dưỡng • Tiêu chuẩn Thực dưỡng Thuần chay</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
            Thư viện Dinh dưỡng & Vi chất Chay
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Quản lý thành phần Đạm thực vật, Calo và Bộ 4 vi chất vàng (B12, Sắt, Canxi, Kẽm) cho người ăn chay
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsStandardsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs sm:text-sm font-semibold border border-surface-container-high hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">menu_book</span>
            <span>Chuẩn nhu cầu RDI</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Thêm nguyên liệu mới</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-outline uppercase font-semibold">Nguyên liệu Chuẩn hóa</span>
          <p className="text-2xl font-bold text-on-surface font-mono mt-1">{totalCount}</p>
          <span className="text-[10px] text-primary font-semibold flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Cơ sở dữ liệu USDA & Viện Dinh Dưỡng
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-outline uppercase font-semibold">Giàu Đạm Thực Vật</span>
          <p className="text-2xl font-bold text-secondary font-mono mt-1">{highProteinCount}</p>
          <span className="text-[10px] text-on-surface-variant mt-1">&ge; 15g Protein / 100g (Tempeh, Đậu hũ, Men)</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-outline uppercase font-semibold">Giàu B12 &amp; Sắt (Fe)</span>
          <p className="text-2xl font-bold text-tertiary font-mono mt-1">{highMicronutrientCount}</p>
          <span className="text-[10px] text-tertiary font-semibold mt-1">Vi chất vàng chống thiếu máu ở người ăn chay</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-outline uppercase font-semibold">Cảnh Báo Dị Ứng</span>
          <p className="text-2xl font-bold text-error font-mono mt-1">{allergenIngredientCount}</p>
          <span className="text-[10px] text-error font-medium mt-1">Đậu nành, Gluten, Đậu phộng, Hạt cây</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên nguyên liệu, nguồn dữ liệu..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface placeholder:text-outline border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Allergy filter */}
          <select
            value={selectedAllergy}
            onChange={(e) => setSelectedAllergy(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Mọi nhóm dị ứng</option>
            {allergies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.ingredientCount || 0})
              </option>
            ))}
          </select>

          {/* Nutrient sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="default">Sắp xếp: Mới cập nhật</option>
            <option value="protein_desc">Giàu Đạm (Protein) nhất</option>
            <option value="iron_desc">Giàu Sắt (Iron Fe) nhất</option>
            <option value="b12_desc">Giàu Vitamin B12 nhất</option>
            <option value="calcium_desc">Giàu Canxi (Ca) nhất</option>
            <option value="zinc_desc">Giàu Kẽm (Zn) nhất</option>
            <option value="kcal_asc">Calo thấp nhất</option>
            <option value="kcal_desc">Calo cao nhất</option>
          </select>

          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
          >
            Tìm kiếm
          </button>
        </form>

        <span className="text-xs text-outline font-mono">
          Hiển thị <b>{ingredients.length}</b> nguyên liệu
        </span>
      </div>

      {/* Main Data Table */}
      <div className="rounded-xl bg-surface-container-lowest p-5 shadow-xs border border-surface-container-high/40 overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-outline gap-2">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
            <span className="text-xs font-medium">Đang tải thư viện dinh dưỡng...</span>
          </div>
        ) : ingredients.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-outline gap-2">
            <span className="material-symbols-outlined text-[40px]">search_off</span>
            <p className="text-sm font-semibold text-on-surface">Không tìm thấy nguyên liệu phù hợp</p>
            <p className="text-xs">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3 rounded-l-lg">Nguyên liệu &amp; Nguồn</th>
                  <th className="py-2.5 px-3 text-right">Calo (100g)</th>
                  <th className="py-2.5 px-3 text-right">Đạm (Protein)</th>
                  <th className="py-2.5 px-3 text-right">Carb / Fat</th>
                  <th className="py-2.5 px-3">Bộ 4 Vi Chất Vàng (B12, Sắt, Canxi, Kẽm)</th>
                  <th className="py-2.5 px-3">Cảnh báo Dị ứng</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {ingredients.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* Name & Source */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-on-surface">{item.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-outline font-mono">{item.dataSource || 'USDA FoodData'}</span>
                          <span className="text-outline text-[10px]">•</span>
                          <span className="text-[10px] text-outline">Cập nhật: {item.updatedAt}</span>
                        </div>
                      </div>
                    </td>

                    {/* Calories */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-on-surface">
                      {item.kcalPer100g} <span className="text-[10px] text-outline font-normal">kcal</span>
                    </td>

                    {/* Protein */}
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-xs font-bold ${
                        item.proteinPer100g >= 20
                          ? 'bg-primary-fixed text-on-primary-fixed-variant'
                          : item.proteinPer100g >= 10
                          ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {item.proteinPer100g}g
                      </span>
                    </td>

                    {/* Carb & Fat */}
                    <td className="py-3 px-3 text-right font-mono text-outline">
                      <span className="text-on-surface">{item.carbPer100g}g</span> / {item.fatPer100g}g
                    </td>

                    {/* Micronutrients Badges */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-[340px]">
                        {/* Vitamin B12 */}
                        {item.b12Per100g > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-mono text-[11px] font-bold" title="Vitamin B12">
                            <span>B12:</span>
                            <span>{item.b12Per100g}&micro;g</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-outline font-mono">B12: 0&micro;g</span>
                        )}

                        {/* Iron Fe */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                          item.ironPer100g >= 3.0
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-surface-container text-on-surface-variant'
                        }`} title="Sắt (Iron)">
                          <span>Fe:</span>
                          <span>{item.ironPer100g}mg</span>
                        </span>

                        {/* Calcium Ca */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                          item.calciumPer100g >= 150
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : 'bg-surface-container text-on-surface-variant'
                        }`} title="Canxi (Calcium)">
                          <span>Ca:</span>
                          <span>{item.calciumPer100g}mg</span>
                        </span>

                        {/* Zinc Zn */}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[11px]" title="Kẽm (Zinc)">
                          <span>Zn:</span>
                          <span>{item.zincPer100g}mg</span>
                        </span>
                      </div>
                    </td>

                    {/* Allergies */}
                    <td className="py-3 px-3">
                      {item.allergies && item.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.allergies.map((a, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-outline text-[11px]">Không dị ứng</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-primary-fixed/20 transition-colors cursor-pointer"
                          title="Chỉnh sửa thành phần"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                          title="Xóa nguyên liệu"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Thêm / Sửa Nguyên liệu */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60 bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[24px]">science</span>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    {editingItem ? 'Hiệu chỉnh Dinh dưỡng Nguyên liệu' : 'Thêm Nguyên liệu Chay Mới'}
                  </h3>
                  <p className="text-xs text-outline">Định lượng trên 100g thực phẩm ăn được</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveIngredient} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-bold text-on-surface">Tên nguyên liệu <span className="text-error">*</span></label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Tempeh đậu nành hữu cơ, Tảo xoắn Spirulina..."
                    className="h-10 px-3 rounded-lg bg-surface-container-low text-xs border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-bold text-on-surface">Nguồn dữ liệu kiểm định</label>
                  <input
                    type="text"
                    value={formDataSource}
                    onChange={(e) => setFormDataSource(e.target.value)}
                    placeholder="VD: USDA FoodData Central 2025, Viện Dinh Dưỡng Quốc Gia..."
                    className="h-10 px-3 rounded-lg bg-surface-container-low text-xs border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Macronutrients Group */}
              <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-surface-container-high/50 space-y-2">
                <span className="font-bold text-xs text-primary uppercase tracking-wider block">
                  1. Đa lượng (Macronutrients / 100g)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-outline">Năng lượng (kcal)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formKcal}
                      onChange={(e) => setFormKcal(e.target.value)}
                      className="h-9 px-3 rounded-lg bg-surface-container-lowest text-xs font-mono font-bold border border-surface-container-high/60"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-secondary font-bold">Đạm Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formProtein}
                      onChange={(e) => setFormProtein(e.target.value)}
                      className="h-9 px-3 rounded-lg bg-surface-container-lowest text-xs font-mono font-bold text-secondary border border-surface-container-high/60"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-outline">Carbohydrate (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formCarb}
                      onChange={(e) => setFormCarb(e.target.value)}
                      className="h-9 px-3 rounded-lg bg-surface-container-lowest text-xs font-mono border border-surface-container-high/60"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-outline">Chất béo Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formFat}
                      onChange={(e) => setFormFat(e.target.value)}
                      className="h-9 px-3 rounded-lg bg-surface-container-lowest text-xs font-mono border border-surface-container-high/60"
                    />
                  </div>
                </div>
              </div>

              {/* Micronutrients Group - The Vegan Quad */}
              <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-surface-container-high/50 space-y-2">
                <span className="font-bold text-xs text-amber-700 uppercase tracking-wider block">
                  2. Bộ 4 Vi Chất Vàng Chay (Micronutrients / 100g)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-amber-800 font-bold">Sắt Fe (mg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formIron}
                      onChange={(e) => setFormIron(e.target.value)}
                      className="h-9 px-3 rounded-lg bg-surface-container-lowest text-xs font-mono font-bold text-amber-900 border border-surface-container-high/60"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-tertiary font-bold">Vitamin B12 (&micro;g)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formB12}
                      onChange={(e) => setFormB12(e.target.value)}
                      className="h-9 px-3 rounded-lg bg-surface-container-lowest text-xs font-mono font-bold text-tertiary border border-surface-container-high/60"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-emerald-800 font-bold">Canxi Ca (mg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formCalcium}
                      onChange={(e) => setFormCalcium(e.target.value)}
                      className="h-9 px-3 rounded-lg bg-surface-container-lowest text-xs font-mono font-bold text-emerald-900 border border-surface-container-high/60"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-outline">Kẽm Zn (mg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formZinc}
                      onChange={(e) => setFormZinc(e.target.value)}
                      className="h-9 px-3 rounded-lg bg-surface-container-lowest text-xs font-mono border border-surface-container-high/60"
                    />
                  </div>
                </div>
              </div>

              {/* Allergies Group */}
              <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-surface-container-high/50 space-y-2">
                <span className="font-bold text-xs text-error uppercase tracking-wider block">
                  3. Nhóm Dị Ứng Thực Vật Liên Quan
                </span>
                <p className="text-[11px] text-outline">
                  Chọn các dị nguyên có trong nguyên liệu để hệ thống tự động cảnh báo cho người dùng:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {allergies.map((a) => {
                    const isChecked = formAllergyIds.includes(a.id);
                    return (
                      <label
                        key={a.id}
                        onClick={() => toggleAllergySelection(a.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-error-container text-on-error-container border-error'
                            : 'bg-surface-container-lowest text-on-surface border-surface-container-high hover:bg-surface-container'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="rounded text-error focus:ring-error"
                        />
                        <span>{a.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : editingItem ? 'Cập nhật Dinh dưỡng' : 'Thêm Nguyên liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bảng Nhu cầu Khuyến nghị Vi chất (RDI Standards) */}
      {isStandardsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60 bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[24px]">menu_book</span>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    Bảng Nhu Cầu Khuyến Nghị Vi Chất Chay (RDI Standards)
                  </h3>
                  <p className="text-xs text-outline">Tham chiếu Viện Dinh Dưỡng &amp; Hiệp Hội Dinh Dưỡng Thực Dưỡng Hoa Kỳ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStandardsOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="p-3.5 rounded-xl bg-primary-fixed/20 border border-primary/20 text-on-surface leading-relaxed">
                <p className="font-bold text-primary mb-1">💡 Lưu ý chuyên môn cho Người Ăn Chay (Vegan / Vegetarian):</p>
                <ul className="list-disc pl-4 space-y-1 text-on-surface-variant text-[11.5px]">
                  <li>
                    <b>Sắt thực vật (Non-heme Iron):</b> Tỷ lệ hấp thu thấp hơn sắt động vật, khuyến nghị người ăn chay tăng gấp <b>1.8 lần</b> và kết hợp cùng Vitamin C tự nhiên.
                  </li>
                  <li>
                    <b>Vitamin B12:</b> Thực vật tự nhiên không tự tổng hợp B12. Bắt buộc bổ sung từ Men dinh dưỡng (Nutritional Yeast), sữa hạt tăng cường hoặc viên uống vi chất.
                  </li>
                  <li>
                    <b>Canxi (Calcium):</b> Dồi dào trong Đậu hũ ép muối canxi, rau cải xoăn kale, hạt chia và mè rang.
                  </li>
                </ul>
              </div>

              {/* Table of standards */}
              <div className="border border-surface-container-high/60 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-outline uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Đối tượng</th>
                      <th className="py-2.5 px-3 text-right">Sắt (Fe)</th>
                      <th className="py-2.5 px-3 text-right">Vitamin B12</th>
                      <th className="py-2.5 px-3 text-right">Canxi (Ca)</th>
                      <th className="py-2.5 px-3 text-right">Kẽm (Zn)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40">
                    {standards.map((s) => (
                      <tr key={s.id} className="hover:bg-surface-container-low/30">
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface">
                              {s.gender === 'male' ? 'Nam giới' : 'Nữ giới'} ({s.ageFrom} - {s.ageTo} tuổi)
                            </span>
                            <span className="text-[10px] text-outline">{s.note}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-800">{s.ironMg} mg/ngày</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-tertiary">{s.b12Mcg} &micro;g/ngày</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">{s.calciumMg} mg/ngày</td>
                        <td className="py-3 px-3 text-right font-mono text-outline">{s.zincMg} mg/ngày</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsStandardsOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container cursor-pointer"
                >
                  Đóng tài liệu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
