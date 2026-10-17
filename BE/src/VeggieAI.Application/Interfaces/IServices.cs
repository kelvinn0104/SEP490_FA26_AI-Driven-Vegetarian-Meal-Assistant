using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;

namespace VeggieAI.Application.Interfaces;

/// <summary>Id of the user from the JWT of the current request.</summary>
public interface ICurrentUser
{
    int? UserId { get; }
    int RequiredUserId { get; }
    string? Role { get; }
}

public interface IFileStorage
{
    /// <returns>Public relative URL, e.g. /uploads/scans/abc.jpg</returns>
    Task<string> SaveAsync(Stream content, string originalFileName, string folder, CancellationToken ct = default);
}

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest req, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest req, CancellationToken ct = default);
    Task<UserDto> GetMeAsync(int userId, CancellationToken ct = default);
    Task<UserDto> UpdateMeAsync(int userId, UpdateMeRequest req, CancellationToken ct = default);
    Task ChangePasswordAsync(int userId, ChangePasswordRequest req, CancellationToken ct = default);
}

public interface IHealthProfileService
{
    Task<HealthProfileDto?> GetAsync(int userId, CancellationToken ct = default);
    Task<HealthProfileDto> UpsertAsync(int userId, HealthProfileRequest req, CancellationToken ct = default);
    /// <summary>Preview targets without saving (used by the onboarding form).</summary>
    Task<NutrientAmountsDto> PreviewAsync(HealthProfileRequest req, CancellationToken ct = default);
    Task<IReadOnlyList<AllergyDto>> GetMyAllergiesAsync(int userId, CancellationToken ct = default);
    Task<IReadOnlyList<AllergyDto>> SetMyAllergiesAsync(int userId, List<int> allergyIds, CancellationToken ct = default);
}

public interface ICatalogService
{
    Task<IReadOnlyList<AllergyDto>> GetAllergiesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(string? type, CancellationToken ct = default);
    Task<PagedResult<IngredientDto>> GetIngredientsAsync(string? keyword, PageQuery page, CancellationToken ct = default);
    Task<IngredientDto> GetIngredientAsync(int id, CancellationToken ct = default);
}

public interface IRecipeService
{
    Task<PagedResult<RecipeSummaryDto>> SearchAsync(RecipeQuery query, int? userId, CancellationToken ct = default);
    Task<RecipeDetailDto> GetAsync(int id, int? userId, CancellationToken ct = default);
    Task<IReadOnlyList<RecipeSuggestionDto>> SuggestByIngredientsAsync(IReadOnlyCollection<int> ingredientIds, int? userId, int take = 10, CancellationToken ct = default);
    Task<PagedResult<RecipeSummaryDto>> GetFavoritesAsync(int userId, PageQuery page, CancellationToken ct = default);
    Task AddFavoriteAsync(int userId, int recipeId, CancellationToken ct = default);
    Task RemoveFavoriteAsync(int userId, int recipeId, CancellationToken ct = default);
}

public interface IMealPlanService
{
    Task<PagedResult<MealPlanSummaryDto>> GetMyPlansAsync(int userId, string? status, PageQuery page, CancellationToken ct = default);
    Task<MealPlanDetailDto> GetAsync(int userId, int planId, CancellationToken ct = default);
    Task<MealPlanDetailDto?> GetCurrentAsync(int userId, CancellationToken ct = default);
    Task<MealPlanDetailDto> CreateManualAsync(int userId, CreateMealPlanRequest req, CancellationToken ct = default);
    Task<MealPlanDetailDto> AddItemAsync(int userId, int planId, MealPlanItemRequest req, CancellationToken ct = default);
    Task<MealPlanDetailDto> UpdateItemAsync(int userId, int planId, int itemId, UpdateMealPlanItemRequest req, CancellationToken ct = default);
    Task<MealPlanDetailDto> RemoveItemAsync(int userId, int planId, int itemId, CancellationToken ct = default);
    Task<MealPlanDetailDto> UpdateStatusAsync(int userId, int planId, string status, CancellationToken ct = default);
    Task DeleteAsync(int userId, int planId, CancellationToken ct = default);
}

