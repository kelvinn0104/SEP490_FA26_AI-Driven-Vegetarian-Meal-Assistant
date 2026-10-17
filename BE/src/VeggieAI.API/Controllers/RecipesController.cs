using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Infrastructure;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;

namespace VeggieAI.API.Controllers;

[Route("api/recipes")]
public class RecipesController : ApiControllerBase
{
    private readonly IRecipeService _svc;
    public RecipesController(IRecipeService svc) => _svc = svc;

    /// <summary>Tìm kiếm công thức đã duyệt (lọc theo từ khóa, danh mục, kcal, protein; tự loại món chứa dị ứng nếu đã đăng nhập).</summary>
    [HttpGet, AllowAnonymous]
    public async Task<ActionResult<PagedResult<RecipeSummaryDto>>> Search([FromQuery] RecipeQuery q, CancellationToken ct) =>
        Ok(await _svc.SearchAsync(q, OptionalUserId, ct));

    [HttpGet("{id:int}"), AllowAnonymous]
    public async Task<ActionResult<RecipeDetailDto>> Get(int id, CancellationToken ct) => Ok(await _svc.GetAsync(id, OptionalUserId, ct));

    /// <summary>"Nấu gì với những nguyên liệu này?" — gợi ý công thức theo mức độ khớp nguyên liệu.</summary>
    /// <param name="ingredientIds">vd: ?ingredientIds=1&amp;ingredientIds=3</param>
    [HttpGet("suggest"), AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<RecipeSuggestionDto>>> Suggest([FromQuery] List<int> ingredientIds, [FromQuery] int take = 10, CancellationToken ct = default) =>
        Ok(await _svc.SuggestByIngredientsAsync(ingredientIds, OptionalUserId, Math.Clamp(take, 1, 30), ct));

    [HttpGet("favorites"), Authorize]
    public async Task<ActionResult<PagedResult<RecipeSummaryDto>>> Favorites([FromQuery] PageQuery page, CancellationToken ct) =>
        Ok(await _svc.GetFavoritesAsync(UserId, page, ct));

    [HttpPost("{id:int}/favorite"), Authorize]
    public async Task<IActionResult> AddFavorite(int id, CancellationToken ct)
    {
        await _svc.AddFavoriteAsync(UserId, id, ct);
        return NoContent();
    }

    [HttpDelete("{id:int}/favorite"), Authorize]
    public async Task<IActionResult> RemoveFavorite(int id, CancellationToken ct)
    {
        await _svc.RemoveFavoriteAsync(UserId, id, ct);
        return NoContent();
    }
}
