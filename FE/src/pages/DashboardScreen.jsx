import React, { useState, useEffect } from 'react';
import { dashboardApi, aiApi } from '../api';

export const DashboardScreen = ({
  onNavigate,
  onOpenAgentModal,
  pendingCount = 14,
  userRole = 'admin',
}) => {
  const [timeFilter, setTimeFilter] = useState('7days');
  const [chartPeriod, setChartPeriod] = useState('7days');
  const [accountFilter, setAccountFilter] = useState('Tất cả tài khoản');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Real Database state
  const [stats, setStats] = useState({
    totalUsers: 0,
    userGrowth: 14.2,
    totalBlogs: 0,
    blogGrowth: 8.5,
    totalVideos: 0,
    videoGrowth: 19.1,
    pendingModeration: 0,
    cluster: 'Cụm HCM-01',
    ramUsage: '340GB / 500GB',
    ramPercent: 68,
    gpuLoad: '34.2% ổn định',
    aiAccuracy: '94.6%',
  });
  const [dietDistribution, setDietDistribution] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        const [statsData, dietData, chartList, actList, telemetryList] = await Promise.allSettled([
          dashboardApi.getStats(),
          dashboardApi.getDietDistribution(),
          dashboardApi.getCharts(),
          dashboardApi.getActivities(),
          aiApi.getTelemetry(),
        ]);

        if (statsData.status === 'fulfilled' && statsData.value) {
          setStats(statsData.value);
        }
        if (dietData.status === 'fulfilled' && dietData.value) {
          setDietDistribution(dietData.value);
        }
        if (chartList.status === 'fulfilled' && chartList.value) {
          setChartData(chartList.value);
        }
        if (actList.status === 'fulfilled' && actList.value) {
          setActivities(actList.value);
        }
        if (telemetryList.status === 'fulfilled' && telemetryList.value) {
          setLogs(telemetryList.value);
        }
      } catch (err) {
        console.warn('Error fetching dashboard live data:', err);
      }
    };

    fetchAllDashboardData();
  }, []);

  const handleExport = (type) => {
    setIsExportOpen(false);
    const msg =
      type === 'pdf'
        ? 'Đã tải xuống file: Bao_cao_tong_quan_VeggieAI_2025.pdf'
        : 'Đã tải xuống file: Bang_so_lieu_VeggieAI_2025.xlsx';
    alert(msg);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Title & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-secondary text-xs uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Thời gian thực • Cụm dữ liệu TP.HCM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Tổng quan hệ thống VeggieAI
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Cập nhật lúc 09:42 sáng, Thứ Sáu ngày 24 tháng 10 năm 2025
          </p>
        </div>

        {/* Time filters & Export button */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="inline-flex p-1 rounded-xl bg-surface-container shadow-xs">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === 'today'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeFilter('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === '7days'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setTimeFilter('30days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === '30days'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              30 ngày qua
            </button>
            <button
              onClick={() => {
                setTimeFilter('custom');
                alert('Chọn khoảng thời gian tùy chỉnh.');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                timeFilter === 'custom'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span>Tuỳ chỉnh</span>
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative inline-block text-left">
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold shadow-xs hover:bg-primary-container transition-colors cursor-pointer"
              onClick={() => setIsExportOpen(!isExportOpen)}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Xuất báo cáo</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-surface-container-lowest shadow-xl border border-surface-container-high z-30 p-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-error">
                    picture_as_pdf
                  </span>
                  <span>Báo cáo định dạng PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('xlsx')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    table_view
                  </span>
                  <span>Bảng số liệu Excel (.xlsx)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {userRole === 'admin' ? (
          <>
            {/* Admin Card 1: Tổng số User */}
            <div
              onClick={() => onNavigate('user-management')}
              className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                    Tổng số User
                  </span>
                  <span className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
                    {(stats.totalUsers || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary-container/40 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">group</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-1">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold font-mono">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  {stats.userGrowth}%
                </span>
                <span className="text-xs text-outline font-medium">so với tháng trước</span>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5 pointer-events-none"></div>
            </div>

            {/* Admin Card 2: Phân quyền Hệ thống */}
            <div
              onClick={() => onNavigate('role-management')}
              className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                    Nhóm Quyền & Vai trò
                  </span>
                  <span className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
                    4
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">admin_panel_settings</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-1">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold font-mono">
                  Đã cấu hình
                </span>
                <span className="text-xs text-outline font-medium">bảo mật truy cập</span>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-secondary-container/10 pointer-events-none"></div>
            </div>

            {/* Admin Card 3: Truy vấn AI */}
            <div
              onClick={() => onNavigate('ai-model-monitoring')}
              className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                    Lượt Truy vấn AI
                  </span>
                  <span className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
                    124.5K
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">neurology</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-1">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold font-mono">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  18.2%
                </span>
                <span className="text-xs text-outline font-medium">so với tuần trước</span>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-tertiary/5 pointer-events-none"></div>
            </div>

            {/* Admin Card 4: Log Hệ thống */}
            <div
              onClick={() => onNavigate('ai-model-monitoring')}
              className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group ring-1 ring-error/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                    Lỗi Hệ Thống
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight font-mono text-error">
                      0
                    </span>
                    <span className="text-xs text-outline font-medium">Critical</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">report</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                  Server HCM-01 Healthy
                </span>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-error-container/20 pointer-events-none"></div>
            </div>
          </>
        ) : (
          <>
            {/* Mod Card 1: Tổng bài Blog */}
            <div
              onClick={() => onNavigate('recipe-management')}
              className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                    Công thức Món Chay
                  </span>
                  <span className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
                    {(stats.totalBlogs || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">menu_book</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-1">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold font-mono">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  {stats.blogGrowth}%
                </span>
                <span className="text-xs text-outline font-medium">tuần này</span>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5 pointer-events-none"></div>
            </div>

            {/* Mod Card 2: Video Hướng dẫn */}
            <div
              onClick={() => onNavigate('recipe-management')}
              className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                    Video Hướng Dẫn
                  </span>
                  <span className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
                    {(stats.totalVideos || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">smart_display</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-1">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold font-mono">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  {stats.videoGrowth}%
                </span>
                <span className="text-xs text-outline font-medium">tuần này</span>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-secondary-container/10 pointer-events-none"></div>
            </div>

            {/* Mod Card 3: Nguồn Dinh dưỡng */}
            <div
              onClick={() => onNavigate('category-management')}
              className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                    Nguồn Dinh Dưỡng
                  </span>
                  <span className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
                    24
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">category</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-1">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold font-mono">
                  Đã cấu hình
                </span>
                <span className="text-xs text-outline font-medium">chuẩn calo AI</span>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-tertiary/5 pointer-events-none"></div>
            </div>

            {/* Mod Card 4: Nội dung chờ duyệt */}
            <div
              onClick={() => onNavigate('content-moderation')}
              className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group ring-1 ring-error/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                    Nội dung chờ duyệt
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl text-on-surface font-bold tracking-tight font-mono text-error">
                      {pendingCount}
                    </span>
                    <span className="text-xs text-outline font-medium">mục tồn đọng</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">local_hospital</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                  Cần đánh giá dinh dưỡng
                </span>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-error-container/20 pointer-events-none"></div>
            </div>
          </>
        )}
      </div>

      {/* Row 2: Charts (Growth Chart + Donut Chart) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        {/* Left: Tăng trưởng Người dùng Mới & Hoạt động */}
        <div className="xl:col-span-8 rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-space-sm border-b border-surface-container-low/80">
            <div>
              <h2 className="text-lg sm:text-xl text-on-surface font-bold">
                Tăng trưởng Người dùng Mới & Hoạt động
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Lưu lượng truy cập, đăng ký mới và lượng active theo ngày
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 rounded-lg bg-surface-container-low">
                <button
                  type="button"
                  onClick={() => setChartPeriod('7days')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    chartPeriod === '7days'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  7 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setChartPeriod('30days')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    chartPeriod === '30days'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  30 ngày
                </button>
              </div>

              <select
                aria-label="Lọc loại tài khoản"
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="h-[34px] px-2.5 rounded-lg bg-surface-container-low text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high/50 cursor-pointer"
              >
                <option>Tất cả tài khoản</option>
                <option>Thành viên VIP AI Chef</option>
                <option>Người tạo nội dung</option>
              </select>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="relative w-full h-72 sm:h-80 flex flex-col justify-end pt-4">
            {/* Grid background lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {[1200, 900, 600, 300, 0].map((val) => (
                <div
                  key={val}
                  className="w-full flex items-center justify-between text-outline text-[11px] font-mono"
                >
                  <span className="w-10 text-right">{val.toLocaleString()}</span>
                  <div className="w-full h-[1px] bg-surface-container-high ml-2 opacity-60"></div>
                </div>
              ))}
            </div>

            {/* SVG Chart with bars and smooth curve */}
            <svg
              className="w-full h-[220px] overflow-visible relative z-10"
              preserveAspectRatio="none"
              viewBox="0 0 700 240"
            >
              <defs>
                <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#006948" stopOpacity="0.32"></stop>
                  <stop offset="100%" stopColor="#006948" stopOpacity="0.0"></stop>
                </linearGradient>
                <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6063ee" stopOpacity="0.45"></stop>
                  <stop offset="100%" stopColor="#6063ee" stopOpacity="0.1"></stop>
                </linearGradient>
              </defs>

              {/* Bars representing active users */}
              <rect fill="url(#barGrad)" height="110" rx="4" width="16" x="42" y="110" />
              <rect fill="url(#barGrad)" height="130" rx="4" width="16" x="137" y="90" />
              <rect fill="url(#barGrad)" height="150" rx="4" width="16" x="232" y="70" />
              <rect fill="url(#barGrad)" height="165" rx="4" width="16" x="327" y="55" />
              <rect fill="url(#barGrad)" height="180" rx="4" width="16" x="422" y="40" />
              <rect fill="url(#barGrad)" height="200" rx="4" width="16" x="517" y="20" />
              <rect fill="url(#barGrad)" height="188" rx="4" width="16" x="612" y="32" />

              {/* Area and Line for new user registrations */}
              <path
                d="M 50 140 Q 145 110 240 85 T 430 45 T 525 25 T 620 40 L 620 220 L 50 220 Z"
                fill="url(#primaryAreaGrad)"
              ></path>
              <path
                d="M 50 140 Q 145 110 240 85 T 430 45 T 525 25 T 620 40"
                fill="none"
                stroke="#006948"
                strokeLinecap="round"
                strokeWidth="3"
              ></path>

              {/* Interactive Circles with hover feedback */}
              <circle
                cx="50"
                cy="140"
                fill="#faf8ff"
                r="4.5"
                stroke="#006948"
                strokeWidth="2.5"
                className="cursor-pointer hover:scale-150 transition-transform"
                onMouseEnter={() => setHoveredDay('Thứ 2: 340 mới, 480 active')}
                onMouseLeave={() => setHoveredDay(null)}
              />
              <circle
                cx="145"
                cy="115"
                fill="#faf8ff"
                r="4.5"
                stroke="#006948"
                strokeWidth="2.5"
                className="cursor-pointer hover:scale-150 transition-transform"
                onMouseEnter={() => setHoveredDay('Thứ 3: 490 mới, 620 active')}
                onMouseLeave={() => setHoveredDay(null)}
              />
              <circle
                cx="240"
                cy="85"
                fill="#faf8ff"
                r="4.5"
                stroke="#006948"
                strokeWidth="2.5"
                className="cursor-pointer hover:scale-150 transition-transform"
                onMouseEnter={() => setHoveredDay('Thứ 4: 610 mới, 740 active')}
                onMouseLeave={() => setHoveredDay(null)}
              />
              <circle
                cx="335"
                cy="68"
                fill="#faf8ff"
                r="4.5"
                stroke="#006948"
                strokeWidth="2.5"
                className="cursor-pointer hover:scale-150 transition-transform"
                onMouseEnter={() => setHoveredDay('Thứ 5: 680 mới, 810 active')}
                onMouseLeave={() => setHoveredDay(null)}
              />
              <circle
                cx="430"
                cy="45"
                fill="#faf8ff"
                r="4.5"
                stroke="#006948"
                strokeWidth="2.5"
                className="cursor-pointer hover:scale-150 transition-transform"
                onMouseEnter={() => setHoveredDay('Thứ 6: 790 mới, 900 active')}
                onMouseLeave={() => setHoveredDay(null)}
              />
              {/* Peak Marker: Saturday */}
              <circle
                cx="525"
                cy="25"
                fill="#006948"
                r="6"
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer animate-pulse"
                onMouseEnter={() => setHoveredDay('Thứ 7 (ĐỈNH): +1,084 mới, 1,200 active')}
                onMouseLeave={() => setHoveredDay(null)}
              />
              <circle
                cx="620"
                cy="40"
                fill="#faf8ff"
                r="4.5"
                stroke="#006948"
                strokeWidth="2.5"
                className="cursor-pointer hover:scale-150 transition-transform"
                onMouseEnter={() => setHoveredDay('Chủ nhật: 860 mới, 980 active')}
                onMouseLeave={() => setHoveredDay(null)}
              />
            </svg>

            {/* X-axis labels */}
            <div className="relative z-20 flex justify-between px-6 pt-2 text-on-surface-variant text-xs">
              {(chartData.length > 0 ? chartData : [
                { day: 'Thứ 2', newUsers: 340, activeUsers: 480, isPeak: false },
                { day: 'Thứ 3', newUsers: 490, activeUsers: 620, isPeak: false },
                { day: 'Thứ 4', newUsers: 610, activeUsers: 740, isPeak: false },
                { day: 'Thứ 5', newUsers: 680, activeUsers: 810, isPeak: false },
                { day: 'Thứ 6', newUsers: 790, activeUsers: 900, isPeak: false },
                { day: 'Thứ 7 (Đỉnh)', newUsers: 940, activeUsers: 1084, isPeak: true },
                { day: 'Chủ nhật', newUsers: 860, activeUsers: 980, isPeak: false }
              ]).map((d) => (
                <span
                  key={d.day}
                  className={d.isPeak ? 'font-bold text-primary' : 'font-medium'}
                >
                  {d.day}
                </span>
              ))}
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredDay && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-3 py-1 rounded-lg text-xs font-mono shadow-md z-30 pointer-events-none">
                {hoveredDay}
              </div>
            )}
          </div>

          {/* Chart footer stats & insights */}
          <div className="flex flex-wrap items-center justify-between pt-space-md mt-space-sm bg-surface-container-low/50 rounded-xl p-3 border border-surface-container-high/30">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-xs text-on-surface font-semibold">
                  Đăng ký mới (+1,084 người)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-tertiary-container/40"></span>
                <span className="text-xs text-on-surface-variant font-medium">
                  Lượt hoạt động (Active users)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
              <span>Hiệu suất AI đề xuất: {stats.aiAccuracy || '94.6%'} chính xác</span>
            </div>
          </div>
        </div>

        {/* Right: Cơ cấu Ăn chay Donut Chart */}
        <div className="xl:col-span-4 rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-surface-container-low/80 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl text-on-surface font-bold">Cơ cấu Ăn chay</h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Phân bố sở thích của {stats.totalUsers ? stats.totalUsers.toLocaleString('vi-VN') : '0'} thành viên
              </p>
            </div>
            <button
              aria-label="Xem chi tiết phân bố"
              onClick={() =>
                alert('Tỉ lệ ăn chay được cập nhật theo hồ sơ khẩu vị tự kê khai từ cơ sở dữ liệu PostgreSQL.')
              }
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">info</span>
            </button>
          </div>

          {/* Donut Chart SVG */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                fill="none"
                r="62"
                stroke="#eaedff"
                strokeWidth="18"
              ></circle>
              {/* Vegan segment */}
              <circle
                className="transition-all duration-700 cursor-pointer hover:opacity-90"
                cx="80"
                cy="80"
                fill="none"
                r="62"
                stroke="#006948"
                strokeDasharray="389.5"
                strokeDashoffset="214.2"
                strokeLinecap="round"
                strokeWidth="18"
              ></circle>
              {/* Ovo-lacto segment */}
              <circle
                className="transition-all duration-700 cursor-pointer hover:opacity-90"
                cx="80"
                cy="80"
                fill="none"
                r="62"
                stroke="#4edea3"
                strokeDasharray="389.5"
                strokeDashoffset="264.8"
                strokeLinecap="round"
                strokeWidth="18"
                style={{
                  transformOrigin: '80px 80px',
                  transform: 'rotate(162deg)',
                }}
              ></circle>
              {/* Flexitarian segment */}
              <circle
                className="transition-all duration-700 cursor-pointer hover:opacity-90"
                cx="80"
                cy="80"
                fill="none"
                r="62"
                stroke="#6063ee"
                strokeDasharray="389.5"
                strokeDashoffset="299.9"
                strokeLinecap="round"
                strokeWidth="18"
                style={{
                  transformOrigin: '80px 80px',
                  transform: 'rotate(277deg)',
                }}
              ></circle>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-on-surface leading-tight">
                {dietDistribution[0]?.percent ? `${dietDistribution[0].percent}%` : '50%'}
              </span>
              <span className="text-xs text-outline uppercase font-bold tracking-wider">
                {dietDistribution[0]?.type || 'Vegan'}
              </span>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="flex flex-col gap-1">
            {dietDistribution.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">{item.name}</span>
                    <span className="text-[11px] text-outline">{item.subtext}</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-on-surface">
                  {typeof item.percent === 'number' ? item.percent.toFixed(1) : item.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Hoạt động mới nhất + AI Agent Telemetry Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Hoạt động mới nhất */}
        <div className="lg:col-span-8 rounded-xl bg-surface-container-lowest p-5 lg:p-6 shadow-xs border border-surface-container-high/40 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-low/80">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl text-on-surface font-bold">
                Hoạt động mới nhất
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-mono text-xs font-semibold">
                5 sự kiện gần đây
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('content-moderation')}
              className="text-xs font-semibold text-primary hover:text-primary-container flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>Xem tất cả nhật ký</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/60 text-outline text-xs uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3 rounded-l-lg">Thời gian</th>
                  <th className="py-2.5 px-3">Loại hoạt động</th>
                  <th className="py-2.5 px-3">Nội dung / Chi tiết</th>
                  <th className="py-2.5 px-3">Tác nhân</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {(activities.length > 0 ? activities : []).map((act) => (
                  <tr
                    key={act.id}
                    onClick={() => setSelectedActivity(act)}
                    className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono text-xs text-on-surface-variant font-medium">
                      {act.time}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${act.typeBgClass || 'bg-primary-fixed'} ${act.typeTextClass || 'text-on-primary-fixed-variant'}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {act.typeIcon || 'event_note'}
                        </span>
                        {act.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-on-surface line-clamp-1">
                          {act.action || act.title}
                        </span>
                        <span className="text-[11px] text-outline">{act.target || act.details || act.subtitle}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-on-surface-variant font-medium">
                      {act.user || act.actor}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${act.statusBgClass || 'bg-secondary-container'} ${act.statusTextClass || 'text-on-secondary-container'}`}
                      >
                        {act.status || 'Hoàn tất'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: AI AGENT TELEMETRY Console */}
        <div className="lg:col-span-4 rounded-xl bg-inverse-surface text-inverse-on-surface p-5 lg:p-6 shadow-md flex flex-col justify-between border border-white/5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
                  terminal
                </span>
                <span className="text-xs uppercase tracking-widest font-mono font-bold text-secondary-fixed">
                  AI AGENT TELEMETRY
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
            </div>
            <p className="text-xs text-surface-dim">
              Nhật ký xử lý ngôn ngữ tự nhiên và tính toán khẩu phần theo thời gian thực.
            </p>
          </div>

          {/* Terminal Console Box */}
          <div className="my-4 p-3.5 rounded-xl bg-black/40 font-mono text-xs flex flex-col gap-2 border border-white/5 shadow-inner min-h-[160px] justify-center">
            <div className="flex items-center justify-between text-outline-variant text-[11px] pb-1 border-b border-white/10">
              <span>&gt; inference.batch_run</span>
              <span className="text-secondary-fixed">OK (21ms)</span>
            </div>

            {logs.map((log) => (
              <div key={log.id} className="text-surface-bright/90 text-[11px] leading-tight flex items-baseline gap-1.5">
                <span className="text-outline-variant font-mono">[{log.timestamp}]</span>
                <span
                  className={
                    log.type === 'success'
                      ? 'text-secondary-fixed-dim font-bold'
                      : log.type === 'accent'
                      ? 'text-tertiary-fixed-dim font-bold'
                      : log.type === 'info'
                      ? 'text-primary-fixed font-bold'
                      : 'text-outline-variant'
                  }
                >
                  {log.tag}:
                </span>
                <span className="truncate">{log.message}</span>
              </div>
            ))}
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-xs text-surface-dim font-medium">Tải mô hình (GPU Engine)</span>
              <span className="text-xs font-bold text-inverse-on-surface font-mono">
                {stats.gpuLoad || '34.2% ổn định'}
              </span>
            </div>
            <button
              onClick={onOpenAgentModal}
              className="px-3.5 py-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed text-xs font-bold hover:bg-secondary-container transition-colors cursor-pointer"
              type="button"
            >
              Quản lý Agent
            </button>
          </div>
        </div>
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold ${selectedActivity.typeBgClass || 'bg-primary-fixed'} ${selectedActivity.typeTextClass || 'text-on-primary-fixed-variant'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {selectedActivity.typeIcon || 'event_note'}
                  </span>
                  {selectedActivity.type}
                </span>
                <span className="text-xs text-outline font-mono">{selectedActivity.time}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div>
              <h3 className="font-bold text-base text-on-surface">{selectedActivity.action || selectedActivity.title}</h3>
              <p className="text-xs text-on-surface-variant mt-1">{selectedActivity.target || selectedActivity.details || selectedActivity.subtitle}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/40 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-outline">Tác nhân thực hiện:</span>
                <span className="font-semibold text-on-surface">{selectedActivity.user || selectedActivity.actor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Trạng thái hiện thời:</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${selectedActivity.statusBgClass} ${selectedActivity.statusTextClass}`}
                >
                  {selectedActivity.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Cơ sở dữ liệu áp dụng:</span>
                <span className="font-mono text-primary font-semibold">USDA-2025-V2</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {selectedActivity.status === 'Chờ duyệt' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedActivity(null);
                    onNavigate('content-moderation');
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container"
                >
                  Mở kiểm duyệt chi tiết
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs hover:bg-surface-container"
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
