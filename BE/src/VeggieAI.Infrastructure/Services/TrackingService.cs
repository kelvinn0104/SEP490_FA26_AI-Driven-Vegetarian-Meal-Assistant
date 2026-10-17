using Microsoft.EntityFrameworkCore;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;
using VeggieAI.Domain.Constants;
using VeggieAI.Domain.Entities;
using VeggieAI.Infrastructure.Common;
using VeggieAI.Infrastructure.Persistence;

namespace VeggieAI.Infrastructure.Services;

public class TrackingService : ITrackingService
{
    private readonly VeggieAiDbContext _db;
    public TrackingService(VeggieAiDbContext db) => _db = db;

    public async Task<MealLogDto> LogMealAsync(int userId, CreateMealLogRequest req, CancellationToken ct = default)
    {
        MealPlanItem? planItem = null;
        if (req.PlanItemId is not null)
        {
            planItem = await _db.MealPlanItems.Include(i => i.Plan)
                .FirstOrDefaultAsync(i => i.Id == req.PlanItemId && i.Plan.UserId == userId, ct)
                ?? throw AppException.NotFound("Món trong thực đơn");
        }
        var recipeId = req.RecipeId ?? planItem?.RecipeId
                       ?? throw new AppException("Cần RecipeId hoặc PlanItemId.");
        var recipe = await _db.Recipes.AsNoTracking().FirstOrDefaultAsync(r => r.Id == recipeId, ct)
                     ?? throw AppException.NotFound("Công thức");

        var servings = req.Servings ?? planItem?.Servings ?? 1;
        var log = new MealLog
        {
            UserId = userId,
            RecipeId = recipe.Id,
            PlanItemId = planItem?.Id,
            LogDate = req.LogDate ?? planItem?.PlanDate ?? Mappers.TodayVn(),
            MealType = req.MealType ?? planItem?.MealType ?? GuessMealType(),
            Servings = servings,
            KcalConsumed = Math.Round(recipe.KcalPerServing * servings, 2),
        };
        _db.MealLogs.Add(log);
        await _db.SaveChangesAsync(ct);
        return ToDto(log, recipe);
    }

