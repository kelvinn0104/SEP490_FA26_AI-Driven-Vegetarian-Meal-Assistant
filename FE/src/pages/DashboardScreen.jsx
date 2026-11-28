import React, { useState, useEffect, useCallback } from 'react';
import { dashboardApi, aiApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { exportToCsv, exportToHtmlReport } from '../utils/exportUtils';

export const DashboardScreen = ({ onNavigate, onOpenAgentModal }) => {
  const { isSuperAdmin } = useAuth();
  const [chartDays, setChartDays] = useState(7);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const [stats, setStats] = useState(null);
  const [dietDistribution, setDietDistribution] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [logs, setLogs] = useState([]);

  const fetchDashboardData = useCallback(async (days = chartDays) => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, dietRes, chartRes, actRes, telemetryRes] = await Promise.allSettled([
        dashboardApi.getStats(),
        dashboardApi.getDietDistribution(),
        dashboardApi.getCharts(days),
        dashboardApi.getActivities(),
        aiApi.getTelemetry(10),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      } else if (statsRes.status === 'rejected') {
        setError(statsRes.reason?.message || 'Không thể tải số liệu tổng quan từ Backend.');
      }

      if (dietRes.status === 'fulfilled') setDietDistribution(dietRes.value || []);
      if (chartRes.status === 'fulfilled') setChartData(chartRes.value || []);
      if (actRes.status === 'fulfilled') setActivities(actRes.value || []);
      if (telemetryRes.status === 'fulfilled') setLogs(telemetryRes.value || []);

      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Lỗi kết nối máy chủ khi tải Dashboard.');
    } finally {
      setLoading(false);
    }
  }, [chartDays]);

  useEffect(() => {
    fetchDashboardData(chartDays);
  }, [chartDays, fetchDashboardData]);

  const handleExport = (type) => {
    setIsExportOpen(false);
    if (!stats) return;

    const summaryMetrics = [
      { label: 'Tổng người dùng (Users)', value: stats.totalUsers ?? 0 },
      { label: 'Tổng điều phối viên (Mod)', value: stats.totalMods ?? 0 },
      { label: 'Tổng công thức món chay', value: stats.totalRecipes ?? 0 },
      { label: 'Danh mục dinh dưỡng', value: stats.totalCategories ?? 0 },
      { label: 'Thư viện nguyên liệu', value: stats.totalIngredients ?? 0 },
      { label: 'Nội dung chờ duyệt', value: stats.pendingModeration ?? 0 },
      { label: 'Phản hồi chưa xử lý', value: stats.openFeedbacks ?? 0 },
      { label: 'Lượt truy vấn AI', value: stats.totalAiQueries ?? 0 },
    ];

    if (type === 'csv') {
      exportToCsv(
        'veggieai-dashboard-report',
        [
          { key: 'label', label: 'Chỉ số thống kê' },
          { key: 'value', label: 'Giá trị thực tế (PostgreSQL)' },
        ],
        summaryMetrics
      );
    } else {
      exportToHtmlReport({
        filenamePrefix: 'veggieai-dashboard-report',
        title: isSuperAdmin
          ? 'Báo cáo Tổng quan Quản trị Hệ thống VeggieAI'
          : 'Báo cáo Tổng quan Vận hành VeggieAI',
        subtitle: `Trích xuất dữ liệu thực từ PostgreSQL (${chartDays} ngày gần nhất)`,
        summaryMetrics,
        columns: [
          { key: 'time', label: 'Thời gian' },
          { key: 'type', label: 'Phân loại' },
          { key: 'action', label: 'Hoạt động' },
          { key: 'target', label: 'Đối tượng' },
          { key: 'user', label: 'Người thực hiện' },
          { key: 'status', label: 'Trạng thái' },
        ],
        rows: activities,
      });
    }
  };

  const maxChartVal = Math.max(
    1,
    ...chartData.map((d) => Math.max(d.activeUsers || 0, d.newUsers || 0, d.queries || 0, d.recipes || 0))
  );

  const formattedUpdatedTime = lastUpdated
    ? lastUpdated.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Đang đồng bộ...';

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-secondary text-xs uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Dữ liệu trực tiếp PostgreSQL • {isSuperAdmin ? 'SuperAdmin' : 'Mod'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {isSuperAdmin ? 'Tổng quan Quản trị Hệ thống' : 'Tổng quan Vận hành Nội dung & Dinh dưỡng'}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Đồng bộ lần cuối: {formattedUpdatedTime}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="inline-flex p-1 rounded-xl bg-surface-container shadow-xs">
            {[
              { days: 7, label: '7 ngày qua' },
              { days: 14, label: '14 ngày qua' },
              { days: 30, label: '30 ngày qua' },
            ].map((p) => (
              <button
                key={p.days}
                onClick={() => setChartDays(p.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartDays === p.days
                    ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchDashboardData(chartDays)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer"
            title="Làm mới số liệu"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          <div className="relative inline-block text-left">
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
              onClick={() => setIsExportOpen(!isExportOpen)}
              disabled={!stats}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Xuất báo cáo thật</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest shadow-xl border border-surface-container-high z-30 p-1 flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleExport('html')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-error">description</span>
                  <span>Báo cáo tổng hợp (.html / In PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">table_view</span>
                  <span>Bảng số liệu (.csv mở bằng Excel)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchDashboardData(chartDays)}
            className="px-3 py-1 rounded-lg bg-error text-on-error font-bold cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 p-6 animate-pulse flex flex-col justify-between"
            >
              <div className="w-28 h-3 bg-surface-container-high rounded"></div>
              <div className="w-16 h-7 bg-surface-container-high rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        /* 4 Primary Stat Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {isSuperAdmin ? (
            <>
              <div
                onClick={() => onNavigate('user-management')}
                className="rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Tổng Tài khoản
                    </span>
                    <p className="text-2xl sm:text-3xl text-on-surface font-bold mt-1 font-mono">
                      {(stats?.totalUsers ?? 0).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">group</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-outline">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono font-bold">
                    {stats?.totalMods ?? 0} Mod
                  </span>
                  <span>Tăng trưởng 30 ngày: {stats?.userGrowth ?? 0}%</span>
                </div>
              </div>

              <div
                onClick={() => onNavigate('role-management')}
                className="rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Vai trò Hệ thống
                    </span>
                    <p className="text-2xl sm:text-3xl text-on-surface font-bold mt-1 font-mono">
                      {stats?.totalRoles ?? 0}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-outline">
                  Chuẩn hóa SuperAdmin, Mod & User
                </div>
              </div>

              <div
                onClick={() => onNavigate('ai-model-monitoring')}
                className="rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Lượt Truy vấn AI
                    </span>
                    <p className="text-2xl sm:text-3xl text-on-surface font-bold mt-1 font-mono">
                      {(stats?.totalAiQueries ?? 0).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[24px]">neurology</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-outline">
                  Độ chính xác TB mô hình: <b className="text-primary">{stats?.aiAccuracy || '0%'}</b>
                </div>
              </div>

              <div
                onClick={() => onNavigate('system-logs')}
                className="rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Lỗi Hệ thống Ghi nhận
                    </span>
                    <p className="text-2xl sm:text-3xl text-error font-bold mt-1 font-mono">
                      {stats?.systemErrorsCount ?? 0}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-error-container/50 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-outline">
                  Chờ duyệt giám sát: <b>{stats?.pendingModeration ?? 0}</b> mục
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                onClick={() => onNavigate('recipe-management')}
                className="rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Công thức Món chay
                    </span>
                    <p className="text-2xl sm:text-3xl text-on-surface font-bold mt-1 font-mono">
                      {(stats?.totalRecipes ?? 0).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">menu_book</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-outline">
                  Bài viết cộng đồng: <b>{stats?.totalBlogs ?? 0}</b> • Video: <b>{stats?.totalVideos ?? 0}</b>
                </div>
              </div>

              <div
                onClick={() => onNavigate('category-management')}
                className="rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Danh mục & Nguyên liệu
                    </span>
                    <p className="text-2xl sm:text-3xl text-on-surface font-bold mt-1 font-mono">
                      {stats?.totalCategories ?? 0} / {stats?.totalIngredients ?? 0}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[24px]">science</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-outline">
                  Danh mục phân loại / Nguyên liệu chuẩn hóa
                </div>
              </div>

              <div
                onClick={() => onNavigate('content-moderation')}
                className="rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between hover:shadow-md cursor-pointer ring-1 ring-error/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Nội dung Chờ duyệt
                    </span>
                    <p className="text-2xl sm:text-3xl text-error font-bold mt-1 font-mono">
                      {stats?.pendingModeration ?? 0}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-error-container/50 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined text-[24px]">fact_check</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-outline">
                  Nhãn sản phẩm chờ thẩm định: <b>{stats?.pendingProductScans ?? 0}</b>
                </div>
              </div>

              <div
                onClick={() => onNavigate('feedback-management')}
                className="rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                      Phản hồi & Thử thách
                    </span>
                    <p className="text-2xl sm:text-3xl text-on-surface font-bold mt-1 font-mono">
                      {stats?.openFeedbacks ?? 0} / {stats?.activeChallenges ?? 0}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[24px]">rate_review</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-outline">
                  Báo cáo mở / Thử thách đang diễn ra
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Row 2: Dynamic Bar Chart + Diet Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        <div className="xl:col-span-8 rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-surface-container-low/80">
            <div>
              <h2 className="text-lg font-bold text-on-surface">
                Biểu đồ Hoạt động & Đăng ký mới ({chartDays} ngày)
              </h2>
              <p className="text-xs text-on-surface-variant">
                Tổng hợp trực tiếp từ bảng Users, Recipes và AiModelLogs theo từng ngày
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-primary">
                <span className="w-2.5 h-2.5 rounded-xs bg-primary"></span>
                Người dùng mới
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-tertiary">
                <span className="w-2.5 h-2.5 rounded-xs bg-tertiary"></span>
                Lượt hoạt động
              </span>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="py-16 text-center text-xs text-outline">
              Chưa có dữ liệu chuỗi thời gian trong khoảng {chartDays} ngày qua.
            </div>
          ) : (
            <div className="pt-6">
              <div className="h-56 flex items-end justify-between gap-1.5 sm:gap-2 px-1 border-b border-surface-container-high/60 pb-2 overflow-x-auto">
                {chartData.map((d, idx) => {
                  const activeH = Math.max(4, Math.round(((d.activeUsers || 0) / maxChartVal) * 180));
                  const newH = Math.max(4, Math.round(((d.newUsers || 0) / maxChartVal) * 180));
                  return (
                    <div
                      key={`${d.date || d.day}-${idx}`}
                      className="flex-1 min-w-[28px] flex flex-col items-center gap-1.5 group relative"
                      title={`${d.day} (${d.date || ''}): ${d.newUsers || 0} đăng ký mới, ${d.activeUsers || 0} hoạt động, ${d.recipes || 0} công thức`}
                    >
                      <div className="flex items-end gap-1 h-[185px]">
                        <div
                          className="w-2.5 sm:w-3 rounded-t bg-primary transition-all"
                          style={{ height: `${newH}px` }}
                        ></div>
                        <div
                          className="w-2.5 sm:w-3 rounded-t bg-tertiary/70 transition-all"
                          style={{ height: `${activeH}px` }}
                        ></div>
                      </div>
                      <span
                        className={`text-[10px] truncate max-w-[48px] ${
                          d.isPeak ? 'font-bold text-primary' : 'text-outline'
                        }`}
                      >
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Diet Distribution */}
        <div className="xl:col-span-4 rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
          <div className="border-b border-surface-container-low/80 pb-3">
            <h2 className="text-lg font-bold text-on-surface">Cơ cấu Chế độ Ăn chay</h2>
            <p className="text-xs text-on-surface-variant">
              Phân bố từ hồ sơ sức khỏe của {(stats?.totalUsers ?? 0).toLocaleString('vi-VN')} tài khoản
            </p>
          </div>

          {dietDistribution.length === 0 ? (
            <div className="py-12 text-center text-xs text-outline">
              Chưa có dữ liệu hồ sơ chế độ ăn trong cơ sở dữ liệu.
            </div>
          ) : (
            <div className="my-4 space-y-3">
              {dietDistribution.map((item) => {
                const pct = Number(item.percent || 0);
                return (
                  <div key={item.type || item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color || '#006948' }}
                        ></span>
                        <span className="font-semibold text-on-surface">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-on-surface">
                        {item.count ?? 0} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(0, pct))}%`,
                          backgroundColor: item.color || '#006948',
                        }}
                      ></div>
                    </div>
                    {item.subtext && <p className="text-[11px] text-outline">{item.subtext}</p>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-surface-container-low/80 text-[11px] text-outline">
            Nguồn dữ liệu: Bảng HealthProfiles & Users (PostgreSQL)
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activities + AI Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-8 rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-low/80">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-on-surface">Hoạt động Hệ thống Mới nhất</h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-mono text-xs font-semibold">
                {activities.length} sự kiện
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(isSuperAdmin ? 'system-logs' : 'content-moderation')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>{isSuperAdmin ? 'Mở System Logs' : 'Mở hàng đợi duyệt'}</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="py-12 text-center text-xs text-outline">
              Chưa có sự kiện hoạt động nào được ghi nhận.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/60 text-outline text-xs uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Phân loại</th>
                    <th className="py-2.5 px-3">Nội dung</th>
                    <th className="py-2.5 px-3">Thực hiện bởi</th>
                    <th className="py-2.5 px-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30">
                  {activities.map((act) => (
                    <tr
                      key={act.id}
                      onClick={() => setSelectedActivity(act)}
                      className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-mono text-xs text-on-surface-variant whitespace-nowrap">
                        {act.time}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            act.typeBgClass || 'bg-primary-fixed'
                          } ${act.typeTextClass || 'text-on-primary-fixed-variant'}`}
                        >
                          {act.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-surface line-clamp-1">
                            {act.action}
                          </span>
                          <span className="text-[11px] text-outline line-clamp-1">
                            {act.target || act.details}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-on-surface-variant font-medium">
                        {act.user}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            act.statusBgClass || 'bg-secondary-container'
                          } ${act.statusTextClass || 'text-on-secondary-container'}`}
                        >
                          {act.status || 'Hoàn tất'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 rounded-xl bg-inverse-surface text-inverse-on-surface p-5 lg:p-6 shadow-md flex flex-col justify-between border border-white/5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
                  terminal
                </span>
                <span className="text-xs uppercase tracking-widest font-mono font-bold text-secondary-fixed">
                  AI TELEMETRY LOGS
                </span>
              </div>
              <span className="text-[11px] font-mono text-surface-dim">{logs.length} dòng</span>
            </div>
            <p className="text-xs text-surface-dim mt-1">
              Nhật ký thực thi AI từ bảng AiModelLogs.
            </p>
          </div>

          <div className="my-4 p-3.5 rounded-xl bg-black/40 font-mono text-xs flex flex-col gap-2 border border-white/5 min-h-[160px] max-h-[220px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="my-auto text-center text-outline-variant text-[11px]">
                Chưa có truy vấn AI nào được ghi nhận.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="text-surface-bright/90 text-[11px] leading-tight flex items-baseline gap-1.5"
                >
                  <span className="text-outline-variant font-mono">[{log.timestamp}]</span>
                  <span className="text-secondary-fixed-dim font-bold">{log.tag}:</span>
                  <span className="truncate">{log.message}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-xs text-surface-dim font-mono">
              Độ chính xác TB: {stats?.aiAccuracy || '0%'}
            </span>
            <button
              onClick={onOpenAgentModal}
              className="px-3.5 py-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed text-xs font-bold hover:opacity-90 cursor-pointer"
              type="button"
            >
              Mở AI Engine
            </button>
          </div>
        </div>
      </div>

      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-3">
              <span className="text-xs font-bold text-primary">{selectedActivity.type}</span>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface">{selectedActivity.action}</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {selectedActivity.target} {selectedActivity.details ? `• ${selectedActivity.details}` : ''}
              </p>
            </div>
            <div className="text-xs text-outline font-mono">
              Thực hiện bởi: {selectedActivity.user} • Lúc: {selectedActivity.time}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
