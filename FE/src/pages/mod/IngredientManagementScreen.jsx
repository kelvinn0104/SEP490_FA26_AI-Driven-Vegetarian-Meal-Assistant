import React, { useState, useEffect } from 'react';
import { ingredientsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/exportUtils';
import {
  SuperAdminReadOnlyBanner,
  ApiErrorBanner,
} from '../../components/ui/OperationalHelpers';

export const IngredientManagementScreen = ({ readOnly = false }) => {
  const { isSuperAdmin } = useAuth();
  const isReadOnly = readOnly || isSuperAdmin;

  const [ingredients, setIngredients] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAllergy, setSelectedAllergy] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isStandardsOpen, setIsStandardsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDataSource, setFormDataSource] = useState('USDA FoodData Central');
  const [formKcal, setFormKcal] = useState(150);
  const [formProtein, setFormProtein] = useState(10);
  const [formCarb, setFormCarb] = useState(15);
  const [formFat, setFormFat] = useState(5);
  const [formFiber, setFormFiber] = useState('');
  const [formIron, setFormIron] = useState(2.5);
  const [formB12, setFormB12] = useState(0);
  const [formCalcium, setFormCalcium] = useState(100);
  const [formZinc, setFormZinc] = useState(1.5);
  const [formAllergyIds, setFormAllergyIds] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
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
      setError(err.message || 'Không thể tải dữ liệu nguyên liệu & vi chất.');
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
    if (isReadOnly) return;
    setEditingItem(null);
    setFormName('');
    setFormDataSource('USDA FoodData Central');
    setFormKcal(150);
    setFormProtein(12);
    setFormCarb(15);
    setFormFat(4);
    setFormFiber('');
    setFormIron(2.5);
    setFormB12(0);
    setFormCalcium(80);
    setFormZinc(1.5);
    setFormAllergyIds([]);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item) => {
    if (isReadOnly) return;
    setEditingItem(item);
    setFormName(item.name);
    setFormDataSource(item.dataSource || 'USDA FoodData Central');
    setFormKcal(item.kcalPer100g);
    setFormProtein(item.proteinPer100g);
    setFormCarb(item.carbPer100g);
    setFormFat(item.fatPer100g);
    setFormFiber(item.fiberPer100g !== null && item.fiberPer100g !== undefined ? String(item.fiberPer100g) : '');
    setFormIron(item.ironPer100g);
    setFormB12(item.b12Per100g);
    setFormCalcium(item.calciumPer100g);
    setFormZinc(item.zincPer100g);
    setFormAllergyIds(item.allergyIds || []);
    setIsAddEditOpen(true);
  };

  const handleSaveIngredient = async (e) => {
    e.preventDefault();
    if (isReadOnly || !formName.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const payload = {
        name: formName.trim(),
        dataSource: formDataSource.trim(),
        kcalPer100g: Number(formKcal) || 0,
        proteinPer100g: Number(formProtein) || 0,
        carbPer100g: Number(formCarb) || 0,
        fatPer100g: Number(formFat) || 0,
        fiberPer100g: formFiber === '' ? null : Number(formFiber),
        ironPer100g: Number(formIron) || 0,
        b12Per100g: Number(formB12) || 0,
        calciumPer100g: Number(formCalcium) || 0,
        zincPer100g: Number(formZinc) || 0,
        allergyIds: formAllergyIds,
      };

      if (editingItem) {
        await ingredientsApi.updateIngredient(editingItem.id, payload);
      } else {
        await ingredientsApi.createIngredient(payload);
      }

      setIsAddEditOpen(false);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu nguyên liệu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (isReadOnly) return;
    if (!window.confirm(`Xóa nguyên liệu "${item.name}" khỏi thư viện dinh dưỡng?`)) return;

    try {
      setError('');
      await ingredientsApi.deleteIngredient(item.id);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Không thể xóa nguyên liệu (có thể đang được liên kết trong công thức).');
    }
  };

  const toggleAllergySelection = (allergyId) => {
    setFormAllergyIds((prev) =>
      prev.includes(allergyId) ? prev.filter((id) => id !== allergyId) : [...prev, allergyId]
    );
  };

  const totalCount = ingredients.length;
  const highProteinCount = ingredients.filter((i) => i.proteinPer100g >= 15).length;
  const highMicronutrientCount = ingredients.filter(
    (i) => i.b12Per100g > 0.5 || i.ironPer100g >= 3
  ).length;
  const allergenIngredientCount = ingredients.filter(
    (i) => i.allergies && i.allergies.length > 0
  ).length;

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <SuperAdminReadOnlyBanner readOnly={isReadOnly} />
      <ApiErrorBanner error={error} onDismiss={() => setError('')} onRetry={fetchData} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">science</span>
            <span>Thư viện Dinh dưỡng • PostgreSQL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
            Thư viện Nguyên liệu & Vi chất Chay
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Quản lý Đạm thực vật, Calo, Bộ 4 vi chất (B12, Sắt, Canxi, Kẽm) và liên kết dị nguyên.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              exportToCsv(
                'veggieai-ingredients',
                [
                  { key: 'id', label: 'ID' },
                  { key: 'name', label: 'Tên nguyên liệu' },
                  { key: 'kcalPer100g', label: 'Kcal/100g' },
                  { key: 'proteinPer100g', label: 'Protein(g)' },
                  { key: 'carbPer100g', label: 'Carb(g)' },
                  { key: 'fatPer100g', label: 'Fat(g)' },
                  { key: 'ironPer100g', label: 'Fe(mg)' },
                  { key: 'b12Per100g', label: 'B12(mcg)' },
                  { key: 'calciumPer100g', label: 'Ca(mg)' },
                  { key: 'zincPer100g', label: 'Zn(mg)' },
                ],
                ingredients
              )
            }
            disabled={ingredients.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Xuất CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStandardsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold border border-surface-container-high hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">menu_book</span>
            <span>Chuẩn RDI</span>
          </button>

          {!isReadOnly && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary/90 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Thêm nguyên liệu</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Nguyên liệu Chuẩn hóa</span>
          <p className="text-2xl font-bold text-on-surface font-mono mt-1">{totalCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Giàu Đạm (&ge;15g)</span>
          <p className="text-2xl font-bold text-secondary font-mono mt-1">{highProteinCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Giàu B12 & Sắt</span>
          <p className="text-2xl font-bold text-tertiary font-mono mt-1">{highMicronutrientCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-[11px] text-outline uppercase font-semibold">Có Dị nguyên</span>
          <p className="text-2xl font-bold text-error font-mono mt-1">{allergenIngredientCount}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên nguyên liệu, nguồn dữ liệu..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container-high/50"
            />
          </div>

          <select
            value={selectedAllergy}
            onChange={(e) => setSelectedAllergy(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 cursor-pointer"
          >
            <option value="all">Mọi nhóm dị ứng</option>
            {allergies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.ingredientCount || 0})
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container-high/50 cursor-pointer"
          >
            <option value="default">Sắp xếp: Mới cập nhật</option>
            <option value="protein_desc">Giàu Đạm nhất</option>
            <option value="fiber_desc">Giàu Chất xơ (Fiber) nhất</option>
            <option value="iron_desc">Giàu Sắt nhất</option>
            <option value="b12_desc">Giàu Vitamin B12 nhất</option>
            <option value="calcium_desc">Giàu Canxi nhất</option>
            <option value="zinc_desc">Giàu Kẽm nhất</option>
            <option value="kcal_asc">Calo thấp nhất</option>
            <option value="kcal_desc">Calo cao nhất</option>
          </select>

          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer"
          >
            Lọc
          </button>
        </form>

        <span className="text-xs text-outline font-mono">
          Hiển thị <b>{ingredients.length}</b> nguyên liệu
        </span>
      </div>

      <div className="rounded-xl bg-surface-container-lowest p-5 shadow-xs border border-surface-container-high/40 overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-outline gap-2">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary">
              progress_activity
            </span>
            <span className="text-xs font-medium">Đang tải thư viện dinh dưỡng...</span>
          </div>
        ) : ingredients.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-outline gap-2">
            <span className="material-symbols-outlined text-[40px]">search_off</span>
            <p className="text-sm font-semibold text-on-surface">Chưa có nguyên liệu phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Nguyên liệu & Nguồn</th>
                  <th className="py-2.5 px-3 text-right">Calo (100g)</th>
                  <th className="py-2.5 px-3 text-right">Đạm</th>
                  <th className="py-2.5 px-3 text-right">Carb / Fat</th>
                  <th className="py-2.5 px-3">Vi chất (B12, Fe, Ca, Zn)</th>
                  <th className="py-2.5 px-3">Cảnh báo Dị ứng</th>
                  {!isReadOnly && <th className="py-2.5 px-3 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {ingredients.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/40">
                    <td className="py-3 px-3">
                      <span className="text-xs font-bold text-on-surface block">{item.name}</span>
                      <span className="text-[10px] text-outline font-mono">
                        {item.dataSource || 'CSDL Nội bộ'} • {item.updatedAt}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-on-surface">
                      {item.kcalPer100g} kcal
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-primary">
                      {item.proteinPer100g}g
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-outline">
                      {item.carbPer100g}g / {item.fatPer100g}g
                      <span className="block text-[10px] text-teal-700">
                        Xơ: {item.fiberPer100g !== null && item.fiberPer100g !== undefined ? `${item.fiberPer100g}g` : 'Chưa đo'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container">
                          B12: {item.b12Per100g}&micro;g
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container">
                          Fe: {item.ironPer100g}mg
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container">
                          Ca: {item.calciumPer100g}mg
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container">
                          Zn: {item.zincPer100g}mg
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {item.allergies?.length > 0 ? (
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
                        <span className="text-outline text-[11px]">Không</span>
                      )}
                    </td>
                    {!isReadOnly && (
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-outline hover:text-primary cursor-pointer"
                            title="Sửa"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg text-outline hover:text-error cursor-pointer"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddEditOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60">
              <h3 className="font-bold text-base text-on-surface">
                {editingItem ? 'Hiệu chỉnh Nguyên liệu' : 'Thêm Nguyên liệu Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-on-surface block mb-1">Tên nguyên liệu *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/60"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-on-surface block mb-1">Nguồn dữ liệu</label>
                  <input
                    type="text"
                    value={formDataSource}
                    onChange={(e) => setFormDataSource(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/60"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-surface-container-high/50 space-y-2">
                <span className="font-bold text-xs text-primary uppercase block">
                  Đa lượng trên 100g
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-outline block mb-1">Calo (kcal)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formKcal}
                      onChange={(e) => setFormKcal(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-outline block mb-1">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formProtein}
                      onChange={(e) => setFormProtein(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-outline block mb-1">Carb (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formCarb}
                      onChange={(e) => setFormCarb(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-outline block mb-1">Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formFat}
                      onChange={(e) => setFormFat(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-teal-700 font-bold block mb-1">Chất xơ (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Trống nếu chưa đo"
                      value={formFiber}
                      onChange={(e) => setFormFiber(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-surface-container-high/50 space-y-2">
                <span className="font-bold text-xs text-amber-700 uppercase block">
                  Vi chất trên 100g
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-outline block mb-1">Sắt Fe (mg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formIron}
                      onChange={(e) => setFormIron(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-outline block mb-1">B12 (&micro;g)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formB12}
                      onChange={(e) => setFormB12(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-outline block mb-1">Canxi Ca (mg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formCalcium}
                      onChange={(e) => setFormCalcium(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-outline block mb-1">Kẽm Zn (mg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formZinc}
                      onChange={(e) => setFormZinc(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 font-mono"
                    />
                  </div>
                </div>
              </div>

              {allergies.length > 0 && (
                <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-surface-container-high/50 space-y-2">
                  <span className="font-bold text-xs text-error uppercase block">
                    Nhóm dị ứng liên quan
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allergies.map((a) => {
                      const isChecked = formAllergyIds.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleAllergySelection(a.id)}
                          className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left cursor-pointer ${
                            isChecked
                              ? 'bg-error-container text-on-error-container border-error'
                              : 'bg-surface-container-lowest text-on-surface border-surface-container-high'
                          }`}
                        >
                          {isChecked ? '✓ ' : ''}{a.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu vào PostgreSQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStandardsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60">
              <h3 className="font-bold text-base text-on-surface">
                Chuẩn Nhu Cầu Khuyến Nghị Vi Chất (Bảng NutrientStandards)
              </h3>
              <button
                type="button"
                onClick={() => setIsStandardsOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto text-xs">
              {standards.length === 0 ? (
                <p className="text-center text-outline py-8">Chưa có chuẩn RDI trong cơ sở dữ liệu.</p>
              ) : (
                <table className="w-full text-left text-xs border border-surface-container-high rounded-xl overflow-hidden">
                  <thead className="bg-surface-container-low text-outline uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Đối tượng</th>
                      <th className="py-2.5 px-3 text-right">Sắt (Fe)</th>
                      <th className="py-2.5 px-3 text-right">B12</th>
                      <th className="py-2.5 px-3 text-right">Canxi</th>
                      <th className="py-2.5 px-3 text-right">Kẽm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40">
                    {standards.map((s) => (
                      <tr key={s.id}>
                        <td className="py-2.5 px-3 font-semibold">
                          {s.gender === 'male' ? 'Nam' : 'Nữ'} ({s.ageFrom}-{s.ageTo})
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{s.ironMg} mg</td>
                        <td className="py-2.5 px-3 text-right font-mono">{s.b12Mcg} &micro;g</td>
                        <td className="py-2.5 px-3 text-right font-mono">{s.calciumMg} mg</td>
                        <td className="py-2.5 px-3 text-right font-mono">{s.zincMg} mg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
