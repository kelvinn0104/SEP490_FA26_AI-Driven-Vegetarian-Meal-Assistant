import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { exportToCsv } from '../utils/exportUtils';
import {
  SuperAdminReadOnlyBanner,
  ApiErrorBanner,
} from '../components/ui/OperationalHelpers';

export const NutritionAnalyticsScreen = ({ readOnly = false }) => {
  const { isSuperAdmin } = useAuth();
  const isReadOnly = readOnly || isSuperAdmin;

  const [periodDays, setPeriodDays] = useState(30);
  const [averagingMode, setAveragingMode] = useState('per_logged_day');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNutrientTab, setSelectedNutrientTab] = useState('all');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await analyticsApi.getOverview({ periodDays, averagingMode });
      setOverview(data);
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo phân tích dinh dưỡng từ cơ sở dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [periodDays, averagingMode]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const filteredDeficits = overview?.micronutrientDeficits
    ? overview.micronutrientDeficits.filter((item) => {
      if (selectedNutrientTab === 'all') return true;
      return item.severity === selectedNutrientTab;
    })
    : [];

  const carbCal = Number(overview?.avgDailyCarb ?? 0) * 4;
  const protCal = Number(overview?.avgDailyProtein ?? 0) * 4;
  const fatCal = Number(overview?.avgDailyFat ?? 0) * 9;
  const totalMacroCal = carbCal + protCal + fatCal;
  const carbPct = totalMacroCal > 0 ? Math.round((carbCal / totalMacroCal) * 100) : 0;
  const protPct = totalMacroCal > 0 ? Math.round((protCal / totalMacroCal) * 100) : 0;
  const fatPct = totalMacroCal > 0 ? Math.max(0, 100 - carbPct - protPct) : 0;

  const weeklyMaxCalories = Math.max(
    1,
    ...(overview?.weeklyIntakeTrends || [])
      .filter((d) => d.hasData && d.calories !== null && d.calories !== undefined)
      .map((d) => d.calories)
  );

  const severityBadgeClass = (severity) => {
    if (severity === 'high') return 'bg-error-container text-on-error-container';
    if (severity === 'medium') return 'bg-amber-500/15 text-amber-700';
    if (severity === 'low') return 'bg-emerald-500/15 text-emerald-700';
    return 'bg-surface-container-high text-on-surface-variant';
  };

  return (
    <div className="space-y-6">
      <SuperAdminReadOnlyBanner readOnly={isReadOnly} />
      <ApiErrorBanner error={error} onDismiss={() => setError('')} onRetry={fetchAnalytics} />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-linear-to-r from-emerald-950/20 via-teal-900/10 to-transparent p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-1">
            <span className="material-symbols-outlined text-[18px]">insights</span>
            <span>Thống kê Dịch tễ & Dinh dưỡng Thực tế (PostgreSQL)</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Báo Cáo Dịch Tễ & Xu Hướng Dinh Dưỡng Cộng Đồng
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Kỳ thống kê <b>{overview?.periodDays ?? periodDays} ngày</b>
            {overview?.periodStart && overview?.periodEnd
              ? ` (${overview.periodStart} – ${overview.periodEnd})`
              : ''}
            :{' '}
            <strong className="text-on-surface">
              {(overview?.totalMealLogs ?? 0).toLocaleString('vi-VN')}
            </strong>{' '}
            bữa ăn từ <b>{overview?.loggedUserDaysCount ?? 0}</b> ngày-người. Có dữ liệu:{' '}
            <b>{overview?.activeLoggedUsersCount ?? 0}</b>/
            <b>{(overview?.totalUsersTracked ?? 0).toLocaleString('vi-VN')}</b> User hoạt động (
            <b>{overview?.dataCoveragePercent ?? 0}%</b> bao phủ •{' '}
            <b>{overview?.usersWithoutLogCount ?? 0}</b> User chưa ghi nhật ký).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
            className="h-9 px-3 rounded-xl bg-surface-container-lowest border border-surface-container-high text-xs font-bold text-on-surface cursor-pointer"
            aria-label="Kỳ thống kê"
          >
            <option value={7}>Kỳ: 7 ngày qua</option>
            <option value={14}>Kỳ: 14 ngày qua</option>
            <option value={30}>Kỳ: 30 ngày qua</option>
            <option value={90}>Kỳ: 90 ngày qua</option>
          </select>

          <select
            value={averagingMode}
            onChange={(e) => setAveragingMode(e.target.value)}
            className="h-9 px-3 rounded-xl bg-surface-container-lowest border border-surface-container-high text-xs font-bold text-on-surface cursor-pointer"
            aria-label="Cách tính trung bình"
          >
            <option value="per_logged_day">Mẫu số: Theo ngày có ghi nhận log</option>
            <option value="per_active_user_period">Mẫu số: User có log × số ngày kỳ</option>
            <option value="per_all_users_period">Mẫu số: Toàn bộ User hoạt động × số ngày kỳ</option>
          </select>

          {overview?.micronutrientDeficits?.length > 0 && (
            <button
              type="button"
              onClick={() =>
                exportToCsv(
                  'veggieai-nutrition-deficits',
                  [
                    { key: 'nutrientName', label: 'Vi chất' },
                    { key: 'standardRdi', label: 'Chuẩn RDI cá nhân' },
                    { key: 'avgCommunityIntake', label: 'Mức hấp thu TB' },
                    { key: 'usersEvaluated', label: 'User đủ chuẩn đánh giá' },
                    { key: 'deficientUsers', label: 'User thiếu hụt' },
                    { key: 'deficitPercent', label: 'Tỷ lệ thiếu nhóm đủ DL (%)' },
                    { key: 'usersWithoutData', label: 'User chưa có dữ liệu' },
                    { key: 'dataCoveragePercent', label: 'Độ bao phủ dữ liệu (%)' },
                    { key: 'severity', label: 'Mức cảnh báo' },
                  ],
                  overview.micronutrientDeficits
                )
              }
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-primary text-on-primary font-semibold text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Xuất CSV</span>
            </button>
          )}

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Explicit Calculation Methodology & Data Coverage Box */}
      {overview && (
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">
              calculate
            </span>
            <div>
              <span className="font-bold text-on-surface">
                Quy tắc thống kê thống nhất ({overview.averagingModeLabel}):
              </span>{' '}
              <span className="text-on-surface-variant">{overview.calculationNote}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pl-7 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-semibold">
              Tổng User hoạt động: {overview.totalUsersTracked}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 font-semibold">
              Có MealLog: {overview.activeLoggedUsersCount} User ({overview.dataCoveragePercent}%)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 font-semibold">
              Chưa có MealLog: {overview.usersWithoutLogCount} User (dữ liệu trống, không coi là ăn 0)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 font-semibold">
              Fiber đầy đủ: {overview.fiberCompleteUserDays}/{overview.loggedUserDaysCount} ngày-người ({overview.fiberCoveragePercent}%)
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Đang tính toán chỉ số dinh dưỡng từ Database...</span>
        </div>
      ) : !overview ? (
        <div className="py-16 text-center rounded-2xl bg-surface-container-lowest border border-surface-container-high p-8 text-xs text-outline">
          Không có dữ liệu phản hồi từ máy chủ.
        </div>
      ) : (
        <>
          {!overview.hasMealLogData ? (
            <div className="p-8 rounded-2xl bg-surface-container-lowest border border-dashed border-surface-container-high text-center space-y-2">
              <span className="material-symbols-outlined text-[44px] text-outline">monitoring</span>
              <h3 className="text-base font-bold text-on-surface">
                Chưa có nhật ký bữa ăn (MealLogs) trong kỳ {overview.periodDays} ngày qua
              </h3>
              <p className="text-xs text-on-surface-variant max-w-xl mx-auto">
                Toàn bộ {overview.totalUsersTracked} User hoạt động chưa có dữ liệu nhật ký trong kỳ này. Hệ thống giữ trạng thái chưa có dữ liệu (null) thay vì hiển thị 0 kcal giả.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Năng Lượng Trung Bình
                </span>
                <div className="text-2xl font-bold text-on-surface mt-2 font-mono">
                  {overview.avgDailyCalories ?? '—'}{' '}
                  <span className="text-xs font-normal text-on-surface-variant">kcal / ngày</span>
                </div>
                <p className="text-[11px] text-outline mt-1">
                  Mẫu số chung: {overview.calculationDenominator} ngày-người
                </p>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Đạm Thực Vật TB
                </span>
                <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
                  {overview.avgDailyProtein ?? '—'}{' '}
                  <span className="text-xs font-normal text-on-surface-variant">g / ngày</span>
                </div>
                <p className="text-[11px] text-outline mt-1">
                  Cùng mẫu số {overview.calculationDenominator} ngày-người
                </p>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Chất Xơ Thực Tế (Fiber)
                </span>
                {overview.hasFiberData && overview.avgDailyFiber !== null ? (
                  <>
                    <div className="text-2xl font-bold text-teal-600 mt-2 font-mono">
                      {overview.avgDailyFiber}{' '}
                      <span className="text-xs font-normal text-on-surface-variant">g / ngày</span>
                    </div>
                    <p className="text-[11px] text-teal-700 mt-1">
                      {overview.fiberCalculationNote}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold text-amber-700 mt-2">
                      Chưa đủ dữ liệu Fiber đầy đủ
                    </div>
                    <p className="text-[11px] text-outline mt-1">
                      {overview.fiberCalculationNote ||
                        'Không cộng thiếu nguyên liệu thành 0 g và không ước lượng từ Carb.'}
                    </p>
                  </>
                )}
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Tỷ Lệ Đa Lượng Thực Tế
                </span>
                <div className="text-base font-bold text-on-surface mt-2 font-mono">
                  <span className="text-amber-600">{carbPct}% C</span> •{' '}
                  <span className="text-emerald-600">{protPct}% P</span> •{' '}
                  <span className="text-sky-600">{fatPct}% F</span>
                </div>
                <p className="text-[11px] text-outline mt-1">
                  {overview.avgDailyCarb ?? 0}g C • {overview.avgDailyProtein ?? 0}g P •{' '}
                  {overview.avgDailyFat ?? 0}g F
                </p>
              </div>
            </div>
          )}

          {/* Weekly Intake Trends — distinguishes null (missing log) from actual 0 */}
          {overview.weeklyIntakeTrends?.length > 0 && (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-on-surface">
                  Xu Hướng Dinh Dưỡng 7 Ngày Gần Nhất (Weekly Intake Trends)
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {overview.weeklyTrendsNote}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                {overview.weeklyIntakeTrends.map((day, idx) => {
                  const hasDayData = day.hasData && day.calories !== null && day.calories !== undefined;
                  const barPct = hasDayData
                    ? Math.min(100, Math.round((day.calories / weeklyMaxCalories) * 100))
                    : 0;

                  return (
                    <div
                      key={day.date || idx}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 ${
                        hasDayData
                          ? 'bg-surface border-surface-container-high'
                          : 'bg-surface-container-low/50 border-dashed border-surface-container-high/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-on-surface">{day.dayLabel}</span>
                        <span className="text-[10px] font-mono text-outline">
                          {hasDayData ? `${day.loggedUsersCount} User` : 'Trống'}
                        </span>
                      </div>

                      {hasDayData ? (
                        <div className="space-y-1.5">
                          <div className="text-base font-bold font-mono text-primary">
                            {day.calories} <span className="text-[10px] font-normal">kcal</span>
                          </div>
                          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-on-surface-variant font-mono">
                            {day.proteinGrams ?? 0}g đạm •{' '}
                            {day.fiberGrams !== null && day.fiberGrams !== undefined
                              ? `${day.fiberGrams}g xơ`
                              : 'Thiếu DL xơ'}
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-surface-container text-[11px] font-medium text-outline">
                            Chưa có nhật ký
                          </span>
                          <p className="text-[10px] text-outline mt-1">
                            Thiếu dữ liệu (không tính 0 kcal)
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Micronutrient Deficits matched per user by Gender & Age */}
          {overview.micronutrientDeficits?.length > 0 && (
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-on-surface">
                    Đối Chiếu Thiếu Hụt Vi Chất Theo Chuẩn RDI Cá Nhân (Giới Tính & Độ Tuổi)
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Đối chiếu từng User có nhật ký với bảng NutrientStandard theo giới tính và tuổi từ DateOfBirth; tuyệt đối không gộp User chưa ghi nhật ký vào nhóm thiếu chất.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-surface-container-high/60">
                  {['all', 'high', 'medium', 'low', 'unknown'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSelectedNutrientTab(tab)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                        selectedNutrientTab === tab
                          ? 'bg-primary text-on-primary'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredDeficits.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-surface-container-high bg-surface space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-on-surface">{item.nutrientName}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${severityBadgeClass(
                            item.severity
                          )}`}
                        >
                          {item.deficitPercent !== null && item.deficitPercent !== undefined
                            ? `${item.deficitPercent}% thiếu`
                            : 'Chưa đủ chuẩn'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs p-2 rounded-lg bg-surface-container-low">
                        <div>
                          <span className="text-[10px] text-outline block">Chuẩn RDI áp dụng</span>
                          <b className="font-mono text-[11px]">{item.standardRdi}</b>
                        </div>
                        <div>
                          <span className="text-[10px] text-outline block">TB theo mẫu số chọn</span>
                          <b className="font-mono text-[11px] text-primary">
                            {item.avgCommunityIntake}
                          </b>
                        </div>
                      </div>

                      {/* Coverage & Evaluation Metadata */}
                      <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/50 text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-outline">Phạm vi / Tổng User:</span>
                          <b className="font-mono">
                            {item.totalUsersInScope}/{item.totalActiveUsers} User
                          </b>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-outline">Có log / Chưa có log:</span>
                          <b className="font-mono">
                            {item.usersWithData} / {item.totalUsersWithoutData ?? item.usersWithoutData} ({item.dataCoveragePercent}%)
                          </b>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-outline">Thiếu hụt / Đủ chuẩn RDI:</span>
                          <b className="font-mono text-error">
                            {item.deficientUsers}/{item.usersEvaluated} User
                          </b>
                        </div>
                        {item.usersWithoutStandard > 0 && (
                          <div className="text-[10px] text-amber-700 pt-0.5">
                            • {item.usersWithoutStandard} User có log nhưng thiếu HealthProfile/chuẩn RDI phù hợp
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-on-surface-variant">{item.statusText}</p>

                      {item.recommendedSources?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.recommendedSources.map((s, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-outline border-t border-surface-container-high/50 pt-2">
                      {item.nutritionistAdvice}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-on-surface">
                Phân bố Mục tiêu Sức khỏe (User Hoạt động)
              </h3>
              {overview.dietaryGoals?.length > 0 ? (
                <div className="space-y-3">
                  {overview.dietaryGoals.map((goal, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold">{goal.goalName}</span>
                        <span className="font-mono">
                          {goal.memberCount} người ({goal.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${goal.percentage}%`,
                            backgroundColor: goal.colorHex || '#10b981',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-outline py-6 text-center">
                  Chưa có hồ sơ sức khỏe người dùng hoạt động.
                </p>
              )}
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-on-surface">
                Phân bố Mục tiêu Năng lượng (DailyKcalTarget)
              </h3>
              {overview.calorieDistribution?.length > 0 ? (
                <div className="space-y-3">
                  {overview.calorieDistribution.map((range, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold">{range.rangeLabel}</span>
                        <span className="font-mono">
                          {range.userCount} người ({range.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${range.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-outline py-6 text-center">
                  Chưa có dữ liệu mục tiêu năng lượng.
                </p>
              )}
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-on-surface">
                  Xu hướng Nguyên liệu trong Kỳ ({overview.periodDays} ngày)
                </h3>
                {overview.topIngredientsNote && (
                  <p className="text-[11px] text-outline mt-0.5">{overview.topIngredientsNote}</p>
                )}
              </div>
              {overview.topIngredients?.length > 0 ? (
                <div className="space-y-2">
                  {overview.topIngredients.map((item, idx) => (
                    <div
                      key={item.ingredientId || idx}
                      className="p-3 rounded-xl bg-surface border border-surface-container-high/40 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">
                          #{idx + 1} {item.name}
                        </p>
                        <p className="text-[11px] text-outline">{item.statusTag}</p>
                        <p className="text-[10px] text-on-surface-variant">{item.growthNote}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-mono font-bold text-primary">
                          {item.currentPeriodUses ?? item.mentionsCount} bữa
                        </span>
                        {item.growthRate !== null && item.growthRate !== undefined ? (
                          <span
                            className={`inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              item.growthRate >= 0
                                ? 'bg-emerald-500/15 text-emerald-700'
                                : 'bg-error-container text-on-error-container'
                            }`}
                          >
                            {item.growthRate >= 0 ? `+${item.growthRate}%` : `${item.growthRate}%`}
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] text-outline">
                            Kỳ trước: 0
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-outline py-6 text-center">
                  Chưa có nguyên liệu nào thuộc công thức đã xuất bản.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
