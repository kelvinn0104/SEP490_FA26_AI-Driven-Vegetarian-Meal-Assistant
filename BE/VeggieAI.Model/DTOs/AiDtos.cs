using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

// ============================================================
// AI DTOs - Ported from TuanHMSE151471 branch
// ============================================================

// ---------------- AI Config ----------------

public class AiOptions
{
    public const string Section = "Ai";
    public string Provider { get; set; } = "Gemini";
    public int TimeoutSeconds { get; set; } = 90;
    public GeminiOptions Gemini { get; set; } = new();
    public OpenAiOptions OpenAI { get; set; } = new();
}

public class GeminiOptions
{
    public string ApiKey { get; set; } = "";
    public string BaseUrl { get; set; } = "https://generativelanguage.googleapis.com/v1beta";
    public string Model { get; set; } = "gemini-3.8-flash";
    public string VisionModel { get; set; } = "gemini-3.8-flash";
    public int ThinkingBudget { get; set; } = 0;
}

public class OpenAiOptions
{
    public string ApiKey { get; set; } = "";
    public string BaseUrl { get; set; } = "https://api.openai.com/v1";
    public string Model { get; set; } = "gpt-4o-mini";
    public string VisionModel { get; set; } = "gpt-4o-mini";
}

// ---------------- Shared ----------------

public class PageQuery
{
    private int _page = 1, _pageSize = 20;
    public int Page { get => _page; set => _page = value < 1 ? 1 : value; }
    public int PageSize { get => _pageSize; set => _pageSize = value is < 1 or > 100 ? 20 : value; }
    public int Skip => (Page - 1) * PageSize;
}

// ---------------- AppException ----------------

/// <summary>Business error that is translated to an HTTP status code by the API middleware.</summary>
public class AppException : Exception
{
    public int StatusCode { get; }
    public AppException(string message, int statusCode = 400) : base(message) => StatusCode = statusCode;
    public static AppException NotFound(string what) => new($"{what} không tồn tại.", 404);
    public static AppException Forbidden(string message = "Bạn không có quyền thực hiện thao tác này.") => new(message, 403);
    public static AppException Conflict(string message) => new(message, 409);
    public static AppException Unauthorized(string message) => new(message, 401);
}

// ---------------- LLM ----------------

public record LlmImage(byte[] Data, string MimeType);

public class LlmRequest
{
    public string Task { get; set; } = "";
    public int? UserId { get; set; }
    public double Temperature { get; set; } = 0.7;
    public int MaxOutputTokens { get; set; } = 2048;
    public string? SystemPrompt { get; set; }
    public List<LlmMessage> Messages { get; set; } = new();
    public List<LlmImage> Images { get; set; } = new();
    public bool JsonOutput { get; set; }
}

public record LlmMessage(string Role, string Content)
{
    public static LlmMessage User(string content) => new("user", content);
    public static LlmMessage Assistant(string content) => new("assistant", content);
    public static LlmMessage System(string content) => new("system", content);
}

public record LlmResponse(string Text, string Provider, string Model, int? TokensUsed, int LatencyMs);

// ---------------- Vision / Ingredient scan ----------------

public class DetectedItemDto
{
    public int? IngredientId { get; set; }
    public string Name { get; set; } = "";
    public string? NameVi { get; set; }
    public double Confidence { get; set; }
    public string Freshness { get; set; } = "unknown";
    public decimal? EstimatedQuantityG { get; set; }
}

public record ScanResultDto(
    int ScanId, string ImageUrl, DateTime CreatedAt,
    string ImageType, string? DishName, string? DishDescription,
    NutrientAmountsDto? EstimatedDishNutrition,
    IReadOnlyList<DetectedItemDto> DetectedItems,
    IReadOnlyList<RecipeSuggestionDto> SuggestedRecipes,
    SuggestedMenuDto? SuggestedMenu, string? Message);

public record SuggestedMenuDto(IReadOnlyList<SuggestedMenuMealDto> Meals, NutrientAmountsDto Total, decimal KcalTarget, string? Notes);
public record SuggestedMenuMealDto(string MealType, int RecipeId, string RecipeTitle, decimal Servings, NutrientAmountsDto Nutrition, string? Reason);

