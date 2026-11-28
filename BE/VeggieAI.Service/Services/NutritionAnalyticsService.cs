using System.Globalization;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface INutritionAnalyticsService
{
    Task<NutritionOverviewDto> GetOverviewAnalyticsAsync(int periodDays = 30, string averagingMode = NutritionAnalyticsService.ModePerLoggedDay);
    Task<List<DeficitItemDto>> GetMicronutrientDeficitsAsync(int periodDays = 30, string averagingMode = NutritionAnalyticsService.ModePerLoggedDay);
    Task<List<IngredientPopularityDto>> GetTopIngredientsTrendsAsync(int periodDays = 30);
}

/// <summary>
/// Nutrition Analytics computed 100% from PostgreSQL data.
///
/// One averaging definition is applied consistently to Calories, Protein, Carb, Fat, Fiber,
/// community micronutrient intake and Weekly Trends:
///   - per_logged_day         : total recorded intake ÷ number of user-days that actually have a MealLog.
///   - per_active_user_period : total recorded intake ÷ (users with ≥1 MealLog × periodDays).
///   - per_all_users_period   : total recorded intake ÷ (all active Users × periodDays).
///
/// Users without MealLogs are reported as "no data" — never as having eaten 0 nutrients.
/// Micronutrient deficits are judged per user against the NutrientStandard matching that user's
/// gender and age (from HealthProfile). Users without a matching standard are reported separately.
/// </summary>
public class NutritionAnalyticsService : INutritionAnalyticsService
{
    public const string ModePerLoggedDay = "per_logged_day";
    public const string ModePerActiveUserPeriod = "per_active_user_period";
    public const string ModePerAllUsersPeriod = "per_all_users_period";
    public const int MinPeriodDays = 1;
    public const int MaxPeriodDays = 365;

    public static readonly IReadOnlyList<string> SupportedModes = new[]
    {
        ModePerLoggedDay, ModePerActiveUserPeriod, ModePerAllUsersPeriod
    };

    private const string PublishedStatus = "published";
    private const int WeeklyTrendDays = 7;

    private readonly IUnitOfWork _unitOfWork;

    public NutritionAnalyticsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public static bool IsSupportedMode(string? mode) =>
        !string.IsNullOrWhiteSpace(mode) && SupportedModes.Contains(mode.Trim().ToLowerInvariant());

    private static string NormalizeAveragingMode(string? mode)
    {
        var m = (mode ?? ModePerLoggedDay).Trim().ToLowerInvariant();
        return SupportedModes.Contains(m) ? m : ModePerLoggedDay;
    }

    private static string Fmt(decimal value) => value.ToString("0.##", CultureInfo.InvariantCulture);

    // ------------------------------------------------------------------
    // Internal data model
    // ------------------------------------------------------------------

    private sealed record ActiveUserInfo(int UserId, string? Gender, DateOnly? DateOfBirth);

    private sealed record MealRow(
        int UserId, int RecipeId, DateOnly LogDate, decimal Servings, decimal KcalConsumed,
        decimal KcalPerServing, decimal ProteinG, decimal CarbG, decimal FatG,
        decimal IronMg, decimal B12Mcg, decimal CalciumMg, decimal ZincMg);

    private sealed record RecipeFiberInfo(decimal? FiberPerServing, int TotalIngredients, int IngredientsWithFiber)
    {
        public bool IsComplete => FiberPerServing.HasValue;
    }

    private sealed class UserDay
    {
        public int UserId { get; init; }
        public DateOnly LogDate { get; init; }
        public int MealCount { get; set; }
        public decimal Calories { get; set; }
        public decimal Protein { get; set; }
        public decimal Carb { get; set; }
        public decimal Fat { get; set; }
        public decimal Iron { get; set; }
        public decimal B12 { get; set; }
        public decimal Calcium { get; set; }
        public decimal Zinc { get; set; }
        public bool FiberComplete { get; set; } = true;
        public decimal Fiber { get; set; }
    }

    private sealed class AnalyticsDataset
    {
        public int PeriodDays { get; init; }
        public string Mode { get; init; } = ModePerLoggedDay;
        public DateOnly Today { get; init; }
        public DateOnly PeriodStart { get; init; }
        public List<ActiveUserInfo> ActiveUsers { get; init; } = new();
        /// <summary>User-days in max(periodDays, 7) window (used for Weekly Trends).</summary>
        public List<UserDay> AllUserDays { get; init; } = new();
        /// <summary>User-days inside the reporting period only.</summary>
        public List<UserDay> PeriodUserDays { get; init; } = new();
        public int PeriodMealCount { get; init; }

