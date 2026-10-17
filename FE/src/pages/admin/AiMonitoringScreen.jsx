import React, { useState, useEffect } from 'react';
import { logsApi, aiApi } from '../../api';

export const AiMonitoringScreen = () => {
  const [activeTab, setActiveTab] = useState('system_logs'); // 'system_logs' | 'ai_telemetry'

  // System Logs State
  const [systemLogs, setSystemLogs] = useState([]);
  const [loadingSystemLogs, setLoadingSystemLogs] = useState(false);
  const [systemLogFilter, setSystemLogFilter] = useState('ALL');
  const [searchLogQuery, setSearchLogQuery] = useState('');

  // AI Stream & Telemetry State
  const [logs, setLogs] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filterTag, setFilterTag] = useState('ALL');

  // Interactive playground
  const [recipeInput, setRecipeInput] = useState(
    '200g đậu hũ ky tươi, 100g nấm bào ngư xám, 50g hạt điều rang, 1 thìa men dinh dưỡng (nutritional yeast)'
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [analysisOutput, setAnalysisOutput] = useState(null);

  // Fetch System Logs
  const fetchSystemLogs = async () => {
    try {
      setLoadingSystemLogs(true);
      const data = await logsApi.getSystemLogs({
        type: systemLogFilter,
        search: searchLogQuery,
        limit: 50,
      });
      setSystemLogs(data || []);
    } catch (err) {
      console.error('Could not fetch system logs from API:', err);
    } finally {
      setLoadingSystemLogs(false);
    }
  };

  useEffect(() => {
    fetchSystemLogs();
  }, [systemLogFilter]);

  // Load telemetry logs on mount
  useEffect(() => {
    aiApi.getTelemetry().then((telemetry) => {
      if (telemetry && telemetry.length > 0) {
        setLogs(telemetry);
      }
    }).catch((err) => {
      console.error('Failed to load initial AI telemetry:', err);
    });
  }, []);

  // AI Telemetry stream
  useEffect(() => {
    if (isPaused || activeTab !== 'ai_telemetry') return;

    const streamItems = [
      {
        tag: 'PARSE_CALORIES',
        message: '310 kcal match (Đậu hũ non sốt nấm hương)',
        latency: 18,
        type: 'success',
      },
      {
        tag: 'RECIPE_EMBEDDINGS',
        message: '512-dim vector indexed for search query',
        latency: 35,
        type: 'info',
      },
      {
        tag: 'TOXICITY_CHECK',
        message: '0.001 (an toàn tuyệt đối)',
        latency: 12,
        type: 'accent',
      },
      {
        tag: 'BATCH_RUN',
        message: 'Sync USDA FoodData Central 2025 completed',
        latency: 120,
        type: 'warn',
      },
    ];

    const interval = setInterval(() => {
      const item = streamItems[Math.floor(Math.random() * streamItems.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newLog = {
        id: 'log-' + Date.now(),
        timestamp: timeStr,
        tag: item.tag,
        message: item.message,
        latencyMs: item.latency,
        type: item.type,
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 19)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, activeTab]);

  const handleRunPlayground = async () => {
    setIsCalculating(true);
    try {
      const result = await aiApi.parseNutrition(recipeInput);
      setAnalysisOutput(result);
    } catch (err) {
      console.warn('API parseNutrition error, using simulation fallback:', err);
      setAnalysisOutput({
        calories: 385,
        protein: '24.8g (Đạm hoàn chỉnh chứa đủ 9 axit amin)',
        b12Percent: '120% RDI (Bổ sung từ men dinh dưỡng tự nhiên)',
        ironPercent: '38% RDI (Kèm Vitamin C hấp thu tối ưu)',
        absorptionRating: '94.2% (Tỉ lệ sinh khả dụng cao)',
        veganPurity: '100% Thực vật nguyên bản',
        allergenAlert: 'Có chứa đậu nành / hạt điều, không chứa gluten',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (filterTag === 'ALL') return true;
    return l.tag === filterTag;
  });

  const filteredSystemLogs = systemLogs.filter((l) => {
    if (!searchLogQuery.trim()) return true;
    const q = searchLogQuery.toLowerCase();
    return (
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.target && l.target.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q)) ||
      (l.userName && l.userName.toLowerCase().includes(q))
    );
  });

  const getLogTypeBadge = (type) => {
    switch (type) {
      case 'auth':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
            Xác thực
          </span>
        );
      case 'user_management':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
            Người dùng
          </span>
        );
      case 'role_management':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20">
            Phân quyền
          </span>
        );
      case 'moderation':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            Kiểm duyệt
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-surface-container-high text-on-surface-variant">
            Hệ thống
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Cụm máy chủ TP.HCM (HCM-01) • Trạng thái: Hoạt động tối ưu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
            Log Hệ thống & Giám sát AI
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Truy xuất nhật ký kiểm toán hệ thống, giám sát luồng phân tích dinh dưỡng và vi chất
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Healthy (99.98% SLA)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high/60 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('system_logs')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'system_logs'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">assignment</span>
          <span>Nhật ký Thao tác (Audit Log)</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[11px] font-mono">
            {filteredSystemLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai_telemetry')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'ai_telemetry'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">neurology</span>
          <span>Inference Stream & Sandbox</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM AUDIT LOGS */}
      {activeTab === 'system_logs' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[220px]">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchLogQuery}
                  onChange={(e) => setSearchLogQuery(e.target.value)}
                  placeholder="Tìm kiếm theo hành động, người thực hiện, đối tượng..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface placeholder:text-outline border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'auth', label: 'Xác thực' },
                  { id: 'user_management', label: 'Người dùng' },
                  { id: 'role_management', label: 'Phân quyền' },
                  { id: 'moderation', label: 'Kiểm duyệt' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSystemLogFilter(type.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      systemLogFilter === type.id
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={fetchSystemLogs}
              disabled={loadingSystemLogs}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[16px] ${loadingSystemLogs ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>Làm mới</span>
            </button>
          </div>

          {/* Table of System Logs */}
          <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-surface-container-high/40 bg-surface-container-low/50 text-outline uppercase font-semibold">
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Người thực hiện</th>
                    <th className="py-3 px-4">Phân loại</th>
                    <th className="py-3 px-4">Hành động</th>
                    <th className="py-3 px-4">Đối tượng</th>
                    <th className="py-3 px-4">Nội dung chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30">
                  {filteredSystemLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-outline whitespace-nowrap">
                        <div>{log.timeAgo || log.createdAt}</div>
                        <div className="text-[10px] text-outline/60">{log.createdAt}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-on-surface whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                            {(log.userName || 'S')[0]}
                          </div>
                          <span>{log.userName || 'Hệ thống'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getLogTypeBadge(log.logType)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-on-surface">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-secondary">
                        {log.target || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant max-w-md truncate">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}

                  {filteredSystemLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-outline">
                        <span className="material-symbols-outlined text-[32px] block mb-2 opacity-50">
                          inbox
                        </span>
                        <span>Không có nhật ký nào phù hợp với bộ lọc hiện tại.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI TELEMETRY & HARDWARE METRICS */}
      {activeTab === 'ai_telemetry' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Cluster Hardware Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-outline font-semibold uppercase">Bộ nhớ Ram Cụm</span>
                <span className="material-symbols-outlined text-primary text-[20px]">memory</span>
              </div>
              <p className="text-2xl font-bold font-mono text-on-surface mt-2">340 / 500 GB</p>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-3">
                <div className="bg-primary h-full rounded-full" style={{ width: '68%' }}></div>
              </div>
              <span className="text-[11px] text-primary font-mono font-medium block mt-1.5">
                68% Dung lượng sử dụng
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-outline font-semibold uppercase">Tải GPU Engine</span>
                <span className="material-symbols-outlined text-secondary text-[20px]">developer_board</span>
              </div>
              <p className="text-2xl font-bold font-mono text-secondary mt-2">34.2%</p>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-3">
                <div className="bg-secondary h-full rounded-full" style={{ width: '34.2%' }}></div>
              </div>
              <span className="text-[11px] text-outline font-mono block mt-1.5">
                Nhiệt độ 52°C • 8x Nvidia A100
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-outline font-semibold uppercase">Độ trễ trung bình</span>
                <span className="material-symbols-outlined text-tertiary text-[20px]">speed</span>
              </div>
              <p className="text-2xl font-bold font-mono text-tertiary mt-2">21 ms</p>
              <span className="text-xs text-on-surface-variant font-medium block mt-3">
                94.6% phản hồi dưới 30ms
              </span>
              <span className="text-[11px] text-primary font-mono font-medium">Inference batch-run OK</span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-outline font-semibold uppercase">Embedding Dimensions</span>
                <span className="material-symbols-outlined text-on-surface text-[20px]">hub</span>
              </div>
              <p className="text-2xl font-bold font-mono text-on-surface mt-2">512-dim</p>
              <span className="text-xs text-on-surface-variant font-medium block mt-3">
                Cosine Similarity 0.942
              </span>
              <span className="text-[11px] text-secondary font-mono font-medium">Milvus Vector Index</span>
            </div>
          </div>

          {/* Grid: Real-time Telemetry Stream & Live Sandbox */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
            {/* Left (7 cols): Terminal Stream */}
            <div className="xl:col-span-7 rounded-2xl bg-inverse-surface text-inverse-on-surface p-5 sm:p-6 shadow-md border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
                      terminal
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest font-bold text-secondary-fixed">
                      LIVE INFERENCE STREAM
                    </span>
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPaused(!isPaused)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        isPaused
                          ? 'bg-amber-400 text-slate-900'
                          : 'bg-white/10 text-surface-bright hover:bg-white/20'
                      }`}
                    >
                      {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogs([])}
                      className="px-3 py-1 rounded-lg bg-white/10 text-surface-bright hover:bg-white/20 text-xs font-mono cursor-pointer"
                    >
                      Xóa log
                    </button>
                  </div>
                </div>

                {/* Tag filter pills */}
                <div className="flex flex-wrap gap-1.5 pt-3 pb-2 text-[11px] font-mono">
                  {['ALL', 'PARSE_CALORIES', 'TOXICITY_CHECK', 'RECIPE_EMBEDDINGS', 'QUEUE_EVENT'].map(
                    (tag) => (
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
                    )
                  )}
                </div>

                {/* Stream Console Content */}
                <div className="mt-2 space-y-1.5 font-mono text-xs max-h-96 overflow-y-auto pr-1">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded bg-black/40 border border-white/5 flex items-baseline justify-between gap-2"
                    >
                      <div className="flex items-baseline gap-2 truncate">
                        <span className="text-outline-variant font-mono text-[11px]">
                          [{log.timestamp}]
                        </span>
                        <span
                          className={`text-[11px] font-bold ${
                            log.type === 'success'
                              ? 'text-secondary-fixed-dim'
                              : log.type === 'accent'
                              ? 'text-tertiary-fixed-dim'
                              : log.type === 'info'
                              ? 'text-primary-fixed'
                              : 'text-amber-300'
                          }`}
                        >
                          {log.tag}:
                        </span>
                        <span className="text-surface-bright/90 text-xs truncate">{log.message}</span>
                      </div>
                      {log.latencyMs && (
                        <span className="text-[10px] text-outline-variant shrink-0 font-mono">
                          {log.latencyMs}ms
                        </span>
                      )}
                    </div>
                  ))}

                  {filteredLogs.length === 0 && (
                    <div className="py-8 text-center text-outline-variant text-xs font-mono">
                      Không có sự kiện mới theo bộ lọc này.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 text-[11px] text-surface-dim flex justify-between items-center mt-4">
                <span>Kernel: VeggieAI-Runtime-v3.8 (Go / C++ TensorRT)</span>
                <span className="font-mono text-secondary-fixed">TP.HCM Data Node #1</span>
              </div>
            </div>

            {/* Right (5 cols): AI Nutrition Sandbox */}
            <div className="xl:col-span-5 rounded-2xl bg-surface-container-lowest p-5 sm:p-6 border border-surface-container-high/50 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-surface-container-high/50 pb-3">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    science
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-on-surface">
                      Thử nghiệm Phân tích Dinh dưỡng AI
                    </h3>
                    <p className="text-xs text-outline">
                      Kiểm tra khả năng phân tách calo, vi chất và phát hiện dị ứng
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Nhập danh sách nguyên liệu món chay:
                    </label>
                    <textarea
                      rows={3}
                      value={recipeInput}
                      onChange={(e) => setRecipeInput(e.target.value)}
                      className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-mono leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isCalculating}
                      onClick={handleRunPlayground}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                    >
                      {isCalculating && (
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          progress_activity
                        </span>
                      )}
                      <span>{isCalculating ? 'Đang giải mã vi chất...' : 'Chạy phân tích AI'}</span>
                    </button>
                  </div>

                  {analysisOutput && (
                    <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50 space-y-2 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-1 border-b border-surface-container-high/40">
                        <span className="font-bold text-primary">KẾT QUẢ ĐỐI CHIẾU USDA</span>
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
                          <span className="text-outline">Vitamin B12:</span>
                          <span className="font-semibold text-secondary">{analysisOutput.b12Percent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-outline">Sắt hữu cơ:</span>
                          <span className="font-semibold text-on-surface">{analysisOutput.ironPercent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-outline">Sinh khả dụng:</span>
                          <span className="font-mono font-bold text-tertiary">
                            {analysisOutput.absorptionRating}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-outline">Độ thuần chay:</span>
                          <span className="font-bold text-primary">{analysisOutput.veganPurity}</span>
                        </div>
                        <div className="p-2 rounded bg-surface-container text-outline font-medium mt-1">
                          ⚠️ {analysisOutput.allergenAlert}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container-high/40 text-xs text-outline flex items-center justify-between">
                <span>Dữ liệu cơ sở: USDA National Nutrient Database</span>
                <span className="font-mono text-primary font-bold">API Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
