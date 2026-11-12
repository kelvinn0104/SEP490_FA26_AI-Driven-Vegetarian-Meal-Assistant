using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

/// <summary>Ghi nhận bữa đã ăn: gửi PlanItemId (món trong thực đơn) hoặc RecipeId (+ mealType, servings, logDate).</summary>
public class LogMealRequest
{
    public int? PlanItemId { get; set; }
    public int? RecipeId { get; set; }

    [RegularExpression("^(breakfast|lunch|dinner|snack)$", ErrorMessage = "mealType phải là breakfast, lunch, dinner hoặc snack.")]
    public string? MealType { get; set; }

    [Range(0.25, 10.0, ErrorMessage = "servings phải trong khoảng 0.25–10.")]
    public decimal? Servings { get; set; }

    public DateOnly? LogDate { get; set; }
}

public class UpsertActivityRequest
{
    public DateOnly? ActivityDate { get; set; }

    [Range(0.0, 10000.0, ErrorMessage = "kcalBurned phải trong khoảng 0–10000.")]
    public decimal KcalBurned { get; set; }

    [Range(0, 200000, ErrorMessage = "steps phải trong khoảng 0–200000.")]
    public int Steps { get; set; }
}

public record MealLogDto(int Id, DateOnly LogDate, string MealType, int RecipeId, string RecipeTitle,
    decimal Servings, decimal KcalConsumed, int? PlanItemId, NutrientAmountsDto Nutrition);

/// <summary>level: medium (&lt;75% mục tiêu) | high (&lt;50%).</summary>
public record NutritionAlertDto(string Nutrient, decimal Consumed, decimal Target, int Percent, string Level, string Message);

public record DailyNutritionDto(DateOnly Date, NutrientAmountsDto Consumed, NutrientAmountsDto Target,
    decimal KcalBurned, int Steps, decimal NetKcal, IReadOnlyList<MealLogDto> Logs, IReadOnlyList<NutritionAlertDto> Alerts);

public record TrendPointDto(DateOnly Date, decimal Kcal, decimal ProteinG, decimal IronMg, decimal B12Mcg,
    decimal KcalTarget, decimal KcalBurned);

public record ActivityDataDto(int Id, DateOnly ActivityDate, decimal KcalBurned, int Steps, DateTime SyncedAt);