        public int UsersWithLog => PeriodUserDays.Select(d => d.UserId).Distinct().Count();

        public int Denominator => Mode switch
        {
            ModePerActiveUserPeriod => UsersWithLog * PeriodDays,
            ModePerAllUsersPeriod => ActiveUsers.Count * PeriodDays,
            _ => PeriodUserDays.Count
        };
    }

    // ------------------------------------------------------------------
    // Data loading (filters and projections pushed down to PostgreSQL)
    // ------------------------------------------------------------------

    private async Task<AnalyticsDataset> LoadDatasetAsync(int periodDays, string mode)
    {
        var ctx = _unitOfWork.Context;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var periodStart = today.AddDays(-(periodDays - 1));
        var loadStart = today.AddDays(-(Math.Max(periodDays, WeeklyTrendDays) - 1));

        var activeUsers = await ctx.Users.AsNoTracking()
            .Where(u => u.Role == RoleConstants.User && u.Status == "active")
            .Select(u => new ActiveUserInfo(
                u.Id,
                u.HealthProfile != null ? u.HealthProfile.Gender : null,
                u.HealthProfile != null ? (DateOnly?)u.HealthProfile.DateOfBirth : null))
            .ToListAsync();

        // Only MealLogs of active standard Users are in scope, so numerator and denominators match.
        var meals = await ctx.MealLogs.AsNoTracking()
            .Where(m => m.LogDate >= loadStart && m.LogDate <= today
                        && m.Recipe != null
                        && m.User != null
                        && m.User.Role == RoleConstants.User
                        && m.User.Status == "active")
            .Select(m => new MealRow(
                m.UserId, m.RecipeId, m.LogDate, m.Servings, m.KcalConsumed,
                m.Recipe!.KcalPerServing, m.Recipe.ProteinG, m.Recipe.CarbG, m.Recipe.FatG,
                m.Recipe.IronMg, m.Recipe.B12Mcg, m.Recipe.CalciumMg, m.Recipe.ZincMg))
            .ToListAsync();

        var recipeFiber = await LoadRecipeFiberAsync(meals.Select(m => m.RecipeId).Distinct().ToList());

        var allDays = meals
            .GroupBy(m => new { m.UserId, m.LogDate })
            .Select(g =>
            {
                var day = new UserDay { UserId = g.Key.UserId, LogDate = g.Key.LogDate };
                foreach (var m in g)
                {
                    day.MealCount++;
                    day.Calories += m.KcalConsumed > 0 ? m.KcalConsumed : m.KcalPerServing * m.Servings;
                    day.Protein += m.ProteinG * m.Servings;
                    day.Carb += m.CarbG * m.Servings;
                    day.Fat += m.FatG * m.Servings;
                    day.Iron += m.IronMg * m.Servings;
                    day.B12 += m.B12Mcg * m.Servings;
                    day.Calcium += m.CalciumMg * m.Servings;
                    day.Zinc += m.ZincMg * m.Servings;

                    if (recipeFiber.TryGetValue(m.RecipeId, out var fiber) && fiber.IsComplete)
                    {
                        day.Fiber += fiber.FiberPerServing!.Value * m.Servings;
                    }
                    else
                    {
                        // A single meal with incomplete Fiber data makes the whole day's Fiber unknown.
                        day.FiberComplete = false;
                    }
                }
                return day;
            })
            .ToList();

        return new AnalyticsDataset
        {
            PeriodDays = periodDays,
            Mode = mode,
            Today = today,
            PeriodStart = periodStart,
            ActiveUsers = activeUsers,
            AllUserDays = allDays,
            PeriodUserDays = allDays.Where(d => d.LogDate >= periodStart).ToList(),
            PeriodMealCount = meals.Count(m => m.LogDate >= periodStart)
        };
    }

