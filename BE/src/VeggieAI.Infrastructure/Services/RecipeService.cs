using Microsoft.EntityFrameworkCore;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;
using VeggieAI.Domain.Constants;
using VeggieAI.Domain.Entities;
using VeggieAI.Infrastructure.Common;
using VeggieAI.Infrastructure.Persistence;

namespace VeggieAI.Infrastructure.Services;

public class RecipeService : IRecipeService
{
    private readonly VeggieAiDbContext _db;
    public RecipeService(VeggieAiDbContext db) => _db = db;

    private IQueryable<Recipe> Published => _db.Recipes.AsNoTracking().Where(r => r.Status == RecipeStatuses.Published);

    public async Task<PagedResult<RecipeSummaryDto>> SearchAsync(RecipeQuery query, int? userId, CancellationToken ct = default)
    {
        var q = Published;
        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var k = $"%{query.Keyword.Trim()}%";
            q = q.Where(r => EF.Functions.ILike(r.Title, k)
                          || r.RecipeIngredients.Any(ri => EF.Functions.ILike(ri.Ingredient.Name, k)));
        }
        if (query.CategoryId is not null) q = q.Where(r => r.CategoryId == query.CategoryId);
        if (query.MaxKcal is not null) q = q.Where(r => r.KcalPerServing <= query.MaxKcal);
        if (query.MinProtein is not null) q = q.Where(r => r.ProteinG >= query.MinProtein);
        if (userId is not null && query.ExcludeMyAllergens)
        {
            var bad = await _db.AllergenIngredientIdsAsync(userId.Value, ct);
            if (bad.Count > 0) q = q.Where(r => !r.RecipeIngredients.Any(ri => bad.Contains(ri.IngredientId)));
        }

        q = query.Sort switch
        {
            "kcal_asc" => q.OrderBy(r => r.KcalPerServing),
            "kcal_desc" => q.OrderByDescending(r => r.KcalPerServing),
            "protein_desc" => q.OrderByDescending(r => r.ProteinG),
            "popular" => q.OrderByDescending(r => r.Favorites.Count).ThenByDescending(r => r.CreatedAt),
            _ => q.OrderByDescending(r => r.CreatedAt),
        };

