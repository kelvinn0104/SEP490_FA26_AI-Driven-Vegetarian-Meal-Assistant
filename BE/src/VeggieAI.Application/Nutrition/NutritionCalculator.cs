using VeggieAI.Domain.Constants;

namespace VeggieAI.Application.Nutrition;

public record GoalRule(decimal KcalAdjustmentPercent, decimal ProteinGPerKg, decimal CarbPercent, decimal FatPercent);
public record MicroRule(decimal IronMg, decimal B12Mcg, decimal CalciumMg, decimal ZincMg);

public record NutritionTargets(
    decimal Bmi, decimal Bmr, decimal Tdee, decimal DailyKcal,
    decimal ProteinG, decimal CarbG, decimal FatG,
    decimal IronMg, decimal B12Mcg, decimal CalciumMg, decimal ZincMg);

/// <summary>
/// Business rules (not AI): BMI, BMR (Mifflin-St Jeor), TDEE and macro/micro targets.
/// Pure function so it can be unit-tested and reused by the meal planner validator.
/// </summary>
public static class NutritionCalculator
{
    public static int AgeAt(DateOnly dob, DateOnly today)
    {
        var age = today.Year - dob.Year;
        if (dob > today.AddYears(-age)) age--;
        return age;
    }

    public static NutritionTargets Calculate(string gender, int age, decimal heightCm, decimal weightKg,
        string activityLevel, GoalRule goal, MicroRule micro)
    {
        if (!ActivityLevels.Factors.TryGetValue(activityLevel, out var factor))
            throw new ArgumentException($"ActivityLevel không hợp lệ: {activityLevel}");

        var hM = heightCm / 100m;
        var bmi = weightKg / (hM * hM);

        // Mifflin-St Jeor: 10W + 6.25H - 5A + s  (s = +5 male, -161 female)
        var bmr = 10m * weightKg + 6.25m * heightCm - 5m * age + (gender == Genders.Male ? 5m : -161m);
        var tdee = bmr * factor;
        var kcal = tdee * (1 + goal.KcalAdjustmentPercent / 100m);
        // never go below a safe floor
        kcal = Math.Max(kcal, gender == Genders.Male ? 1500m : 1200m);

        var protein = goal.ProteinGPerKg * weightKg;
        var carb = kcal * goal.CarbPercent / 100m / 4m;
        var fat = kcal * goal.FatPercent / 100m / 9m;

        return new NutritionTargets(
            R(bmi), R(bmr), R(tdee), R(kcal), R(protein), R(carb), R(fat),
            micro.IronMg, micro.B12Mcg, micro.CalciumMg, micro.ZincMg);
    }

    public static string BmiCategory(decimal bmi) => bmi switch
    {
        < 18.5m => "underweight",
        < 23m => "normal",          // WHO Asian cut-off
        < 25m => "overweight",
        _ => "obese",
    };

    private static decimal R(decimal v) => Math.Round(v, 2);
}