    /// <summary>
    /// Fiber per serving is only considered known when EVERY ingredient of the recipe has measured Fiber.
    /// A recipe without an ingredient breakdown falls back to an explicitly stored Recipe.FiberG.
    /// </summary>
    private async Task<Dictionary<int, RecipeFiberInfo>> LoadRecipeFiberAsync(List<int> recipeIds)
    {
        var result = new Dictionary<int, RecipeFiberInfo>();
        if (recipeIds.Count == 0) return result;

        var ctx = _unitOfWork.Context;
        var headers = await ctx.Recipes.AsNoTracking()
            .Where(r => recipeIds.Contains(r.Id))
            .Select(r => new { r.Id, r.Servings, r.FiberG })
            .ToListAsync();

        var lines = await ctx.RecipeIngredients.AsNoTracking()
            .Where(ri => recipeIds.Contains(ri.RecipeId))
            .Select(ri => new
            {
                ri.RecipeId,
                ri.QuantityG,
                Fiber = ri.Ingredient != null ? ri.Ingredient.FiberPer100g : (decimal?)null
            })
            .ToListAsync();

        var linesByRecipe = lines.GroupBy(l => l.RecipeId).ToDictionary(g => g.Key, g => g.ToList());

        foreach (var h in headers)
        {
            if (linesByRecipe.TryGetValue(h.Id, out var ls) && ls.Count > 0)
            {
                var withFiber = ls.Count(l => l.Fiber.HasValue);
                decimal? perServing = withFiber == ls.Count
                    ? ls.Sum(l => l.QuantityG * l.Fiber!.Value / 100m) / Math.Max(1, h.Servings)
                    : null;
                result[h.Id] = new RecipeFiberInfo(perServing, ls.Count, withFiber);
            }
            else
            {
                result[h.Id] = new RecipeFiberInfo(h.FiberG, 0, 0);
            }
        }

        return result;
    }

    // ------------------------------------------------------------------
    // Shared calculation helpers
    // ------------------------------------------------------------------

    private static decimal? Average(decimal sum, int denominator, int decimals) =>
        denominator > 0 ? Math.Round(sum / denominator, decimals) : null;

    private static (decimal? Value, string Note) ComputeFiberAverage(List<UserDay> days, int denominator, string mode)
    {
        if (days.Count == 0)
        {
            return (null, "Chưa có nhật ký bữa ăn nên chưa có dữ liệu Fiber.");
        }

        var complete = days.Where(d => d.FiberComplete).ToList();
        var incomplete = days.Count - complete.Count;

        if (complete.Count == 0)
        {
            return (null, $"Không có ngày-người nào có dữ liệu Fiber đầy đủ cho mọi nguyên liệu ({incomplete} ngày-người thiếu dữ liệu). Hệ thống không cộng phần nguyên liệu thiếu thành 0 g.");
        }

        if (mode == ModePerLoggedDay)
        {
            var value = Math.Round(complete.Sum(d => d.Fiber) / complete.Count, 1);
            var note = incomplete == 0
                ? $"Tính trên toàn bộ {complete.Count} ngày-người có log (100% có dữ liệu Fiber đầy đủ)."
                : $"Tính trên {complete.Count}/{days.Count} ngày-người có dữ liệu Fiber đầy đủ; {incomplete} ngày-người có nguyên liệu chưa đo Fiber bị loại khỏi phép tính, không coi là 0 g.";
            return (value, note);
        }

        if (incomplete > 0)
        {
            return (null, $"Chỉ {complete.Count}/{days.Count} ngày-người có dữ liệu Fiber đầy đủ, nên không thể chia cho mẫu số cả kỳ mà không coi phần thiếu là 0 g. Chọn mẫu số \"Theo ngày có ghi nhận log\" để xem Fiber trên phần dữ liệu đầy đủ.");
        }

        return (Average(complete.Sum(d => d.Fiber), denominator, 1),
            $"100% ngày-người có dữ liệu Fiber đầy đủ; chia cho mẫu số {denominator} ngày-người của chế độ đang chọn.");
    }

