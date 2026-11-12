using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Data;
using VeggieAI.Service.Services.AI;

namespace VeggieAI.Service.Services;

public interface INutritionService
{
    Task<MealLogDto> LogMealAsync(int userId, LogMealRequest req, CancellationToken ct = default);
    Task DeleteLogAsync(int userId, int logId, CancellationToken ct = default);
    Task<DailyNutritionDto> GetDailyAsync(int userId, DateOnly? date, CancellationToken ct = default);
    Task<IReadOnlyList<TrendPointDto>> GetTrendAsync(int userId, DateOnly? from, DateOnly? to, CancellationToken ct = default);
    Task<ActivityDataDto> UpsertActivityAsync(int userId, UpsertActivityRequest req, CancellationToken ct = default);
}

/// <summary>Nhật ký bữa ăn thực tế, tổng dinh dưỡng theo ngày, xu hướng và cảnh báo thiếu chất.</summary>
public class NutritionService : INutritionService
{
    private const int MaxTrendDays = 93;
    /// <summary>Cảnh báo của hôm nay chỉ hiện sau giờ này (giờ VN) để tránh báo thiếu khi ngày chưa kết thúc.</summary>
    private const int TodayAlertHourVn = 19;

    private readonly VeggieAIDbContext _db;

    public NutritionService(VeggieAIDbContext db)
    {
        _db = db;
    }

    public async Task<MealLogDto> LogMealAsync(int userId, LogMealRequest req, CancellationToken ct = default)
    {
        var today = AiMappers.TodayVn();
        MealLog log;

        if (req.PlanItemId is int planItemId)
        {
            var item = await _db.MealPlanItems.AsNoTracking()
                .Include(i => i.Recipe)
                .FirstOrDefaultAsync(i => i.Id == planItemId && i.MealPlan!.UserId == userId, ct)
                ?? throw AppException.NotFound("Món trong thực đơn");
            if (await _db.MealLogs.AnyAsync(l => l.UserId == userId && l.PlanItemId == planItemId, ct))
                throw AppException.Conflict("Món này đã được ghi nhận là đã ăn.");

            var servings = req.Servings ?? item.Servings;
            log = new MealLog
            {
                UserId = userId,
                RecipeId = item.RecipeId,
                PlanItemId = item.Id,
                LogDate = req.LogDate ?? item.PlanDate,
                MealType = req.MealType ?? item.MealType,
                Servings = servings,
                KcalConsumed = Math.Round(item.Recipe!.KcalPerServing * servings, 2),
            };
        }
        else if (req.RecipeId is int recipeId)
        {
            var recipe = await _db.Recipes.AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == recipeId && (r.Status == "published" || r.CreatedBy == userId), ct)
                ?? throw AppException.NotFound("Công thức");
            var servings = req.Servings ?? 1;
            log = new MealLog
            {
                UserId = userId,
                RecipeId = recipe.Id,
                LogDate = req.LogDate ?? today,
                MealType = req.MealType ?? GuessMealType(),
                Servings = servings,
                KcalConsumed = Math.Round(recipe.KcalPerServing * servings, 2),
            };
        }
        else
        {
            throw new AppException("Cần gửi planItemId hoặc recipeId.");
        }

        if (log.LogDate > today) throw new AppException("Không thể ghi nhận bữa ăn cho ngày trong tương lai.");

        _db.MealLogs.Add(log);
        await _db.SaveChangesAsync(ct);

