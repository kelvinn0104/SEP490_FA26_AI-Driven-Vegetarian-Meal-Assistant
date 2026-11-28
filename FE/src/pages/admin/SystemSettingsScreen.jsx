import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../api';
import { exportToJson } from '../../utils/exportUtils';

export const SystemSettingsScreen = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSettings = async (search = searchQuery) => {
    try {
      setLoading(true);
      setError('');
      const data = await settingsApi.getSettings(search);
      setSettings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải cấu hình hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings('');
  }, []);

  const openCreateModal = () => {
    setEditingKey(null);
    setFormKey('');
    setFormValue('');
    setFormDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingKey(item.key);
    setFormKey(item.key);
    setFormValue(item.value);
    setFormDesc(item.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formKey.trim() || !formValue.trim()) return;
    try {
      setSaving(true);
      setError('');
      await settingsApi.saveSetting({
        key: formKey.trim(),
        value: formValue.trim(),
        description: formDesc.trim(),
      });
      setIsModalOpen(false);
      await fetchSettings();
    } catch (err) {
      setError(err.message || 'Lưu cấu hình thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm(`Xóa tham số cấu hình "${key}" khỏi hệ thống?`)) return;
    try {
      setError('');
      await settingsApi.deleteSetting(key);
      setSettings((prev) => prev.filter((s) => s.key !== key));
    } catch (err) {
      setError(err.message || 'Không thể xóa cấu hình.');
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Quản trị Hệ thống • SuperAdmin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
            Cấu hình Hệ thống (System Settings)
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Quản lý tham số vận hành toàn cục lưu trữ trực tiếp trong bảng SystemSettings (PostgreSQL).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportToJson('veggieai-system-settings', settings)}
            disabled={settings.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs sm:text-sm font-semibold disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Xuất JSON</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold shadow-xs hover:bg-primary/90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Thêm cấu hình</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="underline cursor-pointer">
            Đóng
          </button>
        </div>
      )}

      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchSettings(searchQuery);
          }}
          className="flex items-center gap-2 flex-1 min-w-[240px]"
        >
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo khóa (Key), giá trị hoặc mô tả..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-4 rounded-lg bg-primary text-on-primary text-xs font-bold cursor-pointer"
          >
            Lọc
          </button>
        </form>
        <span className="text-xs font-mono text-outline">
          Tổng số: <b>{settings.length}</b> khóa cấu hình
        </span>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-outline">Đang tải cấu hình hệ thống...</div>
        ) : settings.length === 0 ? (
          <div className="py-12 text-center text-xs text-outline space-y-2">
            <span className="material-symbols-outlined text-[32px] block opacity-50">tune</span>
            <p>Chưa có khóa cấu hình nào. Nhấn &quot;Thêm cấu hình&quot; để khởi tạo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline uppercase font-semibold border-b border-surface-container-high/40">
                  <th className="py-3 px-4">Khóa (Key)</th>
                  <th className="py-3 px-4">Giá trị (Value)</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4">Cập nhật bởi</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {settings.map((item) => (
                  <tr key={item.key} className="hover:bg-surface-container-low/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">{item.key}</td>
                    <td className="py-3.5 px-4 font-mono text-on-surface max-w-xs truncate">
                      {item.value}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant max-w-sm">
                      {item.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-on-surface">
                      {item.updatedByName || 'Hệ thống'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-outline">{item.updatedAt}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-primary hover:bg-surface-container cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.key)}
                          className="p-1.5 rounded-lg text-error hover:bg-error-container/30 cursor-pointer"
                          title="Xóa"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-3">
              <h3 className="font-bold text-base text-on-surface">
                {editingKey ? 'Cập nhật cấu hình' : 'Thêm cấu hình hệ thống'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">Khóa cấu hình (Key)</label>
                <input
                  required
                  disabled={!!editingKey}
                  type="text"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="VD: maintenance_mode, max_upload_mb..."
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 font-mono text-xs text-on-surface disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block font-bold text-on-surface mb-1">Giá trị (Value)</label>
                <input
                  required
                  type="text"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="VD: false, 5, gemini-2.5-flash..."
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 font-mono text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="block font-bold text-on-surface mb-1">Mô tả ý nghĩa</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Ghi chú phạm vi ảnh hưởng của cấu hình..."
                  className="w-full p-3 rounded-lg bg-surface-container-low border border-surface-container-high/50 text-xs text-on-surface"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
