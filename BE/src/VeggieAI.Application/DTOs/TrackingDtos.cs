using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Application.DTOs;

public class CreateMealLogRequest
{
    /// <summary>Either RecipeId or PlanItemId (eat a meal from the plan).</summary>
    public int? RecipeId { get; set; }
    public int? PlanItemId { get; set; }
    public DateOnly? LogDate { get; set; }
    [RegularExpression("^(breakfast|lunch|dinner|snack)$")] public string? MealType { get; set; }
    [Range(0.25, 10)] public decimal? Servings { get; set; }
}

public record MealLogDto(int Id, DateOnly LogDate, string MealType, int RecipeId, string RecipeTitle,
    decimal Servings, decimal KcalConsumed, int? PlanItemId, NutrientAmountsDto Nutrition);

public record NutritionAlertDto(string Nutrient, decimal Consumed, decimal Target, decimal Percent, string Level, string Message);

public record DailyNutritionDto(DateOnly Date, NutrientAmountsDto Consumed, NutrientAmountsDto Target,
    decimal KcalBurned, int Steps, decimal NetKcal, IReadOnlyList<MealLogDto> Logs,
    IReadOnlyList<NutritionAlertDto> Alerts);

public record NutritionTrendPointDto(DateOnly Date, decimal Kcal, decimal ProteinG, decimal IronMg, decimal B12Mcg,
    decimal KcalTarget, decimal KcalBurned);

public class ActivityDataRequest
{
    [Required] public DateOnly ActivityDate { get; set; }
    [Range(0, 20000)] public decimal KcalBurned { get; set; }
    [Range(0, 200000)] public int Steps { get; set; }
}

public record ActivityDataDto(int Id, DateOnly ActivityDate, decimal KcalBurned, int Steps, DateTime SyncedAt);