/// <summary>AI meal planner (LLM + rule-based validation + fallback).</summary>
public interface IAiMealPlanner
{
    Task<GeneratedMealPlanDto> GenerateAsync(int userId, GenerateMealPlanRequest req, CancellationToken ct = default);
    Task<GeneratedMealPlanDto> SwapItemAsync(int userId, int planId, int itemId, SwapMealRequest req, CancellationToken ct = default);
    /// <summary>One-day menu built around a set of ingredients (used by the photo scan).</summary>
    Task<SuggestedMenuDto?> SuggestDayMenuAsync(int userId, IReadOnlyCollection<int> ingredientIds, string? dishName, CancellationToken ct = default);
}

public interface IShoppingListService
{
    Task<ShoppingListDto> GenerateAsync(int userId, int planId, CancellationToken ct = default);
    Task<ShoppingListDto> GetAsync(int userId, int planId, CancellationToken ct = default);
    Task<ShoppingListItemDto> SetBoughtAsync(int userId, int planId, int itemId, bool isBought, CancellationToken ct = default);
}

public interface IIngredientScanService
{
    Task<ScanResultDto> ScanAsync(int userId, Stream image, string fileName, string contentType, CancellationToken ct = default);
    Task<ScanResultDto> ConfirmAsync(int userId, int scanId, List<int> ingredientIds, CancellationToken ct = default);
    Task<ScanResultDto> GetAsync(int userId, int scanId, CancellationToken ct = default);
    Task<PagedResult<ScanSummaryDto>> GetHistoryAsync(int userId, PageQuery page, CancellationToken ct = default);
}

public interface IChatService
{
    Task<ChatSessionDto> CreateSessionAsync(int userId, CreateChatSessionRequest req, CancellationToken ct = default);
    Task<IReadOnlyList<ChatSessionDto>> GetSessionsAsync(int userId, CancellationToken ct = default);
    Task<IReadOnlyList<ChatMessageDto>> GetMessagesAsync(int userId, int sessionId, CancellationToken ct = default);
    Task<ChatReplyDto> SendAsync(int userId, int sessionId, string content, CancellationToken ct = default);
    Task DeleteSessionAsync(int userId, int sessionId, CancellationToken ct = default);
}

public interface ITrackingService
{
    Task<MealLogDto> LogMealAsync(int userId, CreateMealLogRequest req, CancellationToken ct = default);
    Task DeleteLogAsync(int userId, int logId, CancellationToken ct = default);
    Task<DailyNutritionDto> GetDailyAsync(int userId, DateOnly date, CancellationToken ct = default);
    Task<IReadOnlyList<NutritionTrendPointDto>> GetTrendAsync(int userId, DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<ActivityDataDto> UpsertActivityAsync(int userId, ActivityDataRequest req, CancellationToken ct = default);
}

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> GetAsync(int userId, bool? unreadOnly, PageQuery page, CancellationToken ct = default);
    Task<int> CountUnreadAsync(int userId, CancellationToken ct = default);
    Task MarkReadAsync(int userId, int id, CancellationToken ct = default);
    Task MarkAllReadAsync(int userId, CancellationToken ct = default);
    Task CreateAsync(int userId, string type, string content, CancellationToken ct = default);
}

public interface IVeganShopService
{
    Task<IReadOnlyList<VeganShopDto>> SearchAsync(decimal? lat, decimal? lng, double radiusKm, string? keyword, CancellationToken ct = default);
}

public interface ICommunityService
{
    Task<PagedResult<PostSummaryDto>> GetPostsAsync(PostQuery q, int? userId, CancellationToken ct = default);
    Task<PagedResult<PostSummaryDto>> GetMyPostsAsync(int userId, PageQuery page, CancellationToken ct = default);
    Task<PostDetailDto> GetPostAsync(int id, int? userId, CancellationToken ct = default);
    Task<PostDetailDto> CreatePostAsync(int userId, CreatePostRequest req, CancellationToken ct = default);
    Task DeletePostAsync(int userId, int postId, CancellationToken ct = default);
    Task<CommentDto> AddCommentAsync(int userId, int postId, string content, CancellationToken ct = default);
    Task DeleteCommentAsync(int userId, int commentId, CancellationToken ct = default);
    Task<int> VoteAsync(int userId, int postId, short value, CancellationToken ct = default);
    Task<ReportDto> ReportAsync(int userId, CreateReportRequest req, CancellationToken ct = default);
}