    private static (string Label, string Note) DescribeMode(AnalyticsDataset ds)
    {
        var denom = ds.Denominator;
        var loggedDays = ds.PeriodUserDays.Count;
        var usersWithLog = ds.UsersWithLog;
        var activeUsers = ds.ActiveUsers.Count;
        const string scope = " Áp dụng thống nhất cho Calories, Protein, Carb, Fat, Fiber, mức hấp thu vi chất cộng đồng và Weekly Trends.";

        return ds.Mode switch
        {
            ModePerActiveUserPeriod => (
                $"User có log × {ds.PeriodDays} ngày trong kỳ",
                $"Tổng dinh dưỡng ghi nhận ÷ ({usersWithLog} User có log × {ds.PeriodDays} ngày = {denom} ngày-người). Những ngày nhóm này không ghi nhật ký vẫn nằm trong mẫu số.{scope}"),
            ModePerAllUsersPeriod => (
                $"Toàn bộ User hoạt động × {ds.PeriodDays} ngày trong kỳ",
                $"Tổng dinh dưỡng ghi nhận ÷ ({activeUsers} User hoạt động × {ds.PeriodDays} ngày = {denom} ngày-người). {activeUsers - usersWithLog} User không có log vẫn nằm trong mẫu số (dữ liệu không được ghi nhận, không phải ăn 0).{scope}"),
            _ => (
                "Theo ngày-người thực tế có ghi nhận",
                $"Tổng dinh dưỡng ghi nhận ÷ {loggedDays} ngày-người thực tế có log trong {ds.PeriodDays} ngày. Ngày không ghi nhật ký không được tính là 0 kcal.{scope}")
        };
    }

    private static NutrientStandard? MatchStandard(ActiveUserInfo user, List<NutrientStandard> standards, DateOnly today)
    {
        if (string.IsNullOrWhiteSpace(user.Gender) || user.DateOfBirth is null) return null;

        var dob = user.DateOfBirth.Value;
        var age = today.Year - dob.Year;
        if (dob > today.AddYears(-age)) age--;

        return standards
            .Where(s => string.Equals(s.Gender, user.Gender, StringComparison.OrdinalIgnoreCase)
                        && s.AgeFrom <= age && age <= s.AgeTo)
            .OrderBy(s => s.AgeFrom)
            .FirstOrDefault();
    }

    // ------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------