        var total = await q.CountAsync(ct);
        var items = await ProjectSummary(q.Skip(query.Skip).Take(query.PageSize), userId).ToListAsync(ct);
        return new PagedResult<RecipeSummaryDto> { Items = items, Page = query.Page, PageSize = query.PageSize, TotalCount = total };
    }

    public async Task<RecipeDetailDto> GetAsync(int id, int? userId, CancellationToken ct = default)
    {
        var r = await _db.Recipes.AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.VerifiedByNavigation)
            .Include(x => x.RecipeIngredients).ThenInclude(ri => ri.Ingredient).ThenInclude(i => i.Allergies)
            .FirstOrDefaultAsync(x => x.Id == id && x.Status == RecipeStatuses.Published, ct)
            ?? throw AppException.NotFound("Công thức");

        var myAllergies = new List<string>();
        var isFav = false;
        if (userId is not null)
        {
            var mine = await _db.Users.Where(u => u.Id == userId).SelectMany(u => u.Allergies).Select(a => a.Id).ToListAsync(ct);
            myAllergies = r.RecipeIngredients.SelectMany(ri => ri.Ingredient.Allergies)
                .Where(a => mine.Contains(a.Id)).Select(a => a.Name).Distinct().ToList();
            isFav = await _db.Favorites.AnyAsync(f => f.UserId == userId && f.RecipeId == id, ct);
        }

        return new RecipeDetailDto(r.Id, r.Title, r.ImageUrl, r.CategoryId, r.Category.Name, r.Instructions, r.Servings,
            r.PerServing(),
            r.RecipeIngredients.OrderByDescending(ri => ri.QuantityG)
                .Select(ri => new RecipeIngredientDto(ri.IngredientId, ri.Ingredient.Name, ri.QuantityG,
                    ri.Ingredient.Allergies.Select(a => a.Name).ToList())).ToList(),
            isFav, myAllergies.Count > 0, myAllergies, r.VerifiedByNavigation?.DisplayName, r.VerifiedAt);
    }

    /// <summary>
    /// Content-based matching: score = 0.7 * (matched / recipe ingredients) + 0.3 * (matched / available).
    /// Used by the photo scan and the "what can I cook with..." screen.
    /// </summary>
    public async Task<IReadOnlyList<RecipeSuggestionDto>> SuggestByIngredientsAsync(IReadOnlyCollection<int> ingredientIds,
        int? userId, int take = 10, CancellationToken ct = default)
    {
        if (ingredientIds.Count == 0) return Array.Empty<RecipeSuggestionDto>();
        var have = ingredientIds.ToHashSet();
        var q = Published.Where(r => r.RecipeIngredients.Any(ri => have.Contains(ri.IngredientId)));
        if (userId is not null)
        {
            var bad = await _db.AllergenIngredientIdsAsync(userId.Value, ct);
            if (bad.Count > 0) q = q.Where(r => !r.RecipeIngredients.Any(ri => bad.Contains(ri.IngredientId)));
        }

        var candidates = await q.Select(r => new
        {
            r.Id,
            Ingredients = r.RecipeIngredients.Select(ri => new { ri.IngredientId, ri.Ingredient.Name }).ToList(),
        }).Take(300).ToListAsync(ct);

        var scored = candidates.Select(c =>
        {
            var matched = c.Ingredients.Where(i => have.Contains(i.IngredientId)).ToList();
            var score = 0.7 * matched.Count / Math.Max(1, c.Ingredients.Count) + 0.3 * matched.Count / have.Count;
            return new { c.Id, Score = Math.Round(score, 3), Matched = matched.Select(m => m.Name).ToList(),
                Missing = c.Ingredients.Where(i => !have.Contains(i.IngredientId)).Select(i => i.Name).ToList(),
                Total = c.Ingredients.Count };
        }).OrderByDescending(x => x.Score).ThenBy(x => x.Missing.Count).Take(take).ToList();

        var ids = scored.Select(s => s.Id).ToList();
        var summaries = (await ProjectSummary(_db.Recipes.AsNoTracking().Where(r => ids.Contains(r.Id)), userId).ToListAsync(ct))
            .ToDictionary(s => s.Id);
        return scored.Select(s => new RecipeSuggestionDto(summaries[s.Id], s.Matched.Count, s.Total, s.Score, s.Matched, s.Missing)).ToList();
    }

    public async Task<PagedResult<RecipeSummaryDto>> GetFavoritesAsync(int userId, PageQuery page, CancellationToken ct = default)
    {
        var q = Published.Where(r => r.Favorites.Any(f => f.UserId == userId));
        var total = await q.CountAsync(ct);
        var items = await ProjectSummary(q.OrderByDescending(r => r.Favorites.Where(f => f.UserId == userId).Max(f => f.CreatedAt))
            .Skip(page.Skip).Take(page.PageSize), userId).ToListAsync(ct);
        return new PagedResult<RecipeSummaryDto> { Items = items, Page = page.Page, PageSize = page.PageSize, TotalCount = total };
    }

    public async Task AddFavoriteAsync(int userId, int recipeId, CancellationToken ct = default)
    {
        if (!await Published.AnyAsync(r => r.Id == recipeId, ct)) throw AppException.NotFound("Công thức");
        if (await _db.Favorites.AnyAsync(f => f.UserId == userId && f.RecipeId == recipeId, ct)) return;
        _db.Favorites.Add(new Favorite { UserId = userId, RecipeId = recipeId });
        await _db.SaveChangesAsync(ct);
    }

    public async Task RemoveFavoriteAsync(int userId, int recipeId, CancellationToken ct = default)
    {
        var f = await _db.Favorites.FindAsync(new object[] { userId, recipeId }, ct);
        if (f is null) return;
        _db.Favorites.Remove(f);
        await _db.SaveChangesAsync(ct);
    }

    private static IQueryable<RecipeSummaryDto> ProjectSummary(IQueryable<Recipe> q, int? userId) =>
        q.Select(r => new RecipeSummaryDto(r.Id, r.Title, r.ImageUrl, r.CategoryId, r.Category.Name, r.Servings,
            r.KcalPerServing, r.ProteinG, r.CarbG, r.FatG,
            userId != null && r.Favorites.Any(f => f.UserId == userId)));
}