        var saved = await LogsQuery(userId).FirstAsync(l => l.Id == log.Id, ct);
        return ToDto(saved);
    }

    public async Task DeleteLogAsync(int userId, int logId, CancellationToken ct = default)
    {
        var log = await _db.MealLogs.FirstOrDefaultAsync(l => l.Id == logId && l.UserId == userId, ct)
                  ?? throw AppException.NotFound("Nhật ký bữa ăn");
        _db.MealLogs.Remove(log);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<DailyNutritionDto> GetDailyAsync(int userId, DateOnly? date, CancellationToken ct = default)
    {
        var d = date ?? AiMappers.TodayVn();
        var logs = await LogsQuery(userId).Where(l => l.LogDate == d).OrderBy(l => l.Id).ToListAsync(ct);
        var dtos = logs.Select(ToDto).ToList();

        var consumed = dtos.Aggregate(NutrientAmountsDto.Zero, (a, l) => a.Add(l.Nutrition)).Rounded();
        var target = await TargetsAsync(userId, ct);
        var activity = await _db.ActivityDataRecords.AsNoTracking()
            .FirstOrDefaultAsync(a => a.UserId == userId && a.ActivityDate == d, ct);
        var burned = activity?.KcalBurned ?? 0;

        return new DailyNutritionDto(d, consumed, target, burned, activity?.Steps ?? 0,
            Math.Round(consumed.Kcal - burned, 1), dtos, BuildAlerts(d, consumed, target));
    }

    public async Task<IReadOnlyList<TrendPointDto>> GetTrendAsync(int userId, DateOnly? from, DateOnly? to, CancellationToken ct = default)
    {
        var end = to ?? AiMappers.TodayVn();
        var start = from ?? end.AddDays(-6);
        if (start > end) throw new AppException("'from' phải trước hoặc bằng 'to'.");
        if (end.DayNumber - start.DayNumber + 1 > MaxTrendDays)
            throw new AppException($"Khoảng thời gian tối đa {MaxTrendDays} ngày.");

        var logs = await LogsQuery(userId).Where(l => l.LogDate >= start && l.LogDate <= end).ToListAsync(ct);
        var activities = await _db.ActivityDataRecords.AsNoTracking()
            .Where(a => a.UserId == userId && a.ActivityDate >= start && a.ActivityDate <= end)
            .ToListAsync(ct);
        var kcalTarget = (await TargetsAsync(userId, ct)).Kcal;

        var points = new List<TrendPointDto>();
        for (var d = start; d <= end; d = d.AddDays(1))
        {
            var day = d;
            var n = logs.Where(l => l.LogDate == day)
                .Aggregate(NutrientAmountsDto.Zero, (a, l) => a.Add(l.Recipe!.PerServing().Scale(l.Servings)))
                .Rounded();
            var burned = activities.FirstOrDefault(a => a.ActivityDate == day)?.KcalBurned ?? 0;
            points.Add(new TrendPointDto(day, n.Kcal, n.ProteinG, n.IronMg, n.B12Mcg, kcalTarget, burned));
        }
        return points;
    }

    public async Task<ActivityDataDto> UpsertActivityAsync(int userId, UpsertActivityRequest req, CancellationToken ct = default)
    {
        var d = req.ActivityDate ?? AiMappers.TodayVn();
        if (d > AiMappers.TodayVn()) throw new AppException("Không thể nhập vận động cho ngày trong tương lai.");

        var row = await _db.ActivityDataRecords.FirstOrDefaultAsync(a => a.UserId == userId && a.ActivityDate == d, ct);
        if (row is null)
        {
            row = new ActivityData { UserId = userId, ActivityDate = d };
            _db.ActivityDataRecords.Add(row);
        }
        row.KcalBurned = req.KcalBurned;
        row.Steps = req.Steps;
        row.SyncedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return new ActivityDataDto(row.Id, row.ActivityDate, row.KcalBurned, row.Steps, row.SyncedAt);
    }

    // ---------------- helpers ----------------

    private IQueryable<MealLog> LogsQuery(int userId) =>
        _db.MealLogs.AsNoTracking().Include(l => l.Recipe).Where(l => l.UserId == userId);

    private async Task<NutrientAmountsDto> TargetsAsync(int userId, CancellationToken ct)
    {
        var p = await _db.HealthProfiles.AsNoTracking().FirstOrDefaultAsync(h => h.UserId == userId, ct);
        return (p?.Targets() ?? NutrientAmountsDto.Zero).Rounded();
    }

    private static MealLogDto ToDto(MealLog l) =>
        new(l.Id, l.LogDate, l.MealType, l.RecipeId, l.Recipe?.Title ?? string.Empty, l.Servings, l.KcalConsumed,
            l.PlanItemId, (l.Recipe?.PerServing() ?? NutrientAmountsDto.Zero).Scale(l.Servings).Rounded());

    private static string GuessMealType()
    {
        var hour = DateTime.UtcNow.AddHours(7).Hour;
        return hour switch
        {
            < 10 => AiMealTypes.Breakfast,
            < 15 => AiMealTypes.Lunch,
            >= 17 and < 22 => AiMealTypes.Dinner,
            _ => AiMealTypes.Snack,
        };
    }

    private static List<NutritionAlertDto> BuildAlerts(DateOnly date, NutrientAmountsDto c, NutrientAmountsDto t)
    {
        var alerts = new List<NutritionAlertDto>();
        var today = AiMappers.TodayVn();
        if (date > today || (date == today && DateTime.UtcNow.AddHours(7).Hour < TodayAlertHourVn)) return alerts;

        void Check(string name, string unit, decimal consumed, decimal target, string tip)
        {
            if (target <= 0) return;
            var pct = (int)Math.Round(consumed / target * 100);
            if (pct >= 75) return;
            var level = pct < 50 ? "high" : "medium";
            alerts.Add(new NutritionAlertDto(name, consumed, target, pct, level,
                $"{name} mới đạt {pct}% ({consumed:0.#}/{target:0.#} {unit}). {tip}"));
        }

        Check("Protein", "g", c.ProteinG, t.ProteinG, "Thêm đậu phụ, tempeh, các loại đậu hoặc sữa đậu nành.");
        Check("Sắt", "mg", c.IronMg, t.IronMg, "Ăn rau lá xanh đậm, đậu lăng kèm nguồn vitamin C để hấp thu tốt hơn.");
        Check("Vitamin B12", "mcg", c.B12Mcg, t.B12Mcg, "Người ăn chay nên dùng thực phẩm tăng cường B12 hoặc viên bổ sung.");
        Check("Canxi", "mg", c.CalciumMg, t.CalciumMg, "Bổ sung đậu phụ đông bằng canxi, mè, cải xanh, sữa thực vật tăng cường.");
        Check("Kẽm", "mg", c.ZincMg, t.ZincMg, "Thêm hạt bí, hạt điều, yến mạch, các loại đậu.");
        return alerts;
    }
}