    public async Task<NutritionOverviewDto> GetOverviewAnalyticsAsync(int periodDays = 30, string averagingMode = ModePerLoggedDay)
    {
        periodDays = Math.Clamp(periodDays, MinPeriodDays, MaxPeriodDays);
        var mode = NormalizeAveragingMode(averagingMode);
        var ds = await LoadDatasetAsync(periodDays, mode);

        var days = ds.PeriodUserDays;
        var denom = ds.Denominator;
        var hasMealLogData = days.Count > 0;
        var (modeLabel, calculationNote) = DescribeMode(ds);
        var (avgFiber, fiberNote) = ComputeFiberAverage(days, denom, mode);
        var fiberCompleteDays = days.Count(d => d.FiberComplete);

        // HealthProfiles restricted to the same active-User population as the analytics denominators
        var profiles = await _unitOfWork.Context.HealthProfiles.AsNoTracking()
            .Where(p => p.User != null && p.User.Role == RoleConstants.User && p.User.Status == "active")
            .Select(p => new { p.HealthGoal, p.DailyKcalTarget })
            .ToListAsync();

        var dietaryGoals = new List<GoalDistributionDto>();
        if (profiles.Count > 0)
        {
            var totalProf = profiles.Count;
            void AddGoal(string key, string name, string color)
            {
                var count = profiles.Count(p => p.HealthGoal == key);
                dietaryGoals.Add(new GoalDistributionDto
                {
                    GoalName = name,
                    MemberCount = count,
                    Percentage = (int)Math.Round((double)count / totalProf * 100),
                    ColorHex = color
                });
            }
            AddGoal("loss", "Giảm cân & Kiểm soát mỡ (Loss)", "#3b82f6");
            AddGoal("maintain", "Duy trì sức khỏe bền vững (Maintain)", "#10b981");
            AddGoal("gain", "Tăng cơ thuần thực vật (Gain)", "#f59e0b");
        }

        var calorieDistribution = new List<CalorieRangeDto>();
        var kcalValues = profiles.Where(p => p.DailyKcalTarget.HasValue).Select(p => p.DailyKcalTarget!.Value).ToList();
        if (kcalValues.Count > 0)
        {
            var totalK = kcalValues.Count;
            CalorieRangeDto Range(string label, Func<decimal, bool> predicate)
            {
                var c = kcalValues.Count(predicate);
                return new CalorieRangeDto { RangeLabel = label, UserCount = c, Percentage = (int)Math.Round((double)c / totalK * 100) };
            }
            calorieDistribution.Add(Range("<1400 Kcal", v => v < 1400m));
            calorieDistribution.Add(Range("1400-1800 Kcal", v => v >= 1400m && v < 1800m));
            calorieDistribution.Add(Range("1800-2200 Kcal", v => v >= 1800m && v <= 2200m));
            calorieDistribution.Add(Range(">2200 Kcal", v => v > 2200m));
        }

        var (weeklyTrends, weeklyNote) = BuildWeeklyTrends(ds);
        var deficits = await BuildDeficitsAsync(ds);
        var topIngredients = await GetTopIngredientsTrendsAsync(periodDays);

        var activeUsers = ds.ActiveUsers.Count;
        var usersWithLog = ds.UsersWithLog;

        return new NutritionOverviewDto
        {
            HasData = hasMealLogData || profiles.Count > 0,
            HasMealLogData = hasMealLogData,
            HasFiberData = avgFiber.HasValue,
            PeriodDays = periodDays,
            PeriodStart = ds.PeriodStart.ToString("dd/MM/yyyy"),
            PeriodEnd = ds.Today.ToString("dd/MM/yyyy"),
            AveragingMode = mode,
            AveragingModeLabel = modeLabel,
            CalculationDenominator = hasMealLogData ? denom : 0,
            CalculationNote = calculationNote,
            TotalUsersTracked = activeUsers,
            ActiveLoggedUsersCount = usersWithLog,
            UsersWithoutLogCount = Math.Max(0, activeUsers - usersWithLog),
            DataCoveragePercent = activeUsers > 0 ? Math.Round((decimal)usersWithLog / activeUsers * 100m, 1) : 0m,
            LoggedUserDaysCount = days.Count,
            TotalMealLogs = ds.PeriodMealCount,
            AvgDailyCalories = hasMealLogData && denom > 0 ? (int)Math.Round(days.Sum(d => d.Calories) / denom) : null,
            AvgDailyProtein = hasMealLogData ? Average(days.Sum(d => d.Protein), denom, 1) : null,
            AvgDailyCarb = hasMealLogData ? Average(days.Sum(d => d.Carb), denom, 1) : null,
            AvgDailyFat = hasMealLogData ? Average(days.Sum(d => d.Fat), denom, 1) : null,
            AvgDailyFiber = avgFiber,
            FiberCompleteUserDays = fiberCompleteDays,
            FiberIncompleteUserDays = days.Count - fiberCompleteDays,
            FiberCoveragePercent = days.Count > 0 ? Math.Round((decimal)fiberCompleteDays / days.Count * 100m, 1) : 0m,
            FiberCalculationNote = fiberNote,
            MicronutrientDeficits = deficits,
            TopIngredients = topIngredients,
            TopIngredientsNote = BuildTopIngredientsNote(periodDays),
            DietaryGoals = dietaryGoals,
            CalorieDistribution = calorieDistribution,
            WeeklyIntakeTrends = weeklyTrends,
            WeeklyTrendsNote = weeklyNote
        };
    }

    public async Task<List<DeficitItemDto>> GetMicronutrientDeficitsAsync(int periodDays = 30, string averagingMode = ModePerLoggedDay)
    {
        periodDays = Math.Clamp(periodDays, MinPeriodDays, MaxPeriodDays);
        var ds = await LoadDatasetAsync(periodDays, NormalizeAveragingMode(averagingMode));
        return await BuildDeficitsAsync(ds);
    }

    // ------------------------------------------------------------------
    // Weekly Trends — null (not 0) when a day has no MealLog
    // ------------------------------------------------------------------

