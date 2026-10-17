using VeggieAI.Application.Common;

namespace VeggieAI.Application.DTOs;

public class RecipeQuery : PageQuery
{
    public string? Keyword { get; set; }
    public int? CategoryId { get; set; }
    public decimal? MaxKcal { get; set; }
    public decimal? MinProtein { get; set; }
    /// <summary>Exclude recipes containing the current user's allergens (default true when logged in).</summary>
    public bool ExcludeMyAllergens { get; set; } = true;
    /// <summary>newest | kcal_asc | kcal_desc | protein_desc | popular</summary>
    public string? Sort { get; set; }
}

public record RecipeSummaryDto(int Id, string Title, string? ImageUrl, int CategoryId, string CategoryName,
    int Servings, decimal KcalPerServing, decimal ProteinG, decimal CarbG, decimal FatG, bool IsFavorite);

public record RecipeIngredientDto(int IngredientId, string Name, decimal QuantityG, IReadOnlyList<string> Allergens);

public record RecipeDetailDto(int Id, string Title, string? ImageUrl, int CategoryId, string CategoryName,
    string Instructions, int Servings, NutrientAmountsDto NutritionPerServing,
    IReadOnlyList<RecipeIngredientDto> Ingredients, bool IsFavorite, bool ContainsMyAllergens,
    IReadOnlyList<string> MyAllergensFound, string? VerifiedByName, DateTime? VerifiedAt);

public record RecipeSuggestionDto(RecipeSummaryDto Recipe, int MatchedCount, int TotalIngredients,
    double MatchScore, IReadOnlyList<string> MatchedIngredients, IReadOnlyList<string> MissingIngredients);
