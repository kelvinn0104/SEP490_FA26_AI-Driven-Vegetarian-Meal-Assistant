using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Application.DTOs;

// ---------------- Vision / Ingredient scan ----------------

/// <summary>Stored in IngredientScan.DetectedItems (jsonb).</summary>
public class DetectedItemDto
{
    public int? IngredientId { get; set; }
    public string Name { get; set; } = "";
    public string? NameVi { get; set; }
    public double Confidence { get; set; }
    /// <summary>fresh | use_soon | spoiled | unknown</summary>
    public string Freshness { get; set; } = "unknown";
    public decimal? EstimatedQuantityG { get; set; }
}

public record ScanResultDto(
    int ScanId, string ImageUrl, DateTime CreatedAt,
    /// <summary>ingredients | dish | mixed | unknown</summary>
    string ImageType, string? DishName, string? DishDescription,
    NutrientAmountsDto? EstimatedDishNutrition,
    IReadOnlyList<DetectedItemDto> DetectedItems,
    IReadOnlyList<RecipeSuggestionDto> SuggestedRecipes,
    SuggestedMenuDto? SuggestedMenu, string? Message);

/// <summary>A one-day menu built from the recognised ingredients/dish.</summary>
public record SuggestedMenuDto(IReadOnlyList<SuggestedMenuMealDto> Meals, NutrientAmountsDto Total, decimal KcalTarget, string? Notes);

public record SuggestedMenuMealDto(string MealType, int RecipeId, string RecipeTitle, decimal Servings, NutrientAmountsDto Nutrition, string? Reason);

public class ConfirmScanRequest
{
    /// <summary>User-corrected list of ingredient ids (fallback when AI is wrong / nothing detected).</summary>
    [Required] public List<int> IngredientIds { get; set; } = new();
}

public record ScanSummaryDto(int Id, string ImageUrl, DateTime CreatedAt, int ItemCount, IReadOnlyList<string> ItemNames);

// ---------------- Chat ----------------

public class CreateChatSessionRequest
{
    /// <summary>Attach a meal plan to ask the AI to adjust it.</summary>
    public int? PlanId { get; set; }
}

public class SendChatMessageRequest
{
    [Required, MaxLength(2000)] public string Content { get; set; } = "";
}

public record ChatSessionDto(int Id, int? PlanId, DateTime CreatedAt, string? LastMessage, int MessageCount);
public record ChatMessageDto(int Id, string Sender, string Content, DateTime CreatedAt);
public record ChatReplyDto(ChatMessageDto UserMessage, ChatMessageDto AiMessage);