    private static (List<WeeklyIntakeDto> Items, string Note) BuildWeeklyTrends(AnalyticsDataset ds)
    {
        var dayNames = new[] { "CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7" };
        var weekStart = ds.Today.AddDays(-(WeeklyTrendDays - 1));
        var weekDays = ds.AllUserDays.Where(d => d.LogDate >= weekStart).ToList();
        var weekLoggers = weekDays.Select(d => d.UserId).Distinct().Count();
        var items = new List<WeeklyIntakeDto>();

        for (int i = WeeklyTrendDays - 1; i >= 0; i--)
        {
            var dt = ds.Today.AddDays(-i);
            var dayItems = weekDays.Where(d => d.LogDate == dt).ToList();
            var item = new WeeklyIntakeDto
            {
                Date = dt.ToString("yyyy-MM-dd"),
                DayLabel = $"{dayNames[(int)dt.DayOfWeek]} ({dt:dd/MM})",
                LoggedUsersCount = dayItems.Count,
                HasData = dayItems.Count > 0
            };

            if (dayItems.Count > 0)
            {
                var denom = ds.Mode switch
                {
                    ModePerActiveUserPeriod => weekLoggers,
                    ModePerAllUsersPeriod => ds.ActiveUsers.Count,
                    _ => dayItems.Count
                };
                item.Calories = denom > 0 ? (int)Math.Round(dayItems.Sum(d => d.Calories) / denom) : null;
                item.ProteinGrams = Average(dayItems.Sum(d => d.Protein), denom, 1);
                item.FiberGrams = ComputeFiberAverage(dayItems, denom, ds.Mode).Value;
            }

            items.Add(item);
        }

        var note = ds.Mode switch
        {
            ModePerActiveUserPeriod => $"Mỗi ngày: tổng dinh dưỡng của ngày ÷ {weekLoggers} User có log trong 7 ngày gần nhất.",
            ModePerAllUsersPeriod => $"Mỗi ngày: tổng dinh dưỡng của ngày ÷ {ds.ActiveUsers.Count} User hoạt động.",
            _ => "Mỗi ngày: tổng dinh dưỡng của ngày ÷ số User thực tế có log trong ngày đó."
        };
        note += " Ngày không có nhật ký hiển thị \"Chưa có dữ liệu\" (null), không vẽ thành 0.";

        return (items, note);
    }

    // ------------------------------------------------------------------
    // Micronutrient deficits — personal RDI by gender & age
    // ------------------------------------------------------------------

