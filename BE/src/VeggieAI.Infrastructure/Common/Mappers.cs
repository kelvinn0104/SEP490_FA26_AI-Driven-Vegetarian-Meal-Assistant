using Microsoft.EntityFrameworkCore;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Nutrition;
using VeggieAI.Domain.Entities;
using VeggieAI.Infrastructure.Persistence;

namespace VeggieAI.Infrastructure.Common;

public static class Mappers
{
    public static NutrientAmountsDto PerServing(this Recipe r) =>
        new(r.KcalPerServing, r.ProteinG, r.CarbG, r.FatG, r.IronMg, r.B12Mcg, r.CalciumMg, r.ZincMg);

    public static NutrientAmountsDto Targets(this HealthProfile h) =>
        new(h.DailyKcalTarget ?? 0, h.ProteinTargetG ?? 0, h.CarbTargetG ?? 0, h.FatTargetG ?? 0,
            h.IronTargetMg ?? 0, h.B12TargetMcg ?? 0, h.CalciumTargetMg ?? 0, h.ZincTargetMg ?? 0);

    public static IngredientDto ToDto(this Ingredient i) =>
        new(i.Id, i.Name, i.KcalPer100g, i.ProteinPer100g, i.CarbPer100g, i.FatPer100g, i.IronPer100g,
            i.B12Per100g, i.CalciumPer100g, i.ZincPer100g, i.DataSource, i.Allergies.Select(a => a.Name).ToList());

    public static DateOnly TodayVn() => DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7));
}

public static class DbHelpers
{
    /// <summary>Ids of ingredients that contain any of the user's allergens.</summary>
    public static async Task<HashSet<int>> AllergenIngredientIdsAsync(this VeggieAiDbContext db, int userId, CancellationToken ct)
    {
        var ids = await db.Users.Where(u => u.Id == userId)
            .SelectMany(u => u.Allergies).SelectMany(a => a.Ingredients).Select(i => i.Id)
            .Distinct().ToListAsync(ct);
        return ids.ToHashSet();
    }

    /// <summary>Recalculates and stores the nutrition targets of a profile from GoalStandard + NutrientStandard.</summary>
    public static async Task ApplyTargetsAsync(this VeggieAiDbContext db, HealthProfile p, CancellationToken ct)
    {
        var t = await db.CalculateTargetsAsync(p.Gender, p.DateOfBirth, p.HeightCm, p.WeightKg, p.ActivityLevel, p.HealthGoal, ct);
        p.Bmi = t.Bmi; p.Bmr = t.Bmr; p.Tdee = t.Tdee; p.DailyKcalTarget = t.DailyKcal;
        p.ProteinTargetG = t.ProteinG; p.CarbTargetG = t.CarbG; p.FatTargetG = t.FatG;
        p.IronTargetMg = t.IronMg; p.B12TargetMcg = t.B12Mcg; p.CalciumTargetMg = t.CalciumMg; p.ZincTargetMg = t.ZincMg;
    }

    public static async Task<NutritionTargets> CalculateTargetsAsync(this VeggieAiDbContext db, string gender, DateOnly dob,
        decimal heightCm, decimal weightKg, string activity, string goal, CancellationToken ct)
    {
        var age = NutritionCalculator.AgeAt(dob, Mappers.TodayVn());
        var g = await db.GoalStandards.AsNoTracking().FirstOrDefaultAsync(x => x.HealthGoal == goal, ct);
        var goalRule = g is null
            ? new GoalRule(0, 1.0m, 50, 30)
            : new GoalRule(g.KcalAdjustmentPercent, g.ProteinGPerKg, g.CarbPercent, g.FatPercent);

        var standards = await db.NutrientStandards.AsNoTracking().Where(x => x.Gender == gender).ToListAsync(ct);
        var s = standards.FirstOrDefault(x => age >= x.AgeFrom && age <= x.AgeTo)
                ?? standards.OrderBy(x => Math.Abs(x.AgeFrom - age)).FirstOrDefault();
        var micro = s is null
            ? new MicroRule(gender == "male" ? 14.4m : 32.4m, 2.4m, 1000, gender == "male" ? 11 : 8)
            : new MicroRule(s.IronMg, s.B12Mcg, s.CalciumMg, s.ZincMg);

        return NutritionCalculator.Calculate(gender, age, heightCm, weightKg, activity, goalRule, micro);
    }
}
