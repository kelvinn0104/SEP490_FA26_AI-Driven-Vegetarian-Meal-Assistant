import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const AiMonitoringScreen = () => {
  const { isSuperAdmin } = useAuth();
  const [models, setModels] = useState([]);
  const [logs, setLogs] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterTag, setFilterTag] = useState('ALL');

  const [recipeInput, setRecipeInput] = useState(
    '200g đậu hũ non, 100g nấm bào ngư, 50g hạt điều'
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [analysisOutput, setAnalysisOutput] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  const fetchAiData = async () => {
    try {
      setLoading(true);
      setError('');
      const [modelsRes, telemetryRes, healthRes] = await Promise.allSettled([
        aiApi.getModels(),
        aiApi.getTelemetry(40),
        aiApi.getHealth(),
      ]);

      if (modelsRes.status === 'fulfilled') setModels(modelsRes.value || []);
      if (telemetryRes.status === 'fulfilled') setLogs(telemetryRes.value || []);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value || null);
      if (modelsRes.status === 'rejected' && telemetryRes.status === 'rejected') {
        setError(modelsRes.reason?.message || 'Không thể tải dữ liệu giám sát AI từ Backend.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải dữ liệu giám sát AI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiData();
  }, []);

  const handleStatusChange = async (modelId, newStatus) => {
    if (!isSuperAdmin) return;
    try {
      setError('');
      const updated = await aiApi.updateModelStatus(modelId, newStatus);
      if (updated) {
        setModels((prev) => prev.map((m) => (m.id === modelId ? updated : m)));
      }
    } catch (err) {
      setError(err.message || 'Cập nhật trạng thái mô hình AI thất bại.');
    }
  };

  const handleRunPlayground = async () => {
    if (!recipeInput.trim()) {
      setAnalysisError('Vui lòng nhập danh sách nguyên liệu cần phân tích.');
      return;
    }
    setIsCalculating(true);
    setAnalysisError('');
    setAnalysisOutput(null);
    try {
      const result = await aiApi.parseNutrition(recipeInput.trim());
      setAnalysisOutput(result);
      const updatedTelemetry = await aiApi.getTelemetry(40);
      setLogs(updatedTelemetry || []);
    } catch (err) {
      setAnalysisError(err.message || 'Không thể phân tích dinh dưỡng từ Backend.');
    } finally {
      setIsCalculating(false);
    }
  };

  const totalCalls = models.reduce((sum, m) => sum + (m.totalCalls || 0), 0);
  const avgLatency =
    models.length > 0
      ? Math.round(models.reduce((sum, m) => sum + (m.avgLatencyMs || 0), 0) / models.length)
      : 0;
  const avgAccuracy =
    models.length > 0
      ? (models.reduce((sum, m) => sum + Number(m.accuracy || 0), 0) / models.length).toFixed(1)
      : '0.0';

  const uniqueTags = ['ALL', ...Array.from(new Set(logs.map((l) => l.tag).filter(Boolean)))];
  const filteredLogs = logs.filter((l) => filterTag === 'ALL' || l.tag === filterTag);

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>
              {isSuperAdmin ? 'Giám sát Hệ thống AI (SuperAdmin)' : 'Theo dõi Vận hành AI (Mod)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
            {isSuperAdmin ? 'Giám sát Mô hình & Hạ tầng AI' : 'Theo dõi Vận hành & Phân tích AI'}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Số liệu truy vấn, độ trễ và nhật ký phân tích lấy trực tiếp từ bảng AiModels & AiModelLogs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold font-mono">
            {health?.status || 'Online'}
          </span>
          <button
            type="button"
            onClick={fetchAiData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs font-semibold">
          {error}
        </div>
      )}

      {!isSuperAdmin && (
        <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-300/70 text-sky-900 dark:text-sky-200 text-xs flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-sky-600 shrink-0">
            visibility
          </span>
          <div>
            <span className="font-bold">Chế độ Theo dõi Vận hành AI (Mod - Chỉ xem cấu hình mô hình):</span>{' '}
            <span>
              Bạn được phép theo dõi thông số thực thi AI và kiểm tra công cụ phân tích dinh dưỡng phục vụ duyệt bài. Quyền bật/tắt hoặc cấu hình trạng thái mô hình AI chỉ dành riêng cho <b>SuperAdmin</b>.
            </span>
          </div>
        </div>
      )}

      {/* Real DB Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-xs text-outline font-semibold uppercase">Mô hình đang đăng ký</span>
          <p className="text-2xl font-bold font-mono text-on-surface mt-2">{models.length}</p>
          <span className="text-[11px] text-primary font-medium block mt-1">
            {models.filter((m) => m.status === 'active').length} mô hình đang active
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-xs text-outline font-semibold uppercase">Tổng lượt gọi AI</span>
          <p className="text-2xl font-bold font-mono text-secondary mt-2">
            {totalCalls.toLocaleString('vi-VN')}
          </p>
          <span className="text-[11px] text-outline block mt-1">Ghi nhận trong PostgreSQL</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-xs text-outline font-semibold uppercase">Độ trễ trung bình</span>
          <p className="text-2xl font-bold font-mono text-tertiary mt-2">{avgLatency} ms</p>
          <span className="text-[11px] text-outline block mt-1">Tính trên các mô hình hiện có</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
          <span className="text-xs text-outline font-semibold uppercase">Độ chính xác TB</span>
          <p className="text-2xl font-bold font-mono text-primary mt-2">{avgAccuracy}%</p>
          <span className="text-[11px] text-outline block mt-1">Theo đánh giá mô hình</span>
        </div>
      </div>

      {/* Registered AI Models Table */}
      <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-on-surface">Danh sách Mô hình AI</h2>
          {!isSuperAdmin && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container text-outline font-semibold">
              Chế độ theo dõi vận hành (Chỉ SuperAdmin thay đổi trạng thái mô hình)
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-outline">Đang tải danh sách mô hình...</div>
        ) : models.length === 0 ? (
          <div className="py-8 text-center text-xs text-outline">
            Chưa có mô hình AI nào trong cơ sở dữ liệu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline uppercase font-semibold">
                  <th className="py-2.5 px-3">Tên mô hình</th>
                  <th className="py-2.5 px-3">Loại / Phiên bản</th>
                  <th className="py-2.5 px-3">Độ chính xác</th>
                  <th className="py-2.5 px-3">Độ trễ TB</th>
                  <th className="py-2.5 px-3">Lượt gọi</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  {isSuperAdmin && <th className="py-2.5 px-3 text-right">Điều khiển</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-container-low/40">
                    <td className="py-3 px-3 font-bold text-on-surface">{m.name}</td>
                    <td className="py-3 px-3 font-mono text-outline">
                      {m.type} • v{m.version}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-primary">{m.accuracy}%</td>
                    <td className="py-3 px-3 font-mono">{m.avgLatencyMs} ms</td>
                    <td className="py-3 px-3 font-mono">{(m.totalCalls || 0).toLocaleString('vi-VN')}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                          m.status === 'active'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : m.status === 'retraining'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-surface-container-high text-outline'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="py-3 px-3 text-right">
                        <select
                          value={m.status}
                          onChange={(e) => handleStatusChange(m.id, e.target.value)}
                          className="h-8 px-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/60 text-xs font-semibold cursor-pointer"
                        >
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                          <option value="retraining">retraining</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Telemetry Logs + Real Backend Nutrition Sandbox */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        <div className="xl:col-span-7 rounded-2xl bg-inverse-surface text-inverse-on-surface p-5 sm:p-6 shadow-md border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
                  terminal
                </span>
                <span className="font-mono text-xs uppercase tracking-widest font-bold text-secondary-fixed">
                  NHẬT KÝ TRUY VẤN AI (DATABASE TELEMETRY)
                </span>
              </div>
              <span className="text-[11px] font-mono text-surface-dim">{filteredLogs.length} bản ghi</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-3 pb-2 text-[11px] font-mono">
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFilterTag(tag)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    filterTag === tag
                      ? 'bg-secondary-fixed text-on-secondary-fixed font-bold'
                      : 'bg-white/5 text-surface-dim hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-2 space-y-1.5 font-mono text-xs max-h-96 overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="py-10 text-center text-outline-variant text-xs font-mono">
                  Chưa có bản ghi AiModelLogs nào trong cơ sở dữ liệu.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded bg-black/40 border border-white/5 flex items-baseline justify-between gap-2"
                  >
                    <div className="flex items-baseline gap-2 truncate">
                      <span className="text-outline-variant font-mono text-[11px]">
                        [{log.timestamp}]
                      </span>
                      <span className="text-[11px] font-bold text-secondary-fixed-dim">
                        {log.tag}:
                      </span>
                      <span className="text-surface-bright/90 text-xs truncate">{log.message}</span>
                    </div>
                    <span className="text-[10px] text-outline-variant shrink-0 font-mono">
                      {log.latencyMs}ms
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 rounded-2xl bg-surface-container-lowest p-5 sm:p-6 border border-surface-container-high/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-surface-container-high/50 pb-3">
              <span className="material-symbols-outlined text-primary text-[22px]">science</span>
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  Phân tích Dinh dưỡng qua Backend API
                </h3>
                <p className="text-xs text-outline">
                  Gọi trực tiếp POST /api/ai/recipe/parse-macros (Gemini hoặc CSDL Ingredients)
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Nhập danh sách nguyên liệu kèm định lượng:
                </label>
                <textarea
                  rows={3}
                  value={recipeInput}
                  onChange={(e) => setRecipeInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isCalculating}
                  onClick={handleRunPlayground}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {isCalculating && (
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                  )}
                  <span>{isCalculating ? 'Đang phân tích...' : 'Chạy phân tích dinh dưỡng'}</span>
                </button>
              </div>

              {analysisError && (
                <div className="p-3 rounded-xl bg-error-container/40 border border-error/20 text-error text-xs font-medium">
                  {analysisError}
                </div>
              )}

              {analysisOutput && (
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50 space-y-2 text-xs">
                  {!analysisOutput.analyzed ? (
                    <div className="text-amber-700 font-medium space-y-1">
                      <p className="font-bold">Không thể phân tích tự động nguyên liệu này</p>
                      <p className="text-[11px]">
                        Không tìm thấy nguyên liệu tương ứng trong CSDL và khóa Gemini chưa được bật trên Backend.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between pb-1 border-b border-surface-container-high/40">
                        <span className="font-bold text-primary uppercase">
                          Nguồn: {analysisOutput.source === 'gemini' ? 'Gemini AI' : 'PostgreSQL Ingredients'}
                        </span>
                        <span className="font-mono text-xs font-bold text-on-surface">
                          {analysisOutput.calories} kcal
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-outline">Đạm thực vật:</span>
                          <span className="font-semibold text-on-surface">{analysisOutput.protein}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-outline">Carbs / Chất béo:</span>
                          <span className="font-semibold text-on-surface">
                            {analysisOutput.carbs} / {analysisOutput.fat}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-outline">Vitamin B12 / Sắt:</span>
                          <span className="font-semibold text-secondary">
                            {analysisOutput.b12Percent} • {analysisOutput.ironPercent}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-outline">Độ thuần chay:</span>
                          <span className="font-bold text-primary">{analysisOutput.veganPurity}</span>
                        </div>
                        <div className="p-2 rounded bg-surface-container text-outline font-medium mt-1">
                          Dị ứng: {analysisOutput.allergenAlert}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
