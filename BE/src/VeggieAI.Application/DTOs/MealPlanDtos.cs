using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Application.DTOs;

public class GenerateMealPlanRequest
{
    /// <summary>Defaults to tomorrow.</summary>
    public DateOnly? StartDate { get; set; }
    [Range(1, 14)] public int Days { get; set; } = 7;
    /// <summary>Defaults to breakfast, lunch, dinner (+ snack if omitted? no: only these three).</summary>
    public List<string>? MealTypes { get; set; }
    /// <summary>Ingredients the user already has (from the fridge / a photo scan) — the AI prioritises them.</summary>
    public List<int>? PreferredIngredientIds { get; set; }
    /// <summary>Use ingredients detected by a previous photo scan.</summary>
    public int? ScanId { get; set; }
    /// <summary>Free text, e.g. "ít dầu mỡ, thích món Việt, không ăn cay".</summary>
    [MaxLength(500)] public string? Note { get; set; }
    /// <summary>Override health goal from profile (loss | gain | maintain).</summary>
    [RegularExpression("^(loss|gain|maintain)$")] public string? HealthGoal { get; set; }
}

public class CreateMealPlanRequest
{
    [Required] public DateOnly StartDate { get; set; }
    [Required] public DateOnly EndDate { get; set; }
    [RegularExpression("^(loss|gain|maintain)$")] public string? HealthGoal { get; set; }
    public List<MealPlanItemRequest> Items { get; set; } = new();
}

public class MealPlanItemRequest
{
    [Required] public int RecipeId { get; set; }
    [Required] public DateOnly PlanDate { get; set; }
    [Required, RegularExpression("^(breakfast|lunch|dinner|snack)$")] public string MealType { get; set; } = "";
    [Range(0.25, 10)] public decimal Servings { get; set; } = 1;
}

public class UpdateMealPlanItemRequest
{
    public int? RecipeId { get; set; }
    [Range(0.25, 10)] public decimal? Servings { get; set; }
}

public class SwapMealRequest
{
    /// <summary>Optional: what the user wants instead ("món nước", "nhiều đạm hơn"...).</summary>
    [MaxLength(300)] public string? Reason { get; set; }
}

public class UpdatePlanStatusRequest
{
    [Required, RegularExpression("^(draft|active|completed|cancelled)$")] public string Status { get; set; } = "";
}

public record MealPlanItemDto(int Id, DateOnly PlanDate, string MealType, decimal Servings,
    int RecipeId, string RecipeTitle, string? RecipeImageUrl, NutrientAmountsDto Nutrition);

public record MealPlanDayDto(DateOnly Date, IReadOnlyList<MealPlanItemDto> Meals, NutrientAmountsDto Total,
    decimal KcalTarget, decimal KcalDeviationPercent);

public record MealPlanSummaryDto(int Id, DateOnly StartDate, DateOnly EndDate, string HealthGoal, string Status,
    DateTime CreatedAt, int ItemCount);

public record MealPlanDetailDto(int Id, DateOnly StartDate, DateOnly EndDate, string HealthGoal, string Status,
    DateTime CreatedAt, NutrientAmountsDto DailyTargets, IReadOnlyList<MealPlanDayDto> Days, bool HasShoppingList);

/// <summary>Result of the AI planner (plan + explanation + how it was produced).</summary>
public record GeneratedMealPlanDto(MealPlanDetailDto Plan, string GeneratedBy, string? AiNotes,
    int Attempts, IReadOnlyList<string> ValidationWarnings);

public record ShoppingListItemDto(int Id, int IngredientId, string IngredientName, decimal QuantityG, bool IsBought);

public record ShoppingListDto(int Id, int PlanId, DateTime CreatedAt, IReadOnlyList<ShoppingListItemDto> Items,
    int BoughtCount, int TotalCount);

public class ToggleBoughtRequest
{
    public bool IsBought { get; set; }
}