    private async Task<List<DeficitItemDto>> BuildDeficitsAsync(AnalyticsDataset ds)
    {
        if (ds.PeriodUserDays.Count == 0) return new List<DeficitItemDto>();

        var ctx = _unitOfWork.Context;
        var standards = await ctx.NutrientStandards.AsNoTracking().ToListAsync();
        var byUser = ds.PeriodUserDays.GroupBy(d => d.UserId).ToDictionary(g => g.Key, g => g.ToList());

        // per_all_users_period evaluates the whole active population; other modes evaluate users with logs.
        var scopeUsers = ds.Mode == ModePerAllUsersPeriod
            ? ds.ActiveUsers
            : ds.ActiveUsers.Where(u => byUser.ContainsKey(u.UserId)).ToList();
        var usersWithData = scopeUsers.Where(u => byUser.ContainsKey(u.UserId)).ToList();
        var usersWithoutDataInScope = scopeUsers.Count - usersWithData.Count;
        var totalUsersWithoutData = Math.Max(0, ds.ActiveUsers.Count - usersWithData.Count);
        var populationCoveragePct = ds.ActiveUsers.Count > 0
            ? Math.Round((decimal)usersWithData.Count / ds.ActiveUsers.Count * 100m, 1)
            : 0m;

        var matched = usersWithData
            .Select(u => new { u.UserId, Standard = MatchStandard(u, standards, ds.Today) })
            .ToList();
        var evaluated = matched.Where(x => x.Standard != null).ToList();
        var usersWithoutStandard = matched.Count - evaluated.Count;
        var denom = ds.Denominator;

        decimal UserAverage(int userId, Func<UserDay, decimal> selector)
        {
            var userDays = byUser[userId];
            var divisor = ds.Mode == ModePerLoggedDay ? userDays.Count : ds.PeriodDays;
            return userDays.Sum(selector) / Math.Max(1, divisor);
        }

        async Task<List<string>> TopSourcesAsync(Expression<Func<Ingredient, decimal>> selector) =>
            await ctx.Ingredients.AsNoTracking().OrderByDescending(selector).Take(3).Select(i => i.Name).ToListAsync();

        var scopeLabel = ds.Mode == ModePerAllUsersPeriod
            ? $"Phạm vi: toàn bộ {scopeUsers.Count} User hoạt động (bao phủ dữ liệu {Fmt(populationCoveragePct)}%)"
            : $"Phạm vi: {scopeUsers.Count} User có log trên tổng {ds.ActiveUsers.Count} User hoạt động (bao phủ dữ liệu {Fmt(populationCoveragePct)}%)";

        DeficitItemDto Build(string name, string unit, Func<UserDay, decimal> daySelector,
            Func<NutrientStandard, decimal> rdiSelector, List<string> sources, string advice)
        {
            var communityAvg = Average(ds.PeriodUserDays.Sum(daySelector), denom, 2);
            var deficient = evaluated.Count(x => UserAverage(x.UserId, daySelector) < rdiSelector(x.Standard!));
            int? pct = evaluated.Count > 0 ? (int)Math.Round((double)deficient / evaluated.Count * 100) : null;
            int? scopePct = evaluated.Count > 0 && scopeUsers.Count > 0
                ? (int)Math.Round((double)deficient / scopeUsers.Count * 100)
                : null;
            var severity = pct is null ? "unknown" : pct >= 50 ? "high" : pct >= 25 ? "medium" : "low";

            var rdis = evaluated.Select(x => rdiSelector(x.Standard!)).Distinct().OrderBy(v => v).ToList();
            var rdiText = rdis.Count switch
            {
                0 => "Chưa xác định (thiếu HealthProfile hoặc NutrientStandard phù hợp)",
                1 => $"{Fmt(rdis[0])} {unit}/ngày",
                _ => $"{Fmt(rdis.First())}–{Fmt(rdis.Last())} {unit}/ngày (theo giới tính & độ tuổi)"
            };

            var statusText = pct is null
                ? $"Chưa đánh giá được: {usersWithoutStandard} User có dữ liệu nhưng không khớp NutrientStandard theo giới tính/độ tuổi."
                : $"{deficient}/{evaluated.Count} User đủ dữ liệu chưa đạt RDI cá nhân ({pct}%).";

            var extra = new List<string>();
            if (totalUsersWithoutData > 0)
            {
                extra.Add($"{totalUsersWithoutData} User hoạt động chưa có nhật ký (không gộp vào thiếu hụt)");
            }
            if (usersWithoutStandard > 0 && pct is not null)
            {
                extra.Add($"{usersWithoutStandard} User chưa có chuẩn RDI phù hợp");
            }

            return new DeficitItemDto
            {
                NutrientName = name,
                StandardRdi = rdiText,
                AvgCommunityIntake = communityAvg.HasValue ? $"{Fmt(communityAvg.Value)} {unit}/ngày" : "Chưa có dữ liệu",
                AvgCommunityIntakeValue = communityAvg,
                DeficitPercent = pct,
                DeficitPercentOfScope = scopePct,
                Severity = severity,
                StatusText = statusText,
                ScopeNote = extra.Count > 0 ? $"{scopeLabel}. {string.Join("; ", extra)}." : $"{scopeLabel}.",
                TotalActiveUsers = ds.ActiveUsers.Count,
                TotalUsersInScope = scopeUsers.Count,
                UsersWithData = usersWithData.Count,
                UsersWithoutData = ds.Mode == ModePerAllUsersPeriod ? usersWithoutDataInScope : totalUsersWithoutData,
                TotalUsersWithoutData = totalUsersWithoutData,
                UsersWithoutStandard = usersWithoutStandard,
                UsersEvaluated = evaluated.Count,
                DeficientUsers = deficient,
                DataCoveragePercent = populationCoveragePct,
                RecommendedSources = sources,
                NutritionistAdvice = advice
            };
        }

        return new List<DeficitItemDto>
        {
            Build("Vitamin B12", "mcg", d => d.B12, s => s.B12Mcg, await TopSourcesAsync(i => i.B12Per100g),
                "Bổ sung từ thực phẩm tăng cường B12 (Men dinh dưỡng, sữa hạt tăng cường) hoặc viên uống theo chỉ định."),
            Build("Sắt Non-Heme", "mg", d => d.Iron, s => s.IronMg, await TopSourcesAsync(i => i.IronPer100g),
                "Kết hợp thực phẩm giàu Vitamin C trong cùng bữa ăn và hạn chế uống trà/cà phê ngay sau bữa ăn."),
            Build("Kẽm (Zinc)", "mg", d => d.Zinc, s => s.ZincMg, await TopSourcesAsync(i => i.ZincPer100g),
                "Ngâm các loại đậu và hạt trước khi chế biến để giảm axit phytic, tăng khả năng hấp thu kẽm."),
            Build("Canxi Thực Vật", "mg", d => d.Calcium, s => s.CalciumMg, await TopSourcesAsync(i => i.CalciumPer100g),
                "Ưu tiên đậu hũ ép canxi, hạt chia, vừng/mè và các loại rau lá xanh đậm ít oxalate.")
        };
    }