public class ConfirmScanRequest
{
    [Required] public List<int> IngredientIds { get; set; } = new();
}

public record ScanSummaryDto(int Id, string ImageUrl, DateTime CreatedAt, int ItemCount, IReadOnlyList<string> ItemNames);

// ---------------- Chat ----------------

public class CreateChatSessionRequest
{
    public int? PlanId { get; set; }
}

public class SendChatMessageRequest
{
    [Required, MaxLength(2000)] public string Content { get; set; } = "";
}

public record ChatSessionDto(int Id, int? PlanId, DateTime CreatedAt, string? LastMessage, int MessageCount);
public record ChatMessageDto(int Id, string Sender, string Content, DateTime CreatedAt);
public record ChatReplyDto(ChatMessageDto UserMessage, ChatMessageDto AiMessage);

// ---------------- Nutrient amounts (shared with ProfileDtos) ----------------

public record NutrientAmountsDto(
    decimal Kcal, decimal ProteinG, decimal CarbG, decimal FatG,
    decimal IronMg, decimal B12Mcg, decimal CalciumMg, decimal ZincMg)
{
    public static readonly NutrientAmountsDto Zero = new(0, 0, 0, 0, 0, 0, 0, 0);
    public NutrientAmountsDto Add(NutrientAmountsDto o) => new(Kcal + o.Kcal, ProteinG + o.ProteinG, CarbG + o.CarbG,
        FatG + o.FatG, IronMg + o.IronMg, B12Mcg + o.B12Mcg, CalciumMg + o.CalciumMg, ZincMg + o.ZincMg);
    public NutrientAmountsDto Scale(decimal f) => new(Kcal * f, ProteinG * f, CarbG * f, FatG * f,
        IronMg * f, B12Mcg * f, CalciumMg * f, ZincMg * f);
    public NutrientAmountsDto Rounded() => new(Math.Round(Kcal, 1), Math.Round(ProteinG, 1), Math.Round(CarbG, 1),
        Math.Round(FatG, 1), Math.Round(IronMg, 2), Math.Round(B12Mcg, 2), Math.Round(CalciumMg, 1), Math.Round(ZincMg, 2));
}

public record RecipeSuggestionDto(int RecipeId, string Title, string? ImageUrl, decimal KcalPerServing, string? Reason);

// ---------------- Meal Plan AI & DTOs ----------------

public class GenerateMealPlanRequest
{
    public DateOnly? StartDate { get; set; }
    [Range(1, 14)] public int Days { get; set; } = 7;
    public List<string>? MealTypes { get; set; }
    public List<int>? PreferredIngredientIds { get; set; }
    public int? ScanId { get; set; }
    [MaxLength(500)] public string? Note { get; set; }
    [RegularExpression("^(loss|gain|maintain)$")] public string? HealthGoal { get; set; }
}

public class SwapMealRequest
{
    [MaxLength(300)] public string? Reason { get; set; }
}

public record MealPlanItemDto(int Id, DateOnly PlanDate, string MealType, decimal Servings,
    int RecipeId, string RecipeTitle, string? RecipeImageUrl, NutrientAmountsDto Nutrition);

public record MealPlanDayDto(DateOnly Date, IReadOnlyList<MealPlanItemDto> Meals, NutrientAmountsDto Total,
    decimal KcalTarget, decimal KcalDeviationPercent);

public record MealPlanSummaryDto(int Id, DateOnly StartDate, DateOnly EndDate, string HealthGoal, string Status,
    DateTime CreatedAt, int ItemCount);

public record MealPlanDetailDto(int Id, DateOnly StartDate, DateOnly EndDate, string HealthGoal, string Status,
    DateTime CreatedAt, NutrientAmountsDto DailyTargets, IReadOnlyList<MealPlanDayDto> Days, bool HasShoppingList);

public record GeneratedMealPlanDto(MealPlanDetailDto Plan, string GeneratedBy, string? AiNotes,
    int Attempts, IReadOnlyList<string> ValidationWarnings);
