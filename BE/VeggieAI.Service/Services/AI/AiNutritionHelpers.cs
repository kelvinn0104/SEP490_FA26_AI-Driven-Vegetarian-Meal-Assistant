using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Data;

namespace VeggieAI.Service.Services.AI;

public static class AiModelTypes
{
    public const string MealPlanner = "meal_planner";
    public const string Chatbot = "chatbot";
    public const string Vision = "vision";
}

public static class AiMealTypes
{
    public const string Breakfast = "breakfast";
    public const string Lunch = "lunch";
    public const string Dinner = "dinner";
    public const string Snack = "snack";
    public static readonly string[] All = { Breakfast, Lunch, Dinner, Snack };

    public static readonly IReadOnlyDictionary<string, decimal> KcalShare = new Dictionary<string, decimal>
    {
        [Breakfast] = 0.25m, [Lunch] = 0.35m, [Dinner] = 0.30m, [Snack] = 0.10m,
    };
}

public record GoalRule(decimal KcalAdjustmentPercent, decimal ProteinGPerKg, decimal CarbPercent, decimal FatPercent);
public record MicroRule(decimal IronMg, decimal B12Mcg, decimal CalciumMg, decimal ZincMg);

public record NutritionTargets(
    decimal Bmi, decimal Bmr, decimal Tdee, decimal DailyKcal,
    decimal ProteinG, decimal CarbG, decimal FatG,
    decimal IronMg, decimal B12Mcg, decimal CalciumMg, decimal ZincMg);

public static class NutritionCalculator
{
    public static readonly IReadOnlyDictionary<string, decimal> ActivityFactors = new Dictionary<string, decimal>
    {
        ["sedentary"] = 1.2m,
        ["light"] = 1.375m,
        ["moderate"] = 1.55m,
        ["active"] = 1.725m,
        ["very_active"] = 1.9m,
    };

    public static int AgeAt(DateOnly dob, DateOnly today)
    {
        var age = today.Year - dob.Year;
        if (dob > today.AddYears(-age)) age--;
        return age;
    }

    public static NutritionTargets Calculate(string gender, int age, decimal heightCm, decimal weightKg,
        string activityLevel, GoalRule goal, MicroRule micro)
    {
        if (!ActivityFactors.TryGetValue(activityLevel, out var factor))
            factor = 1.2m;

        var hM = heightCm / 100m;
        var bmi = hM > 0 ? weightKg / (hM * hM) : 22m;

        // Mifflin-St Jeor: 10W + 6.25H - 5A + s  (s = +5 male, -161 female)
        var bmr = 10m * weightKg + 6.25m * heightCm - 5m * age + (gender.Equals("male", StringComparison.OrdinalIgnoreCase) ? 5m : -161m);
        var tdee = bmr * factor;
        var kcal = tdee * (1 + goal.KcalAdjustmentPercent / 100m);
        kcal = Math.Max(kcal, gender.Equals("male", StringComparison.OrdinalIgnoreCase) ? 1500m : 1200m);

        var protein = goal.ProteinGPerKg * weightKg;
        var carb = kcal * goal.CarbPercent / 100m / 4m;
        var fat = kcal * goal.FatPercent / 100m / 9m;

        return new NutritionTargets(
            Math.Round(bmi, 2), Math.Round(bmr, 2), Math.Round(tdee, 2), Math.Round(kcal, 2),
            Math.Round(protein, 2), Math.Round(carb, 2), Math.Round(fat, 2),
            micro.IronMg, micro.B12Mcg, micro.CalciumMg, micro.ZincMg);
    }
}

public static class AiMappers
{
    public static DateOnly TodayVn() => DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7));

    public static NutrientAmountsDto PerServing(this Recipe r) =>
        new(r.KcalPerServing, r.ProteinG, r.CarbG, r.FatG, r.IronMg, r.B12Mcg, r.CalciumMg, r.ZincMg);

    public static NutrientAmountsDto Targets(this HealthProfile h) =>
        new(h.DailyKcalTarget ?? 0, h.ProteinTargetG ?? 0, h.CarbTargetG ?? 0, h.FatTargetG ?? 0,
            h.IronTargetMg ?? 0, h.B12TargetMcg ?? 0, h.CalciumTargetMg ?? 0, h.ZincTargetMg ?? 0);

    public static async Task<HashSet<int>> AllergenIngredientIdsAsync(this VeggieAIDbContext db, int userId, CancellationToken ct)
    {
        var allergyIds = await db.UserAllergies
            .Where(ua => ua.UserId == userId)
            .Select(ua => ua.AllergyId)
            .ToListAsync(ct);

        if (allergyIds.Count == 0) return new HashSet<int>();

        var ingredientIds = await db.IngredientAllergies
            .Where(ia => allergyIds.Contains(ia.AllergyId))
            .Select(ia => ia.IngredientId)
            .Distinct()
            .ToListAsync(ct);

        return ingredientIds.ToHashSet();
    }
}

/// <summary>
/// Tính BMI/BMR/TDEE và mục tiêu dinh dưỡng/ngày từ chỉ số cơ thể, dùng bảng GoalStandard + NutrientStandard trong DB.
/// Dùng chung cho Hồ sơ sức khỏe và AI Meal Planner.
/// </summary>
public static class NutritionTargetsResolver
{
    public static async Task<NutritionTargets> ResolveAsync(VeggieAIDbContext db, string gender, DateOnly dateOfBirth,
        decimal heightCm, decimal weightKg, string activityLevel, string healthGoal, CancellationToken ct)
    {
        var age = NutritionCalculator.AgeAt(dateOfBirth, AiMappers.TodayVn());
        var g = await db.GoalStandards.AsNoTracking().FirstOrDefaultAsync(x => x.HealthGoal == healthGoal, ct);
        var goalRule = g is null
            ? new GoalRule(0, 1.0m, 50, 30)
            : new GoalRule(g.KcalAdjustmentPercent, g.ProteinGPerKg, g.CarbPercent, g.FatPercent);

        var standards = await db.NutrientStandards.AsNoTracking().Where(x => x.Gender == gender).ToListAsync(ct);
        var s = standards.FirstOrDefault(x => age >= x.AgeFrom && age <= x.AgeTo)
                ?? standards.OrderBy(x => Math.Abs(x.AgeFrom - age)).FirstOrDefault();
        var micro = s is null
            ? new MicroRule(gender == "male" ? 14.4m : 32.4m, 2.4m, 1000, gender == "male" ? 11 : 8)
            : new MicroRule(s.IronMg, s.B12Mcg, s.CalciumMg, s.ZincMg);

        return NutritionCalculator.Calculate(gender, age, heightCm, weightKg, activityLevel, goalRule, micro);
    }

    public static NutrientAmountsDto ToAmounts(this NutritionTargets t) =>
        new(t.DailyKcal, t.ProteinG, t.CarbG, t.FatG, t.IronMg, t.B12Mcg, t.CalciumMg, t.ZincMg);

    /// <summary>Phân loại BMI theo ngưỡng châu Á (WHO 2004).</summary>
    public static string BmiCategory(decimal bmi) => bmi switch
    {
        < 18.5m => "underweight",
        < 23m => "normal",
        < 25m => "overweight",
        _ => "obese",
    };
}