    // ------------------------------------------------------------------
    // Top Ingredients — real growth vs. the previous equal-length period
    // ------------------------------------------------------------------

    private static string BuildTopIngredientsNote(int periodDays) =>
        $"Chỉ tính công thức đã xuất bản (published). Lượt dùng = số MealLog trong {periodDays} ngày gần nhất có công thức chứa nguyên liệu. " +
        $"Tăng trưởng = (kỳ này − {periodDays} ngày liền trước) ÷ kỳ trước; để trống khi kỳ trước chưa có lượt dùng.";

    public async Task<List<IngredientPopularityDto>> GetTopIngredientsTrendsAsync(int periodDays = 30)
    {
        periodDays = Math.Clamp(periodDays, MinPeriodDays, MaxPeriodDays);
        var ctx = _unitOfWork.Context;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var currentStart = today.AddDays(-(periodDays - 1));
        var previousStart = currentStart.AddDays(-periodDays);
        var previousEnd = currentStart.AddDays(-1);

        var publishedLines = await ctx.RecipeIngredients.AsNoTracking()
            .Where(ri => ri.Recipe != null && ri.Recipe.Status == PublishedStatus && ri.Ingredient != null)
            .Select(ri => new
            {
                ri.RecipeId,
                ri.IngredientId,
                Name = ri.Ingredient!.Name,
                ri.Ingredient.DataSource,
                ri.Ingredient.ProteinPer100g,
                ri.Ingredient.KcalPer100g
            })
            .ToListAsync();

        if (publishedLines.Count == 0) return new List<IngredientPopularityDto>();

        var recipeIds = publishedLines.Select(l => l.RecipeId).Distinct().ToList();

        var currentCounts = await ctx.MealLogs.AsNoTracking()
            .Where(m => recipeIds.Contains(m.RecipeId)
                        && m.LogDate >= currentStart && m.LogDate <= today
                        && m.User != null && m.User.Role == RoleConstants.User && m.User.Status == "active")
            .GroupBy(m => m.RecipeId)
            .Select(g => new { RecipeId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.RecipeId, x => x.Count);

        var previousCounts = await ctx.MealLogs.AsNoTracking()
            .Where(m => recipeIds.Contains(m.RecipeId)
                        && m.LogDate >= previousStart && m.LogDate <= previousEnd
                        && m.User != null && m.User.Role == RoleConstants.User && m.User.Status == "active")
            .GroupBy(m => m.RecipeId)
            .Select(g => new { RecipeId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.RecipeId, x => x.Count);

        return publishedLines
            .GroupBy(l => l.IngredientId)
            .Select(g =>
            {
                var first = g.First();
                var recipes = g.Select(x => x.RecipeId).Distinct().ToList();
                var current = recipes.Sum(r => currentCounts.TryGetValue(r, out var c) ? c : 0);
                var previous = recipes.Sum(r => previousCounts.TryGetValue(r, out var c) ? c : 0);
                decimal? growth = previous > 0 ? Math.Round((decimal)(current - previous) / previous * 100m, 1) : null;
                var growthNote = previous > 0
                    ? $"{(growth >= 0 ? "+" : "")}{Fmt(growth!.Value)}% so với kỳ trước ({previous} → {current})"
                    : current > 0
                        ? $"Mới phát sinh trong kỳ (kỳ trước 0 lượt) — chưa đủ cơ sở tính %"
                        : "Chưa có lượt dùng trong 2 kỳ so sánh";

                return new IngredientPopularityDto
                {
                    IngredientId = g.Key,
                    Name = first.Name,
                    Category = first.DataSource ?? "Thư viện Vi chất",
                    MentionsCount = current,
                    CurrentPeriodUses = current,
                    PreviousPeriodUses = previous,
                    PublishedRecipeCount = recipes.Count,
                    GrowthRate = growth,
                    GrowthNote = growthNote,
                    PrimaryNutrient = $"{Fmt(first.ProteinPer100g)}g Protein • {Fmt(first.KcalPer100g)} kcal/100g",
                    StatusTag = $"{recipes.Count} công thức đã xuất bản • {current} bữa ăn trong kỳ"
                };
            })
            .OrderByDescending(x => x.CurrentPeriodUses)
            .ThenByDescending(x => x.PublishedRecipeCount)
            .ThenBy(x => x.Name)
            .Take(8)
            .ToList();
    }
}