    public async Task DeleteLogAsync(int userId, int logId, CancellationToken ct = default)
    {
        var log = await _db.MealLogs.FirstOrDefaultAsync(l => l.Id == logId && l.UserId == userId, ct)
                  ?? throw AppException.NotFound("Nhật ký bữa ăn");
        _db.MealLogs.Remove(log);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<DailyNutritionDto> GetDailyAsync(int userId, DateOnly date, CancellationToken ct = default)
    {
        var logs = await _db.MealLogs.AsNoTracking().Include(l => l.Recipe)
            .Where(l => l.UserId == userId && l.LogDate == date).OrderBy(l => l.Id).ToListAsync(ct);
        var profile = await _db.HealthProfiles.AsNoTracking().FirstOrDefaultAsync(h => h.UserId == userId, ct);
        var activity = await _db.ActivityData.AsNoTracking().FirstOrDefaultAsync(a => a.UserId == userId && a.ActivityDate == date, ct);

        var logDtos = logs.Select(l => ToDto(l, l.Recipe)).ToList();
        var consumed = logDtos.Aggregate(NutrientAmountsDto.Zero, (a, l) => a.Add(l.Nutrition)).Rounded();
        var target = profile?.Targets() ?? NutrientAmountsDto.Zero;
        var burned = activity?.KcalBurned ?? 0;

        return new DailyNutritionDto(date, consumed, target, burned, activity?.Steps ?? 0,
            consumed.Kcal - burned, logDtos, BuildAlerts(consumed, target, date == Mappers.TodayVn()));
    }

    public async Task<IReadOnlyList<NutritionTrendPointDto>> GetTrendAsync(int userId, DateOnly from, DateOnly to, CancellationToken ct = default)
    {
        if (to < from) (from, to) = (to, from);
        if (to.DayNumber - from.DayNumber > 92) from = to.AddDays(-92);

        var rows = await _db.MealLogs.AsNoTracking().Where(l => l.UserId == userId && l.LogDate >= from && l.LogDate <= to)
            .GroupBy(l => l.LogDate)
            .Select(g => new
            {
                Date = g.Key,
                Kcal = g.Sum(l => l.KcalConsumed),
                Protein = g.Sum(l => l.Recipe.ProteinG * l.Servings),
                Iron = g.Sum(l => l.Recipe.IronMg * l.Servings),
                B12 = g.Sum(l => l.Recipe.B12Mcg * l.Servings),
            }).ToListAsync(ct);
        var burned = await _db.ActivityData.AsNoTracking().Where(a => a.UserId == userId && a.ActivityDate >= from && a.ActivityDate <= to)
            .ToDictionaryAsync(a => a.ActivityDate, a => a.KcalBurned, ct);
        var target = await _db.HealthProfiles.Where(h => h.UserId == userId).Select(h => h.DailyKcalTarget).FirstOrDefaultAsync(ct) ?? 0;

        var map = rows.ToDictionary(r => r.Date);
        var result = new List<NutritionTrendPointDto>();
        for (var d = from; d <= to; d = d.AddDays(1))
        {
            map.TryGetValue(d, out var r);
            result.Add(new NutritionTrendPointDto(d, Math.Round(r?.Kcal ?? 0, 1), Math.Round(r?.Protein ?? 0, 1),
                Math.Round(r?.Iron ?? 0, 2), Math.Round(r?.B12 ?? 0, 2), target, burned.GetValueOrDefault(d)));
        }
        return result;
    }

    public async Task<ActivityDataDto> UpsertActivityAsync(int userId, ActivityDataRequest req, CancellationToken ct = default)
    {
        var a = await _db.ActivityData.FirstOrDefaultAsync(x => x.UserId == userId && x.ActivityDate == req.ActivityDate, ct);
        if (a is null)
        {
            a = new ActivityData { UserId = userId, ActivityDate = req.ActivityDate };
            _db.ActivityData.Add(a);
        }
        a.KcalBurned = req.KcalBurned;
        a.Steps = req.Steps;
        a.SyncedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return new ActivityDataDto(a.Id, a.ActivityDate, a.KcalBurned, a.Steps, a.SyncedAt);
    }

    /// <summary>Rule-based imbalance detection (FR6.5): vegetarians are most at risk for protein, iron, B12, calcium, zinc.</summary>
    private static List<NutritionAlertDto> BuildAlerts(NutrientAmountsDto c, NutrientAmountsDto t, bool isToday)
    {
        var alerts = new List<NutritionAlertDto>();
        if (t.Kcal == 0) return alerts;
        // for today the day is not over yet -> only warn when clearly low in the evening
        var minRatio = isToday && DateTime.UtcNow.AddHours(7).Hour < 19 ? 0m : 0.7m;

        void Check(string name, decimal consumed, decimal target, string unit, string tip)
        {
            if (target <= 0) return;
            var pct = Math.Round(consumed / target * 100, 0);
            if (minRatio > 0 && consumed < target * minRatio)
                alerts.Add(new(name, consumed, target, pct, pct < 40 ? "high" : "medium",
                    $"{name} mới đạt {pct}% ({consumed:0.#}/{target:0.#} {unit}). {tip}"));
        }

        Check("Protein", c.ProteinG, t.ProteinG, "g", "Bổ sung đậu phụ, đậu lăng, tempeh hoặc sữa đậu nành.");
        Check("Sắt", c.IronMg, t.IronMg, "mg", "Ăn rau lá xanh đậm, đậu, kết hợp vitamin C (cam, ổi) để tăng hấp thu.");
        Check("Vitamin B12", c.B12Mcg, t.B12Mcg, "mcg", "Dùng sữa hạt/ngũ cốc tăng cường B12 hoặc men dinh dưỡng; cân nhắc viên bổ sung.");
        Check("Canxi", c.CalciumMg, t.CalciumMg, "mg", "Đậu phụ đông bằng canxi, cải xanh, mè, sữa đậu nành tăng cường.");
        Check("Kẽm", c.ZincMg, t.ZincMg, "mg", "Hạt bí, hạt điều, đậu gà, yến mạch.");
        if (c.Kcal > t.Kcal * 1.15m)
            alerts.Add(new("Calo", c.Kcal, t.Kcal, Math.Round(c.Kcal / t.Kcal * 100, 0), "medium",
                $"Đã vượt {Math.Round(c.Kcal / t.Kcal * 100 - 100, 0)}% mục tiêu calo trong ngày."));
        return alerts;
    }

    private static string GuessMealType()
    {
        var h = DateTime.UtcNow.AddHours(7).Hour;
        return h switch { < 10 => MealTypes.Breakfast, < 14 => MealTypes.Lunch, < 17 => MealTypes.Snack, _ => MealTypes.Dinner };
    }

    private static MealLogDto ToDto(MealLog l, Recipe r) =>
        new(l.Id, l.LogDate, l.MealType, r.Id, r.Title, l.Servings, l.KcalConsumed, l.PlanItemId, r.PerServing().Scale(l.Servings).Rounded());
}
